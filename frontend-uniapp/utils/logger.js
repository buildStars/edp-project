/**
 * 统一日志工具
 * 用于管理和控制应用日志输出
 */

const isDev = process.env.NODE_ENV === 'development'

class Logger {
  constructor(prefix = '') {
    this.prefix = prefix
  }

  /**
   * 调试日志（仅开发环境）
   */
  debug(...args) {
    if (isDev) {
      console.log(`[DEBUG]${this.prefix}`, ...args)
    }
  }

  /**
   * 信息日志
   */
  info(...args) {
    if (isDev) {
      console.info(`[INFO]${this.prefix}`, ...args)
    }
  }

  /**
   * 警告日志
   */
  warn(...args) {
    console.warn(`[WARN]${this.prefix}`, ...args)
  }

  /**
   * 错误日志
   */
  error(...args) {
    console.error(`[ERROR]${this.prefix}`, ...args)
  }

  /**
   * API请求日志
   */
  request(method, url, data) {
    if (isDev) {
      console.log(`[API Request] ${method} ${url}`, data || '')
    }
  }

  /**
   * API响应日志
   */
  response(url, status, data) {
    if (isDev) {
      console.log(`[API Response] ${url} (${status})`, data || '')
    }
  }

  /**
   * 用户行为日志
   */
  track(action, data) {
    if (isDev) {
      console.log(`[Track] ${action}`, data || '')
    }
    // 这里可以集成第三方统计工具（如微信统计、友盟等）
  }
}

// 创建默认实例
export const logger = new Logger()

// 创建带前缀的日志实例
export const createLogger = (prefix) => new Logger(` [${prefix}]`)

// 使用示例：
// import { logger, createLogger } from '@/utils/logger'
// 
// logger.debug('这是调试信息')
// logger.error('这是错误信息', error)
// 
// const apiLogger = createLogger('API')
// apiLogger.info('发起请求', url)


