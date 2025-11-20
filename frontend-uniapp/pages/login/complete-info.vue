<template>
  <view class="page">
    <view class="container">
      <!-- 欢迎区域 -->
      <view class="welcome-section">
        <view class="icon">🎉</view>
        <view class="title">欢迎加入</view>
        <view class="subtitle">完善您的个人信息</view>
      </view>

      <!-- 进度指示 -->
      <view class="progress-section">
        <view class="progress-item" :class="{ active: currentStep >= 1, completed: currentStep > 1 }">
          <view class="progress-number">{{ currentStep > 1 ? '✓' : '1' }}</view>
          <text class="progress-text">头像昵称</text>
        </view>
        <view class="progress-line" :class="{ active: currentStep >= 2 }"></view>
        <view class="progress-item" :class="{ active: currentStep >= 2, completed: currentStep > 2 }">
          <view class="progress-number">{{ currentStep > 2 ? '✓' : '2' }}</view>
          <text class="progress-text">绑定手机</text>
        </view>
        <view class="progress-line" :class="{ active: currentStep >= 3 }"></view>
        <view class="progress-item" :class="{ active: currentStep >= 3 }">
          <view class="progress-number">3</view>
          <text class="progress-text">完成</text>
        </view>
      </view>

      <!-- 步骤1：头像和昵称 -->
      <view v-if="currentStep === 1" class="step-content">
        <view class="form-section">
          <!-- 头像选择 -->
          <view class="form-item center">
            <view class="form-label">选择头像</view>
            <button 
              class="avatar-choose-btn" 
              open-type="chooseAvatar" 
              @chooseavatar="onChooseAvatar"
            >
              <view class="avatar-wrapper">
                <image :src="formData.avatar" class="avatar-img" mode="aspectFill" />
                <view class="avatar-mask">
                  <text class="icon">📷</text>
                </view>
              </view>
            </button>
            <text class="tip">点击头像选择</text>
          </view>

          <!-- 昵称输入 -->
          <view class="form-item">
            <view class="form-label">昵称</view>
            <input 
              v-model="formData.nickname"
              type="nickname"
              placeholder="请输入昵称"
              placeholder-class="input-placeholder"
              class="form-input"
              maxlength="20"
            />
            <view class="input-tip">
              <text class="tip-icon">💡</text>
              <text>输入框上方会显示您的微信昵称</text>
            </view>
          </view>
        </view>

        <button class="next-btn" @click="nextStep" :disabled="!canGoNextFromStep1">
          下一步
        </button>
        <button class="skip-btn" @click="handleSkip">
          跳过
        </button>
      </view>

      <!-- 步骤2：手机号绑定 -->
      <view v-if="currentStep === 2" class="step-content">
        <view class="phone-section">
          <view class="phone-icon">📱</view>
          <view class="phone-title">绑定手机号</view>
          <view class="phone-desc">为了您的账号安全，请绑定手机号</view>

          <!-- 微信一键授权 -->
          <button 
            v-if="!showManualInput"
            open-type="getPhoneNumber" 
            @getphonenumber="getPhoneNumber"
            class="phone-btn"
          >
            <text class="btn-icon">📱</text>
            <text>微信授权获取手机号</text>
          </button>

          <!-- 手动输入表单 -->
          <view v-if="showManualInput" class="manual-input-form">
            <view class="form-item">
              <input 
                v-model="phoneForm.phone"
                type="number"
                placeholder="请输入手机号"
                placeholder-class="input-placeholder"
                class="form-input"
                maxlength="11"
              />
            </view>
            
            <view class="form-item code-item">
              <input 
                v-model="phoneForm.code"
                type="number"
                placeholder="请输入验证码"
                placeholder-class="input-placeholder"
                class="form-input"
                maxlength="6"
              />
              <button 
                class="code-btn" 
                :disabled="codeSending || countdown > 0"
                @click="sendCode"
              >
                {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
              </button>
            </view>

            <button 
              class="phone-btn" 
              @click="handleManualBind"
              :disabled="binding"
            >
              {{ binding ? '绑定中...' : '确认绑定' }}
            </button>
          </view>

          <view v-if="!showManualInput" class="or-divider">
            <view class="line"></view>
            <text>或</text>
            <view class="line"></view>
          </view>

          <!-- 切换手动输入 -->
          <button class="manual-btn" @click="toggleManualInput">
            {{ showManualInput ? '返回微信授权' : '手动输入手机号' }}
          </button>
        </view>

        <button class="skip-btn" @click="handleSkipPhone">
          暂不绑定
        </button>
      </view>

      <!-- 步骤3：完成 -->
      <view v-if="currentStep === 3" class="step-content success">
        <view class="success-icon">✅</view>
        <view class="success-title">设置完成</view>
        <view class="success-desc">您可以开始使用了</view>
        
        <button class="complete-btn" @click="handleComplete">
          开始使用
        </button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useUserStore } from '@/store/user'
