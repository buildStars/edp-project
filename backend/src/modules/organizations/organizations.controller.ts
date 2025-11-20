import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrganizationsService } from './organizations.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '@prisma/client';

@ApiTags('企业组织')
@Controller('organizations')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Get()
  @Roles('ADMIN', 'STAFF', 'TEACHER')
  @ApiOperation({ summary: '获取企业列表（管理端）' })
  async findAll(@Query() query: any) {
    return this.organizationsService.findAll(query);
  }

  @Get(':id')
  @Roles('ADMIN', 'STAFF', 'TEACHER')
  @ApiOperation({ summary: '获取企业详情（管理端）' })
  async findOne(@Param('id') id: string) {
    return this.organizationsService.findOne(id);
  }

  @Post()
  @Roles('ADMIN', 'TEACHER')
  @ApiOperation({ summary: '创建企业（管理端）' })
  async create(@Body() data: any) {
    return this.organizationsService.create(data);
  }

  @Put(':id')
  @Roles('ADMIN', 'TEACHER')
  @ApiOperation({ summary: '更新企业（管理端）' })
  async update(@Param('id') id: string, @Body() data: any) {
    return this.organizationsService.update(id, data);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: '删除企业（管理端）' })
  async remove(@Param('id') id: string) {
    return this.organizationsService.remove(id);
  }

  @Post(':id/allocate-credits')
  @Roles('ADMIN', 'TEACHER')
  @ApiOperation({ summary: '分配学分（管理端）' })
  async allocateCredits(
    @Param('id') id: string,
    @Body() data: { amount: number; validDays?: number },
  ) {
    return this.organizationsService.allocateCredits(id, data);
  }

  @Get(':id/users')
  @Roles('ADMIN', 'STAFF', 'TEACHER')
  @ApiOperation({ summary: '获取企业用户列表（管理端）' })
  async getUsers(@Param('id') id: string, @Query() query: any) {
    return this.organizationsService.getUsers(id, query);
  }

  @Post(':id/users/:userId')
  @Roles('ADMIN', 'TEACHER')
  @ApiOperation({ summary: '添加企业员工（管理端）' })
  async addUser(
    @Param('id') id: string,
    @Param('userId') userId: string,
  ) {
    return this.organizationsService.addUser(id, userId);
  }

  @Delete(':id/users/:userId')
  @Roles('ADMIN', 'TEACHER')
  @ApiOperation({ summary: '移除企业员工（管理端）' })
  async removeUser(
    @Param('id') id: string,
    @Param('userId') userId: string,
  ) {
    return this.organizationsService.removeUser(id, userId);
  }

  @Get(':id/statistics')
  @Roles('ADMIN', 'STAFF', 'TEACHER')
  @ApiOperation({ summary: '获取企业统计信息（管理端）' })
  async getStatistics(@Param('id') id: string) {
    return this.organizationsService.getStatistics(id);
  }
}

