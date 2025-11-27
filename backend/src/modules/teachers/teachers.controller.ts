import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TeachersService } from './teachers.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('教师管理')
@Controller('teachers')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Get('my-courses')
  @Roles('TEACHER', 'ADMIN', 'STAFF')
  @ApiOperation({ summary: '获取教师的课程列表' })
  async getMyCourses(@CurrentUser() user: any) {
    return this.teachersService.getMyCourses(user.id);
  }

  @Get('my-students')
  @Roles('TEACHER', 'ADMIN', 'STAFF')
  @ApiOperation({ summary: '获取教师的学员列表' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  @ApiQuery({ name: 'keyword', required: false })
  async getMyStudents(@CurrentUser() user: any, @Query() query: any) {
    return this.teachersService.getMyStudents(user.id, query);
  }

  @Get('courses/:id/students')
  @Roles('TEACHER', 'ADMIN', 'STAFF')
  @ApiOperation({ summary: '获取某个课程的学员列表' })
  async getCourseStudents(@CurrentUser() user: any, @Param('id') courseId: string) {
    return this.teachersService.getCourseStudents(user.id, courseId);
  }

  @Get('courses/:id/checkin-stats')
  @Roles('TEACHER', 'ADMIN', 'STAFF')
  @ApiOperation({ summary: '获取课程签到统计' })
  async getCourseCheckinStats(@CurrentUser() user: any, @Param('id') courseId: string) {
    return this.teachersService.getCourseCheckinStats(user.id, courseId);
  }

  @Get('courses/:id/evaluation-stats')
  @Roles('TEACHER', 'ADMIN', 'STAFF')
  @ApiOperation({ summary: '获取课程评价统计' })
  async getCourseEvaluationStats(
    @CurrentUser() user: any,
    @Param('id') courseId: string,
  ) {
    return this.teachersService.getCourseEvaluationStats(user.id, courseId);
  }
}











