/**
 * 教师相关API
 */
import { request } from '@/utils/request'
import type { Course } from '@/types/models'

// 教师课程统计
export interface TeacherCourseStatistics {
  totalCourses: number
  activeCourses: number
  totalStudents: number
  pendingCheckins: number
}

// 教师课程响应
export interface TeacherCoursesResponse {
  courses: Course[]
  statistics: TeacherCourseStatistics
}

// 学员信息
export interface StudentInfo {
  id: string
  realName?: string
  nickname?: string
  phone?: string
  email?: string
  avatar?: string
  company?: string
  position?: string
  checkinCount: number
  evaluationCount: number
  courses: Array<{ id: string; title: string }>
  createdAt: string
}

// 学员列表响应
export interface StudentsResponse {
  students: StudentInfo[]
  total: number
  page: number
  pageSize: number
}

// 课程学员响应
export interface CourseStudent {
  id: string
  realName?: string
  nickname?: string
  phone?: string
  email?: string
  avatar?: string
  company?: string
  position?: string
  enrollmentId: string
  enrolledAt: string
  checkinCount: number
  hasEvaluated: boolean
  evaluation?: {
    rating: number
    contentRating?: number
    teacherRating?: number
    organizationRating?: number
    createdAt: string
  }
}

export interface CourseStudentsResponse {
  students: CourseStudent[]
  statistics: {
    total: number
    checkedIn: number
    evaluated: number
  }
}

// 签到统计
export interface CheckinSession {
  id: string
  startTime: string
  endTime: string
  isActive: boolean
  checkinCount: number
}

export interface CheckinStatsResponse {
  sessions: CheckinSession[]
  statistics: {
    totalSessions: number
    totalCheckins: number
    totalStudents: number
    averageAttendance: number
  }
}

// 评价统计
export interface Evaluation {
  id: string
  rating: number
  // 旧的三项评分（保留兼容性）
  contentRating?: number
  teacherRating?: number
  organizationRating?: number
  // 新的9项详细评分（10分制）
  attitude1Rating?: number  // 教学态度1：教学投入、有激情
  attitude2Rating?: number  // 教学态度2：教学认真、耐心、诚恳、友好
  content1Rating?: number   // 教学内容1：课程主题明晰，内容清晰，论证严密
  content2Rating?: number   // 教学内容2：课程内容实践性强，案例丰富
  method1Rating?: number    // 教学方法1：教学方法得当：逻辑性强，条理清晰，重点突出
  method2Rating?: number    // 教学方法2：教学对问题的阐析性强
  effect1Rating?: number    // 教学效果1：达到预期要求，学习有效，对工作或成长提供帮助
  effect2Rating?: number    // 教学效果2：学习了掌握新思想或新技能
  organizationRating?: number // 教务组织：教学课程资料准备充分
  // 文本建议
  suggestion?: string
  createdAt: string
  user: {
    id: string
    realName?: string
    nickname?: string
    avatar?: string
  }
}

export interface EvaluationStatsResponse {
  evaluations: Evaluation[]
  statistics: {
    totalCount: number
    averageRating: number
    ratingDistribution: {
      5: number
      4: number
      3: number
      2: number
      1: number
    }
    evaluationRate: number
    totalStudents: number
  }
}

/**
 * 获取教师的课程列表
 */
export function getTeacherCourses() {
  return request.get<TeacherCoursesResponse>('/teachers/my-courses')
}

/**
 * 获取教师的学员列表
 */
export function getTeacherStudents(params?: {
  page?: number
  pageSize?: number
  keyword?: string
}) {
  return request.get<StudentsResponse>('/teachers/my-students', { params })
}

/**
 * 获取某个课程的学员列表
 */
export function getCourseStudents(courseId: string) {
  return request.get<CourseStudentsResponse>(`/teachers/courses/${courseId}/students`)
}

/**
 * 获取课程签到统计
 */
export function getCourseCheckinStats(courseId: string) {
  return request.get<CheckinStatsResponse>(`/teachers/courses/${courseId}/checkin-stats`)
}

/**
 * 获取课程评价统计
 */
export function getCourseEvaluationStats(courseId: string) {
  return request.get<EvaluationStatsResponse>(`/teachers/courses/${courseId}/evaluation-stats`)
}

