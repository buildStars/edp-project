/**
 * AI模块API
 */
import { get } from './request'

/**
 * 获取年度学习报告
 * @param {Number} year 年份
 */
export function getAnnualReport(year) {
  return get('/api/ai/annual-report', { year })
}

/**
 * 生成学习报告（AI生成）
 * @param {Number} year 年份
 */
export function generateReport(year) {
  return post('/api/ai/generate-report', { year })
}
