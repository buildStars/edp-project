import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CreditsService } from './credits.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('学分')
@Controller('credits')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CreditsController {
  constructor(private readonly creditsService: CreditsService) {}

  // ========== 用户端接口 ==========

  @Get('my')
  @ApiOperation({ summary: '获取我的学分' })
  async getMyCredits(@CurrentUser() user: any) {
    return this.creditsService.getMyCredits(user.id);
  }

  // ========== 管理后台接口 ==========

  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @Get()
  @ApiOperation({ summary: '获取学分列表（管理端）' })
  async findAll(@Query() query: any) {
    return this.creditsService.findAll(query);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @Post('allocate')
  @ApiOperation({ summary: '充值学分（管理端）' })
  async allocate(@Body() data: any) {
    return this.creditsService.allocate(data);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @Post('deduct')
  @ApiOperation({ summary: '扣除学分（管理端）' })
  async deduct(@Body() data: { userId: string; amount: number; remark?: string }) {
    return this.creditsService.deduct(data.userId, data.amount, data.remark);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @Get('records')
  @ApiOperation({ summary: '获取学分使用记录（管理端）' })
  async getRecords(@Query() query: any) {
    return this.creditsService.getRecords(query);
  }
}

