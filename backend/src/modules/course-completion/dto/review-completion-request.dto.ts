import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 审批结课申请DTO
 */
export class ReviewCompletionRequestDto {
  @ApiProperty({ description: '审批状态', enum: ['APPROVED', 'REJECTED'] })
  @IsEnum(['APPROVED', 'REJECTED'])
  status: 'APPROVED' | 'REJECTED';

  @ApiPropertyOptional({ description: '审批备注' })
  @IsOptional()
  @IsString()
  remark?: string;
}





