import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateSystemConfigDto {
  @IsString()
  @IsOptional()
  appName?: string;

  @IsString()
  @IsOptional()
  appLogo?: string;

  @IsString()
  @IsOptional()
  appDesc?: string;

  @IsString()
  @IsOptional()
  aboutUs?: string;

  @IsString()
  @IsOptional()
  contactPhone?: string;

  @IsString()
  @IsOptional()
  contactEmail?: string;

  @IsString()
  @IsOptional()
  contactAddress?: string;

  @IsBoolean()
  @IsOptional()
  isMaintenance?: boolean;

  @IsString()
  @IsOptional()
  maintenanceMsg?: string;

  @IsString()
  @IsOptional()
  wechatQrCode?: string;

  @IsString()
  @IsOptional()
  weiboUrl?: string;

  @IsString()
  @IsOptional()
  appVersion?: string;
}

