import { Controller, Get, Post, Body, Query, Param, UseGuards, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AchievementsService } from './achievements.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { IssueAchievementDto, BatchIssueAchievementDto } from './dto/issue-achievement.dto';
import { QueryAchievementDto } from './dto/query-achievement.dto';

@ApiTags('学习成果')
@Controller('achievements')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AchievementsController {
  constructor(private readonly achievementsService: AchievementsService) {}

  // ========== 教师接口 ==========

  @Get('courses/:courseId/students')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'STAFF', 'TEACHER')
  @ApiOperation({ summary: '获取课程学员签到情况（教师）' })
  async getCourseStudentsWithCheckins(@Param('courseId') courseId: string) {
    return this.achievementsService.getCourseStudentsWithCheckins(courseId);
  }

  @Post('issue')
  @HttpCode(200)
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'STAFF', 'TEACHER')
  @ApiOperation({ summary: '手动发放学习成果（教师）' })
  async issueAchievements(
    @CurrentUser('id') teacherId: string,
    @Body() dto: IssueAchievementDto,
  ) {
    return this.achievementsService.issueAchievements(teacherId, dto);
  }

  @Post('batch-issue')
  @HttpCode(200)
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: '批量发放学习成果（管理员）' })
  async batchIssueAchievements(
    @CurrentUser('id') issuerId: string,
    @Body() dto: BatchIssueAchievementDto,
  ) {
    return this.achievementsService.batchIssueAchievements(issuerId, dto);
  }

  // ========== 查询接口 ==========

  @Get()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'STAFF', 'TEACHER')
  @ApiOperation({ summary: '查询学习成果列表' })
  async findAll(@Query() query: QueryAchievementDto) {
    return this.achievementsService.findAll(query);
  }

  @Get('users/:userId/summary')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'STAFF', 'TEACHER', 'STUDENT')
  @ApiOperation({ summary: '获取用户学习成果统计' })
  async getUserAchievementSummary(@Param('userId') userId: string) {
    return this.achievementsService.getUserAchievementSummary(userId);
  }

  // ========== 学生端接口 ==========

  @Get('my-achievements')
  @ApiOperation({ summary: '获取我的学习成果（学生）' })
  async getMyAchievements(@CurrentUser('id') userId: string) {
    return this.achievementsService.getUserAchievementSummary(userId);
  }
}











