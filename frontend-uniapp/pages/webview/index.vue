<template>
  <view class="webview-container">
    <web-view :src="url" @message="handleMessage" @error="handleError"></web-view>
  </view>
</template>

<script setup>
import { ref, onLoad } from '@dcloudio/uni-app'

const url = ref('')

onLoad((options) => {
  if (options.url) {
    url.value = decodeURIComponent(options.url)
  } else {
    uni.showToast({
      title: '链接地址无效',
      icon: 'none'
    })
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  }
})

const handleMessage = (e) => {
  console.log('收到H5消息：', e.detail.data)
}

const handleError = (e) => {
  console.error('WebView加载失败：', e)
  uni.showToast({
    title: '页面加载失败',
    icon: 'none'
  })
}
</script>

<style lang="scss" scoped>
.webview-container {
  width: 100%;
  height: 100vh;
}
</style>

