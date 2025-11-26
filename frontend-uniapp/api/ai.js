/**
 * AI模块API
 * 注意：此文件已废弃，请使用 ai-report.js
 */
import { get, post } from './request'

/**
 * 获取年度学习报告（简单版本）
 * @param {Number} year 年份
 */
export function getAnnualReport(year) {
  return get('/api/reports/annual-report', { year })
}

/**
 * 生成学习报告（简单版本）
 * @param {Number} year 年份
 * @deprecated 请使用 ai-report.js 中的 generateAiReport
 */
export function generateReport(year) {
  return post('/api/ai-reports/generate', { year })
}
