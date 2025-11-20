/**
 * 签到模块API
 */

import { get, post, del } from './request'

/**
 * 获取活跃签到会话（学员）
 * @param {String} courseId - 课程ID
 */
export function getActiveCheckinSession(courseId) {
  return get(`/api/checkin/courses/${courseId}/active-session`)
}

/**
 * 签到码签到（学员）
 * @param {Object} data
 * @param {String} data.courseId - 课程ID
 * @param {String} data.code - 6位签到码
 */
export function checkinByCode(data) {
  return post('/api/checkin/by-code', data)
}

/**
 * 二维码签到（学员）
 * @param {Object} data
 * @param {String} data.sessionId - 签到会话ID
 * @param {String} data.courseId - 课程ID（可选）
 */
export function checkinByQRCode(data) {
  return post('/api/checkin/by-qrcode', data)
}

/**
 * 开启签到（教师/管理员）
 * @param {String} courseId - 课程ID
 * @param {Object} data
 * @param {Number} data.duration - 签到有效期（分钟）
 */
export function startCheckin(courseId, data) {
  return post(`/api/checkin/courses/${courseId}/start`, data)
}

/**
 * 结束签到（教师/管理员）
 * @param {String} courseId - 课程ID
 * @param {String} sessionId - 签到会话ID
 */
export function stopCheckin(courseId, sessionId) {
  return del(`/api/checkin/courses/${courseId}/sessions/${sessionId}`)
}

/**
 * 获取签到统计（教师/管理员）
 * @param {String} courseId - 课程ID
 * @param {String} sessionId - 签到会话ID
 */
export function getCheckinStatistics(courseId, sessionId) {
  return get(`/api/checkin/courses/${courseId}/sessions/${sessionId}/statistics`)
}

/**
 * 获取我的签到记录（学员）
 * @returns {Promise}
 */
export function getMyCheckinRecords() {
  return get('/api/checkin/my-records')
}

