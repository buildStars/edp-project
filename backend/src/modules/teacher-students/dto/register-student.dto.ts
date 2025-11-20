import { IsString, IsNotEmpty, IsOptional, IsEmail, IsMobilePhone } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 教师注册学员DTO
 */
export class RegisterStudentDto {
  @ApiProperty({ description: '学员手机号' })
  @IsString()
  @IsNotEmpty()
  @IsMobilePhone('zh-CN')
  phone: string;

  @ApiPropertyOptional({ description: '真实姓名' })
  @IsOptional()
  @IsString()
  realName?: string;

  @ApiPropertyOptional({ description: '公司' })
  @IsOptional()
  @IsString()
  company?: string;

  @ApiPropertyOptional({ description: '职位' })
  @IsOptional()
  @IsString()
  position?: string;

  @ApiPropertyOptional({ description: '邮箱' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string;
}
