import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getAnnualReport(userId: string, year?: number) {
    const currentYear = year || new Date().getFullYear();
    const startDate = new Date(`${currentYear}-01-01`);
    const endDate = new Date(`${currentYear}-12-31`);

    // 获取用户已完成的课程
    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        userId,
        status: 'COMPLETED',
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        course: true,
      },
    });

    // 统计学分
    const totalCredits = enrollments.reduce((sum, e) => sum + e.course.credit, 0);

    // 统计课程数
    const totalCourses = enrollments.length;

    // 统计学习时长（假设每学分=8小时）
    const totalHours = totalCredits * 8;

    // 统计学习天数
    const uniqueDays = new Set(
      enrollments.map(e => e.createdAt.toISOString().split('T')[0])
    ).size;

    // 课程分类分布
    const categoryMap = new Map();
    enrollments.forEach(e => {
      const category = e.course.category;
      categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
    });

    const categoryDistribution = Array.from(categoryMap.entries()).map(([name, count]) => ({
      name: this.getCategoryName(name),
      count,
      percentage: Math.round((count / totalCourses) * 100),
    }));

    // 能力雷达数据（简化版）
    const abilityData = [
      { name: '战略思维', score: Math.min(totalCredits * 7, 100), color: '#C8161D' },
      { name: '领导力', score: Math.min(totalCredits * 6.5, 100), color: '#FF6B00' },
      { name: '创新能力', score: Math.min(totalCredits * 7.5, 100), color: '#FFB800' },
      { name: '财务管理', score: Math.min(totalCredits * 6, 100), color: '#52C41A' },
      { name: '市场营销', score: Math.min(totalCredits * 6.7, 100), color: '#1890FF' },
    ];

    // 知识总结
    const knowledgeSummary = `在${currentYear}年度的学习中，您系统地学习了${totalCourses}门课程，累计获得${totalCredits}学分，展现了优秀的学习热情和执行力。`;

    // 知识标签
    const knowledgeTags = ['战略管理', '领导力', '创新思维', '财务分析', '市场营销', '团队管理'];

    // 学习建议
    const adviceList = [
      '建议继续加强系统性学习，提升综合管理能力',
      '可以多参与实战课程，将理论知识转化为实践经验',
      '关注行业前沿动态，保持持续学习的态势',
    ];

    return {
      totalCredits,
      totalCourses,
      totalHours,
      totalDays: uniqueDays,
      categoryDistribution,
      abilityData,
      knowledgeSummary,
      knowledgeTags,
      adviceList,
    };
  }

  private getCategoryName(category: string): string {
    const map = {
      ACCELERATE: '加速课堂',
      MASTER: '大师课堂',
      EMPOWER: '赋能课堂',
    };
    return map[category] || category;
  }
}

