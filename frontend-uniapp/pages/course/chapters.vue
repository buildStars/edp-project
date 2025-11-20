<template>
  <view class="page">
    <custom-navbar :title="courseTitle || '课程章节'" :show-back="true" />
    
    <!-- 占位符，避免内容被导航栏遮挡 -->
    <view class="navbar-placeholder" :style="{ height: navbarTotalHeight + 'px' }"></view>
    
    <!-- 课程头部 -->
    <view v-if="courseInfo" class="course-header">
      <view class="course-cover">
        <image 
          :src="courseInfo.coverImage || '/static/images/logo.png'" 
          mode="aspectFill"
          class="cover-image"
        />
        <view class="course-badge">
          <text class="badge-text">{{ chapterList.length }}个章节</text>
        </view>
      </view>
      <view class="course-info">
        <view class="course-title">{{ courseInfo.title }}</view>
        <view class="course-teacher">
          <Icon name="teacher" :size="28" color="#999" />
          <text>{{ courseInfo.teacherName }}</text>
        </view>
      </view>
    </view>
    
    <!-- 章节列表 -->
    <view class="chapter-list">
      <view class="list-header">
        <text class="header-title">课程章节</text>
        <text class="header-count">共{{ chapterList.length }}节</text>
      </view>
      
      <view 
        v-for="(chapter, index) in chapterList" 
        :key="chapter.id"
        class="chapter-item"
        @click="handleChapterClick(chapter)"
      >
        <view class="chapter-index">
          <view class="index-circle">
            <text class="index-number">{{ index + 1 }}</text>
          </view>
          <view v-if="index < chapterList.length - 1" class="index-line"></view>
        </view>
        
        <view class="chapter-card">
          <view class="chapter-header">
            <view class="chapter-title">{{ chapter.title }}</view>
            <view class="chapter-status" :class="getStatusClass(chapter.status)">
              {{ getStatusText(chapter.status) }}
            </view>
          </view>
          
          <view v-if="chapter.description" class="chapter-desc">
            {{ chapter.description }}
          </view>
          
          <view class="chapter-footer">
            <view class="chapter-info">
              <view class="info-item" v-if="chapter.duration">
                <Icon name="time" :size="28" color="#999" />
                <text>{{ chapter.duration }}分钟</text>
              </view>
              <view class="info-item" v-if="chapter.location">
                <Icon name="location" :size="28" color="#999" />
                <text>{{ chapter.location }}</text>
              </view>
            </view>
            
            <view class="chapter-actions">
              <view class="action-btn">
                <Icon name="arrow-right" :size="32" color="#C8161D" />
              </view>
            </view>
          </view>
          
          <!-- 章节状态 -->
          <view class="chapter-status-bar">
            <view class="status-item">
              <Icon name="course" :size="28" color="#999" />
              <text class="status-text">{{ chapter._count?.materials || 0 }}份课件</text>
            </view>
            <view class="status-divider"></view>
            <view class="status-item" :class="chapter.hasCheckedIn ? 'status-success' : 'status-default'">
              <Icon :name="chapter.hasCheckedIn ? 'check' : 'close'" :size="28" :color="chapter.hasCheckedIn ? '#52C41A' : '#999'" />
              <text class="status-text">{{ chapter.hasCheckedIn ? '已签到' : '未签到' }}</text>
            </view>
            <view class="status-divider"></view>
            <view class="status-item" :class="chapter.hasEvaluated ? 'status-success' : 'status-default'">
              <Icon :name="chapter.hasEvaluated ? 'star' : 'star-o'" :size="28" :color="chapter.hasEvaluated ? '#FF9800' : '#999'" />
              <text class="status-text">{{ chapter.hasEvaluated ? '已评价' : '未评价' }}</text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 空状态 -->
      <empty-view 
        v-if="!loading && chapterList.length === 0"
        text="该课程暂无章节"
      />
      
      <!-- 加载状态 -->
      <view v-if="loading" class="loading-container">
        <text class="loading-text">加载中...</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getChapters } from '@/api/chapter'
import { getCourseDetail } from '@/api/course'
import { formatTime } from '@/utils/util'
import CustomNavbar from '@/components/custom-navbar/custom-navbar.vue'
import EmptyView from '@/components/empty-view/empty-view.vue'
import Icon from '@/components/icon/icon.vue'

// 导航栏高度
const navbarTotalHeight = ref(88) // 默认高度

// 课程信息
const courseId = ref('')
const courseTitle = ref('')
const courseInfo = ref(null)

// 章节列表
const chapterList = ref([])
const loading = ref(false)

// 页面加载
onLoad((options) => {
  console.log('章节页面参数:', options)
  
  // 计算导航栏总高度
  const systemInfo = uni.getSystemInfoSync()
  const statusBarHeight = systemInfo.statusBarHeight || 0
  navbarTotalHeight.value = statusBarHeight + 44 // 状态栏高度 + 导航栏内容高度
  
  courseId.value = options.courseId
  // 解码标题，避免乱码
  if (options.courseTitle) {
    try {
      courseTitle.value = decodeURIComponent(options.courseTitle)
    } catch (e) {
      courseTitle.value = options.courseTitle
    }
  } else {
    courseTitle.value = '课程章节'
  }
  
  if (courseId.value) {
    loadCourseInfo()
    loadChapterList()
  }
})

// 加载课程信息
const loadCourseInfo = async () => {
  try {
    const res = await getCourseDetail(courseId.value)
    courseInfo.value = res
  } catch (error) {
    console.error('加载课程信息失败:', error)
  }
}

