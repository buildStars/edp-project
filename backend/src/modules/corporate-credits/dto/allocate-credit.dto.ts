import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class AllocateCreditDto {
  @IsNotEmpty({ message: '目标用户ID不能为空' })
  @IsString({ message: '目标用户ID必须是字符串' })
  toUserId: string;

  @IsNotEmpty({ message: '学分数量不能为空' })
  @IsNumber({}, { message: '学分数量必须是数字' })
  @Min(1, { message: '学分数量必须大于0' })
  amount: number;
}
