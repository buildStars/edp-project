/**
 * 格式化工具函数
 */
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

/**
 * 格式化日期时间
 * @param date 日期
 * @param format 格式
 */
export function formatDate(date: string | Date, format = 'YYYY-MM-DD HH:mm:ss'): string {
  if (!date) return '-'
  return dayjs(date).format(format)
}

/**
 * 格式化相对时间
 * @param date 日期
 */
export function formatRelativeTime(date: string | Date): string {
  if (!date) return '-'
  return dayjs(date).fromNow()
}

/**
 * 格式化文件大小
 * @param bytes 字节数
 */
export function formatFileSize(bytes: number): string {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i]
}

/**
 * 格式化数字（千分位）
 * @param num 数字
 */
export function formatNumber(num: number): string {
  if (!num && num !== 0) return '-'
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/**
 * 格式化手机号（中间4位*号）
 * @param phone 手机号
 */
export function formatPhone(phone: string): string {
  if (!phone) return '-'
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

/**
 * 格式化身份证（中间10位*号）
 * @param idCard 身份证
 */
export function formatIdCard(idCard: string): string {
  if (!idCard) return '-'
  return idCard.replace(/(\d{4})\d{10}(\d{4})/, '$1**********$2')
}

/**
 * 获取角色中文名
 */
export function getRoleLabel(role: string): string {
  const roleMap: Record<string, string> = {
    ADMIN: '超级管理员',
    STAFF: '教务人员',
    TEACHER: '讲师',
    ADVISOR: '课程顾问',
    STUDENT: '学员',
  }
  return roleMap[role] || role
}

/**
 * 获取课程分类中文名
 */
export function getCourseCategoryLabel(category: string): string {
  const categoryMap: Record<string, string> = {
    ACCELERATE: '加速课堂',
    MASTER: '大师课堂',
    EMPOWER: '赋能课堂',
  }
  return categoryMap[category] || category
}

/**
 * 获取状态中文名
 */
export function getStatusLabel(status: string): string {
  const statusMap: Record<string, string> = {
    DRAFT: '草稿',
    PUBLISHED: '已发布',
    ARCHIVED: '已归档',
    OPEN: '报名中',
    CLOSED: '已截止',
    ENROLLED: '已报名',
    COMPLETED: '已完成',
    CANCELLED: '已取消',
    PENDING: '待审核',
    APPROVED: '已通过',
    REJECTED: '已拒绝',
    ACTIVE: '有效',
    EXPIRED: '已过期',
    USED_UP: '已用完',
    NOTICE: '学院通知',
    ALUMNI: '校友动态',
  }
  return statusMap[status] || status
}

/**
 * 获取协会类型中文名
 */
export function getAssociationTypeLabel(type: string): string {
  const typeMap: Record<string, string> = {
    ALUMNI: '同学会',
    CLUB: '俱乐部',
  }
  return typeMap[type] || type
}


