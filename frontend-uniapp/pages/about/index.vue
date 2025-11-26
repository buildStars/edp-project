<template>
  <view class="page">
  
    
    <view class="content">
      <!-- Logo和名称 -->
      <view class="header-section">
        <image 
          v-if="systemConfig.appLogo" 
          :src="systemConfig.appLogo" 
          class="app-logo" 
          mode="aspectFit"
        />
        <view class="app-name">{{ systemConfig.appName || '北大汇丰EDP' }}</view>
        <view v-if="systemConfig.appDesc" class="app-desc">{{ systemConfig.appDesc }}</view>
      </view>
      
      <!-- 联系方式 -->
      <view class="section">
        <view class="section-title">
          <Icon name="phone" :size="36" color="#C8161D" />
          <text>联系我们</text>
        </view>
        
        <view v-if="systemConfig.contactPhone" class="info-item" @click="makePhoneCall">
          <view class="info-label">
            <Icon name="phone" :size="32" color="#666" />
            <text>电话</text>
          </view>
          <view class="info-value">
            <text>{{ systemConfig.contactPhone }}</text>
            <Icon name="arrow-right" :size="28" color="#999" />
          </view>
        </view>
        
        <view v-if="systemConfig.contactEmail" class="info-item" @click="copyEmail">
          <view class="info-label">
            <Icon name="email" :size="32" color="#666" />
            <text>邮箱</text>
          </view>
          <view class="info-value">
            <text>{{ systemConfig.contactEmail }}</text>
             <image src="../../static/icons/copy.png" mode="aspectFit"  class="copy-icon" />
          </view>
        </view>
        
        <view v-if="systemConfig.contactAddress" class="info-item">
          <view class="info-label">
            <Icon name="location" :size="32" color="#666" />
            <text>地址</text>
          </view>
          <view class="info-value">
            <text>{{ systemConfig.contactAddress }}</text>
          </view>
        </view>
      </view>
      
      <!-- 关于我们详细介绍 -->
      <view v-if="systemConfig.aboutUs" class="section">
        <view class="section-title">
          <Icon name="info" :size="36" color="#C8161D" />
          <text>关于我们</text>
        </view>
        <view class="about-content">
          {{ systemConfig.aboutUs }}
        </view>
      </view>
      
      <!-- 社交媒体 -->
      <view v-if="systemConfig.wechatQrCode || systemConfig.weiboUrl" class="section">
        <view class="section-title">
          <Icon name="share" :size="36" color="#C8161D" />
          <text>关注我们</text>
        </view>
        
        <view v-if="systemConfig.wechatQrCode" class="qrcode-container">
          <view class="qrcode-label">微信公众号</view>
          <image 
            :src="systemConfig.wechatQrCode" 
            class="qrcode" 
            mode="aspectFit"
            @click="previewQrCode"
          />
          <view class="qrcode-tip">长按识别二维码关注</view>
        </view>
        
        <view v-if="systemConfig.weiboUrl" class="info-item" @click="openWeibo">
          <view class="info-label">
            <Icon name="weibo" :size="32" color="#666" />
            <text>微博</text>
          </view>
          <view class="info-value">
            <text>访问我们的微博</text>
            <Icon name="arrow-right" :size="28" color="#999" />
          </view>
        </view>
      </view>
      
      <!-- 版本信息 -->
      <view class="version-info">
        <text>版本号：v{{ systemConfig.appVersion || '1.0.0' }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import CustomNavbar from '@/components/custom-navbar/custom-navbar.vue'
import Icon from '@/components/icon/icon.vue'
import { getSystemConfig } from '@/api/system'

const systemConfig = ref({
  appName: '北大汇丰EDP',
  appLogo: '',
  appDesc: '',
  aboutUs: '',
  contactPhone: '',
  contactEmail: '',
  contactAddress: '',
  wechatQrCode: '',
  weiboUrl: '',
  appVersion: '1.0.0'
})

const loading = ref(false)

onMounted(() => {
  loadSystemConfig()
})

// 加载系统配置
const loadSystemConfig = async () => {
  try {
    loading.value = true
    const data = await getSystemConfig()
    systemConfig.value = {
      ...systemConfig.value,
      ...data
    }
  } catch (error) {
    console.error('加载系统配置失败：', error)
  } finally {
    loading.value = false
  }
}

// 拨打电话
const makePhoneCall = () => {
  if (!systemConfig.value.contactPhone) return
  
  uni.makePhoneCall({
    phoneNumber: systemConfig.value.contactPhone,
    fail: (err) => {
      console.error('拨打电话失败：', err)
      uni.showToast({
        title: '拨打电话失败',
        icon: 'none'
      })
    }
  })
}

// 复制邮箱
const copyEmail = () => {
  if (!systemConfig.value.contactEmail) return
  
  uni.setClipboardData({
    data: systemConfig.value.contactEmail,
    success: () => {
      uni.showToast({
        title: '邮箱已复制',
        icon: 'success'
      })
    }
  })
}

// 预览二维码
const previewQrCode = () => {
  if (!systemConfig.value.wechatQrCode) return
  
  uni.previewImage({
    urls: [systemConfig.value.wechatQrCode],
    current: 0
  })
}

// 打开微博
const openWeibo = () => {
  if (!systemConfig.value.weiboUrl) return
  
  uni.navigateTo({
    url: `/pages/webview/index?url=${encodeURIComponent(systemConfig.value.weiboUrl)}`
  })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: linear-gradient(to bottom, #f8f9fa 0%, #ffffff 100%);
}

.content {
  padding: 32rpx;
}

.header-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 0;
  background: white;
  border-radius: 16rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 2rpx 16rpx rgba(0, 0, 0, 0.05);
  
  .app-logo {
    width: 160rpx;
    height: 160rpx;
    margin-bottom: 24rpx;
    border-radius: 20rpx;
  }
  
  .app-name {
    font-size: 40rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 16rpx;
  }
  
  .app-desc {
    font-size: 28rpx;
    color: #666;
    text-align: center;
    padding: 0 40rpx;
    line-height: 1.6;
  }
}

.section {
  background: white;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 2rpx 16rpx rgba(0, 0, 0, 0.05);
  
  .section-title {
    display: flex;
    align-items: center;
    gap: 12rpx;
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 32rpx;
    padding-bottom: 20rpx;
    border-bottom: 1rpx solid #f0f0f0;
  }
  
  .about-content {
    font-size: 28rpx;
    color: #666;
    line-height: 2;
    white-space: pre-wrap;
    word-break: break-word;
  }
  
  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24rpx 0;
    border-bottom: 1rpx solid #f5f5f5;
    
    &:last-child {
      border-bottom: none;
    }
    
    .info-label {
      display: flex;
      align-items: center;
      gap: 12rpx;
      font-size: 28rpx;
      color: #666;
    }
    
    .info-value {
      display: flex;
      align-items: center;
      gap: 8rpx;
      font-size: 28rpx;
      color: #333;
      flex: 1;
      justify-content: flex-end;
      text-align: right;
      max-width: 60%;
      
      text {
        word-break: break-all;
      }
    }
  }
  
  .qrcode-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 32rpx 0;
    
    .qrcode-label {
      font-size: 28rpx;
      color: #666;
      margin-bottom: 24rpx;
    }
    
    .qrcode {
      width: 400rpx;
      height: 400rpx;
      border: 1rpx solid #f0f0f0;
      border-radius: 8rpx;
      margin-bottom: 16rpx;
    }
    
    .qrcode-tip {
      font-size: 24rpx;
      color: #999;
    }
  }
}

.version-info {
  text-align: center;
  font-size: 24rpx;
  color: #999;
  padding: 40rpx 0;
}
.copy-icon {
  width: 40rpx;
  height: 40rpx;
  cursor: pointer;
}
</style>

