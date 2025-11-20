<template>
  <view class="page">
    <!-- 课程信息 -->
    <view class="course-header">
      <text class="course-title">{{ pageTitle }}</text>
      <text class="course-subtitle">{{ pageSubtitle }}</text>
    </view>
    
    <!-- 课件列表 -->
    <view class="materials-list">
      <view 
        v-for="item in materials" 
        :key="item.id"
        class="material-item"
      >
        <view class="material-icon">
          <text class="icon">📄</text>
        </view>
        <view class="material-info">
          <text class="material-title">{{ item.title }}</text>
          <view class="material-meta">
            <text class="file-type">{{ item.fileType.toUpperCase() }}</text>
            <text class="file-size">{{ formatFileSize(item.fileSize) }}</text>
          </view>
        </view>
        <button class="btn-download" @click="handleDownload(item)">
          <Icon name="download" :size="32" color="#fff" />
          <text>下载</text>
        </button>
      </view>
      
      <!-- 空状态 -->
      <empty-view 
        v-if="!loading && materials.length === 0"
        text="暂无课件"
      />
      
      <!-- 加载中 -->
      <view v-if="loading" class="loading">
        <text>加载中...</text>
      </view>
    </view>
    
    <!-- 下载提示 -->
    <view class="download-tip">
      <text class="tip-icon">💡</text>
      <text class="tip-text">点击下载按钮即可保存课件到本地</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getCourseMaterials } from '@/api/course'
import { recordDownload } from '@/api/download'
import EmptyView from '@/components/empty-view/empty-view.vue'
import Icon from '@/components/icon/icon.vue'

const courseId = ref('')
const chapterId = ref('')
const course = ref({
  title: ''
})
const chapterTitle = ref('')

const materials = ref([])
const loading = ref(false)

// 页面标题
const pageTitle = computed(() => {
  return chapterTitle.value || course.value.title || '课件资料'
})

const pageSubtitle = computed(() => {
  if (chapterId.value) {
    return '章节课件资料'
  }
  return '课程课件资料'
})

// 页面加载
onLoad(async (options) => {
  courseId.value = options.courseId
  chapterId.value = options.chapterId || ''
  
  if (options.courseTitle) {
    course.value.title = decodeURIComponent(options.courseTitle)
  }
  if (options.chapterTitle) {
    chapterTitle.value = decodeURIComponent(options.chapterTitle)
  }
  
  await loadMaterials()
})

