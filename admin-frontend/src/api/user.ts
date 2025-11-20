/**
 * 用户管理API
 */
import { request } from '@/utils/request'
import type { User } from '@/types/models'
import type { PageResult, PageParams } from '@/types'

// 查询参数
export interface UserQueryParams extends PageParams {
  role?: string
  status?: string
  keyword?: string
  organizationId?: string
}

// 更新参数
export interface UserUpdateData {
  realName?: string
  phone?: string
  email?: string
  company?: string
  position?: string
  role?: string
  status?: string
  advisorId?: string
}

/**
 * 创建用户
 */
export interface CreateUserData {
  phone: string
  email?: string
  password: string
  nickname?: string
  realName?: string
  gender?: 'MALE' | 'FEMALE' | 'OTHER'
  role: 'STUDENT' | 'ADVISOR' | 'TEACHER' | 'STAFF' | 'ADMIN'
  status?: 'ACTIVE' | 'INACTIVE'
  company?: string
  position?: string
  idCard?: string
  organizationId?: string
  advisorId?: string
}

export function createUser(data: CreateUserData) {
  return request.post<User>('/users/create', data)
}

/**
 * 获取用户列表
 */
export function getUserList(params: UserQueryParams) {
  return request.get<PageResult<User>>('/users/list', { params })
}

/**
 * 获取用户列表（简化方法，用于搜索选择器）
 */
export function getUsers(params: UserQueryParams) {
  return request.get<PageResult<User>>('/users/list', { params })
}

/**
 * 获取用户详情
 */
export function getUserDetail(id: string) {
  return request.get<User>(`/users/${id}`)
}

/**
 * 更新用户
 */
export function updateUser(id: string, data: UserUpdateData) {
  return request.put<User>(`/users/${id}`, data)
}

/**
 * 删除用户
 */
export function deleteUser(id: string) {
  return request.delete(`/users/${id}`)
}

/**
 * 分配课程顾问
 */
export function assignAdvisor(userId: string, advisorId: string) {
  return request.put(`/users/${userId}/advisor`, { advisorId })
}

/**
 * 获取课程顾问列表
 */
export function getAdvisorList() {
  return request.get<User[]>('/users/advisors')
}

/**
 * 为用户充值学分（管理端）
 */
export function allocateCredit(userId: string, amount: number, remark?: string) {
  return request.post(`/credits/allocate`, {
    userId,
    amount,
    remark: remark || '管理员充值'
  })
}

/**
 * 修改用户角色（管理员）
 */
export function changeUserRole(userId: string, role: string) {
  return request.put(`/users/${userId}/role`, { role })
}

/**
 * 修改用户状态（管理）
 */
export function changeUserStatus(userId: string, status: string) {
  return request.put(`/users/${userId}/status`, { status })
}

/**
 * 获取用户统计数据（管理）
 */
export function getUserStats() {
  return request.get('/users/stats/overview')
}

