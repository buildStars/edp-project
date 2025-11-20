import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 审批动作枚举
 */
export enum ReviewAction {
  APPROVE = 'APPROVE', // 通过
  REJECT = 'REJECT',   // 拒绝
}

/**
 * 审批学分申请DTO
 */
export class ReviewCreditRequestDto {
  @ApiProperty({ description: '审批动作', enum: ReviewAction })
  @IsEnum(ReviewAction)
  action: ReviewAction;

  @ApiPropertyOptional({ description: '审批备注' })
  @IsOptional()
  @IsString()
  remark?: string;
}





