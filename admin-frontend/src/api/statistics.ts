import request from '@/utils/request'

export interface DashboardStatistics {
  totalUsers: number
  todayUsers: number
  totalCourses: number
  activeCourses: number
  totalEnrollments: number
  monthEnrollments: number
  totalNews: number
  weekNews: number
  pendingCourses: number
  pendingTrials: number
  todayCheckins: number
  draftCourses?: number // 教师：草稿课程数
  totalStudents?: number // 教师：总学员数
  userGrowthData: Array<{
    date: string
    label: string
    count: number
  }>
  enrollmentTrendData: Array<{
    date: string
    label: string
    count: number
  }>
}

/**
 * 获取仪表板统计数据
 */
export function getDashboardStatistics() {
  return request.get<DashboardStatistics>('/statistics/dashboard')
}


