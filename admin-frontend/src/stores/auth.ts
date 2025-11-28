/**
 * 认证状态管理
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login as loginApi, logout as logoutApi, getUserInfo } from '@/api/auth'
import type { LoginParams, UserInfo } from '@/api/auth'
import router from '@/router'

export const useAuthStore = defineStore(
  'auth',
  () => {
    // 状态
    const token = ref<string>('')
    const userInfo = ref<UserInfo | null>(null)
    const permissions = ref<string[]>([])
    const menus = ref<any[]>([])

    // 登录
    const login = async (params: LoginParams) => {
      try {
        const res = await loginApi(params)
        token.value = res.token
        userInfo.value = res.user

        // 获取用户权限
        await fetchUserInfo()

        return res
      } catch (error) {
        throw error
      }
    }

    // 获取用户信息
    const fetchUserInfo = async () => {
      try {
        const res = await getUserInfo()
        userInfo.value = res.user
        permissions.value = res.permissions || []
        menus.value = res.menus || [] // 保存后端返回的菜单配置
        return res
      } catch (error) {
        throw error
      }
    }

    // 登出
    const logout = async (skipApi: boolean = false) => {
      try {
        // 只有在非强制登出时才调用API
        if (!skipApi) {
          await logoutApi()
        }
      } catch (error) {
        console.error('Logout error:', error)
      } finally {
        // 清除状态
        token.value = ''
        userInfo.value = null
        permissions.value = []
        menus.value = []

        // 跳转登录页
        router.push('/login')
      }
    }

    // 检查权限
    const hasPermission = (permission: string) => {
      // 超级管理员拥有所有权限
      if (userInfo.value?.role === 'ADMIN') {
        return true
      }
      return permissions.value.includes(permission)
    }

    // 检查角色
    const hasRole = (roles: string | string[]) => {
      if (!userInfo.value) return false

      const roleArray = Array.isArray(roles) ? roles : [roles]
      return roleArray.includes(userInfo.value.role)
    }

    return {
      token,
      userInfo,
      permissions,
      menus,
      login,
      fetchUserInfo,
      logout,
      hasPermission,
      hasRole,
    }
  },
  {
    persist: {
      key: 'edp-admin-auth',
      storage: localStorage,
      paths: ['token', 'userInfo', 'permissions', 'menus'], // 添加 menus 到持久化配置
    },
  }
)


