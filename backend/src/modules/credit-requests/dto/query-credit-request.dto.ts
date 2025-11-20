import { IsOptional, IsString, IsEnum, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 学分申请状态枚举
 */
export enum CreditRequestStatus {
  PENDING = 'PENDING',     // 待审批
  APPROVED = 'APPROVED',   // 已通过
  REJECTED = 'REJECTED',   // 已拒绝
  CANCELLED = 'CANCELLED', // 已取消
}

/**
 * 查询学分申请DTO
 */
export class QueryCreditRequestDto {
  @ApiPropertyOptional({ description: '页码', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: '每页数量', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number = 10;

  @ApiPropertyOptional({ description: '申请状态', enum: CreditRequestStatus })
  @IsOptional()
  @IsEnum(CreditRequestStatus)
  status?: CreditRequestStatus;

  @ApiPropertyOptional({ description: '教师ID（过滤提交人）' })
  @IsOptional()
  @IsString()
  teacherId?: string;

  @ApiPropertyOptional({ description: '用户ID（过滤接收人）' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ description: '关键词搜索（理由）' })
  @IsOptional()
  @IsString()
  keyword?: string;
}





