import { get, post, del } from './request'

/**
 * 创建退课申请
 */
export function createRefundRequest(data) {
  return post('/api/refund-requests', data)
}

/**
 * 获取我的退课申请列表
 */
export function getMyRefundRequests(params) {
  return get('/api/refund-requests/my', params)
}

/**
 * 取消退课申请
 */
export function cancelRefundRequest(id) {
  return del(`/api/refund-requests/${id}`)
}




