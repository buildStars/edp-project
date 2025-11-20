import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { AiConfigService } from '../ai-config/ai-config.service';
import { GenerateReportDto } from './dto/generate-report.dto';

@Injectable()
export class AiReportsService {
  private readonly logger = new Logger(AiReportsService.name);

  constructor(
    private prisma: PrismaService,
    private aiConfigService: AiConfigService,
  ) {}

  /**
   * 生成 AI 学习报告
   */
  async generateReport(userId: string, dto: GenerateReportDto) {
    const { year, force } = dto;

    // 检查是否已存在报告
    if (!force) {
      const existingReport = await this.prisma.aiReport.findFirst({
        where: { userId, year },
      });

      if (existingReport) {
        return existingReport;
      }
    }

    // 获取 AI 配置
    const aiConfig = await this.aiConfigService.getFullConfig();
    if (!aiConfig || !aiConfig.isActive) {
      throw new BadRequestException('AI 服务未配置或未启用');
    }

    // 获取用户学习数据
    const learningData = await this.getUserLearningData(userId, year);

    // 调用 AI 生成报告内容
    const aiContent = await this.callAiApi(aiConfig, learningData);

    // 保存或更新报告
    const report = await this.saveReport(userId, year, learningData, aiContent, aiConfig.model);

    return report;
  }

  /**
   * 获取用户学习报告
   */
  async getReport(userId: string, year: number) {
    const report = await this.prisma.aiReport.findFirst({
      where: { userId, year },
    });

    if (report) {
      // 增加查看次数
      await this.prisma.aiReport.update({
        where: { id: report.id },
        data: { viewCount: { increment: 1 } },
      });
    }

    return report;
  }

  /**
   * 获取用户所有报告列表
   */
  async getUserReports(userId: string) {
    return await this.prisma.aiReport.findMany({
      where: { userId },
      orderBy: { year: 'desc' },
      select: {
        id: true,
        year: true,
        totalCredits: true,
        totalCourses: true,
        totalHours: true,
        generatedAt: true,
        viewCount: true,
      },
    });
  }

