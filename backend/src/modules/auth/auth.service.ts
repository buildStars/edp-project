import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { PermissionsService } from '../permissions/permissions.service';
import { WxLoginDto, BindPhoneDto } from './dto/auth.dto';
import { AdminLoginDto } from './dto/admin-login.dto';
import { WebLoginDto } from './dto/web-login.dto';
import { UpdateProfileDto, ChangePasswordDto } from './dto/update-profile.dto';
import { LoggerService } from '../../infrastructure/logger/logger.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private usersService: UsersService,
    private permissionsService: PermissionsService,
    private logger: LoggerService,
  ) {}

  /**
   * 管理后台登录
   */
  async adminLogin(adminLoginDto: AdminLoginDto) {
    const { username, password } = adminLoginDto;

    // 1. 查找用户（支持用户名或手机号登录）
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { phone: username },
          { email: username },
        ],
        role: {
          in: ['ADMIN', 'STAFF', 'TEACHER', 'ADVISOR'],
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 2. 验证密码
    if (!user.password) {
      throw new UnauthorizedException('该账号未设置密码，请联系管理员');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 3. 检查用户状态
    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('账号已被禁用，请联系管理员');
    }

    // 4. 生成JWT token
    const token = this.generateToken(user);

    return {
      token,
      userInfo: {
        id: user.id,
        phone: user.phone,
        email: user.email,
        nickname: user.nickname,
        realName: user.realName,
        avatar: user.avatar,
        role: user.role,
        status: user.status,
      },
    };
  }

  /**
   * Web端（浏览器）登录 - 普通用户
   */
  async webLogin(webLoginDto: WebLoginDto) {
    const { username, password, remember } = webLoginDto;

    this.logger.log(`[Web登录] 用户尝试登录: ${username}`, 'AuthService');

    // 1. 查找用户（支持手机号或邮箱登录，所有角色都可以）
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { phone: username },
          { email: username },
        ],
      },
    });

    if (!user) {
      this.logger.warn(`[Web登录] 用户不存在: ${username}`, 'AuthService');
      throw new UnauthorizedException('账号或密码错误');
    }

    // 2. 验证密码
    if (!user.password) {
      this.logger.warn(`[Web登录] 账号未设置密码: ${username}`, 'AuthService');
      throw new UnauthorizedException('该账号未设置密码，请使用微信登录或联系管理员');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      this.logger.warn(`[Web登录] 密码错误: ${username}`, 'AuthService');
      throw new UnauthorizedException('账号或密码错误');
    }

    // 3. 检查用户状态
    if (user.status !== 'ACTIVE') {
      this.logger.warn(`[Web登录] 账号已禁用: ${username}`, 'AuthService');
      throw new UnauthorizedException('账号已被禁用，请联系管理员');
    }

    // 4. 生成JWT token（如果remember为true，延长有效期）
    const token = this.generateToken(user, remember ? '7d' : undefined);

    this.logger.log(`[Web登录] 登录成功: ${username}, 角色: ${user.role}`, 'AuthService');

    return {
      token,
      userInfo: {
        id: user.id,
        phone: user.phone,
        email: user.email,
        nickname: user.nickname,
        realName: user.realName,
        avatar: user.avatar,
        company: user.company,
        position: user.position,
        role: user.role,
        status: user.status,
      },
    };
  }

  /**
   * 微信登录
   */
  async wxLogin(wxLoginDto: WxLoginDto) {
    this.logger.log('[微信登录] 开始处理登录请求', 'AuthService');
    this.logger.debug(`收到的数据: ${JSON.stringify(wxLoginDto)}`, 'AuthService');
    
    const { code, userInfo } = wxLoginDto;

    let openid: string;
    let unionid: string | undefined;

    // 检查配置
    const appid = this.configService.get('WECHAT_APPID');
    const secret = this.configService.get('WECHAT_SECRET');
    
    this.logger.debug(`配置检查 - APPID: ${appid}, Secret: ${secret ? '已配置' : '未配置'}, Code: ${code}`, 'AuthService');

    // 调用微信接口获取openid
    this.logger.log('调用微信 API 验证', 'AuthService');
    try {
      const wxData = await this.getWxOpenId(code);
      openid = wxData.openid;
      unionid = wxData.unionid;
      this.logger.log(`微信 API 返回成功 - openid: ${openid}, unionid: ${unionid || '无'}`, 'AuthService');
    } catch (error) {
      this.logger.error(`调用微信 API 失败: ${error.message}`, error.stack, 'AuthService');
      throw error;
    }

    // 2. 查找或创建用户
    let user = await this.prisma.user.findUnique({
      where: { openid },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          openid,
          unionid,
          nickname: userInfo?.nickName || '微信用户',
          avatar: userInfo?.avatarUrl || '',
        },
      });
      this.logger.log(`创建新用户：${user.nickname}`, 'AuthService');
    } else {
      // 更新用户信息
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          nickname: userInfo?.nickName || user.nickname,
          avatar: userInfo?.avatarUrl || user.avatar,
        },
      });
      this.logger.log(`更新用户信息：${user.nickname}`, 'AuthService');
    }

    // 3. 生成JWT token
    const token = this.generateToken(user);

    return {
      token,
      userInfo: {
        id: user.id,
        nickname: user.nickname,
        avatar: user.avatar,
        phone: user.phone,
        company: user.company,
        position: user.position,
      },
    };
  }

  /**
   * 获取微信openid
   */
  private async getWxOpenId(code: string) {
    const appid = this.configService.get('WECHAT_APPID');
    const secret = this.configService.get('WECHAT_SECRET');

    this.logger.debug(
      `准备调用微信接口 - appid: ${appid}, secret: ${secret ? '已配置' : '未配置'}, code: ${code}`,
      'AuthService'
    );

    try {
      const url = 'https://api.weixin.qq.com/sns/jscode2session';
      const params = {
        appid,
        secret,
        js_code: code,
        grant_type: 'authorization_code',
      };

      this.logger.debug('发送请求到微信服务器', 'AuthService');
      const response = await axios.get(url, { params });

      this.logger.debug(
        `收到微信服务器响应 - HTTP状态: ${response.status}, 数据: ${JSON.stringify(response.data)}`,
        'AuthService'
      );

      const { openid, unionid, session_key, errcode, errmsg } = response.data;

      // 检查微信返回的错误
      if (errcode) {
        this.logger.error(`微信API返回错误 - 错误码: ${errcode}, 错误信息: ${errmsg}`, '', 'AuthService');
        throw new UnauthorizedException(`微信登录失败: ${errmsg} (${errcode})`);
      }

      if (!openid) {
        this.logger.error('未获取到 openid', '', 'AuthService');
        throw new UnauthorizedException('微信登录失败：未获取到用户标识');
      }

      this.logger.log('成功获取 openid', 'AuthService');
      return { openid, unionid, session_key };
    } catch (error) {
      this.logger.error('调用微信接口异常', error.stack, 'AuthService');
      if (error.response) {
        this.logger.error(
          `HTTP错误 - 状态: ${error.response.status}, 数据: ${JSON.stringify(error.response.data)}`,
          '',
          'AuthService'
        );
      }
      throw new UnauthorizedException('微信登录失败，请稍后重试');
    }
  }

  /**
   * 绑定手机号（通过微信授权）
   */
  async bindPhone(userId: string, bindPhoneDto: BindPhoneDto) {
    const { code } = bindPhoneDto;

    this.logger.log(`[绑定手机号] 开始处理 - userId: ${userId}, code: ${code}`, 'AuthService');

    // 调用微信接口获取手机号
    let phoneNumber: string;
    try {
      phoneNumber = await this.getWxPhoneNumber(code);
      this.logger.log(`获取到手机号: ${phoneNumber}`, 'AuthService');
    } catch (error) {
      this.logger.error('获取微信手机号失败', error.stack, 'AuthService');
      throw new UnauthorizedException('获取手机号失败，请重试');
    }

    // 检查手机号是否已被其他用户使用
    const existingUser = await this.prisma.user.findFirst({
      where: {
        phone: phoneNumber,
        id: { not: userId },
      },
    });

    if (existingUser) {
      throw new UnauthorizedException('该手机号已被其他用户绑定');
    }

    // 更新用户手机号
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { phone: phoneNumber },
    });

    this.logger.log(`手机号绑定成功 - userId: ${userId}, phone: ${phoneNumber}`, 'AuthService');
    return {
      phone: user.phone,
    };
  }

  /**
   * 获取微信手机号
   */
  private async getWxPhoneNumber(code: string): Promise<string> {
    const accessToken = await this.getWxAccessToken();
    
    this.logger.debug(
      `准备调用微信手机号接口 - access_token: ${accessToken ? '已获取' : '未获取到'}, code: ${code}`,
      'AuthService'
    );

    try {
      const url = `https://api.weixin.qq.com/wxa/business/getuserphonenumber?access_token=${accessToken}`;
      const response = await axios.post(url, { code });

      this.logger.debug(
        `收到微信手机号接口响应 - HTTP状态: ${response.status}, 数据: ${JSON.stringify(response.data)}`,
        'AuthService'
      );

      const { errcode, errmsg, phone_info } = response.data;

      if (errcode !== 0) {
        this.logger.error(`微信API返回错误 - 错误码: ${errcode}, 错误信息: ${errmsg}`, '', 'AuthService');
        throw new Error(`微信接口错误: ${errmsg} (${errcode})`);
      }

      if (!phone_info || !phone_info.phoneNumber) {
        throw new Error('未获取到手机号信息');
      }

      return phone_info.phoneNumber;
    } catch (error) {
      this.logger.error('调用微信手机号接口异常', error.stack, 'AuthService');
      if (error.response) {
        this.logger.error(
          `HTTP错误 - 状态: ${error.response.status}, 数据: ${JSON.stringify(error.response.data)}`,
          '',
          'AuthService'
        );
      }
      throw error;
    }
  }

  /**
   * 获取微信 Access Token
   */
  private async getWxAccessToken(): Promise<string> {
    const appid = this.configService.get('WECHAT_APPID');
    const secret = this.configService.get('WECHAT_SECRET');

    try {
      const url = 'https://api.weixin.qq.com/cgi-bin/token';
      const response = await axios.get(url, {
        params: {
          grant_type: 'client_credential',
          appid,
          secret,
        },
      });

      const { access_token, errcode, errmsg } = response.data;

      if (errcode) {
        throw new Error(`获取access_token失败: ${errmsg} (${errcode})`);
      }

      return access_token;
    } catch (error) {
      this.logger.error('获取微信access_token失败', error.stack, 'AuthService');
      throw error;
    }
  }

  /**
   * 生成JWT token
   */
  private generateToken(user: any, expiresIn?: string) {
    const payload: any = {
      sub: user.id,
      role: user.role,
    };

    // 微信用户才有openid
    if (user.openid) {
      payload.openid = user.openid;
    }

    // 管理员用户添加额外信息
    if (user.phone) {
      payload.phone = user.phone;
    }
    if (user.email) {
      payload.email = user.email;
    }

    // 自定义过期时间（默认使用配置文件中的时间）
    const options = expiresIn ? { expiresIn } : undefined;

    return this.jwtService.sign(payload, options);
  }

  /**
   * 验证用户
   */
  async validateUser(userId: string) {
    return this.usersService.findOne(userId);
  }

  /**
   * 获取个人资料
   */
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        phone: true,
        email: true,
        nickname: true,
        realName: true,
        avatar: true,
        company: true,
        position: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    // 获取用户权限
    const permissions = await this.permissionsService.getRolePermissions(user.role);

    // 获取用户菜单（根据角色和权限过滤）
    const menus = await this.permissionsService.getMenusByRoleAndPermissions(user.role, permissions);

    return {
      user,
      permissions,
      menus, // 返回已过滤的菜单配置
    };
  }

  /**
   * 更新个人资料
   */
  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const { phone, email, ...updateData } = updateProfileDto;

    // 检查手机号是否已被其他用户使用
    if (phone) {
      const existingUser = await this.prisma.user.findFirst({
        where: {
          phone,
          id: { not: userId },
        },
      });

      if (existingUser) {
        throw new BadRequestException('该手机号已被其他用户使用');
      }
    }

    // 检查邮箱是否已被其他用户使用
    if (email) {
      const existingUser = await this.prisma.user.findFirst({
        where: {
          email,
          id: { not: userId },
        },
      });

      if (existingUser) {
        throw new BadRequestException('该邮箱已被其他用户使用');
      }
    }

    // 更新用户信息
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...updateData,
        phone,
        email,
      },
      select: {
        id: true,
        phone: true,
        email: true,
        nickname: true,
        realName: true,
        avatar: true,
        role: true,
        status: true,
      },
    });

    this.logger.log(`用户资料已更新 - userId: ${userId}`, 'AuthService');
    return user;
  }

  /**
   * 修改密码
   */
  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const { oldPassword, newPassword } = changePasswordDto;

    // 获取用户信息
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    // 验证原密码
    if (!user.password) {
      throw new BadRequestException('该账号未设置密码');
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('原密码错误');
    }

    // 加密新密码
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 更新密码
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    this.logger.log(`用户密码已修改 - userId: ${userId}`, 'AuthService');
    return { success: true, message: '密码修改成功' };
  }
}
