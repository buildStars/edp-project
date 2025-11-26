<template>
  <view class="page">
    <!-- 首页头部 -->
    <view class="page-header" :style="{ height: headerHeight + 'px' }">
      <view class="header-content">
        <view class="header-logo">
          <image :src="systemConfig.appLogo||'/static/images/logo.png'" class="logo-image" mode="aspectFit" />
        </view>
        <view class="header-actions">
          <view class="action-icon" @click="goSearch">
            <Icon name="search" :size="44" color="#333" />
          </view>
          <view class="action-icon message-icon" @click="goMessage">
            <Icon name="message" :size="44" color="#333" />
            <view v-if="unreadCount > 0" class="badge-dot"></view>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 占位，防止内容被头部遮挡 -->
    <view :style="{ height: headerHeight + 'px' }"></view>
    
    <!-- Banner轮播 - 优化版 -->
    <view class="banner-section">
      <swiper 
        class="banner-swiper" 
        :indicator-dots="false" 
        :autoplay="true" 
        :interval="4000" 
        :circular="true"
        :duration="500"
        @change="onBannerChange"
      >
        <swiper-item v-for="(banner, index) in banners" :key="banner.id">
          <view class="banner-item">
            <image :src="banner.image" mode="aspectFill" class="banner-image" @click="handleBannerClick(banner)" />
            <view class="banner-overlay">
              <view class="banner-title">{{ banner.title }}</view>
            </view>
          </view>
        </swiper-item>
      </swiper>
      
      <!-- 自定义指示器 -->
      <view class="custom-indicator">
        <view 
          v-for="(banner, index) in banners" 
          :key="index"
          class="indicator-dot"
          :class="{ active: currentBanner === index }"
        ></view>
      </view>
    </view>
    
    <!-- 快捷入口 - 优化版 -->
    <!-- <view class="quick-entry">
      <view class="entry-grid">
        <view 
          class="entry-item" 
          @click="goPage('/pages/course/index')"
          :style="{ 'animation-delay': '0s' }"
        >
          <view class="entry-icon-wrapper">
            <view class="entry-icon gradient-purple">
              <Icon name="course" :size="48" color="#fff" />
            </view>
            <view class="icon-glow gradient-purple"></view>
          </view>
          <text class="entry-text">课程中心</text>
          <text class="entry-desc">精品课程</text>
        </view>
        
        <view 
          class="entry-item" 
          @click="goPage('/pages/association/index')"
          :style="{ 'animation-delay': '0.1s' }"
        >
          <view class="entry-icon-wrapper">
            <view class="entry-icon gradient-pink">
              <Icon name="association" :size="48" color="#fff" />
            </view>
            <view class="icon-glow gradient-pink"></view>
          </view>
          <text class="entry-text">EDP协会</text>
          <text class="entry-desc">社团活动</text>
        </view>
        
        <view 
          class="entry-item" 
          @click="goAIReport"
          :style="{ 'animation-delay': '0.2s' }"
        >
          <view class="entry-icon-wrapper">
            <view class="entry-icon gradient-blue">
              <Icon name="ai" :size="48" color="#fff" />
            </view>
            <view class="icon-glow gradient-blue"></view>
            <view class="entry-badge">
              <text class="badge-text">HOT</text>
            </view>
          </view>
          <text class="entry-text">AI报告</text>
          <text class="entry-desc">智能分析</text>
        </view>
        
        <view 
          class="entry-item" 
          @click="goMyCourses"
          :style="{ 'animation-delay': '0.3s' }"
        >
          <view class="entry-icon-wrapper">
            <view class="entry-icon gradient-orange">
              <Icon name="star" :size="48" color="#fff" />
            </view>
            <view class="icon-glow gradient-orange"></view>
          </view>
          <text class="entry-text">我的课程</text>
          <text class="entry-desc">学习记录</text>
        </view>
      </view>
    </view>
     -->
    <!-- 最新资讯 - 优化版 -->
    <view class="section news-section">
      <view class="section-header">
        <view class="section-title-wrapper">
          <view class="section-icon">
            <Icon name="news" :size="40" color="#C8161D" />
          </view>
          <view class="section-title-content">
            <text class="section-title">最新资讯</text>
            <text class="section-subtitle">Latest News</text>
          </view>
        </view>
        <view class="section-more" @click="goPage('/pages/news/index')">
          <text>查看全部</text>
          <Icon name="arrow-right" :size="28" color="#C8161D" />
        </view>
      </view>
      
      <view class="news-list">
        <view 
          v-for="(item, index) in latestNews" 
          :key="item.id"
          class="news-card-enhanced"
          @click="goNewsDetail(item)"
        >
          <news-card :news="item" />
        </view>
        
        <empty-view 
          v-if="!newsLoading && latestNews.length === 0"
          text="暂无资讯"
        />
      </view>
    </view>
    
    <!-- 热门课程 - 优化版 -->
    <view class="section course-section">
      <view class="section-header">
        <view class="section-title-wrapper">
          <view class="section-icon">
            <Icon name="course" :size="40" color="#667eea" />
          </view>
          <view class="section-title-content">
            <text class="section-title">热门课程</text>
            <text class="section-subtitle">Popular Courses</text>
          </view>
        </view>
        <view class="section-more" @click="goPage('/pages/course/index')">
          <text>查看全部</text>
          <Icon name="arrow-right" :size="28" color="#667eea" />
        </view>
      </view>
      
      <view class="course-list">
        <view 
          v-for="(item, index) in hotCourses" 
          :key="item.id"
          class="course-card-enhanced"
          @click="goCourseDetail(item)"
        >
          <course-card :course="item" />
        </view>
        
        <empty-view 
          v-if="!courseLoading && hotCourses.length === 0"
          text="暂无课程"
        />
      </view>
    </view>
    
    <!-- 精彩活动 - 优化版 -->
    <view class="section activity-section">
      <view class="section-header">
        <view class="section-title-wrapper">
          <view class="section-icon">
            <Icon name="association" :size="40" color="#f5576c" />
          </view>
          <view class="section-title-content">
            <text class="section-title">精彩活动</text>
            <text class="section-subtitle">Activities</text>
          </view>
        </view>
        <view class="section-more" @click="goPage('/pages/association/index?tab=activity')">
          <text>查看全部</text>
          <Icon name="arrow-right" :size="28" color="#f5576c" />
        </view>
      </view>
      
      <view class="activity-list">
        <view 
          v-for="(item, index) in activities" 
          :key="item.id"
          class="activity-card-enhanced"
          @click="goActivityDetail(item)"
        >
          <view class="activity-image-wrapper">
            <image :src="item.coverImage" mode="aspectFill" class="activity-image" />
            <view class="image-mask"></view>
          </view>
          <view class="activity-content">
            <view class="activity-title">{{ item.title }}</view>
            <view class="activity-meta">
              <view class="meta-item">
                <Icon name="time" :size="28" color="#999" />
                <text class="meta-text">{{ formatTime(item.publishTime) }}</text>
              </view>
              <view class="meta-item">
                <Icon name="like" :size="28" color="#ff6b6b" />
                <text class="meta-text">{{ item.likes || 0 }}</text>
              </view>
            </view>
          </view>
        </view>
        
        <empty-view 
          v-if="!activityLoading && activities.length === 0"
          text="暂无活动"
        />
      </view>
    </view>
    
    <!-- 底部间距 -->
    <view class="page-footer"></view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onPullDownRefresh } from '@dcloudio/uni-app'
