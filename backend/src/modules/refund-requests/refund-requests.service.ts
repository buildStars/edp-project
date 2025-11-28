import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateRefundRequestDto } from './dto/create-refund-request.dto';
import { ReviewRefundRequestDto } from './dto/review-refund-request.dto';
import { QueryRefundRequestDto } from './dto/query-refund-request.dto';
import { RefundRequestStatus, CreditRecordType, EnrollmentStatus } from '@prisma/client';
import * as dayjs from 'dayjs';

@Injectable()
export class RefundRequestsService {
  private readonly logger = new Logger(RefundRequestsService.name);

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  /**
   * 创建退课申请（开课前48小时以上自动退款，48小时内需审批）
   */
  async create(userId: string, dto: CreateRefundRequestDto) {
    const { enrollmentId, reason, refundFeePercent = 5 } = dto;

    // 查找报名记录
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        course: true,
      },
    });

    if (!enrollment) {
      throw new NotFoundException('报名记录不存在');
    }

    if (enrollment.userId !== userId) {
      throw new BadRequestException('无权操作此报名记录');
    }

    if (enrollment.status === EnrollmentStatus.CANCELLED) {
      throw new BadRequestException('该课程已取消报名');
    }

    // 检查是否为赠送课程
    if (enrollment.isGift) {
      throw new BadRequestException('赠送课程不支持退课');
    }

    // 检查开课时间
    const now = dayjs();
    const courseStartTime = dayjs(enrollment.course.startTime);
    const hoursDiff = courseStartTime.diff(now, 'hour');

    // 课前48小时内需要审核，48小时外直接通过
    let requestStatus: RefundRequestStatus = RefundRequestStatus.PENDING;
    let autoApproved = false;
    
    if (hoursDiff > 48) {
      // 48小时外，直接通过
      requestStatus = RefundRequestStatus.APPROVED as RefundRequestStatus;
      autoApproved = true;
    } else if (hoursDiff < 0) {
      // 已开课，不能退课
      throw new BadRequestException('课程已开始，无法取消报名');
    }
    // 48小时内，需要审核 (requestStatus保持PENDING)

    // 检查是否已有待处理的退课申请
    const existingRequest = await this.prisma.refundRequest.findFirst({
      where: {
        enrollmentId,
        status: RefundRequestStatus.PENDING,
      },
    });

    if (existingRequest) {
      throw new BadRequestException('已有待处理的取消申请');
    }

    // 创建退课申请
    const request = await this.prisma.refundRequest.create({
      data: {
        enrollmentId,
        userId,
        courseId: enrollment.courseId,
        reason,
        creditAmount: enrollment.course.credit,
        status: requestStatus,
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

    // 如果自动通过，执行退款操作
    if (autoApproved) {
      // 计算实际退回学分（扣除手续费）
      const actualRefundAmount = Math.floor(enrollment.course.credit * (1 - refundFeePercent / 100));
      const feeAmount = enrollment.course.credit - actualRefundAmount;
      
      await this.prisma.$transaction(async (tx) => {
        await this.processRefundInTransaction(
          tx,
          request.id,
          enrollment,
          userId,
          enrollment.course.title,
          actualRefundAmount,
          feeAmount
        );
      });
      
      this.logger.log(
        `[自动取消报名] 用户: ${userId}, 课程: ${enrollment.course.title}, 原学分: ${enrollment.course.credit}, 手续费: ${feeAmount}, 退回学分: ${actualRefundAmount}`,
      );

      return {
        message: `取消报名成功，已扣除${refundFeePercent}%手续费，退回${actualRefundAmount}学分`,
        request,
        refundAmount: actualRefundAmount,
        feeAmount,
      };
    }

    this.logger.log(
      `[退课申请] 用户: ${userId}, 课程: ${enrollment.course.title}, 退回学分: ${enrollment.course.credit}, 需审核`,
    );

    return {
      message: '课前48小时内取消报名需审核，请等待教务处理',
      request,
    };
  }

  /**
   * 处理退款逻辑（退回学分并取消报名）
   * @private
   */
  private async processRefundInTransaction(tx: any, requestId: string, enrollment: any, userId: string, courseTitle: string, refundAmount: number, feeAmount: number = 0) {
    // 1. 获取学分账户
    const credit = await tx.credit.findUnique({
      where: { userId },
    });

    if (!credit) {
      throw new BadRequestException('学分账户不存在');
    }

    // 2. 退回学分（退课时统一退回到个人学分，更灵活）
    const newBalance = credit.balance + refundAmount;
    const newUsed = credit.used - refundAmount;
    const newPersonalBalance = credit.personalBalance + refundAmount;

    await tx.credit.update({
      where: { id: credit.id },
      data: {
        balance: newBalance,
        used: Math.max(0, newUsed),
        personalBalance: newPersonalBalance,
      },
    });

    // 3. 记录学分变动
    const remarkText = feeAmount > 0 
      ? `取消报名《${courseTitle}》，退回学分（已扣除${feeAmount}学分手续费）`
      : `取消报名《${courseTitle}》，退回学分`;
    
    await tx.creditRecord.create({
      data: {
        creditId: credit.id,
        type: CreditRecordType.REFUND,
        amount: refundAmount,
        balance: newBalance,
        courseId: enrollment.courseId,
        courseName: courseTitle,
        remark: remarkText,
      },
    });

    // 4. 更新报名状态为已取消
    await tx.enrollment.update({
      where: { id: enrollment.id },
      data: {
        status: EnrollmentStatus.CANCELLED,
      },
    });

    // 5. 发送通知
    try {
      await this.notificationsService.create({
        userId,
        type: 'REFUND_REQUEST',
        title: '取消报名成功',
        content: `您已成功取消报名课程《${courseTitle}》，${refundAmount}学分已退回您的账户`,
        data: {
          courseId: enrollment.courseId,
          refundRequestId: requestId,
          creditAmount: refundAmount,
          url: `/pages/mine/my-courses`,
        },
      });
    } catch (error) {
      this.logger.error(`发送退课通知失败: ${error.message}`);
    }
  }

  /**
   * 获取退课申请列表（管理员/教师）
   */
  async findAll(query: QueryRefundRequestDto, currentUser?: any) {
    const { page = 1, pageSize = 20, status, courseId, userId } = query;

    const where: any = {};

    // 如果是教师，只能看到自己课程的退课申请
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

    const [list, total] = await Promise.all([
      this.prisma.refundRequest.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              nickname: true,
              realName: true,
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
          enrollment: {
            select: {
              id: true,
              createdAt: true,
            },
          },
        },
      }),
      this.prisma.refundRequest.count({ where }),
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
   * 获取我的退课申请列表
   */
  async findMyRequests(userId: string, query: QueryRefundRequestDto) {
    const { page = 1, pageSize = 20, status } = query;

    const where: any = { userId };

    if (status) {
      where.status = status;
    }

    const [list, total] = await Promise.all([
      this.prisma.refundRequest.findMany({
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
      this.prisma.refundRequest.count({ where }),
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
   * 审批退课申请（管理员）
   */
  async review(requestId: string, adminUserId: string, dto: ReviewRefundRequestDto, currentUser?: any) {
    const { status, reviewNote } = dto;

    // 查找申请
    const request = await this.prisma.refundRequest.findUnique({
      where: { id: requestId },
      include: {
        user: true,
        course: true,
        enrollment: true,
      },
    });

    if (!request) {
      throw new NotFoundException('退课申请不存在');
    }

    if (request.status !== RefundRequestStatus.PENDING) {
      throw new BadRequestException('该申请已处理');
    }

    // 如果是教师，只能审批自己课程的退课申请
    if (currentUser?.role === 'TEACHER') {
      if (request.course.teacherId !== currentUser.id) {
        throw new BadRequestException('您无权审批此退课申请');
      }
    }

    // 开启事务处理
    return await this.prisma.$transaction(async (tx) => {
      // 更新申请状态
      const updatedRequest = await tx.refundRequest.update({
        where: { id: requestId },
        data: {
          status: status as RefundRequestStatus,
          reviewedBy: adminUserId,
          reviewedAt: new Date(),
          reviewNote,
        },
      });

      if (status === 'APPROVED') {
        // 通过：调用退款处理逻辑
        await this.processRefundInTransaction(
          tx,
          requestId,
          request.enrollment,
          request.userId,
          request.course.title,
          request.creditAmount
        );
        
        this.logger.log(
          `[取消报名申请通过] 用户: ${request.user.nickname}, 课程: ${request.course.title}, 退回学分: ${request.creditAmount}`,
        )

        return {
          ...updatedRequest,
          message: '退课申请已通过，学分已退回',
        };
      } else {
        // 拒绝
        this.logger.log(
          `[退课申请拒绝] 用户: ${request.user.nickname}, 课程: ${request.course.title}, 原因: ${reviewNote || '未说明'}`,
        );

        // 发送退课拒绝通知
        try {
          await this.notificationsService.create({
            userId: request.userId,
            type: 'REFUND_REQUEST',
            title: '退课申请已拒绝',
            content: `您的退课申请已被拒绝，课程《${request.course.title}》。${reviewNote ? `原因：${reviewNote}` : ''}`,
            data: {
              courseId: request.courseId,
              refundRequestId: requestId,
              reviewNote,
              url: `/pages/course/detail?id=${request.courseId}`,
            },
          });
          this.logger.log(`[退课拒绝通知] 已发送给用户: ${request.userId}, 课程: ${request.course.title}`);
        } catch (error) {
          this.logger.error(`[退课拒绝通知] 发送失败: ${error.message}`);
        }

        return {
          ...updatedRequest,
          message: '退课申请已拒绝',
        };
      }
    });
  }

  /**
   * 取消退课申请
   */
  async cancel(requestId: string, userId: string) {
    const request = await this.prisma.refundRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException('退课申请不存在');
    }

    if (request.userId !== userId) {
      throw new BadRequestException('无权取消此申请');
    }

    if (request.status !== RefundRequestStatus.PENDING) {
      throw new BadRequestException('只能取消待处理的申请');
    }

    await this.prisma.refundRequest.delete({
      where: { id: requestId },
    });

    return { message: '退课申请已取消' };
  }
}



