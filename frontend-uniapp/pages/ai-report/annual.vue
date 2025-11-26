<template>
  <view class="annual-report">
    <custom-navbar title="我的年度报告" :show-back="true" />
    
    <!-- 顶部年份显示 -->
    <view class="year-display" :style="{ marginTop: navbarHeight + 'px' }">
      <view class="current-year">{{ currentYear }} 年度报告</view>
    </view>

    <!-- 加载状态 -->
    <view v-if="loading" class="loading-container">
      <uni-load-more status="loading" />
    </view>

    <!-- 未生成报告 -->
    <view v-else-if="!reportData && !loading" class="empty-state">
      <view class="empty-icon">📊</view>
      <view class="empty-text">{{ currentYear }} 年度报告尚未生成</view>
      <button class="generate-btn" @click="handleGenerate" :loading="generating">
        {{ generating ? '正在生成...' : '立即生成' }}
      </button>
      <view class="empty-tip">AI 将分析您的学习数据，生成个性化报告</view>
    </view>

    <!-- 报告内容 -->
    <view v-else-if="reportData" class="report-content">
      <!-- 封面 -->
      <view class="report-cover">
        <view class="cover-bg"></view>
        <view class="cover-content">
          <view class="year-title">{{ currentYear }}</view>
          <view class="report-title">年度学习报告</view>
          <view class="generated-time">生成于 {{ formatDate(reportData.generatedAt) }}</view>
        </view>
      </view>

      <!-- 学习统计 -->
      <view class="stats-section">
        <view class="section-title">
          <view class="title-icon">📈</view>
          <text>学习统计</text>
        </view>
        <view class="stats-grid">
          <view class="stat-item">
            <view class="stat-value">{{ reportData.totalCredits }}</view>
            <view class="stat-label">总学分</view>
          </view>
          <view class="stat-item">
            <view class="stat-value">{{ reportData.totalCourses }}</view>
            <view class="stat-label">报名课程</view>
          </view>
          <view class="stat-item">
            <view class="stat-value">{{ reportData.totalHours }}</view>
            <view class="stat-label">学习时长(小时)</view>
          </view>
        </view>
      </view>

      <!-- 能力雷达图 -->
      <view class="radar-section">
        <view class="section-title">
          <view class="title-icon">🎯</view>
          <text>能力分析</text>
        </view>
        <view class="radar-container">
          <canvas 
            canvas-id="radarCanvas" 
            id="radarCanvas"
            class="radar-canvas"
            @touchstart="handleRadarTouch"
          />
        </view>
        <view class="radar-legend">
          <view class="legend-item" v-for="(item, index) in radarIndicators" :key="index">
            <view class="legend-dot" :style="{ backgroundColor: radarColor }"></view>
            <text>{{ item.name }}</text>
          </view>
        </view>
      </view>

      <!-- 学习总结 -->
      <view class="summary-section">
        <view class="section-title">
          <view class="title-icon">💡</view>
          <text>学习总结</text>
        </view>
        <view class="content-card">
          <text class="content-text">{{ reportData.summary }}</text>
        </view>
      </view>

      <!-- 主要成就 -->
      <view class="achievements-section">
        <view class="section-title">
          <view class="title-icon">🏆</view>
          <text>主要成就</text>
        </view>
        <view class="content-card">
          <view class="achievement-list">
            <view 
              class="achievement-item" 
              v-for="(item, index) in achievementsList" 
              :key="index"
            >
              <view class="achievement-bullet">{{ index + 1 }}</view>
              <text class="achievement-text">{{ item }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 知识点 -->
      <view class="knowledge-section">
        <view class="section-title">
          <view class="title-icon">📚</view>
          <text>学习知识点</text>
        </view>
        <view class="knowledge-tags">
          <view 
            class="knowledge-tag" 
            v-for="(item, index) in knowledgeList" 
            :key="index"
          >
            {{ item }}
          </view>
        </view>
      </view>

      <!-- 推荐建议 -->
      <view class="recommendations-section">
        <view class="section-title">
          <view class="title-icon">🎓</view>
          <text>学习建议</text>
        </view>
        <view class="content-card">
          <view class="recommendation-list">
            <view 
              class="recommendation-item" 
              v-for="(item, index) in recommendationsList" 
              :key="index"
            >
              <view class="recommendation-icon">💪</view>
              <text class="recommendation-text">{{ item }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 底部操作 -->
      <view class="actions-section">
        <button class="action-btn primary" @click="handleShare">
          <text class="btn-icon">📤</text>
          <text>分享报告</text>
        </button>
        <button class="action-btn" @click="handleRegenerate" :loading="generating">
          <text class="btn-icon">🔄</text>
          <text>{{ generating ? '生成中...' : '重新生成' }}</text>
        </button>
      </view>

      <!-- 底部安全区 -->
      <view class="safe-area-bottom"></view>
    </view>
  </view>
</template>

<script>
import CustomNavbar from '@/components/custom-navbar/custom-navbar.vue'
import { generateAiReport, getAiReport } from '@/api/ai-report'

export default {
  components: {
    CustomNavbar
  },
  data() {
    return {
      navbarHeight: 44,
      currentYear: new Date().getFullYear(),
      loading: false,
      generating: false,
      reportData: null,
      radarCanvas: null,
      radarColor: '#5470c6',
      radarIndicators: [],
      radarValues: []
    }
  },
  computed: {
    achievementsList() {
      if (!this.reportData?.achievements) return []
      return this.reportData.achievements.split('\n').filter(item => item.trim())
    },
    knowledgeList() {
      if (!this.reportData?.knowledgePoints) return []
      return this.reportData.knowledgePoints.split('\n').filter(item => item.trim()).map(item => item.replace(/^[•\-]\s*/, ''))
    },
    recommendationsList() {
      if (!this.reportData?.recommendations) return []
      return this.reportData.recommendations.split('\n').filter(item => item.trim())
    }
  },
  onLoad(options) {
    // 只使用当前年份，不接受其他年份参数
    this.currentYear = new Date().getFullYear()
    
    // 如果有 action=generate 参数，自动触发生成
    if (options.action === 'generate') {
      this.handleGenerate()
    } else {
      this.loadReport()
    }
  },
  methods: {
    async loadReport() {
      this.loading = true
      try {
        const data = await getAiReport(this.currentYear)
        this.reportData = data
        
        if (data && data.radarData) {
          this.$nextTick(() => {
            this.parseRadarData(data.radarData)
            this.drawRadarChart()
          })
        }
      } catch (error) {
        console.error('加载报告失败:', error)
        this.reportData = null
      } finally {
        this.loading = false
      }
    },
    
    async handleGenerate() {
      this.generating = true
      try {
        uni.showLoading({ title: 'AI 分析中...' })
        
        const data = await generateAiReport(this.currentYear, false)
        this.reportData = data
        
        uni.showToast({
          title: '报告生成成功',
          icon: 'success'
        })
        
        if (data && data.radarData) {
          this.$nextTick(() => {
            this.parseRadarData(data.radarData)
            this.drawRadarChart()
          })
        }
      } catch (error) {
        console.error('生成报告失败:', error)
        uni.showToast({
          title: error.data?.message || '生成失败',
          icon: 'none'
        })
      } finally {
        this.generating = false
        uni.hideLoading()
      }
    },
    
    async handleRegenerate() {
      const res = await uni.showModal({
        title: '确认重新生成',
        content: '将使用最新数据重新生成报告，是否继续？'
      })
      
      if (res.confirm) {
        this.generating = true
        try {
          uni.showLoading({ title: 'AI 分析中...' })
          
          const data = await generateAiReport(this.currentYear, true)
          this.reportData = data
          
          uni.showToast({
            title: '报告已更新',
            icon: 'success'
          })
          
          if (data && data.radarData) {
            this.$nextTick(() => {
              this.parseRadarData(data.radarData)
              this.drawRadarChart()
            })
          }
        } catch (error) {
          console.error('重新生成失败:', error)
          uni.showToast({
            title: error.data?.message || '生成失败',
            icon: 'none'
          })
        } finally {
          this.generating = false
          uni.hideLoading()
        }
      }
    },
    
    parseRadarData(radarDataStr) {
      try {
        const radarData = JSON.parse(radarDataStr)
        this.radarIndicators = radarData.indicators || []
        this.radarValues = radarData.values || []
        
        // 调试日志
        console.log('📊 雷达图数据解析成功:')
        console.log('  indicators:', this.radarIndicators)
        console.log('  values:', this.radarValues)
      } catch (error) {
        console.error('解析雷达图数据失败:', error)
        this.radarIndicators = []
        this.radarValues = []
      }
    },
    
    drawRadarChart() {
      console.log('🎨 开始绘制雷达图...')
      console.log('  indicators count:', this.radarIndicators.length)
      console.log('  values count:', this.radarValues.length)
      
      if (!this.radarIndicators.length || !this.radarValues.length) {
        console.warn('⚠️  雷达图数据为空，跳过绘制')
        return
      }
      
      // #ifdef H5
      // H5 环境：直接获取 Canvas 元素
      this.$nextTick(() => {
        const canvas = document.getElementById('radarCanvas')
        if (!canvas) {
          console.error('❌ H5: 无法获取 Canvas 元素')
          return
        }
        
        const ctx = canvas.getContext('2d')
        const rect = canvas.getBoundingClientRect()
        const width = rect.width
        const height = rect.height
        
        // 设置 Canvas 实际大小（考虑 DPR）
        const dpr = window.devicePixelRatio || 1
        canvas.width = width * dpr
        canvas.height = height * dpr
        ctx.scale(dpr, dpr)
        
        console.log('✅ H5 Canvas 元素获取成功:', width, 'x', height)
        
        const centerX = width / 2
        const centerY = height / 2
        const radius = Math.min(width, height) / 2 - 40
        
        // 清空画布
        ctx.clearRect(0, 0, width, height)
        
        // 绘制雷达图
        this.drawRadarGrid(ctx, centerX, centerY, radius)
        this.drawRadarData(ctx, centerX, centerY, radius)
        this.drawRadarLabels(ctx, centerX, centerY, radius)
      })
      // #endif
      
      // #ifdef MP-WEIXIN
      // 小程序环境：使用旧版 Canvas API (更稳定)
      this.$nextTick(() => {
        const query = uni.createSelectorQuery().in(this)
        query.select('.radar-canvas').boundingClientRect().exec((res) => {
          if (!res || !res[0]) {
            console.error('❌ 小程序: 无法获取 Canvas 尺寸')
            return
          }
          
          const width = res[0].width
          const height = res[0].height
          console.log('✅ 小程序 Canvas 尺寸:', width, 'x', height)
          
          // 使用 canvas-id 获取上下文（旧版 API）
          const ctx = uni.createCanvasContext('radarCanvas', this)
          
          const centerX = width / 2
          const centerY = height / 2
          const radius = Math.min(width, height) / 2 - 40
          
          // 清空画布
          ctx.clearRect(0, 0, width, height)
          
          // 绘制背景网格
          this.drawRadarGrid(ctx, centerX, centerY, radius)
          
          // 绘制数据区域
          this.drawRadarData(ctx, centerX, centerY, radius)
          
          // 绘制标签
          this.drawRadarLabels(ctx, centerX, centerY, radius)
          
          // 小程序需要调用 draw() 来渲染
          ctx.draw()
        })
      })
      // #endif
    },
    
    drawRadarGrid(ctx, centerX, centerY, radius) {
      const sides = this.radarIndicators.length
      const angle = (2 * Math.PI) / sides
      
      // 绘制同心圆
      ctx.strokeStyle = '#e0e6f1'
      ctx.lineWidth = 1
      for (let level = 1; level <= 5; level++) {
        const r = (radius / 5) * level
        ctx.beginPath()
        for (let i = 0; i <= sides; i++) {
          const x = centerX + r * Math.cos(angle * i - Math.PI / 2)
          const y = centerY + r * Math.sin(angle * i - Math.PI / 2)
          if (i === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        }
        ctx.closePath()
        ctx.stroke()
      }
      
      // 绘制轴线
      for (let i = 0; i < sides; i++) {
        ctx.beginPath()
        ctx.moveTo(centerX, centerY)
        const x = centerX + radius * Math.cos(angle * i - Math.PI / 2)
        const y = centerY + radius * Math.sin(angle * i - Math.PI / 2)
        ctx.lineTo(x, y)
        ctx.stroke()
      }
    },
    
    drawRadarData(ctx, centerX, centerY, radius) {
      const sides = this.radarIndicators.length
      const angle = (2 * Math.PI) / sides
      
      ctx.beginPath()
      for (let i = 0; i < sides; i++) {
        const value = this.radarValues[i] || 0
        const max = this.radarIndicators[i]?.max || 100
        const r = (value / max) * radius
        const x = centerX + r * Math.cos(angle * i - Math.PI / 2)
        const y = centerY + r * Math.sin(angle * i - Math.PI / 2)
        
        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }
      ctx.closePath()
      
      // 填充区域
      ctx.fillStyle = this.radarColor + '40'
      ctx.fill()
      
      // 描边
      ctx.strokeStyle = this.radarColor
      ctx.lineWidth = 2
      ctx.stroke()
      
      // 绘制数据点
      ctx.fillStyle = this.radarColor
      for (let i = 0; i < sides; i++) {
        const value = this.radarValues[i] || 0
        const max = this.radarIndicators[i]?.max || 100
        const r = (value / max) * radius
        const x = centerX + r * Math.cos(angle * i - Math.PI / 2)
        const y = centerY + r * Math.sin(angle * i - Math.PI / 2)
        
        ctx.beginPath()
        ctx.arc(x, y, 4, 0, 2 * Math.PI)
        ctx.fill()
      }
    },
    
    drawRadarLabels(ctx, centerX, centerY, radius) {
      const sides = this.radarIndicators.length
      const angle = (2 * Math.PI) / sides
      const labelRadius = radius + 20
      
      ctx.fillStyle = '#333'
      ctx.font = '12px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      
      for (let i = 0; i < sides; i++) {
        const x = centerX + labelRadius * Math.cos(angle * i - Math.PI / 2)
        const y = centerY + labelRadius * Math.sin(angle * i - Math.PI / 2)
        const label = this.radarIndicators[i]?.name || ''
        
        ctx.fillText(label, x, y)
      }
    },
    
    handleRadarTouch() {
      // 可以添加雷达图交互效果
    },
    
    handleShare() {
      uni.showShareMenu({
        withShareTicket: true,
        success: () => {
          console.log('分享菜单打开成功')
        }
      })
    },
    
    formatDate(dateStr) {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }
  }
}
</script>

<style scoped lang="scss">
.annual-report {
  min-height: 100vh;
  background: linear-gradient(180deg, #f5f7fa 0%, #ffffff 100%);
  padding-bottom: env(safe-area-inset-bottom);
}

.year-display {
  display: flex;
  justify-content: center;
  padding: 24rpx 32rpx;
  background: #fff;
  
  .current-year {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
  }
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 200rpx 0;
  text-align: center;
  
  .loading-spinner {
    width: 60rpx;
    height: 60rpx;
    border: 6rpx solid #f3f3f3;
    border-top: 6rpx solid #C8161D;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  .loading-text {
    margin-top: 32rpx;
    font-size: 28rpx;
    color: #666;
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 200rpx 64rpx;
  
  .empty-icon {
    font-size: 120rpx;
    margin-bottom: 32rpx;
  }
  
  .empty-text {
    font-size: 32rpx;
    color: #333;
    margin-bottom: 48rpx;
  }
  
  .generate-btn {
    width: 400rpx;
    height: 88rpx;
    line-height: 88rpx;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    border-radius: 44rpx;
    font-size: 32rpx;
    border: none;
    margin: 0 auto 24rpx;
  }
  
  .empty-tip {
    font-size: 24rpx;
    color: #999;
  }
}

.report-content {
  padding-bottom: 40rpx;
}

.report-cover {
  position: relative;
  height: 500rpx;
  margin: 32rpx 32rpx 40rpx;
  border-radius: 24rpx;
  overflow: hidden;
  
  .cover-bg {
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }
  
  .cover-content {
    position: relative;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: #fff;
    
    .year-title {
      font-size: 120rpx;
      font-weight: 700;
      letter-spacing: 8rpx;
    }
    
    .report-title {
      font-size: 40rpx;
      margin-top: 16rpx;
      letter-spacing: 4rpx;
    }
    
    .generated-time {
      font-size: 24rpx;
      opacity: 0.8;
      margin-top: 32rpx;
    }
  }
}

.stats-section,
.radar-section,
.summary-section,
.achievements-section,
.knowledge-section,
.recommendations-section {
  margin: 0 32rpx 40rpx;
}

.section-title {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  
  .title-icon {
    font-size: 40rpx;
    margin-right: 16rpx;
  }
}

.stats-grid {
  display: flex;
  background: #fff;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
  
  .stat-item {
    flex: 1;
    padding: 48rpx 24rpx;
    text-align: center;
    
    &:not(:last-child) {
      border-right: 2rpx solid #f5f7fa;
    }
    
    .stat-value {
      font-size: 56rpx;
      font-weight: 700;
      color: #667eea;
      margin-bottom: 12rpx;
    }
    
    .stat-label {
      font-size: 24rpx;
      color: #999;
    }
  }
}

.radar-container {
  background: #fff;
  border-radius: 24rpx;
  padding: 48rpx 32rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
  
  .radar-canvas {
    width: 100%;
    height: 500rpx;
  }
}

.radar-legend {
  display: flex;
  flex-wrap: wrap;
  margin-top: 24rpx;
  padding: 24rpx 32rpx;
  background: #fff;
  border-radius: 24rpx;
  
  .legend-item {
    display: flex;
    align-items: center;
    width: 50%;
    margin-bottom: 16rpx;
    font-size: 24rpx;
    color: #666;
    
    .legend-dot {
      width: 16rpx;
      height: 16rpx;
      border-radius: 50%;
      margin-right: 12rpx;
    }
  }
}

.content-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 40rpx 32rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
  
  .content-text {
    font-size: 28rpx;
    line-height: 48rpx;
    color: #666;
  }
}

.achievement-list,
.recommendation-list {
  .achievement-item,
  .recommendation-item {
    display: flex;
    margin-bottom: 24rpx;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  .achievement-bullet {
    flex-shrink: 0;
    width: 44rpx;
    height: 44rpx;
    line-height: 44rpx;
    text-align: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    border-radius: 50%;
    font-size: 24rpx;
    font-weight: 600;
    margin-right: 16rpx;
  }
  
  .achievement-text,
  .recommendation-text {
    flex: 1;
    font-size: 28rpx;
    line-height: 44rpx;
    color: #666;
  }
  
  .recommendation-icon {
    flex-shrink: 0;
    font-size: 32rpx;
    margin-right: 16rpx;
  }
}

.knowledge-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  
  .knowledge-tag {
    padding: 16rpx 32rpx;
    background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
    border: 2rpx solid #667eea30;
    border-radius: 40rpx;
    font-size: 26rpx;
    color: #667eea;
  }
}

.actions-section {
  display: flex;
  gap: 24rpx;
  padding: 40rpx 32rpx 0;
  
  .action-btn {
    flex: 1;
    height: 88rpx;
    line-height: 88rpx;
    border-radius: 44rpx;
    font-size: 28rpx;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &.primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;
    }
    
    &:not(.primary) {
      background: #f5f7fa;
      color: #333;
    }
    
    .btn-icon {
      margin-right: 8rpx;
      font-size: 32rpx;
    }
  }
}

.safe-area-bottom {
  height: env(safe-area-inset-bottom);
}
</style>






