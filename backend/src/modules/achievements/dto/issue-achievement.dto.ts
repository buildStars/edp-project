import { IsString, IsNotEmpty, IsOptional, IsArray, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * 手动发放学习成果DTO
 */
export class IssueAchievementDto {
  @ApiProperty({ description: '课程ID' })
  @IsString()
  @IsNotEmpty()
  courseId: string;

  @ApiProperty({ description: '学员ID列表' })
  @IsArray()
  @IsString({ each: true })
  userIds: string[];

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string;
}

/**
 * 批量发放学习成果DTO（结课时使用）
 */
export class BatchIssueAchievementDto {
  @ApiProperty({ description: '课程ID' })
  @IsString()
  @IsNotEmpty()
  courseId: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  remark?: string;
}





