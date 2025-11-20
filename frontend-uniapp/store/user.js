/**
 * 用户状态管理
 */
import { defineStore } from 'pinia'
import { getUserInfo } from '@/api/user'
import { getMyCredits } from '@/api/course'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: uni.getStorageSync('token') || '',
    userInfo: uni.getStorageSync('userInfo') || null,
    isLogin: !!uni.getStorageSync('token'),
    credits: null, // 学分信息
  }),
  
  getters: {
    // 是否已登录
    hasLogin: (state) => state.isLogin,
    
    // 用户昵称
    nickname: (state) => state.userInfo?.nickname || '未登录',
    
    // 用户头像
    avatar: (state) => state.userInfo?.avatar || '/static/images/default-avatar.png',
    
    // 剩余学分
    remainingCredits: (state) => state.credits?.balance || 0,
    
    // 累计获得学分
    totalCredits: (state) => state.credits?.total || 0,
    
    // 累计消耗学分
    usedCredits: (state) => state.credits?.used || 0,
  },
  
  actions: {
    /**
     * 设置token
     */
    setToken(token) {
      this.token = token
      this.isLogin = !!token
      uni.setStorageSync('token', token)
    },
    
    /**
     * 设置用户信息
     */
    setUserInfo(userInfo) {
      this.userInfo = userInfo
      uni.setStorageSync('userInfo', userInfo)
    },
    
    /**
     * 初始化用户信息（从本地存储读取）
     */
    initUserInfo() {
      const token = uni.getStorageSync('token')
      const userInfo = uni.getStorageSync('userInfo')
      
      if (token) {
        this.token = token
        this.isLogin = true
      }
      
      if (userInfo) {
        this.userInfo = userInfo
      }
    },
    
    /**
     * 获取用户信息（从服务器）
     */
    async fetchUserInfo() {
      try {
        const data = await getUserInfo()
        this.setUserInfo(data)
        return data
      } catch (error) {
        console.error('获取用户信息失败：', error)
        throw error
      }
    },
    
    /**
     * 获取学分信息
     */
    async fetchCredits() {
      try {
        const data = await getMyCredits()
        this.credits = data
        return data
      } catch (error) {
        console.error('获取学分信息失败：', error)
        throw error
      }
    },
    
    /**
     * 登出
     */
    logout() {
      this.token = ''
      this.userInfo = null
      this.isLogin = false
      this.credits = null
      
      uni.removeStorageSync('token')
      uni.removeStorageSync('userInfo')
      
      // 跳转到登录页
      uni.reLaunch({
        url: '/pages/login/index'
      })
    },
    
    /**
     * 检查登录状态
     */
    checkLogin() {
      if (!this.isLogin) {
        uni.showToast({
          title: '请先登录',
          icon: 'none'
        })
        setTimeout(() => {
          uni.navigateTo({
            url: '/pages/login/index'
          })
        }, 1500)
        return false
      }
      return true
    }
  }
})

