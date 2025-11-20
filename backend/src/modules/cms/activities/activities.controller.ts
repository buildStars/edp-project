import { Controller, Get, Post, Put, Delete, Query, Param, Body, UseGuards, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ActivitiesService } from './activities.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Public } from '../../../common/decorators/public.decorator';

@ApiTags('活动')
@Controller('activities')
@UseGuards(JwtAuthGuard)
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: '获取活动列表' })
  async findAll(@Query() query: any, @CurrentUser() user: any) {
    return this.activitiesService.findAll(query, user?.id);
  }

  // ========== 用户端接口（必须放在管理端的 :id 路由之前） ==========

  @Post('like')
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiOperation({ summary: '点赞活动' })
  async like(@CurrentUser() user: any, @Body('activityId') activityId: string) {
    return this.activitiesService.like(user.id, activityId);
  }

  @Delete('like')
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiOperation({ summary: '取消点赞' })
  async unlike(@CurrentUser() user: any, @Body('activityId') activityId: string) {
    return this.activitiesService.unlike(user.id, activityId);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: '获取活动详情' })
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.activitiesService.findOne(id, user?.id);
  }

  // ========== 管理后台接口 ==========

  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建活动（管理端）' })
  async create(@Body() data: any) {
    return this.activitiesService.create(data);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新活动（管理端）' })
  async update(@Param('id') id: string, @Body() data: any) {
    return this.activitiesService.update(id, data);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除活动（管理端）' })
  async remove(@Param('id') id: string) {
    return this.activitiesService.remove(id);
  }
}

