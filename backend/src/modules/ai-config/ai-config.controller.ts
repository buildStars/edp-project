import { Controller, Get, Put, Body, UseGuards, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AiConfigService } from './ai-config.service';
import { UpdateAiConfigDto } from './dto/update-ai-config.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('AI 配置')
@Controller('ai-config')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AiConfigController {
  constructor(private readonly aiConfigService: AiConfigService) {}

  @Get('all')
  @Roles('ADMIN')
  @ApiOperation({ summary: '获取所有 AI 配置列表' })
  async getAllConfigs() {
    return this.aiConfigService.getAllConfigs();
  }

  @Get('test')
  @Roles('ADMIN')
  @ApiOperation({ summary: '测试当前激活的 AI 配置' })
  async testConfig() {
    return this.aiConfigService.testConfig();
  }

  @Get('by-model')
  @Roles('ADMIN')
  @ApiOperation({ summary: '根据模型名称获取配置（使用 query 参数）' })
  async getConfigByModel(@Query('model') model: string) {
    return this.aiConfigService.getConfigByModel(model);
  }

  @Get()
  @Roles('ADMIN')
  @ApiOperation({ summary: '获取当前激活的 AI 配置' })
  async getConfig() {
    return this.aiConfigService.getConfig();
  }

  @Put()
  @Roles('ADMIN')
  @ApiOperation({ summary: '更新或创建 AI 配置' })
  async updateConfig(@Body() dto: UpdateAiConfigDto) {
    return this.aiConfigService.updateConfig(dto);
  }

  @Put('test')
  @Roles('ADMIN')
  @ApiOperation({ summary: '测试指定的 AI 配置（临时测试，不保存）' })
  async testConfigWithData(@Body() dto: UpdateAiConfigDto) {
    return this.aiConfigService.testConfigWithData(dto);
  }
}






