/**
 * 搜索模块API
 */

import { get } from './request'

/**
 * 全局搜索
 * @param {String} keyword 搜索关键词
 * @param {String} type 搜索类型: news/course/activity，不传则搜索全部
 */
export function globalSearch(keyword, type) {
  const params = { keyword }
  if (type) {
    params.type = type
  }
  return get('/api/search', params)
}

/**
 * 获取热门搜索关键词
 */
export function getHotKeywords() {
  return get('/api/search/hot')
}

/**
 * 获取搜索历史
 * @param {String} userId 用户ID（可选）
 */
export function getSearchHistory(userId) {
  return get('/api/search/history', userId ? { userId } : {})
}


