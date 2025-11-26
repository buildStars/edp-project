import request from '@/utils/request'

/**
 * 课件管理 API
 */

// 获取课件列表
export function getMaterialList(params: any) {
  return request.get('/materials', { params })
}

// 获取课件详情
export function getMaterialDetail(id: string) {
  return request.get(`/materials/${id}`)
}

// 创建课件
export function createMaterial(data: any) {
  return request.post('/materials', data)
}

// 更新课件
export function updateMaterial(id: string, data: any) {
  return request.put(`/materials/${id}`, data)
}

// 删除课件
export function deleteMaterial(id: string) {
  return request.delete(`/materials/${id}`)
}

// 上传课件文件
export function uploadMaterialFile(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return request.post('/materials/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 获取下载记录
export function getMaterialDownloads(materialId: string, params: any) {
  return request.get(`/materials/${materialId}/downloads`, { params })
}
