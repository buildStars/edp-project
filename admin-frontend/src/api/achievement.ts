/**
 * 学习成果管理API
 */
import { request } from '@/utils/request'
import type { PageResult } from '@/types'

/**
 * 学员签到情况
 */
export interface CourseStudent {
  userId: string
  realName: string
  phone: string
  avatar: string
  checkinCount: number
  requiredCheckins: number
  isQualified: boolean
  isCompleted: boolean  // 是否已完成课程
  hasAchievement: boolean
  achievement: {
    credit: number
    issuedAt: string
  } | null
}

export interface CourseStudentsResponse {
  course: {
    id: string
    title: string
    requiredCheckins: number
    achievementCredit: number
  }
  totalStudents: number
  qualifiedStudents: number
  issuedCount: number
  students: CourseStudent[]
}

/**
 * 学习成果记录
 */
export interface LearningAchievement {
  id: string
  userId: string
  courseId: string
  credit: number
  checkinCount: number
  requiredCheckins: number
  issuedBy: string
  issuedAt: string
  remark?: string
  user: {
    id: string
    realName: string
    nickname: string
    phone: string
  }
  course: {
    id: string
    title: string
    teacherName: string
  }
}

/**
 * 发放学习成果DTO
 */
export interface IssueAchievementDto {
  courseId: string
  userIds: string[]
  remark?: string
}

/**
 * 批量发放学习成果DTO
 */
export interface BatchIssueAchievementDto {
  courseId: string
  remark?: string
}

/**
 * 查询参数
 */
export interface QueryAchievementParams {
  userId?: string
  courseId?: string
  page?: number
  pageSize?: number
}

/**
 * 用户学习成果统计
 */
export interface UserAchievementSummary {
  userId: string
  totalCredit: number
  totalCourses: number
  achievements: Array<{
    credit: number
    course: {
      title: string
    }
  }>
}

// ========== API函数 ==========

/**
 * 获取课程学员签到情况
 */
export function getCourseStudents(courseId: string) {
  return request.get<CourseStudentsResponse>(`/achievements/courses/${courseId}/students`)
}

/**
 * 手动发放学习成果
 */
export function issueAchievements(data: IssueAchievementDto) {
  return request.post<{ message: string; successCount: number; failureCount: number }>(
    '/achievements/issue',
    data
  )
}

/**
 * 批量发放学习成果
 */
export function batchIssueAchievements(data: BatchIssueAchievementDto) {
  return request.post<{ message: string; successCount: number; failureCount: number }>(
    '/achievements/batch-issue',
    data
  )
}

/**
 * 查询学习成果列表
 */
export function getAchievementList(params: QueryAchievementParams) {
  return request.get<PageResult<LearningAchievement>>('/achievements', { params })
}

/**
 * 获取用户学习成果统计
 */
export function getUserAchievementSummary(userId: string) {
  return request.get<UserAchievementSummary>(`/achievements/users/${userId}/summary`)
}

/**
 * 获取我的学习成果
 */
export function getMyAchievements() {
  return request.get<UserAchievementSummary>('/achievements/my-achievements')
}


