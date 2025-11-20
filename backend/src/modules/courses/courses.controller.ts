import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { QueryCourseDto } from './dto/query-course.dto';
import { ApproveCourseDto } from './dto/approve-course.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('课程')
@Controller('courses')
@UseGuards(JwtAuthGuard)
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: '获取课程列表' })
  async findAll(@Query() query: QueryCourseDto, @CurrentUser() user: any) {
    // 如果是教师，只返回自己的课程
    if (user?.role === 'TEACHER') {
      query.teacherId = user.id;
    }
    return this.coursesService.findAll(query, user?.id);
  }

  @Public()
  @Get(':id/materials')
  @ApiOperation({ summary: '获取课程课件列表' })
  async getCourseMaterials(
    @Param('id') id: string,
    @Query('chapterId') chapterId?: string,
  ) {
    return this.coursesService.getCourseMaterials(id, chapterId);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: '获取课程详情' })
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    // 增加浏览量
    await this.coursesService.incrementViews(id);
    return this.coursesService.findOne(id, user?.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF', 'TEACHER')
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建课程' })
  async create(@Body() createCourseDto: CreateCourseDto, @CurrentUser() user: any) {
    return this.coursesService.create(createCourseDto, user);
  }

  // ⚠️ 注意：具体路由必须放在通配符路由(:id)之前
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @Put(':id/assign-teacher')
  @ApiBearerAuth()
  @ApiOperation({ summary: '分配老师到课程（管理端）' })
  async assignTeacher(
    @Param('id') id: string,
    @Body() body: { teacherId: string; teacherName: string; teacherAvatar?: string },
  ) {
    return this.coursesService.assignTeacher(id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF', 'TEACHER')
  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新课程' })
  async update(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
    @CurrentUser() user: any,
  ) {
    return this.coursesService.update(id, updateCourseDto, user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除课程（管理端）' })
  async remove(@Param('id') id: string) {
    return this.coursesService.remove(id);
  }

  // ========== 管理后台接口 ==========

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @Post('batch-delete')
  @ApiBearerAuth()
  @ApiOperation({ summary: '批量删除课程（管理端）' })
  async batchDelete(@Body() body: { ids: string[] }) {
    return this.coursesService.batchDelete(body.ids);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post(':id/approve')
  @ApiBearerAuth()
  @ApiOperation({ summary: '审批课程（管理端 - 旧接口，兼容性保留）' })
  async approve(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() body: { action: 'approve' | 'reject'; reason?: string },
  ) {
    return this.coursesService.approveCourse(id, body.action, user.id, body.reason);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TEACHER', 'ADMIN')
  @Post(':id/submit-approval')
  @ApiBearerAuth()
  @ApiOperation({ summary: '提交课程审批（教师）', description: '教师将草稿课程提交审批' })
  async submitForApproval(@Param('id') id: string, @CurrentUser() user: any) {
    return this.coursesService.submitForApproval(id, user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @Post(':id/review')
  @ApiBearerAuth()
  @ApiOperation({ summary: '审批课程（管理员/教务）', description: '管理员或教务人员审批待审核的课程' })
  async reviewCourse(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: ApproveCourseDto,
  ) {
    return this.coursesService.reviewCourse(
      id,
      dto.action === 'APPROVE' ? 'APPROVE' : 'REJECT',
      user.id,
      dto.remark,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @Put(':id/enroll-status')
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新报名状态（管理端）' })
  async updateEnrollStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.coursesService.updateEnrollStatus(id, body.status);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @Put(':id/publish')
  @ApiBearerAuth()
  @ApiOperation({ summary: '发布课程（管理端）' })
  async publish(@Param('id') id: string) {
    return this.coursesService.publishCourse(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @Put(':id/archive')
  @ApiBearerAuth()
  @ApiOperation({ summary: '归档课程（管理端）' })
  async archive(@Param('id') id: string) {
    return this.coursesService.archiveCourse(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TEACHER')
  @Post(':id/submit-approval')
  @ApiBearerAuth()
  @ApiOperation({ summary: '提交课程审批' })
  async submitApproval(@Param('id') id: string, @CurrentUser() user: any) {
    return this.coursesService.submitApproval(id, user.id);
  }
}

