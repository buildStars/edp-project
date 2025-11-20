/**
 * 数据模型类型定义
 */
import type {
  UserRole,
  CourseCategory,
  CourseStatus,
  EnrollStatus,
  EnrollmentStatus,
  TrialStatus,
  NewsCategory,
  ContentStatus,
  AssociationType,
  CreditType,
  CreditStatus,
} from './index'

// 用户模型
export interface User {
  id: string
  openid?: string
  unionid?: string
  nickname?: string
  avatar?: string
  phone?: string
  email?: string
  password?: string
  realName?: string
  idCard?: string
  company?: string
  position?: string
  gender?: string
  role: UserRole
  status?: 'ACTIVE' | 'INACTIVE'
  advisorId?: string
  advisor?: User
  organizationId?: string
  createdAt: string
  updatedAt: string
}

// 课程模型
export interface Course {
  id: string
  title: string
  category: CourseCategory
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
  enrollStatus: EnrollStatus
  status: CourseStatus
  views: number
  // 新增学分标准字段
  creditType?: 'NORMAL' | 'MASTER'
  normalCredit?: number
  masterCredit?: number
  // 审批状态字段
  approvalStatus?: 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED'
  approvalRemark?: string
  createdAt: string
  updatedAt: string
  createdBy?: string
  approvedBy?: string
  approvedAt?: string
}

// 报名模型
export interface Enrollment {
  id: string
  userId: string
  courseId: string
  status: EnrollmentStatus
  checkedIn: boolean
  checkInTime?: string
  rated: boolean
  rating?: number
  ratingTime?: string
  isTrial: boolean
  trialName?: string
  trialPhone?: string
  trialCompany?: string
  trialPosition?: string
  trialStatus?: TrialStatus
  createdAt: string
  updatedAt: string
  user?: User
  course?: Course
}

// 资讯模型
export interface News {
  id: string
  title: string
  category: NewsCategory
  coverImage?: string
  summary?: string
  content: string
  publishTime: string
  status: ContentStatus
  isTop: boolean
  views: number
  createdAt: string
  updatedAt: string
  createdBy?: string
}

// 协会模型
export interface Association {
  id: string
  name: string
  type: AssociationType
  logo?: string
  description?: string
  introduction?: string
  contactPerson?: string
  contactPhone?: string
  contactEmail?: string
  wechat?: string
  views: number
  createdAt: string
  updatedAt: string
}

// 活动模型
export interface Activity {
  id: string
  associationId?: string
  title: string
  images: string // JSON数组
  content: string
  publishTime: string
  status: ContentStatus
  views: number
  likes: number
  createdAt: string
  updatedAt: string
  association?: Association
}

// 学分模型
export interface Credit {
  id: string
  userId: string
  type: CreditType
  total: number
  remaining: number
  used: number
  expireDate: string
  status: CreditStatus
  isGift: boolean
  giftFrom?: string
  giftCourseId?: string
  createdAt: string
  updatedAt: string
  user?: User
}

// 企业组织模型
export interface Organization {
  id: string
  name: string
  adminId: string
  admin?: {
    id: string
    realName?: string
    nickname?: string
    phone?: string
    email?: string
  }
  maxStudents: number
  totalCredits: number
  usedCredits: number
  contactPerson?: string
  contactPhone?: string
  createdAt: string
  updatedAt: string
  _count?: {
    users: number
  }
}

// 课件模型
export interface CourseMaterial {
  id: string
  courseId: string
  title: string
  fileUrl: string
  fileSize?: number
  fileType: string
  createdAt: string
  updatedAt: string
  course?: Course
}

// 下载记录模型
export interface Download {
  id: string
  userId: string
  materialId: string
  createdAt: string
  user?: User
  material?: CourseMaterial
}

