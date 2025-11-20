<template>
  <view class="page">
    <custom-navbar :title="chapterInfo?.title || '章节详情'" :show-back="true" />
    
    <!-- 占位符 -->
    <view class="navbar-placeholder" :style="{ height: navbarTotalHeight + 'px' }"></view>
    
    <!-- 章节信息卡片 -->
    <view v-if="chapterInfo" class="chapter-info-card">
      <view class="info-header">
        <view class="chapter-number">
          <text class="number-text">第{{ chapterInfo.sortOrder }}节</text>
        </view>
        <view class="chapter-status" :class="getStatusClass(chapterInfo.status)">
          {{ getStatusText(chapterInfo.status) }}
        </view>
      </view>
      
      <view class="chapter-title">{{ chapterInfo.title }}</view>
      
      <view v-if="chapterInfo.description" class="chapter-desc">
        {{ chapterInfo.description }}
      </view>
      
      <view class="chapter-meta">
        <view class="meta-item" v-if="chapterInfo.duration">
          <Icon name="time" :size="28" color="#999" />
          <text>{{ chapterInfo.duration }}分钟</text>
        </view>
        <view class="meta-item" v-if="chapterInfo.startTime">
          <Icon name="time" :size="28" color="#999" />
          <text>{{ formatTime(chapterInfo.startTime, 'YYYY-MM-DD HH:mm') }}</text>
        </view>
        <view class="meta-item" v-if="chapterInfo.location">
          <Icon name="location" :size="28" color="#999" />
          <text>{{ chapterInfo.location }}</text>
        </view>
      </view>
    </view>
    
    <!-- 签到和评价操作栏 -->
    <view v-if="chapterInfo" class="action-section">
      <!-- 签到按钮 -->
      <button 
        v-if="activeCheckin.canCheckin && !activeCheckin.alreadyCheckedIn"
        class="btn-checkin"
        @click="showCheckinModal = true"
      >
        <Icon name="check" :size="32" color="#fff" />
        <text>立即签到（剩余{{ activeCheckin.remainingMinutes }}分钟）</text>
      </button>
      <button 
        v-else-if="activeCheckin.alreadyCheckedIn"
        class="btn-checked-in"
        disabled
      >
        <Icon name="check" :size="32" color="#fff" />
        <text>已签到</text>
      </button>
      
      <!-- 评价按钮（已签到且未评价时显示） -->
      <button 
        v-if="activeCheckin.alreadyCheckedIn && !chapterInfo.hasEvaluated"
        class="btn-evaluate"
        @click="handleEvaluate"
      >
        <text>⭐ 评价本节</text>
      </button>
      
      <!-- 已评价标签 -->
      <button 
        v-else-if="activeCheckin.alreadyCheckedIn && chapterInfo.hasEvaluated"
        class="btn-evaluated"
        disabled
      >
        <text>⭐ 已评价</text>
      </button>
    </view>
    
    <!-- 功能卡片 -->
    <view class="function-section">
      <view class="section-title">章节内容</view>
      
      <view class="function-grid">
        <!-- 签到状态 -->
        <view 
          class="function-card" 
          :class="[
            chapterInfo?.hasCheckedIn ? 'card-success' : 'card-default',
            !chapterInfo?.hasCheckedIn ? 'card-locked' : ''
          ]"
          @click="handleViewCheckinRecords"
        >
          <view class="card-icon">
            <Icon :name="chapterInfo?.hasCheckedIn ? 'check' : 'clock-o'" :size="64" :color="chapterInfo?.hasCheckedIn ? '#52C41A' : '#999'" />
          </view>
          <view class="card-title">签到记录</view>
          <view class="card-status" :class="chapterInfo?.hasCheckedIn ? 'status-success' : 'status-default'">
            {{ chapterInfo?.hasCheckedIn ? '已签到' : '未签到' }}
          </view>
          <view v-if="!chapterInfo?.hasCheckedIn" class="card-tip">请先签到</view>
        </view>
        
        <!-- 评价状态 -->
        <view 
          class="function-card" 
          :class="[
            chapterInfo?.hasEvaluated ? 'card-success' : 'card-default',
            !chapterInfo?.hasCheckedIn ? 'card-locked' : ''
          ]"
          @click="handleEvaluateCard"
        >
          <view class="card-icon">
            <Icon 
              :name="chapterInfo?.hasEvaluated ? 'star' : (chapterInfo?.hasCheckedIn ? 'star-o' : 'lock')" 
              :size="64" 
              :color="chapterInfo?.hasEvaluated ? '#FF9800' : (chapterInfo?.hasCheckedIn ? '#999' : '#ccc')" 
            />
          </view>
          <view class="card-title">课程评价</view>
          <view class="card-status" :class="chapterInfo?.hasEvaluated ? 'status-success' : 'status-default'">
            {{ chapterInfo?.hasEvaluated ? '已评价' : (chapterInfo?.hasCheckedIn ? '未评价' : '已锁定') }}
          </view>
          <view v-if="!chapterInfo?.hasCheckedIn" class="card-tip">签到后解锁</view>
        </view>
        
        <!-- 课件 -->
        <view 
          class="function-card" 
          :class="[
            chapterInfo?.hasEvaluated ? 'card-success' : 'card-default',
            !chapterInfo?.hasEvaluated ? 'card-locked' : ''
          ]"
          @click="handleViewMaterials"
        >
          <view class="card-icon">
            <Icon 
              :name="chapterInfo?.hasEvaluated ? 'course' : 'lock'" 
              :size="64" 
              :color="chapterInfo?.hasEvaluated ? '#C8161D' : '#ccc'" 
            />
          </view>
          <view class="card-title">课件资料</view>
          <view class="card-count" v-if="chapterInfo?.hasEvaluated">{{ materialsCount }}份</view>
          <view class="card-status status-default" v-else>已锁定</view>
          <view v-if="!chapterInfo?.hasEvaluated" class="card-tip">评价后解锁</view>
        </view>
      </view>
    </view>
    
    
    <!-- 签到记录 -->
    <view v-if="checkinsList.length > 0" class="checkins-section">
      <view class="section-header">
        <text class="section-title">签到记录</text>
        <text class="section-more">查看全部</text>
      </view>
      
      <view 
        v-for="checkin in checkinsList.slice(0, 3)" 
        :key="checkin.id"
        class="checkin-item"
      >
        <view class="checkin-status" :class="checkin.status === 'CHECKED_IN' ? 'checked' : 'missed'">
          <Icon :name="checkin.status === 'CHECKED_IN' ? 'check' : 'close'" :size="32" color="#fff" />
        </view>
        <view class="checkin-info">
          <view class="checkin-title">签到码: {{ checkin.code }}</view>
          <view class="checkin-time">{{ formatTime(checkin.checkinTime, 'YYYY-MM-DD HH:mm') }}</view>
        </view>
        <view class="checkin-badge" :class="checkin.status === 'CHECKED_IN' ? 'success' : 'error'">
          {{ checkin.status === 'CHECKED_IN' ? '已签到' : '缺勤' }}
        </view>
      </view>
    </view>
    
    <!-- 空状态 -->
    <empty-view 
      v-if="!loading && !chapterInfo"
      text="章节信息加载失败"
    />
    
    <!-- 加载状态 -->
    <view v-if="loading" class="loading-container">
      <text class="loading-text">加载中...</text>
    </view>
    
    <!-- 签到弹窗 -->
    <view v-if="showCheckinModal" class="modal-overlay" @click="showCheckinModal = false">
      <view class="checkin-modal" @click.stop>
        <view class="modal-title">章节签到</view>
        <view class="modal-subtitle">请输入老师告知的6位数字签到码</view>
        
        <view class="code-input-section">
          <input
            v-model="checkinCode"
            type="number"
            maxlength="6"
            placeholder="请输入6位签到码"
            class="code-input"
            @confirm="submitCheckin"
          />
          <button class="btn-submit-code" @click="submitCheckin">立即签到</button>
        </view>
        
        <button class="btn-cancel" @click="showCheckinModal = false">
          取消
        </button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onUnmounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getChapterDetail } from '@/api/chapter'