import { updateUserInfo, uploadAvatar } from '@/api/user'
import { bindPhone } from '@/api/user'

const userStore = useUserStore()

// 当前步骤：1-头像昵称, 2-手机号, 3-完成
const currentStep = ref(1)

// 表单数据
const formData = ref({
  avatar: '/static/images/default-avatar.png',
  nickname: ''
})

// 手机号表单
const phoneForm = ref({
  phone: '',
  code: ''
})

// 是否显示手动输入
const showManualInput = ref(false)

// 验证码倒计时
const countdown = ref(0)
const codeSending = ref(false)
const binding = ref(false)

// 页面加载
onLoad(() => {
  // 获取已登录用户的信息
  const userInfo = userStore.userInfo || {}
  
  // 如果已有信息，预填充
  if (userInfo.avatar) {
    formData.value.avatar = userInfo.avatar
  }
  if (userInfo.nickname) {
    formData.value.nickname = userInfo.nickname
  }
  
  // 如果已有手机号，直接跳到步骤3
  if (userInfo.phone) {
    currentStep.value = 3
  }
})

// 是否可以进入下一步（步骤1）
const canGoNextFromStep1 = computed(() => {
  return formData.value.nickname && formData.value.nickname.trim().length > 0
})

// 选择头像
const onChooseAvatar = async (e) => {
  console.log('选择头像:', e)
  
  const avatarUrl = e.detail.avatarUrl
  if (!avatarUrl) {
    return
  }
  
  try {
    uni.showLoading({
      title: '上传中...'
    })
    
    // 上传头像到服务器
    const data = await uploadAvatar(avatarUrl)
    console.log('上传头像返回:', data)
    
    // 确保 avatar 是字符串
    let avatarUrlStr = ''
    if (typeof data === 'string') {
      avatarUrlStr = data
    } else if (data && typeof data.url === 'string') {
      avatarUrlStr = data.url
    } else if (data && typeof data.data === 'object' && typeof data.data.url === 'string') {
      avatarUrlStr = data.data.url
    } else {
      // 如果都不是，使用临时路径
      avatarUrlStr = avatarUrl
    }
    
    formData.value.avatar = avatarUrlStr
    
    uni.showToast({
      title: '头像上传成功',
      icon: 'success',
      duration: 1500
    })
  } catch (error) {
    console.error('上传头像失败：', error)
    // 上传失败，使用临时路径
    formData.value.avatar = avatarUrl
  } finally {
    uni.hideLoading()
  }
}

// 下一步（保存头像和昵称）
const nextStep = async () => {
  if (!canGoNextFromStep1.value) {
    uni.showToast({
      title: '请输入昵称',
      icon: 'none'
    })
    return
  }
  
  try {
    uni.showLoading({
      title: '保存中...'
    })
    
    // 确保数据格式正确
    const updateData = {
      avatar: String(formData.value.avatar || ''),
      nickname: String(formData.value.nickname || '')
    }
    
    console.log('提交更新数据:', updateData)
    
    // 保存头像和昵称
    await updateUserInfo(updateData)
    
    // 更新本地用户信息
    await userStore.fetchUserInfo()
    
    // 进入下一步
    currentStep.value = 2
  } catch (error) {
    console.error('保存失败：', error)
    uni.showToast({
      title: error.msg || '保存失败',
      icon: 'none'
    })
  } finally {
    uni.hideLoading()
  }
}

