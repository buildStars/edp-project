<template>
  <view class="page">
    <!-- 下载列表 -->
    <view class="download-list">
      <view 
        v-for="item in downloadList" 
        :key="item.id"
        class="download-item"
      >
        <view class="item-info">
          <view class="item-title">{{ item.courseName }}</view>
          <view class="item-meta">
            <text class="item-size">{{ formatFileSize(item.fileSize) }}</text>
            <text class="item-time">{{ formatTime(item.downloadTime) }}</text>
          </view>
        </view>
        <view class="item-actions">
          <view class="action-btn preview-btn" @click="previewFile(item)">
            <image src="/static/images/preview.png" class="btn-icon" />
            <text>预览</text>
          </view>
          <view class="action-btn download-btn" @click="downloadFile(item)">
            <image src="/static/images/download-icon.png" class="btn-icon" />
            <text>下载</text>
          </view>
        </view>
      </view>
      
      <!-- 空状态 -->
      <empty-view 
        v-if="downloadList.length === 0"
        text="暂无下载记录"
      />
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { formatTime, downloadFile as downloadFileUtil, openDocument } from '@/utils/util'
import EmptyView from '@/components/empty-view/empty-view.vue'

// 下载列表
const downloadList = ref([])

// 页面加载
onMounted(() => {
  loadDownloadList()
})

// 加载下载列表
const loadDownloadList = () => {
  // TODO: 从本地存储或接口获取下载记录
  // 这里使用模拟数据
  downloadList.value = []
}

// 格式化文件大小
const formatFileSize = (size) => {
  if (!size) return '-'
  
  if (size < 1024) {
    return size + 'B'
  } else if (size < 1024 * 1024) {
    return (size / 1024).toFixed(2) + 'KB'
  } else {
    return (size / (1024 * 1024)).toFixed(2) + 'MB'
  }
}

// 预览文件
const previewFile = (item) => {
  if (item.localPath) {
    // 如果已下载，直接打开
    openDocument(item.localPath, item.fileType)
  } else {
    // 如果未下载，先下载再打开
    uni.showLoading({
      title: '加载中...'
    })
    
    downloadFileUtil(item.fileUrl).then(filePath => {
      uni.hideLoading()
      openDocument(filePath, item.fileType)
      
      // 保存本地路径
      item.localPath = filePath
    }).catch(() => {
      uni.hideLoading()
    })
  }
}

// 下载文件
const downloadFile = (item) => {
  downloadFileUtil(item.fileUrl).then(filePath => {
    uni.showToast({
      title: '下载成功',
      icon: 'success'
    })
    
    // 保存本地路径
    item.localPath = filePath
  })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background-color: #f8f8f8;
}

.download-list {
  padding: 24rpx;
  
  .download-item {
    background-color: #fff;
    border-radius: 12rpx;
    padding: 24rpx;
    margin-bottom: 24rpx;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
    
    .item-info {
      margin-bottom: 24rpx;
      
      .item-title {
        font-size: 30rpx;
        font-weight: 500;
        color: #333;
        margin-bottom: 12rpx;
      }
      
      .item-meta {
        display: flex;
        align-items: center;
        font-size: 24rpx;
        color: #999;
        
        .item-size {
          margin-right: 24rpx;
        }
      }
    }
    
    .item-actions {
      display: flex;
      gap: 24rpx;
      
      .action-btn {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 72rpx;
        border-radius: 8rpx;
        font-size: 26rpx;
        
        .btn-icon {
          width: 32rpx;
          height: 32rpx;
          margin-right: 8rpx;
        }
        
        &.preview-btn {
          background-color: #f5f5f5;
          color: #666;
        }
        
        &.download-btn {
          background-color: #C8161D;
          color: #fff;
        }
      }
    }
  }
}
</style>