import { getActiveCheckinSession, checkinByCode } from '@/api/checkin'
import { formatTime } from '@/utils/util'
import CustomNavbar from '@/components/custom-navbar/custom-navbar.vue'
import EmptyView from '@/components/empty-view/empty-view.vue'
import Icon from '@/components/icon/icon.vue'

// 导航栏高度
const navbarTotalHeight = ref(88)

// 章节信息
const chapterId = ref('')
const chapterInfo = ref(null)
const loading = ref(false)

// 签到相关
const showCheckinModal = ref(false)
const checkinCode = ref('')
const activeCheckin = ref({
  hasActiveSession: false,
  canCheckin: false,
  alreadyCheckedIn: false,
  remainingMinutes: 0
})

// 统计数据
const materialsCount = ref(0)
const checkinsCount = ref(0)
const evaluationsCount = ref(0)

// 列表数据
const materialsList = ref([])
const checkinsList = ref([])

// 页面加载
onLoad((options) => {
  console.log('章节详情页参数:', options)
  
  // 计算导航栏高度
  const systemInfo = uni.getSystemInfoSync()
  const statusBarHeight = systemInfo.statusBarHeight || 0
  navbarTotalHeight.value = statusBarHeight + 44
  
  chapterId.value = options.chapterId || options.id
  
  if (chapterId.value) {
    loadChapterDetail()
  }
})

