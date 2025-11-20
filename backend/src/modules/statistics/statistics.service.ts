import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import * as dayjs from 'dayjs';

@Injectable()
export class StatisticsService {
  private readonly logger = new Logger(StatisticsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * 获取仪表板统计数据
   */
  async getDashboardStatistics(user?: any) {
    // 如果是教师，返回教师专属统计
    if (user?.role === 'TEACHER') {
      return this.getTeacherStatistics(user.id);
    }

    // 管理员/教务的全局统计
    const now = new Date();
    const today = dayjs().startOf('day').toDate();
    const monthStart = dayjs().startOf('month').toDate();
    const weekStart = dayjs().startOf('week').toDate();

    // 并发查询所有统计数据
    const [
      totalUsers,
      todayUsers,
      totalCourses,
      activeCourses,
      totalEnrollments,
      monthEnrollments,
      totalNews,
      weekNews,
      pendingCourses,
      pendingTrials,
      todayCheckins,
      userGrowthData,
      enrollmentTrendData,
    ] = await Promise.all([
      // 总用户数
      this.prisma.user.count(),

      // 今日新增用户
      this.prisma.user.count({
        where: { createdAt: { gte: today } },
      }),

      // 总课程数
      this.prisma.course.count(),

      // 进行中的课程（已发布且报名开放）
      this.prisma.course.count({
        where: {
          status: 'PUBLISHED',
          enrollStatus: 'OPEN',
        },
      }),

      // 总报名数
      this.prisma.enrollment.count(),

      // 本月报名数
      this.prisma.enrollment.count({
        where: { createdAt: { gte: monthStart } },
      }),

      // 总资讯数
      this.prisma.news.count(),

      // 本周资讯数
      this.prisma.news.count({
        where: { createdAt: { gte: weekStart } },
      }),

      // 待审批课程（草稿状态）
      this.prisma.course.count({
        where: { status: 'DRAFT' },
      }),

      // 待审核试听
      this.prisma.enrollment.count({
        where: { isTrial: true, trialStatus: 'PENDING' },
      }),

      // 今日签到
      this.prisma.checkin.count({
        where: {
          checkinTime: { gte: today },
        },
      }),

      // 用户增长数据（最近7天）
      this.getUserGrowthData(7),

      // 报名趋势数据（最近7天）
      this.getEnrollmentTrendData(7),
    ]);

    return {
      totalUsers,
      todayUsers,
      totalCourses,
      activeCourses,
      totalEnrollments,
      monthEnrollments,
      totalNews,
      weekNews,
      pendingCourses,
      pendingTrials,
      todayCheckins,
      userGrowthData,
      enrollmentTrendData,
    };
  }

  /**
   * 获取教师统计数据（只统计自己的课程）
   */
  private async getTeacherStatistics(teacherId: string) {
    const today = dayjs().startOf('day').toDate();
    const monthStart = dayjs().startOf('month').toDate();

    // 并发查询教师的统计数据
    const [
      totalCourses,
      activeCourses,
      draftCourses,
      totalStudents,
      totalEnrollments,
      monthEnrollments,
      todayCheckins,
      userGrowthData,
      enrollmentTrendData,
    ] = await Promise.all([
      // 总课程数（教师自己的）
      this.prisma.course.count({
        where: { teacherId },
      }),

      // 进行中的课程
      this.prisma.course.count({
        where: {
          teacherId,
          status: 'PUBLISHED',
          enrollStatus: 'OPEN',
        },
      }),

      // 草稿课程（待提交审批）
      this.prisma.course.count({
        where: {
          teacherId,
          status: 'DRAFT',
        },
      }),

      // 总学员数（去重）
      this.prisma.user.count({
        where: {
          role: 'STUDENT',
          enrollments: {
            some: {
              course: {
                teacherId,
              },
            },
          },
        },
      }),

      // 总报名数
      this.prisma.enrollment.count({
        where: {
          course: {
            teacherId,
          },
        },
      }),

      // 本月报名数
      this.prisma.enrollment.count({
        where: {
          course: {
            teacherId,
          },
          createdAt: { gte: monthStart },
        },
      }),

      // 今日签到数
      this.prisma.checkin.count({
        where: {
          checkinTime: { gte: today },
          enrollment: {
            course: {
              teacherId,
            },
          },
        },
      }),

      // 学员增长数据（最近7天）
      this.getTeacherUserGrowthData(teacherId, 7),

      // 报名趋势数据（最近7天）
      this.getTeacherEnrollmentTrendData(teacherId, 7),
    ]);

    return {
      totalCourses,
      activeCourses,
      draftCourses,
      totalStudents,
      totalEnrollments,
      monthEnrollments,
      todayCheckins,
      userGrowthData,
      enrollmentTrendData,
      // 教师不需要这些全局统计
      totalUsers: 0,
      todayUsers: 0,
      totalNews: 0,
      weekNews: 0,
      pendingCourses: 0,
      pendingTrials: 0,
    };
  }

  /**
   * 获取用户增长数据
   */
  private async getUserGrowthData(days: number) {
    const result = [];
    const now = dayjs();

    for (let i = days - 1; i >= 0; i--) {
      const date = now.subtract(i, 'day');
      const startOfDay = date.startOf('day').toDate();
      const endOfDay = date.endOf('day').toDate();

      const count = await this.prisma.user.count({
        where: {
          createdAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      });

      result.push({
        date: date.format('MM-DD'),
        label: date.format('ddd'),
        count,
      });
    }

    return result;
  }

  /**
   * 获取报名趋势数据
   */
  private async getEnrollmentTrendData(days: number) {
    const result = [];
    const now = dayjs();

    for (let i = days - 1; i >= 0; i--) {
      const date = now.subtract(i, 'day');
      const startOfDay = date.startOf('day').toDate();
      const endOfDay = date.endOf('day').toDate();

      const count = await this.prisma.enrollment.count({
        where: {
          createdAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      });

      result.push({
        date: date.format('MM-DD'),
        label: date.format('ddd'),
        count,
      });
    }

    return result;
  }

  /**
   * 获取教师学员增长数据（最近N天）
   */
  private async getTeacherUserGrowthData(teacherId: string, days: number) {
    const result = [];
    const now = dayjs();

    for (let i = days - 1; i >= 0; i--) {
      const date = now.subtract(i, 'day');
      const startOfDay = date.startOf('day').toDate();
      const endOfDay = date.endOf('day').toDate();

      // 统计该天新增的学员数（报名了教师课程的学员）
      const count = await this.prisma.user.count({
        where: {
          role: 'STUDENT',
          createdAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
          enrollments: {
            some: {
              course: {
                teacherId,
              },
            },
          },
        },
      });

      result.push({
        date: date.format('MM-DD'),
        label: date.format('ddd'),
        count,
      });
    }

    return result;
  }

  /**
   * 获取教师报名趋势数据（最近N天）
   */
  private async getTeacherEnrollmentTrendData(teacherId: string, days: number) {
    const result = [];
    const now = dayjs();

    for (let i = days - 1; i >= 0; i--) {
      const date = now.subtract(i, 'day');
      const startOfDay = date.startOf('day').toDate();
      const endOfDay = date.endOf('day').toDate();

      const count = await this.prisma.enrollment.count({
        where: {
          course: {
            teacherId,
          },
          createdAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      });

      result.push({
        date: date.format('MM-DD'),
        label: date.format('ddd'),
        count,
      });
    }

    return result;
  }
}

