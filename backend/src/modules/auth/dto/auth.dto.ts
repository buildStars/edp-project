import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class WxLoginDto {
  @ApiProperty({ description: '微信code' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiPropertyOptional({ description: '用户信息' })
  @IsOptional()
  @IsObject()
  userInfo?: {
    nickName?: string;
    avatarUrl?: string;
  };
}

export class BindPhoneDto {
  @ApiProperty({ description: '微信获取手机号的code' })
  @IsString()
  @IsNotEmpty()
  code: string;
}

