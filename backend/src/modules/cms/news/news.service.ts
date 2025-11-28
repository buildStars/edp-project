import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { PaginatedResult } from '../../../common/dto/pagination.dto';
import { NotificationsService } from '../../notifications/notifications.service';

@Injectable()
export class NewsService {
  private readonly logger = new Logger(NewsService.name);

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async findAll(query: any, userId?: string) {
    const page = parseInt(query.page) || 1;
    const pageSize = parseInt(query.pageSize) || 10;
    const category = query.category;
    const status = query.status;
    const keyword = query.keyword;
    
    const skip = (page - 1) * pageSize;

    const where: any = {};
    
    // 如果指定了状态，则按状态筛选；否则只显示已发布的（用户端）
    if (status) {
      where.status = status;
    } else if (!query.admin) {
      where.status = 'PUBLISHED';
    }
    
    if (category) where.category = category.toUpperCase();
    
    // 关键词搜索
    if (keyword) {
      where.title = { contains: keyword };
    }

    const [list, total] = await Promise.all([
      this.prisma.news.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: [{ isTop: 'desc' }, { publishTime: 'desc' }],
      }),
      this.prisma.news.count({ where }),
    ]);

    // 如果提供了 userId，批量查询收藏状态
    let newsWithCollectStatus = list;
    if (userId) {
      const newsIds = list.map(news => news.id);
      const collections = await this.prisma.collection.findMany({
        where: {
          userId,
          newsId: { in: newsIds },
        },
        select: { newsId: true },
      });
      
      const collectedNewsIds = new Set(collections.map(c => c.newsId));
      newsWithCollectStatus = list.map(news => ({
        ...news,
        isCollected: collectedNewsIds.has(news.id),
      }));
    } else {
      newsWithCollectStatus = list.map(news => ({
        ...news,
        isCollected: false,
      }));
    }

    return new PaginatedResult(newsWithCollectStatus, total, page, pageSize);
  }

  async findOne(id: string, userId?: string) {
    // 先检查记录是否存在
    const news = await this.prisma.news.findUnique({
      where: { id },
    });

    if (!news) {
      return null;
    }

    // 增加浏览量（异步执行，不等待结果）
    this.prisma.news.update({
      where: { id },
      data: { views: { increment: 1 } },
    }).catch(error => {
      this.logger.warn(`更新新闻浏览量失败 - id: ${id}`, 'NewsService');
    });

    // 如果提供了 userId，检查是否已收藏
    let isCollected = false;
    if (userId) {
      const collection = await this.prisma.collection.findUnique({
        where: {
          userId_newsId: {
            userId,
            newsId: id,
          },
        },
      });
      isCollected = !!collection;
    }

    return {
      ...news,
      isCollected,
    };
  }

  async collect(userId: string, newsId: string) {
    // 检查是否已收藏
    const existing = await this.prisma.collection.findUnique({
      where: { userId_newsId: { userId, newsId } },
    });

    // 如果已收藏，直接返回
    if (existing) {
      return { message: '已收藏', data: existing };
    }

    // 创建收藏记录
    const collection = await this.prisma.collection.create({
      data: { userId, newsId },
    });

    return { message: '收藏成功', data: collection };
  }

  async uncollect(userId: string, newsId: string) {
    // 检查是否已收藏
    const existing = await this.prisma.collection.findUnique({
      where: { userId_newsId: { userId, newsId } },
    });

    // 如果没有收藏，直接返回
    if (!existing) {
      return { message: '未收藏过此资讯' };
    }

    // 删除收藏记录
    await this.prisma.collection.delete({
      where: { userId_newsId: { userId, newsId } },
    });

    return { message: '取消收藏成功' };
  }

  async getMyCollection(userId: string, query: any) {
    const { page = 1, pageSize = 10 } = query;
    const skip = (page - 1) * pageSize;

    const [list, total] = await Promise.all([
      this.prisma.collection.findMany({
        where: { userId },
        skip,
        take: Number(pageSize),
        include: { news: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.collection.count({ where: { userId } }),
    ]);

    // 过滤掉资讯已被删除的收藏记录
    const newsList = list.filter(c => c.news !== null).map(c => c.news);

    return new PaginatedResult(newsList, total, Number(page), Number(pageSize));
  }

  // ========== 管理端方法 ==========

  async create(data: any) {
    const news = await this.prisma.news.create({
      data: {
        ...data,
        publishTime: data.publishTime || new Date(),
        status: data.status || 'DRAFT',
        isTop: data.isTop || false,
        views: 0,
      },
    });

    // 如果是发布状态，向所有用户发送通知
    if (news.status === 'PUBLISHED') {
      try {
        // 获取所有活跃用户ID
        const users = await this.prisma.user.findMany({
          where: { status: 'ACTIVE' },
          select: { id: true },
        });
        const userIds = users.map(u => u.id);

        // 批量创建通知
        if (userIds.length > 0) {
          await this.notificationsService.createBatch(userIds, {
            type: 'NEWS_UPDATE',
            title: '新资讯发布',
            content: `${news.title}`,
            data: {
              newsId: news.id,
              url: `/pages/news/detail?id=${news.id}`,
            },
          });
          this.logger.log(`[资讯通知] 已发送给 ${userIds.length} 位用户, 资讯: ${news.title}`);
        }
      } catch (error) {
        this.logger.error(`[资讯通知] 发送失败: ${error.message}`);
      }
    }

    return news;
  }

  async update(id: string, data: any) {
    return this.prisma.news.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.news.delete({
      where: { id },
    });
  }

  async batchDelete(ids: string[]) {
    return this.prisma.news.deleteMany({
      where: { id: { in: ids } },
    });
  }

  async toggleTop(id: string, isTop: boolean) {
    // 如果要置顶，先取消其他资讯的置顶
    if (isTop) {
      await this.prisma.news.updateMany({
        where: { isTop: true },
        data: { isTop: false },
      });
    }

    return this.prisma.news.update({
      where: { id },
      data: { isTop },
    });
  }

  async updateStatus(id: string, status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED') {
    return this.prisma.news.update({
      where: { id },
      data: { status },
    });
  }
}

