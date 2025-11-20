import { get, post, del } from './request'

/**
 * 创建报名申请（学分不足时）
 */
export function createEnrollmentRequest(data) {
  return post('/api/enrollment-requests', data)
}

/**
 * 获取我的报名申请列表
 */
export function getMyEnrollmentRequests(params) {
  return get('/api/enrollment-requests/my', params)
}

/**
 * 取消报名申请
 */
export function cancelEnrollmentRequest(id) {
  return del(`/api/enrollment-requests/${id}`)
}




