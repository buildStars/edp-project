import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PermissionsService } from './permissions.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UpdateRolePermissionsDto } from './dto/update-role-permissions.dto';

@ApiTags('权限管理')
@Controller('permissions')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  @Roles('ADMIN')
  @ApiOperation({ summary: '获取所有权限列表' })
  async getAllPermissions() {
    return this.permissionsService.getAllPermissions();
  }

  @Get('roles')
  @Roles('ADMIN')
  @ApiOperation({ summary: '获取所有角色及其权限' })
  async getAllRolePermissions() {
    return this.permissionsService.getAllRolePermissions();
  }

  @Get('menus')
  @Roles('ADMIN')
  @ApiOperation({ summary: '获取菜单配置（用于权限配置页面）' })
  async getMenuConfig() {
    return this.permissionsService.getMenuConfig();
  }

  @Get('roles/:role')
  @Roles('ADMIN')
  @ApiOperation({ summary: '获取指定角色的权限' })
  async getRolePermissions(@Param('role') role: string) {
    return this.permissionsService.getRolePermissions(role as any);
  }

  @Post('roles/:role')
  @Roles('ADMIN')
  @ApiOperation({ summary: '更新角色权限配置' })
  async updateRolePermissions(
    @Param('role') role: string,
    @Body() dto: UpdateRolePermissionsDto,
  ) {
    return this.permissionsService.updateRolePermissions(role as any, dto.permissions);
  }
}



