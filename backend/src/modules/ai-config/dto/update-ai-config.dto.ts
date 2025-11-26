import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsNumber, IsInt, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateAiConfigDto {
  @ApiProperty({ description: 'AI模型名称', example: 'GPT-4' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: '提供商', example: 'openai' })
  @IsString()
  @IsNotEmpty()
  provider: string;

  @ApiPropertyOptional({ description: 'API Key（更新时可选，不传则保留原值）' })
  @IsString()
  @IsOptional()
  apiKey?: string;

  @ApiPropertyOptional({ description: 'API地址' })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value === '' ? undefined : value)
  apiUrl?: string;

  @ApiProperty({ description: '模型版本', example: 'gpt-4' })
  @IsString()
  @IsNotEmpty()
  model: string;

  @ApiPropertyOptional({ description: '是否启用', default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ description: '最大token数', default: 2000 })
  @IsInt()
  @Min(100)
  @Max(10000)
  @IsOptional()
  maxTokens?: number;

  @ApiPropertyOptional({ description: '温度参数', default: 0.7 })
  @IsNumber()
  @Min(0)
  @Max(2)
  @IsOptional()
  temperature?: number;
}
