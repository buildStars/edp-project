<template>
  <view class="page">
    <!-- 收藏列表 -->
    <view class="collection-list">
      <news-card 
        v-for="item in collectionList" 
        :key="item.id"
        :news="item"
        @click="goNewsDetail"
      />
      
      <!-- 空状态 -->
      <empty-view 
        v-if="!loading && collectionList.length === 0"
        text="暂无收藏"
      />
      
      <!-- 加载更多 -->
      <view v-if="loading" class="loading-more">
        <text>加载中...</text>
      </view>
      
      <!-- 没有更多 -->
      <view v-if="!hasMore && collectionList.length > 0" class="no-more">
        <text>没有更多了</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app'
import { getMyCollectionList } from '@/api/news'
import NewsCard from '@/components/news-card/news-card.vue'
import EmptyView from '@/components/empty-view/empty-view.vue'

// 收藏列表
const collectionList = ref([])

// 加载状态
const loading = ref(false)

// 分页
const page = ref(1)
const pageSize = ref(10)
const hasMore = ref(true)

// 页面加载
onMounted(() => {
  loadCollectionList(true)
})

// 加载收藏列表
const loadCollectionList = async (isRefresh = false) => {
  if (loading.value) return
  
  loading.value = true
  
  if (isRefresh) {
    page.value = 1
    hasMore.value = true
  }
  
  try {
    const data = await getMyCollectionList({
      page: page.value,
      pageSize: pageSize.value
    })
    
    // 后端返回的是 { items: [], total, page, pageSize, totalPages }
    const list = data.items || data.data || data.list || []
    
    if (isRefresh) {
      collectionList.value = list
    } else {
      collectionList.value = [...collectionList.value, ...list]
    }
    
    if (list.length < pageSize.value) {
      hasMore.value = false
    }
    
    page.value++
  } catch (error) {
    console.error('加载收藏列表失败：', error)
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
    
    if (isRefresh) {
      uni.stopPullDownRefresh()
    }
  }
}

// 跳转资讯详情
const goNewsDetail = (news) => {
  uni.navigateTo({
    url: `/pages/news/detail?id=${news.id}`
  })
}

// 下拉刷新
onPullDownRefresh(() => {
  loadCollectionList(true)
})

// 上拉加载
onReachBottom(() => {
  if (hasMore.value && !loading.value) {
    loadCollectionList(false)
  }
})
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background-color: #f8f8f8;
}

.collection-list {
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

