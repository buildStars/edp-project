import { IsOptional, IsEnum, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { RefundRequestStatus } from '@prisma/client';

export class QueryRefundRequestDto extends PaginationDto {
  @ApiPropertyOptional({ description: '状态', enum: RefundRequestStatus })
  @IsEnum(RefundRequestStatus)
  @IsOptional()
  status?: RefundRequestStatus;

  @ApiPropertyOptional({ description: '课程ID' })
  @IsString()
  @IsOptional()
  courseId?: string;

  @ApiPropertyOptional({ description: '用户ID' })
  @IsString()
  @IsOptional()
  userId?: string;
}




