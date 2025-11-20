import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('用户')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('info')
  @ApiOperation({ summary: '获取用户信息' })
  async getUserInfo(@CurrentUser() user: any) {
    return this.usersService.findOne(user.id);
  }

  @Put('info')
  @ApiOperation({ summary: '更新用户信息' })
  async updateUserInfo(
    @CurrentUser() user: any,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    console.log('[更新用户信息] userId:', user.id, 'data:', updateUserDto);
    return this.usersService.update(user.id, updateUserDto);
  }

  @Post('upload-avatar')
  @ApiOperation({ summary: '上传头像' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @CurrentUser() user: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.usersService.uploadAvatar(user.id, file);
  }

  @Get('advisor')
  @ApiOperation({ summary: '获取课程顾问信息' })
  async getAdvisor(@CurrentUser() user: any) {
    return this.usersService.getAdvisor(user.id);
  }

  // ==================== 管理接口 ====================
  // 注意：具体路由必须放在通配符路由(:id)之前

  @Post('create')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'STAFF', 'TEACHER')
  @ApiOperation({ summary: '创建用户（管理）' })
  async createUser(@Body() createUserDto: CreateUserDto, @CurrentUser() user: any) {
    return this.usersService.create(createUserDto, user);
  }

  @Get('advisors')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: '获取课程顾问列表（管理）' })
  async getAdvisorList() {
    return this.usersService.getAdvisorList();
  }

  @Get('list')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'STAFF', 'TEACHER')
  @ApiOperation({ summary: '获取用户列表（管理）' })
  async getUserList(@Query() query: any, @CurrentUser() user: any) {
    // 如果是教师，只返回自己课程的学员
    if (user.role === 'TEACHER') {
      return this.usersService.findTeacherStudents(user.id, query);
    }
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: '获取用户详情（管理）' })
  async getUserDetail(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'STAFF', 'TEACHER')
  @ApiOperation({ summary: '更新用户信息（管理）' })
  async updateUser(@Param('id') id: string, @Body() data: any, @CurrentUser() user: any) {
    return this.usersService.update(id, data, user);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: '删除用户（管理）' })
  async deleteUser(@Param('id') id: string) {
    return this.usersService.delete(id);
  }

  @Put(':id/advisor')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: '分配课程顾问（管理）' })
  async assignAdvisor(@Param('id') id: string, @Body() data: any) {
    return this.usersService.assignAdvisor(id, data.advisorId);
  }

  @Put(':id/role')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: '修改用户角色（管理员）' })
  async changeUserRole(@Param('id') id: string, @Body() data: any) {
    return this.usersService.changeRole(id, data.role);
  }

  @Put(':id/status')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: '修改用户状态（管理）' })
  async changeUserStatus(@Param('id') id: string, @Body() data: any) {
    return this.usersService.changeStatus(id, data.status);
  }

  @Get('stats/overview')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'STAFF')
  @ApiOperation({ summary: '获取用户统计数据（管理）' })
  async getUserStats() {
    return this.usersService.getUserStats();
  }
}

