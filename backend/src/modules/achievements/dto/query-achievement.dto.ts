import { IsString, IsOptional, IsNumber, Min } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 查询学习成果DTO
 */
export class QueryAchievementDto {
  @ApiPropertyOptional({ description: '用户ID' })
  @IsOptional()
  @Transform(({ value }) => value === '' ? undefined : value)
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ description: '课程ID' })
  @IsOptional()
  @Transform(({ value }) => value === '' ? undefined : value)
  @IsString()
  courseId?: string;

  @ApiPropertyOptional({ description: '页码' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: '每页数量' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  pageSize?: number = 20;
}

