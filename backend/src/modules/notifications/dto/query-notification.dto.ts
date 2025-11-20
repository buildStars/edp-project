import { IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { Transform } from 'class-transformer';
import { NotificationType } from '@prisma/client';

// 重新导出 NotificationType 以便其他地方使用
export { NotificationType };

export class QueryNotificationDto extends PaginationDto {
  @ApiPropertyOptional({ 
    description: '通知类型', 
    enum: NotificationType 
  })
  @IsOptional()
  @Transform(({ value }) => value ? value.toUpperCase() : value)
  @IsEnum(NotificationType)
  type?: NotificationType;

  @ApiPropertyOptional({ 
    description: '是否已读（不传则返回全部）',
    type: Boolean 
  })
  @IsOptional()
  @Transform(({ value }) => {
    console.log('[DTO Transform] isRead 原始值:', value, '类型:', typeof value);
    // 处理字符串类型的布尔值
    if (value === 'true' || value === '1' || value === 1 || value === true) {
      console.log('[DTO Transform] 转换为 true');
      return true;
    }
    if (value === 'false' || value === '0' || value === 0 || value === false) {
      console.log('[DTO Transform] 转换为 false');
      return false;
    }
    // 如果值为 undefined 或 null，返回 undefined（表示不过滤）
    if (value === undefined || value === null || value === '') {
      console.log('[DTO Transform] 返回 undefined（不过滤）');
      return undefined;
    }
    console.log('[DTO Transform] 返回原值:', value);
    return value;
  })
  @IsBoolean()
  isRead?: boolean;
}

