/**
 * 下载模块API
 */

import { post } from './request'

/**
 * 记录下载
 * @param {Object} data
 * @param {String} data.materialId - 课件ID
 */
export function recordDownload(data) {
  return post('/api/materials/downloads/record', data)
}

