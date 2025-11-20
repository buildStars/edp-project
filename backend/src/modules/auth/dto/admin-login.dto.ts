import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, IsOptional, IsBoolean } from 'class-validator';

export class AdminLoginDto {
  @ApiProperty({ description: '用户名或手机号', example: 'admin' })
  @IsNotEmpty({ message: '用户名不能为空' })
  @IsString()
  username: string;

  @ApiProperty({ description: '密码', example: '123456' })
  @IsNotEmpty({ message: '密码不能为空' })
  @IsString()
  @MinLength(6, { message: '密码长度不能少于6位' })
  password: string;

  @ApiPropertyOptional({ description: '记住密码', example: false })
  @IsOptional()
  @IsBoolean()
  remember?: boolean;
}

