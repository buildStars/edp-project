<template>
  <view class="page">
    <!-- 头部信息 - 优化版 -->
    <view class="header-section">
      <view class="header-bg"></view>
      <view class="header-content">
        <view class="logo-container">
          <image :src="detail.logo" class="detail-logo" mode="aspectFill" />
          <view class="logo-glow"></view>
        </view>
        <view class="header-info">
          <view class="detail-name">{{ detail.name }}</view>
          <view class="detail-desc">{{ detail.description }}</view>
          <view class="header-stats">
            <view class="stat-item">
              <Icon name="view" :size="32" color="#999" />
              <text class="stat-text">{{ detail.views || 0 }} 阅读</text>
            </view>
            <view class="stat-item">
              <Icon name="user" :size="32" color="#999" />
              <text class="stat-text">{{ detail.memberCount || 0 }} 成员</text>
            </view>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 详细介绍 - 优化版 -->
    <view class="section introduction-section">
      <view class="section-header">
        <view class="section-icon">
          <Icon name="news" :size="40" color="#C8161D" />
        </view>
        <view class="section-title-wrapper">
          <text class="section-title">协会介绍</text>
          <text class="section-subtitle">Introduction</text>
        </view>
      </view>
      <view class="section-content">
        <rich-text :nodes="detail.introduction"></rich-text>
      </view>
    </view>
    
    <!-- 联系方式 - 优化版 -->
    <view class="section contact-section">
      <view class="section-header">
        <view class="section-icon">
          <Icon name="phone" :size="40" color="#C8161D" />
        </view>
        <view class="section-title-wrapper">
          <text class="section-title">联系方式</text>
          <text class="section-subtitle">Contact Info</text>
        </view>
      </view>
      <view class="contact-list">
        <view class="contact-item">
          <view class="contact-icon">
            <Icon name="user" :size="40" color="#C8161D" />
          </view>
          <view class="contact-content">
            <text class="contact-label">联系人</text>
            <text class="contact-value">{{ detail.contactPerson }}</text>
          </view>
        </view>
        
        <view class="contact-item contact-clickable" @click="makeCall">
          <view class="contact-icon">
            <Icon name="phone" :size="40" color="#C8161D" />
          </view>
          <view class="contact-content">
            <text class="contact-label">联系电话</text>
            <text class="contact-value contact-phone">{{ detail.contactPhone }}</text>
          </view>
          <Icon name="arrow-right" :size="32" color="#C8161D" />
        </view>
        
        <view v-if="detail.contactEmail" class="contact-item">
          <view class="contact-icon">
            <Icon name="email" :size="40" color="#C8161D" />
          </view>
          <view class="contact-content">
            <text class="contact-label">邮箱</text>
            <text class="contact-value">{{ detail.contactEmail }}</text>
          </view>
        </view>
        
        <view v-if="detail.wechat" class="contact-item contact-clickable" @click="copyWechat">
          <view class="contact-icon">
            <Icon name="wechat" :size="40" color="#07C160" />
          </view>
          <view class="contact-content">
            <text class="contact-label">微信号</text>
            <text class="contact-value contact-wechat">{{ detail.wechat }}</text>
          </view>
          <view class="copy-btn">
            <text>复制</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 底部间距 -->
    <view class="page-footer"></view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getAssociationDetail } from '@/api/association'
import { makePhoneCall, copyText } from '@/utils/util'
import Icon from '@/components/icon/icon.vue'

// 协会详情（初始化为包含默认值的对象，防止渲染报错）
const detail = ref({
  name: '',
  logo: '',
  description: '',
  introduction: '',
  contactPerson: '',
  contactPhone: '',
  contactEmail: '',
  wechat: ''
})

// 页面加载
onLoad((options) => {
  if (options.id) {
    loadDetail(options.id)
  }
})

// 加载详情
const loadDetail = async (id) => {
  uni.showLoading({
    title: '加载中...'
  })
  
  try {
    const data = await getAssociationDetail(id)
    detail.value = data
  } catch (error) {
    console.error('加载详情失败：', error)
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  } finally {
    uni.hideLoading()
  }
}

// 拨打电话
const makeCall = () => {
  if (detail.value.contactPhone) {
    makePhoneCall(detail.value.contactPhone)
  }
}

// 复制微信号
const copyWechat = () => {
  if (detail.value.wechat) {
    copyText(detail.value.wechat)
  }
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f5f7fa 0%, #ffffff 100%);
  padding-bottom: env(safe-area-inset-bottom);
}

