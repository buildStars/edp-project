/**
 * 评价模块API
 */

import { get, post } from './request'

/**
 * 创建评价
 * @param {Object} data
 * @param {String} data.courseId - 课程ID
 * @param {Number} data.rating - 总体评分（1-5）
 * @param {Number} data.contentRating - 内容质量评分（可选，1-5）
 * @param {Number} data.teacherRating - 讲师水平评分（可选，1-5）
 * @param {Number} data.organizationRating - 组织服务评分（可选，1-5）
 */
export function createEvaluation(data) {
  return post('/api/evaluations', data)
}

/**
 * 获取我的评价列表
 */
export function getMyEvaluations() {
  return get('/api/evaluations/my')
}

/**
 * 获取课程评价列表
 * @param {String} courseId - 课程ID
 */
export function getCourseEvaluations(courseId) {
  return get(`/api/evaluations/course/${courseId}`)
}

/**
 * 获取课程评价统计
 * @param {String} courseId - 课程ID
 */
export function getCourseEvaluationStats(courseId) {
  return get(`/api/evaluations/course/${courseId}/stats`)
}

/**
 * 获取我对课程的评价
 * @param {String} courseId - 课程ID
 * @param {String} chapterId - 章节ID（可选）
 */
export function getMyCourseEvaluation(courseId, chapterId = null) {
  // 只有当 chapterId 有值时才添加到参数中
  const url = `/api/evaluations/course/${courseId}/my`
  if (chapterId && chapterId.trim() !== '') {
    return get(url, { chapterId })
  }
  return get(url)
}