import { useUserStore } from '@/store/user'
import NewsCard from '@/components/news-card/news-card.vue'
import CourseCard from '@/components/course-card/course-card.vue'
import EmptyView from '@/components/empty-view/empty-view.vue'
import Icon from '@/components/icon/icon.vue'
import { getNewsList } from '@/api/news'
import { getCourseList } from '@/api/course'
import { getActivityList } from '@/api/association'
import { getUnreadCount } from '@/api/notification'
import { getBannerList, getSystemConfig } from '@/api/system'

// 用户store
const userStore = useUserStore()

// 状态栏高度
const statusBarHeight = ref(0)
// 头部高度
const headerHeight = ref(0)

// 未读消息数量
const unreadCount = ref(0)

// 当前Banner索引
const currentBanner = ref(0)

// 系统配置
const systemConfig = ref({
  appLogo: '/static/images/logo.png'  // 默认logo
})

// Banner数据
const banners = ref([])
const bannerLoading = ref(false)

// 最新资讯
const latestNews = ref([])
const newsLoading = ref(false)

// 热门课程
const hotCourses = ref([])
const courseLoading = ref(false)

// 精彩活动
const activities = ref([])
const activityLoading = ref(false)

// 获取系统信息
onMounted(() => {
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 0
  // 头部高度 = 状态栏高度 + 内容高度（120rpx = 60px）
  // 将 rpx 转换为 px：120rpx / 2 = 60px
  headerHeight.value = statusBarHeight.value + 60
  
  // 加载首页数据
  loadHomeData()
})

