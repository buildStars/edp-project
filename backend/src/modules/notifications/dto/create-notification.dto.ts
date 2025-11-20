import { IsNotEmpty, IsString, IsEnum, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationType } from '@prisma/client';

export class CreateNotificationDto {
  @ApiProperty({ description: '用户ID' })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({ 
    description: '通知类型', 
    enum: NotificationType 
  })
  @IsNotEmpty()
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiProperty({ description: '通知标题' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: '通知内容' })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiPropertyOptional({ 
    description: '额外数据（如跳转链接、关联ID等）',
    example: { newsId: 'xxx', url: '/pages/news/detail?id=xxx' }
  })
  @IsOptional()
  @IsObject()
  data?: any;
}

