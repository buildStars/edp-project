import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { UpdateSystemConfigDto } from './dto/update-system-config.dto';

@Injectable()
export class SystemSettingsService {
  constructor(private prisma: PrismaService) {}

  // ==================== 轮播图管理 ====================

  /**
   * 创建轮播图
   */
  async createBanner(dto: CreateBannerDto) {
    return this.prisma.banner.create({
      data: dto,
    });
  }

  /**
   * 获取轮播图列表
   */
  async getBanners(isActive?: boolean) {
    const where: any = {};
    
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    return this.prisma.banner.findMany({
      where,
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'desc' },
      ],
    });
  }

  /**
   * 获取轮播图详情
   */
  async getBannerById(id: string) {
    const banner = await this.prisma.banner.findUnique({
      where: { id },
    });

    if (!banner) {
      throw new NotFoundException('轮播图不存在');
    }

    return banner;
  }

  /**
   * 更新轮播图
   */
  async updateBanner(id: string, dto: UpdateBannerDto) {
    // 验证轮播图是否存在
    await this.getBannerById(id);

    return this.prisma.banner.update({
      where: { id },
      data: dto,
    });
  }

  /**
   * 删除轮播图
   */
  async deleteBanner(id: string) {
    // 验证轮播图是否存在
    await this.getBannerById(id);

    await this.prisma.banner.delete({
      where: { id },
    });

    return { message: '删除成功' };
  }

  /**
   * 更新轮播图排序
   */
  async updateBannerSort(items: Array<{ id: string; sortOrder: number }>) {
    await Promise.all(
      items.map((item) =>
        this.prisma.banner.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        }),
      ),
    );

    return { message: '排序更新成功' };
  }

  // ==================== 系统配置管理 ====================

  /**
   * 获取系统配置
   */
  async getSystemConfig() {
    // 系统配置只有一条记录，如果不存在则创建
    let config = await this.prisma.systemConfig.findFirst();

    if (!config) {
      config = await this.prisma.systemConfig.create({
        data: {
          appName: '北大汇丰EDP',
        },
      });
    }

    return config;
  }

  /**
   * 更新系统配置
   */
  async updateSystemConfig(dto: UpdateSystemConfigDto) {
    let config = await this.prisma.systemConfig.findFirst();

    if (!config) {
      // 如果不存在则创建
      config = await this.prisma.systemConfig.create({
        data: dto,
      });
    } else {
      // 如果存在则更新
      config = await this.prisma.systemConfig.update({
        where: { id: config.id },
        data: dto,
      });
    }

    return config;
  }

  /**
   * 获取公开系统配置（供小程序端使用，不需要登录）
   */
  async getPublicConfig() {
    const config = await this.getSystemConfig();

    // 只返回公开信息
    return {
      appName: config.appName,
      appLogo: config.appLogo,
      appDesc: config.appDesc,
      aboutUs: config.aboutUs,
      contactPhone: config.contactPhone,
      contactEmail: config.contactEmail,
      contactAddress: config.contactAddress,
      wechatQrCode: config.wechatQrCode,
      weiboUrl: config.weiboUrl,
      appVersion: config.appVersion,
      isMaintenance: config.isMaintenance,
      maintenanceMsg: config.maintenanceMsg,
    };
  }
}

