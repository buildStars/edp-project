import { IsString, IsNotEmpty, IsInt, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CourseCategory, EnrollStatus, CourseStatus, CreditType, ApprovalStatus } from '@prisma/client';

export class CreateCourseDto {
  @ApiProperty({ description: '课程标题' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ description: '课程分类（已废弃）', enum: CourseCategory })
  @IsOptional()
  @IsEnum(CourseCategory)
  category?: CourseCategory;

  @ApiPropertyOptional({ description: '封面图' })
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiPropertyOptional({ description: '课程介绍' })
  @IsOptional()
  @IsString()
  introduction?: string;

  @ApiProperty({ description: '讲师ID' })
  @IsString()
  @IsNotEmpty()
  teacherId: string;

  @ApiProperty({ description: '讲师姓名' })
  @IsString()
  @IsNotEmpty()
  teacherName: string;

  @ApiPropertyOptional({ description: '讲师头像' })
  @IsOptional()
  @IsString()
  teacherAvatar?: string;

  @ApiPropertyOptional({ description: '讲师职称' })
  @IsOptional()
  @IsString()
  teacherTitle?: string;

  @ApiPropertyOptional({ description: '讲师介绍' })
  @IsOptional()
  @IsString()
  teacherIntro?: string;

  @ApiProperty({ description: '开始时间' })
  @IsDateString()
  startTime: Date;

  @ApiPropertyOptional({ description: '结束时间' })
  @IsOptional()
  @IsDateString()
  endTime?: Date;

  @ApiPropertyOptional({ description: '上课地点' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ description: '学分', default: 1 })
  @IsInt()
  credit: number;

  @ApiPropertyOptional({ description: '课程类型', enum: CreditType, default: 'NORMAL' })
  @IsOptional()
  @IsEnum(CreditType)
  creditType?: CreditType;

  @ApiPropertyOptional({ description: '普通课程学分', default: 1 })
  @IsOptional()
  @IsInt()
  normalCredit?: number;

  @ApiPropertyOptional({ description: '大师课学分', default: 2 })
  @IsOptional()
  @IsInt()
  masterCredit?: number;

  @ApiPropertyOptional({ description: '最大人数' })
  @IsOptional()
  @IsInt()
  maxStudents?: number;

  @ApiPropertyOptional({ description: '报名状态', enum: EnrollStatus, default: 'OPEN' })
  @IsOptional()
  @IsEnum(EnrollStatus)
  enrollStatus?: EnrollStatus;

  @ApiPropertyOptional({ description: '课程状态', enum: CourseStatus, default: 'DRAFT' })
  @IsOptional()
  @IsEnum(CourseStatus)
  status?: CourseStatus;

  @ApiPropertyOptional({ description: '审批状态', enum: ApprovalStatus, default: 'DRAFT' })
  @IsOptional()
  @IsEnum(ApprovalStatus)
  approvalStatus?: ApprovalStatus;
}

