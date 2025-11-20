import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { QueryNotificationDto } from './dto/query-notification.dto';
import { MarkReadDto } from './dto/mark-read.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('消息通知')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: '获取通知列表' })
  async findAll(
    @CurrentUser('id') userId: string,
    @Query() queryDto: QueryNotificationDto,
  ) {
    return this.notificationsService.findAll(userId, queryDto);
  }

  @Get('unread-count')
  @ApiOperation({ summary: '获取未读消息数量' })
  async getUnreadCount(@CurrentUser('id') userId: string) {
    const count = await this.notificationsService.getUnreadCount(userId);
    return { count };
  }

  @Post('mark-read')
  @HttpCode(200)
  @ApiOperation({ summary: '标记为已读/未读' })
  async markAsRead(
    @CurrentUser('id') userId: string,
    @Body() markReadDto: MarkReadDto,
  ) {
    return this.notificationsService.markAsRead(userId, markReadDto);
  }

  @Delete('clear-read')
  @HttpCode(200)
  @ApiOperation({ summary: '清空已读通知' })
  async clearRead(@CurrentUser('id') userId: string) {
    return this.notificationsService.clearRead(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取通知详情' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.notificationsService.findOne(id, userId);
  }

  @Delete(':id')
  @HttpCode(200)
  @ApiOperation({ summary: '删除通知' })
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.notificationsService.remove(id, userId);
  }
}

