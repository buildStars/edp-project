/**
 * 系统设置相关API
 */
import { get } from './request.js'

/**
 * 获取轮播图列表（公开接口，无需登录）
 * 只获取已启用的轮播图
 */
export const getBannerList = () => {
  return get('/api/system-settings/banners', { isActive: true })
}

/**
 * 获取系统配置（公开接口，无需登录）
 */
export const getSystemConfig = () => {
  return get('/api/system-settings/config')
}