// 获取微信手机号
const getPhoneNumber = async (e) => {
  console.log('获取手机号回调:', e)
  
  if (e.detail.errMsg === 'getPhoneNumber:ok') {
    try {
      uni.showLoading({
        title: '绑定中...'
      })
      
      // 调用后端接口绑定手机号
      await bindPhone({
        code: e.detail.code
      })
      
      // 刷新用户信息
      await userStore.fetchUserInfo()
      
      uni.showToast({
        title: '绑定成功',
        icon: 'success'
      })
      
      // 进入完成步骤
      setTimeout(() => {
        currentStep.value = 3
      }, 1500)
    } catch (error) {
      console.error('绑定失败：', error)
      uni.showToast({
        title: error.msg || '绑定失败',
        icon: 'none'
      })
    } finally {
      uni.hideLoading()
    }
  } else {
    console.log('用户拒绝授权手机号')
    uni.showToast({
      title: '您取消了授权',
      icon: 'none'
    })
  }
}

// 切换手动输入
const toggleManualInput = () => {
  showManualInput.value = !showManualInput.value
  // 清空表单
  phoneForm.value = {
    phone: '',
    code: ''
  }
}

// 发送验证码
const sendCode = async () => {
  // 验证手机号
  if (!phoneForm.value.phone) {
    uni.showToast({
      title: '请输入手机号',
      icon: 'none'
    })
    return
  }
  
  if (!/^1[3-9]\d{9}$/.test(phoneForm.value.phone)) {
    uni.showToast({
      title: '请输入正确的手机号',
      icon: 'none'
    })
    return
  }
  
  try {
    codeSending.value = true
    
    // TODO: 调用发送验证码接口
    // await sendSmsCode({ phone: phoneForm.value.phone })
    
    // 模拟发送成功
    uni.showToast({
      title: '验证码已发送',
      icon: 'success'
    })
    
    // 开始倒计时
    countdown.value = 60
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
  } catch (error) {
    console.error('发送验证码失败：', error)
    uni.showToast({
      title: error.msg || '发送失败',
      icon: 'none'
    })
  } finally {
    codeSending.value = false
  }
}

// 手动绑定手机号
const handleManualBind = async () => {
  // 表单验证
  if (!phoneForm.value.phone) {
    uni.showToast({
      title: '请输入手机号',
      icon: 'none'
    })
    return
  }
  
  if (!/^1[3-9]\d{9}$/.test(phoneForm.value.phone)) {
    uni.showToast({
      title: '请输入正确的手机号',
      icon: 'none'
    })
    return
  }
  
  if (!phoneForm.value.code) {
    uni.showToast({
      title: '请输入验证码',
      icon: 'none'
    })
    return
  }
  
  try {
    binding.value = true
    
    uni.showLoading({
      title: '绑定中...'
    })
    
    // TODO: 调用绑定手机号接口
    // await bindPhoneWithCode({
    //   phone: phoneForm.value.phone,
    //   code: phoneForm.value.code
    // })
    
    // 刷新用户信息
    await userStore.fetchUserInfo()
    
    uni.showToast({
      title: '绑定成功',
      icon: 'success'
    })
    
    // 进入完成步骤
    setTimeout(() => {
      currentStep.value = 3
    }, 1500)
  } catch (error) {
    console.error('绑定失败：', error)
    uni.showToast({
      title: error.msg || '绑定失败',
      icon: 'none'
    })
  } finally {
    binding.value = false
    uni.hideLoading()
  }
}

// 跳过头像昵称设置
const handleSkip = async () => {
  uni.showModal({
    title: '提示',
    content: '跳过后您可以稍后在个人中心完善信息',
    confirmText: '继续跳过',
    success: (res) => {
      if (res.confirm) {
        currentStep.value = 2
      }
    }
  })
}

