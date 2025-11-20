<template>
  <view class="page">
    <!-- 头像 -->
    <view class="form-item avatar-item">
      <view class="item-label">头像</view>
      <view class="item-content">
        <!-- 微信头像选择按钮（推荐，无需权限）-->
        <button 
          class="avatar-btn" 
          open-type="chooseAvatar" 
          @chooseavatar="onChooseAvatar"
        >
          <view class="avatar-wrapper">
            <image :src="form.avatar" class="avatar-img" mode="aspectFill" />
            <view class="avatar-mask">
              <text class="icon">📷</text>
            </view>
          </view>
        </button>
        <text class="avatar-tip">点击更换</text>
      </view>
    </view>
    
    <!-- 昵称 -->
    <view class="form-item">
      <view class="item-label">昵称</view>
      <view class="item-content">
        <input 
          v-model="form.nickname" 
          type="nickname"
          placeholder="请输入昵称" 
        />
      </view>
    </view>
    
    <!-- 公司 -->
    <view class="form-item">
      <view class="item-label">公司</view>
      <view class="item-content">
        <input v-model="form.company" placeholder="请输入公司名称" />
      </view>
    </view>
    
    <!-- 职位 -->
    <view class="form-item">
      <view class="item-label">职位</view>
      <view class="item-content">
        <input v-model="form.position" placeholder="请输入职位" />
      </view>
    </view>
    
    <!-- 手机号 -->
    <view class="form-item">
      <view class="item-label">手机号</view>
      <button 
        class="phone-button" 
        open-type="getPhoneNumber" 
        @getphonenumber="onGetPhoneNumber"
      >
        <view class="item-content">
          <text v-if="form.phone" class="phone-text">{{ formatPhone(form.phone) }}</text>
          <text v-else class="placeholder-text">点击授权绑定手机号</text>
          <view class="arrow-icon">
            <text>›</text>
          </view>
        </view>
      </button>
    </view>
    
    <!-- 保存按钮 -->
    <view class="save-section">
      <button class="save-btn" @click="handleSave">保存</button>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useUserStore } from '@/store/user'
import { updateUserInfo, uploadAvatar, bindPhone } from '@/api/user'
import { formatPhone } from '@/utils/util'

const userStore = useUserStore()

// 表单数据
const form = ref({
  avatar: '',
  nickname: '',
  company: '',
  position: '',
  phone: ''
})

// 页面加载
onMounted(() => {
  const userInfo = userStore.userInfo || {}
  form.value = {
    avatar: userInfo.avatar || '/static/images/default-avatar.png',
    nickname: userInfo.nickname || '',
    company: userInfo.company || '',
    position: userInfo.position || '',
    phone: userInfo.phone || ''
  }
})

// 微信手机号授权回调
const onGetPhoneNumber = async (e) => {
  console.log('📱 微信手机号授权回调:', e)
  
  if (e.detail.errMsg === 'getPhoneNumber:ok') {
    try {
      uni.showLoading({ title: '绑定中...' })
      
      // 调用后端接口绑定手机号
      const result = await bindPhone({
        code: e.detail.code
      })
      
      console.log('✅ 手机号绑定成功:', result)
      
      // 更新本地显示
      form.value.phone = result.phone || result.data?.phone
      
      // 刷新用户信息
      await userStore.fetchUserInfo()
      
      uni.hideLoading()
      uni.showToast({
        title: '手机号绑定成功',
        icon: 'success'
      })
    } catch (error) {
      console.error('❌ 手机号绑定失败:', error)
      uni.hideLoading()
      uni.showToast({
        title: error.message || '绑定失败，请重试',
        icon: 'none'
      })
    }
  } else if (e.detail.errMsg === 'getPhoneNumber:fail user deny') {
    uni.showToast({
      title: '您取消了授权',
      icon: 'none'
    })
  } else {
    uni.showToast({
      title: '获取手机号失败',
      icon: 'none'
    })
  }
}

// 微信头像选择（官方API，无需权限）
const onChooseAvatar = async (e) => {
  console.log('选择微信头像:', e)
  
  const avatarUrl = e.detail.avatarUrl
  if (!avatarUrl) {
    return
  }
  
  // 直接上传微信提供的临时头像
  uploadAvatarFile(avatarUrl)
}

// 点击头像按钮（在小程序中会自动触发 chooseAvatar）
const handleAvatarClick = (e) => {
  console.log('点击头像区域')
  // 小程序会自动处理，无需额外操作
  // 在其他平台可以显示选择菜单
  // #ifndef MP-WEIXIN
  showAvatarOptions()
  // #endif
}

// 显示头像选择菜单（用于"点击更换"文字或其他平台）
const showAvatarOptions = () => {
  uni.showActionSheet({
    itemList: ['从相册选择', '拍照'],
    success: (res) => {
      const index = res.tapIndex
      if (index === 0) {
        chooseImageFromAlbum()
      } else if (index === 1) {
        chooseImageFromCamera()
      }
    }
  })
}

