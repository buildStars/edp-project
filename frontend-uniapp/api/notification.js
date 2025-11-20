import { get, post, del } from './request'

/**
 * 获取通知列表
 * @param {Object} params - 查询参数
 * @param {Number} params.page - 页码
 * @param {Number} params.pageSize - 每页数量
 * @param {String} params.type - 通知类型（可选）
 * @param {Boolean} params.isRead - 是否已读（可选）
 */
export function getNotificationList(params) {
  return get('/api/notifications', params)
}

/**
 * 获取未读消息数量
 */
export function getUnreadCount() {
  return get('/api/notifications/unread-count')
}

/**
 * 获取通知详情
 * @param {String} id - 通知ID
 */
export function getNotificationDetail(id) {
  return get(`/api/notifications/${id}`)
}

/**
 * 标记为已读/未读
 * @param {Object} data
 * @param {Array} data.ids - 通知ID列表（不传则标记全部）
 * @param {Boolean} data.isRead - 是否已读，默认 true
 */
export function markAsRead(data) {
  return post('/api/notifications/mark-read', data)
}

/**
 * 清空已读通知
 */
export function clearReadNotifications() {
  return del('/api/notifications/clear-read')
}

/**
 * 删除通知
 * @param {String} id - 通知ID
 */
export function deleteNotification(id) {
  return del(`/api/notifications/${id}`)
}

