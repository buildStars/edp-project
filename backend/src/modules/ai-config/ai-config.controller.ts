import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
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

  @Get()
  @Roles('ADMIN')
  @ApiOperation({ summary: '获取 AI 配置' })
  async getConfig() {
    return this.aiConfigService.getConfig();
  }

  @Put()
  @Roles('ADMIN')
  @ApiOperation({ summary: '更新 AI 配置' })
  async updateConfig(@Body() dto: UpdateAiConfigDto) {
    return this.aiConfigService.updateConfig(dto);
  }

  @Get('test')
  @Roles('ADMIN')
  @ApiOperation({ summary: '测试 AI 配置' })
  async testConfig() {
    return this.aiConfigService.testConfig();
  }
}


