import { Controller, Get, Post, Put, Delete, Body, Query, Param, UseGuards, HttpCode, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
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

  @Post('upload')
  @HttpCode(200)
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'STAFF', 'TEACHER')
  @ApiOperation({ summary: '上传课件文件' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('请选择要上传的文件');
    }

    // 验证文件大小（100MB）
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('文件大小不能超过100MB');
    }

    const result = await this.materialsService.uploadFile(file);
    return {
      code: 200,
      msg: '上传成功',
      data: result,
    };
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

