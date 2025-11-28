import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, Min, Max, IsOptional } from 'class-validator';

export class GenerateReportDto {
  @ApiProperty({ description: '报告年份', example: 2025 })
  @IsInt()
  @Min(2020)
  @Max(2100)
  year: number;

  @ApiPropertyOptional({ description: '是否强制重新生成', default: false })
  @IsOptional()
  force?: boolean;
}










