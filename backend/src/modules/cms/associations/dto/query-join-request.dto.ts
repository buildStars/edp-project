import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { PaginationDto } from '../../../../common/dto/pagination.dto';

export enum JoinRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export class QueryJoinRequestDto extends PaginationDto {
  @ApiPropertyOptional({ description: '协会ID' })
  @IsOptional()
  @IsString()
  associationId?: string;

  @ApiPropertyOptional({ description: '用户ID' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ description: '状态', enum: JoinRequestStatus })
  @IsOptional()
  @IsEnum(JoinRequestStatus)
  status?: JoinRequestStatus;
}

