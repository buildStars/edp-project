<template>
  <view class="page">
    <!-- 自定义导航栏 -->
    <custom-navbar title="学校资讯" />
    
    <!-- 占位，防止内容被导航栏遮挡 -->
    <view :style="{ height: navbarHeight + 'px' }"></view>
    
    <!-- 分类导航 -->
    <view class="category-tabs">
      <view 
        v-for="(item, index) in categories" 
        :key="index"
        class="tab-item"
        :class="{ active: currentCategory === item.value }"
        @click="switchCategory(item.value)"
      >
        {{ item.label }}
      </view>
    </view>
    
    <!-- 资讯列表 -->
    <view class="news-list">
      <news-card 
        v-for="(item, index) in newsList" 
        :key="item.id"
        :news="item"
        @click="goNewsDetail"
      />
      
      <!-- 空状态 -->
      <empty-view 
        v-if="!loading && newsList.length === 0"
        text="暂无资讯"
        :show-btn="true"
        @click="onRefresh"
      />
      
      <!-- 加载更多 -->
      <view v-if="loading" class="loading-more">
        <text>加载中...</text>
      </view>
      
      <!-- 没有更多 -->
      <view v-if="!hasMore && newsList.length > 0" class="no-more">
        <text>没有更多了</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app'
import { useNewsStore } from '@/store/news'
import CustomNavbar from '@/components/custom-navbar/custom-navbar.vue'
import NewsCard from '@/components/news-card/news-card.vue'
import EmptyView from '@/components/empty-view/empty-view.vue'

// 导航栏高度
const navbarHeight = ref(0)

// 分类列表
const categories = ref([
  { label: '全部', value: '' },
  { label: '官方动态', value: 'official' },
  { label: '校友故事', value: 'alumni' }
])

// 当前分类
const currentCategory = ref('')

// 加载状态
const loading = ref(false)

// 新闻store
const newsStore = useNewsStore()

// 资讯列表
const newsList = computed(() => newsStore.newsList)

// 是否还有更多
const hasMore = computed(() => newsStore.hasMore)

// 获取系统信息
onMounted(() => {
  const systemInfo = uni.getSystemInfoSync()
  navbarHeight.value = (systemInfo.statusBarHeight || 0) + 44
  
  // 加载资讯列表
  loadNewsList(true)
})

// 切换分类
const switchCategory = (category) => {
  if (currentCategory.value === category) return
  
  currentCategory.value = category
  newsStore.setCurrentCategory(category)
  loadNewsList(true)
}

// 加载资讯列表
const loadNewsList = async (isRefresh = false) => {
  if (loading.value) return
  
  loading.value = true
  
  try {
    await newsStore.fetchNewsList(isRefresh)
  } catch (error) {
    console.error('加载资讯失败：', error)
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
    
    // 如果是刷新，停止下拉刷新动画
    if (isRefresh) {
      uni.stopPullDownRefresh()
    }
  }
}

// 下拉刷新
const onRefresh = () => {
  loadNewsList(true)
}

// 跳转资讯详情
const goNewsDetail = (news) => {
  uni.navigateTo({
    url: `/pages/news/detail?id=${news.id}`
  })
}

// 监听下拉刷新
onPullDownRefresh(() => {
  onRefresh()
})

// 监听上拉加载
onReachBottom(() => {
  if (hasMore.value && !loading.value) {
    loadNewsList(false)
  }
})
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background-color: #f8f8f8;
}

.category-tabs {
  display: flex;
  align-items: center;
  background-color: #fff;
  padding: 24rpx;
  
  .tab-item {
    flex: 1;
    text-align: center;
    font-size: 28rpx;
    color: #666;
    padding: 16rpx 0;
    position: relative;
    
    &.active {
      color: #C8161D;
      font-weight: 500;
      
      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 60rpx;
        height: 4rpx;
        background-color: #C8161D;
        border-radius: 2rpx;
      }
    }
  }
}

.news-list {
  padding: 24rpx;
}

.loading-more,
.no-more {
  text-align: center;
  padding: 40rpx 0;
  font-size: 26rpx;
  color: #999;
}
</style>

