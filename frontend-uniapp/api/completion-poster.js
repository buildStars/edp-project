import { get } from './request'

/**
 * 获取结课海报数据
 */
export function getCompletionPoster(courseId) {
  return get(`/api/enrollments/completion-poster/${courseId}`)
}

/**
 * 检查是否有新的结课海报
 */
export function checkNewCompletionPosters() {
  return get('/api/enrollments/check-new-posters')
}

