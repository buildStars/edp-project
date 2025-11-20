import { request } from '@/utils/request'
import type { PageResult, PageParams } from '@/types'

// 报名申请状态
export type EnrollmentRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

// 报名申请
export interface EnrollmentRequest {
  id: string
  userId: string
  courseId: string
  realName: string
  phone: string
  company?: string
  position?: string
  remark?: string
  status: EnrollmentRequestStatus
  reviewedBy?: string
  reviewedAt?: string
  reviewNote?: string
  createdAt: string
  updatedAt: string
  user: {
    id: string
    nickname?: string
    avatar?: string
    phone?: string
  }
  course: {
    id: string
    title: string
    credit: number
    coverImage?: string
    startTime: string
  }
}

// 查询参数
export interface EnrollmentRequestQuery extends PageParams {
  status?: EnrollmentRequestStatus
  courseId?: string
  userId?: string
  keyword?: string
}

// 审批DTO
export interface ReviewEnrollmentRequestDto {
  status: 'APPROVED' | 'REJECTED'
  reviewNote?: string
  creditAmount?: number
}

/**
 * 获取报名申请列表
 */
export function getEnrollmentRequests(params: EnrollmentRequestQuery) {
  return request.get<PageResult<EnrollmentRequest>>('/enrollment-requests', { params })
}

/**
 * 审批报名申请
 */
export function reviewEnrollmentRequest(id: string, data: ReviewEnrollmentRequestDto) {
  return request.post(`/enrollment-requests/${id}/review`, data)
}

/**
 * 获取报名申请详情
 */
export function getEnrollmentRequestDetail(id: string) {
  return request.get<EnrollmentRequest>(`/enrollment-requests/${id}`)
}




