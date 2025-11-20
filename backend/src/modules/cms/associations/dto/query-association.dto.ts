import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { AssociationType } from './create-association.dto';

export class QueryAssociationDto {
  @ApiProperty({ description: '页码', required: false, default: 1, minimum: 1 })
  @Type(() => Number)
  @IsInt({ message: '页码必须是整数' })
  @Min(1, { message: '页码最小为1' })
  @IsOptional()
  page?: number = 1;

  @ApiProperty({ description: '每页数量', required: false, default: 10, minimum: 1, maximum: 100 })
  @Type(() => Number)
  @IsInt({ message: '每页数量必须是整数' })
  @Min(1, { message: '每页数量最小为1' })
  @Max(100, { message: '每页数量最大为100' })
  @IsOptional()
  pageSize?: number = 10;

  @ApiProperty({ 
    description: '协会类型', 
    enum: AssociationType,
    required: false 
  })
  @Transform(({ value }) => value ? value.toUpperCase() : value)
  @IsEnum(AssociationType, { message: '协会类型必须是 ALUMNI 或 CLUB' })
  @IsOptional()
  type?: AssociationType;

  @ApiProperty({ description: '搜索关键词', required: false })
  @IsString()
  @IsOptional()
  keyword?: string;
}