// 加载首页数据
const loadHomeData = async () => {
  await Promise.all([
    loadSystemConfig(),
    loadBanners(),
    loadLatestNews(),
    loadHotCourses(),
    loadActivities()
  ])
  
  // 如果已登录，获取未读消息数量
  if (userStore.isLogin) {
    fetchUnreadCount()
  }
}

// 加载系统配置
const loadSystemConfig = async () => {
  try {
    const data = await getSystemConfig()
    if (data && data.appLogo) {
      systemConfig.value.appLogo = data.appLogo
    }
  } catch (error) {
    console.error('加载系统配置失败：', error)
    // 使用默认logo
  }
}

// 加载轮播图
const loadBanners = async () => {
  try {
    bannerLoading.value = true
    const data = await getBannerList()
    // 转换后端数据格式为前端所需格式
    banners.value = data.map(item => ({
      id: item.id,
      image: item.imageUrl,
      title: item.title,
      linkType: item.linkType,
      linkUrl: item.linkUrl,
      targetId: item.targetId
    }))
  } catch (error) {
    console.error('加载轮播图失败：', error)
    // 如果加载失败，使用默认轮播图
    banners.value = [
      {
        id: 'default-1',
        image: 'https://picsum.photos/750/300?random=1',
        title: '北大汇丰EDP',
        linkType: 'NONE'
      }
    ]
  } finally {
    bannerLoading.value = false
  }
}

// 获取未读消息数量
const fetchUnreadCount = async () => {
  try {
    const data = await getUnreadCount()
    unreadCount.value = data.count || 0
  } catch (error) {
    console.error('获取未读消息数量失败：', error)
  }
}

// 加载最新资讯（取前3条）
const loadLatestNews = async () => {
  newsLoading.value = true
  try {
    const data = await getNewsList({ page: 1, pageSize: 3 })
    latestNews.value = data.items || data.data || data.list || []
  } catch (error) {
    console.error('加载资讯失败：', error)
  } finally {
    newsLoading.value = false
  }
}

// 加载热门课程（取前2条）
const loadHotCourses = async () => {
  courseLoading.value = true
  try {
    const data = await getCourseList({ page: 1, pageSize: 2 })
    hotCourses.value = data.items || data.data || data.list || []
  } catch (error) {
    console.error('加载课程失败：', error)
  } finally {
    courseLoading.value = false
  }
}

// 加载精彩活动（取前3条）
const loadActivities = async () => {
  activityLoading.value = true
  try {
    const data = await getActivityList({ page: 1, pageSize: 3 })
    activities.value = data.items || data.data || data.list || []
  } catch (error) {
    console.error('加载活动失败：', error)
  } finally {
    activityLoading.value = false
  }
}

// Banner切换
const onBannerChange = (e) => {
  currentBanner.value = e.detail.current
}

// Banner点击
const handleBannerClick = (banner) => {
  // 根据链接类型进行不同的跳转
  switch (banner.linkType) {
    case 'URL':
      // 外部链接，使用webview打开
      if (banner.linkUrl) {
        uni.navigateTo({
          url: `/pages/webview/index?url=${encodeURIComponent(banner.linkUrl)}`
        })
      }
      break
    case 'COURSE':
      // 跳转到课程详情
      if (banner.targetId) {
        uni.navigateTo({
          url: `/pages/course/detail?id=${banner.targetId}`
        })
      }
      break
    case 'NEWS':
      // 跳转到资讯详情
      if (banner.targetId) {
        uni.navigateTo({
          url: `/pages/news/detail?id=${banner.targetId}`
        })
      }
      break
    case 'ACTIVITY':
      // 跳转到活动详情
      if (banner.targetId) {
        uni.navigateTo({
          url: `/pages/association/activity-detail?id=${banner.targetId}`
        })
      }
      break
    case 'NONE':
    default:
      // 无链接，不做任何操作
      break
  }
}

