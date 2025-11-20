import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 绑定方式枚举
 */
export enum BindType {
  TEACHER_REGISTER = 'TEACHER_REGISTER', // 教师注册
  SELF_REGISTER = 'SELF_REGISTER',       // 自己注册后绑定
}

/**
 * 绑定学员DTO
 */
export class BindStudentDto {
  @ApiProperty({ description: '学员ID' })
  @IsString()
  @IsNotEmpty()
  studentId: string;

  @ApiPropertyOptional({ description: '绑定方式', enum: BindType, default: BindType.SELF_REGISTER })
  @IsOptional()
  @IsEnum(BindType)
  registeredBy?: BindType = BindType.SELF_REGISTER;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string;
}
