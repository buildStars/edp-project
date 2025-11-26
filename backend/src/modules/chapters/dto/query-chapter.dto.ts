import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryChapterDto {
  @ApiPropertyOptional({ description: '课程ID' })
  @IsOptional()
  @Transform(({ value }) => value === '' ? undefined : value)
  @IsString()
  courseId?: string;

  @ApiPropertyOptional({ description: '章节状态', enum: ['DRAFT', 'PUBLISHED', 'COMPLETED'] })
  @IsOptional()
  @Transform(({ value }) => value === '' ? undefined : value)
  @IsEnum(['DRAFT', 'PUBLISHED', 'COMPLETED'])
  status?: 'DRAFT' | 'PUBLISHED' | 'COMPLETED';

  @ApiPropertyOptional({ description: '搜索关键词' })
  @IsOptional()
  @Transform(({ value }) => value === '' ? undefined : value)
  @IsString()
  keyword?: string;
}









