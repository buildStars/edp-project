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
}




