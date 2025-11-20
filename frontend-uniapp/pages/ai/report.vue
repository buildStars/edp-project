<template>
  <view class="page">
    <!-- 报告头部 -->
    <view class="report-header">
      <view class="year-text">{{ currentYear }}年度</view>
      <view class="title-text">我的学习报告</view>
      <image src="/static/images/report-bg.png" class="header-bg" mode="aspectFill" />
    </view>
    
    <!-- 学习统计 -->
    <view class="section stats-section">
      <view class="section-title">
        <image src="/static/images/stats-icon.png" class="title-icon" />
        <text>学习统计</text>
      </view>
      
      <view class="stats-grid">
        <view class="stat-item">
          <view class="stat-value">{{ reportData.totalCredits || 0 }}</view>
          <view class="stat-label">已学学分</view>
        </view>
        <view class="stat-item">
          <view class="stat-value">{{ reportData.totalCourses || 0 }}</view>
          <view class="stat-label">学习课程</view>
        </view>
        <view class="stat-item">
          <view class="stat-value">{{ reportData.totalHours || 0 }}</view>
          <view class="stat-label">学习时长（小时）</view>
        </view>
        <view class="stat-item">
          <view class="stat-value">{{ reportData.totalDays || 0 }}</view>
          <view class="stat-label">学习天数</view>
        </view>
      </view>
    </view>
    
    <!-- 课程分类分布 -->
    <view class="section chart-section">
      <view class="section-title">
        <image src="/static/images/chart-icon.png" class="title-icon" />
        <text>课程分类</text>
      </view>
      
      <view class="category-list">
        <view 
          v-for="(item, index) in reportData.categoryDistribution" 
          :key="index"
          class="category-item"
        >
          <view class="category-info">
            <view class="category-name">{{ item.name }}</view>
            <view class="category-count">{{ item.count }}门课程</view>
          </view>
          <view class="category-progress">
            <view class="progress-bar" :style="{ width: item.percentage + '%' }"></view>
          </view>
          <view class="category-percentage">{{ item.percentage }}%</view>
        </view>
      </view>
    </view>
    
    <!-- 能力雷达图 -->
    <view class="section radar-section">
      <view class="section-title">
        <image src="/static/images/radar-icon.png" class="title-icon" />
        <text>能力雷达</text>
      </view>
      
      <view class="radar-chart">
        <canvas 
          canvas-id="radarCanvas" 
          id="radarCanvas"
          class="radar-canvas"
        ></canvas>
      </view>
      
      <view class="ability-list">
        <view 
          v-for="(item, index) in reportData.abilityData" 
          :key="index"
          class="ability-item"
        >
          <view class="ability-dot" :style="{ backgroundColor: item.color }"></view>
          <text class="ability-name">{{ item.name }}</text>
          <text class="ability-score">{{ item.score }}分</text>
        </view>
      </view>
    </view>
    
    <!-- 知识掌握 -->
    <view class="section knowledge-section">
      <view class="section-title">
        <image src="/static/images/knowledge-icon.png" class="title-icon" />
        <text>知识掌握</text>
      </view>
      
      <view class="knowledge-content">
        <view class="knowledge-text">
          {{ reportData.knowledgeSummary }}
        </view>
        
        <view class="knowledge-tags">
          <view 
            v-for="(tag, index) in reportData.knowledgeTags" 
            :key="index"
            class="tag-item"
          >
            {{ tag }}
          </view>
        </view>
      </view>
    </view>
    
    <!-- 学习建议 -->
    <view class="section advice-section">
      <view class="section-title">
        <image src="/static/images/advice-icon.png" class="title-icon" />
        <text>学习建议</text>
      </view>
      
      <view class="advice-content">
        <view 
          v-for="(item, index) in reportData.adviceList" 
          :key="index"
          class="advice-item"
        >
          <view class="advice-index">{{ index + 1 }}</view>
          <view class="advice-text">{{ item }}</view>
        </view>
      </view>
    </view>
    
    <!-- 分享按钮 -->
    <view class="share-section">
      <button class="share-btn" @click="handleShare">
        <image src="/static/images/share-white.png" class="share-icon" />
        分享我的报告
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
import { getAnnualReport } from '@/api/ai'

// 当前年份
const currentYear = ref(new Date().getFullYear())

// 报告数据
const reportData = ref({
  totalCredits: 0,
  totalCourses: 0,
  totalHours: 0,
  totalDays: 0,
  categoryDistribution: [],
  abilityData: [],
  knowledgeSummary: '',
  knowledgeTags: [],
  adviceList: []
})

// 页面加载
onMounted(() => {
  loadReportData()
})

