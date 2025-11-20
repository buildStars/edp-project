import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsOptional, MaxLength } from 'class-validator';

export enum AssociationType {
  ALUMNI = 'ALUMNI',
  CLUB = 'CLUB',
}

export class CreateAssociationDto {
  @ApiProperty({ description: '协会名称', example: '北大汇丰同学会' })
  @IsString()
  @IsNotEmpty({ message: '协会名称不能为空' })
  @MaxLength(100, { message: '协会名称不能超过100个字符' })
  name: string;

  @ApiProperty({ 
    description: '协会类型', 
    enum: AssociationType,
    example: AssociationType.ALUMNI 
  })
  @IsEnum(AssociationType, { message: '协会类型必须是 ALUMNI 或 CLUB' })
  @IsNotEmpty({ message: '协会类型不能为空' })
  type: AssociationType;

  @ApiProperty({ description: '协会logo', required: false, example: 'https://example.com/logo.png' })
  @IsString()
  @IsOptional()
  logo?: string;

  @ApiProperty({ description: '协会简介', required: false, example: '这是一个优秀的协会' })
  @IsString()
  @IsOptional()
  @MaxLength(500, { message: '简介不能超过500个字符' })
  description?: string;

  @ApiProperty({ description: '协会详细介绍', required: false })
  @IsString()
  @IsOptional()
  introduction?: string;

  @ApiProperty({ description: '联系人', required: false, example: '张三' })
  @IsString()
  @IsOptional()
  @MaxLength(50, { message: '联系人姓名不能超过50个字符' })
  contactPerson?: string;

  @ApiProperty({ description: '联系电话', required: false, example: '13800138000' })
  @IsString()
  @IsOptional()
  @MaxLength(20, { message: '联系电话不能超过20个字符' })
  contactPhone?: string;

  @ApiProperty({ description: '联系邮箱', required: false, example: 'contact@example.com' })
  @IsString()
  @IsOptional()
  @MaxLength(100, { message: '联系邮箱不能超过100个字符' })
  contactEmail?: string;

  @ApiProperty({ description: '微信号', required: false, example: 'wechat123' })
  @IsString()
  @IsOptional()
  @MaxLength(50, { message: '微信号不能超过50个字符' })
  wechat?: string;
}


