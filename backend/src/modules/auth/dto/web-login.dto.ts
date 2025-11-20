import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, IsOptional, IsBoolean } from 'class-validator';

/**
 * Web端（浏览器）登录DTO
 * 用于普通用户在浏览器中使用账号密码登录
 */
export class WebLoginDto {
  @ApiProperty({ 
    description: '手机号或邮箱', 
    example: '13800138000' 
  })
  @IsNotEmpty({ message: '账号不能为空' })
  @IsString()
  username: string;

  @ApiProperty({ 
    description: '密码', 
    example: '123456' 
  })
  @IsNotEmpty({ message: '密码不能为空' })
  @IsString()
  @MinLength(6, { message: '密码长度不能少于6位' })
  password: string;

  @ApiPropertyOptional({ 
    description: '记住登录状态（7天）', 
    example: false 
  })
  @IsOptional()
  @IsBoolean()
  remember?: boolean;
}

