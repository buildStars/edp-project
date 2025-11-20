import { get, post } from './request'

/**
 * 生成礼物码（用于分享）
 */
export function generateGiftCode(data) {
  return post('/api/course-gifts/generate-code', data)
}

/**
 * 通过礼物码领取课程
 */
export function claimCourseByCode(data) {
  return post('/api/course-gifts/claim', data)
}

/**
 * 赠送课程（旧方法）
 */
export function giftCourse(data) {
  return post('/api/course-gifts', data)
}

/**
 * 获取我的赠送记录
 */
export function getMyCourseGifts(params) {
  return get('/api/course-gifts/my', params)
}

/**
 * 获取赠送统计
 */
export function getGiftStatistics() {
  return get('/api/course-gifts/statistics')
}



