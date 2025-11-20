import { get, post } from './request'

/**
 * 分配学分给员工
 */
export function allocateCredit(data) {
  return post('/api/corporate/credits/allocate', data)
}

/**
 * 为员工购买课程
 */
export function purchaseCourseForEmployee(data) {
  return post('/api/corporate/credits/purchase-course', data)
}

/**
 * 获取企业员工列表
 */
export function getCorpEmployees() {
  return get('/api/corporate/employees')
}

/**
 * 获取学分分配记录
 */
export function getAllocationRecords(params) {
  return get('/api/corporate/credits/allocations', params)
}

/**
 * 获取课程购买记录
 */
export function getPurchaseRecords(params) {
  return get('/api/corporate/credits/purchases', params)
}

