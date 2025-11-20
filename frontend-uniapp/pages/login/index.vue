<template>
  <view class="page">
    <!-- Logo区域 -->
    <view class="logo-section">
      <view class="logo-placeholder">🎓</view>
      <view class="app-name">北大汇丰EDP</view>
      <view class="app-desc">Executive Development Programs</view>
    </view>
    
    <!-- 登录方式切换 -->
    <!-- #ifdef H5 -->
    <view class="login-tabs">
      <view 
        class="tab-item" 
        :class="{ active: loginType === 'account' }"
        @click="switchLoginType('account')"
      >
        账号登录
      </view>
      <view 
        class="tab-item" 
        :class="{ active: loginType === 'wechat' }"
        @click="switchLoginType('wechat')"
      >
        微信登录
      </view>
    </view>
    <!-- #endif -->
    
    <!-- 账号密码登录表单（仅H5） -->
    <!-- #ifdef H5 -->
    <view v-if="loginType === 'account'" class="form-section">
      <view class="form-item">
        <input 
          v-model="formData.username" 
          class="form-input" 
          placeholder="请输入手机号或邮箱"
          type="text"
        />
      </view>
      
      <view class="form-item">
        <input 
          v-model="formData.password" 
          class="form-input" 
          placeholder="请输入密码"
          :password="!showPassword"
          type="text"
        />
        <text class="show-password" @click="showPassword = !showPassword">
          {{ showPassword ? '隐藏' : '显示' }}
        </text>
      </view>
      
      <view class="form-extra">
        <label class="remember-me">
          <checkbox :checked="formData.remember" @click="formData.remember = !formData.remember" />
          <text>记住我</text>
        </label>
        <text class="forgot-password" @click="handleForgotPassword">忘记密码？</text>
      </view>
      
      <button class="login-btn primary" @click="handleAccountLogin">
        登录
      </button>
    </view>
    <!-- #endif -->
    
    <!-- 微信登录按钮 -->
    <!-- #ifdef MP-WEIXIN -->
    <view class="login-section">
      <button class="login-btn" @click="handleWxLogin">
        <Icon name="wechat" :size="56" class="wechat-icon" />
        微信授权登录
      </button>
    </view>
    <!-- #endif -->
    
    <!-- #ifdef H5 -->
    <view v-if="loginType === 'wechat'" class="login-section">
      <view class="qrcode-box">
        <view class="qrcode-placeholder">
          <text>请使用微信扫码登录</text>
          <text class="qrcode-tip">（功能开发中）</text>
        </view>
      </view>
    </view>
    <!-- #endif -->
    
    <view class="login-tip">
      登录即代表您同意
      <text class="link" @click="showAgreement">《用户协议》</text>
      和
      <text class="link" @click="showPrivacy">《隐私政策》</text>
    </view>
    
    <!-- 联系方式 -->
    <view class="contact-section">
      <view class="contact-item" @click="makeCall">
        <Icon name="phone" :size="40" class="contact-icon" />
        <text>客服电话：40077-20111</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { wxLogin as wxLoginApi, webLogin } from '@/api/user'
import { wxLogin, getUserProfile } from '@/utils/auth'
import { useUserStore } from '@/store/user'
import { makePhoneCall } from '@/utils/util'
import Icon from '@/components/icon/icon.vue'

const userStore = useUserStore()

// 登录方式：account-账号登录, wechat-微信登录
// 根据平台自动设置默认登录方式
let defaultLoginType = 'wechat'
// #ifdef H5
defaultLoginType = 'account'
// #endif
const loginType = ref(defaultLoginType)

// 表单数据
const formData = ref({
  username: '',
  password: '',
  remember: false
})

// 是否显示密码
const showPassword = ref(false)

// 切换登录方式
const switchLoginType = (type) => {
  loginType.value = type
}

// 账号密码登录（仅H5）
const handleAccountLogin = async () => {
  // 表单验证
  if (!formData.value.username) {
    uni.showToast({
      title: '请输入手机号或邮箱',
      icon: 'none'
    })
    return
  }
  
  if (!formData.value.password) {
    uni.showToast({
      title: '请输入密码',
      icon: 'none'
    })
    return
  }
  
  if (formData.value.password.length < 6) {
    uni.showToast({
      title: '密码长度不能少于6位',
      icon: 'none'
    })
    return
  }
  
  try {
    uni.showLoading({
      title: '登录中...'
    })
    
    const data = await webLogin({
      username: formData.value.username,
      password: formData.value.password,
      remember: formData.value.remember
    })
    
    // 保存token和用户信息
    userStore.setToken(data.token)
    userStore.setUserInfo(data.userInfo)
    
    uni.showToast({
      title: '登录成功',
      icon: 'success'
    })
    
    setTimeout(() => {
      const pages = getCurrentPages()
      if (pages.length > 1) {
        uni.navigateBack()
      } else {
        uni.switchTab({
          url: '/pages/index/index'
        })
      }
    }, 1500)
  } catch (error) {
    console.error('登录失败：', error)
    uni.showToast({
      title: error.msg || '登录失败',
      icon: 'none'
    })
  } finally {
    uni.hideLoading()
  }
}

