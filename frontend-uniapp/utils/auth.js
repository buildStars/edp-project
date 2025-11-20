/**
 * 登录鉴权工具函数
 */
import { useUserStore } from '@/store/user'

/**
 * 检查是否已登录
 * @param {Boolean} showToast 是否显示提示
 * @param {Boolean} redirect 是否跳转到登录页
 */
export function checkLogin(showToast = true, redirect = true) {
  const token = uni.getStorageSync('token')
  
  if (!token) {
    if (showToast) {
      uni.showToast({
        title: '请先登录',
        icon: 'none',
        duration: 2000
      })
    }
    
    if (redirect) {
      setTimeout(() => {
        uni.navigateTo({
          url: '/pages/login/index'
        })
      }, 1500)
    }
    
    return false
  }
  
  return true
}

/**
 * 微信登录
 */
export function wxLogin() {
  return new Promise((resolve, reject) => {
    uni.login({
      provider: 'weixin',
      success: (loginRes) => {
        console.log('微信登录成功，code:', loginRes.code)
        resolve(loginRes.code)
      },
      fail: (err) => {
        console.error('微信登录失败：', err)
        uni.showToast({
          title: '登录失败',
          icon: 'none'
        })
        reject(err)
      }
    })
  })
}

/**
 * 获取微信用户信息
 */
export function getUserProfile() {
  return new Promise((resolve, reject) => {
    uni.getUserProfile({
      desc: '用于完善用户资料',
      success: (res) => {
        console.log('获取用户信息成功：', res.userInfo)
        resolve(res.userInfo)
      },
      fail: (err) => {
        console.error('获取用户信息失败：', err)
        reject(err)
      }
    })
  })
}

/**
 * 获取手机号
 */
export function getPhoneNumber(e) {
  return new Promise((resolve, reject) => {
    if (e.detail.errMsg === 'getPhoneNumber:ok') {
      resolve({
        code: e.detail.code,
        encryptedData: e.detail.encryptedData,
        iv: e.detail.iv
      })
    } else {
      reject(new Error('用户拒绝授权'))
    }
  })
}

/**
 * 退出登录
 */
export function logout() {
  const userStore = useUserStore()
  userStore.logout()
}

