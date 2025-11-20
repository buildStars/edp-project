/**
 * 评价管理API
 */
import { request } from '@/utils/request'
import type { PageResult, PageParams } from '@/types'

// 评价模型
export interface Evaluation {
  id: string
  courseId: string
  userId: string
  enrollmentId?: string
  rating: number
  contentRating?: number
  teacherRating?: number
  organizationRating?: number
  comment?: string
  createdAt: string
  updatedAt: string
  course?: {
    id: string
    title: string
    coverImage?: string
    teacherName: string
  }
  user?: {
    id: string
    nickname?: string
    realName?: string
    avatar?: string
  }
}

// 查询参数
export interface EvaluationQueryParams extends PageParams {
  courseId?: string
  userId?: string
  rating?: number
  keyword?: string
}

/**
 * 获取所有评价列表（管理员）
 */
export function getEvaluationList(params: EvaluationQueryParams) {
  return request.get<PageResult<Evaluation>>('/evaluations/admin/list', { params })
}

/**
 * 删除评价
 */
export function deleteEvaluation(id: string) {
  return request.delete(`/evaluations/${id}`)
}

/**
 * 获取课程评价列表
 */
export function getCourseEvaluations(courseId: string) {
  return request.get<Evaluation[]>(`/evaluations/course/${courseId}`)
}

/**
 * 获取课程评价统计
 */
export function getCourseEvaluationStats(courseId: string) {
  return request.get(`/evaluations/course/${courseId}/stats`)
}





