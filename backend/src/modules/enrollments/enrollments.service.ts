import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreditsService } from '../credits/credits.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class EnrollmentsService {
  private readonly logger = new Logger(EnrollmentsService.name);

  constructor(
    private prisma: PrismaService,
    private creditsService: CreditsService,
    private notificationsService: NotificationsService,
  ) {}

  async enroll(userId: string, courseId: string) {
    // 检查是否已有报名记录（包括已取消的）
    const existing = await this.prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });

    // 如果存在有效的报名记录，直接返回
    if (existing && existing.status !== 'CANCELLED') {
      return { success: true, enrollment: existing, message: '已报名' };
    }

    // 获取课程信息
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new Error('课程不存在');
    }

    // 检查报名状态
    if (course.enrollStatus === 'CLOSED') {
      throw new Error('该课程报名已截止');
    }

    // 根据课程类型确定所需学分
    const requiredCredit = course.creditType === 'MASTER' 
      ? (course.masterCredit || course.credit) 
      : (course.normalCredit || course.credit);

    // 检查学分是否足够
    const userCredit = await this.prisma.credit.findUnique({
      where: { userId },
    });
    
    if (!userCredit || userCredit.balance < requiredCredit) {
      // 学分不足，返回提示信息
      const courseTypeText = course.creditType === 'MASTER' ? '大师课' : '平时课';
      return {
        success: false,
        needCredit: true,
        currentCredit: userCredit?.balance || 0,
        lockedCredit: userCredit?.lockedBalance || 0,
        personalCredit: userCredit?.personalBalance || 0,
        requiredCredit: requiredCredit,
        courseType: course.creditType,
        message: `学分不足，当前总学分${userCredit?.balance || 0}（锁定${userCredit?.lockedBalance || 0}+个人${userCredit?.personalBalance || 0}），${courseTypeText}需要${requiredCredit}学分`,
      };
    }

    // 扣除学分
    await this.creditsService.consumeCredit(
      userId,
      courseId,
      course.title,
      requiredCredit,
    );

    // 如果存在已取消的报名记录，更新状态；否则创建新记录
    let enrollment;
    if (existing && existing.status === 'CANCELLED') {
      enrollment = await this.prisma.enrollment.update({
        where: { userId_courseId: { userId, courseId } },
        data: {
          status: 'ENROLLED',
          updatedAt: new Date(),
        },
      });
    } else {
      enrollment = await this.prisma.enrollment.create({
        data: {
          userId,
          courseId,
          status: 'ENROLLED',
        },
      });
    }

    // 发送报名成功通知
    try {
      await this.notificationsService.create({
        userId,
        type: 'ENROLLMENT_AUDIT',
        title: '课程报名成功',
        content: `您已成功报名课程《${course.title}》，请按时上课并签到`,
        data: {
          courseId: course.id,
          enrollmentId: enrollment.id,
          url: `/pages/course/detail?id=${courseId}`,
        },
      });
      this.logger.log(`[报名通知] 已发送给用户: ${userId}, 课程: ${course.title}`);
    } catch (error) {
      this.logger.error(`[报名通知] 发送失败: ${error.message}`);
    }

    return { success: true, enrollment, message: '报名成功' };
  }

  async applyTrial(userId: string, courseId: string, trialData: any) {
    return this.prisma.enrollment.create({
      data: {
        userId,
        courseId,
        isTrial: true,
        trialName: trialData.name,
        trialPhone: trialData.phone,
        trialCompany: trialData.company,
        trialPosition: trialData.position,
        trialStatus: 'PENDING',
      },
    });
  }

  async checkIn(userId: string, courseId: string) {
    const enrollment = await this.prisma.enrollment.update({
      where: { userId_courseId: { userId, courseId } },
      data: {
        checkedIn: true,
        checkInTime: new Date(),
      },
      include: {
        course: true,
      },
    });

    // 发送签到成功通知
    try {
      await this.notificationsService.create({
        userId,
        type: 'COURSE_CHECKIN',
        title: '签到成功',
        content: `您已成功签到课程《${enrollment.course.title}》`,
        data: {
          courseId: enrollment.course.id,
          enrollmentId: enrollment.id,
          url: `/pages/course/detail?id=${courseId}`,
        },
      });
      this.logger.log(`[签到通知] 已发送给用户: ${userId}, 课程: ${enrollment.course.title}`);
    } catch (error) {
      this.logger.error(`[签到通知] 发送失败: ${error.message}`);
    }

    return enrollment;
  }

  async evaluate(userId: string, courseId: string, rating: number) {
    const enrollment = await this.prisma.enrollment.update({
      where: { userId_courseId: { userId, courseId } },
      data: {
        rated: true,
        rating,
        ratingTime: new Date(),
      },
      include: {
        course: true,
      },
    });

    // 发送评价成功通知
    try {
      await this.notificationsService.create({
        userId,
        type: 'COURSE_EVALUATE',
        title: '评价成功',
        content: `感谢您对课程《${enrollment.course.title}》的评价`,
        data: {
          courseId: enrollment.course.id,
          enrollmentId: enrollment.id,
          url: `/pages/mine/my-courses`,
        },
      });
      this.logger.log(`[评价通知] 已发送给用户: ${userId}, 课程: ${enrollment.course.title}`);
    } catch (error) {
      this.logger.error(`[评价通知] 发送失败: ${error.message}`);
    }

    return enrollment;
  }

  async getMyCourses(userId: string, status: string) {
    const where: any = { userId };
    
    // 根据请求的状态筛选
    if (status === 'enrolled') {
      where.status = 'ENROLLED';
    } else if (status === 'completed') {
      where.status = 'COMPLETED';
    }

    const enrollments = await this.prisma.enrollment.findMany({
      where,
      include: {
        course: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // 批量查询退课申请状态
    const enrollmentIds = enrollments.map(e => e.id);
    const refundRequests = await this.prisma.refundRequest.findMany({
      where: {
        enrollmentId: { in: enrollmentIds },
        status: 'PENDING', // 只查询待处理的退课申请
      },
      select: {
        enrollmentId: true,
        status: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // 创建退课状态映射
    const refundStatusMap = new Map(
      refundRequests.map(r => [r.enrollmentId, r.status])
    );

    // 为每个课程添加 isEnrolled、refundStatus 和 enrollmentStatus 字段
    return enrollments.map(enrollment => ({
      ...enrollment,
      course: enrollment.course ? {
        ...enrollment.course,
        isEnrolled: true,
        enrollmentStatus: enrollment.status, // 添加报名状态（ENROLLED/COMPLETED）
        refundStatus: refundStatusMap.get(enrollment.id) || null,
      } : null,
    }));
  }

  // ========== 管理端方法 ==========

  async findAll(query: any) {
    const {
      page = 1,
      pageSize = 20,
      courseId,
      status,
      keyword,
    } = query;

    const where: any = {};

    if (courseId) {
      where.courseId = courseId;
    }

    if (status) {
      where.status = status;
    }

    // 关键词搜索（用户姓名/手机号）
    if (keyword) {
      where.user = {
        OR: [
          { realName: { contains: keyword } },
          { phone: { contains: keyword } },
        ],
      };
    }

    const [items, total] = await Promise.all([
      this.prisma.enrollment.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: Number(pageSize),
        include: {
          user: {
            select: {
              id: true,
              realName: true,
              phone: true,
              avatar: true,
            },
          },
          course: {
            select: {
              id: true,
              title: true,
              coverImage: true,
              credit: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.enrollment.count({ where }),
    ]);

    return {
      items,
      total,
      page: Number(page),
      pageSize: Number(pageSize),
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * 获取教师的报名记录列表（只返回自己课程的报名）
   */
  async findTeacherEnrollments(teacherId: string, query: any) {
    const {
      page = 1,
      pageSize = 20,
      courseId,
      status,
      keyword,
    } = query;

    const where: any = {
      course: {
        teacherId,
      },
    };

    if (courseId) {
      where.courseId = courseId;
    }

    if (status) {
      where.status = status;
    }

    // 关键词搜索（用户姓名/手机号）
    if (keyword) {
      where.user = {
        OR: [
          { realName: { contains: keyword } },
          { phone: { contains: keyword } },
        ],
      };
    }

    const [items, total] = await Promise.all([
      this.prisma.enrollment.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: Number(pageSize),
        include: {
          user: {
            select: {
              id: true,
              realName: true,
              phone: true,
              avatar: true,
            },
          },
          course: {
            select: {
              id: true,
              title: true,
              coverImage: true,
              credit: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.enrollment.count({ where }),
    ]);

    return {
      items,
      total,
      page: Number(page),
      pageSize: Number(pageSize),
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async getTrials(query: any, currentUser?: any) {
    const {
      page = 1,
      pageSize = 20,
      status,
    } = query;

    const where: any = { isTrial: true };

    // 如果是教师，只能看到自己课程的试听申请
    if (currentUser?.role === 'TEACHER') {
      where.course = {
        teacherId: currentUser.id,
      };
    }

    if (status) {
      where.trialStatus = status;
    }

    const [items, total] = await Promise.all([
      this.prisma.enrollment.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: Number(pageSize),
        include: {
          course: {
            select: {
              id: true,
              title: true,
              coverImage: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.enrollment.count({ where }),
    ]);

    return {
      items,
      total,
      page: Number(page),
      pageSize: Number(pageSize),
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async updateTrialStatus(id: string, status: string, rejectReason?: string, currentUser?: any) {
    // 如果是教师，需要验证是否为自己的课程
    if (currentUser?.role === 'TEACHER') {
      const enrollment = await this.prisma.enrollment.findUnique({
        where: { id },
        include: { course: true },
      });

      if (!enrollment) {
        throw new Error('试听申请不存在');
      }

      if (enrollment.course.teacherId !== currentUser.id) {
        throw new Error('您无权审核此试听申请');
      }
    }

    // 注意：rejectReason 参数保留用于将来扩展，但当前 Schema 中没有对应字段
    return this.prisma.enrollment.update({
      where: { id },
      data: {
        trialStatus: status as any,
      },
    });
  }

  async getCheckIns(query: any) {
    const {
      page = 1,
      pageSize = 20,
      courseId,
    } = query;

    const where: any = { checkedIn: true };

    if (courseId) {
      where.courseId = courseId;
    }

    const [items, total] = await Promise.all([
      this.prisma.enrollment.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: Number(pageSize),
        include: {
          user: {
            select: {
              id: true,
              realName: true,
              phone: true,
              avatar: true,
            },
          },
          course: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: { checkInTime: 'desc' },
      }),
      this.prisma.enrollment.count({ where }),
    ]);

    return {
      items,
      total,
      page: Number(page),
      pageSize: Number(pageSize),
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async getEvaluations(query: any) {
    const {
      page = 1,
      pageSize = 20,
      courseId,
    } = query;

    const where: any = { rated: true };

    if (courseId) {
      where.courseId = courseId;
    }

    const [items, total] = await Promise.all([
      this.prisma.enrollment.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: Number(pageSize),
        include: {
          user: {
            select: {
              id: true,
              realName: true,
              avatar: true,
            },
          },
          course: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: { ratingTime: 'desc' },
      }),
      this.prisma.enrollment.count({ where }),
    ]);

    return {
      items,
      total,
      page: Number(page),
      pageSize: Number(pageSize),
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * 获取结课海报信息
   */
  async getCompletionPoster(userId: string, courseId: string) {
    this.logger.log(`获取结课海报 - userId: ${userId}, courseId: ${courseId}`);

    const enrollment = await this.prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            coverImage: true,
            teacherName: true,
            credit: true,
          },
        },
        user: {
          select: {
            id: true,
            realName: true,
            nickname: true,
          },
        },
      },
    });

    if (!enrollment) {
      throw new Error('报名记录不存在');
    }

    if (enrollment.status !== 'COMPLETED') {
      throw new Error('课程尚未结课');
    }

    // 获取学习成果
    const achievement = await this.prisma.learningAchievement.findUnique({
      where: {
        userId_courseId: { userId, courseId },
      },
    });

    // 生成海报数据
    const posterData = {
      userName: enrollment.user.realName || enrollment.user.nickname || '学员',
      courseName: enrollment.course.title,
      teacherName: enrollment.course.teacherName,
      completionDate: enrollment.updatedAt, // 使用更新时间作为完成时间
      courseCredit: enrollment.course.credit,
      achievementCredit: achievement?.credit || 0,
      checkinCount: achievement?.checkinCount || 0,
      coverImage: enrollment.course.coverImage,
      isFirstTime: !enrollment.completionPosterShown,
    };

    // 如果是第一次获取，标记已显示
    if (!enrollment.completionPosterShown) {
      await this.prisma.enrollment.update({
        where: { id: enrollment.id },
        data: { completionPosterShown: true },
      });
    }

    return posterData;
  }

  /**
   * 批量检查用户是否有新的结课海报
   */
  async checkNewCompletionPosters(userId: string) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        userId,
        status: 'COMPLETED',
        completionPosterShown: false,
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return enrollments.map(e => ({
      courseId: e.courseId,
      courseName: e.course.title,
      hasNewPoster: true,
    }));
  }
}

