<template>
  <view class="ai-report-index">
    <custom-navbar title="AI 学习报告" :show-back="true" />
    
    <view class="page-content" :style="{ marginTop: navbarHeight + 'px' }">
      <!-- 功能介绍 -->
      <view class="intro-section">
        <view class="intro-icon">🤖</view>
        <view class="intro-title">AI 智能学习报告</view>
        <view class="intro-desc">基于人工智能技术，深度分析您的学习数据，生成个性化学习报告</view>
      </view>

      <!-- 功能特点 -->
      <view class="features-section">
        <view class="feature-item">
          <view class="feature-icon">📊</view>
          <view class="feature-content">
            <view class="feature-title">数据可视化</view>
            <view class="feature-desc">直观展示学习数据和成长轨迹</view>
          </view>
        </view>
        
        <view class="feature-item">
          <view class="feature-icon">🎯</view>
          <view class="feature-content">
            <view class="feature-title">智能分析</view>
            <view class="feature-desc">AI 深度分析学习情况和知识掌握</view>
          </view>
        </view>
        
        <view class="feature-item">
          <view class="feature-icon">💡</view>
          <view class="feature-content">
            <view class="feature-title">个性建议</view>
            <view class="feature-desc">基于数据提供个性化学习建议</view>
          </view>
        </view>
        
        <view class="feature-item">
          <view class="feature-icon">🏆</view>
          <view class="feature-content">
            <view class="feature-title">成就总结</view>
            <view class="feature-desc">记录学习成就和重要里程碑</view>
          </view>
        </view>
      </view>

      <!-- 当年报告状态 -->
      <view class="report-status-section">
        <view class="section-header">
          <view class="section-title">{{ currentYear }} 年度报告</view>
          <view class="section-tip">查看您今年的学习成果</view>
        </view>

        <!-- 加载状态 -->
        <view v-if="loading" class="loading-container">
          <view class="loading-spinner"></view>
          <text class="loading-text">加载中...</text>
        </view>

        <!-- 已有报告 -->
        <view v-else-if="currentYearReport" class="report-card has-report" @click="goToAnnualReport">
          <view class="report-badge">已生成</view>
          <view class="report-year">{{ currentYear }}</view>
          <view class="report-title">年度学习报告</view>
          <view class="report-stats">
            <view class="stat-item">
              <text class="stat-value">{{ currentYearReport.totalCourses }}</text>
              <text class="stat-label">课程</text>
            </view>
            <view class="stat-item">
              <text class="stat-value">{{ currentYearReport.totalCredits }}</text>
              <text class="stat-label">学分</text>
            </view>
            <view class="stat-item">
              <text class="stat-value">{{ currentYearReport.totalHours }}</text>
              <text class="stat-label">学时</text>
            </view>
          </view>
          <view class="report-time">
            生成于 {{ formatDate(currentYearReport.generatedAt) }}
          </view>
          <view class="view-btn">
            <text>查看详情</text>
            <Icon name="arrow-right" :size="32" color="#1890FF" />
          </view>
        </view>

        <!-- 未生成报告 -->
        <view v-else class="empty-report-card">
          <view class="empty-icon">📊</view>
          <view class="empty-title">{{ currentYear }} 年度报告</view>
          <view class="empty-text">还没有生成今年的学习报告</view>
          <view class="empty-tip">AI 将分析您今年的学习数据，生成个性化报告</view>
          <button class="generate-btn" @click="handleGenerateReport" :loading="generating">
            <text class="btn-icon">✨</text>
            <text>{{ generating ? '生成中...' : '立即生成报告' }}</text>
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getAiReport, generateAiReport } from '@/api/ai-report'
import { useUserStore } from '@/store/user'
import CustomNavbar from '@/components/custom-navbar/custom-navbar.vue'
import Icon from '@/components/icon/icon.vue'

const userStore = useUserStore()
const navbarHeight = ref(44)
const loading = ref(false)
const generating = ref(false)
const currentYear = new Date().getFullYear()
const currentYearReport = ref(null)

// 加载当年报告
const loadCurrentYearReport = async () => {
  loading.value = true
  try {
    const data = await getAiReport(currentYear)
    currentYearReport.value = data
  } catch (error) {
    console.error('加载报告失败：', error)
    currentYearReport.value = null
  } finally {
    loading.value = false
  }
}

// 生成报告
const handleGenerateReport = async () => {
  generating.value = true
  try {
    uni.showLoading({ title: 'AI 分析中，请稍候...' })
    
    const data = await generateAiReport(currentYear, false)
    currentYearReport.value = data
    
    uni.hideLoading()
    uni.showToast({
      title: '报告生成成功',
      icon: 'success',
      duration: 2000
    })
    
    // 延迟跳转到详情页
    setTimeout(() => {
      goToAnnualReport()
    }, 2000)
  } catch (error) {
    uni.hideLoading()
    console.error('生成报告失败:', error)
    uni.showToast({
      title: error.data?.message || '生成失败，请重试',
      icon: 'none',
      duration: 3000
    })
  } finally {
    generating.value = false
  }
}

