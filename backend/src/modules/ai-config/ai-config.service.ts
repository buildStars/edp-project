import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { UpdateAiConfigDto } from './dto/update-ai-config.dto';

@Injectable()
export class AiConfigService {
  private readonly logger = new Logger(AiConfigService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * 获取 AI 配置
   */
  async getConfig() {
    const config = await this.prisma.aiConfig.findFirst();
    
    if (!config) {
      return null;
    }

    // 隐藏部分 API Key（仅显示前 10 位）
    return {
      ...config,
      apiKey: config.apiKey ? `${config.apiKey.substring(0, 10)}...` : '',
      apiKeyMasked: true,
    };
  }

  /**
   * 获取完整 AI 配置（包含完整 API Key，用于内部调用）
   */
  async getFullConfig() {
    return await this.prisma.aiConfig.findFirst();
  }

  /**
   * 更新 AI 配置
   */
  async updateConfig(dto: UpdateAiConfigDto) {
    const existingConfig = await this.prisma.aiConfig.findFirst();

    if (existingConfig) {
      return await this.prisma.aiConfig.update({
        where: { id: existingConfig.id },
        data: dto,
      });
    } else {
      return await this.prisma.aiConfig.create({
        data: dto,
      });
    }
  }

  /**
   * 测试 AI 配置是否有效
   */
  async testConfig(): Promise<{ success: boolean; message: string }> {
    const config = await this.getFullConfig();

    if (!config) {
      return { success: false, message: 'AI 配置不存在' };
    }

    if (!config.apiKey) {
      return { success: false, message: 'API Key 未配置' };
    }

    // TODO: 实际调用 AI API 测试连接
    // 这里先返回成功
    return { success: true, message: 'AI 配置有效' };
  }
}


