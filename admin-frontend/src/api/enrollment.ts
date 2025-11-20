/**
 * 报名管理API
 */
import { request } from '@/utils/request'
import type { Enrollment } from '@/types/models'
import type { PageResult, PageParams } from '@/types'

// 查询参数
export interface EnrollmentQueryParams extends PageParams {
  courseId?: string
  userId?: string
  status?: string
  isTrial?: boolean
  trialStatus?: string
  checkedIn?: boolean
  rated?: boolean
}

/**
 * 获取报名列表
 */
export function getEnrollmentList(params: EnrollmentQueryParams) {
  return request.get<PageResult<Enrollment>>('/enrollments', { params })
}

/**
 * 获取试听申请列表
 */
export function getTrialList(params: EnrollmentQueryParams) {
  return request.get<PageResult<Enrollment>>('/enrollments/trials', { params })
}

/**
 * 审核试听申请
 */
export function approveTrialApplication(id: string, status: 'APPROVED' | 'REJECTED', rejectReason?: string) {
  return request.put(`/enrollments/${id}/trial/approve`, { status, rejectReason })
}

/**
 * 获取签到列表
 */
export function getCheckInList(params: EnrollmentQueryParams) {
  return request.get<PageResult<Enrollment>>('/enrollments/checkins', { params })
}

/**
 * 批量签到
 */
export function batchCheckIn(ids: string[]) {
  return request.post('/enrollments/batch-checkin', { ids })
}

/**
 * 获取评价列表
 */
export function getEvaluationList(params: EnrollmentQueryParams) {
  return request.get<PageResult<Enrollment>>('/enrollments/evaluations', { params })
}


