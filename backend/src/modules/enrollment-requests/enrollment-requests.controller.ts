import { Controller, Get, Post, Body, Param, Query, Delete, UseGuards, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EnrollmentRequestsService } from './enrollment-requests.service';
import { CreateEnrollmentRequestDto } from './dto/create-enrollment-request.dto';
import { ReviewEnrollmentRequestDto } from './dto/review-enrollment-request.dto';
import { QueryEnrollmentRequestDto } from './dto/query-enrollment-request.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('报名申请')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('enrollment-requests')
export class EnrollmentRequestsController {
  constructor(private readonly enrollmentRequestsService: EnrollmentRequestsService) {}

  @Post()
  @HttpCode(200)
  @ApiOperation({ summary: '创建报名申请（学分不足时）' })
  async create(
    @CurrentUser('id') userId: string,
    @Body() createDto: CreateEnrollmentRequestDto,
  ) {
    return this.enrollmentRequestsService.create(userId, createDto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'STAFF', 'TEACHER')
  @ApiOperation({ summary: '获取报名申请列表（管理员/教师）' })
  async findAll(@Query() query: QueryEnrollmentRequestDto, @CurrentUser() user: any) {
    return this.enrollmentRequestsService.findAll(query, user);
  }

  @Get('my')
  @ApiOperation({ summary: '获取我的报名申请' })
  async findMyRequests(
    @CurrentUser('id') userId: string,
    @Query() query: QueryEnrollmentRequestDto,
  ) {
    return this.enrollmentRequestsService.findMyRequests(userId, query);
  }

  @Post(':id/review')
  @HttpCode(200)
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'STAFF', 'TEACHER')
  @ApiOperation({ summary: '审批报名申请（管理员/教师）' })
  async review(
    @Param('id') id: string,
    @CurrentUser('id') adminUserId: string,
    @Body() reviewDto: ReviewEnrollmentRequestDto,
  ) {
    return this.enrollmentRequestsService.review(id, adminUserId, reviewDto);
  }

  @Delete(':id')
  @HttpCode(200)
  @ApiOperation({ summary: '取消报名申请' })
  async cancel(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.enrollmentRequestsService.cancel(id, userId);
  }
}




