/**
 * 结课申请管理API
 */
import { request } from '@/utils/request'
import type { PageResult } from '@/types'

/**
 * 结课申请状态
 */
export type CompletionRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'

/**
 * 结课申请记录
 */
export interface CourseCompletionRequest {
  id: string
  courseId: string
  teacherId: string
  teacherName: string
  status: CompletionRequestStatus
  totalStudents: number
  qualifiedStudents: number
  reviewerId?: string
  reviewerName?: string
  reviewedAt?: string
  reviewRemark?: string
  createdAt: string
  updatedAt: string
  course: {
    id: string
    title: string
    teacherName: string
  }
}

/**
 * 创建结课申请DTO
 */
export interface CreateCompletionRequestDto {
  courseId: string
}

/**
 * 审批结课申请DTO
 */
export interface ReviewCompletionRequestDto {
  status: 'APPROVED' | 'REJECTED'
  remark?: string
}

/**
 * 查询参数
 */
export interface QueryCompletionRequestParams {
  courseId?: string
  teacherId?: string
  status?: CompletionRequestStatus
  page?: number
  pageSize?: number
}

// ========== API函数 ==========

/**
 * 发起结课申请（教师）
 */
export function createCompletionRequest(data: CreateCompletionRequestDto) {
  return request.post<CourseCompletionRequest>('/course-completion', data)
}

/**
 * 审批结课申请（教务/管理员）
 */
export function reviewCompletionRequest(id: string, data: ReviewCompletionRequestDto) {
  return request.put<CourseCompletionRequest>(`/course-completion/${id}/review`, data)
}

/**
 * 取消结课申请（教师）
 */
export function cancelCompletionRequest(id: string) {
  return request.put<CourseCompletionRequest>(`/course-completion/${id}/cancel`)
}

/**
 * 查询结课申请列表
 */
export function getCompletionRequestList(params: QueryCompletionRequestParams) {
  return request.get<PageResult<CourseCompletionRequest>>('/course-completion', { params })
}

/**
 * 获取结课申请详情
 */
export function getCompletionRequestDetail(id: string) {
  return request.get<CourseCompletionRequest>(`/course-completion/${id}`)
}

/**
 * 单独给学员发放海报（教师手动结课）
 */
export interface CompleteStudentManuallyDto {
  courseId: string
  userId: string
  remark?: string
}

export function completeStudentManually(data: CompleteStudentManuallyDto) {
  return request.post('/course-completion/manual-complete', data)
}

/**
 * 批量给学员发放海报（教师批量操作）
 */
export interface CompleteStudentsBatchDto {
  courseId: string
  userIds: string[]
  remark?: string
}

export function completeStudentsBatch(data: CompleteStudentsBatchDto) {
  return request.post('/course-completion/batch-complete', data)
}

