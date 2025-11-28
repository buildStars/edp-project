/**
 * 协会模块API
 */
import { get, post, del } from './request'

/**
 * 获取协会列表
 * @param {String} type 协会类型（alumni-同学会/club-俱乐部）
 */
export function getAssociationList(type) {
  return get('/api/associations', { type })
}

/**
 * 获取协会详情
 * @param {String|Number} id 协会ID
 */
export function getAssociationDetail(id) {
  return get(`/api/associations/${id}`)
}

/**
 * 获取活动列表
 * @param {Object} params 查询参数
 * @param {String|Number} params.associationId 协会ID（可选）
 * @param {Number} params.page 页码
 * @param {Number} params.pageSize 每页数量
 */
export function getActivityList(params) {
  return get('/api/activities', params)
}

/**
 * 获取活动详情
 * @param {String|Number} id 活动ID
 */
export function getActivityDetail(id) {
  return get(`/api/activities/${id}`)
}

/**
 * 活动点赞
 * @param {String|Number} activityId 活动ID
 */
export function likeActivity(activityId) {
  return post('/api/activities/like', { activityId })
}

/**
 * 取消点赞
 * @param {String|Number} activityId 活动ID
 */
export function unlikeActivity(activityId) {
  return del('/api/activities/like', { activityId })
}

/**
 * 获取协会加入状态
 * @param {String|Number} associationId 协会ID
 */
export function getAssociationJoinStatus(associationId) {
  return get(`/api/associations/${associationId}/join-status`)
}

/**
 * 申请加入协会
 * @param {String|Number} associationId 协会ID
 */
export function applyToJoinAssociation(associationId) {
  return post(`/api/associations/${associationId}/apply`)
}

