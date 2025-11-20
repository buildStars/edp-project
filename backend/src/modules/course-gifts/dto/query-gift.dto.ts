import { IsOptional, IsEnum, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { GiftStatus } from '@prisma/client';

export class QueryGiftDto extends PaginationDto {
  @ApiPropertyOptional({ description: '状态', enum: GiftStatus })
  @IsEnum(GiftStatus)
  @IsOptional()
  status?: GiftStatus;

  @ApiPropertyOptional({ description: '课程ID' })
  @IsString()
  @IsOptional()
  courseId?: string;

  @ApiPropertyOptional({ description: '类型', enum: ['sent', 'received'] })
  @IsEnum(['sent', 'received'])
  @IsOptional()
  type?: 'sent' | 'received';
}




