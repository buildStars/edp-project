import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsBoolean, IsInt, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class CreateAiConfigDto {
  @ApiProperty({ description: 'AI模型名称', example: 'GPT-4' })
  @IsString()
  name: string;

  @ApiProperty({ description: '提供商', example: 'openai' })
  @IsString()
  provider: string;

  @ApiProperty({ description: 'API Key' })
  @IsString()
  apiKey: string;

  @ApiPropertyOptional({ description: 'API地址', example: 'https://api.openai.com/v1' })
  @IsOptional()
  @IsString()
  apiUrl?: string;

  @ApiProperty({ description: '模型版本', example: 'gpt-4' })
  @IsString()
  model: string;

  @ApiPropertyOptional({ description: '是否启用', default: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: '最大token数', default: 2000 })
  @IsOptional()
  @IsInt()
  @Min(100)
  maxTokens?: number;

  @ApiPropertyOptional({ description: '温度参数', default: 0.7 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(2)
  temperature?: number;
}