// 头部信息 - 优化版
.header-section {
  position: relative;
  background: #fff;
  padding: 48rpx 32rpx;
  margin-bottom: 24rpx;
  overflow: hidden;
  
  .header-bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 200rpx;
    background: linear-gradient(135deg, #C8161D 0%, #FF4757 100%);
    opacity: 0.05;
  }
  
  .header-content {
    position: relative;
    display: flex;
    align-items: flex-start;
    
    .logo-container {
      position: relative;
      margin-right: 32rpx;
      flex-shrink: 0;
      
      .detail-logo {
        width: 176rpx;
        height: 176rpx;
        border-radius: 24rpx;
        box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.12);
        border: 6rpx solid #fff;
      }
      
      .logo-glow {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 176rpx;
        height: 176rpx;
        border-radius: 24rpx;
        background: linear-gradient(135deg, #C8161D 0%, #FF4757 100%);
        opacity: 0.2;
        filter: blur(20rpx);
        z-index: -1;
      }
    }
    
    .header-info {
      flex: 1;
      
      .detail-name {
        font-size: 40rpx;
        font-weight: 700;
        color: #1a1a1a;
        margin-bottom: 16rpx;
        line-height: 1.3;
      }
      
      .detail-desc {
        font-size: 28rpx;
        color: #666;
        line-height: 1.6;
        margin-bottom: 20rpx;
      }
      
      .header-stats {
        display: flex;
        align-items: center;
        gap: 32rpx;
        
        .stat-item {
          display: flex;
          align-items: center;
          gap: 8rpx;
          
          .stat-text {
            font-size: 24rpx;
            color: #999;
          }
        }
      }
    }
  }
}

// 内容区块 - 优化版
.section {
  background: #fff;
  padding: 32rpx;
  margin: 24rpx;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
  
  .section-header {
    display: flex;
    align-items: center;
    gap: 16rpx;
    margin-bottom: 32rpx;
    padding-bottom: 24rpx;
    border-bottom: 1rpx solid #f0f0f0;
    
    .section-icon {
      width: 64rpx;
      height: 64rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 16rpx;
      background: linear-gradient(135deg, rgba(200, 22, 29, 0.1) 0%, rgba(200, 22, 29, 0.05) 100%);
    }
    
    .section-title-wrapper {
      flex: 1;
      display: flex;
      flex-direction: column;
      
      .section-title {
        font-size: 34rpx;
        font-weight: 700;
        color: #1a1a1a;
        line-height: 1.2;
      }
      
      .section-subtitle {
        font-size: 22rpx;
        color: #999;
        margin-top: 4rpx;
        text-transform: uppercase;
        letter-spacing: 1rpx;
      }
    }
  }
  
  .section-content {
    font-size: 28rpx;
    color: #666;
    line-height: 1.8;
    
    :deep(img) {
      max-width: 100%;
      height: auto;
      display: block;
      margin: 20rpx 0;
      border-radius: 12rpx;
    }
    
    :deep(p) {
      margin: 16rpx 0;
    }
  }
}

// 联系方式 - 优化版
.contact-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  
  .contact-item {
    display: flex;
    align-items: center;
    padding: 24rpx;
    background: linear-gradient(135deg, #fafbfc 0%, #ffffff 100%);
    border-radius: 16rpx;
    transition: all 0.3s ease;
    
    .contact-icon {
      width: 72rpx;
      height: 72rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 16rpx;
      background: linear-gradient(135deg, rgba(200, 22, 29, 0.1) 0%, rgba(200, 22, 29, 0.05) 100%);
      margin-right: 20rpx;
      flex-shrink: 0;
    }
    
    .contact-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      
      .contact-label {
        font-size: 24rpx;
        color: #999;
        margin-bottom: 8rpx;
      }
      
      .contact-value {
        font-size: 28rpx;
        font-weight: 600;
        color: #333;
        
        &.contact-phone,
        &.contact-wechat {
          color: #C8161D;
        }
      }
    }
    
    .copy-btn {
      padding: 12rpx 24rpx;
      background: linear-gradient(135deg, #C8161D 0%, #FF4757 100%);
      color: #fff;
      font-size: 24rpx;
      font-weight: 600;
      border-radius: 20rpx;
      box-shadow: 0 4rpx 12rpx rgba(200, 22, 29, 0.3);
      
      text {
        color: #fff;
      }
    }
    
    &.contact-clickable {
      cursor: pointer;
      
      &:active {
        transform: scale(0.98);
        background: linear-gradient(135deg, #f0f1f3 0%, #f5f7fa 100%);
      }
    }
  }
}

// 底部间距
.page-footer {
  height: 48rpx;
}
</style>

