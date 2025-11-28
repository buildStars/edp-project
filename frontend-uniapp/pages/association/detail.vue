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
    
    <!-- 申请加入 - 优化版 -->
    <view class="section join-section">
      <view class="section-header">
        <view class="section-icon">
          <Icon name="user" :size="40" color="#C8161D" />
        </view>
        <view class="section-title-wrapper">
          <text class="section-title">加入协会</text>
          <text class="section-subtitle">Join Us</text>
        </view>
      </view>
      <view class="join-content">
        <view v-if="joinStatus === 'NOT_APPLIED'" class="join-info">
          <view class="info-box">
            <view class="info-icon">📝</view>
            <view class="info-texts">
              <text class="info-title">申请加入</text>
              <text class="info-desc">提交申请后，管理员将在1-3个工作日内审核您的申请</text>
            </view>
          </view>
          <view class="tip-list">
            <view class="tip-item">
              <Icon name="check" :size="28" color="#52C41A" />
              <text class="tip-text">填写真实信息，有助于快速通过审核</text>
            </view>
            <view class="tip-item">
              <Icon name="check" :size="28" color="#52C41A" />
              <text class="tip-text">加入后可参与协会活动和交流</text>
            </view>
          </view>
          <button class="btn-join" @click="handleJoinApply">
            <Icon name="add" :size="36" color="#fff" />
            <text>申请加入</text>
          </button>
        </view>
        
        <view v-else-if="joinStatus === 'PENDING'" class="join-status-box pending">
          <view class="status-icon">⏳</view>
          <view class="status-text">
            <text class="status-title">申请审核中</text>
            <text class="status-desc">您的申请正在审核中，请耐心等待...</text>
          </view>
        </view>
        
        <view v-else-if="joinStatus === 'APPROVED'" class="join-status-box approved">
          <view class="status-icon">✅</view>
          <view class="status-text">
            <text class="status-title">已加入协会</text>
            <text class="status-desc">欢迎成为协会成员！</text>
          </view>
        </view>
        
        <view v-else-if="joinStatus === 'REJECTED'" class="join-status-box rejected">
          <view class="status-icon">❌</view>
          <view class="status-text">
            <text class="status-title">申请未通过</text>
            <text class="status-desc">{{ rejectionReason || '很抱歉，您的申请未通过审核' }}</text>
          </view>
          <button class="btn-reapply" @click="handleJoinApply">重新申请</button>
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
import { getAssociationDetail, getAssociationJoinStatus, applyToJoinAssociation } from '@/api/association'
import { useUserStore } from '@/store/user'
import Icon from '@/components/icon/icon.vue'

const userStore = useUserStore()

// 协会详情（初始化为包含默认值的对象，防止渲染报错）
const detail = ref({
  name: '',
  logo: '',
  description: '',
  introduction: ''
})

// 加入状态：NOT_APPLIED(未申请), PENDING(审核中), APPROVED(已通过), REJECTED(已拒绝)
const joinStatus = ref('NOT_APPLIED')
const rejectionReason = ref('')
const associationId = ref('')

