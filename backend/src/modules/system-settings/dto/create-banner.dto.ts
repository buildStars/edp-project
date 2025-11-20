import { IsString, IsNotEmpty, IsEnum, IsOptional, IsBoolean, IsInt } from 'class-validator';

export enum BannerLinkType {
  NONE = 'NONE',
  URL = 'URL',
  COURSE = 'COURSE',
  NEWS = 'NEWS',
  ACTIVITY = 'ACTIVITY',
}

export class CreateBannerDto {
  @IsString()
  @IsNotEmpty({ message: '标题不能为空' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: '图片URL不能为空' })
  imageUrl: string;

  @IsEnum(BannerLinkType, { message: '链接类型无效' })
  linkType: BannerLinkType;

  @IsString()
  @IsOptional()
  linkUrl?: string;

  @IsString()
  @IsOptional()
  targetId?: string;

  @IsInt()
  @IsOptional()
  sortOrder?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