// 加载报告数据
const loadReportData = async () => {
  uni.showLoading({
    title: '加载中...'
  })
  
  try {
    const data = await getAnnualReport(currentYear.value)
    reportData.value = data
    
    // 绘制雷达图
    setTimeout(() => {
      drawRadarChart()
    }, 500)
  } catch (error) {
    console.error('加载报告失败：', error)
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
    
    // 使用模拟数据
    loadMockData()
  } finally {
    uni.hideLoading()
  }
}

// 加载模拟数据
const loadMockData = () => {
  reportData.value = {
    totalCredits: 12,
    totalCourses: 8,
    totalHours: 96,
    totalDays: 16,
    categoryDistribution: [
      { name: '加速课堂', count: 4, percentage: 50 },
      { name: '大师课堂', count: 2, percentage: 25 },
      { name: '赋能课堂', count: 2, percentage: 25 }
    ],
    abilityData: [
      { name: '战略思维', score: 85, color: '#C8161D' },
      { name: '领导力', score: 78, color: '#FF6B00' },
      { name: '创新能力', score: 90, color: '#FFB800' },
      { name: '财务管理', score: 72, color: '#52C41A' },
      { name: '市场营销', score: 80, color: '#1890FF' }
    ],
    knowledgeSummary: '在本年度的学习中，您系统地学习了企业战略管理、领导力提升、创新思维等核心课程，掌握了现代企业管理的关键知识和技能，为企业发展和个人成长奠定了坚实基础。',
    knowledgeTags: ['战略管理', '领导力', '创新思维', '财务分析', '市场营销', '团队管理', '数字化转型'],
    adviceList: [
      '建议继续加强财务管理方面的学习，提升企业经营决策能力',
      '可以多参与大师课堂，与行业专家深入交流学习',
      '关注数字化转型相关课程，把握时代发展趋势'
    ]
  }
  
  // 绘制雷达图
  setTimeout(() => {
    drawRadarChart()
  }, 500)
}

// 绘制雷达图
const drawRadarChart = () => {
  const ctx = uni.createCanvasContext('radarCanvas')
  const centerX = 300 // 画布中心X
  const centerY = 300 // 画布中心Y
  const radius = 200 // 雷达图半径
  const levels = 5 // 层级数量
  const data = reportData.value.abilityData
  
  if (!data || data.length === 0) return
  
  const angleStep = (Math.PI * 2) / data.length
  
  // 绘制背景网格
  ctx.setStrokeStyle('#E5E5E5')
  ctx.setLineWidth(1)
  
  for (let i = 1; i <= levels; i++) {
    const r = (radius / levels) * i
    ctx.beginPath()
    for (let j = 0; j < data.length; j++) {
      const angle = angleStep * j - Math.PI / 2
      const x = centerX + r * Math.cos(angle)
      const y = centerY + r * Math.sin(angle)
      
      if (j === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }
    ctx.closePath()
    ctx.stroke()
  }
  
  // 绘制坐标轴
  for (let i = 0; i < data.length; i++) {
    const angle = angleStep * i - Math.PI / 2
    const x = centerX + radius * Math.cos(angle)
    const y = centerY + radius * Math.sin(angle)
    
    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.lineTo(x, y)
    ctx.stroke()
  }
  
  // 绘制数据区域
  ctx.setFillStyle('rgba(200, 22, 29, 0.3)')
  ctx.setStrokeStyle('#C8161D')
  ctx.setLineWidth(2)
  ctx.beginPath()
  
  for (let i = 0; i < data.length; i++) {
    const angle = angleStep * i - Math.PI / 2
    const r = (data[i].score / 100) * radius
    const x = centerX + r * Math.cos(angle)
    const y = centerY + r * Math.sin(angle)
    
    if (i === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  }
  
  ctx.closePath()
  ctx.fill()
  ctx.stroke()
  
  // 绘制数据点
  for (let i = 0; i < data.length; i++) {
    const angle = angleStep * i - Math.PI / 2
    const r = (data[i].score / 100) * radius
    const x = centerX + r * Math.cos(angle)
    const y = centerY + r * Math.sin(angle)
    
    ctx.beginPath()
    ctx.arc(x, y, 6, 0, Math.PI * 2)
    ctx.setFillStyle('#C8161D')
    ctx.fill()
  }
  
  ctx.draw()
}

// 分享
const handleShare = () => {
  uni.showShareMenu({
    withShareTicket: true,
    menus: ['shareAppMessage', 'shareTimeline']
  })
}

// 分享给好友
onShareAppMessage(() => {
  return {
    title: `我的${currentYear.value}年度学习报告`,
    path: '/pages/ai/report',
    imageUrl: '/static/images/share-report.png'
  }
})

// 分享到朋友圈
onShareTimeline(() => {
  return {
    title: `我的${currentYear.value}年度学习报告`,
    query: '',
    imageUrl: '/static/images/share-report.png'
  }
})
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: linear-gradient(180deg, #FFF7E6 0%, #f8f8f8 50%);
  padding-bottom: 140rpx;
}

.report-header {
  position: relative;
  height: 400rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  
  .year-text {
    font-size: 32rpx;
    color: #C8161D;
    margin-bottom: 16rpx;
    position: relative;
    z-index: 2;
  }
  
  .title-text {
    font-size: 56rpx;
    font-weight: 500;
    color: #333;
    position: relative;
    z-index: 2;
  }
  
  .header-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    opacity: 0.3;
  }
}

.section {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 32rpx 24rpx;
  margin: 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
  
  .section-title {
    display: flex;
    align-items: center;
    font-size: 32rpx;
    font-weight: 500;
    color: #333;
    margin-bottom: 32rpx;
    
    .title-icon {
      width: 48rpx;
      height: 48rpx;
      margin-right: 12rpx;
    }
  }
}

.stats-section {
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 32rpx;
    
    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 32rpx;
      background: linear-gradient(135deg, #FFF7E6 0%, #FFE9E9 100%);
      border-radius: 12rpx;
      
      .stat-value {
        font-size: 48rpx;
        font-weight: 500;
        color: #C8161D;
        margin-bottom: 12rpx;
      }
      
      .stat-label {
        font-size: 24rpx;
        color: #666;
      }
    }
  }
}

