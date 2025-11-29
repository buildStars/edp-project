import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum ReviewStatus {
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export class ReviewJoinRequestDto {
  @ApiProperty({ description: '审批状态', enum: ReviewStatus })
  @IsEnum(ReviewStatus)
  status: ReviewStatus;

  @ApiPropertyOptional({ description: '审批备注（拒绝时必填）' })
  @IsOptional()
  @IsString()
  reviewNote?: string;
}




