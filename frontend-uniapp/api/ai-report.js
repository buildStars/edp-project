import { get, post } from './request'

/**
 * 生成 AI 学习报告
 * @param {number} year - 年份
 * @param {boolean} force - 是否强制重新生成
 */
export function generateAiReport(year, force = false) {
  return post('/ai-reports/generate', { year, force })
}

/**
 * 获取指定年份的报告
 * @param {number} year - 年份
 */
export function getAiReport(year) {
  return get(`/ai-reports`, { year })
}

/**
 * 获取我的报告列表
 */
export function getMyReports() {
  return get('/ai-reports/my')
}


