import { IsInt, IsOptional, Min, Max, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateEvaluationDto {
  @ApiProperty({ description: '课程ID' })
  @IsString()
  courseId: string;

  @ApiPropertyOptional({ description: '章节ID（可选，不填表示课程级别评价）' })
  @IsOptional()
  @Transform(({ value }) => value === '' ? undefined : value)
  @IsString()
  chapterId?: string;

  @ApiProperty({ description: '总体评分（1-5星）', minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({ description: '内容质量评分（1-5星）', minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  contentRating?: number;

  @ApiPropertyOptional({ description: '讲师水平评分（1-5星）', minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  teacherRating?: number;

  @ApiPropertyOptional({ description: '组织服务评分（1-5星）', minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  organizationRating?: number;

  @ApiPropertyOptional({ description: '评价内容' })
  @IsOptional()
  @Transform(({ value }) => value === '' ? undefined : value)
  @IsString()
  comment?: string;
}


