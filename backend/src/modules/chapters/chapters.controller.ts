import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ChaptersService } from './chapters.service';
import { CreateChapterDto } from './dto/create-chapter.dto';
import { UpdateChapterDto } from './dto/update-chapter.dto';
import { QueryChapterDto } from './dto/query-chapter.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('章节管理')
@Controller('chapters')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ChaptersController {
  constructor(private readonly chaptersService: ChaptersService) {}

  @Post()
  @Roles('ADMIN', 'STAFF', 'TEACHER')
  @ApiOperation({ summary: '创建章节' })
  create(@Body() createChapterDto: CreateChapterDto) {
    return this.chaptersService.create(createChapterDto);
  }

  @Get()
  @Roles('ADMIN', 'STAFF', 'TEACHER', 'STUDENT')
  @ApiOperation({ summary: '查询章节列表' })
  findAll(@Query() query: QueryChapterDto, @Request() req) {
    const userId = req.user?.id;
    return this.chaptersService.findAll(query, userId);
  }

  @Get(':id')
  @Roles('ADMIN', 'STAFF', 'TEACHER', 'STUDENT')
  @ApiOperation({ summary: '获取章节详情' })
  findOne(@Param('id') id: string, @Request() req) {
    const userId = req.user?.id;
    return this.chaptersService.findOne(id, userId);
  }

  @Put(':id')
  @Roles('ADMIN', 'STAFF', 'TEACHER')
  @ApiOperation({ summary: '更新章节' })
  update(@Param('id') id: string, @Body() updateChapterDto: UpdateChapterDto) {
    return this.chaptersService.update(id, updateChapterDto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'STAFF', 'TEACHER')
  @ApiOperation({ summary: '删除章节' })
  remove(@Param('id') id: string) {
    return this.chaptersService.remove(id);
  }

  @Post('sort-order')
  @Roles('ADMIN', 'STAFF', 'TEACHER')
  @ApiOperation({ summary: '批量更新章节排序' })
  updateSortOrder(@Body() updates: Array<{ id: string; sortOrder: number }>) {
    return this.chaptersService.updateSortOrder(updates);
  }

  @Post('batch-delete')
  @Roles('ADMIN', 'STAFF', 'TEACHER')
  @ApiOperation({ summary: '批量删除章节' })
  batchDelete(@Body() body: { ids: string[] }) {
    return this.chaptersService.batchDelete(body.ids);
  }
}