// 跳过手机号绑定
const handleSkipPhone = async () => {
  uni.showModal({
    title: '提示',
    content: '跳过绑定后将无法报名课程，确定要跳过吗？',
    confirmText: '继续跳过',
    success: async (res) => {
      if (res.confirm) {
        // 标记已完成引导（即使跳过了手机号绑定）
        try {
          await updateUserInfo({
            profileCompleted: true
          })
          await userStore.fetchUserInfo()
        } catch (error) {
          console.error('保存失败：', error)
        }
        currentStep.value = 3
      }
    }
  })
}

// 完成设置
const handleComplete = async () => {
  try {
    uni.showLoading({
      title: '保存中...'
    })
    
    // 标记已完成个人信息引导
    await updateUserInfo({
      profileCompleted: true
    })
    
    // 刷新用户信息
    await userStore.fetchUserInfo()
    
    uni.hideLoading()
    
    // 跳转到首页
    uni.switchTab({
      url: '/pages/index/index'
    })
  } catch (error) {
    console.error('保存失败：', error)
    uni.hideLoading()
    // 即使失败也跳转到首页
    uni.switchTab({
      url: '/pages/index/index'
    })
  }
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: linear-gradient(180deg, #C8161D 0%, #A0141A 100%);
}

.container {
  padding: 60rpx 48rpx;
}

.welcome-section {
  text-align: center;
  margin-bottom: 60rpx;
  
  .icon {
    font-size: 120rpx;
    margin-bottom: 24rpx;
  }
  
  .title {
    font-size: 48rpx;
    font-weight: 600;
    color: #fff;
    margin-bottom: 12rpx;
  }
  
  .subtitle {
    font-size: 28rpx;
    color: rgba(255, 255, 255, 0.8);
  }
}

.progress-section {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 60rpx;
  padding: 0 20rpx;
  
  .progress-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12rpx;
    
    .progress-number {
      width: 64rpx;
      height: 64rpx;
      border-radius: 50%;
      background-color: rgba(255, 255, 255, 0.2);
      color: rgba(255, 255, 255, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28rpx;
      font-weight: 600;
      transition: all 0.3s;
    }
    
    .progress-text {
      font-size: 24rpx;
      color: rgba(255, 255, 255, 0.6);
      transition: all 0.3s;
    }
    
    &.active {
      .progress-number {
        background-color: #fff;
        color: #C8161D;
      }
      
      .progress-text {
        color: #fff;
      }
    }
    
    &.completed {
      .progress-number {
        background-color: #52C41A;
        color: #fff;
      }
    }
  }
  
  .progress-line {
    width: 80rpx;
    height: 4rpx;
    background-color: rgba(255, 255, 255, 0.2);
    margin: 0 8rpx;
    transition: all 0.3s;
    
    &.active {
      background-color: #fff;
    }
  }
}

.step-content {
  background-color: #fff;
  border-radius: 24rpx;
  padding: 48rpx;
  min-height: 500rpx;
  
  &.success {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    
    .success-icon {
      font-size: 120rpx;
      margin-bottom: 32rpx;
    }
    
    .success-title {
      font-size: 40rpx;
      font-weight: 600;
      color: #333;
      margin-bottom: 16rpx;
    }
    
    .success-desc {
      font-size: 28rpx;
      color: #666;
      margin-bottom: 60rpx;
    }
  }
}

// 表单区域
.form-section {
  .form-item {
    margin-bottom: 40rpx;
    
    &.center {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    
    .form-label {
      font-size: 28rpx;
      color: #333;
      font-weight: 500;
      margin-bottom: 16rpx;
    }
    
    .avatar-choose-btn {
      padding: 0;
      margin: 0;
      border: none;
      background: none;
      line-height: 1;
      margin-bottom: 12rpx;
      
      &::after {
        border: none;
      }
    }
    
    .avatar-wrapper {
      position: relative;
      width: 160rpx;
      height: 160rpx;
      
      .avatar-img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        display: block;
        border: 4rpx solid #f0f0f0;
      }
      
      .avatar-mask {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: rgba(0, 0, 0, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s;
        
        .icon {
          font-size: 56rpx;
        }
      }
      
      &:active .avatar-mask {
        opacity: 1;
      }
    }
    
    .tip {
      font-size: 24rpx;
      color: #999;
    }
    
    .form-input {
      width: 100%;
      padding: 24rpx 32rpx;
      background-color: #f8f8f8;
      border-radius: 16rpx;
      font-size: 28rpx;
      color: #333;
    }
    
    .input-placeholder {
      color: #999;
    }
    
    .input-tip {
      display: flex;
      align-items: center;
      gap: 8rpx;
      margin-top: 12rpx;
      padding: 12rpx 16rpx;
      background-color: #FFF7E6;
      border-radius: 12rpx;
      
      .tip-icon {
        font-size: 28rpx;
      }
      
      text {
        font-size: 24rpx;
        color: #F59A23;
        line-height: 1.6;
      }
    }
  }
}

// 手机号区域
.phone-section {
  text-align: center;
  
  .phone-icon {
    font-size: 120rpx;
    margin-bottom: 24rpx;
  }
  
  .phone-title {
    font-size: 36rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 12rpx;
  }
  
  .phone-desc {
    font-size: 26rpx;
    color: #666;
    margin-bottom: 60rpx;
  }
  
  .phone-btn {
    width: 100%;
    height: 96rpx;
    background: linear-gradient(135deg, #C8161D 0%, #E03A3E 100%);
    color: #fff;
    border-radius: 48rpx;
    font-size: 32rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8rpx 24rpx rgba(200, 22, 29, 0.3);
    border: none;
    margin-bottom: 32rpx;
    
    &::after {
      border: none;
    }
    
    .btn-icon {
      margin-right: 16rpx;
      font-size: 36rpx;
    }
  }
  
  .or-divider {
    display: flex;
    align-items: center;
    gap: 16rpx;
    margin: 32rpx 0;
    
    .line {
      flex: 1;
      height: 1rpx;
      background-color: #e0e0e0;
    }
    
    text {
      font-size: 24rpx;
      color: #999;
    }
  }
  
  .manual-btn {
    width: 100%;
    height: 88rpx;
    background-color: #f8f8f8;
    color: #666;
    border-radius: 48rpx;
    font-size: 28rpx;
    border: none;
    
    &::after {
      border: none;
    }
  }
  
  // 手动输入表单
  .manual-input-form {
    width: 100%;
    margin-bottom: 32rpx;
    
    .form-item {
      margin-bottom: 24rpx;
      
      .form-input {
        width: 100%;
        padding: 24rpx 32rpx;
        background-color: #f8f8f8;
        border-radius: 16rpx;
        font-size: 28rpx;
        color: #333;
      }
      
      .input-placeholder {
        color: #999;
      }
    }
    
    // 验证码输入行
    .code-item {
      display: flex;
      gap: 16rpx;
      
      .form-input {
        flex: 1;
        width: auto;
      }
      
      .code-btn {
        width: 200rpx;
        height: 88rpx;
        background-color: #f8f8f8;
        color: #666;
        border-radius: 16rpx;
        font-size: 26rpx;
        border: none;
        padding: 0;
        
        &::after {
          border: none;
        }
        
        &:disabled {
          opacity: 0.5;
        }
      }
    }
  }
}

// 按钮
.next-btn, .complete-btn {
  width: 100%;
  height: 96rpx;
  background: linear-gradient(135deg, #C8161D 0%, #E03A3E 100%);
  color: #fff;
  font-size: 32rpx;
  font-weight: 500;
  border-radius: 48rpx;
  border: none;
  margin-top: 40rpx;
  
  &::after {
    border: none;
  }
  
  &:disabled {
    opacity: 0.5;
  }
}

.skip-btn {
  width: 100%;
  height: 88rpx;
  background-color: transparent;
  color: rgba(255, 255, 255, 0.8);
  font-size: 28rpx;
  border: none;
  margin-top: 24rpx;
  
  &::after {
    border: none;
  }
}
</style>

image.png