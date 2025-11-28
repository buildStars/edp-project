import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ApplyJoinAssociationDto {
  @ApiPropertyOptional({ description: '申请理由' })
  @IsOptional()
  @IsString()
  reason?: string;
}

