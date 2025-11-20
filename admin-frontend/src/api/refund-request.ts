import { request } from '@/utils/request'
import type { PageResult, PageParams } from '@/types'

// 退课申请状态
export type RefundRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

// 退课申请
export interface RefundRequest {
  id: string
  enrollmentId: string
  userId: string
  courseId: string
  reason?: string
  creditAmount: number
  status: RefundRequestStatus
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
  }
  course: {
    id: string
    title: string
    credit: number
    coverImage?: string
    startTime: string
  }
  enrollment: {
    id: string
    createdAt: string
  }
}

// 查询参数
export interface RefundRequestQuery extends PageParams {
  status?: RefundRequestStatus
  courseId?: string
  userId?: string
}

// 审批DTO
export interface ReviewRefundRequestDto {
  status: 'APPROVED' | 'REJECTED'
  reviewNote?: string
}

/**
 * 获取退课申请列表
 */
export function getRefundRequests(params: RefundRequestQuery) {
  return request.get<PageResult<RefundRequest>>('/refund-requests', { params })
}

/**
 * 审批退课申请
 */
export function reviewRefundRequest(id: string, data: ReviewRefundRequestDto) {
  return request.post(`/refund-requests/${id}/review`, data)
}

/**
 * 获取退课申请详情
 */
export function getRefundRequestDetail(id: string) {
  return request.get<RefundRequest>(`/refund-requests/${id}`)
}




