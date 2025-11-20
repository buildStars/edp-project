import { IsInt, Min, Max, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class StartCheckinDto {
  @ApiProperty({ description: '签到有效期（分钟）', default: 15, minimum: 5, maximum: 60 })
  @IsInt()
  @Min(5)
  @Max(60)
  duration: number = 15;

  @ApiProperty({ description: '章节ID（必填，签到必须关联章节）' })
  @IsNotEmpty({ message: '章节ID不能为空' })
  @IsString()
  chapterId: string;
}





