import { IsString, IsNotEmpty, Length, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CheckinMethod } from '@prisma/client';

export class CheckinByCodeDto {
  @ApiProperty({ description: '课程ID' })
  @IsString()
  @IsNotEmpty()
  courseId: string;

  @ApiProperty({ description: '6位签到码', example: '123456' })
  @IsString()
  @Length(6, 6)
  code: string;
}

export class CheckinByQRCodeDto {
  @ApiProperty({ description: '签到会话ID' })
  @IsString()
  @IsNotEmpty()
  sessionId: string;

  @ApiPropertyOptional({ description: '课程ID（可选，用于验证）' })
  @IsString()
  @IsOptional()
  courseId?: string;
}





