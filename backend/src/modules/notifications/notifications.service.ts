import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { QueryNotificationDto } from './dto/query-notification.dto';
import { MarkReadDto } from './dto/mark-read.dto';
import { PaginatedResult } from '../../common/dto/pagination.dto';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * 创建通知（内部调用，不对外暴露API）
   */
  async create(createNotificationDto: CreateNotificationDto) {
    this.logger.log(`[创建通知] 用户: ${createNotificationDto.userId}, 类型: ${createNotificationDto.type}`);
    
    return this.prisma.notification.create({
      data: createNotificationDto,
    });
  }

  /**
   * 批量创建通知（给多个用户发送相同通知）
   */
  async createBatch(userIds: string[], notification: Omit<CreateNotificationDto, 'userId'>) {
    this.logger.log(`[批量创建通知] 用户数: ${userIds.length}, 类型: ${notification.type}`);
    
    const notifications = userIds.map(userId => ({
      userId,
      ...notification,
    }));

    return this.prisma.notification.createMany({
      data: notifications,
    });
  }

  /**
   * 获取当前用户的通知列表（分页）
   */
  async findAll(userId: string, queryDto: QueryNotificationDto): Promise<PaginatedResult<any>> {
    const { page = 1, pageSize = 20, type, isRead } = queryDto;
    const skip = (page - 1) * pageSize;

    const where: any = { userId };

    if (type) {
      where.type = type;
    }

    if (isRead !== undefined) {
      where.isRead = isRead;
    }

    this.logger.log(`[查询通知列表] 查询参数: ${JSON.stringify({ userId, page, pageSize, type, isRead: isRead, isReadType: typeof isRead })}`);
    this.logger.log(`[查询通知列表] WHERE条件: ${JSON.stringify(where)}`);

    const [items, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where }),
    ]);

    this.logger.log(`[查询通知列表] 用户: ${userId}, 总数: ${total}, 返回: ${items.length}条, 未读: ${items.filter(n => !n.isRead).length}条, 已读: ${items.filter(n => n.isRead).length}条`);

    return new PaginatedResult(items, total, page, pageSize);
  }

  /**
   * 获取通知详情
   */
  async findOne(id: string, userId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!notification) {
      throw new NotFoundException('通知不存在');
    }

    // 如果未读，自动标记为已读
    if (!notification.isRead) {
      await this.markAsRead(userId, { ids: [id], isRead: true });
      notification.isRead = true;
      notification.readAt = new Date();
    }

    return notification;
  }

  /**
   * 获取未读消息数量
   */
  async getUnreadCount(userId: string): Promise<number> {
    const count = await this.prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });

    this.logger.log(`[查询未读数] 用户: ${userId}, 未读: ${count}`);
    return count;
  }

  /**
   * 标记为已读/未读
   */
  async markAsRead(userId: string, markReadDto: MarkReadDto) {
    const { ids, isRead = true } = markReadDto;

    const where: any = { userId };

    // 如果传了 ids，则只标记指定的通知
    if (ids && ids.length > 0) {
      where.id = { in: ids };
    }

    const result = await this.prisma.notification.updateMany({
      where,
      data: {
        isRead,
        readAt: isRead ? new Date() : null,
      },
    });

    this.logger.log(`[标记已读] 用户: ${userId}, 数量: ${result.count}, 状态: ${isRead ? '已读' : '未读'}`);

    return {
      success: true,
      count: result.count,
      message: isRead ? '已标记为已读' : '已标记为未读',
    };
  }

  /**
   * 删除通知
   */
  async remove(id: string, userId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!notification) {
      throw new NotFoundException('通知不存在');
    }

    await this.prisma.notification.delete({
      where: { id },
    });

    this.logger.log(`[删除通知] 用户: ${userId}, 通知ID: ${id}`);

    return { success: true, message: '删除成功' };
  }

  /**
   * 清空已读通知
   */
  async clearRead(userId: string) {
    const result = await this.prisma.notification.deleteMany({
      where: {
        userId,
        isRead: true,
      },
    });

    this.logger.log(`[清空已读] 用户: ${userId}, 数量: ${result.count}`);

    return {
      success: true,
      count: result.count,
      message: '已清空已读通知',
    };
  }
}

