/**
 * 活动管理API
 */
import { request } from '@/utils/request'
import type { Activity } from '@/types/models'
import type { PageResult, PageParams } from '@/types'

// 查询参数
export interface ActivityQueryParams extends PageParams {
  associationId?: string
  status?: string
  keyword?: string
}

// 创建/更新参数
export interface ActivityFormData {
  associationId?: string
  title: string
  images: string[]
  content: string
  publishTime?: string
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
}

/**
 * 获取活动列表
 */
export function getActivityList(params: ActivityQueryParams) {
  return request.get<PageResult<Activity>>('/activities', { params })
}

/**
 * 获取活动详情
 */
export function getActivityDetail(id: string) {
  return request.get<Activity>(`/activities/${id}`)
}

/**
 * 创建活动
 */
export function createActivity(data: ActivityFormData) {
  return request.post<Activity>('/activities', data)
}

/**
 * 更新活动
 */
export function updateActivity(id: string, data: ActivityFormData) {
  return request.put<Activity>(`/activities/${id}`, data)
}

/**
 * 删除活动
 */
export function deleteActivity(id: string) {
  return request.delete(`/activities/${id}`)
}

/**
 * 批量删除活动
 */
export function batchDeleteActivity(ids: string[]) {
  return request.post('/activities/batch-delete', { ids })
}

/**
 * 发布活动
 */
export function publishActivity(id: string) {
  return request.put(`/activities/${id}/publish`)
}

/**
 * 归档活动
 */
export function archiveActivity(id: string) {
  return request.put(`/activities/${id}/archive`)
}


