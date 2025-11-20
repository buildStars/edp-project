/**
 * 课件管理API
 */
import { request } from '@/utils/request'
import type { PageResult } from '@/types'

export interface Material {
  id: string
  courseId: string
  title: string
  fileUrl: string
  fileType: string
  fileSize: number
  uploadedBy: string
  chapterId?: string
  chapter?: {
    id: string
    title: string
    sortOrder: number
  }
  createdAt: string
  updatedAt: string
  _count?: {
    downloads: number
  }
}

export interface CreateMaterialDto {
  courseId: string
  title: string
  fileUrl: string
  fileType: string
  fileSize: number
  chapterId?: string
}

export interface UpdateMaterialDto {
  title?: string
  chapterId?: string
}

export interface MaterialQueryParams {
  courseId: string
  page?: number
  pageSize?: number
  keyword?: string
}

/**
 * 获取课件列表
 */
export function getMaterialList(params: MaterialQueryParams) {
  return request.get<PageResult<Material>>('/materials', { params })
}

/**
 * 创建课件
 */
export function createMaterial(data: CreateMaterialDto) {
  return request.post<Material>('/materials', data)
}

/**
 * 更新课件
 */
export function updateMaterial(id: string, data: UpdateMaterialDto) {
  return request.put(`/materials/${id}`, data)
}

/**
 * 删除课件
 */
export function deleteMaterial(id: string) {
  return request.delete(`/materials/${id}`)
}

/**
 * 批量删除课件
 */
export function batchDeleteMaterials(ids: string[]) {
  return request.post('/materials/batch-delete', { ids })
}

/**
 * 上传文件
 */
export function uploadFile(file: File, onProgress?: (percent: number) => void) {
  const formData = new FormData()
  formData.append('file', file)

  return request.post<{ url: string; filename: string; size: number; mimetype: string }>(
    '/upload/file',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(percent)
        }
      },
    }
  ).then(res => {
    // 转换返回格式以匹配前端期望
    const fileExtension = res.filename.split('.').pop()?.toLowerCase() || 'unknown'
    return {
      url: res.url,
      fileType: fileExtension,
      fileSize: res.size,
    }
  })
}

