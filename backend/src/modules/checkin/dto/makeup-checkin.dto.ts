import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MakeupCheckinDto {
  @ApiProperty({ description: '学员ID' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiPropertyOptional({ description: '补签原因' })
  @IsString()
  @IsOptional()
  reason?: string;
}

export class BatchMakeupCheckinDto {
  @ApiProperty({ description: '学员ID列表' })
  @IsArray()
  @IsString({ each: true })
  userIds: string[];

  @ApiPropertyOptional({ description: '补签原因' })
  @IsString()
  @IsOptional()
  reason?: string;
}