  /**
   * 获取用户学习数据
   */
  private async getUserLearningData(userId: string, year: number) {
    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year}-12-31T23:59:59`);

    // 获取报名的课程
    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            category: true,
            credit: true,
            introduction: true,
            teacherName: true,
          },
        },
      },
    });

    // 获取学习成果
    const achievements = await this.prisma.learningAchievement.findMany({
      where: {
        userId,
        issuedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        course: {
          select: {
            title: true,
            category: true,
          },
        },
      },
    });

    // 统计各类型课程数量和学分
    const categoryStats = this.calculateCategoryStats(enrollments, achievements);

    // 计算总学时（假设每学分对应 8 学时）
    const totalHours = achievements.reduce((sum, a) => sum + a.credit, 0) * 8;

    return {
      totalCredits: achievements.reduce((sum, a) => sum + a.credit, 0),
      totalCourses: enrollments.length,
      completedCourses: achievements.length,
      totalHours,
      categoryStats,
      courses: enrollments.map((e) => ({
        title: e.course.title,
        category: e.course.category,
        introduction: e.course.introduction,
        teacherName: e.course.teacherName,
      })),
      achievements: achievements.map((a) => ({
        courseTitle: a.course.title,
        credits: a.credit,
        category: a.course.category,
      })),
    };
  }

  /**
   * 计算各类型课程统计
   */
  private calculateCategoryStats(enrollments: any[], achievements: any[]) {
    const stats = {
      ACCELERATE: { count: 0, credits: 0, name: '加速课堂' },
      MASTER: { count: 0, credits: 0, name: '大师课堂' },
      EMPOWER: { count: 0, credits: 0, name: '赋能课堂' },
    };

    achievements.forEach((achievement) => {
      const category = achievement.course.category;
      if (stats[category]) {
        stats[category].count++;
        stats[category].credits += achievement.credit;
      }
    });

    return stats;
  }

  /**
   * 调用 AI API 生成报告内容
   */
  private async callAiApi(aiConfig: any, learningData: any) {
    try {
      // 构建提示词
      const prompt = this.buildPrompt(learningData);

      this.logger.log(`调用 AI API 生成报告，模型: ${aiConfig.model}`);

      // TODO: 实际调用 AI API（这里需要根据具体的 AI 服务实现）
      // 示例：调用 OpenAI API
      const response = await this.callOpenAI(aiConfig, prompt);

      return this.parseAiResponse(response, learningData);
    } catch (error) {
      this.logger.error('AI API 调用失败:', error);
      // 返回默认内容
      return this.generateDefaultContent(learningData);
    }
  }

  /**
   * 构建 AI 提示词
   */
  private buildPrompt(learningData: any) {
    const { totalCredits, totalCourses, completedCourses, categoryStats, courses } = learningData;

    return `
你是一位专业的学习顾问。请根据以下学习数据，生成一份年度学习报告：

学习统计：
- 总学分：${totalCredits}
- 报名课程数：${totalCourses}
- 完成课程数：${completedCourses}
- 加速课堂：${categoryStats.ACCELERATE.count}门课程，${categoryStats.ACCELERATE.credits}学分
- 大师课堂：${categoryStats.MASTER.count}门课程，${categoryStats.MASTER.credits}学分
- 赋能课堂：${categoryStats.EMPOWER.count}门课程，${categoryStats.EMPOWER.credits}学分

已学课程：
${courses.map((c, i) => `${i + 1}. ${c.title}（${c.teacherName}）\n   课程介绍：${c.introduction}`).join('\n\n')}

请生成以下内容（以JSON格式返回）：
{
  "summary": "简短的学习总结（100字以内）",
  "achievements": "主要成就（3-5条要点）",
  "knowledgePoints": "学习到的关键知识点（5-8条）",
  "recommendations": "后续学习建议（3-5条推荐方向）"
}
`;
  }

  /**
   * 调用 OpenAI API
   */
  private async callOpenAI(aiConfig: any, prompt: string) {
    // TODO: 实际实现 OpenAI API 调用
    // 这里需要使用 fetch 或 axios 调用 OpenAI API
    this.logger.log('模拟 AI API 调用...');
    
    // 模拟返回
    return {
      summary: '在过去的一年中，您积极参与各类课程学习，展现出强烈的求知欲和学习热情，在多个领域都取得了显著进步。',
      achievements: '• 完成了多门核心课程，获得了丰富的专业知识\n• 积极参与课堂互动，保持高出勤率\n• 在不同领域都有涉猎，知识面广泛',
      knowledgePoints: '• 企业管理与战略规划\n• 数字化转型与创新\n• 领导力与团队建设\n• 财务管理与风险控制\n• 市场营销与品牌建设',
      recommendations: '• 建议继续深化战略管理方面的学习\n• 可以加强数据分析能力的培养\n• 建议参加更多实战案例分析课程\n• 推荐学习前沿技术趋势相关内容',
    };
  }

  /**
   * 解析 AI 响应
   */
  private parseAiResponse(response: any, learningData: any) {
    // 生成雷达图数据
    const radarData = this.generateRadarData(learningData.categoryStats);

    return {
      summary: response.summary,
      achievements: response.achievements,
      knowledgePoints: response.knowledgePoints,
      recommendations: response.recommendations,
      radarData: JSON.stringify(radarData),
    };
  }

  /**
   * 生成雷达图数据
   */
  private generateRadarData(categoryStats: any) {
    return {
      indicators: [
        { name: '战略管理', max: 100 },
        { name: '创新能力', max: 100 },
        { name: '领导力', max: 100 },
        { name: '财务管理', max: 100 },
        { name: '市场营销', max: 100 },
      ],
      values: [
        Math.min(100, (categoryStats.ACCELERATE.credits / 10) * 100),
        Math.min(100, (categoryStats.MASTER.credits / 10) * 100),
        Math.min(100, (categoryStats.EMPOWER.credits / 10) * 100),
        Math.min(100, ((categoryStats.ACCELERATE.credits + categoryStats.MASTER.credits) / 20) * 100),
        Math.min(100, ((categoryStats.MASTER.credits + categoryStats.EMPOWER.credits) / 20) * 100),
      ],
    };
  }

  /**
   * 生成默认内容（当 AI 调用失败时）
   */
  private generateDefaultContent(learningData: any) {
    const radarData = this.generateRadarData(learningData.categoryStats);

    return {
      summary: `在过去的一年中，您共完成了${learningData.completedCourses}门课程，获得${learningData.totalCredits}学分，展现出良好的学习态度和专业精神。`,
      achievements: '• 积极参与课程学习\n• 完成了多门专业课程\n• 保持良好的学习记录',
      knowledgePoints: '• 企业管理\n• 战略规划\n• 团队协作\n• 专业技能提升',
      recommendations: '• 建议继续保持学习热情\n• 可以尝试更多不同类型的课程\n• 加强理论与实践的结合',
      radarData: JSON.stringify(radarData),
    };
  }

  /**
   * 保存报告
   */
  private async saveReport(
    userId: string,
    year: number,
    learningData: any,
    aiContent: any,
    aiModel: string,
  ) {
    const existingReport = await this.prisma.aiReport.findFirst({
      where: { userId, year },
    });

    const reportData = {
      userId,
      year,
      totalCredits: learningData.totalCredits,
      totalCourses: learningData.totalCourses,
      totalHours: learningData.totalHours,
      summary: aiContent.summary,
      achievements: aiContent.achievements,
      knowledgePoints: aiContent.knowledgePoints,
      recommendations: aiContent.recommendations,
      radarData: aiContent.radarData,
      aiModel,
    };

    if (existingReport) {
      return await this.prisma.aiReport.update({
        where: { id: existingReport.id },
        data: reportData,
      });
    } else {
      return await this.prisma.aiReport.create({
        data: reportData,
      });
    }
  }
}

