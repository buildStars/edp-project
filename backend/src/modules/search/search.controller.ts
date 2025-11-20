import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('搜索')
@Controller('search')
@UseGuards(JwtAuthGuard)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: '全局搜索' })
  async search(@Query('keyword') keyword: string, @Query('type') type?: string) {
    return this.searchService.search(keyword, type);
  }

  @Public()
  @Get('hot')
  @ApiOperation({ summary: '热门搜索关键词' })
  async getHotKeywords() {
    return this.searchService.getHotKeywords();
  }

  @Public()
  @Get('history')
  @ApiOperation({ summary: '搜索历史' })
  async getSearchHistory(@Query('userId') userId?: string) {
    return this.searchService.getSearchHistory(userId);
  }
}





