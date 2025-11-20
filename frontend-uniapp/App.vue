<script setup>
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import { useUserStore } from '@/store/user'

onLaunch((options) => {
  console.log('App Launch', options)
  
  // 初始化用户信息
  const userStore = useUserStore()
  userStore.initUserInfo()
  
  // 处理分享进入的场景
  if (options.scene === 1007 || options.scene === 1008) {
    // 1007: 单人聊天会话中的小程序消息卡片
    // 1008: 群聊会话中的小程序消息卡片
    console.log('从分享进入小程序', options.query)
    
    // 如果有礼物码，跳转到领取页面
    if (options.query && options.query.code) {
      const giftCode = options.query.code
      console.log('检测到礼物码:', giftCode)
      
      // 延迟跳转，确保小程序加载完成
      setTimeout(() => {
        uni.navigateTo({
          url: `/pages/course-gift/claim?code=${giftCode}`,
          fail: (err) => {
            console.error('跳转失败:', err)
          }
        })
      }, 500)
    }
  }
})

onShow((options) => {
  console.log('App Show', options)
  
  // 处理从后台切换到前台的场景
  if (options && options.query && options.query.code) {
    const giftCode = options.query.code
    console.log('从后台恢复，检测到礼物码:', giftCode)
    
    // 如果是礼物码分享
    setTimeout(() => {
      uni.navigateTo({
        url: `/pages/course-gift/claim?code=${giftCode}`,
        fail: (err) => {
          console.error('跳转失败:', err)
        }
      })
    }, 500)
  }
})

onHide(() => {
  console.log('App Hide')
})
</script>

<style lang="scss">
/*每个页面公共css */
@import '@/static/styles/common.scss';

/* 重置样式 */
page {
  background-color: #f8f8f8;
  font-size: 28rpx;
  color: #333;
}

view, image, text, button {
  box-sizing: border-box;
}

/* 全局通用样式 */
.container {
  padding: 24rpx;
}

.page-padding {
  padding: 0 24rpx;
}

/* 通用按钮样式 */
.btn-primary {
  background-color: #C8161D;
  color: #fff;
  border-radius: 8rpx;
  font-size: 28rpx;
  padding: 20rpx 40rpx;
  border: none;
}

.btn-plain {
  background-color: #fff;
  color: #C8161D;
  border: 2rpx solid #C8161D;
  border-radius: 8rpx;
  font-size: 28rpx;
  padding: 20rpx 40rpx;
}

/* 卡片样式 */
.card {
  background-color: #fff;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

/* 文本省略 */
.text-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.text-ellipsis-2 {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* Flex布局 */
.flex {
  display: flex;
}

.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.flex-1 {
  flex: 1;
}
</style>