// 加载课件列表
const loadMaterials = async () => {
  loading.value = true
  try {
    const data = await getCourseMaterials(courseId.value, chapterId.value || null)
    materials.value = data || []
    console.log('📚 课件列表加载成功:', materials.value.length, '个课件')
  } catch (error) {
    console.error('❌ 加载课件列表失败：', error)
    uni.showToast({
      title: error.msg || '加载失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (!bytes) return '--'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

// 下载课件
const handleDownload = async (material) => {
  console.log('📥 开始下载课件:', material.title, material.fileUrl)
  
  uni.showLoading({
    title: '准备下载...',
    mask: true
  })
  
  try {
    // 使用 Promise 包装下载流程
    const downloadTask = uni.downloadFile({
      url: material.fileUrl,
      timeout: 60000,
      success: async (downloadRes) => {
        console.log('📥 下载响应:', downloadRes.statusCode)
        
        if (downloadRes.statusCode === 200) {
          const tempFilePath = downloadRes.tempFilePath
          console.log('📥 临时文件:', tempFilePath)
          
          uni.saveFile({
            tempFilePath: tempFilePath,
            success: async (saveRes) => {
              const savedFilePath = saveRes.savedFilePath
              console.log('✅ 文件已保存:', savedFilePath)
              
              uni.hideLoading()
              
              // 记录下载
              try {
                await recordDownload({ materialId: material.id })
                console.log('✅ 下载记录成功')
              } catch (err) {
                console.error('❌ 记录下载失败:', err)
              }
              
              // 询问是否打开
              uni.showModal({
                title: '下载成功',
                content: `《${material.title}》已保存，是否立即打开？`,
                confirmText: '打开',
                cancelText: '稍后',
                success: (modalRes) => {
                  if (modalRes.confirm) {
                    uni.openDocument({
                      filePath: savedFilePath,
                      fileType: material.fileType || 'pdf',
                      showMenu: true,
                      success: () => {
                        console.log('✅ 文件已打开')
                      },
                      fail: (openErr) => {
                        console.error('❌ 打开失败:', openErr)
                        uni.showToast({
                          title: '无法打开该文件',
                          icon: 'none',
                          duration: 2000
                        })
                      }
                    })
                  }
                }
              })
            },
            fail: (saveErr) => {
              uni.hideLoading()
              console.error('❌ 保存失败:', saveErr)
              uni.showToast({
                title: '保存失败',
                icon: 'none'
              })
            }
          })
        } else {
          uni.hideLoading()
          console.error('❌ 下载失败:', downloadRes.statusCode)
          uni.showToast({
            title: `下载失败(${downloadRes.statusCode})`,
            icon: 'none'
          })
        }
      },
      fail: (downloadErr) => {
        uni.hideLoading()
        console.error('❌ 下载错误:', downloadErr)
        uni.showToast({
          title: '网络错误，请重试',
          icon: 'none',
          duration: 2000
        })
      }
    })
    
    // 监听下载进度
    downloadTask.onProgressUpdate((res) => {
      uni.showLoading({
        title: `下载中 ${res.progress}%`,
        mask: true
      })
      console.log('下载进度:', res.progress + '%')
    })
    
  } catch (error) {
    uni.hideLoading()
    console.error('❌ 下载异常:', error)
    uni.showToast({
      title: '下载失败',
      icon: 'none'
    })
  }
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #F5F7FA;
  padding-bottom: env(safe-area-inset-bottom);
}

.course-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 48rpx 32rpx;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  
  .course-title {
    font-size: 36rpx;
    font-weight: 600;
    color: #fff;
    line-height: 1.4;
  }
  
  .course-subtitle {
    font-size: 26rpx;
    color: rgba(255, 255, 255, 0.8);
  }
}

.materials-list {
  padding: 24rpx;
}

.material-item {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  display: flex;
  align-items: center;
  gap: 24rpx;
  box-shadow: 0 2rpx 16rpx rgba(0, 0, 0, 0.06);
  
  .material-icon {
    width: 96rpx;
    height: 96rpx;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 16rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    
    .icon {
      font-size: 56rpx;
    }
  }
  
  .material-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12rpx;
    min-width: 0;
    
    .material-title {
      font-size: 30rpx;
      font-weight: 500;
      color: #333;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .material-meta {
      display: flex;
      align-items: center;
      gap: 16rpx;
      
      .file-type,
      .file-size {
        font-size: 24rpx;
        color: #999;
      }
      
      .file-type {
        background: #F0F0F0;
        padding: 4rpx 12rpx;
        border-radius: 8rpx;
        font-weight: 600;
      }
    }
  }
  
  .btn-download {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    border: none;
    padding: 16rpx 32rpx;
    border-radius: 24rpx;
    font-size: 26rpx;
    display: flex;
    align-items: center;
    gap: 8rpx;
    flex-shrink: 0;
  }
}

.loading {
  text-align: center;
  padding: 48rpx 0;
  font-size: 26rpx;
  color: #999;
}

.download-tip {
  background: #FFF7E6;
  margin: 24rpx;
  padding: 24rpx;
  border-radius: 16rpx;
  border: 2rpx solid #FFE7BA;
  display: flex;
  align-items: center;
  gap: 12rpx;
  
  .tip-icon {
    font-size: 32rpx;
    flex-shrink: 0;
  }
  
  .tip-text {
    flex: 1;
    font-size: 26rpx;
    color: #F59A23;
    line-height: 1.6;
  }
}
</style>

