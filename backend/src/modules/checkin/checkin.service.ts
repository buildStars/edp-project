import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { StartCheckinDto } from './dto/start-checkin.dto';
import { CheckinByCodeDto, CheckinByQRCodeDto } from './dto/checkin-by-code.dto';
import { CheckinMethod } from '@prisma/client';

@Injectable()
export class CheckinService {
  private readonly logger = new Logger(CheckinService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * 定时任务：每分钟检查并关闭过期的签到会话
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async closeExpiredSessions() {
    try {
      const now = new Date();
      const expiredSessions = await this.prisma.checkinSession.updateMany({
        where: {
          isActive: true,
          endTime: { lte: now },
        },
        data: {
          isActive: false,
        },
      });

      if (expiredSessions.count > 0) {
        this.logger.log(`[定时任务] 已自动关闭 ${expiredSessions.count} 个过期的签到会话`);
      }
    } catch (error) {
      this.logger.error(`[定时任务] 关闭过期签到会话失败: ${error.message}`);
    }
  }

  /**
   * 生成6位随机签到码
   */
  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * 开启签到（教师/管理员）
   */
  async startCheckin(courseId: string, dto: StartCheckinDto) {
    // 检查课程是否存在
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, title: true },
    });

    if (!course) {
      throw new NotFoundException('课程不存在');
    }

    // 如果指定了章节ID，验证章节是否存在
    if (dto.chapterId) {
      const chapter = await this.prisma.courseChapter.findUnique({
        where: { id: dto.chapterId },
        select: { id: true, title: true, courseId: true },
      });

      if (!chapter) {
        throw new NotFoundException('章节不存在');
      }

      if (chapter.courseId !== courseId) {
        throw new BadRequestException('章节不属于该课程');
      }
    }

    // 检查是否已有活跃的签到会话（同一课程或同一章节）
    const whereCondition: any = {
      courseId,
      isActive: true,
    };

    // 如果指定了章节，只检查该章节的签到
    if (dto.chapterId) {
      whereCondition.chapterId = dto.chapterId;
    }

    const existingSession = await this.prisma.checkinSession.findFirst({
      where: whereCondition,
    });

    if (existingSession) {
      // 如果存在活跃会话但已过期，自动关闭
      if (new Date() > existingSession.endTime) {
        await this.prisma.checkinSession.update({
          where: { id: existingSession.id },
          data: { isActive: false },
        });
        this.logger.log(`[自动关闭过期签到] sessionId: ${existingSession.id}`);
      } else {
        const target = dto.chapterId ? '章节' : '课程';
        throw new BadRequestException(
          `当前${target}已有进行中的签到（签到码：${existingSession.code}），请先结束当前签到或等待其自动结束`
        );
      }
    }

    // 生成唯一签到码
    let code = this.generateCode();
    let codeExists = await this.prisma.checkinSession.findUnique({
      where: { code },
    });

    // 如果签到码已存在，重新生成
    while (codeExists) {
      code = this.generateCode();
      codeExists = await this.prisma.checkinSession.findUnique({
        where: { code },
      });
    }

    // 计算结束时间
    const endTime = new Date();
    endTime.setMinutes(endTime.getMinutes() + dto.duration);

    // 创建签到会话
    const session = await this.prisma.checkinSession.create({
      data: {
        courseId,
        chapterId: dto.chapterId,
        code,
        endTime,
        isActive: true,
      },
      include: {
        course: {
          select: { id: true, title: true },
        },
        chapter: dto.chapterId ? {
          select: { id: true, title: true },
        } : undefined,
      },
    });

    // 获取该课程的所有已报名学生
    const enrollments = await this.prisma.enrollment.findMany({
      where: { courseId },
      select: { userId: true },
    });

    // 批量创建通知
    if (enrollments.length > 0) {
      const notifications = enrollments.map(enrollment => ({
        userId: enrollment.userId,
        type: 'COURSE_CHECKIN' as const,
        title: '签到通知',
        content: `《${course.title}》课程已开启签到，请及时完成签到`,
        data: {
          link: `/pages/course/detail?id=${courseId}&action=checkin`,
          linkType: 'checkin',
          linkId: session.id,
          courseId: courseId,
          courseName: course.title,
          sessionId: session.id,
          code: code,
        },
      }));

      await this.prisma.notification.createMany({
        data: notifications,
      });

      this.logger.log(`[签到通知] 已向 ${enrollments.length} 名学生发送签到通知`);
    }

    this.logger.log(`[开启签到] 课程: ${course.title}, 签到码: ${code}, 有效期至: ${endTime.toISOString()}`);

    return {
      sessionId: session.id,
      code: session.code,
      courseId: session.courseId,
      courseName: course.title,
      startTime: session.startTime,
      endTime: session.endTime,
      qrData: {
        type: 'checkin',
        sessionId: session.id,
        courseId: session.courseId,
        timestamp: Date.now(),
      },
    };
  }

  /**
   * 结束签到（教师/管理员）
   */
  async stopCheckin(courseId: string, sessionId: string) {
    const session = await this.prisma.checkinSession.findFirst({
      where: {
        id: sessionId,
        courseId,
      },
      include: {
        course: { select: { title: true } },
        checkins: true,
      },
    });

    if (!session) {
      throw new NotFoundException('签到会话不存在');
    }

    // 更新会话状态
    await this.prisma.checkinSession.update({
      where: { id: sessionId },
      data: { isActive: false },
    });

    // 统计数据
    const totalStudents = await this.prisma.enrollment.count({
      where: { courseId, status: 'ENROLLED' },
    });

    const checkedIn = session.checkins.length;
    const notCheckedIn = totalStudents - checkedIn;
    const checkinRate = totalStudents > 0 ? ((checkedIn / totalStudents) * 100).toFixed(1) : '0';

    this.logger.log(`[结束签到] 课程: ${session.course.title}, 签到率: ${checkinRate}%`);

    return {
      message: '签到已结束',
      statistics: {
        totalStudents,
        checkedIn,
        notCheckedIn,
        checkinRate: `${checkinRate}%`,
      },
    };
  }

  /**
   * 获取课程活跃签到会话（管理员端）
   */
  async getActiveSessionAdmin(courseId: string) {
    const session = await this.prisma.checkinSession.findFirst({
      where: {
        courseId,
        isActive: true,
        endTime: { gt: new Date() },
      },
      include: {
        course: {
          select: {
            title: true,
          },
        },
      },
    });

    if (!session) {
      return {
        hasActiveSession: false,
      };
    }

    return {
      hasActiveSession: true,
      sessionId: session.id,
      code: session.code,
      courseId: session.courseId,
      courseName: session.course.title,
      startTime: session.startTime,
      endTime: session.endTime,
    };
  }

  /**
   * 获取活跃签到会话（学员端）
   */
  async getActiveSession(courseId: string, userId: string) {
    const session = await this.prisma.checkinSession.findFirst({
      where: {
        courseId,
        isActive: true,
        endTime: { gt: new Date() },
      },
      select: {
        id: true,
        endTime: true,
      },
    });

    if (!session) {
      return {
        hasActiveSession: false,
        canCheckin: false,
        alreadyCheckedIn: false,
      };
    }

    // 检查是否已报名
    const enrollment = await this.prisma.enrollment.findFirst({
      where: { userId, courseId },
    });

    if (!enrollment) {
      return {
        hasActiveSession: true,
        sessionId: session.id,
        endTime: session.endTime,
        canCheckin: false,
        alreadyCheckedIn: false,
        message: '您未报名该课程',
      };
    }

    // 检查是否已签到
    const checkin = await this.prisma.checkin.findUnique({
      where: {
        sessionId_userId: {
          sessionId: session.id,
          userId,
        },
      },
    });

    const remainingMinutes = Math.ceil((session.endTime.getTime() - Date.now()) / 60000);

    return {
      hasActiveSession: true,
      sessionId: session.id,
      endTime: session.endTime,
      remainingMinutes: Math.max(0, remainingMinutes),
      canCheckin: !checkin,
      alreadyCheckedIn: !!checkin,
      checkinTime: checkin?.checkinTime,
    };
  }

  /**
   * 签到码签到（学员）
   */
  async checkinByCode(userId: string, dto: CheckinByCodeDto) {
    // 查找签到会话
    const session = await this.prisma.checkinSession.findFirst({
      where: {
        courseId: dto.courseId,
        code: dto.code,
        isActive: true,
      },
      include: {
        course: { select: { title: true } },
      },
    });

    if (!session) {
      throw new BadRequestException('签到码无效或签到已结束');
    }

    // 检查是否过期
    if (new Date() > session.endTime) {
      throw new BadRequestException('签到时间已过');
    }

    // 检查是否已报名
    const enrollment = await this.prisma.enrollment.findFirst({
      where: { userId, courseId: dto.courseId },
    });

    if (!enrollment) {
      throw new BadRequestException('您未报名该课程，无法签到');
    }

    // 检查是否已签到
    const existingCheckin = await this.prisma.checkin.findUnique({
      where: {
        sessionId_userId: {
          sessionId: session.id,
          userId,
        },
      },
    });

    if (existingCheckin) {
      throw new BadRequestException('您已签到，请勿重复签到');
    }

    // 创建签到记录
    const checkin = await this.prisma.checkin.create({
      data: {
        sessionId: session.id,
        enrollmentId: enrollment.id,
        userId,
        checkinMethod: CheckinMethod.CODE,
      },
    });

    // 更新报名记录的签到状态
    await this.prisma.enrollment.update({
      where: { id: enrollment.id },
      data: {
        checkedIn: true,
        checkInTime: checkin.checkinTime,
      },
    });

    this.logger.log(`[签到成功] 用户: ${userId}, 课程: ${session.course.title}, 方式: 签到码`);

    return {
      success: true,
      message: '签到成功',
      checkinTime: checkin.checkinTime,
      courseName: session.course.title,
    };
  }

  /**
   * 二维码签到（学员）
   */
  async checkinByQRCode(userId: string, dto: CheckinByQRCodeDto) {
    // 查找签到会话
    const session = await this.prisma.checkinSession.findUnique({
      where: { id: dto.sessionId },
      include: {
        course: { select: { id: true, title: true } },
      },
    });

    if (!session || !session.isActive) {
      throw new BadRequestException('签到会话无效或已结束');
    }

    // 检查是否过期
    if (new Date() > session.endTime) {
      throw new BadRequestException('签到时间已过');
    }

    // 检查是否已报名
    const enrollment = await this.prisma.enrollment.findFirst({
      where: { userId, courseId: session.courseId },
    });

    if (!enrollment) {
      throw new BadRequestException('您未报名该课程，无法签到');
    }

    // 检查是否已签到
    const existingCheckin = await this.prisma.checkin.findUnique({
      where: {
        sessionId_userId: {
          sessionId: session.id,
          userId,
        },
      },
    });

    if (existingCheckin) {
      throw new BadRequestException('您已签到，请勿重复签到');
    }

    // 创建签到记录
    const checkin = await this.prisma.checkin.create({
      data: {
        sessionId: session.id,
        enrollmentId: enrollment.id,
        userId,
        checkinMethod: CheckinMethod.QRCODE,
      },
    });

    // 更新报名记录的签到状态
    await this.prisma.enrollment.update({
      where: { id: enrollment.id },
      data: {
        checkedIn: true,
        checkInTime: checkin.checkinTime,
      },
    });

    this.logger.log(`[签到成功] 用户: ${userId}, 课程: ${session.course.title}, 方式: 二维码`);

    return {
      success: true,
      message: '签到成功',
      checkinTime: checkin.checkinTime,
      courseName: session.course.title,
    };
  }

  /**
   * 获取签到统计（教师/管理员）
   */
  async getStatistics(courseId: string, sessionId: string) {
    const session = await this.prisma.checkinSession.findFirst({
      where: {
        id: sessionId,
        courseId,
      },
      include: {
        course: { select: { title: true } },
        chapter: {
          select: {
            id: true,
            title: true,
            sortOrder: true,
          },
        },
        checkins: {
          include: {
            user: {
              select: {
                id: true,
                nickname: true,
                realName: true,
                avatar: true,
              },
            },
          },
          orderBy: { checkinTime: 'asc' },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('签到会话不存在');
    }

    // 获取所有已报名学员
    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        courseId,
        status: 'ENROLLED',
      },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            realName: true,
            avatar: true,
          },
        },
      },
    });

    // 已签到学员
    const checkinList = session.checkins.map((checkin) => ({
      userId: checkin.user.id,
      userName: checkin.user.realName || checkin.user.nickname,
      avatar: checkin.user.avatar,
      checkinTime: checkin.checkinTime,
      method: checkin.checkinMethod,
    }));

    // 未签到学员
    const checkedInUserIds = new Set(session.checkins.map((c) => c.userId));
    const notCheckinList = enrollments
      .filter((e) => !checkedInUserIds.has(e.userId))
      .map((e) => ({
        userId: e.user.id,
        userName: e.user.realName || e.user.nickname,
        avatar: e.user.avatar,
      }));

    const totalStudents = enrollments.length;
    const checkedIn = checkinList.length;
    const notCheckedIn = notCheckinList.length;
    const checkinRate = totalStudents > 0 ? ((checkedIn / totalStudents) * 100).toFixed(1) : '0';

    return {
      session: {
        id: session.id,
        code: session.code,
        startTime: session.startTime,
        endTime: session.endTime,
        isActive: session.isActive,
        chapterId: session.chapterId,
        chapter: session.chapter,
      },
      courseName: session.course.title,
      chapterName: session.chapter?.title,
      statistics: {
        totalStudents,
        checkedIn,
        notCheckedIn,
        checkinRate: `${checkinRate}%`,
      },
      checkinList,
      notCheckinList,
    };
  }

  /**
   * 补签（管理员）
   */
  async makeupCheckin(
    courseId: string,
    sessionId: string,
    userId: string,
    adminUserId: string,
    reason?: string,
  ) {
    // 检查签到会话
    const session = await this.prisma.checkinSession.findFirst({
      where: {
        id: sessionId,
        courseId,
      },
      include: {
        course: { select: { title: true } },
      },
    });

    if (!session) {
      throw new NotFoundException('签到会话不存在');
    }

    // 检查是否已报名
    const enrollment = await this.prisma.enrollment.findFirst({
      where: { userId, courseId },
    });

    if (!enrollment) {
      throw new BadRequestException('该学员未报名该课程，无法补签');
    }

    // 检查是否已签到
    const existingCheckin = await this.prisma.checkin.findUnique({
      where: {
        sessionId_userId: {
          sessionId,
          userId,
        },
      },
    });

    if (existingCheckin) {
      throw new BadRequestException('该学员已签到，无需补签');
    }

    // 创建补签记录
    const checkin = await this.prisma.checkin.create({
      data: {
        sessionId,
        enrollmentId: enrollment.id,
        userId,
        checkinMethod: CheckinMethod.MAKEUP,
        isMakeup: true,
        makeupBy: adminUserId,
        makeupReason: reason || '管理员补签',
        makeupTime: new Date(),
        checkinTime: new Date(), // 补签时间作为签到时间
      },
    });

    // 更新报名记录的签到状态
    await this.prisma.enrollment.update({
      where: { id: enrollment.id },
      data: {
        checkedIn: true,
        checkInTime: checkin.checkinTime,
      },
    });

    // 获取学员信息
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { nickname: true, realName: true },
    });

    this.logger.log(
      `[补签成功] 管理员: ${adminUserId}, 学员: ${user?.realName || user?.nickname}, 课程: ${session.course.title}, 原因: ${reason || '管理员补签'}`,
    );

    return {
      success: true,
      message: '补签成功',
      checkinTime: checkin.checkinTime,
      courseName: session.course.title,
      userName: user?.realName || user?.nickname,
    };
  }

  /**
   * 批量补签（管理员）
   */
  async batchMakeupCheckin(
    courseId: string,
    sessionId: string,
    userIds: string[],
    adminUserId: string,
    reason?: string,
  ) {
    const results = {
      success: [] as string[],
      failed: [] as { userId: string; reason: string }[],
    };

    for (const userId of userIds) {
      try {
        await this.makeupCheckin(courseId, sessionId, userId, adminUserId, reason);
        results.success.push(userId);
      } catch (error: any) {
        results.failed.push({
          userId,
          reason: error.message || '补签失败',
        });
      }
    }

    this.logger.log(
      `[批量补签完成] 成功: ${results.success.length}, 失败: ${results.failed.length}`,
    );

    return {
      message: `批量补签完成，成功 ${results.success.length} 人，失败 ${results.failed.length} 人`,
      success: results.success,
      failed: results.failed,
    };
  }

  /**
   * 获取课程历史签到记录（教师/管理员）
   */
  async getCheckinHistory(courseId: string) {
    this.logger.log(`[获取历史签到] courseId: ${courseId}`);

    // 获取课程信息
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        title: true,
        _count: {
          select: {
            enrollments: {
              where: { status: 'ENROLLED' },
            },
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundException('课程不存在');
    }

    // 获取所有签到会话
    const sessions = await this.prisma.checkinSession.findMany({
      where: { courseId },
      include: {
        chapter: {
          select: {
            id: true,
            title: true,
            sortOrder: true,
          },
        },
        _count: {
          select: {
            checkins: true,
          },
        },
      },
      orderBy: { startTime: 'desc' },
    });

    // 转换数据格式，添加 checkinCount 和章节信息
    const sessionsWithCount = sessions.map((session) => ({
      id: session.id,
      sessionId: session.id, // ✅ 同时返回 sessionId
      code: session.code,
      startTime: session.startTime,
      endTime: session.endTime,
      isActive: session.isActive,
      chapterId: session.chapterId,
      chapter: session.chapter, // ✅ 包含章节信息
      checkinCount: session._count.checkins,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    }));

    // 计算统计信息
    const totalStudents = course._count.enrollments;
    const totalSessions = sessions.length;
    const totalCheckins = sessions.reduce((sum, s) => sum + s._count.checkins, 0);
    const averageAttendance =
      totalSessions > 0 && totalStudents > 0
        ? Math.round((totalCheckins / (totalSessions * totalStudents)) * 100)
        : 0;

    return {
      summary: {
        totalSessions,
        totalStudents,
        totalCheckins,
        averageAttendance,
      },
      sessions: sessionsWithCount,
    };
  }

  /**
   * 获取学生自己的签到记录
   */
  async getMyCheckinRecords(userId: string, courseId?: string, chapterId?: string) {
    this.logger.log(`[获取我的签到记录] userId: ${userId}, courseId: ${courseId}, chapterId: ${chapterId}`);

    const where: any = {
      userId,
    };

    // 如果指定了课程ID
    if (courseId) {
      where.session = {
        courseId,
        ...(chapterId ? { chapterId } : {}),
      };
    }

    // 获取签到记录
    const checkins = await this.prisma.checkin.findMany({
      where,
      include: {
        session: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                coverImage: true,
              },
            },
            chapter: {
              select: {
                id: true,
                title: true,
                sortOrder: true,
              },
            },
          },
        },
      },
      orderBy: {
        checkinTime: 'desc',
      },
    });

    // 格式化返回数据
    const records = checkins.map((checkin) => ({
      id: checkin.id,
      sessionId: checkin.sessionId,
      code: checkin.session.code,
      checkinTime: checkin.checkinTime,
      method: checkin.checkinMethod,  // 正确的字段名
      course: checkin.session.course,
      chapter: checkin.session.chapter,
      isLate: checkin.checkinTime > checkin.session.endTime,
      sessionStartTime: checkin.session.startTime,
      sessionEndTime: checkin.session.endTime,
    }));

    // 统计信息
    const summary = {
      totalCheckins: checkins.length,
      onTimeCheckins: records.filter(r => !r.isLate).length,
      lateCheckins: records.filter(r => r.isLate).length,
    };

    return {
      summary,
      records,
    };
  }
}

