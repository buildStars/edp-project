import { Controller, Get, Post, Put, Delete, Query, Param, Body, UseGuards, NotFoundException, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NewsService } from './news.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Public } from '../../../common/decorators/public.decorator';

@ApiTags('资讯')
@Controller('news')
@UseGuards(JwtAuthGuard)
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: '获取资讯列表' })
  async findAll(@Query() query: any, @CurrentUser() user: any) {
    return this.newsService.findAll(query, user?.id);
  }

  // 用户收藏相关接口（必须放在 :id 之前）
  @UseGuards(JwtAuthGuard)
  @Get('my-collection')
  @ApiBearerAuth()
  @ApiOperation({ summary: '我的收藏' })
  async getMyCollection(@CurrentUser() user: any, @Query() query: any) {
    return this.newsService.getMyCollection(user.id, query);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: '获取资讯详情' })
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    const news = await this.newsService.findOne(id, user?.id);
    if (!news) {
      throw new NotFoundException('资讯不存在');
    }
    return news;
  }

  // ========== 用户端接口（必须放在管理端的 :id 路由之前） ==========

  @Post('collect')
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiOperation({ summary: '收藏资讯' })
  async collect(@CurrentUser() user: any, @Body('newsId') newsId: string) {
    return this.newsService.collect(user.id, newsId);
  }

  @Delete('collect')
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiOperation({ summary: '取消收藏' })
  async uncollect(@CurrentUser() user: any, @Body('newsId') newsId: string) {
    return this.newsService.uncollect(user.id, newsId);
  }

  // ========== 管理后台接口 ==========

  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建资讯（管理端）' })
  async create(@CurrentUser() user: any, @Body() data: any) {
    return this.newsService.create({
      ...data,
      createdBy: user.id,
    });
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @Post('batch-delete')
  @ApiBearerAuth()
  @ApiOperation({ summary: '批量删除资讯（管理端）' })
  async batchDelete(@Body() body: { ids: string[] }) {
    return this.newsService.batchDelete(body.ids);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新资讯（管理端）' })
  async update(@Param('id') id: string, @Body() data: any) {
    return this.newsService.update(id, data);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @Put(':id/top')
  @ApiBearerAuth()
  @ApiOperation({ summary: '置顶/取消置顶资讯（管理端）' })
  async toggleTop(@Param('id') id: string, @Body() body: { isTop: boolean }) {
    return this.newsService.toggleTop(id, body.isTop);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @Put(':id/publish')
  @ApiBearerAuth()
  @ApiOperation({ summary: '发布资讯（管理端）' })
  async publish(@Param('id') id: string) {
    return this.newsService.updateStatus(id, 'PUBLISHED');
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @Put(':id/archive')
  @ApiBearerAuth()
  @ApiOperation({ summary: '归档资讯（管理端）' })
  async archive(@Param('id') id: string) {
    return this.newsService.updateStatus(id, 'ARCHIVED');
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除资讯（管理端）' })
  async remove(@Param('id') id: string) {
    return this.newsService.remove(id);
  }
}

