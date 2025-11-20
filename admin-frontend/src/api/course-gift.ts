import { request } from '@/utils/request'
import type { PageResult, PageParams } from '@/types'

// 赠送状态
export type GiftStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED'

// 课程赠送记录
export interface CourseGift {
  id: string
  courseId: string
  fromUserId: string
  toUserId: string
  message?: string
  creditCost: number
  status: GiftStatus
  acceptedAt?: string
  createdAt: string
  updatedAt: string
  course: {
    id: string
    title: string
    credit: number
    coverImage?: string
  }
  fromUser: {
    id: string
    nickname?: string
    realName?: string
    phone?: string
  }
  toUser: {
    id: string
    nickname?: string
    realName?: string
    phone?: string
  }
}

// 查询参数
export interface CourseGiftQuery extends PageParams {
  status?: GiftStatus
  courseId?: string
}

/**
 * 获取所有赠送记录（管理员）
 */
export function getCourseGifts(params: CourseGiftQuery) {
  return request.get<PageResult<CourseGift>>('/course-gifts/admin', { params })
}

/**
 * 获取赠送详情
 */
export function getCourseGiftDetail(id: string) {
  return request.get<CourseGift>(`/course-gifts/${id}`)
}




