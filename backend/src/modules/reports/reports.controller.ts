import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('AI报告')
@Controller('reports')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('annual-report')
  @ApiOperation({ summary: '获取年度报告' })
  async getAnnualReport(
    @CurrentUser() user: any,
    @Query('year') year?: number,
  ) {
    return this.reportsService.getAnnualReport(user.id, year);
  }
}

