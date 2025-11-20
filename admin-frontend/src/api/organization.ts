import request from '@/utils/request'

/**
 * 获取企业列表
 */
export function getOrganizations(params?: any) {
  return request({
    url: '/organizations',
    method: 'get',
    params
  })
}

/**
 * 获取企业详情
 */
export function getOrganization(id: string) {
  return request({
    url: `/organizations/${id}`,
    method: 'get'
  })
}

// 别名导出（兼容旧代码）
export const getOrganizationDetail = getOrganization

/**
 * 创建企业
 */
export function createOrganization(data: any) {
  return request({
    url: '/organizations',
    method: 'post',
    data
  })
}

/**
 * 更新企业
 */
export function updateOrganization(id: string, data: any) {
  return request({
    url: `/organizations/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除企业
 */
export function deleteOrganization(id: string) {
  return request({
    url: `/organizations/${id}`,
    method: 'delete'
  })
}

/**
 * 获取企业用户列表
 */
export function getOrganizationUsers(id: string, params?: any) {
  return request({
    url: `/organizations/${id}/users`,
    method: 'get',
    params
  })
}

/**
 * 添加企业用户
 */
export function addOrganizationUser(orgId: string, userId: string) {
  return request({
    url: `/organizations/${orgId}/users/${userId}`,
    method: 'post'
  })
}

/**
 * 移除企业用户
 */
export function removeOrganizationUser(orgId: string, userId: string) {
  return request({
    url: `/organizations/${orgId}/users/${userId}`,
    method: 'delete'
  })
}

/**
 * 获取企业统计信息
 */
export function getOrganizationStatistics(id: string) {
  return request({
    url: `/organizations/${id}/statistics`,
    method: 'get'
  })
}

/**
 * 分配学分给企业
 */
export function allocateCredits(id: string, data: { amount: number; validDays?: number }) {
  return request({
    url: `/organizations/${id}/allocate-credits`,
    method: 'post',
    data
  })
}
