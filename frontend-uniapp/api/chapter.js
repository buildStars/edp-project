/**
 * 章节管理 API
 */
import { get } from './request'

/**
 * 获取课程章节列表
 * @param {Object} params - 查询参数
 * @param {string} params.courseId - 课程ID
 * @param {string} params.status - 章节状态 (DRAFT/PUBLISHED/COMPLETED)
 * @returns {Promise}
 */
export function getChapters(params) {
  return get('/api/chapters', params)
}

/**
 * 获取章节详情
 * @param {string} id - 章节ID
 * @returns {Promise}
 */
export function getChapterDetail(id) {
  return get(`/api/chapters/${id}`)
}

