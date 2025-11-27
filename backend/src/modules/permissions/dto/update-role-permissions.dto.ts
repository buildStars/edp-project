import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class UpdateRolePermissionsDto {
  @ApiProperty({
    description: '权限代码列表',
    example: ['dashboard:view', 'courses:view', 'users:view'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  permissions: string[];
}