// 页面加载
onLoad((options) => {
  if (options.id) {
    associationId.value = options.id
    loadDetail(options.id)
    if (userStore.isLogin) {
      loadJoinStatus(options.id)
    }
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

// 加载加入状态
const loadJoinStatus = async (id) => {
  try {
    const data = await getAssociationJoinStatus(id)
    joinStatus.value = data.status
    rejectionReason.value = data.rejectionReason || ''
  } catch (error) {
    console.error('加载加入状态失败：', error)
    // 如果接口不存在或报错，默认为未申请
    joinStatus.value = 'NOT_APPLIED'
  }
}

// 申请加入
const handleJoinApply = async () => {
  // 检查登录状态
  if (!userStore.isLogin) {
    uni.showToast({
      title: '请先登录',
      icon: 'none'
    })
    setTimeout(() => {
      uni.navigateTo({ url: '/pages/login/index' })
    }, 1500)
    return
  }
  
  uni.showModal({
    title: '申请加入',
    content: `确认申请加入「${detail.value.name}」吗？`,
    success: async (res) => {
      if (res.confirm) {
        try {
          uni.showLoading({ title: '提交中...' })
          await applyToJoinAssociation(associationId.value)
          uni.hideLoading()
          
          uni.showToast({
            title: '申请已提交',
            icon: 'success'
          })
          
          // 刷新加入状态
          await loadJoinStatus(associationId.value)
        } catch (error) {
          uni.hideLoading()
          uni.showToast({
            title: error.msg || '申请失败',
            icon: 'none'
          })
        }
      }
    }
  })
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

// 加入协会 - 优化版
.join-content {
  .join-info {
    .info-box {
      display: flex;
      align-items: center;
      gap: 20rpx;
      padding: 32rpx;
      background: linear-gradient(135deg, #E6F7FF 0%, #F0F8FF 100%);
      border-radius: 20rpx;
      margin-bottom: 32rpx;
      
      .info-icon {
        font-size: 64rpx;
        flex-shrink: 0;
      }
      
      .info-texts {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 8rpx;
        
        .info-title {
          font-size: 32rpx;
          font-weight: 700;
          color: #0050B3;
        }
        
        .info-desc {
          font-size: 24rpx;
          color: #096DD9;
          line-height: 1.6;
        }
      }
    }
    
    .tip-list {
      margin-bottom: 32rpx;
      
      .tip-item {
        display: flex;
        align-items: flex-start;
        gap: 12rpx;
        margin-bottom: 16rpx;
        
        &:last-child {
          margin-bottom: 0;
        }
        
        .tip-text {
          flex: 1;
          font-size: 26rpx;
          color: #666;
          line-height: 1.6;
        }
      }
    }
    
    .btn-join {
      width: 100%;
      height: 96rpx;
      background: linear-gradient(135deg, #C8161D 0%, #FF4757 100%);
      color: #fff;
      font-size: 32rpx;
      font-weight: 600;
      border-radius: 48rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12rpx;
      box-shadow: 0 8rpx 24rpx rgba(200, 22, 29, 0.3);
      transition: all 0.3s ease;
      
      &:active {
        transform: translateY(-2rpx);
        box-shadow: 0 12rpx 32rpx rgba(200, 22, 29, 0.4);
      }
    }
  }
  
  .join-status-box {
    padding: 48rpx 32rpx;
    border-radius: 20rpx;
    text-align: center;
    
    &.pending {
      background: linear-gradient(135deg, #FFF7E6 0%, #FFFAF0 100%);
      
      .status-icon {
        font-size: 80rpx;
        margin-bottom: 24rpx;
      }
    }
    
    &.approved {
      background: linear-gradient(135deg, #F6FFED 0%, #FAFFFA 100%);
      
      .status-icon {
        font-size: 80rpx;
        margin-bottom: 24rpx;
      }
    }
    
    &.rejected {
      background: linear-gradient(135deg, #FFF1F0 0%, #FFF5F5 100%);
      
      .status-icon {
        font-size: 80rpx;
        margin-bottom: 24rpx;
      }
      
      .btn-reapply {
        margin-top: 24rpx;
        width: 100%;
        height: 80rpx;
        background: linear-gradient(135deg, #C8161D 0%, #FF4757 100%);
        color: #fff;
        font-size: 28rpx;
        font-weight: 600;
        border-radius: 40rpx;
      }
    }
    
    .status-text {
      display: flex;
      flex-direction: column;
      gap: 12rpx;
      
      .status-title {
        font-size: 34rpx;
        font-weight: 700;
        color: #1a1a1a;
      }
      
      .status-desc {
        font-size: 26rpx;
        color: #666;
        line-height: 1.6;
      }
    }
  }
}

// 联系方式 - 优化版（保留以防其他地方使用）
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