// 微信登录
const handleWxLogin = async () => {
  try {
    // 1. 微信登录获取code
    const code = await wxLogin()
    
    // 2. 调用后端登录接口
    uni.showLoading({
      title: '登录中...'
    })
    
    const data = await wxLoginApi({
      code: code,
      // 不再传递 userInfo，后端会从微信获取基本信息
    })
    
    // 3. 保存token和用户信息
    userStore.setToken(data.token)
    userStore.setUserInfo(data.userInfo)
    
    // 4. 判断是否需要完善信息（根据后端返回的 profileCompleted 字段）
    const needCompleteProfile = data.userInfo.profileCompleted === false
    
    if (needCompleteProfile) {
      // 需要完善信息，跳转到完善信息页面
      uni.redirectTo({
        url: '/pages/login/complete-info'
      })
    } else {
      // 登录成功，返回上一页或首页
      uni.showToast({
        title: '登录成功',
        icon: 'success'
      })
      
      setTimeout(() => {
        const pages = getCurrentPages()
        if (pages.length > 1) {
          uni.navigateBack()
        } else {
          uni.switchTab({
            url: '/pages/index/index'
          })
        }
      }, 1500)
    }
  } catch (error) {
    console.error('登录失败：', error)
    uni.showToast({
      title: '登录失败',
      icon: 'none'
    })
  } finally {
    uni.hideLoading()
  }
}

// 忘记密码
const handleForgotPassword = () => {
  uni.showToast({
    title: '请联系管理员重置密码',
    icon: 'none',
    duration: 2000
  })
}

// 拨打电话
const makeCall = () => {
  makePhoneCall('40077-20111')
}

// 显示用户协议
const showAgreement = () => {
  uni.showToast({
    title: '用户协议功能开发中',
    icon: 'none'
  })
}

// 显示隐私政策
const showPrivacy = () => {
  uni.showToast({
    title: '隐私政策功能开发中',
    icon: 'none'
  })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: linear-gradient(180deg, #C8161D 0%, #A0141A 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 48rpx 48rpx;
}

.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 80rpx;
  
  .logo {
    width: 200rpx;
    height: 200rpx;
    margin-bottom: 40rpx;
  }
  
  .app-name {
    font-size: 48rpx;
    font-weight: 500;
    color: #fff;
    margin-bottom: 16rpx;
  }
  
  .app-desc {
    font-size: 26rpx;
    color: rgba(255, 255, 255, 0.8);
  }
}

// 登录方式切换（H5）
.login-tabs {
  display: flex;
  width: 100%;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 48rpx;
  padding: 8rpx;
  margin-bottom: 48rpx;
  
  .tab-item {
    flex: 1;
    text-align: center;
    padding: 20rpx 0;
    font-size: 28rpx;
    color: rgba(255, 255, 255, 0.7);
    border-radius: 40rpx;
    transition: all 0.3s;
    
    &.active {
      background-color: #fff;
      color: #C8161D;
      font-weight: 500;
    }
  }
}

// 表单区域（H5）
.form-section {
  width: 100%;
  margin-bottom: 48rpx;
  
  .form-item {
    position: relative;
    background-color: rgba(255, 255, 255, 0.95);
    border-radius: 48rpx;
    margin-bottom: 24rpx;
    
    .form-input {
      width: 100%;
      padding: 28rpx 40rpx;
      font-size: 28rpx;
      color: #333;
    }
    
    .show-password {
      position: absolute;
      right: 40rpx;
      top: 50%;
      transform: translateY(-50%);
      font-size: 26rpx;
      color: #666;
      padding: 10rpx;
    }
  }
  
  .form-extra {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16rpx;
    margin-bottom: 48rpx;
    
    .remember-me {
      display: flex;
      align-items: center;
      font-size: 26rpx;
      color: rgba(255, 255, 255, 0.9);
      
      checkbox {
        margin-right: 12rpx;
      }
    }
    
    .forgot-password {
      font-size: 26rpx;
      color: rgba(255, 255, 255, 0.9);
    }
  }
  
  .login-btn.primary {
    width: 100%;
    height: 96rpx;
    background-color: #fff;
    color: #C8161D;
    font-size: 32rpx;
    font-weight: 500;
    border-radius: 48rpx;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &:active {
      opacity: 0.8;
    }
  }
}

.login-section {
  width: 100%;
  
  .login-btn {
    width: 100%;
    height: 96rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #fff;
    color: #333;
    font-size: 32rpx;
    font-weight: 500;
    border-radius: 48rpx;
    border: none;
    margin-bottom: 32rpx;
    
    .wechat-icon {
      width: 48rpx;
      height: 48rpx;
      margin-right: 16rpx;
    }
    
    &:active {
      opacity: 0.8;
    }
  }
  
  .qrcode-box {
    width: 100%;
    background-color: #fff;
    border-radius: 24rpx;
    padding: 80rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-bottom: 32rpx;
    
    .qrcode-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      font-size: 28rpx;
      color: #666;
      
      .qrcode-tip {
        margin-top: 16rpx;
        font-size: 24rpx;
        color: #999;
      }
    }
  }
}

.login-tip {
  text-align: center;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  width: 100%;
  margin-top: 32rpx;
  
  .link {
    color: #fff;
    text-decoration: underline;
  }
}

.contact-section {
  position: fixed;
  bottom: 60rpx;
  left: 0;
  right: 0;
  
  .contact-item {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 26rpx;
    color: rgba(255, 255, 255, 0.9);
    
    .contact-icon {
      width: 32rpx;
      height: 32rpx;
      margin-right: 12rpx;
    }
  }
}
</style>