// 监听评价提交事件
uni.$on('evaluationSubmitted', async () => {
  console.log('📝 收到评价提交事件，重新加载章节详情')
  await loadChapterDetail()
})

// 页面卸载时移除监听
onUnmounted(() => {
  uni.$off('evaluationSubmitted')
})

// 加载章节详情
const loadChapterDetail = async () => {
  if (loading.value) return
  
  loading.value = true
  
  try {
    const res = await getChapterDetail(chapterId.value)
    chapterInfo.value = res
    
    // 统计数据
    if (res._count) {
      materialsCount.value = res._count.materials || 0
      checkinsCount.value = res._count.checkinSessions || 0
      evaluationsCount.value = res._count.evaluations || 0
    }
    
    // 课件列表（如果有）
    if (res.materials) {
      materialsList.value = res.materials
    }
    
    // 签到记录（如果有）
    if (res.checkins) {
      checkinsList.value = res.checkins
    }
    
    // 加载签到状态
    await loadActiveCheckin()
    
  } catch (error) {
    console.error('加载章节详情失败:', error)
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

// 加载活跃签到会话
const loadActiveCheckin = async () => {
  try {
    const data = await getActiveCheckinSession({
      courseId: chapterInfo.value?.courseId,
      chapterId: chapterId.value
    })
    activeCheckin.value = data
  } catch (error) {
    console.error('获取签到会话失败:', error)
  }
}

// 提交签到
const submitCheckin = async () => {
  if (!checkinCode.value || checkinCode.value.length !== 6) {
    uni.showToast({ title: '请输入6位签到码', icon: 'none' })
    return
  }
  
  try {
    uni.showLoading({ title: '签到中...' })
    await checkinByCode({
      courseId: chapterInfo.value?.courseId,
      chapterId: chapterId.value,
      code: checkinCode.value
    })
    
    uni.hideLoading()
    showCheckinModal.value = false
    checkinCode.value = ''
    
    // 更新签到状态
    activeCheckin.value.alreadyCheckedIn = true
    activeCheckin.value.canCheckin = false
    
    // 重新加载章节详情
    await loadChapterDetail()
    
    uni.showToast({ 
      title: '签到成功', 
      icon: 'success',
      duration: 2000
    })
  } catch (error) {
    console.error('签到失败:', error)
    uni.hideLoading()
    uni.showToast({ 
      title: error.msg || error.message || '签到失败', 
      icon: 'none' 
    })
  }
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    DRAFT: '草稿',
    PUBLISHED: '已发布',
    COMPLETED: '已完成'
  }
  return statusMap[status] || '未知'
}

// 获取状态样式
const getStatusClass = (status) => {
  return `status-${status.toLowerCase()}`
}

// 查看课件
const handleViewMaterials = () => {
  // 必须先签到再评价才能查看课件
  if (!chapterInfo.value?.hasCheckedIn) {
    uni.showToast({
      title: '请先完成签到',
      icon: 'none'
    })
    return
  }
  
  if (!chapterInfo.value?.hasEvaluated) {
    uni.showToast({
      title: '请先完成评价后查看课件',
      icon: 'none'
    })
    return
  }
  
  // 跳转到课件详情页面，传递课程ID、章节ID和标题
  uni.navigateTo({
    url: `/pages/materials/list?courseId=${chapterInfo.value?.courseId}&chapterId=${chapterId.value}&chapterTitle=${encodeURIComponent(chapterInfo.value?.title || '')}`
  })
}


// 评价本节
const handleEvaluate = () => {
  // 必须先签到才能评价
  if (!chapterInfo.value?.hasCheckedIn) {
    uni.showToast({
      title: '请先完成签到',
      icon: 'none'
    })
    return
  }
  
  uni.navigateTo({
    url: `/pages/evaluation/create?courseId=${chapterInfo.value?.courseId}&chapterId=${chapterId.value}`
  })
}

// 点击评价卡片
const handleEvaluateCard = () => {
  // 必须先签到才能评价
  if (!chapterInfo.value?.hasCheckedIn) {
    uni.showToast({
      title: '请先完成签到后再评价',
      icon: 'none'
    })
    return
  }
  
  if (chapterInfo.value?.hasEvaluated) {
    // 已评价，查看评价记录
    console.log('📖 查看评价记录')
    uni.navigateTo({
      url: `/pages/evaluation/create?courseId=${chapterInfo.value?.courseId}&chapterId=${chapterId.value}&viewMode=true`
    })
  } else {
    // 未评价，跳转到评价页面
    console.log('📝 创建评价')
    uni.navigateTo({
      url: `/pages/evaluation/create?courseId=${chapterInfo.value?.courseId}&chapterId=${chapterId.value}`
    })
  }
}

// 查看评价记录
const handleViewEvaluations = () => {
  uni.showToast({
    title: '评价记录页面开发中',
    icon: 'none'
  })
}

// 查看签到记录
const handleViewCheckinRecords = () => {
  uni.navigateTo({
    url: '/pages/checkin/records'
  })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 40rpx;
}

.navbar-placeholder {
  // 高度由动态计算控制
}

// 章节信息卡片
.chapter-info-card {
  background: linear-gradient(135deg, #C8161D 0%, #E91E63 100%);
  margin: 24rpx;
  padding: 40rpx 32rpx;
  border-radius: 20rpx;
  box-shadow: 0 8rpx 24rpx rgba(200, 22, 29, 0.3);
  
  .info-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24rpx;
    
    .chapter-number {
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10rpx);
      padding: 8rpx 24rpx;
      border-radius: 30rpx;
      
      .number-text {
        font-size: 24rpx;
        color: #fff;
        font-weight: 500;
      }
    }
    
    .chapter-status {
      padding: 8rpx 20rpx;
      border-radius: 30rpx;
      font-size: 24rpx;
      font-weight: 500;
      
      &.status-draft {
        background: rgba(255, 255, 255, 0.3);
        color: #fff;
      }
      
      &.status-published {
        background: rgba(76, 175, 80, 0.9);
        color: #fff;
      }
      
      &.status-completed {
        background: rgba(255, 152, 0, 0.9);
        color: #fff;
      }
    }
  }
  
  .chapter-title {
    font-size: 40rpx;
    font-weight: 600;
    color: #fff;
    line-height: 1.4;
    margin-bottom: 16rpx;
  }
  
  .chapter-desc {
    font-size: 28rpx;
    color: rgba(255, 255, 255, 0.9);
    line-height: 1.6;
    margin-bottom: 24rpx;
  }
  
  .chapter-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 24rpx;
    
    .meta-item {
      display: flex;
      align-items: center;
      gap: 8rpx;
      font-size: 26rpx;
      color: rgba(255, 255, 255, 0.9);
    }
  }
}

