import request from '@/utils/request'

// ==================== 轮播图相关 ====================

export enum BannerLinkType {
  NONE = 'NONE',
  URL = 'URL',
  COURSE = 'COURSE',
  NEWS = 'NEWS',
  ACTIVITY = 'ACTIVITY',
}

export interface Banner {
  id: string
  title: string
  imageUrl: string
  linkType: BannerLinkType
  linkUrl?: string
  targetId?: string
  sortOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateBannerData {
  title: string
  imageUrl: string
  linkType: BannerLinkType
  linkUrl?: string
  targetId?: string
  sortOrder?: number
  isActive?: boolean
}

export interface UpdateBannerData extends Partial<CreateBannerData> {}

/**
 * 创建轮播图
 */
export function createBanner(data: CreateBannerData) {
  return request.post<Banner>('/system-settings/banners', data)
}

/**
 * 获取轮播图列表
 */
export function getBannerList(isActive?: boolean) {
  return request.get<Banner[]>('/system-settings/banners', {
    params: isActive !== undefined ? { isActive } : undefined,
  })
}

/**
 * 获取轮播图详情
 */
export function getBannerById(id: string) {
  return request.get<Banner>(`/system-settings/banners/${id}`)
}

/**
 * 更新轮播图
 */
export function updateBanner(id: string, data: UpdateBannerData) {
  return request.put<Banner>(`/system-settings/banners/${id}`, data)
}

/**
 * 删除轮播图
 */
export function deleteBanner(id: string) {
  return request.delete(`/system-settings/banners/${id}`)
}

/**
 * 更新轮播图排序
 */
export function updateBannerSort(items: Array<{ id: string; sortOrder: number }>) {
  return request.put('/system-settings/banners/sort/update', items)
}

// ==================== 系统配置相关 ====================

export interface SystemConfig {
  id: string
  appName: string
  appLogo?: string
  appDesc?: string
  contactPhone?: string
  contactEmail?: string
  contactAddress?: string
  isMaintenance: boolean
  maintenanceMsg?: string
  wechatQrCode?: string
  weiboUrl?: string
  createdAt: string
  updatedAt: string
}

export interface UpdateSystemConfigData {
  appName?: string
  appLogo?: string
  appDesc?: string
  contactPhone?: string
  contactEmail?: string
  contactAddress?: string
  isMaintenance?: boolean
  maintenanceMsg?: string
  wechatQrCode?: string
  weiboUrl?: string
}

/**
 * 获取系统配置
 */
export function getSystemConfig() {
  return request.get<SystemConfig>('/system-settings/config')
}

/**
 * 更新系统配置
 */
export function updateSystemConfig(data: UpdateSystemConfigData) {
  return request.put<SystemConfig>('/system-settings/config', data)
}

/**
 * 获取公开系统配置（无需登录）
 */
export function getPublicSystemConfig() {
  return request.get<Partial<SystemConfig>>('/system-settings/config/public')
}

