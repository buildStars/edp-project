/**
 * 权限指令
 * 使用方式：v-permission="'user:create'"
 *         v-permission="['user:create', 'user:edit']" (任意一个)
 */
import type { Directive, DirectiveBinding } from 'vue'
import { useAuthStore } from '@/stores/auth'

export const permission: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const { value } = binding
    const authStore = useAuthStore()
    const permissions = authStore.permissions || []
    const userRole = authStore.userInfo?.role

    // 超级管理员拥有所有权限
    if (userRole === 'ADMIN') {
      return
    }

    if (value) {
      const hasPermission = checkPermission(value, permissions)
      if (!hasPermission) {
        // 移除元素
        el.parentNode?.removeChild(el)
      }
    } else {
      throw new Error('权限指令需要权限代码! 示例: v-permission="\'user:create\'"')
    }
  },
}

/**
 * 检查权限
 * @param value 权限代码或权限代码数组
 * @param permissions 用户拥有的权限列表
 * @returns 是否有权限
 */
function checkPermission(value: string | string[], permissions: string[]): boolean {
  if (typeof value === 'string') {
    // 1. 直接匹配
    if (permissions.includes(value)) {
      return true
    }
    
    // 2. 模块继承：提取模块名，检查是否有 module:view 权限
    const module = value.split(':')[0]
    const viewPermission = `${module}:view`
    return permissions.includes(viewPermission)
  }

  if (Array.isArray(value)) {
    // 数组形式表示"或"关系，有任意一个权限即可
    return value.some((permission) => {
      // 1. 直接匹配
      if (permissions.includes(permission)) {
        return true
      }
      
      // 2. 模块继承
      const module = permission.split(':')[0]
      const viewPermission = `${module}:view`
      return permissions.includes(viewPermission)
    })
  }

  return false
}

export default permission