// 功能区域
.function-section {
  margin: 24rpx;
  
  .section-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 20rpx;
  }
  
  .function-grid {
    display: flex;
    gap: 20rpx;
    
    .function-card {
      flex: 1;
      background: #fff;
      border-radius: 16rpx;
      padding: 32rpx 20rpx;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12rpx;
      box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
      transition: all 0.3s;
      position: relative;
      
      &:active {
        transform: translateY(-4rpx);
        box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.12);
      }
      
      &.card-success {
        border: 2rpx solid #52C41A;
      }
      
      &.card-default {
        border: 2rpx solid #f0f0f0;
      }
      
      &.card-locked {
        background: #fafafa;
        opacity: 0.6;
        
        &:active {
          transform: none;
          box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
        }
      }
      
      .card-icon {
        width: 96rpx;
        height: 96rpx;
        border-radius: 50%;
        background: linear-gradient(135deg, #fff5f5 0%, #ffe8e8 100%);
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .card-title {
        font-size: 28rpx;
        color: #666;
      }
      
      .card-count {
        font-size: 32rpx;
        font-weight: 600;
        color: #C8161D;
      }
      
      .card-status {
        font-size: 28rpx;
        font-weight: 600;
        
        &.status-success {
          color: #52C41A;
        }
        
        &.status-default {
          color: #999;
        }
      }
      
      .card-tip {
        font-size: 24rpx;
        color: #999;
        margin-top: 4rpx;
      }
    }
  }
}

