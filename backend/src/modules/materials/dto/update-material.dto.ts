import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class UpdateMaterialDto {
  @ApiPropertyOptional({ description: '课件名称' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: '所属章节ID' })
  @IsOptional()
  @Transform(({ value }) => value === '' ? undefined : value)
  @IsString()
  chapterId?: string;
}


