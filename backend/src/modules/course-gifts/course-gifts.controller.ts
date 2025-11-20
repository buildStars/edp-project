import { Controller, Get, Post, Body, Query, UseGuards, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CourseGiftsService } from './course-gifts.service';
import { CreateGiftDto } from './dto/create-gift.dto';
import { QueryGiftDto } from './dto/query-gift.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('课程赠送')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('course-gifts')
export class CourseGiftsController {
  constructor(private readonly courseGiftsService: CourseGiftsService) {}

  @Post('generate-code')
  @HttpCode(200)
  @ApiOperation({ summary: '生成礼物码（用于分享）' })
  async generateCode(
    @CurrentUser('id') userId: string,
    @Body() body: { courseId: string; message?: string },
  ) {
    return this.courseGiftsService.createGiftCode(userId, body.courseId, body.message);
  }

  @Post('claim')
  @HttpCode(200)
  @ApiOperation({ summary: '通过礼物码领取课程' })
  async claimByCode(
    @CurrentUser('id') userId: string,
    @Body() body: { giftCode: string },
  ) {
    return this.courseGiftsService.claimByCode(userId, body.giftCode);
  }

  @Post()
  @HttpCode(200)
  @ApiOperation({ summary: '赠送课程（旧方法）' })
  async create(
    @CurrentUser('id') userId: string,
    @Body() createDto: CreateGiftDto,
  ) {
    return this.courseGiftsService.create(userId, createDto);
  }

  @Get('my')
  @ApiOperation({ summary: '获取我的赠送记录' })
  async findMy(
    @CurrentUser('id') userId: string,
    @Query() query: QueryGiftDto,
  ) {
    return this.courseGiftsService.findAll(userId, query);
  }

  @Get('statistics')
  @ApiOperation({ summary: '获取赠送统计' })
  async getStatistics(@CurrentUser('id') userId: string) {
    return this.courseGiftsService.getStatistics(userId);
  }

  @Get('admin')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: '获取所有赠送记录（管理员）' })
  async findAllForAdmin(@Query() query: QueryGiftDto) {
    return this.courseGiftsService.findAllForAdmin(query);
  }
}