// 从相册选择图片
const chooseImageFromAlbum = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album'],
    success: (res) => {
      const tempFilePath = res.tempFilePaths[0]
      uploadAvatarFile(tempFilePath)
    },
    fail: (err) => {
      console.error('选择图片失败：', err)
    }
  })
}

// 拍照
const chooseImageFromCamera = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['camera'],
    success: (res) => {
      const tempFilePath = res.tempFilePaths[0]
      uploadAvatarFile(tempFilePath)
    },
    fail: (err) => {
      console.error('拍照失败：', err)
    }
  })
}

// 上传头像文件
const uploadAvatarFile = async (filePath) => {
  try {
    uni.showLoading({
      title: '上传中...'
    })
    
    console.log('开始上传头像:', filePath)
    
    // 上传图片到服务器
    const data = await uploadAvatar(filePath)
    
    console.log('上传结果:', data)
    
    // 确保 avatar 是字符串
    let avatarUrlStr = ''
    if (typeof data === 'string') {
      avatarUrlStr = data
    } else if (data && typeof data.url === 'string') {
      avatarUrlStr = data.url
    } else if (data && typeof data.data === 'object' && typeof data.data.url === 'string') {
      avatarUrlStr = data.data.url
    } else {
      // 如果都不是，使用原路径
      avatarUrlStr = filePath
    }
    
    // 更新头像
    form.value.avatar = avatarUrlStr
    
    uni.showToast({
      title: '上传成功',
      icon: 'success'
    })
  } catch (error) {
    console.error('上传失败：', error)
    uni.showToast({
      title: error.msg || '上传失败，请重试',
      icon: 'none',
      duration: 2000
    })
  } finally {
    uni.hideLoading()
  }
}

// 保存
const saving = ref(false) // 防重复提交

const handleSave = async () => {
  // 防重复提交
  if (saving.value) {
    return
  }
  
  // 表单验证
  if (!form.value.nickname) {
    uni.showToast({
      title: '请输入昵称',
      icon: 'none'
    })
    return
  }
  
  try {
    saving.value = true
    
    uni.showLoading({
      title: '保存中...'
    })
    
    // 只发送可修改的字段，不包括 phone
    // 确保所有字段都是字符串类型
    const updateData = {
      avatar: String(form.value.avatar || ''),
      nickname: String(form.value.nickname || ''),
      company: String(form.value.company || ''),
      position: String(form.value.position || '')
    }
    
    console.log('提交数据:', updateData)
    
    await updateUserInfo(updateData)
    
    // 更新本地用户信息
    await userStore.fetchUserInfo()
    
    uni.showToast({
      title: '保存成功',
      icon: 'success'
    })
    
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  } catch (error) {
    console.error('保存失败：', error)
    uni.showToast({
      title: error.msg || '保存失败，请重试',
      icon: 'none'
    })
  } finally {
    saving.value = false
    uni.hideLoading()
  }
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background-color: #f8f8f8;
}

.form-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #fff;
  padding: 32rpx 24rpx;
  border-bottom: 1rpx solid #f0f0f0;
  
  .item-label {
    font-size: 28rpx;
    color: #333;
    width: 140rpx;
  }
  
  .item-content {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    
    input {
      flex: 1;
      text-align: right;
      font-size: 28rpx;
      color: #333;
    }
  }
  
  // 头像专用样式
  &.avatar-item {
    .avatar-btn {
      padding: 0;
      margin: 0;
      border: none;
      background: none;
      line-height: 1;
      
      &::after {
        border: none;
      }
    }
    
    .avatar-wrapper {
      position: relative;
      width: 120rpx;
      height: 120rpx;
      
      .avatar-img {
        width: 100%;
        height: 100%;
        border-radius: 12rpx;
        display: block;
        border: 2rpx solid #f0f0f0;
      }
      
      .avatar-mask {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border-radius: 12rpx;
        background-color: rgba(0, 0, 0, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s;
        
        .icon {
          font-size: 48rpx;
        }
      }
      
      &:active .avatar-mask {
        opacity: 1;
      }
    }
    
    .avatar-tip {
      font-size: 24rpx;
      color: #999;
      margin-left: 16rpx;
    }
  }
  
  .phone-text {
    font-size: 28rpx;
    color: #333;
  }
  
  .placeholder-text {
    font-size: 28rpx;
    color: #999;
  }
  
  .arrow-icon {
    width: 32rpx;
    height: 32rpx;
    margin-left: 16rpx;
    color: #ccc;
    font-size: 40rpx;
    line-height: 1;
  }
}

// 手机号按钮（透明按钮）
.phone-button {
  flex: 1;
  padding: 0;
  margin: 0;
  border: none;
  background: transparent;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  
  &::after {
    border: none;
  }
  
  .item-content {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }
}

.save-section {
  padding: 80rpx 24rpx 40rpx;
  
  .save-btn {
    width: 100%;
    height: 88rpx;
    line-height: 88rpx;
    background-color: #C8161D;
    color: #fff;
    font-size: 30rpx;
    border-radius: 44rpx;
    border: none;
  }
}
</style>

