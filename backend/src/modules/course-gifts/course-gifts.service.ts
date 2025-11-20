import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateGiftDto } from './dto/create-gift.dto';
import { QueryGiftDto } from './dto/query-gift.dto';
import { GiftStatus, CreditRecordType } from '@prisma/client';
import { randomBytes } from 'crypto';

@Injectable()
export class CourseGiftsService {
  private readonly logger = new Logger(CourseGiftsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * 生成随机礼物码（替代 nanoid）
   */
  private generateGiftCode(length: number = 8): string {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const bytes = randomBytes(length);
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars[bytes[i] % chars.length];
    }
    return result;
  }

  /**
   * 生成礼物码（用于分享）
   */
  async createGiftCode(fromUserId: string, courseId: string, message?: string) {
    // 查找课程
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('课程不存在');
    }

    // 检查赠送方学分是否足够
    const fromUserCredit = await this.prisma.credit.findUnique({
      where: { userId: fromUserId },
    });

    if (!fromUserCredit || fromUserCredit.balance < course.credit) {
      throw new BadRequestException(
        `个人学分不足，需要 ${course.credit} 学分，当前个人学分余额：${fromUserCredit?.balance || 0}。注意：企业学分不能用于赠送课程。`,
      );
    }

    // 生成唯一的礼物码（8位）
    const giftCode = this.generateGiftCode(8);

