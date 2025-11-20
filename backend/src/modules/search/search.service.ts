import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * 全局搜索
   */
  async search(keyword: string, type?: string) {
    if (!keyword || keyword.trim() === '') {
      return {
        news: [],
        courses: [],
        activities: [],
        total: 0,
      };
    }

    const searchKeyword = keyword.trim();
    this.logger.log(`[搜索] 关键词: ${searchKeyword}, 类型: ${type || '全部'}`);

    const results: any = {
      news: [],
      courses: [],
      activities: [],
      total: 0,
    };

    // 如果指定了类型，只搜索该类型
    if (type) {
      switch (type) {
        case 'news':
          results.news = await this.searchNews(searchKeyword);
          break;
        case 'course':
          results.courses = await this.searchCourses(searchKeyword);
          break;
        case 'activity':
          results.activities = await this.searchActivities(searchKeyword);
          break;
      }
    } else {
      // 搜索所有类型
      const [news, courses, activities] = await Promise.all([
        this.searchNews(searchKeyword),
        this.searchCourses(searchKeyword),
        this.searchActivities(searchKeyword),
      ]);

      results.news = news;
      results.courses = courses;
      results.activities = activities;
    }

    results.total =
      results.news.length + results.courses.length + results.activities.length;

    this.logger.log(
      `[搜索结果] 资讯: ${results.news.length}, 课程: ${results.courses.length}, 活动: ${results.activities.length}`,
    );

    return results;
  }

  /**
   * 搜索资讯
   */
  private async searchNews(keyword: string) {
    return this.prisma.news.findMany({
      where: {
        status: 'PUBLISHED',
        OR: [
          { title: { contains: keyword } },
          { content: { contains: keyword } },
          { summary: { contains: keyword } },
        ],
      },
      select: {
        id: true,
        title: true,
        summary: true,
        coverImage: true,
        publishTime: true,
        views: true,
        category: true,
      },
      take: 20,
      orderBy: [{ isTop: 'desc' }, { publishTime: 'desc' }],
    });
  }

  /**
   * 搜索课程
   */
  private async searchCourses(keyword: string) {
    return this.prisma.course.findMany({
      where: {
        status: 'PUBLISHED',
        OR: [
          { title: { contains: keyword } },
          { introduction: { contains: keyword } },
          { teacherName: { contains: keyword } },
          { location: { contains: keyword } },
        ],
      },
      select: {
        id: true,
        title: true,
        introduction: true,
        coverImage: true,
        teacherName: true,
        teacherAvatar: true,
        startTime: true,
        location: true,
        credit: true,
        enrollStatus: true,
        views: true,
      },
      take: 20,
      orderBy: { startTime: 'desc' },
    });
  }

  /**
   * 搜索活动
   */
  private async searchActivities(keyword: string) {
    return this.prisma.activity.findMany({
      where: {
        status: 'PUBLISHED',
        OR: [
          { title: { contains: keyword } },
          { content: { contains: keyword } },
        ],
      },
      include: {
        association: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
      },
      take: 20,
      orderBy: { publishTime: 'desc' },
    });
  }

  /**
   * 获取热门搜索关键词
   */
  async getHotKeywords() {
    // 这里可以从数据库统计真实的热门搜索
    // 暂时返回预设的热门关键词
    return [
      '企业战略',
      '数字化转型',
      '领导力',
      '金融科技',
      '创新管理',
      '资本运作',
      '商业模式',
      '团队管理',
    ];
  }

  /**
   * 获取搜索历史
   */
  async getSearchHistory(userId?: string) {
    // 如果需要记录用户搜索历史，可以在这里实现
    // 暂时返回空数组
    return [];
  }

  /**
   * 记录搜索历史
   */
  async recordSearchHistory(userId: string, keyword: string) {
    // 可以创建一个 SearchHistory 表来记录
    // 暂不实现
    this.logger.log(`[搜索历史] 用户: ${userId}, 关键词: ${keyword}`);
  }
}





