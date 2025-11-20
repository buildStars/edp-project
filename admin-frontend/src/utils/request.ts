/**
 * Axios请求封装
 */
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import router from '@/router'
import NProgress from 'nprogress'

// 是否正在处理401错误
let isHandling401 = false

// 创建axios实例
const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json;charset=utf-8',
  },
})

// 请求拦截器
service.interceptors.request.use(
  (config: any) => {
    NProgress.start()

    // 添加Token
    const authStore = useAuthStore()
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`
    }

    return config
  },
  (error) => {
    console.error('Request error:', error)
    NProgress.done()
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    NProgress.done()

    const res = response.data

    // 如果是文件下载，直接返回
    if (response.config.responseType === 'blob') {
      return response
    }

    // 如果返回的是包装后的数据
    if (res.code !== undefined) {
      // 成功
      if (res.code === 200 || res.code === 0) {
        return res.data
      }

      // Token过期
      if (res.code === 401) {
        if (!isHandling401) {
          isHandling401 = true
          ElMessage.error('登录已过期，请重新登录')
          const authStore = useAuthStore()
          // 跳过API调用，直接清除状态
          authStore.logout(true)
          setTimeout(() => {
            isHandling401 = false
          }, 1000)
        }
        return Promise.reject(new Error(res.message || '登录已过期'))
      }

      // 其他错误
      ElMessage.error(res.message || '请求失败')
      return Promise.reject(new Error(res.message || '请求失败'))
    }

    // 直接返回数据（兼容后端直接返回数据的情况）
    return res
  },
  (error) => {
    NProgress.done()

    console.error('Response error:', error)

    // 处理HTTP错误
    if (error.response) {
      const { status, data } = error.response

      switch (status) {
        case 400:
          ElMessage.error(data.message || '请求参数错误')
          break
        case 401:
          // 显示后端返回的具体错误信息，如"用户名或密码错误"
          ElMessage.error(data.message || '未授权，请重新登录')
          
          // 只有在token过期的情况下才自动登出，密码错误等情况不登出
          if (data.message?.includes('过期') || data.message?.includes('无效')) {
            if (!isHandling401) {
              isHandling401 = true
              const authStore = useAuthStore()
              // 跳过API调用，直接清除状态
              authStore.logout(true)
              setTimeout(() => {
                isHandling401 = false
              }, 1000)
            }
          }
          break
        case 403:
          ElMessage.error('没有权限访问该资源')
          break
        case 404:
          ElMessage.error('请求的资源不存在')
          break
        case 500:
          ElMessage.error(data.message || '服务器内部错误')
          break
        default:
          ElMessage.error(data.message || `请求失败(${status})`)
      }
    } else if (error.request) {
      ElMessage.error('网络错误，请检查网络连接')
    } else {
      ElMessage.error(error.message || '请求失败')
    }

    return Promise.reject(error)
  }
)

// 导出请求方法
export default service

// 导出常用请求方法
export const request = {
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return service.get(url, config)
  },

  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return service.post(url, data, config)
  },

  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return service.put(url, data, config)
  },

  patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return service.patch(url, data, config)
  },

  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return service.delete(url, config)
  },
}


