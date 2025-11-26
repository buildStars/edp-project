import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AiReportsService } from './ai-reports.service';
import { GenerateReportDto } from './dto/generate-report.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('AI 报告')
@Controller('ai-reports')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AiReportsController {
  constructor(private readonly aiReportsService: AiReportsService) {}

  @Post('generate')
  @ApiOperation({ summary: '生成 AI 学习报告' })
  async generateReport(@Request() req, @Body() dto: GenerateReportDto) {
    return this.aiReportsService.generateReport(req.user.id, dto);
  }

  @Get('my')
  @ApiOperation({ summary: '获取我的报告列表' })
  async getMyReports(@Request() req) {
    return this.aiReportsService.getUserReports(req.user.id);
  }

  @Get()
  @ApiOperation({ summary: '获取指定年份的报告' })
  async getReport(@Request() req, @Query('year') year: string) {
    const yearNum = parseInt(year, 10);
    return this.aiReportsService.getReport(req.user.id, yearNum);
  }
}







