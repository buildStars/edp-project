import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRefundRequestDto {
  @ApiProperty({ description: '报名ID' })
  @IsString()
  @IsNotEmpty()
  enrollmentId: string;

  @ApiPropertyOptional({ description: '退课原因' })
  @IsString()
  @IsOptional()
  reason?: string;

  @ApiPropertyOptional({ description: '是否需要审批（48小时内）' })
  @IsOptional()
  needsApproval?: boolean;

  @ApiPropertyOptional({ description: '手续费百分比（48小时外）' })
  @IsOptional()
  refundFeePercent?: number;
}