// 跳转到年度报告详情
const goToAnnualReport = () => {
  uni.navigateTo({
    url: `/pages/ai-report/annual`
  })
}

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

onMounted(() => {
  // 获取导航栏高度
  const systemInfo = uni.getSystemInfoSync()
  const statusBarHeight = systemInfo.statusBarHeight || 0
  navbarHeight.value = statusBarHeight + 44
  
  loadCurrentYearReport()
})

onShow(() => {
  loadCurrentYearReport()
})
</script>

<style lang="scss" scoped>
.ai-report-index {
  min-height: 100vh;
  background: linear-gradient(180deg, #f5f7fa 0%, #ffffff 100%);
}

.page-content {
  padding: 40rpx;
}

// 功能介绍
.intro-section {
  text-align: center;
  padding: 60rpx 40rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 32rpx;
  margin-bottom: 40rpx;
  color: #fff;
  box-shadow: 0 8rpx 32rpx rgba(102, 126, 234, 0.3);

  .intro-icon {
    font-size: 120rpx;
    margin-bottom: 20rpx;
  }

  .intro-title {
    font-size: 48rpx;
    font-weight: bold;
    margin-bottom: 20rpx;
  }

  .intro-desc {
    font-size: 28rpx;
    opacity: 0.9;
    line-height: 1.6;
  }
}

// 功能特点
.features-section {
  margin-bottom: 60rpx;

  .feature-item {
    display: flex;
    align-items: center;
    padding: 30rpx;
    background: #fff;
    border-radius: 24rpx;
    margin-bottom: 24rpx;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);

    .feature-icon {
      font-size: 72rpx;
      margin-right: 32rpx;
    }

    .feature-content {
      flex: 1;

      .feature-title {
        font-size: 32rpx;
        font-weight: bold;
        color: #333;
        margin-bottom: 8rpx;
      }

      .feature-desc {
        font-size: 26rpx;
        color: #666;
      }
    }
  }
}

// 报告状态
.report-status-section {
  margin-bottom: 40rpx;

  .section-header {
    margin-bottom: 32rpx;

    .section-title {
      font-size: 36rpx;
      font-weight: bold;
      color: #333;
      margin-bottom: 8rpx;
    }

    .section-tip {
      font-size: 26rpx;
      color: #999;
    }
  }

  .loading-container {
    padding: 120rpx 0;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;

    .loading-spinner {
      width: 80rpx;
      height: 80rpx;
      border: 6rpx solid #f0f0f0;
      border-top-color: #1890FF;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 24rpx;
    }

    .loading-text {
      font-size: 28rpx;
      color: #999;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  }

  // 已有报告卡片
  .report-card.has-report {
    position: relative;
    background: #fff;
    border-radius: 24rpx;
    padding: 40rpx;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
    transition: all 0.3s;

    &:active {
      transform: scale(0.98);
    }

    .report-badge {
      position: absolute;
      top: 24rpx;
      right: 24rpx;
      padding: 8rpx 24rpx;
      background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
      color: #fff;
      font-size: 24rpx;
      border-radius: 24rpx;
    }

    .report-year {
      font-size: 56rpx;
      font-weight: bold;
      color: #1890FF;
      margin-bottom: 16rpx;
    }

    .report-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
      margin-bottom: 24rpx;
    }

    .report-stats {
      display: flex;
      justify-content: space-around;
      padding: 32rpx 0;
      border-top: 1rpx solid #f0f0f0;
      border-bottom: 1rpx solid #f0f0f0;
      margin-bottom: 24rpx;

      .stat-item {
        display: flex;
        flex-direction: column;
        align-items: center;

        .stat-value {
          font-size: 40rpx;
          font-weight: bold;
          color: #1890FF;
          margin-bottom: 8rpx;
        }

        .stat-label {
          font-size: 24rpx;
          color: #999;
        }
      }
    }

    .report-time {
      font-size: 24rpx;
      color: #999;
      margin-bottom: 16rpx;
    }

    .view-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      color: #1890FF;
      font-size: 28rpx;
      font-weight: bold;

      text {
        margin-right: 8rpx;
      }
    }
  }

  // 未生成报告卡片
  .empty-report-card {
    background: linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%);
    border: 2rpx dashed #d9d9d9;
    border-radius: 24rpx;
    padding: 80rpx 40rpx;
    text-align: center;

    .empty-icon {
      font-size: 120rpx;
      margin-bottom: 24rpx;
    }

    .empty-title {
      font-size: 36rpx;
      font-weight: bold;
      color: #333;
      margin-bottom: 16rpx;
    }

    .empty-text {
      font-size: 28rpx;
      color: #666;
      margin-bottom: 12rpx;
    }

    .empty-tip {
      font-size: 24rpx;
      color: #999;
      margin-bottom: 48rpx;
      line-height: 1.6;
    }

    .generate-btn {
      width: 400rpx;
      height: 96rpx;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;
      border-radius: 48rpx;
      font-size: 32rpx;
      font-weight: bold;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto;
      box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.4);

      .btn-icon {
        margin-right: 12rpx;
        font-size: 36rpx;
      }
    }
  }
}
</style>
