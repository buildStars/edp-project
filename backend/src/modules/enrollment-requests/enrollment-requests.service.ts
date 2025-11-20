import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateEnrollmentRequestDto } from './dto/create-enrollment-request.dto';
import { ReviewEnrollmentRequestDto } from './dto/review-enrollment-request.dto';
import { QueryEnrollmentRequestDto } from './dto/query-enrollment-request.dto';
import { EnrollmentRequestStatus, CreditRecordType } from '@prisma/client';

@Injectable()
export class EnrollmentRequestsService {
  private readonly logger = new Logger(EnrollmentRequestsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * 创建报名申请（学分不足时）
   */
  async create(userId: string, dto: CreateEnrollmentRequestDto) {
    const { courseId, realName, phone, company, position, remark } = dto;

    // 检查课程是否存在
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('课程不存在');
    }

    // 检查是否已报名
    const existingEnrollment = await this.prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });

    if (existingEnrollment) {
      throw new BadRequestException('您已报名该课程');
    }

    // 检查是否已有待处理的申请
    const existingRequest = await this.prisma.enrollmentRequest.findFirst({
      where: {
        userId,
        courseId,
        status: EnrollmentRequestStatus.PENDING,
      },
    });

    if (existingRequest) {
      throw new BadRequestException('您已提交过报名申请，请等待审批');
    }

    // 创建报名申请
    const request = await this.prisma.enrollmentRequest.create({
      data: {
        userId,
        courseId,
        realName,
        phone,
        company,
        position,
        remark,
        status: EnrollmentRequestStatus.PENDING,
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            credit: true,
            coverImage: true,
          },
        },
      },
    });

    this.logger.log(
      `[报名申请] 用户: ${userId}, 课程: ${course.title}, 姓名: ${realName}, 手机: ${phone}`,
    );

    return {
      message: '报名申请已提交，老师将尽快与您联系',
      request,
    };
  }

  /**
   * 获取报名申请列表（管理员/教师）
   */
  async findAll(query: QueryEnrollmentRequestDto, currentUser?: any) {
    const { page = 1, pageSize = 20, status, courseId, userId, keyword } = query;

    const where: any = {};

    // 如果是教师，只能看到自己课程的报名申请
    if (currentUser?.role === 'TEACHER') {
      where.course = {
        teacherId: currentUser.id,
      };
    }

    if (status) {
      where.status = status;
    }

    if (courseId) {
      where.courseId = courseId;
    }

    if (userId) {
      where.userId = userId;
    }

    if (keyword) {
      where.OR = [
        { realName: { contains: keyword } },
        { phone: { contains: keyword } },
      ];
    }

    const [list, total] = await Promise.all([
      this.prisma.enrollmentRequest.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              nickname: true,
              avatar: true,
              phone: true,
            },
          },
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
      }),
      this.prisma.enrollmentRequest.count({ where }),
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
   * 获取我的报名申请列表
   */
  async findMyRequests(userId: string, query: QueryEnrollmentRequestDto) {
    const { page = 1, pageSize = 20, status } = query;

    const where: any = { userId };

    if (status) {
      where.status = status;
    }

    const [list, total] = await Promise.all([
      this.prisma.enrollmentRequest.findMany({
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
        },
      }),
      this.prisma.enrollmentRequest.count({ where }),
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
   * 审批报名申请（管理员）
   */
  async review(requestId: string, adminUserId: string, dto: ReviewEnrollmentRequestDto) {
    const { status, reviewNote, creditAmount } = dto;

    // 查找申请
    const request = await this.prisma.enrollmentRequest.findUnique({
      where: { id: requestId },
      include: {
        user: true,
        course: true,
      },
    });

    if (!request) {
      throw new NotFoundException('报名申请不存在');
    }

    if (request.status !== EnrollmentRequestStatus.PENDING) {
      throw new BadRequestException('该申请已处理');
    }

    // 开启事务处理
    return await this.prisma.$transaction(async (tx) => {
      // 更新申请状态
      const updatedRequest = await tx.enrollmentRequest.update({
        where: { id: requestId },
        data: {
          status: status as EnrollmentRequestStatus,
          reviewedBy: adminUserId,
          reviewedAt: new Date(),
          reviewNote,
        },
      });

      if (status === 'APPROVED') {
        // 通过：充值学分并自动报名
        const amount = creditAmount || request.course.credit;

        // 1. 获取或创建学分账户
        let credit = await tx.credit.findUnique({
          where: { userId: request.userId },
        });

        if (!credit) {
          credit = await tx.credit.create({
            data: {
              userId: request.userId,
              balance: 0,
              total: 0,
              used: 0,
            },
          });
        }

        // 2. 充值学分（报名申请通过充值的学分属于个人学分）
        const newBalance = credit.balance + amount;
        const newTotal = credit.total + amount;
        const newPersonalBalance = credit.personalBalance + amount;

        await tx.credit.update({
          where: { id: credit.id },
          data: {
            balance: newBalance,
            total: newTotal,
            personalBalance: newPersonalBalance,
          },
        });

        // 3. 记录学分变动
        await tx.creditRecord.create({
          data: {
            creditId: credit.id,
            type: CreditRecordType.ADMIN_ADD,
            amount,
            balance: newBalance,
            courseId: request.courseId,
            courseName: request.course.title,
            remark: `报名申请通过，管理员充值学分`,
          },
        });

        // 4. 检查学分是否足够
        if (newBalance >= request.course.credit) {
          // 学分足够，自动报名
          const enrollment = await tx.enrollment.create({
            data: {
              userId: request.userId,
              courseId: request.courseId,
            },
          });

          // 5. 扣除学分（从刚充值的个人学分中扣除）
          await tx.credit.update({
            where: { id: credit.id },
            data: {
              balance: newBalance - request.course.credit,
              used: credit.used + request.course.credit,
              personalBalance: newPersonalBalance - request.course.credit,
            },
          });

          // 6. 记录学分消耗
          await tx.creditRecord.create({
            data: {
              creditId: credit.id,
              type: CreditRecordType.CONSUME,
              amount: -request.course.credit,
              balance: newBalance - request.course.credit,
              courseId: request.courseId,
              courseName: request.course.title,
              remark: `报名课程《${request.course.title}》`,
            },
          });

          this.logger.log(
            `[报名申请通过] 用户: ${request.user.nickname}, 课程: ${request.course.title}, 充值: ${amount}, 自动报名成功`,
          );

          return {
            ...updatedRequest,
            enrolled: true,
            message: '报名申请已通过，学分已充值，报名成功',
          };
        } else {
          this.logger.log(
            `[报名申请通过] 用户: ${request.user.nickname}, 课程: ${request.course.title}, 充值: ${amount}, 学分仍不足，需继续充值`,
          );

          return {
            ...updatedRequest,
            enrolled: false,
            message: `报名申请已通过，已充值 ${amount} 学分，但学分仍不足，需要 ${request.course.credit} 学分`,
          };
        }
      } else {
        // 拒绝
        this.logger.log(
          `[报名申请拒绝] 用户: ${request.user.nickname}, 课程: ${request.course.title}, 原因: ${reviewNote || '未说明'}`,
        );

        return {
          ...updatedRequest,
          message: '报名申请已拒绝',
        };
      }
    });
  }

  /**
   * 取消报名申请
   */
  async cancel(requestId: string, userId: string) {
    const request = await this.prisma.enrollmentRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException('报名申请不存在');
    }

    if (request.userId !== userId) {
      throw new BadRequestException('无权取消此申请');
    }

    if (request.status !== EnrollmentRequestStatus.PENDING) {
      throw new BadRequestException('只能取消待处理的申请');
    }

    await this.prisma.enrollmentRequest.delete({
      where: { id: requestId },
    });

    return { message: '报名申请已取消' };
  }
}




