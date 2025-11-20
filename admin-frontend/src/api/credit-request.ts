/**
 * 学分申请API
 */
import { request } from '@/utils/request'
import type { PageResult } from '@/types'

export interface CreditRequest {
  id: string
  teacherId: string
  teacher: {
    id: string
    realName?: string
    nickname?: string
  }
  userId: string
  user: {
    id: string
    realName?: string
    nickname?: string
  }
  amount: number
  reason: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'
  reviewerId?: string
  reviewer?: {
    id: string
    realName?: string
    nickname?: string
  }
  reviewRemark?: string
  reviewTime?: string
  createdAt: string
}

export interface CreateCreditRequestDto {
  userId: string
  amount: number
  reason: string
}

export interface ReviewCreditRequestDto {
  action: 'APPROVE' | 'REJECT'
  remark?: string
}

export interface CreditRequestQueryParams {
  page?: number
  pageSize?: number
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | ''
  keyword?: string
  teacherId?: string
  userId?: string
}

export interface CreditRequestStatistics {
  total: number
  pending: number
  approved: number
  rejected: number
  cancelled: number
}

// 创建学分申请（教师）
export function createCreditRequest(data: CreateCreditRequestDto) {
  return request.post<CreditRequest>('/credit-requests', data)
}

// 查询学分申请列表
export function getCreditRequests(params: CreditRequestQueryParams) {
  return request.get<PageResult<CreditRequest>>('/credit-requests', { params })
}

// 获取学分申请详情
export function getCreditRequestDetail(id: string) {
  return request.get<CreditRequest>(`/credit-requests/${id}`)
}

// 审批学分申请（管理员/教务）
export function reviewCreditRequest(id: string, data: ReviewCreditRequestDto) {
  return request.patch(`/credit-requests/${id}/review`, data)
}

// 取消学分申请（教师）
export function cancelCreditRequest(id: string) {
  return request.patch(`/credit-requests/${id}/cancel`)
}

// 获取统计数据
export function getCreditRequestStatistics() {
  return request.get<CreditRequestStatistics>('/credit-requests/statistics')
}

