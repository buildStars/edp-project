import { IsOptional, IsEnum, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { EnrollmentRequestStatus } from '@prisma/client';

export class QueryEnrollmentRequestDto extends PaginationDto {
  @ApiPropertyOptional({ description: '状态', enum: EnrollmentRequestStatus })
  @IsEnum(EnrollmentRequestStatus)
  @IsOptional()
  status?: EnrollmentRequestStatus;

  @ApiPropertyOptional({ description: '课程ID' })
  @IsString()
  @IsOptional()
  courseId?: string;

  @ApiPropertyOptional({ description: '用户ID' })
  @IsString()
  @IsOptional()
  userId?: string;

  @ApiPropertyOptional({ description: '关键词搜索（姓名/手机）' })
  @IsString()
  @IsOptional()
  keyword?: string;
}




