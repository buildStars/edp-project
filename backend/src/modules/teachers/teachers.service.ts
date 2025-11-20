import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { LoggerService } from '../../infrastructure/logger/logger.service';

@Injectable()
export class TeachersService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
  ) {}

  /**
   * 获取教师的课程列表（只返回自己的课程）
   */
  async getMyCourses(teacherId: string) {
    this.logger.log(`获取教师课程列表 - teacherId: ${teacherId}`, 'TeachersService');

    // 查询教师的课程（包含所有状态的课程和活跃的签到会话）
    const courses = await this.prisma.course.findMany({
      where: {
        teacherId,
      },
      include: {
        _count: {
          select: {
            enrollments: {
              where: { status: 'ENROLLED' },
            },
          },
        },
        // 包含活跃的签到会话
        checkinSessions: {
          where: {
            isActive: true,
          },
          take: 1,
        },
      },
      orderBy: { startTime: 'desc' },
    });

    // 计算统计数据
    const totalCourses = courses.length;
    const activeCourses = courses.filter((c) => c.status === 'PUBLISHED').length;
    const totalStudents = courses.reduce((sum, c) => sum + c._count.enrollments, 0);

    // 查询待签到数量（有活跃签到session的课程）
    const pendingCheckinsCount = await this.prisma.checkinSession.count({
      where: {
        courseId: { in: courses.map((c) => c.id) },
        isActive: true,
      },
    });

    const statistics = {
      totalCourses,
      activeCourses,
      totalStudents,
      pendingCheckins: pendingCheckinsCount,
    };

    this.logger.log(
      `教师课程统计 - 总数: ${totalCourses}, 进行中: ${activeCourses}, 学员: ${totalStudents}`,
      'TeachersService',
    );

    // 转换课程数据，将 checkinSessions 数组转换为 activeCheckin 对象
    const coursesWithActiveCheckin = courses.map((course) => {
      const { checkinSessions, ...rest } = course as any;
      let activeCheckin = null;
      
      if (checkinSessions && checkinSessions.length > 0) {
        const session = checkinSessions[0];
        // 将 id 字段映射为 sessionId，保持与前端一致
        activeCheckin = {
          ...session,
          sessionId: session.id, // ✅ 添加 sessionId 字段
        };
      }
      
      return {
        ...rest,
        activeCheckin,
      };
    });

    return { courses: coursesWithActiveCheckin, statistics };
  }

  /**
   * 获取教师的学员列表（只返回报名了自己课程的学员）
   */
  async getMyStudents(teacherId: string, query: any = {}) {
    this.logger.log(`获取教师学员列表 - teacherId: ${teacherId}`, 'TeachersService');

    const page = parseInt(query.page) || 1;
    const pageSize = parseInt(query.pageSize) || 20;
    const keyword = query.keyword;

    // 先获取教师的所有课程ID
    const teacherCourses = await this.prisma.course.findMany({
      where: { teacherId },
      select: { id: true },
    });

    const courseIds = teacherCourses.map((c) => c.id);

    if (courseIds.length === 0) {
      return {
        students: [],
        total: 0,
        page,
        pageSize,
      };
    }

    // 构建查询条件
    const where: any = {
      courseId: { in: courseIds },
      status: 'ENROLLED',
    };

    // 关键词搜索
    if (keyword) {
      where.user = {
        OR: [
          { realName: { contains: keyword } },
          { phone: { contains: keyword } },
          { email: { contains: keyword } },
        ],
      };
    }

    // 查询总数（使用 groupBy 去重）
    const uniqueUsers = await this.prisma.enrollment.groupBy({
      by: ['userId'],
      where,
    });
    
    const total = uniqueUsers.length;

    // 查询学员列表（去重）
    const enrollments = await this.prisma.enrollment.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            realName: true,
            nickname: true,
            phone: true,
            email: true,
            avatar: true,
            company: true,
            position: true,
            createdAt: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    });

    // 按学员分组，统计每个学员的相关数据
    const studentMap = new Map();
    
    for (const enrollment of enrollments) {
      const userId = enrollment.user.id;
      
      if (!studentMap.has(userId)) {
        // 统计该学员的签到次数（通过 enrollment 关联）
        const userEnrollments = await this.prisma.enrollment.findMany({
          where: {
            userId,
            courseId: { in: courseIds },
          },
          select: { id: true },
        });
        
        const enrollmentIds = userEnrollments.map((e) => e.id);
        
        const checkinCount = await this.prisma.checkin.count({
          where: {
            userId,
            enrollmentId: { in: enrollmentIds },
          },
        });

        const evaluationCount = await this.prisma.courseEvaluation.count({
          where: {
            userId,
            courseId: { in: courseIds },
          },
        });

        // 获取该学员报名的所有课程
        const studentCourses = await this.prisma.enrollment.findMany({
          where: {
            userId,
            courseId: { in: courseIds },
            status: 'ENROLLED',
          },
          include: {
            course: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        });

        studentMap.set(userId, {
          ...enrollment.user,
          checkinCount,
          evaluationCount,
          courses: studentCourses.map((e) => e.course),
        });
      }
    }

    const students = Array.from(studentMap.values());

    this.logger.log(`查询到 ${students.length} 个学员`, 'TeachersService');

    return {
      students,
      total: students.length,
      page,
      pageSize,
    };
  }

  /**
   * 获取某个课程的学员列表
   */
  async getCourseStudents(teacherId: string, courseId: string) {
    this.logger.log(
      `获取课程学员列表 - teacherId: ${teacherId}, courseId: ${courseId}`,
      'TeachersService',
    );

    // 验证课程是否属于该教师
    const course = await this.prisma.course.findFirst({
      where: {
        id: courseId,
        teacherId,
      },
    });

    if (!course) {
      throw new ForbiddenException('无权访问该课程');
    }

    // 查询课程的学员
    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        courseId,
        status: 'ENROLLED',
      },
      include: {
        user: {
          select: {
            id: true,
            realName: true,
            nickname: true,
            phone: true,
            email: true,
            avatar: true,
            company: true,
            position: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // 统计每个学员的签到和评价情况
    const students = await Promise.all(
      enrollments.map(async (enrollment) => {
        const checkinCount = await this.prisma.checkin.count({
          where: {
            userId: enrollment.userId,
            enrollmentId: enrollment.id,
          },
        });

        const evaluation = await this.prisma.courseEvaluation.findFirst({
          where: {
            courseId,
            userId: enrollment.userId,
            chapterId: null, // 只检查课程级别的评价
          },
        });

        return {
          ...enrollment.user,
          enrollmentId: enrollment.id,
          enrolledAt: enrollment.createdAt,
          checkinCount,
          hasEvaluated: !!evaluation,
          evaluation: evaluation
            ? {
                rating: evaluation.rating,
                contentRating: evaluation.contentRating,
                teacherRating: evaluation.teacherRating,
                organizationRating: evaluation.organizationRating,
                createdAt: evaluation.createdAt,
              }
            : null,
        };
      }),
    );

    // 统计数据
    const statistics = {
      total: students.length,
      checkedIn: students.filter((s) => s.checkinCount > 0).length,
      evaluated: students.filter((s) => s.hasEvaluated).length,
    };

    this.logger.log(
      `课程学员统计 - 总数: ${statistics.total}, 已签到: ${statistics.checkedIn}, 已评价: ${statistics.evaluated}`,
      'TeachersService',
    );

    return { students, statistics };
  }

  /**
   * 获取课程的签到统计
   */
  async getCourseCheckinStats(teacherId: string, courseId: string) {
    // 验证课程权限
    const course = await this.prisma.course.findFirst({
      where: { id: courseId, teacherId },
    });

    if (!course) {
      throw new ForbiddenException('无权访问该课程');
    }

    // 查询签到会话
    const sessions = await this.prisma.checkinSession.findMany({
      where: { courseId },
      include: {
        _count: {
          select: { checkins: true },
        },
      },
      orderBy: { startTime: 'desc' },
    });

    // 查询总签到次数（通过 session 关联）
    const totalCheckins = await this.prisma.checkin.count({
      where: {
        session: {
          courseId,
        },
      },
    });

    // 查询总学员数
    const totalStudents = await this.prisma.enrollment.count({
      where: {
        courseId,
        status: 'ENROLLED',
      },
    });

    // 计算平均出勤率
    const averageAttendance =
      sessions.length > 0 && totalStudents > 0
        ? (totalCheckins / (sessions.length * totalStudents)) * 100
        : 0;

    return {
      sessions: sessions.map((s) => ({
        id: s.id,
        startTime: s.startTime,
        endTime: s.endTime,
        isActive: s.isActive,
        checkinCount: s._count.checkins,
      })),
      statistics: {
        totalSessions: sessions.length,
        totalCheckins,
        totalStudents,
        averageAttendance: Math.round(averageAttendance * 100) / 100,
      },
    };
  }

  /**
   * 获取课程的评价统计
   */
  async getCourseEvaluationStats(teacherId: string, courseId: string) {
    // 验证课程权限
    const course = await this.prisma.course.findFirst({
      where: { id: courseId, teacherId },
    });

    if (!course) {
      throw new ForbiddenException('无权访问该课程');
    }

    // 查询所有评价
    const evaluations = await this.prisma.courseEvaluation.findMany({
      where: { courseId },
      include: {
        user: {
          select: {
            id: true,
            realName: true,
            nickname: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // 计算统计数据
    const totalCount = evaluations.length;
    const totalRating = evaluations.reduce((sum, e) => sum + e.rating, 0);
    const averageRating = totalCount > 0 ? totalRating / totalCount : 0;

    // 评分分布
    const ratingDistribution = {
      5: evaluations.filter((e) => e.rating === 5).length,
      4: evaluations.filter((e) => e.rating === 4).length,
      3: evaluations.filter((e) => e.rating === 3).length,
      2: evaluations.filter((e) => e.rating === 2).length,
      1: evaluations.filter((e) => e.rating === 1).length,
    };

    // 查询总学员数
    const totalStudents = await this.prisma.enrollment.count({
      where: {
        courseId,
        status: 'ENROLLED',
      },
    });

    // 评价率
    const evaluationRate =
      totalStudents > 0 ? (totalCount / totalStudents) * 100 : 0;

    return {
      evaluations: evaluations.map((e) => ({
        id: e.id,
        rating: e.rating,
        contentRating: e.contentRating,
        teacherRating: e.teacherRating,
        organizationRating: e.organizationRating,
        createdAt: e.createdAt,
        user: e.user,
      })),
      statistics: {
        totalCount,
        averageRating: Math.round(averageRating * 10) / 10,
        ratingDistribution,
        evaluationRate: Math.round(evaluationRate * 100) / 100,
        totalStudents,
      },
    };
  }
}

