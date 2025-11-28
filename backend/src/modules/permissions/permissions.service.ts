import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { UserRole } from '@prisma/client';
import { MENU_CONFIG, MenuItem } from './menu.config';

@Injectable()
export class PermissionsService {
  constructor(private prisma: PrismaService) {}

  /**
   * 获取角色的所有权限
   * @param role 用户角色
   * @returns 权限代码列表
   */
  async getRolePermissions(role: UserRole): Promise<string[]> {
    // 查询角色的权限（包括管理员，也按实际配置查询）
    const rolePermissions = await this.prisma.rolePermission.findMany({
      where: { role },
      include: {
        permission: {
          select: { code: true },
        },
      },
    });

    const permissions = rolePermissions.map((rp) => rp.permission.code);
    console.log(`🔍 查询角色 ${role} 的权限: ${permissions.length} 个`);
    return permissions;
  }

  /**
   * 获取所有权限列表
   * @returns 权限列表
   */
  async getAllPermissions() {
    const permissions = await this.prisma.permission.findMany({
      orderBy: [{ module: 'asc' }, { createdAt: 'asc' }],
    });

    return permissions;
  }

  /**
   * 获取菜单配置（用于权限配置页面）
   * 返回完整的菜单树结构，包含权限信息
   */
  getMenuConfig() {
    return MENU_CONFIG;
  }

  /**
   * 获取所有角色及其权限
   * @returns 角色权限映射
   */
  async getAllRolePermissions() {
    const roles = Object.values(UserRole);
    const result = [];

    for (const role of roles) {
      const permissions = await this.getRolePermissions(role);
      result.push({
        role,
        permissions,
      });
    }

    return result;
  }

  /**
   * 更新角色权限配置
   * @param role 角色
   * @param permissionCodes 权限代码列表（前端传入的菜单权限）
   */
  async updateRolePermissions(role: UserRole, permissionCodes: string[]) {
    // 1. 先去重权限代码
    const uniquePermissionCodes = Array.from(new Set(permissionCodes));
    
    // 2. 获取所有权限
    const allPermissions = await this.prisma.permission.findMany({
      select: { id: true, code: true, module: true },
    });
    const permissionMap = new Map<string, string>();
    const allPermissionsByModule = new Map<string, string[]>();
    
    allPermissions.forEach((p) => {
      permissionMap.set(p.code, p.id);
      
      // 按模块分组
      if (!allPermissionsByModule.has(p.module)) {
        allPermissionsByModule.set(p.module, []);
      }
      allPermissionsByModule.get(p.module).push(p.code);
    });

    // 3. 不进行任何自动推导，直接使用前端传入的权限
    // 前端已经通过 v-permission 指令实现了权限继承逻辑
    // 后端只需要原样保存前端选中的菜单权限即可
    const finalPermissionCodes = new Set(uniquePermissionCodes);

    console.log(`📝 角色 ${role} 权限配置:`, {
      权限数量: uniquePermissionCodes.length,
      权限列表: uniquePermissionCodes,
    });

    // 4. 删除该角色的所有现有权限
    await this.prisma.rolePermission.deleteMany({
      where: { role },
    });

    // 5. 创建新的权限关联
    const validPermissions = Array.from(finalPermissionCodes)
      .map((code) => {
        const permissionId = permissionMap.get(code);
        if (!permissionId) {
          console.warn(`警告：权限代码 ${code} 不存在`);
          return null;
        }
        return {
          role,
          permissionId,
        };
      })
      .filter((item) => item !== null);

    if (validPermissions.length > 0) {
      await this.prisma.rolePermission.createMany({
        data: validPermissions,
        skipDuplicates: true,
      });
    }

    // 6. 返回更新后的权限列表
    const finalPermissions = await this.getRolePermissions(role);
    return {
      role,
      permissions: finalPermissions,
      message: `成功为角色 ${role} 配置了 ${finalPermissions.length} 个权限`,
    };
  }

  /**
   * 根据用户角色和权限过滤菜单
   * @param userRole 用户角色
   * @param permissions 用户拥有的权限列表
   * @returns 过滤后的菜单配置
   */
  async getMenusByRoleAndPermissions(userRole: UserRole, permissions: string[]): Promise<MenuItem[]> {
    console.log(`🔍 过滤菜单 - 角色: ${userRole}, 权限数量: ${permissions.length}`);
    const filteredMenus = this.filterMenus(MENU_CONFIG, userRole, permissions);
    console.log(`📋 过滤后菜单数量: ${filteredMenus.length}`);
    return filteredMenus;
  }

  /**
   * 递归过滤菜单项
   * @private
   */
  private filterMenus(menus: MenuItem[], userRole: UserRole, permissions: string[]): MenuItem[] {
    const result: MenuItem[] = [];

    for (const menu of menus) {
      // 1. 检查角色限制
      if (menu.roles && menu.roles.length > 0) {
        if (!menu.roles.includes(userRole)) {
          continue; // 角色不匹配，跳过此菜单
        }
      }

      // 2. 检查权限要求
      if (menu.permission) {
        if (!permissions.includes(menu.permission)) {
          continue; // 没有所需权限，跳过此菜单
        }
      }

      // 3. 递归过滤子菜单
      let filteredMenu = { ...menu };
      if (menu.children && menu.children.length > 0) {
        const filteredChildren = this.filterMenus(menu.children, userRole, permissions);
        
        console.log(`  📁 ${menu.title}: 原有 ${menu.children.length} 个子菜单, 过滤后 ${filteredChildren.length} 个`);
        
        // 如果子菜单全部被过滤，则父菜单也不显示
        if (filteredChildren.length === 0) {
          console.log(`  ❌ ${menu.title}: 所有子菜单被过滤，父菜单也隐藏`);
          continue;
        }
        
        filteredMenu.children = filteredChildren;
      }

      result.push(filteredMenu);
    }

    return result;
  }
}



