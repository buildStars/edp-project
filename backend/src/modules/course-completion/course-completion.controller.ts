import { Controller, Get, Post, Put, Body, Query, Param, UseGuards, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CourseCompletionService } from './course-completion.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateCompletionRequestDto } from './dto/create-completion-request.dto';
import { ReviewCompletionRequestDto } from './dto/review-completion-request.dto';
import { QueryCompletionRequestDto } from './dto/query-completion-request.dto';

@ApiTags('结课申请')
@Controller('course-completion')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CourseCompletionController {
  constructor(private readonly courseCompletionService: CourseCompletionService) {}

  // ========== 教师接口 ==========

  @Post()
  @HttpCode(200)
  @UseGuards(RolesGuard)
  @Roles('TEACHER')
  @ApiOperation({ summary: '发起结课申请（教师）' })
  async createCompletionRequest(
    @CurrentUser('id') teacherId: string,
    @CurrentUser('realName') teacherName: string,
    @Body() dto: CreateCompletionRequestDto,
  ) {
    return this.courseCompletionService.createCompletionRequest(teacherId, teacherName, dto);
  }

  @Put(':id/cancel')
  @UseGuards(RolesGuard)
  @Roles('TEACHER')
  @ApiOperation({ summary: '取消结课申请（教师）' })
  async cancelCompletionRequest(
    @Param('id') requestId: string,
    @CurrentUser('id') teacherId: string,
  ) {
    return this.courseCompletionService.cancelCompletionRequest(requestId, teacherId);
  }

  @Post('manual-complete')
  @HttpCode(200)
  @UseGuards(RolesGuard)
  @Roles('TEACHER')
  @ApiOperation({ summary: '单独给学员发放海报（教师手动结课）' })
  async completeStudentManually(
    @CurrentUser('id') teacherId: string,
    @Body() body: { courseId: string; userId: string; remark?: string },
  ) {
    return this.courseCompletionService.completeStudentManually(
      teacherId,
      body.courseId,
      body.userId,
      body.remark,
    );
  }

  @Post('batch-complete')
  @HttpCode(200)
  @UseGuards(RolesGuard)
  @Roles('TEACHER')
  @ApiOperation({ summary: '批量给学员发放海报（教师批量操作）' })
  async completeStudentsBatch(
    @CurrentUser('id') teacherId: string,
    @Body() body: { courseId: string; userIds: string[]; remark?: string },
  ) {
    return this.courseCompletionService.completeStudentsBatch(
      teacherId,
      body.courseId,
      body.userIds,
      body.remark,
    );
  }

  // ========== 教务/管理员接口 ==========

  @Put(':id/review')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: '审批结课申请（教务/管理员）' })
  async reviewCompletionRequest(
    @Param('id') requestId: string,
    @CurrentUser('id') reviewerId: string,
    @CurrentUser('realName') reviewerName: string,
    @Body() dto: ReviewCompletionRequestDto,
  ) {
    return this.courseCompletionService.reviewCompletionRequest(requestId, reviewerId, reviewerName, dto);
  }

  // ========== 查询接口 ==========

  @Get()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'STAFF', 'TEACHER')
  @ApiOperation({ summary: '查询结课申请列表' })
  async findAll(@Query() query: QueryCompletionRequestDto) {
    return this.courseCompletionService.findAll(query);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'STAFF', 'TEACHER')
  @ApiOperation({ summary: '获取结课申请详情' })
  async findOne(@Param('id') id: string) {
    return this.courseCompletionService.findOne(id);
  }
}


