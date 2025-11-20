import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TeacherStudentsService } from './teacher-students.service';
import { BindStudentDto } from './dto/bind-student.dto';
import { RegisterStudentDto } from './dto/register-student.dto';
import { QueryTeacherStudentDto } from './dto/query-teacher-student.dto';

/**
 * 教师学员管理控制器
 * 处理教师注册学员和管理师生关系的接口
 */
@ApiTags('教师学员管理')
@Controller('teacher-students')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class TeacherStudentsController {
  constructor(private readonly teacherStudentsService: TeacherStudentsService) {}

  /**
   * 教师注册新学员
   */
  @Post('register')
  @Roles('TEACHER', 'ADMIN')
  @ApiOperation({ summary: '注册新学员', description: '教师为新学员创建账户并自动绑定关系' })
  @ApiResponse({ status: 201, description: '注册成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 409, description: '手机号已存在' })
  async registerStudent(@Request() req, @Body() dto: RegisterStudentDto) {
    return this.teacherStudentsService.registerStudent(req.user.userId, dto);
  }

  /**
   * 绑定已有学员
   */
  @Post('bind')
  @Roles('TEACHER', 'ADMIN')
  @ApiOperation({ summary: '绑定已有学员', description: '教师绑定系统中已存在的学员' })
  @ApiResponse({ status: 201, description: '绑定成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 404, description: '学员不存在' })
  @ApiResponse({ status: 409, description: '已绑定该学员' })
  async bindStudent(@Request() req, @Body() dto: BindStudentDto) {
    return this.teacherStudentsService.bindStudent(req.user.userId, dto);
  }

  /**
   * 查询师生关系列表
   */
  @Get()
  @Roles('TEACHER', 'ADMIN', 'STAFF')
  @ApiOperation({ summary: '查询师生关系列表', description: '根据角色权限查看师生关系' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async findAll(@Request() req, @Query() query: QueryTeacherStudentDto) {
    return this.teacherStudentsService.findAll(
      req.user.userId,
      req.user.role,
      query,
    );
  }

  /**
   * 获取教师的学员统计
   */
  @Get('statistics')
  @Roles('TEACHER', 'ADMIN', 'STAFF')
  @ApiOperation({ summary: '获取学员统计', description: '获取教师的学员数量统计' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async getStatistics(@Request() req) {
    const teacherId = req.user.role === 'TEACHER' ? req.user.userId : req.query.teacherId;
    if (!teacherId) {
      return { total: 0, active: 0, inactive: 0 };
    }
    return this.teacherStudentsService.getStatistics(teacherId);
  }

  /**
   * 获取单个师生关系详情
   */
  @Get(':id')
  @Roles('TEACHER', 'ADMIN', 'STAFF')
  @ApiOperation({ summary: '获取师生关系详情' })
  @ApiResponse({ status: 200, description: '查询成功' })
  @ApiResponse({ status: 404, description: '师生关系不存在' })
  async findOne(@Param('id') id: string, @Request() req) {
    return this.teacherStudentsService.findOne(
      id,
      req.user.userId,
      req.user.role,
    );
  }

  /**
   * 解绑学员
   */
  @Delete(':id')
  @Roles('TEACHER', 'ADMIN')
  @ApiOperation({ summary: '解绑学员', description: '解除教师与学员的关系' })
  @ApiResponse({ status: 200, description: '解绑成功' })
  @ApiResponse({ status: 400, description: '权限不足' })
  @ApiResponse({ status: 404, description: '师生关系不存在' })
  async unbind(@Param('id') id: string, @Request() req) {
    return this.teacherStudentsService.unbind(
      id,
      req.user.userId,
      req.user.role,
    );
  }
}





