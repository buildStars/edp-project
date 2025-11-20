/**
 * 统一错误处理工具
 */

import { logger } from './logger'

/**
 * 错误类型枚举
 */
export const ErrorType = {
  NETWORK: 'NETWORK_ERROR',
  API: 'API_ERROR',
  AUTH: 'AUTH_ERROR',
  PERMISSION: 'PERMISSION_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR'
}

/**
 * 错误消息映射
 */
const ERROR_MESSAGES = {
  401: '登录已过期，请重新登录',
  403: '没有权限执行此操作',
  404: '请求的资源不存在',
  500: '服务器错误，请稍后重试',
  502: '网关错误，请稍后重试',
  503: '服务暂时不可用，请稍后重试',
  NETWORK_ERROR: '网络连接失败，请检查网络',
  TIMEOUT: '请求超时，请重试',
  UNKNOWN: '操作失败，请稍后重试'
}

/**
 * 统一错误处理
 * @param {Error|Object} error 错误对象
 * @param {String} context 错误上下文（用于日志记录）
 * @param {Boolean} showToast 是否显示提示
 * @returns {String} 错误消息
 */
export function handleError(error, context = '', showToast = true) {
  // 记录错误日志
  logger.error(context, error)

  // 确定错误类型和消息
  let type = ErrorType.UNKNOWN
  let message = ERROR_MESSAGES.UNKNOWN
  let shouldLogout = false

  if (error) {
    // HTTP状态码错误
    if (error.code || error.statusCode) {
      const code = error.code || error.statusCode
      message = ERROR_MESSAGES[code] || error.msg || error.message || message

      if (code === 401) {
        type = ErrorType.AUTH
        shouldLogout = true
      } else if (code === 403) {
        type = ErrorType.PERMISSION
      } else if (code === 404) {
        type = ErrorType.API
      } else if (code >= 500) {
        type = ErrorType.API
      }
    }
    // 自定义消息
    else if (error.msg || error.message) {
      message = error.msg || error.message
    }
    // 网络错误
    else if (error.errMsg && error.errMsg.includes('request:fail')) {
      type = ErrorType.NETWORK
      message = ERROR_MESSAGES.NETWORK_ERROR
    }
  }

  // 显示错误提示
  if (showToast) {
    uni.showToast({
      title: message,
      icon: 'none',
      duration: 2500
    })
  }

  // 处理登录过期
  if (shouldLogout) {
    setTimeout(() => {
      uni.reLaunch({
        url: '/pages/login/index'
      })
    }, 1500)
  }

  return { type, message }
}

/**
 * API错误处理
 * @param {Error|Object} error 错误对象
 * @param {String} context API上下文
 * @param {Boolean} showToast 是否显示提示
 */
export function handleApiError(error, context = '', showToast = true) {
  return handleError(error, `[API Error] ${context}`, showToast)
}

/**
 * 表单验证错误处理
 * @param {Object} errors 验证错误对象
 */
export function handleValidationError(errors) {
  const firstError = Object.values(errors)[0]
  if (firstError) {
    uni.showToast({
      title: Array.isArray(firstError) ? firstError[0] : firstError,
      icon: 'none',
      duration: 2000
    })
  }
}

/**
 * 包装异步函数，自动处理错误
 * @param {Function} fn 异步函数
 * @param {String} context 上下文
 * @returns {Function} 包装后的函数
 */
export function wrapAsync(fn, context = '') {
  return async function(...args) {
    try {
      return await fn.apply(this, args)
    } catch (error) {
      handleError(error, context)
      throw error
    }
  }
}

/**
 * 全局错误捕获（在 App.vue 中使用）
 */
export function setupGlobalErrorHandler() {
  // 捕获未处理的 Promise 错误
  if (typeof window !== 'undefined') {
    window.addEventListener('unhandledrejection', (event) => {
      logger.error('Unhandled Promise Rejection:', event.reason)
      handleError(event.reason, 'Unhandled Promise')
      event.preventDefault()
    })
  }

  // 捕获全局错误
  uni.onError((error) => {
    logger.error('Global Error:', error)
    handleError({ message: '应用发生错误' }, 'Global Error')
  })
}

// 使用示例：
// import { handleError, handleApiError, wrapAsync } from '@/utils/error-handler'
// 
// // 1. 直接处理错误
// try {
//   await someAsyncFunction()
// } catch (error) {
//   handleApiError(error, 'someAsyncFunction')
// }
//
// // 2. 包装函数自动处理错误
// const safeFunction = wrapAsync(async () => {
//   await someAsyncFunction()
// }, 'safeFunction')
// 
// await safeFunction() // 错误会被自动捕获和处理


