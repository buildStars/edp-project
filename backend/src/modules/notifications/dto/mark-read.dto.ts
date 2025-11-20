import { IsNotEmpty, IsArray, IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MarkReadDto {
  @ApiPropertyOptional({ 
    description: '通知ID列表（不传则标记全部为已读）',
    type: [String],
    example: ['uuid-1', 'uuid-2']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ids?: string[];

  @ApiPropertyOptional({ 
    description: '是否标记为已读',
    default: true 
  })
  @IsOptional()
  @IsBoolean()
  isRead?: boolean;
}

