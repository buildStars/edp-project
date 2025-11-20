import { Controller, Get, Post, Delete, Body, Param, UseGuards, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CheckinService } from './checkin.service';
import { StartCheckinDto } from './dto/start-checkin.dto';
import { CheckinByCodeDto, CheckinByQRCodeDto } from './dto/checkin-by-code.dto';
import { MakeupCheckinDto, BatchMakeupCheckinDto } from './dto/makeup-checkin.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('签到')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('checkin')
export class CheckinController {
  constructor(private readonly checkinService: CheckinService) {}

  // ========== 教师/管理员接口 ==========

  @Post('courses/:courseId/start')
  @HttpCode(200)
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'STAFF', 'TEACHER')
  @ApiOperation({ summary: '开启签到（教师/管理员）' })
  async startCheckin(
    @Param('courseId') courseId: string,
    @Body() dto: StartCheckinDto,
  ) {
    return this.checkinService.startCheckin(courseId, dto);
  }

  @Delete('courses/:courseId/sessions/:sessionId')
  @HttpCode(200)
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'STAFF', 'TEACHER')
  @ApiOperation({ summary: '结束签到（教师/管理员）' })
  async stopCheckin(
    @Param('courseId') courseId: string,
    @Param('sessionId') sessionId: string,
  ) {
    return this.checkinService.stopCheckin(courseId, sessionId);
  }

  @Get('courses/:courseId/sessions/:sessionId/statistics')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'STAFF', 'TEACHER')
  @ApiOperation({ summary: '获取签到统计（教师/管理员）' })
  async getStatistics(
    @Param('courseId') courseId: string,
    @Param('sessionId') sessionId: string,
  ) {
    return this.checkinService.getStatistics(courseId, sessionId);
  }

  @Get('courses/:courseId/active-session-admin')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'STAFF', 'TEACHER')
  @ApiOperation({ summary: '获取课程活跃签到会话（管理员）' })
  async getActiveSessionAdmin(
    @Param('courseId') courseId: string,
  ) {
    return this.checkinService.getActiveSessionAdmin(courseId);
  }

  @Get('courses/:courseId/history')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'STAFF', 'TEACHER')
  @ApiOperation({ summary: '获取课程历史签到记录（教师/管理员）' })
  async getCheckinHistory(
    @Param('courseId') courseId: string,
  ) {
    return this.checkinService.getCheckinHistory(courseId);
  }

  @Post('courses/:courseId/sessions/:sessionId/makeup')
  @HttpCode(200)
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'STAFF', 'TEACHER')
  @ApiOperation({ summary: '补签（教师/管理员）' })
  async makeupCheckin(
    @Param('courseId') courseId: string,
    @Param('sessionId') sessionId: string,
    @CurrentUser('id') adminUserId: string,
    @Body() dto: MakeupCheckinDto,
  ) {
    return this.checkinService.makeupCheckin(
      courseId,
      sessionId,
      dto.userId,
      adminUserId,
      dto.reason,
    );
  }

  @Post('courses/:courseId/sessions/:sessionId/batch-makeup')
  @HttpCode(200)
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'STAFF', 'TEACHER')
  @ApiOperation({ summary: '批量补签（教师/管理员）' })
  async batchMakeupCheckin(
    @Param('courseId') courseId: string,
    @Param('sessionId') sessionId: string,
    @CurrentUser('id') adminUserId: string,
    @Body() dto: BatchMakeupCheckinDto,
  ) {
    return this.checkinService.batchMakeupCheckin(
      courseId,
      sessionId,
      dto.userIds,
      adminUserId,
      dto.reason,
    );
  }

  // ========== 学员接口 ==========

  @Get('courses/:courseId/active-session')
  @ApiOperation({ summary: '获取活跃签到会话（学员）' })
  async getActiveSession(
    @Param('courseId') courseId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.checkinService.getActiveSession(courseId, userId);
  }

  @Post('by-code')
  @HttpCode(200)
  @ApiOperation({ summary: '签到码签到（学员）' })
  async checkinByCode(
    @CurrentUser('id') userId: string,
    @Body() dto: CheckinByCodeDto,
  ) {
    return this.checkinService.checkinByCode(userId, dto);
  }

  @Post('by-qrcode')
  @HttpCode(200)
  @ApiOperation({ summary: '二维码签到（学员）' })
  async checkinByQRCode(
    @CurrentUser('id') userId: string,
    @Body() dto: CheckinByQRCodeDto,
  ) {
    return this.checkinService.checkinByQRCode(userId, dto);
  }

  @Get('my-records')
  @ApiOperation({ summary: '获取我的签到记录（学员）' })
  async getMyCheckinRecords(
    @CurrentUser('id') userId: string,
  ) {
    return this.checkinService.getMyCheckinRecords(userId);
  }
}

