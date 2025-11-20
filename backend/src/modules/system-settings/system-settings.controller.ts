import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SystemSettingsService } from './system-settings.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { UpdateSystemConfigDto } from './dto/update-system-config.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('system-settings')
export class SystemSettingsController {
  constructor(private readonly systemSettingsService: SystemSettingsService) {}

  // ==================== 轮播图管理 ====================

  /**
   * 创建轮播图
   */
  @Post('banners')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async createBanner(@Body() dto: CreateBannerDto) {
    return this.systemSettingsService.createBanner(dto);
  }

  /**
   * 获取轮播图列表
   */
  @Get('banners')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getBanners(@Query('isActive') isActive?: string) {
    const isActiveBoolean = isActive === 'true' ? true : isActive === 'false' ? false : undefined;
    return this.systemSettingsService.getBanners(isActiveBoolean);
  }

  /**
   * 获取轮播图详情
   */
  @Get('banners/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getBannerById(@Param('id') id: string) {
    return this.systemSettingsService.getBannerById(id);
  }

  /**
   * 更新轮播图
   */
  @Put('banners/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async updateBanner(@Param('id') id: string, @Body() dto: UpdateBannerDto) {
    return this.systemSettingsService.updateBanner(id, dto);
  }

  /**
   * 删除轮播图
   */
  @Delete('banners/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async deleteBanner(@Param('id') id: string) {
    return this.systemSettingsService.deleteBanner(id);
  }

  /**
   * 更新轮播图排序
   */
  @Put('banners/sort/update')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async updateBannerSort(@Body() items: Array<{ id: string; sortOrder: number }>) {
    return this.systemSettingsService.updateBannerSort(items);
  }

  // ==================== 系统配置管理 ====================

  /**
   * 获取系统配置
   */
  @Get('config')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getSystemConfig() {
    return this.systemSettingsService.getSystemConfig();
  }

  /**
   * 更新系统配置
   */
  @Put('config')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async updateSystemConfig(@Body() dto: UpdateSystemConfigDto) {
    return this.systemSettingsService.updateSystemConfig(dto);
  }

  /**
   * 获取公开系统配置（无需登录，供小程序端使用）
   */
  @Get('config/public')
  async getPublicConfig() {
    return this.systemSettingsService.getPublicConfig();
  }
}

