import { Controller, Get, Post, Put, Delete, Query, Param, Body, UseGuards, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AssociationsService } from './associations.service';
import { CreateAssociationDto } from './dto/create-association.dto';
import { UpdateAssociationDto } from './dto/update-association.dto';
import { QueryAssociationDto } from './dto/query-association.dto';
import { ApplyJoinAssociationDto } from './dto/apply-join.dto';
import { ReviewJoinRequestDto } from './dto/review-join.dto';
import { QueryJoinRequestDto } from './dto/query-join-request.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Public } from '../../../common/decorators/public.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

@ApiTags('协会')
@Controller('associations')
export class AssociationsController {
  constructor(private readonly associationsService: AssociationsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: '获取协会列表' })
  @ApiResponse({ status: 200, description: '返回协会列表' })
  async findAll(@Query() query: QueryAssociationDto) {
    return this.associationsService.findAll(query);
  }

  @Public()   
  @Get(':id')
  @ApiOperation({ summary: '获取协会详情' })
  @ApiResponse({ status: 200, description: '返回协会详情' })
  @ApiResponse({ status: 404, description: '协会不存在' })
  async findOne(@Param('id') id: string) {
    const association = await this.associationsService.findOne(id);
    if (!association) {
      throw new NotFoundException('协会不存在');
    }
    return association;
  }

  // ========== 用户接口 ==========

  @UseGuards(JwtAuthGuard)
  @Get(':id/join-status')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取协会加入状态' })
  @ApiResponse({ status: 200, description: '返回加入状态' })
  async getJoinStatus(@Param('id') associationId: string, @CurrentUser('id') userId: string) {
    return this.associationsService.getJoinStatus(associationId, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/apply')
  @ApiBearerAuth()
  @ApiOperation({ summary: '申请加入协会' })
  @ApiResponse({ status: 201, description: '申请提交成功' })
  @ApiResponse({ status: 400, description: '已存在申请或已加入' })
  async applyToJoin(
    @Param('id') associationId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: ApplyJoinAssociationDto,
  ) {
    return this.associationsService.applyToJoin(associationId, userId, dto);
  }

  // ========== 管理后台接口 ==========

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建协会（管理端）' })
  @ApiResponse({ status: 201, description: '协会创建成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  async create(@Body() createAssociationDto: CreateAssociationDto) {
    return this.associationsService.create(createAssociationDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新协会（管理端）' })
  @ApiResponse({ status: 200, description: '协会更新成功' })
  @ApiResponse({ status: 404, description: '协会不存在' })
  async update(@Param('id') id: string, @Body() updateAssociationDto: UpdateAssociationDto) {
    return this.associationsService.update(id, updateAssociationDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除协会（管理端）' })
  @ApiResponse({ status: 200, description: '协会删除成功' })
  @ApiResponse({ status: 404, description: '协会不存在' })
  async remove(@Param('id') id: string) {
    return this.associationsService.remove(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @Get('join-requests/list')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取加入申请列表（管理端）' })
  @ApiResponse({ status: 200, description: '返回申请列表' })
  async getJoinRequests(@Query() query: QueryJoinRequestDto) {
    return this.associationsService.getJoinRequests(query);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @Put('join-requests/:requestId/review')
  @ApiBearerAuth()
  @ApiOperation({ summary: '审批加入申请（管理端）' })
  @ApiResponse({ status: 200, description: '审批成功' })
  @ApiResponse({ status: 404, description: '申请不存在' })
  async reviewJoinRequest(
    @Param('requestId') requestId: string,
    @CurrentUser('id') reviewerId: string,
    @Body() dto: ReviewJoinRequestDto,
  ) {
    return this.associationsService.reviewJoinRequest(requestId, reviewerId, dto);
  }
}

