/**
 * 学分管理API
 */
import { request } from '@/utils/request'

export interface Credit {
  id: string
  userId: string
  balance: number
  total: number
  used: number
  corporateBalance: number
  corporateTotal: number
  corporateUsed: number
  createdAt: string
  updatedAt: string
}

export interface AllocateCreditDto {
  userId: string
  amount: number
  remark?: string
}

export interface DeductCreditDto {
  userId: string
  amount: number
  remark?: string
}

// 获取我的学分
export function getMyCredits() {
  return request.get<Credit>('/credits/my')
}

// 充值学分（管理端 - 直接分配）
export function allocateCredit(data: AllocateCreditDto) {
  return request.post('/credits/allocate', data)
}

// 扣除学分（管理端）
export function deductCredit(data: DeductCreditDto) {
  return request.post('/credits/deduct', data)
}

// 获取学分列表（管理端）
export function getCreditList(params: any) {
  return request.get('/credits', { params })
}

// 获取学分记录（管理端）
export function getCreditRecords(params: any) {
  return request.get('/credits/records', { params })
}

// 增加企业学分
export function addCorporateCredit(userId: string, data: { amount: number; remark?: string }) {
  return request.post(`/credits/${userId}/corporate/add`, data)
}

// 扣除企业学分
export function deductCorporateCredit(userId: string, data: { amount: number; remark?: string }) {
  return request.post(`/credits/${userId}/corporate/deduct`, data)
}
