import request from '@/utils/request'

export interface Chapter {
  id: string
  courseId: string
  title: string
  description?: string
  sortOrder: number
  duration?: number
  startTime?: string
  endTime?: string
  location?: string
  status: 'DRAFT' | 'PUBLISHED' | 'COMPLETED'
  createdAt?: string
  updatedAt?: string
  course?: {
    id: string
    title: string
  }
  _count?: {
    materials: number
    checkinSessions: number
    evaluations: number
  }
}

export interface ChapterQueryParams {
  courseId?: string
  status?: 'DRAFT' | 'PUBLISHED' | 'COMPLETED' | ''
  keyword?: string
}

export interface ChapterListResponse {
  items: Chapter[]
  total: number
}

// 查询章节列表
export function getChapters(params: ChapterQueryParams) {
  return request.get<ChapterListResponse>('/chapters', { params })
}

// 获取章节详情
export function getChapterDetail(id: string) {
  return request.get<Chapter>(`/chapters/${id}`)
}

// 创建章节
export function createChapter(data: Partial<Chapter>) {
  return request.post<Chapter>('/chapters', data)
}

// 更新章节
export function updateChapter(id: string, data: Partial<Chapter>) {
  return request.put<Chapter>(`/chapters/${id}`, data)
}

// 删除章节
export function deleteChapter(id: string) {
  return request.delete(`/chapters/${id}`)
}

// 批量更新排序
export function updateChapterSort(updates: Array<{ id: string; sortOrder: number }>) {
  return request.post('/chapters/sort-order', updates)
}

// 批量删除
export function batchDeleteChapters(ids: string[]) {
  return request.post('/chapters/batch-delete', { ids })
}

