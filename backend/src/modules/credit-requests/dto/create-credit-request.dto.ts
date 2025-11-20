import { IsString, IsInt, IsNotEmpty, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 创建学分申请DTO
 */
export class CreateCreditRequestDto {
  @ApiProperty({ description: '目标用户ID（学员或企业管理员）' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ description: '申请学分数量', minimum: 1 })
  @IsInt()
  @Min(1)
  amount: number;

  @ApiProperty({ description: '申请理由' })
  @IsString()
  @IsNotEmpty()
  reason: string;
}





