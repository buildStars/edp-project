/**
 * 课程模块API
 */
import { get, post, put } from './request'

/**
 * 获取课程列表
 * @param {Object} params 查询参数
 * @param {String} params.category 课程分类（加速课堂/大师课堂/赋能课堂）
 * @param {Number} params.page 页码
 * @param {Number} params.pageSize 每页数量
 */
export function getCourseList(params) {
  return get('/api/courses', params)
}

/**
 * 获取课程详情
 * @param {String|Number} id 课程ID
 */
export function getCourseDetail(id) {
  return get(`/api/courses/${id}`)
}

/**
 * 申请试听
 * @param {Object} data 申请数据
 * @param {String|Number} data.courseId 课程ID
 * @param {String} data.name 姓名
 * @param {String} data.phone 电话
 * @param {String} data.company 公司
 * @param {String} data.position 职位
 */
export function applyTrial(data) {
  return post('/api/course/apply-trial', data)
}

/**
 * 报名课程（已购次卡用户）
 * @param {String|Number} courseId 课程ID
 */
export function enrollCourse(courseId) {
  return post('/api/enrollments/enroll', { courseId })
}

/**
 * 课程签到
 * @param {String|Number} courseId 课程ID
 */
export function checkinCourse(courseId) {
  return post('/api/enrollments/checkin', { courseId })
}

/**
 * 课程评价
 * @param {Object} data 评价数据
 * @param {String|Number} data.courseId 课程ID
 * @param {Number} data.rating 评分（1-5）
 */
export function evaluateCourse(data) {
  return post('/api/enrollments/evaluate', data)
}

/**
 * 获取课件下载链接
 * @param {String|Number} courseId 课程ID
 */
export function getCourseware(courseId) {
  return get('/api/course/courseware', { courseId })
}

/**
 * 获取课程课件列表
 * @param {String|Number} courseId 课程ID
 * @param {String} chapterId 章节ID（可选）
 */
export function getCourseMaterials(courseId, chapterId = null) {
  const params = chapterId ? { chapterId } : {}
  return get(`/api/courses/${courseId}/materials`, params)
}

/**
 * 获取我的课程列表
 * @param {String} status 状态（enrolled-已报名/completed-已完成）
 */
export function getMyCourses(status) {
  return get('/api/enrollments/my', { status })
}

/**
 * 获取我的学分信息
 */
export function getMyCredits() {
  return get('/api/credits/my')
}

/**
 * 赠送课程
 * @param {Object} data 赠送数据
 * @param {String|Number} data.courseId 课程ID
 * @param {String} data.friendPhone 好友手机号
 */
export function giftCourse(data) {
  return post('/api/course/gift', data)
}

