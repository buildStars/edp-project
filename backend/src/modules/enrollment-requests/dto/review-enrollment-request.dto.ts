import { IsString, IsNotEmpty, IsEnum, IsOptional, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EnrollmentRequestStatus } from '@prisma/client';

export class ReviewEnrollmentRequestDto {
  @ApiProperty({ description: '审批状态', enum: ['APPROVED', 'REJECTED'] })
  @IsEnum(['APPROVED', 'REJECTED'])
  @IsNotEmpty()
  status: 'APPROVED' | 'REJECTED';

  @ApiPropertyOptional({ description: '审批备注' })
  @IsString()
  @IsOptional()
  reviewNote?: string;

  @ApiPropertyOptional({ description: '充值学分数（仅通过时需要）' })
  @IsInt()
  @Min(0)
  @IsOptional()
  creditAmount?: number;
}




