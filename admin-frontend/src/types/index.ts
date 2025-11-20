/**
 * 全局类型定义
 */

// 分页参数
export interface PageParams {
  page?: number
  pageSize?: number
}

// 分页响应
export interface PageResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

// 通用响应
export interface ApiResponse<T = any> {
  code: number
  message?: string
  data: T
}

// 用户角色
export enum UserRole {
  ADMIN = 'ADMIN', // 超级管理员
  STAFF = 'STAFF', // 教务人员
  TEACHER = 'TEACHER', // 讲师
  ADVISOR = 'ADVISOR', // 课程顾问
  STUDENT = 'STUDENT', // 学员
}

// 课程分类
export enum CourseCategory {
  ACCELERATE = 'ACCELERATE', // 加速课堂
  MASTER = 'MASTER', // 大师课堂
  EMPOWER = 'EMPOWER', // 赋能课堂
}

// 课程状态
export enum CourseStatus {
  DRAFT = 'DRAFT', // 草稿
  PUBLISHED = 'PUBLISHED', // 已发布
  ARCHIVED = 'ARCHIVED', // 已归档
}

// 报名状态
export enum EnrollStatus {
  OPEN = 'OPEN', // 报名中
  CLOSED = 'CLOSED', // 已截止
}

// 报名记录状态
export enum EnrollmentStatus {
  ENROLLED = 'ENROLLED', // 已报名
  COMPLETED = 'COMPLETED', // 已完成
  CANCELLED = 'CANCELLED', // 已取消
}

// 试听状态
export enum TrialStatus {
  PENDING = 'PENDING', // 待审核
  APPROVED = 'APPROVED', // 已通过
  REJECTED = 'REJECTED', // 已拒绝
}

// 资讯分类
export enum NewsCategory {
  NOTICE = 'NOTICE', // 学院通知
  ALUMNI = 'ALUMNI', // 校友动态
}

// 内容状态
export enum ContentStatus {
  DRAFT = 'DRAFT', // 草稿
  PUBLISHED = 'PUBLISHED', // 已发布
  ARCHIVED = 'ARCHIVED', // 已归档
}

// 协会类型
export enum AssociationType {
  ALUMNI = 'ALUMNI', // 同学会
  CLUB = 'CLUB', // 俱乐部
}

// 学分类型
export enum CreditType {
  PERSONAL = 'PERSONAL', // 个人次卡
  ENTERPRISE = 'ENTERPRISE', // 企业次卡
}

// 学分状态
export enum CreditStatus {
  ACTIVE = 'ACTIVE', // 有效
  EXPIRED = 'EXPIRED', // 已过期
  USED_UP = 'USED_UP', // 已用完
}


