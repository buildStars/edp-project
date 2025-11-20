import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { IssueAchievementDto, BatchIssueAchievementDto } from './dto/issue-achievement.dto';
import { QueryAchievementDto } from './dto/query-achievement.dto';

@Injectable()
export class AchievementsService {
  private readonly logger = new Logger(AchievementsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * 获取课程学员列表及其签到情况
   */
  async getCourseStudentsWithCheckins(courseId: string) {
    this.logger.log(`获取课程学员列表 - courseId: ${courseId}`);

    // 获取课程信息
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        title: true,
        requiredCheckins: true,
        achievementCredit: true,
      },
    });

    if (!course) {
      throw new NotFoundException('课程不存在');
    }

    // 获取所有已报名的学员（包括已完成的）
    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        courseId,
        status: {
          in: ['ENROLLED', 'COMPLETED'],
        },
      },
      include: {
        user: {
          select: {
            id: true,
            realName: true,
            nickname: true,
            phone: true,
            avatar: true,
          },
        },
      },
    });

    // 获取所有签到记录，按用户分组统计
    const checkins = await this.prisma.checkin.findMany({
      where: {
        session: {
          courseId,
        },
      },
      select: {
        enrollmentId: true,
        enrollment: {
          select: {
            userId: true,
          },
        },
      },
    });

    // 统计每个用户的签到次数
    const checkinCountMap = new Map<string, number>();
    checkins.forEach((checkin) => {
      const userId = checkin.enrollment.userId;
      checkinCountMap.set(userId, (checkinCountMap.get(userId) || 0) + 1);
    });

    // 获取已发放的学习成果
    const achievements = await this.prisma.learningAchievement.findMany({
      where: { courseId },
      select: {
        userId: true,
        credit: true,
        issuedAt: true,
        issuedBy: true,
      },
    });

    const achievementMap = new Map(
      achievements.map((a) => [a.userId, a])
    );

    // 组装学员数据
    const students = enrollments.map((enrollment) => {
      const userId = enrollment.user.id;
      const checkinCount = checkinCountMap.get(userId) || 0;
      const achievement = achievementMap.get(userId);
      const isQualified = course.requiredCheckins === 0 || checkinCount >= course.requiredCheckins;
      const isCompleted = enrollment.status === 'COMPLETED';

      return {
        userId,
        realName: enrollment.user.realName || enrollment.user.nickname || '未设置',
        phone: enrollment.user.phone,
        avatar: enrollment.user.avatar,
        checkinCount,
        requiredCheckins: course.requiredCheckins,
        isQualified,
        isCompleted,  // 添加完成状态
        hasAchievement: !!achievement,
        achievement: achievement ? {
          credit: achievement.credit,
          issuedAt: achievement.issuedAt,
        } : null,
      };
    });

    return {
      course: {
        id: course.id,
        title: course.title,
        requiredCheckins: course.requiredCheckins,
        achievementCredit: course.achievementCredit,
      },
      totalStudents: students.length,
      qualifiedStudents: students.filter(s => s.isQualified).length,
      issuedCount: students.filter(s => s.hasAchievement).length,
      students,
    };
  }

  /**
   * 手动发放学习成果
   */
  async issueAchievements(teacherId: string, dto: IssueAchievementDto) {
    this.logger.log(`手动发放学习成果 - teacherId: ${teacherId}, courseId: ${dto.courseId}, userIds: ${dto.userIds.join(',')}`);

    // 验证课程存在
    const course = await this.prisma.course.findUnique({
      where: { id: dto.courseId },
      select: {
        id: true,
        title: true,
        achievementCredit: true,
        requiredCheckins: true,
      },
    });

    if (!course) {
      throw new NotFoundException('课程不存在');
    }

    // 验证学员是否已报名（包括已完成的）
    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        courseId: dto.courseId,
        userId: { in: dto.userIds },
        status: {
          in: ['ENROLLED', 'COMPLETED'],
        },
      },
      select: { userId: true },
    });

    const enrolledUserIds = enrollments.map(e => e.userId);
    const notEnrolledUserIds = dto.userIds.filter(id => !enrolledUserIds.includes(id));

    if (notEnrolledUserIds.length > 0) {
      throw new BadRequestException(`以下学员未报名此课程: ${notEnrolledUserIds.join(', ')}`);
    }

    // 获取每个学员的签到次数
    const checkins = await this.prisma.checkin.findMany({
      where: {
        session: { courseId: dto.courseId },
        enrollment: { userId: { in: dto.userIds } },
      },
      select: {
        enrollment: {
          select: { userId: true },
        },
      },
    });

    const checkinCountMap = new Map<string, number>();
    checkins.forEach(c => {
      const userId = c.enrollment.userId;
      checkinCountMap.set(userId, (checkinCountMap.get(userId) || 0) + 1);
    });

    // 批量创建或更新学习成果
    const results = await Promise.allSettled(
      dto.userIds.map(async (userId) => {
        const checkinCount = checkinCountMap.get(userId) || 0;

        return this.prisma.learningAchievement.upsert({
          where: {
            userId_courseId: {
              userId,
              courseId: dto.courseId,
            },
          },
          create: {
            userId,
            courseId: dto.courseId,
            credit: course.achievementCredit,
            checkinCount,
            requiredCheckins: course.requiredCheckins,
            issuedBy: teacherId,
            remark: dto.remark,
          },
          update: {
            credit: course.achievementCredit,
            checkinCount,
            requiredCheckins: course.requiredCheckins,
            issuedBy: teacherId,
            issuedAt: new Date(),
            remark: dto.remark,
          },
        });
      })
    );

    const successCount = results.filter(r => r.status === 'fulfilled').length;
    const failureCount = results.filter(r => r.status === 'rejected').length;

    this.logger.log(`学习成果发放完成 - 成功: ${successCount}, 失败: ${failureCount}`);

    return {
      message: `成功发放 ${successCount} 个学习成果`,
      successCount,
      failureCount,
    };
  }

  /**
   * 批量发放学习成果（结课时使用）
   * 只发放给符合签到要求的学员
   */
  async batchIssueAchievements(issuerId: string, dto: BatchIssueAchievementDto) {
    this.logger.log(`批量发放学习成果 - issuerId: ${issuerId}, courseId: ${dto.courseId}`);

    // 获取符合条件的学员列表
    const studentsData = await this.getCourseStudentsWithCheckins(dto.courseId);
    const qualifiedStudents = studentsData.students.filter(s => s.isQualified && !s.hasAchievement);

    if (qualifiedStudents.length === 0) {
      return {
        message: '没有符合条件的学员需要发放学习成果',
        successCount: 0,
        failureCount: 0,
      };
    }

    // 发放学习成果
    return this.issueAchievements(issuerId, {
      courseId: dto.courseId,
      userIds: qualifiedStudents.map(s => s.userId),
      remark: dto.remark || '结课自动发放',
    });
  }

  /**
   * 查询学习成果列表
   */
  async findAll(query: QueryAchievementDto) {
    const { userId, courseId, page = 1, pageSize = 20 } = query;

    const where: any = {};
    if (userId) where.userId = userId;
    if (courseId) where.courseId = courseId;

    const [items, total] = await Promise.all([
      this.prisma.learningAchievement.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              realName: true,
              nickname: true,
              phone: true,
            },
          },
          course: {
            select: {
              id: true,
              title: true,
              teacherName: true,
            },
          },
        },
        orderBy: { issuedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.learningAchievement.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      pageSize,
    };
  }

  /**
   * 获取用户的学习成果统计
   */
  async getUserAchievementSummary(userId: string) {
    const achievements = await this.prisma.learningAchievement.findMany({
      where: { userId },
      select: {
        credit: true,
        course: {
          select: {
            title: true,
          },
        },
      },
    });

    const totalCredit = achievements.reduce((sum, a) => sum + a.credit, 0);
    const totalCourses = achievements.length;

    return {
      userId,
      totalCredit,
      totalCourses,
      achievements,
    };
  }
}


