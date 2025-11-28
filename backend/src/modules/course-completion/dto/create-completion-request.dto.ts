import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 创建结课申请DTO
 */
export class CreateCompletionRequestDto {
  @ApiProperty({ description: '课程ID' })
  @IsString()
  @IsNotEmpty()
  courseId: string;
}