// 加载章节列表
const loadChapterList = async () => {
  if (loading.value) return
  
  loading.value = true
  
  try {
    const res = await getChapters({
      courseId: courseId.value,
      status: 'PUBLISHED' // 只显示已发布的章节
    })
    
    chapterList.value = res.items || []
  } catch (error) {
    console.error('加载章节列表失败:', error)
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
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

// 获取状态样式类
const getStatusClass = (status) => {
  return `status-${status.toLowerCase()}`
}

// 点击章节
const handleChapterClick = (chapter) => {
  uni.navigateTo({
    url: `/pages/course/chapter-detail?chapterId=${chapter.id}`
  })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8f8f8 0%, #ffffff 100%);
  padding-bottom: 40rpx;
}

// 导航栏占位符
.navbar-placeholder {
  // 高度由动态计算的 navbarTotalHeight 控制
}

// 课程头部
.course-header {
  background: #fff;
 
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 20rpx rgba(200, 22, 29, 0.08);
  
  .course-cover {
    position: relative;
    height: 320rpx;
    overflow: hidden;
    
    .cover-image {
      width: 100%;
      height: 100%;
    }
    
    .course-badge {
      position: absolute;
      top: 24rpx;
      right: 24rpx;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(10rpx);
      padding: 8rpx 20rpx;
      border-radius: 30rpx;
      
      .badge-text {
        font-size: 24rpx;
        color: #fff;
        font-weight: 500;
      }
    }
  }
  
  .course-info {
    padding: 32rpx;
    
    .course-title {
      font-size: 36rpx;
      font-weight: 600;
      color: #333;
      line-height: 1.4;
      margin-bottom: 16rpx;
    }
    
    .course-teacher {
      display: flex;
      align-items: center;
      gap: 8rpx;
      font-size: 26rpx;
      color: #999;
    }
  }
}

// 章节列表
.chapter-list {
  padding: 0 24rpx;
  
  .list-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24rpx 8rpx 16rpx;
    
    .header-title {
      font-size: 32rpx;
      font-weight: 600;
      color: #333;
    }
    
    .header-count {
      font-size: 26rpx;
      color: #999;
    }
  }
}

.chapter-item {
  display: flex;
  gap: 24rpx;
  margin-bottom: 32rpx;
  
  // 左侧序号
  .chapter-index {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 8rpx;
    
    .index-circle {
      width: 56rpx;
      height: 56rpx;
      border-radius: 50%;
      background: linear-gradient(135deg, #C8161D 0%, #E91E63 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 4rpx 12rpx rgba(200, 22, 29, 0.3);
      
      .index-number {
        font-size: 28rpx;
        font-weight: 600;
        color: #fff;
      }
    }
    
    .index-line {
      width: 2rpx;
      flex: 1;
      min-height: 40rpx;
      background: linear-gradient(180deg, #C8161D 0%, transparent 100%);
      margin-top: 12rpx;
    }
  }
  
  // 右侧卡片
  .chapter-card {
    flex: 1;
    background: #fff;
    border-radius: 20rpx;
    padding: 28rpx;
    box-shadow: 0 2rpx 16rpx rgba(0, 0, 0, 0.06);
    transition: all 0.3s;
    
    &:active {
      transform: translateY(-4rpx);
      box-shadow: 0 8rpx 24rpx rgba(200, 22, 29, 0.15);
    }
    
    .chapter-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 16rpx;
      gap: 16rpx;
      
      .chapter-title {
        flex: 1;
        font-size: 32rpx;
        font-weight: 600;
        color: #333;
        line-height: 1.4;
      }
      
      .chapter-status {
        padding: 6rpx 16rpx;
        border-radius: 20rpx;
        font-size: 22rpx;
        white-space: nowrap;
        font-weight: 500;
        
        &.status-draft {
          background: #f5f5f5;
          color: #999;
        }
        
        &.status-published {
          background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
          color: #2e7d32;
        }
        
        &.status-completed {
          background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
          color: #e65100;
        }
      }
    }
    
    .chapter-desc {
      font-size: 26rpx;
      color: #666;
      line-height: 1.6;
      margin-bottom: 20rpx;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
    
    .chapter-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20rpx;
      
      .chapter-info {
        display: flex;
        flex-wrap: wrap;
        gap: 20rpx;
        flex: 1;
        
        .info-item {
          display: flex;
          align-items: center;
          gap: 8rpx;
          font-size: 24rpx;
          color: #999;
        }
      }
      
      .chapter-actions {
        .action-btn {
          width: 56rpx;
          height: 56rpx;
          border-radius: 50%;
          background: linear-gradient(135deg, #fff5f5 0%, #ffe8e8 100%);
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }
    }
    
    .chapter-status-bar {
      display: flex;
      align-items: center;
      padding: 20rpx 0 0;
      border-top: 2rpx solid #f5f5f5;
      gap: 16rpx;
      
      .status-item {
        display: flex;
        align-items: center;
        gap: 8rpx;
        
        .status-text {
          font-size: 24rpx;
          color: #666;
        }
        
        &.status-success {
          .status-text {
            color: #52C41A;
            font-weight: 500;
          }
        }
        
        &.status-default {
          .status-text {
            color: #999;
          }
        }
      }
      
      .status-divider {
        width: 2rpx;
        height: 28rpx;
        background: #e5e5e5;
      }
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
</style>

