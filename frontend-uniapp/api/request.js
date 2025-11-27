/**
 * 网络请求封装
 */

// 配置baseURL，需要根据实际后端地址修改
// 开发环境：真机调试使用局域网IP，模拟器使用localhost
// 生产环境：使用正式域名
const BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:3000'           // 开发环境 - 本地调试
  : 'https://edp.yunchuangshuan.com'  // 生产环境 - 公网域名（HTTPS）

/**
 * 发起网络请求
 * @param {Object} options 请求配置
 * @returns {Promise}
 */
function request(options) {
  return new Promise((resolve, reject) => {
    // 获取token
    const token = uni.getStorageSync('token') || ''
    
    // 处理 GET 请求的参数（支持 params 或 data）
    const requestData = options.params || options.data || {}
    
    uni.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: requestData,
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.header
      },
      success: (res) => {
        // 请求成功（接受 200 和 201）
        if (res.statusCode === 200 || res.statusCode === 201) {
          const data = res.data
          // 业务逻辑成功（使用宽松相等，兼容数字和字符串）
          if (data.code == 200 || data.code == 0 || !data.code) {
            resolve(data.data || data)
          } else {
            // 业务逻辑失败 - 不在这里显示toast，让调用方处理
            reject({
              ...data,
              msg: data.msg || data.message || '请求失败'
            })
          }
        } else if (res.statusCode === 401) {
          // token过期，跳转登录
          uni.showToast({
            title: '登录已过期，请重新登录',
            icon: 'none'
          })
          setTimeout(() => {
            uni.removeStorageSync('token')
            uni.removeStorageSync('userInfo')
            uni.reLaunch({
              url: '/pages/login/index'
            })
          }, 1500)
          reject(res.data)
        } else {
          // 其他错误
          uni.showToast({
            title: '网络请求失败',
            icon: 'none'
          })
          reject(res.data)
        }
      },
      fail: (err) => {
        // 请求失败
        console.error('请求失败：', err)
        uni.showToast({
          title: '网络连接失败',
          icon: 'none'
        })
        reject(err)
      }
    })
  })
}

/**
 * GET请求
 */
export function get(url, data = {}, options = {}) {
  return request({
    url,
    method: 'GET',
    data,
    ...options
  })
}

/**
 * POST请求
 */
export function post(url, data = {}, options = {}) {
  return request({
    url,
    method: 'POST',
    data,
    ...options
  })
}

/**
 * PUT请求
 */
export function put(url, data = {}, options = {}) {
  return request({
    url,
    method: 'PUT',
    data,
    ...options
  })
}

/**
 * DELETE请求
 */
export function del(url, data = {}, options = {}) {
  return request({
    url,
    method: 'DELETE',
    data,
    ...options
  })
}

/**
 * 文件上传
 */
export function upload(filePath, options = {}) {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token') || ''
    
    uni.uploadFile({
      url: BASE_URL + (options.url || '/api/upload'),
      filePath: filePath,
      name: options.name || 'file',
      formData: options.formData || {},
      header: {
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.header
      },
      success: (res) => {
        if (res.statusCode === 200) {
          const data = JSON.parse(res.data)
          if (data.code === 200 || data.code === 0) {
            resolve(data.data)
          } else {
            uni.showToast({
              title: data.msg || '上传失败',
              icon: 'none'
            })
            reject(data)
          }
        } else {
          uni.showToast({
            title: '上传失败',
            icon: 'none'
          })
          reject(res)
        }
      },
      fail: (err) => {
        console.error('上传失败：', err)
        uni.showToast({
          title: '上传失败',
          icon: 'none'
        })
        reject(err)
      }
    })
  })
}

// 便捷方法对象（使用已有的导出函数）
const http = {
  get,
  post,
  put,
  delete: del,
  upload
}

// 默认导出
export default http