// 跳转页面
const goPage = (url) => {
  uni.navigateTo({ url })
}

// 跳转AI报告
const goAIReport = () => {
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
  uni.navigateTo({ url: '/pages/ai-report/annual' })
}

// 跳转我的课程
const goMyCourses = () => {
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
  uni.navigateTo({ url: '/pages/mine/my-courses' })
}

// 跳转搜索页
const goSearch = () => {
  uni.navigateTo({ url: '/pages/search/index' })
}

// 跳转消息页
const goMessage = () => {
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
  uni.navigateTo({ url: '/pages/mine/messages' })
}

// 跳转资讯详情
const goNewsDetail = (news) => {
  uni.navigateTo({ url: `/pages/news/detail?id=${news.id}` })
}

// 跳转课程详情
const goCourseDetail = (course) => {
  uni.navigateTo({ url: `/pages/course/detail?id=${course.id}` })
}

// 跳转活动详情
const goActivityDetail = (activity) => {
  uni.navigateTo({ url: `/pages/association/activity-detail?id=${activity.id}` })
}

// 格式化时间
const formatTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const day = 24 * 60 * 60 * 1000
  
  if (diff < day) {
    return '今天'
  } else if (diff < 2 * day) {
    return '昨天'
  } else {
    return `${date.getMonth() + 1}-${date.getDate()}`
  }
}

// 下拉刷新
onPullDownRefresh(async () => {
  await loadHomeData()
  uni.stopPullDownRefresh()
})
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f5f7fa 0%, #ffffff 100%);
  padding-bottom: env(safe-area-inset-bottom);
}

// 首页头部
.page-header {
  position: fixed;
  top: -5px;
  left: 0;
  right: 0;
  background: #fff;
  border-bottom: 1rpx solid #E5E5E5;
  z-index: 999;
  box-shadow  : 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  
  .header-content {
    height: 120rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 32rpx;
    flex: 1;
    .header-logo {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 400rpx;
      .logo-image {
        height: 80rpx;
        transform: scale(2);
        max-width: 200rpx;
       
      }
    }
    
    .header-actions {
      display: flex;
      align-items: center;
      gap: 24rpx;
      
      .action-icon {
        position: relative;
        width: 80rpx;
        height: 80rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        background-color: #F5F7FA;
        transition: all 0.3s ease;
        
        &:active {
          background-color: #E8EAED;
          transform: scale(0.92);
        }
        
        &.message-icon {
          .badge-dot {
            position: absolute;
            top: 16rpx;
            right: 16rpx;
            width: 20rpx;
            height: 20rpx;
            background: linear-gradient(135deg, #FF6B6B 0%, #FF4757 100%);
            border-radius: 50%;
            border: 4rpx solid #fff;
            box-shadow: 0 2rpx 8rpx rgba(255, 71, 87, 0.3);
            animation: pulse 2s infinite;
          }
        }
      }
    }
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

// Banner轮播 - 优化版
.banner-section {
  position: relative;
  margin: 24rpx 24rpx 0;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.08);
  
  .banner-swiper {
    width: 100%;
    height: 360rpx;
    
    .banner-item {
      position: relative;
      width: 100%;
      height: 100%;
      
      .banner-image {
        width: 100%;
        height: 100%;
      }
      
      .banner-overlay {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 48rpx 32rpx 32rpx;
        background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.7) 100%);
        
        .banner-title {
          font-size: 36rpx;
          font-weight: 700;
          color: #fff;
          margin-bottom: 8rpx;
          text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.3);
        }
        
        .banner-subtitle {
          font-size: 24rpx;
          color: rgba(255, 255, 255, 0.9);
          text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.3);
        }
      }
    }
  }
  
  // 自定义指示器
  .custom-indicator {
    position: absolute;
    bottom: 20rpx;
    right: 24rpx;
    display: flex;
    align-items: center;
    gap: 12rpx;
    padding: 8rpx 16rpx;
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10rpx);
    border-radius: 30rpx;
    
    .indicator-dot {
      width: 12rpx;
      height: 12rpx;
      border-radius: 50%;
      background-color: rgba(255, 255, 255, 0.5);
      transition: all 0.3s ease;
      
      &.active {
        width: 32rpx;
        border-radius: 6rpx;
        background-color: #fff;
      }
    }
  }
}

