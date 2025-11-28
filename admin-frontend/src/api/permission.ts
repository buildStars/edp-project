import request from '@/utils/request'

/**
 * 获取所有权限列表
 */
export function getAllPermissions() {
  return request.get('/permissions')
}

/**
 * 获取所有角色及其权限
 */
export function getAllRolePermissions() {
  return request.get('/permissions/roles')
}

/**
 * 获取指定角色的权限
 */
export function getRolePermissions(role: string) {
  return request.get(`/permissions/roles/${role}`)
}

/**
 * 获取菜单配置（用于权限配置页面）
 */
export function getMenuConfig() {
  return request.get('/permissions/menus')
}

/**
 * 更新角色权限配置
 */
export function updateRolePermissions(role: string, permissions: string[]) {
  return request.post(`/permissions/roles/${role}`, { permissions })
}

/**
 * 获取菜单配置（用于构建权限树）
 */
export function getMenuConfig() {
  return request.get('/permissions/menu-config')
}

