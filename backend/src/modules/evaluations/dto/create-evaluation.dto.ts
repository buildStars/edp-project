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

  @ApiProperty({ description: '总体评分（1-10分）', minimum: 0, maximum: 10 })
  @IsInt()
  @Min(0)
  @Max(10)
  rating: number;

  // 1. 教学态度
  @ApiPropertyOptional({ description: '教学投入、有激情（1-10分）', minimum: 0, maximum: 10 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  attitude1?: number;

  @ApiPropertyOptional({ description: '教学认真、耐心、诚恳、友好（1-10分）', minimum: 0, maximum: 10 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  attitude2?: number;

  // 2. 教学内容
  @ApiPropertyOptional({ description: '主题明晰，内容清晰，论证严密（1-10分）', minimum: 0, maximum: 10 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  content1?: number;

  @ApiPropertyOptional({ description: '内容实践性强，案例丰富（1-10分）', minimum: 0, maximum: 10 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  content2?: number;

  // 3. 教学方法
  @ApiPropertyOptional({ description: '方法得当：逻辑性强，条理清晰，重点突出（1-10分）', minimum: 0, maximum: 10 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  method1?: number;

  @ApiPropertyOptional({ description: '对问题的阐析性强（1-10分）', minimum: 0, maximum: 10 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  method2?: number;

  // 4. 教学效果
  @ApiPropertyOptional({ description: '达到预期，对工作或成长提供帮助（1-10分）', minimum: 0, maximum: 10 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  effect1?: number;

  @ApiPropertyOptional({ description: '掌握新思想或新技能（1-10分）', minimum: 0, maximum: 10 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  effect2?: number;

  // 5. 教务组织
  @ApiPropertyOptional({ description: '课程资料准备充分（1-10分）', minimum: 0, maximum: 10 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  organization?: number;

  // 文本建议
  @ApiPropertyOptional({ description: '您对本次课程的建议' })
  @IsOptional()
  @Transform(({ value }) => value === '' ? undefined : value)
  @IsString()
  suggestion?: string;

  // 保留旧字段以兼容（废弃）
  @ApiPropertyOptional({ description: '内容质量评分（1-5星）- 废弃', minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  contentRating?: number;

  @ApiPropertyOptional({ description: '讲师水平评分（1-5星）- 废弃', minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  teacherRating?: number;

  @ApiPropertyOptional({ description: '组织服务评分（1-5星）- 废弃', minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  organizationRating?: number;

  @ApiPropertyOptional({ description: '评价内容 - 废弃' })
  @IsOptional()
  @Transform(({ value }) => value === '' ? undefined : value)
  @IsString()
  comment?: string;
}
