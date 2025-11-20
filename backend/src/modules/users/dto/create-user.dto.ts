import { IsString, IsOptional, IsEnum, IsEmail, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateUserDto {
  @ApiProperty({ description: '手机号' })
  @IsString()
  phone: string;

  @ApiPropertyOptional({ description: '邮箱' })
  @IsOptional()
  @Transform(({ value }) => value === '' ? undefined : value)
  @IsEmail({}, { message: '邮箱格式不正确' })
  email?: string;

  @ApiProperty({ description: '密码' })
  @IsString()
  @MinLength(6, { message: '密码至少6位' })
  password: string;

  @ApiPropertyOptional({ description: '昵称' })
  @IsOptional()
  @Transform(({ value }) => value === '' ? undefined : value)
  @IsString()
  nickname?: string;

  @ApiPropertyOptional({ description: '真实姓名' })
  @IsOptional()
  @Transform(({ value }) => value === '' ? undefined : value)
  @IsString()
  realName?: string;

  @ApiPropertyOptional({ description: '性别', enum: ['MALE', 'FEMALE', 'OTHER'] })
  @IsOptional()
  @IsEnum(['MALE', 'FEMALE', 'OTHER'])
  gender?: string;

  @ApiProperty({ description: '角色', enum: ['STUDENT', 'ADVISOR', 'TEACHER', 'STAFF', 'ADMIN'] })
  @IsEnum(['STUDENT', 'ADVISOR', 'TEACHER', 'STAFF', 'ADMIN'])
  role: string;

  @ApiPropertyOptional({ description: '状态', enum: ['ACTIVE', 'INACTIVE'] })
  @IsOptional()
  @IsEnum(['ACTIVE', 'INACTIVE'])
  status?: string;

  @ApiPropertyOptional({ description: '公司' })
  @IsOptional()
  @Transform(({ value }) => value === '' ? undefined : value)
  @IsString()
  company?: string;

  @ApiPropertyOptional({ description: '职位' })
  @IsOptional()
  @Transform(({ value }) => value === '' ? undefined : value)
  @IsString()
  position?: string;

  @ApiPropertyOptional({ description: '身份证号' })
  @IsOptional()
  @Transform(({ value }) => value === '' ? undefined : value)
  @IsString()
  idCard?: string;

  @ApiPropertyOptional({ description: '企业ID' })
  @IsOptional()
  @Transform(({ value }) => value === '' ? undefined : value)
  @IsString()
  organizationId?: string;

  @ApiPropertyOptional({ description: '课程顾问ID' })
  @IsOptional()
  @Transform(({ value }) => value === '' ? undefined : value)
  @IsString()
  advisorId?: string;
}


