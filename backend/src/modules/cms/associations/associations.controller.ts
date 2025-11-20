import { Controller, Get, Post, Put, Delete, Query, Param, Body, UseGuards, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AssociationsService } from './associations.service';
import { CreateAssociationDto } from './dto/create-association.dto';
import { UpdateAssociationDto } from './dto/update-association.dto';
import { QueryAssociationDto } from './dto/query-association.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Public } from '../../../common/decorators/public.decorator';

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
}

