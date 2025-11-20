import { Controller, Post, Get, Put, Body, Param, Query, UseGuards, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EnrollmentsService } from './enrollments.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('报名')
@Controller('enrollments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  // ========== 用户端接口 ==========

  @Post('enroll')
  @HttpCode(200)
  @ApiOperation({ summary: '报名课程' })
  async enroll(@CurrentUser() user: any, @Body() body: { courseId: string }) {
    return this.enrollmentsService.enroll(user.id, body.courseId);
  }

  @Post('apply-trial')
  @HttpCode(200)
  @ApiOperation({ summary: '申请试听' })
  async applyTrial(@CurrentUser() user: any, @Body() body: any) {
    return this.enrollmentsService.applyTrial(user.id, body.courseId, body);
  }

  @Post('checkin')
  @HttpCode(200)
  @ApiOperation({ summary: '签到' })
  async checkIn(@CurrentUser() user: any, @Body() body: { courseId: string }) {
    return this.enrollmentsService.checkIn(user.id, body.courseId);
  }

  @Post('evaluate')
  @HttpCode(200)
  @ApiOperation({ summary: '评价' })
  async evaluate(@CurrentUser() user: any, @Body() body: { courseId: string; rating: number }) {
    return this.enrollmentsService.evaluate(user.id, body.courseId, body.rating);
  }

  @Get('my')
  @ApiOperation({ summary: '我的课程' })
  async getMyCourses(@CurrentUser() user: any, @Query('status') status: string) {
    return this.enrollmentsService.getMyCourses(user.id, status);
  }

  @Get('completion-poster/:courseId')
  @ApiOperation({ summary: '获取结课海报' })
  async getCompletionPoster(@CurrentUser() user: any, @Param('courseId') courseId: string) {
    return this.enrollmentsService.getCompletionPoster(user.id, courseId);
  }

  @Get('check-new-posters')
  @ApiOperation({ summary: '检查新的结课海报' })
  async checkNewCompletionPosters(@CurrentUser() user: any) {
    return this.enrollmentsService.checkNewCompletionPosters(user.id);
  }

  // ========== 管理后台接口 ==========

  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'STAFF', 'TEACHER')
  @Get()
  @ApiOperation({ summary: '获取报名列表（管理端）' })
  async findAll(@Query() query: any, @CurrentUser() user: any) {
    // 如果是教师，只返回自己课程的报名记录
    if (user.role === 'TEACHER') {
      return this.enrollmentsService.findTeacherEnrollments(user.id, query);
    }
    return this.enrollmentsService.findAll(query);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'STAFF', 'TEACHER')
  @Get('trials')
  @ApiOperation({ summary: '获取试听申请列表（管理端/教师）' })
  async getTrials(@Query() query: any, @CurrentUser() user: any) {
    return this.enrollmentsService.getTrials(query, user);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'STAFF', 'TEACHER')
  @Put(':id/trial-status')
  @ApiOperation({ summary: '审核试听申请（管理端/教师）' })
  async updateTrialStatus(
    @Param('id') id: string,
    @Body() body: { status: string; rejectReason?: string },
    @CurrentUser() user: any,
  ) {
    return this.enrollmentsService.updateTrialStatus(id, body.status, body.rejectReason, user);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @Get('checkins')
  @ApiOperation({ summary: '获取签到记录（管理端）' })
  async getCheckIns(@Query() query: any) {
    return this.enrollmentsService.getCheckIns(query);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @Get('evaluations')
  @ApiOperation({ summary: '获取评价列表（管理端）' })
  async getEvaluations(@Query() query: any) {
    return this.enrollmentsService.getEvaluations(query);
  }
}

