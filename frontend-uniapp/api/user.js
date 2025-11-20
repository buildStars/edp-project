/**
 * 用户模块API
 */
import { get, post, put } from './request'

/**
 * 微信登录
 * @param {Object} data 登录数据
 * @param {String} data.code 微信code
 * @param {Object} data.userInfo 用户信息
 */
export function wxLogin(data) {
  return post('/api/auth/wx-login', data)
}

/**
 * Web端账号密码登录（浏览器环境）
 * @param {Object} data 登录数据
 * @param {String} data.username 用户名（手机号或邮箱）
 * @param {String} data.password 密码
 * @param {Boolean} data.remember 是否记住登录（7天）
 */
export function webLogin(data) {
  return post('/api/auth/web-login', data)
}

/**
 * 管理后台登录
 * @param {Object} data 登录数据
 * @param {String} data.username 用户名
 * @param {String} data.password 密码
 */
export function adminLogin(data) {
  return post('/api/auth/admin-login', data)
}

/**
 * 绑定手机号
 * @param {Object} data 
 * @param {String} data.phone 手机号
 * @param {String} data.code 验证码
 */
export function bindPhone(data) {
  return post('/api/auth/bind-phone', data)
}

/**
 * 发送验证码
 * @param {String} phone 手机号
 */
export function sendSmsCode(phone) {
  return post('/api/user/send-code', { phone })
}

/**
 * 获取用户信息
 */
export function getUserInfo() {
  return get('/api/users/info')
}

/**
 * 更新用户信息
 * @param {Object} data 用户信息
 * @param {String} data.avatar 头像
 * @param {String} data.nickname 昵称
 * @param {String} data.company 公司
 * @param {String} data.position 职位
 * @param {String} data.realName 真实姓名
 * @param {String} data.idCard 身份证号
 */
export function updateUserInfo(data) {
  return put('/api/users/info', data)
}

/**
 * 上传头像
 * @param {String} filePath 临时文件路径
 */
export function uploadAvatar(filePath) {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token')
    
    uni.uploadFile({
      url: `${process.env.NODE_ENV === 'development' ? 'http://192.168.0.106:3000' : 'http://neopersonal.site'}/api/users/upload-avatar`,
      filePath: filePath,
      name: 'file',
      header: {
        'Authorization': `Bearer ${token}`
      },
      success: (res) => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          const data = JSON.parse(res.data)
          resolve(data)
        } else {
          reject(new Error('上传失败'))
        }
      },
      fail: (error) => {
        reject(error)
      }
    })
  })
}

/**
 * 获取课程顾问信息
 */
export function getAdvisorInfo() {
  return get('/api/users/advisor')
}

