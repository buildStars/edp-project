import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 课程审批动作枚举
 */
export enum CourseApprovalAction {
  APPROVE = 'APPROVE', // 通过
  REJECT = 'REJECT',   // 拒绝
}

/**
 * 课程审批DTO
 */
export class ApproveCourseDto {
  @ApiProperty({ description: '审批动作', enum: CourseApprovalAction })
  @IsEnum(CourseApprovalAction)
  action: CourseApprovalAction;

  @ApiPropertyOptional({ description: '审批备注' })
  @IsOptional()
  @IsString()
  remark?: string;
}





