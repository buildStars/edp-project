/**
 * 协会管理API
 */
import { request } from '@/utils/request'
import type { Association } from '@/types/models'
import type { PageResult, PageParams } from '@/types'

// 查询参数
export interface AssociationQueryParams extends PageParams {
  type?: string
  keyword?: string
}

// 创建/更新参数
export interface AssociationFormData {
  name: string
  type: 'ALUMNI' | 'CLUB'
  logo?: string
  description?: string
  introduction?: string
  contactPerson?: string
  contactPhone?: string
  contactEmail?: string
  wechat?: string
}

/**
 * 获取协会列表
 */
export function getAssociationList(params: AssociationQueryParams) {
  return request.get<PageResult<Association>>('/associations', { params })
}

/**
 * 获取协会详情
 */
export function getAssociationDetail(id: string) {
  return request.get<Association>(`/associations/${id}`)
}

/**
 * 创建协会
 */
export function createAssociation(data: AssociationFormData) {
  return request.post<Association>('/associations', data)
}

/**
 * 更新协会
 */
export function updateAssociation(id: string, data: AssociationFormData) {
  return request.put<Association>(`/associations/${id}`, data)
}

/**
 * 删除协会
 */
export function deleteAssociation(id: string) {
  return request.delete(`/associations/${id}`)
}

/**
 * 批量删除协会
 */
export function batchDeleteAssociation(ids: string[]) {
  return request.post('/associations/batch-delete', { ids })
}

// ========== 加入申请管理 ==========

// 加入申请状态
export type JoinRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

// 加入申请查询参数
export interface JoinRequestQueryParams extends PageParams {
  associationId?: string
  userId?: string
  status?: JoinRequestStatus
}

// 加入申请详情
export interface AssociationJoinRequest {
  id: string
  userId: string
  associationId: string
  status: JoinRequestStatus
  reason?: string
  reviewedBy?: string
  reviewedAt?: string
  reviewNote?: string
  createdAt: string
  updatedAt: string
  user: {
    id: string
    nickname?: string
    realName?: string
    avatar?: string
    phone?: string
    company?: string
    position?: string
  }
  association: {
    id: string
    name: string
    type: 'ALUMNI' | 'CLUB'
    logo?: string
  }
  reviewer?: {
    id: string
    nickname?: string
    realName?: string
  }
}

// 审批参数
export interface ReviewJoinRequestData {
  status: 'APPROVED' | 'REJECTED'
  reviewNote?: string
}

/**
 * 获取加入申请列表
 */
export function getJoinRequestList(params: JoinRequestQueryParams) {
  return request.get<PageResult<AssociationJoinRequest>>('/associations/join-requests/list', { params })
}

/**
 * 审批加入申请
 */
export function reviewJoinRequest(requestId: string, data: ReviewJoinRequestData) {
  return request.put(`/associations/join-requests/${requestId}/review`, data)
}


