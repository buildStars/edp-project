import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEnrollmentRequestDto {
  @ApiProperty({ description: '课程ID' })
  @IsString()
  @IsNotEmpty()
  courseId: string;

  @ApiProperty({ description: '真实姓名' })
  @IsString()
  @IsNotEmpty()
  realName: string;

  @ApiProperty({ description: '手机号' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiPropertyOptional({ description: '公司' })
  @IsString()
  @IsOptional()
  company?: string;

  @ApiPropertyOptional({ description: '职位' })
  @IsString()
  @IsOptional()
  position?: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsString()
  @IsOptional()
  remark?: string;
}




