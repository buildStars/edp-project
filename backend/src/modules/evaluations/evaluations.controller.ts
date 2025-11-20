import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, HttpCode, Header } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EvaluationsService } from './evaluations.service';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('评价')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('evaluations')
export class EvaluationsController {
  constructor(private readonly evaluationsService: EvaluationsService) {}

  @Post()
  @HttpCode(200)
  @ApiOperation({ summary: '创建评价' })
  async create(
    @CurrentUser('id') userId: string,
    @Body() createEvaluationDto: CreateEvaluationDto,
  ) {
    return this.evaluationsService.create(userId, createEvaluationDto);
  }

  @Get('my')
  @ApiOperation({ summary: '获取我的评价列表' })
  async getMyEvaluations(@CurrentUser('id') userId: string) {
    return this.evaluationsService.getMyEvaluations(userId);
  }

  @Get('course/:courseId')
  @ApiOperation({ summary: '获取课程评价列表' })
  async getCourseEvaluations(@Param('courseId') courseId: string) {
    return this.evaluationsService.getCourseEvaluations(courseId);
  }

  @Get('course/:courseId/stats')
  @ApiOperation({ summary: '获取课程评价统计' })
  async getCourseEvaluationStats(@Param('courseId') courseId: string) {
    return this.evaluationsService.getCourseEvaluationStats(courseId);
  }

  @Get('course/:courseId/my')
  @Header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  @Header('Pragma', 'no-cache')
  @Header('Expires', '0')
  @ApiOperation({ summary: '获取我对课程的评价' })
  async getUserCourseEvaluation(
    @CurrentUser('id') userId: string,
    @Param('courseId') courseId: string,
    @Query('chapterId') chapterId?: string,
  ) {
    return this.evaluationsService.getUserCourseEvaluation(userId, courseId, chapterId);
  }

  @Get('admin/list')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: '获取所有评价列表（管理员）' })
  async getAllEvaluations(@Query() query: any) {
    return this.evaluationsService.getAllEvaluations(query);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: '删除评价（管理员）' })
  async deleteEvaluation(@Param('id') id: string) {
    return this.evaluationsService.deleteEvaluation(id);
  }
}


