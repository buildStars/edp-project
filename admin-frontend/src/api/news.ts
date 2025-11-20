/**
 * 资讯管理API
 */
import { request } from '@/utils/request'
import type { News } from '@/types/models'
import type { PageResult, PageParams } from '@/types'

// 查询参数
export interface NewsQueryParams extends PageParams {
  category?: string
  status?: string
  keyword?: string
  startTime?: string
  endTime?: string
}

// 创建/更新参数
export interface NewsFormData {
  title: string
  category: 'NOTICE' | 'ALUMNI'
  coverImage?: string
  summary?: string
  content: string
  publishTime?: string
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  isTop?: boolean
}

/**
 * 获取资讯列表（管理端）
 */
export function getNewsList(params: NewsQueryParams) {
  return request.get<PageResult<News>>('/news', { 
    params: {
      ...params,
      admin: true  // 标记为管理端请求，显示所有状态
    }
  })
}

/**
 * 获取资讯详情
 */
export function getNewsDetail(id: string) {
  return request.get<News>(`/news/${id}`)
}

/**
 * 创建资讯
 */
export function createNews(data: NewsFormData) {
  return request.post<News>('/news', data)
}

/**
 * 更新资讯
 */
export function updateNews(id: string, data: NewsFormData) {
  return request.put<News>(`/news/${id}`, data)
}

/**
 * 删除资讯
 */
export function deleteNews(id: string) {
  return request.delete(`/news/${id}`)
}

/**
 * 批量删除资讯
 */
export function batchDeleteNews(ids: string[]) {
  return request.post('/news/batch-delete', { ids })
}

/**
 * 置顶资讯
 */
export function toggleTopNews(id: string, isTop: boolean) {
  return request.put(`/news/${id}/top`, { isTop })
}

/**
 * 发布资讯
 */
export function publishNews(id: string) {
  return request.put(`/news/${id}/publish`)
}

/**
 * 归档资讯
 */
export function archiveNews(id: string) {
  return request.put(`/news/${id}/archive`)
}


