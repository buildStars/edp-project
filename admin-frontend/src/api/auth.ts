/**
 * 认证相关API
 */
import { request } from '@/utils/request'

// 登录参数
export interface LoginParams {
  username: string
  password: string
  remember?: boolean
}

// 登录响应
export interface LoginResponse {
  token: string
  user: UserInfo
}

// 用户信息
export interface UserInfo {
  id: string
  username: string
  nickname?: string
  avatar?: string
  role: 'ADMIN' | 'STAFF' | 'TEACHER' | 'ADVISOR'
  phone?: string
  email?: string
}

// 用户信息响应
export interface UserInfoResponse {
  user: UserInfo
  permissions: string[]
}

/**
 * 登录
 */
export function login(data: LoginParams) {
  return request.post<LoginResponse>('/auth/admin-login', data)
}

/**
 * 登出
 */
export function logout() {
  return request.post('/auth/logout')
}

/**
 * 获取用户信息
 */
export function getUserInfo() {
  return request.get<UserInfoResponse>('/auth/profile')
}

/**
 * 修改密码
 */
export function changePassword(data: { oldPassword: string; newPassword: string }) {
  return request.post('/auth/change-password', data)
}

/**
 * 更新个人资料
 */
export interface UpdateProfileParams {
  nickname?: string
  avatar?: string
  phone?: string
  email?: string
}

export function updateProfile(data: UpdateProfileParams) {
  return request.put<UserInfo>('/auth/profile', data)
}
