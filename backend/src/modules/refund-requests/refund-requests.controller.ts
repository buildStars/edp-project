import { Controller, Get, Post, Body, Param, Query, Delete, UseGuards, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RefundRequestsService } from './refund-requests.service';
import { CreateRefundRequestDto } from './dto/create-refund-request.dto';
import { ReviewRefundRequestDto } from './dto/review-refund-request.dto';
import { QueryRefundRequestDto } from './dto/query-refund-request.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('退课申请')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('refund-requests')
export class RefundRequestsController {
  constructor(private readonly refundRequestsService: RefundRequestsService) {}

  @Post()
  @HttpCode(200)
  @ApiOperation({ summary: '创建退课申请（开课前三天以上）' })
  async create(
    @CurrentUser('id') userId: string,
    @Body() createDto: CreateRefundRequestDto,
  ) {
    return this.refundRequestsService.create(userId, createDto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'STAFF', 'TEACHER')
  @ApiOperation({ summary: '获取退课申请列表（管理员/教师）' })
  async findAll(@Query() query: QueryRefundRequestDto, @CurrentUser() user: any) {
    return this.refundRequestsService.findAll(query, user);
  }

  @Get('my')
  @ApiOperation({ summary: '获取我的退课申请' })
  async findMyRequests(
    @CurrentUser('id') userId: string,
    @Query() query: QueryRefundRequestDto,
  ) {
    return this.refundRequestsService.findMyRequests(userId, query);
  }

  @Post(':id/review')
  @HttpCode(200)
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'STAFF', 'TEACHER')
  @ApiOperation({ summary: '审批退课申请（管理员/教师）' })
  async review(
    @Param('id') id: string,
    @CurrentUser('id') adminUserId: string,
    @Body() reviewDto: ReviewRefundRequestDto,
    @CurrentUser() user: any,
  ) {
    return this.refundRequestsService.review(id, adminUserId, reviewDto, user);
  }

  @Delete(':id')
  @HttpCode(200)
  @ApiOperation({ summary: '取消退课申请' })
  async cancel(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.refundRequestsService.cancel(id, userId);
  }
}




