import { IsNotEmpty, IsString } from 'class-validator';

export class PurchaseCourseDto {
  @IsNotEmpty({ message: '目标用户ID不能为空' })
  @IsString({ message: '目标用户ID必须是字符串' })
  toUserId: string;

  @IsNotEmpty({ message: '课程ID不能为空' })
  @IsString({ message: '课程ID必须是字符串' })
  courseId: string;
}
