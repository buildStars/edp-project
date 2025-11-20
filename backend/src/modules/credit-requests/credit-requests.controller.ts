import {
  Controller,
  Get,
  Post,
  Patch,
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
import { CreditRequestsService } from './credit-requests.service';
import { CreateCreditRequestDto } from './dto/create-credit-request.dto';
import { QueryCreditRequestDto } from './dto/query-credit-request.dto';
import { ReviewCreditRequestDto } from './dto/review-credit-request.dto';

/**
 * 学分申请控制器
 * 处理教师申请学分和管理员审批的相关接口
 */
@ApiTags('学分申请管理')
@Controller('credit-requests')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CreditRequestsController {
  constructor(private readonly creditRequestsService: CreditRequestsService) {}

  /**
   * 创建学分申请（教师专用）
   */
  @Post()
  @Roles('TEACHER', 'ADMIN')
  @ApiOperation({ summary: '创建学分申请', description: '教师为学员申请学分' })
  @ApiResponse({ status: 201, description: '创建成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 404, description: '目标用户不存在' })
  async create(@Request() req, @Body() dto: CreateCreditRequestDto) {
    return this.creditRequestsService.create(req.user.id, dto);
  }

  /**
   * 查询学分申请列表
   */
  @Get()
  @Roles('TEACHER', 'ADMIN', 'STAFF')
  @ApiOperation({ summary: '查询学分申请列表', description: '根据角色权限查看申请列表' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async findAll(@Request() req, @Query() query: QueryCreditRequestDto) {
    return this.creditRequestsService.findAll(
      req.user.id,
      req.user.role,
      query,
    );
  }

  /**
   * 获取统计数据
   */
  @Get('statistics')
  @Roles('TEACHER', 'ADMIN', 'STAFF')
  @ApiOperation({ summary: '获取学分申请统计', description: '获取各状态的申请数量' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async getStatistics(@Request() req) {
    return this.creditRequestsService.getStatistics(
      req.user.id,
      req.user.role,
    );
  }

  /**
   * 获取单个学分申请详情
   */
  @Get(':id')
  @Roles('TEACHER', 'ADMIN', 'STAFF')
  @ApiOperation({ summary: '获取学分申请详情' })
  @ApiResponse({ status: 200, description: '查询成功' })
  @ApiResponse({ status: 404, description: '申请不存在' })
  async findOne(@Param('id') id: string, @Request() req) {
    return this.creditRequestsService.findOne(
      id,
      req.user.id,
      req.user.role,
    );
  }

  /**
   * 审批学分申请（管理员/教务专用）
   */
  @Patch(':id/review')
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: '审批学分申请', description: '管理员或教务人员审批学分申请' })
  @ApiResponse({ status: 200, description: '审批成功' })
  @ApiResponse({ status: 400, description: '申请已被处理或参数错误' })
  @ApiResponse({ status: 404, description: '申请不存在' })
  async review(
    @Param('id') id: string,
    @Request() req,
    @Body() dto: ReviewCreditRequestDto,
  ) {
    return this.creditRequestsService.review(id, req.user.id, dto);
  }

  /**
   * 取消学分申请（教师专用）
   */
  @Patch(':id/cancel')
  @Roles('TEACHER', 'ADMIN')
  @ApiOperation({ summary: '取消学分申请', description: '教师取消自己提交的待审批申请' })
  @ApiResponse({ status: 200, description: '取消成功' })
  @ApiResponse({ status: 400, description: '只能取消待审批的申请' })
  @ApiResponse({ status: 404, description: '申请不存在' })
  async cancel(@Param('id') id: string, @Request() req) {
    return this.creditRequestsService.cancel(id, req.user.id);
  }
}


