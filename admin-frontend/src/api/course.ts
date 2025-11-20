/**
 * 课程管理API
 */
import { request } from '@/utils/request'
import type { Course } from '@/types/models'
import type { PageResult, PageParams } from '@/types'

// 查询参数
export interface CourseQueryParams extends PageParams {
  category?: string
  status?: string
  enrollStatus?: string
  keyword?: string
  startTime?: string
  endTime?: string
  approvalStatus?: 'pending' | 'approved' | 'rejected'
}

// 创建/更新参数
export interface CourseFormData {
  title: string
  coverImage?: string
  introduction?: string
  teacherId: string
  teacherName: string
  teacherAvatar?: string
  teacherTitle?: string
  teacherIntro?: string
  startTime: string
  endTime?: string
  location?: string
  credit: number
  maxStudents?: number
  requiredCheckins?: number  // 要求签到次数
  achievementCredit?: number  // 成就学分
  enrollStatus: 'OPEN' | 'CLOSED'
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
}

// 审批参数
export interface ApprovalData {
  action: 'approve' | 'reject'
  reason?: string
}

// 新审批参数（基于权限系统）
export interface ReviewCourseData {
  action: 'APPROVE' | 'REJECT'
  remark?: string
}

/**
 * 获取课程列表
 */
export function getCourseList(params: CourseQueryParams) {
  return request.get<PageResult<Course>>('/courses', { params })
}

/**
 * 获取课程详情
 */
export function getCourseDetail(id: string) {
  return request.get<Course>(`/courses/${id}`)
}

/**
 * 创建课程
 */
export function createCourse(data: CourseFormData) {
  return request.post<Course>('/courses', data)
}

/**
 * 更新课程
 */
export function updateCourse(id: string, data: CourseFormData) {
  return request.put<Course>(`/courses/${id}`, data)
}

/**
 * 删除课程
 */
export function deleteCourse(id: string) {
  return request.delete(`/courses/${id}`)
}

/**
 * 批量删除课程
 */
export function batchDeleteCourse(ids: string[]) {
  return request.post('/courses/batch-delete', { ids })
}

/**
 * 审批课程
 */
export function approveCourse(id: string, data: ApprovalData) {
  return request.post(`/courses/${id}/approve`, data)
}

/**
 * 发布课程
 */
export function publishCourse(id: string) {
  return request.put(`/courses/${id}/publish`)
}

/**
 * 归档课程
 */
export function archiveCourse(id: string) {
  return request.put(`/courses/${id}/archive`)
}

/**
 * 提交课程审批（教师）
 */
export function submitCourseApproval(id: string) {
  return request.post(`/courses/${id}/submit-approval`)
}

/**
 * 审批课程（管理员/教务 - 新接口）
 */
export function reviewCourse(id: string, data: ReviewCourseData) {
  return request.post(`/courses/${id}/review`, data)
}

/**
 * 更改报名状态
 */
export function updateEnrollStatus(id: string, status: 'OPEN' | 'CLOSED') {
  return request.put(`/courses/${id}/enroll-status`, { status })
}

// ============ 学分配置 ============

export interface CreditSpec {
  id: string
  credits: number
  validDays: number
  price?: number
  status: 'ACTIVE' | 'INACTIVE'
  createdAt: string
  updatedAt: string
}

export interface CreditSpecFormData {
  credits: number
  validDays: number
  price?: number
  status: 'ACTIVE' | 'INACTIVE'
}

/**
 * 获取学分规格列表
 */
export function getCreditSpecList() {
  return request.get<CreditSpec[]>('/credits/specs')
}

/**
 * 创建学分规格
 */
export function createCreditSpec(data: CreditSpecFormData) {
  return request.post<CreditSpec>('/credits/specs', data)
}

/**
 * 更新学分规格
 */
export function updateCreditSpec(id: string, data: CreditSpecFormData) {
  return request.put<CreditSpec>(`/credits/specs/${id}`, data)
}

/**
 * 删除学分规格
 */
export function deleteCreditSpec(id: string) {
  return request.delete(`/credits/specs/${id}`)
}

/**
 * 分配老师到课程
 */
export interface AssignTeacherData {
  teacherId: string
  teacherName: string
  teacherAvatar?: string
}

export function assignTeacherToCourse(courseId: string, data: AssignTeacherData) {
  return request.put(`/courses/${courseId}/assign-teacher`, data)
}