.chart-section {
  .category-list {
    .category-item {
      display: flex;
      align-items: center;
      margin-bottom: 32rpx;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .category-info {
        width: 180rpx;
        margin-right: 16rpx;
        
        .category-name {
          font-size: 28rpx;
          color: #333;
          margin-bottom: 8rpx;
        }
        
        .category-count {
          font-size: 24rpx;
          color: #999;
        }
      }
      
      .category-progress {
        flex: 1;
        height: 16rpx;
        background-color: #f0f0f0;
        border-radius: 8rpx;
        overflow: hidden;
        margin-right: 16rpx;
        
        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #C8161D 0%, #FF6B6B 100%);
          border-radius: 8rpx;
          transition: width 0.3s;
        }
      }
      
      .category-percentage {
        width: 80rpx;
        font-size: 26rpx;
        color: #C8161D;
        text-align: right;
      }
    }
  }
}

.radar-section {
  .radar-chart {
    display: flex;
    justify-content: center;
    margin-bottom: 32rpx;
    
    .radar-canvas {
      width: 600rpx;
      height: 600rpx;
    }
  }
  
  .ability-list {
    display: flex;
    flex-wrap: wrap;
    gap: 24rpx;
    
    .ability-item {
      display: flex;
      align-items: center;
      width: calc(50% - 12rpx);
      
      .ability-dot {
        width: 16rpx;
        height: 16rpx;
        border-radius: 50%;
        margin-right: 12rpx;
      }
      
      .ability-name {
        flex: 1;
        font-size: 26rpx;
        color: #666;
      }
      
      .ability-score {
        font-size: 26rpx;
        font-weight: 500;
        color: #C8161D;
      }
    }
  }
}

.knowledge-section {
  .knowledge-content {
    .knowledge-text {
      font-size: 28rpx;
      color: #666;
      line-height: 1.8;
      margin-bottom: 24rpx;
    }
    
    .knowledge-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 16rpx;
      
      .tag-item {
        padding: 12rpx 24rpx;
        background-color: #FFF7E6;
        color: #C8161D;
        font-size: 24rpx;
        border-radius: 40rpx;
      }
    }
  }
}

.advice-section {
  .advice-content {
    .advice-item {
      display: flex;
      padding: 24rpx 0;
      border-bottom: 1rpx solid #f0f0f0;
      
      &:last-child {
        border-bottom: none;
      }
      
      .advice-index {
        width: 48rpx;
        height: 48rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #C8161D;
        color: #fff;
        font-size: 24rpx;
        border-radius: 50%;
        margin-right: 16rpx;
        flex-shrink: 0;
      }
      
      .advice-text {
        flex: 1;
        font-size: 28rpx;
        color: #666;
        line-height: 1.6;
      }
    }
  }
}

.share-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 24rpx;
  background-color: #fff;
  border-top: 1rpx solid #f0f0f0;
  
  .share-btn {
    width: 100%;
    height: 88rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(90deg, #C8161D 0%, #FF6B6B 100%);
    color: #fff;
    font-size: 30rpx;
    border-radius: 44rpx;
    border: none;
    
    .share-icon {
      width: 40rpx;
      height: 40rpx;
      margin-right: 12rpx;
    }
  }
}
</style>