    // 开启事务处理
    return await this.prisma.$transaction(async (tx) => {
      // 1. 扣除赠送方学分（只能从个人学分中扣除）
      const newBalance = fromUserCredit.balance - course.credit;
      const newUsed = fromUserCredit.used + course.credit;
      const newPersonalBalance = fromUserCredit.personalBalance - course.credit;

      await tx.credit.update({
        where: { id: fromUserCredit.id },
        data: {
          balance: newBalance,
          used: newUsed,
          personalBalance: newPersonalBalance,
        },
      });

      // 2. 记录学分消耗（只能使用个人学分）
      await tx.creditRecord.create({
        data: {
          creditId: fromUserCredit.id,
          type: CreditRecordType.CONSUME,
          amount: -course.credit,
          balance: newBalance,
          courseId,
          courseName: course.title,
          source: 'PERSONAL',
          remark: `生成课程赠送码《${course.title}》`,
        },
      });

      // 3. 创建赠送记录（待领取状态）
      const gift = await tx.courseGift.create({
        data: {
          courseId,
          fromUserId,
          toUserId: null, // 暂时没有接收方
          message,
          creditCost: course.credit,
          status: GiftStatus.PENDING,
          giftCode, // 保存礼物码
        },
        include: {
          course: {
            select: {
              id: true,
              title: true,
              credit: true,
              coverImage: true,
              startTime: true,
            },
          },
        },
      });

      this.logger.log(
        `[生成礼物码] 赠送方: ${fromUserId}, 课程: ${course.title}, 礼物码: ${giftCode}`,
      );

      return {
        message: '礼物码生成成功',
        giftCode,
        gift,
      };
    });
  }

  /**
   * 通过礼物码领取课程
   */
  async claimByCode(userId: string, giftCode: string) {
    // 查找礼物记录
    const gift = await this.prisma.courseGift.findFirst({
      where: {
        giftCode,
        status: GiftStatus.PENDING,
      },
      include: {
        course: true,
      },
    });

    if (!gift) {
      throw new NotFoundException('礼物码不存在或已被领取');
    }

    // 不能领取自己的礼物（开发环境临时禁用）
    // if (gift.fromUserId === userId) {
    //   throw new BadRequestException('不能领取自己的礼物');
    // }
    
    // 开发环境警告
    if (gift.fromUserId === userId) {
      this.logger.warn(`[测试模式] 用户 ${userId} 正在领取自己的礼物`);
    }

    // 检查是否已报名
    const existingEnrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: gift.courseId,
        },
      },
    });

    if (existingEnrollment) {
      throw new BadRequestException('您已报名此课程');
    }

    // 开启事务处理
    return await this.prisma.$transaction(async (tx) => {
      // 1. 为接收方创建报名记录
      await tx.enrollment.create({
        data: {
          userId,
          courseId: gift.courseId,
          isGift: true,
          giftFrom: gift.fromUserId,
        },
      });

      // 2. 更新礼物状态
      await tx.courseGift.update({
        where: { id: gift.id },
        data: {
          toUserId: userId,
          status: GiftStatus.ACCEPTED,
          acceptedAt: new Date(),
        },
      });

      // 3. 发送通知给接收方
      await tx.notification.create({
        data: {
          userId: userId,
          type: 'COURSE_GIFT',
          title: '成功领取课程',
          content: `您已成功领取课程：《${gift.course.title}》`,
          data: {
            link: `/pages/course/detail?id=${gift.courseId}`,
            linkType: 'course',
            linkId: gift.courseId,
            courseId: gift.courseId,
            courseName: gift.course.title,
          },
        },
      });

      // 4. 发送通知给赠送方
      await tx.notification.create({
        data: {
          userId: gift.fromUserId,
          type: 'COURSE_GIFT',
          title: '课程礼物已被领取',
          content: `您赠送的课程《${gift.course.title}》已被领取`,
          data: {
            link: `/pages/course-gift/list`,
            linkType: 'gift',
            linkId: gift.id,
            courseId: gift.courseId,
            courseName: gift.course.title,
          },
        },
      });

      this.logger.log(
        `[领取礼物] 礼物码: ${giftCode}, 接收方: ${userId}, 课程: ${gift.course.title}`,
      );

      return {
        message: '领取成功',
        course: gift.course,
      };
    });
  }

  /**
   * 赠送课程（旧方法，保留兼容性）
   */
  async create(fromUserId: string, dto: CreateGiftDto) {
    const { courseId, toUser, message } = dto;

    // 查找课程
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('课程不存在');
    }

    // 查找接收方（支持用户ID或手机号）
    let toUserRecord = await this.prisma.user.findFirst({
      where: {
        OR: [
          { id: toUser },
          { phone: toUser },
        ],
      },
    });

    if (!toUserRecord) {
      throw new NotFoundException('接收方用户不存在');
    }

    // 不能赠送给自己
    if (toUserRecord.id === fromUserId) {
      throw new BadRequestException('不能赠送给自己');
    }

    // 检查接收方是否已报名
    const existingEnrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: toUserRecord.id,
          courseId,
        },
      },
    });

    if (existingEnrollment) {
      throw new BadRequestException('该用户已报名此课程');
    }

    // 检查赠送方学分是否足够
    const fromUserCredit = await this.prisma.credit.findUnique({
      where: { userId: fromUserId },
    });

    if (!fromUserCredit || fromUserCredit.balance < course.credit) {
      throw new BadRequestException(
        `个人学分不足，需要 ${course.credit} 学分，当前个人学分余额：${fromUserCredit?.balance || 0}。注意：企业学分不能用于赠送课程。`,
      );
    }

    // 开启事务处理
    return await this.prisma.$transaction(async (tx) => {
      // 1. 扣除赠送方学分（只能从个人学分中扣除）
      const newBalance = fromUserCredit.balance - course.credit;
      const newUsed = fromUserCredit.used + course.credit;
      const newPersonalBalance = fromUserCredit.personalBalance - course.credit;

      await tx.credit.update({
        where: { id: fromUserCredit.id },
        data: {
          balance: newBalance,
          used: newUsed,
          personalBalance: newPersonalBalance,
        },
      });

      // 2. 记录学分消耗（只能使用个人学分）
      await tx.creditRecord.create({
        data: {
          creditId: fromUserCredit.id,
          type: CreditRecordType.CONSUME,
          amount: -course.credit,
          balance: newBalance,
          courseId,
          courseName: course.title,
          source: 'PERSONAL',
          remark: `赠送课程《${course.title}》给用户`,
        },
      });

      // 3. 创建赠送记录
      const gift = await tx.courseGift.create({
        data: {
          courseId,
          fromUserId,
          toUserId: toUserRecord.id,
          message,
          creditCost: course.credit,
          status: GiftStatus.PENDING,
        },
        include: {
          course: {
            select: {
              id: true,
              title: true,
              credit: true,
              coverImage: true,
              startTime: true,
            },
          },
          toUser: {
            select: {
              id: true,
              nickname: true,
              realName: true,
              avatar: true,
            },
          },
        },
      });

      // 4. 自动为接收方创建报名记录（标记为赠送）
      await tx.enrollment.create({
        data: {
          userId: toUserRecord.id,
          courseId,
          isGift: true,
          giftFrom: fromUserId,
        },
      });

      // 5. 更新赠送状态为已接收
      await tx.courseGift.update({
        where: { id: gift.id },
        data: {
          status: GiftStatus.ACCEPTED,
          acceptedAt: new Date(),
        },
      });

      // 6. 发送通知给接收方
      await tx.notification.create({
        data: {
          userId: toUserRecord.id,
          type: 'COURSE_GIFT',
          title: '收到课程赠送',
          content: `您收到了来自好友的课程赠送：《${course.title}》`,
          data: {
            link: `/pages/course/detail?id=${courseId}`,
            linkType: 'course',
            linkId: courseId,
            courseId: courseId,
            courseName: course.title,
          },
        },
      });

      this.logger.log(
        `[课程赠送] 赠送方: ${fromUserId}, 接收方: ${toUserRecord.id}, 课程: ${course.title}, 学分: ${course.credit}`,
      );

      return {
        message: '赠送成功',
        gift: {
          ...gift,
          status: GiftStatus.ACCEPTED,
          acceptedAt: new Date(),
        },
      };
    });
  }

  /**
   * 获取赠送记录列表
   */
  async findAll(userId: string, query: QueryGiftDto) {
    const { page = 1, pageSize = 20, status, courseId, type } = query;

    const where: any = {};

    // 根据类型筛选
    if (type === 'sent') {
      where.fromUserId = userId;
    } else if (type === 'received') {
      where.toUserId = userId;
    } else {
      // 默认显示所有相关记录
      where.OR = [
        { fromUserId: userId },
        { toUserId: userId },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (courseId) {
      where.courseId = courseId;
    }

    const [list, total] = await Promise.all([
      this.prisma.courseGift.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          course: {
            select: {
              id: true,
              title: true,
              credit: true,
              coverImage: true,
              startTime: true,
            },
          },
          fromUser: {
            select: {
              id: true,
              nickname: true,
              realName: true,
              avatar: true,
            },
          },
          toUser: {
            select: {
              id: true,
              nickname: true,
              realName: true,
              avatar: true,
            },
          },
        },
      }),
      this.prisma.courseGift.count({ where }),
    ]);

    return {
      list,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * 获取赠送统计
   */
  async getStatistics(userId: string) {
    const [sentCount, receivedCount, totalCreditSpent] = await Promise.all([
      this.prisma.courseGift.count({
        where: { fromUserId: userId, status: GiftStatus.ACCEPTED },
      }),
      this.prisma.courseGift.count({
        where: { toUserId: userId, status: GiftStatus.ACCEPTED },
      }),
      this.prisma.courseGift.aggregate({
        where: { fromUserId: userId, status: GiftStatus.ACCEPTED },
        _sum: { creditCost: true },
      }),
    ]);

    return {
      sentCount,
      receivedCount,
      totalCreditSpent: totalCreditSpent._sum.creditCost || 0,
    };
  }

  /**
   * 获取所有赠送记录（管理员）
   */
  async findAllForAdmin(query: QueryGiftDto) {
    const { page = 1, pageSize = 20, status, courseId } = query;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (courseId) {
      where.courseId = courseId;
    }

    const [list, total] = await Promise.all([
      this.prisma.courseGift.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          course: {
            select: {
              id: true,
              title: true,
              credit: true,
              coverImage: true,
            },
          },
          fromUser: {
            select: {
              id: true,
              nickname: true,
              realName: true,
              phone: true,
            },
          },
          toUser: {
            select: {
              id: true,
              nickname: true,
              realName: true,
              phone: true,
            },
          },
        },
      }),
      this.prisma.courseGift.count({ where }),
    ]);

    return {
      list,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }
}

