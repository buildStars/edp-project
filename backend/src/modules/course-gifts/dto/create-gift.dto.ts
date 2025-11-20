import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateGiftDto {
  @ApiProperty({ description: '课程ID' })
  @IsString()
  @IsNotEmpty()
  courseId: string;

  @ApiProperty({ description: '接收方用户ID或手机号' })
  @IsString()
  @IsNotEmpty()
  toUser: string;

  @ApiPropertyOptional({ description: '赠送留言' })
  @IsString()
  @IsOptional()
  message?: string;
}




