/**
 * 签到管理API
 */
import { request } from '@/utils/request'

// 签到会话
export interface CheckinSession {
  sessionId: string
  courseId: string
  courseName: string
  code: string
  startTime: string
  endTime: string
  isActive: boolean
  qrData?: any
}

// 签到记录
export interface CheckinRecord {
  userId: string
  userName: string
  avatar?: string
  checkinTime: string
  method: 'QRCODE' | 'CODE' | 'MAKEUP'
}

// 签到统计
export interface CheckinStatistics {
  session: {
    id: string
    code: string
    startTime: string
    endTime: string
    isActive: boolean
  }
  courseName: string
  statistics: {
    totalStudents: number
    checkedIn: number
    notCheckedIn: number
    checkinRate: string
  }
  checkinList: CheckinRecord[]
  notCheckinList: {
    userId: string
    userName: string
    avatar?: string
  }[]
}

// 开启签到参数
export interface StartCheckinDto {
  duration: number // 签到有效期（分钟）
}

/**
 * 开启签到
 */
export function startCheckin(courseId: string, data: StartCheckinDto) {
  return request.post<CheckinSession>(`/checkin/courses/${courseId}/start`, data)
}

/**
 * 结束签到
 */
export function stopCheckin(courseId: string, sessionId: string) {
  return request.delete(`/checkin/courses/${courseId}/sessions/${sessionId}`)
}

/**
 * 获取签到统计
 */
export function getCheckinStatistics(courseId: string, sessionId: string) {
  return request.get<CheckinStatistics>(`/checkin/courses/${courseId}/sessions/${sessionId}/statistics`)
}

/**
 * 获取课程的活跃签到会话（学员端）
 */
export function getActiveCheckinSession(courseId: string, userId?: string) {
  return request.get(`/checkin/courses/${courseId}/active-session`, {
    params: userId ? { userId } : {}
  })
}

/**
 * 获取课程的活跃签到会话（管理员端）
 */
export function getActiveCheckinSessionAdmin(courseId: string) {
  return request.get<{
    hasActiveSession: boolean
    sessionId?: string
    code?: string
    courseId?: string
    courseName?: string
    startTime?: string
    endTime?: string
  }>(`/checkin/courses/${courseId}/active-session-admin`)
}

/**
 * 补签（管理员）
 * @param {String} courseId - 课程ID
 * @param {String} sessionId - 签到会话ID
 * @param {Object} data
 * @param {String} data.userId - 学员ID
 * @param {String} data.reason - 补签原因（可选）
 */
export function makeupCheckin(courseId: string, sessionId: string, data: { userId: string; reason?: string }) {
  return request.post(`/checkin/courses/${courseId}/sessions/${sessionId}/makeup`, data)
}

/**
 * 批量补签（管理员）
 * @param {String} courseId - 课程ID
 * @param {String} sessionId - 签到会话ID
 * @param {Object} data
 * @param {String[]} data.userIds - 学员ID列表
 * @param {String} data.reason - 补签原因（可选）
 */
export function batchMakeupCheckin(courseId: string, sessionId: string, data: { userIds: string[]; reason?: string }) {
  return request.post(`/checkin/courses/${courseId}/sessions/${sessionId}/batch-makeup`, data)
}

/**
 * 获取课程历史签到记录（教师/管理员）
 */
export interface CheckinHistorySession {
  id: string
  sessionId: string
  code: string
  startTime: string
  endTime: string
  isActive: boolean
  checkinCount: number
  createdAt: string
  updatedAt: string
}

export interface CheckinHistorySummary {
  totalSessions: number
  totalStudents: number
  totalCheckins: number
  averageAttendance: number
}

export interface CheckinHistoryResponse {
  summary: CheckinHistorySummary
  sessions: CheckinHistorySession[]
}

export function getCheckinHistory(courseId: string) {
  return request.get<CheckinHistoryResponse>(`/checkin/courses/${courseId}/history`)
}

