/**
 * 系统设置相关API
 */
import http from './request.js'

/**
 * 获取轮播图列表
 */
export const getBannerList = () => {
  return http.get('/system-settings/banners', {
    params: { isActive: true }
  })
}

/**
 * 获取系统公开配置
 */
export const getSystemConfig = () => {
  return http.get('/system-settings/config/public')
}

