/**
 * 通用工具函数
 */

// 配置 BASE_URL
const BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://192.168.0.106:3000'  // 开发环境 - 支持真机调试
  : 'http://neopersonal.site'    // 生产环境 - 您的域名

/**
 * 获取完整的图片 URL
 * @param {String} path 图片路径（可以是相对路径或完整URL）
 * @returns {String} 完整的图片 URL
 */
export function getImageUrl(path) {
  if (!path) return ''
  
  // 如果已经是完整的 HTTP/HTTPS URL，直接返回
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }
  
  // 如果是相对路径，拼接 BASE_URL
  // 确保路径以 / 开头
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return BASE_URL + normalizedPath
}

/**
 * 格式化时间
 * @param {Date|String|Number} date 日期
 * @param {String} format 格式，默认 YYYY-MM-DD HH:mm:ss
 */
export function formatTime(date, format = 'YYYY-MM-DD HH:mm:ss') {
  if (!date) return ''
  
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hour = String(d.getHours()).padStart(2, '0')
  const minute = String(d.getMinutes()).padStart(2, '0')
  const second = String(d.getSeconds()).padStart(2, '0')
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hour)
    .replace('mm', minute)
    .replace('ss', second)
}

/**
 * 格式化相对时间（刚刚、几分钟前等）
 * @param {Date|String|Number} date 日期
 */
export function formatRelativeTime(date) {
  if (!date) return ''
  
  const now = Date.now()
  const time = new Date(date).getTime()
  const diff = now - time
  
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  const month = 30 * day
  
  if (diff < minute) {
    return '刚刚'
  } else if (diff < hour) {
    return Math.floor(diff / minute) + '分钟前'
  } else if (diff < day) {
    return Math.floor(diff / hour) + '小时前'
  } else if (diff < month) {
    return Math.floor(diff / day) + '天前'
  } else {
    return formatTime(date, 'YYYY-MM-DD')
  }
}

/**
 * 倒计时格式化
 * @param {Date|String|Number} endTime 结束时间
 * @returns {Object} { days, hours, minutes, seconds, isEnd }
 */
export function formatCountdown(endTime) {
  const now = Date.now()
  const end = new Date(endTime).getTime()
  const diff = end - now
  
  if (diff <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isEnd: true
    }
  }
  
  const days = Math.floor(diff / (24 * 60 * 60 * 1000))
  const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
  const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000))
  const seconds = Math.floor((diff % (60 * 1000)) / 1000)
  
  return {
    days,
    hours,
    minutes,
    seconds,
    isEnd: false
  }
}

/**
 * 防抖函数
 * @param {Function} func 要执行的函数
 * @param {Number} wait 等待时间
 */
export function debounce(func, wait = 500) {
  let timeout
  return function(...args) {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      func.apply(this, args)
    }, wait)
  }
}

/**
 * 节流函数
 * @param {Function} func 要执行的函数
 * @param {Number} wait 等待时间
 */
export function throttle(func, wait = 500) {
  let lastTime = 0
  return function(...args) {
    const now = Date.now()
    if (now - lastTime >= wait) {
      func.apply(this, args)
      lastTime = now
    }
  }
}

/**
 * 手机号格式化（隐藏中间4位）
 * @param {String} phone 手机号
 */
export function formatPhone(phone) {
  if (!phone) return ''
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

/**
 * 身份证号格式化（隐藏中间部分）
 * @param {String} idCard 身份证号
 */
export function formatIdCard(idCard) {
  if (!idCard) return ''
  return idCard.replace(/(\d{6})\d{8}(\d{4})/, '$1********$2')
}

/**
 * 分享到微信
 * @param {Object} options 分享配置
 */
export function shareToWeChat(options = {}) {
  return new Promise((resolve, reject) => {
    uni.share({
      provider: 'weixin',
      scene: options.scene || 'WXSceneSession', // WXSceneSession 好友，WXSceneTimeline 朋友圈
      type: options.type || 0, // 0 图文，2 纯图片
      title: options.title || '',
      summary: options.summary || '',
      href: options.href || '',
      imageUrl: options.imageUrl || '',
      success: (res) => {
        uni.showToast({
          title: '分享成功',
          icon: 'success'
        })
        resolve(res)
      },
      fail: (err) => {
        console.error('分享失败：', err)
        uni.showToast({
          title: '分享失败',
          icon: 'none'
        })
        reject(err)
      }
    })
  })
}

/**
 * 预览图片
 * @param {Array} urls 图片地址数组
 * @param {Number} current 当前图片索引
 */
export function previewImage(urls, current = 0) {
  uni.previewImage({
    urls: urls,
    current: current
  })
}

/**
 * 拨打电话
 * @param {String} phoneNumber 电话号码
 */
export function makePhoneCall(phoneNumber) {
  uni.makePhoneCall({
    phoneNumber: phoneNumber
  })
}

/**
 * 复制文本
 * @param {String} text 要复制的文本
 */
export function copyText(text) {
  uni.setClipboardData({
    data: text,
    success: () => {
      uni.showToast({
        title: '复制成功',
        icon: 'success'
      })
    }
  })
}

/**
 * 下载文件
 * @param {String} url 文件地址
 */
export function downloadFile(url) {
  return new Promise((resolve, reject) => {
    uni.showLoading({
      title: '下载中...'
    })
    
    uni.downloadFile({
      url: url,
      success: (res) => {
        uni.hideLoading()
        if (res.statusCode === 200) {
          resolve(res.tempFilePath)
        } else {
          uni.showToast({
            title: '下载失败',
            icon: 'none'
          })
          reject(res)
        }
      },
      fail: (err) => {
        uni.hideLoading()
        uni.showToast({
          title: '下载失败',
          icon: 'none'
        })
        reject(err)
      }
    })
  })
}

/**
 * 打开文档
 * @param {String} filePath 文件路径
 * @param {String} fileType 文件类型
 */
export function openDocument(filePath, fileType = 'pdf') {
  uni.openDocument({
    filePath: filePath,
    fileType: fileType,
    success: () => {
      console.log('打开文档成功')
    },
    fail: (err) => {
      console.error('打开文档失败：', err)
      uni.showToast({
        title: '打开文档失败',
        icon: 'none'
      })
    }
  })
}

