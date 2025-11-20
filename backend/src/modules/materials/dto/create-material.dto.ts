import { IsString, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateMaterialDto {
  @ApiProperty({ description: '课程ID' })
  @IsString()
  courseId: string;

  @ApiProperty({ description: '课件名称' })
  @IsString()
  title: string;

  @ApiProperty({ description: '文件URL' })
  @IsString()
  fileUrl: string;

  @ApiProperty({ description: '文件类型' })
  @IsString()
  fileType: string;

  @ApiProperty({ description: '文件大小' })
  @IsNumber()
  fileSize: number;

  @ApiPropertyOptional({ description: '所属章节ID' })
  @IsOptional()
  @Transform(({ value }) => value === '' ? undefined : value)
  @IsString()
  chapterId?: string;
}