// 签到记录
.checkins-section {
  margin: 24rpx;
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  
  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20rpx;
    
    .section-title {
      font-size: 32rpx;
      font-weight: 600;
      color: #333;
    }
    
    .section-more {
      font-size: 26rpx;
      color: #C8161D;
    }
  }
}

.checkin-item {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 24rpx;
  background: #f8f8f8;
  border-radius: 12rpx;
  margin-bottom: 16rpx;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  .checkin-status {
    width: 64rpx;
    height: 64rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    
    &.checked {
      background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
    }
    
    &.missed {
      background: linear-gradient(135deg, #F44336 0%, #EF5350 100%);
    }
  }
  
  .checkin-info {
    flex: 1;
    
    .checkin-title {
      font-size: 28rpx;
      color: #333;
      margin-bottom: 8rpx;
    }
    
    .checkin-time {
      font-size: 24rpx;
      color: #999;
    }
  }
  
  .checkin-badge {
    padding: 6rpx 20rpx;
    border-radius: 20rpx;
    font-size: 24rpx;
    font-weight: 500;
    
    &.success {
      background: #e8f5e9;
      color: #4CAF50;
    }
    
    &.error {
      background: #ffebee;
      color: #F44336;
    }
  }
}

.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80rpx 0;
  
  .loading-text {
    font-size: 26rpx;
    color: #999;
  }
}

// 签到和评价操作栏
.action-section {
  margin: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  
  button {
    width: 100%;
    height: 88rpx;
    border-radius: 16rpx;
    font-size: 32rpx;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12rpx;
    border: none;
    
    &::after {
      border: none;
    }
  }
  
  .btn-checkin {
    background: linear-gradient(135deg, #C8161D 0%, #FF4757 100%);
    color: #fff;
    box-shadow: 0 4rpx 16rpx rgba(200, 22, 29, 0.4);
    animation: pulse 2s infinite;
  }
  
  .btn-checked-in {
    background: #52C41A;
    color: #fff;
  }
  
  .btn-evaluate {
    background: linear-gradient(135deg, #FF9800 0%, #FFB74D 100%);
    color: #fff;
    box-shadow: 0 4rpx 16rpx rgba(255, 152, 0, 0.4);
  }
  
  .btn-evaluated {
    background: #FFD591;
    color: #D48806;
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
}

// 签到弹窗
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.checkin-modal {
  width: 560rpx;
  background: #fff;
  border-radius: 20rpx;
  padding: 40rpx 32rpx;
  
  .modal-title {
    font-size: 36rpx;
    font-weight: 600;
    color: #333;
    text-align: center;
    margin-bottom: 16rpx;
  }
  
  .modal-subtitle {
    font-size: 26rpx;
    color: #999;
    text-align: center;
    margin-bottom: 32rpx;
  }
  
  .code-input-section {
    margin-bottom: 24rpx;
    
    .code-input {
      width: 100%;
      height: 88rpx;
      border: 2rpx solid #e5e5e5;
      border-radius: 12rpx;
      padding: 0 24rpx;
      font-size: 32rpx;
      text-align: center;
      letter-spacing: 8rpx;
      margin-bottom: 20rpx;
    }
    
    .btn-submit-code {
      width: 100%;
      height: 88rpx;
      background: linear-gradient(135deg, #C8161D 0%, #FF4757 100%);
      color: #fff;
      border-radius: 12rpx;
      font-size: 32rpx;
      font-weight: 500;
      border: none;
      
      &::after {
        border: none;
      }
    }
  }
  
  .btn-cancel {
    width: 100%;
    height: 88rpx;
    background: #f5f5f5;
    color: #666;
    border-radius: 12rpx;
    font-size: 28rpx;
    border: none;
    
    &::after {
      border: none;
    }
  }
}
</style>