// 快捷入口 - 优化版
.quick-entry {
  margin: 32rpx 24rpx 0;
  padding: 48rpx 32rpx;
  background: #fff;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
  
  .entry-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 32rpx;
  }
  
  .entry-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    animation: fadeInUp 0.6s ease both;
    
    .entry-icon-wrapper {
      position: relative;
      margin-bottom: 16rpx;
      
      .entry-icon {
        width: 104rpx;
        height: 104rpx;
        border-radius: 26rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.12);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        z-index: 2;
        
        &.gradient-purple {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        
        &.gradient-pink {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        }
        
        &.gradient-blue {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        }
        
        &.gradient-orange {
          background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
        }
      }
      
      .icon-glow {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 104rpx;
        height: 104rpx;
        border-radius: 26rpx;
        opacity: 0;
        transition: all 0.3s ease;
        z-index: 1;
        
        &.gradient-purple {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        
        &.gradient-pink {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        }
        
        &.gradient-blue {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        }
        
        &.gradient-orange {
          background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
        }
      }
      
      .entry-badge {
        position: absolute;
        top: -8rpx;
        right: -8rpx;
        z-index: 3;
        padding: 6rpx 14rpx;
        background: linear-gradient(135deg, #FF6B6B 0%, #FF4757 100%);
        border-radius: 24rpx;
        box-shadow: 0 4rpx 12rpx rgba(255, 71, 87, 0.4);
        animation: bounce 2s infinite;
        
        .badge-text {
          font-size: 20rpx;
          font-weight: 700;
          color: #fff;
          letter-spacing: 1rpx;
        }
      }
    }
    
    .entry-text {
      font-size: 26rpx;
      font-weight: 600;
      color: #333;
      margin-bottom: 6rpx;
    }
    
    .entry-desc {
      font-size: 20rpx;
      color: #999;
    }
    
    // 点击效果
    &:active {
      .entry-icon {
        transform: scale(0.92);
      }
      
      .icon-glow {
        opacity: 0.4;
        filter: blur(20rpx);
        transform: translate(-50%, -50%) scale(1.2);
      }
    }
  }
}

// 内容区块
.section {
  margin-top: 20rpx;
  background-color: #fff;
  padding: 24rpx;
  
  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24rpx;
    
    .section-title {
      display: flex;
      align-items: center;
      font-size: 32rpx;
      font-weight: 600;
      color: #333;
      
      .title-icon {
        width: 8rpx;
        height: 32rpx;
        background-color: #C8161D;
        border-radius: 4rpx;
        margin-right: 16rpx;
      }
    }
    
    .section-more {
      display: flex;
      align-items: center;
      font-size: 26rpx;
      color: #999;
      
      text {
        margin-right: 8rpx;
      }
    }
  }
  
  .news-list {
    display: flex;
    flex-direction: column;
    gap: 24rpx;
  }
  
  .course-list {
    display: flex;
    flex-direction: column;
    gap: 24rpx;
  }
  
  .activity-list {
    display: flex;
    flex-direction: column;
    gap: 24rpx;
    
    .activity-card {
      display: flex;
      border-radius: 12rpx;
      overflow: hidden;
      background-color: #f9f9f9;
      
      .activity-image {
        width: 200rpx;
        height: 150rpx;
        flex-shrink: 0;
      }
      
      .activity-content {
        flex: 1;
        padding: 20rpx;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        
        .activity-title {
          font-size: 28rpx;
          font-weight: 500;
          color: #333;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        
        .activity-meta {
          display: flex;
          align-items: center;
          font-size: 24rpx;
          color: #999;
          
          .activity-time,
          .activity-likes {
            margin-left: 8rpx;
          }
        }
      }
    }
  }
}
.navbar-logo {
  width: 100rpx;
  height: 100rpx;
  .logo-image {
    width: 70rpx;
    height: 100%;
  }
}
</style>

