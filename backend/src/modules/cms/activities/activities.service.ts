import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { PaginatedResult } from '../../../common/dto/pagination.dto';
import { NotificationsService } from '../../notifications/notifications.service';

@Injectable()
export class ActivitiesService {
  private readonly logger = new Logger(ActivitiesService.name);

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  /**
   * 将活动对象的 images 字段从 JSON 字符串转换为数组
   */
  private parseActivityImages(activity: any) {
    if (!activity) return activity;
    
    if (activity.images && typeof activity.images === 'string') {
      try {
        activity.images = JSON.parse(activity.images);
      } catch {
        activity.images = [];
      }
    }
    
    return activity;
  }

  async findAll(query: any, userId?: string) {
    const page = parseInt(query.page) || 1;
    const pageSize = parseInt(query.pageSize) || 10;
    const associationId = query.associationId;
    const status = query.status;
    const keyword = query.keyword;
    
    const skip = (page - 1) * pageSize;

    const where: any = {};
    
    // 如果指定了状态，则过滤状态（管理后台可以不传status查看所有）
    if (status) {
      where.status = status;
    }
    
    // 如果没有指定status，且没有提供userId（说明是公开访问），则只显示已发布
    // 这样管理后台（有userId）可以看到所有状态
    if (!status && !userId) {
      where.status = 'PUBLISHED';
    }
    
    // 协会过滤（允许为null，显示未关联协会的活动）
    if (associationId) {
      where.associationId = associationId;
    }
    
    // 关键词搜索
    if (keyword) {
      where.title = { contains: keyword };
    }

    const [list, total] = await Promise.all([
      this.prisma.activity.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { publishTime: 'desc' },
        include: {
          association: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      this.prisma.activity.count({ where }),
    ]);

    // 解析 images 字段并查询点赞状态
    let activitiesWithLikeStatus = list.map(activity => this.parseActivityImages(activity));
    
    if (userId) {
      const activityIds = list.map(activity => activity.id);
      const likes = await this.prisma.activityLike.findMany({
        where: {
          userId,
          activityId: { in: activityIds },
        },
        select: { activityId: true },
      });
      
      const likedActivityIds = new Set(likes.map(l => l.activityId));
      activitiesWithLikeStatus = activitiesWithLikeStatus.map(activity => ({
        ...activity,
        isLiked: likedActivityIds.has(activity.id),
      }));
    } else {
      activitiesWithLikeStatus = activitiesWithLikeStatus.map(activity => ({
        ...activity,
        isLiked: false,
      }));
    }

    return new PaginatedResult(activitiesWithLikeStatus, total, page, pageSize);
  }

  async findOne(id: string, userId?: string) {
    // 先查询活动是否存在
    const activity = await this.prisma.activity.findUnique({
      where: { id },
    });

    if (!activity) {
      return null;
    }

    // 如果存在，增加浏览量
    try {
      await this.prisma.activity.update({
        where: { id },
        data: { views: { increment: 1 } },
      });
    } catch (error) {
      this.logger.warn(`更新活动浏览量失败 - id: ${id}`, 'ActivitiesService');
      // 浏览量更新失败不影响查询结果，继续执行
    }

    // 解析 images 字段
    const parsedActivity = this.parseActivityImages(activity);

    // 如果提供了 userId，检查是否已点赞
    let isLiked = false;
    if (userId) {
      const like = await this.prisma.activityLike.findUnique({
        where: {
          userId_activityId: {
            userId,
            activityId: id,
          },
        },
      });
      isLiked = !!like;
    }

    return {
      ...parsedActivity,
      isLiked,
    };
  }

  async like(userId: string, activityId: string) {
    // 检查是否已点赞
    const existing = await this.prisma.activityLike.findUnique({
      where: { userId_activityId: { userId, activityId } },
    });

    if (existing) {
      return { message: '已点赞' };
    }

    // 创建点赞记录并增加点赞数
    await this.prisma.$transaction([
      this.prisma.activityLike.create({
        data: { userId, activityId },
      }),
      this.prisma.activity.update({
        where: { id: activityId },
        data: { likes: { increment: 1 } },
      }),
    ]);

    return { message: '点赞成功' };
  }

  async unlike(userId: string, activityId: string) {
    // 检查是否已点赞
    const existing = await this.prisma.activityLike.findUnique({
      where: { userId_activityId: { userId, activityId } },
    });

    if (!existing) {
      return { message: '未点赞过此活动' };
    }

    // 删除点赞记录并减少点赞数
    await this.prisma.$transaction([
      this.prisma.activityLike.delete({
        where: { userId_activityId: { userId, activityId } },
      }),
      this.prisma.activity.update({
        where: { id: activityId },
        data: { likes: { decrement: 1 } },
      }),
    ]);

    return { message: '取消点赞成功' };
  }

  // ========== 管理端方法 ==========

  async create(data: any) {
    // 将 images 数组转换为 JSON 字符串
    const images = Array.isArray(data.images) 
      ? JSON.stringify(data.images) 
      : data.images;

    // 处理 associationId：如果是 undefined 或 "undefined" 字符串，设置为 null
    let associationId = data.associationId;
    if (!associationId || associationId === 'undefined' || associationId === 'null') {
      associationId = null;
    }

    const activity = await this.prisma.activity.create({
      data: {
        ...data,
        associationId,
        images,
        publishTime: data.publishTime || new Date(),
        status: data.status || 'PUBLISHED',
        views: 0,
        likes: 0,
      },
      include: {
        association: true,
      },
    });

    // 如果是发布状态，向所有用户发送通知
    if (activity.status === 'PUBLISHED') {
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
            type: 'ACTIVITY_REMIND',
            title: '新活动发布',
            content: `${activity.association?.name || ''}：${activity.title}`,
            data: {
              activityId: activity.id,
              url: `/pages/association/activity-detail?id=${activity.id}`,
            },
          });
          this.logger.log(`[活动通知] 已发送给 ${userIds.length} 位用户, 活动: ${activity.title}`);
        }
      } catch (error) {
        this.logger.error(`[活动通知] 发送失败: ${error.message}`);
      }
    }

    return this.parseActivityImages(activity);
  }

  async update(id: string, data: any) {
    // 将 images 数组转换为 JSON 字符串
    if (data.images && Array.isArray(data.images)) {
      data.images = JSON.stringify(data.images);
    }

    // 处理 associationId：如果是 undefined 或 "undefined" 字符串，设置为 null
    if (data.associationId && (data.associationId === 'undefined' || data.associationId === 'null')) {
      data.associationId = null;
    }

    const activity = await this.prisma.activity.update({
      where: { id },
      data,
    });

    return this.parseActivityImages(activity);
  }

  async remove(id: string) {
    return this.prisma.activity.delete({
      where: { id },
    });
  }
}

