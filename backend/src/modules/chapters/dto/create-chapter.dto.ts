import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, IsDateString, IsEnum, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateChapterDto {
  @ApiProperty({ description: '课程ID' })
  @IsString()
  courseId: string;

  @ApiProperty({ description: '章节标题' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: '章节描述' })
  @IsOptional()
  @Transform(({ value }) => value === '' ? undefined : value)
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: '排序号', default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({ description: '预计时长（分钟）' })
  @IsOptional()
  @IsInt()
  @Min(1)
  duration?: number;

  @ApiPropertyOptional({ description: '开始时间' })
  @IsOptional()
  @Transform(({ value }) => value === '' ? undefined : value)
  @IsDateString()
  startTime?: string;

  @ApiPropertyOptional({ description: '结束时间' })
  @IsOptional()
  @Transform(({ value }) => value === '' ? undefined : value)
  @IsDateString()
  endTime?: string;

  @ApiPropertyOptional({ description: '上课地点' })
  @IsOptional()
  @Transform(({ value }) => value === '' ? undefined : value)
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: '章节状态', enum: ['DRAFT', 'PUBLISHED', 'COMPLETED'] })
  @IsOptional()
  @IsEnum(['DRAFT', 'PUBLISHED', 'COMPLETED'])
  status?: 'DRAFT' | 'PUBLISHED' | 'COMPLETED';
}




