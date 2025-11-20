import { Controller, Post, Body, Get, Put, UseGuards, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { WxLoginDto, BindPhoneDto } from './dto/auth.dto';
import { AdminLoginDto } from './dto/admin-login.dto';
import { WebLoginDto } from './dto/web-login.dto';
import { UpdateProfileDto, ChangePasswordDto } from './dto/update-profile.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('认证')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('admin-login')
  @HttpCode(200)
  @ApiOperation({ summary: '管理后台登录' })
  async adminLogin(@Body() adminLoginDto: AdminLoginDto) {
    return this.authService.adminLogin(adminLoginDto);
  }

  @Public()
  @Post('web-login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Web端登录（浏览器）' })
  async webLogin(@Body() webLoginDto: WebLoginDto) {
    return this.authService.webLogin(webLoginDto);
  }

  @Public()
  @Post('wx-login')
  @HttpCode(200)
  @ApiOperation({ summary: '微信登录' })
  async wxLogin(@Body() wxLoginDto: WxLoginDto) {
    return this.authService.wxLogin(wxLoginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('bind-phone')
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiOperation({ summary: '绑定手机号' })
  async bindPhone(@CurrentUser() user: any, @Body() bindPhoneDto: BindPhoneDto) {
    return this.authService.bindPhone(user.id, bindPhoneDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取当前用户信息' })
  async getProfile(@CurrentUser() user: any) {
    return this.authService.getProfile(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新个人资料' })
  async updateProfile(
    @CurrentUser() user: any,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(user.id, updateProfileDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiOperation({ summary: '修改密码' })
  async changePassword(
    @CurrentUser() user: any,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(user.id, changePasswordDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiOperation({ summary: '退出登录' })
  async logout(@CurrentUser() user: any) {
    return { success: true, message: '退出成功' };
  }
}
