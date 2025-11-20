/**
 * 资讯模块API
 */
import { get, post, del } from './request'

/**
 * 获取资讯列表
 * @param {Object} params 查询参数
 * @param {String} params.category 分类（学院通知/校友动态）
 * @param {Number} params.page 页码
 * @param {Number} params.pageSize 每页数量
 */
export function getNewsList(params) {
  return get('/api/news', params)
}

/**
 * 获取资讯详情
 * @param {String|Number} id 资讯ID
 */
export function getNewsDetail(id) {
  return get(`/api/news/${id}`)
}

/**
 * 收藏资讯
 * @param {String|Number} newsId 资讯ID
 */
export function collectNews(newsId) {
  return post('/api/news/collect', { newsId })
}

/**
 * 取消收藏资讯
 * @param {String|Number} newsId 资讯ID
 */
export function uncollectNews(newsId) {
  return del('/api/news/collect', { newsId })
}

/**
 * 获取我的收藏列表
 * @param {Object} params 查询参数
 */
export function getMyCollectionList(params) {
  return get('/api/news/my-collection', params)
}

