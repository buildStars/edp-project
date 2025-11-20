import { Controller, Get, Post, Put, Delete, Body, Query, Param, UseGuards, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MaterialsService } from './materials.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { QueryMaterialDto } from './dto/query-material.dto';

@ApiTags('课件')
@Controller('materials')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  // ========== 管理端接口 ==========

  @Get()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'STAFF', 'TEACHER')
  @ApiOperation({ summary: '获取课件列表（管理端）' })
  async findAll(@Query() query: QueryMaterialDto) {
    return this.materialsService.findAll(query);
  }

  @Post()
  @HttpCode(200)
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'STAFF', 'TEACHER')
  @ApiOperation({ summary: '创建课件（管理端）' })
  async create(@CurrentUser('id') userId: string, @Body() dto: CreateMaterialDto) {
    return this.materialsService.create(userId, dto);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'STAFF', 'TEACHER')
  @ApiOperation({ summary: '更新课件（管理端）' })
  async update(@Param('id') id: string, @Body() dto: UpdateMaterialDto) {
    return this.materialsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'STAFF', 'TEACHER')
  @ApiOperation({ summary: '删除课件（管理端）' })
  async delete(@Param('id') id: string) {
    return this.materialsService.delete(id);
  }

  @Post('batch-delete')
  @HttpCode(200)
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'STAFF', 'TEACHER')
  @ApiOperation({ summary: '批量删除课件（管理端）' })
  async batchDelete(@Body() dto: { ids: string[] }) {
    return this.materialsService.batchDelete(dto.ids);
  }

  // ========== 学员端接口 ==========

  @Get('courseware')
  @ApiOperation({ summary: '获取课件（学员端）' })
  async getCourseware(@CurrentUser() user: any, @Query('courseId') courseId: string) {
    return this.materialsService.getCourseware(user.id, courseId);
  }

  @Post('downloads/record')
  @HttpCode(200)
  @ApiOperation({ summary: '记录下载' })
  async recordDownload(
    @CurrentUser('id') userId: string,
    @Body() dto: { materialId: string },
  ) {
    return this.materialsService.recordDownload(userId, dto.materialId);
  }
}

