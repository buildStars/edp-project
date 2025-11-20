<template>
  <view v-if="visible" class="poster-overlay" @tap="handleOverlayTap">
    <view class="poster-container" @tap.stop>
      <!-- 关闭按钮 -->
      <view class="close-btn" @tap="handleClose">
        <text class="icon">✕</text>
      </view>

      <!-- 海报内容 -->
      <view class="poster-content">
        <!-- 顶部标题 -->
        <view class="poster-header">
          <text class="header-icon">🎓</text>
          <text class="header-text">恭喜完成课程</text>
        </view>

        <!-- 用户名 -->
        <view class="user-section">
          <text class="user-name">{{ posterData.userName }}</text>
          <text class="congratulations">在本次学习中表现优异</text>
        </view>

        <!-- 课程信息卡片 -->
        <view class="course-card">
          <!-- 课程封面 -->
          <view class="course-cover-wrapper">
            <image 
              class="course-cover" 
              :src="posterData.coverImage || '/static/images/default-course.png'" 
              mode="aspectFill"
            />
          </view>
          
          <!-- 课程详情 -->
          <view class="course-details">
            <text class="course-title">{{ posterData.courseName }}</text>
            <view class="course-meta">
              <text class="meta-item">👨‍🏫 {{ posterData.teacherName }}</text>
              <text class="meta-item">📅 {{ completionDateText }}</text>
            </view>
          </view>
        </view>

        <!-- 成就数据 -->
        <view class="achievement-grid">
          <view class="achievement-item">
            <text class="achievement-value">{{ posterData.achievementCredit }}</text>
            <text class="achievement-label">获得学分</text>
          </view>
          <view class="achievement-item">
            <text class="achievement-value">{{ posterData.checkinCount }}</text>
            <text class="achievement-label">签到次数</text>
          </view>
          <view class="achievement-item">
            <text class="achievement-value">{{ posterData.courseCredit }}</text>
            <text class="achievement-label">课程学分</text>
          </view>
        </view>

        <!-- 操作按钮 -->
        <view class="poster-actions">
          <button class="btn-share" @tap="handleShare" open-type="share">
    
            <text class="btn-text">分享好友</text>
          </button>
          <button class="btn-save" @tap="handleSavePoster">
           
            <text class="btn-text">保存海报</text>
          </button>
          <button class="btn-confirm" @tap="handleConfirm">
            <text class="btn-text">确认</text>
          </button>
        </view>

        <!-- 底部装饰 -->
        <view class="poster-footer">
          <text class="footer-text">继续保持，再接再厉！</text>
        </view>
      </view>
    </view>

    <!-- 隐藏的Canvas用于生成海报图片 -->
    <canvas 
      v-if="visible"
      canvas-id="posterCanvas" 
      :style="{ width: '660px', height: canvasHeight + 'px', position: 'fixed', left: '-9999px', top: '-9999px' }"
    ></canvas>
  </view>
</template>

<script>
export default {
  name: 'CompletionPoster',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    posterData: {
      type: Object,
      default: () => ({
        userName: '',
        courseName: '',
        teacherName: '',
        completionDate: '',
        courseCredit: 0,
        achievementCredit: 0,
        checkinCount: 0,
        coverImage: ''
      })
    }
  },
  data() {
    return {
      canvasHeight: 900, // Canvas高度
      isGenerating: false // 是否正在生成海报
    }
  },
  computed: {
    completionDateText() {
      if (!this.posterData.completionDate) return '--'
      const date = new Date(this.posterData.completionDate)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }
  },
  methods: {
    handleClose() {
      this.$emit('close')
    },
    handleConfirm() {
      this.$emit('confirm')
    },
    handleShare() {
      // 微信小程序分享
      // 需要在 detail.vue 中配置 onShareAppMessage
      this.$emit('share')
    },
    handleOverlayTap() {
      // 点击遮罩层不关闭
    },
    
    // 保存海报到相册
    async handleSavePoster() {
      if (this.isGenerating) {
        uni.showToast({
          title: '海报生成中，请稍候',
          icon: 'none'
        })
        return
      }

      try {
        this.isGenerating = true
        
        // 显示加载提示
        uni.showLoading({
          title: '生成海报中...',
          mask: true
        })

        // 生成海报图片
        const tempFilePath = await this.generatePosterImage()

        uni.hideLoading()

        // 保存到相册（自动处理权限请求）
        uni.saveImageToPhotosAlbum({
          filePath: tempFilePath,
          success: () => {
            uni.showToast({
              title: '海报已保存到相册',
              icon: 'success',
              duration: 2000
            })

            // 提示用户可以分享到朋友圈
            setTimeout(() => {
              uni.showModal({
                title: '分享到朋友圈',
                content: '海报已保存到相册，可以在朋友圈发送图片时选择此海报分享',
                showCancel: false,
                confirmText: '知道了'
              })
            }, 2000)
            
            this.isGenerating = false
          },
          fail: (err) => {
            this.isGenerating = false
            
            // 如果是权限问题，引导用户开启权限
            if (err.errMsg.includes('auth')) {
              uni.showModal({
                title: '需要相册权限',
                content: '保存图片需要相册权限，请在设置中开启',
                confirmText: '去设置',
                cancelText: '取消',
                success: (res) => {
                  if (res.confirm) {
                    uni.openSetting()
                  }
                }
              })
            } else {
              uni.showToast({
                title: '保存失败，请重试',
                icon: 'none'
              })
            }
          }
        })

      } catch (err) {
        console.error('生成海报失败:', err)
        uni.hideLoading()
        this.isGenerating = false
        uni.showToast({
          title: err.message || '生成失败，请重试',
          icon: 'none',
          duration: 2000
        })
      }
    },

    // 生成海报图片
    generatePosterImage() {
      return new Promise((resolve, reject) => {
        const ctx = uni.createCanvasContext('posterCanvas', this)
        const canvasWidth = 660
        const canvasHeight = 900

        // 绘制渐变背景
        const gradient = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight)
        gradient.addColorStop(0, '#667eea')
        gradient.addColorStop(1, '#764ba2')
        ctx.setFillStyle(gradient)
        ctx.fillRect(0, 0, canvasWidth, canvasHeight)

        // 绘制圆角矩形白色内容区
        this.drawRoundRect(ctx, 30, 30, canvasWidth - 60, canvasHeight - 60, 20, '#ffffff')

        let currentY = 80

        // 绘制顶部图标和标题
        ctx.setFontSize(50)
        ctx.setFillStyle('#667eea')
        ctx.setTextAlign('center')
        ctx.fillText('🎓', canvasWidth / 2, currentY)
        
        currentY += 60
        ctx.setFontSize(32)
        ctx.setFillStyle('#333333')
        ctx.fillText('恭喜完成课程', canvasWidth / 2, currentY)

        // 绘制用户名
        currentY += 80
        ctx.setFontSize(38)
        ctx.setFillStyle('#667eea')
        ctx.fillText(this.posterData.userName, canvasWidth / 2, currentY)

        currentY += 50
        ctx.setFontSize(24)
        ctx.setFillStyle('#999999')
        ctx.fillText('在本次学习中表现优异', canvasWidth / 2, currentY)

        // 绘制课程信息卡片
        currentY += 60
        const cardX = 60
        const cardY = currentY
        const cardWidth = canvasWidth - 120
        const cardHeight = 180
        
        // 卡片背景
        this.drawRoundRect(ctx, cardX, cardY, cardWidth, cardHeight, 15, '#f8f9fa')

        // 如果有课程封面，下载并绘制
        if (this.posterData.coverImage) {
          uni.downloadFile({
            url: this.posterData.coverImage,
            success: (res) => {
              if (res.statusCode === 200) {
                ctx.drawImage(res.tempFilePath, cardX + 20, cardY + 20, 140, 140)
                this.drawCourseInfo(ctx, canvasWidth, canvasHeight, currentY + cardHeight, resolve, reject)
              } else {
                this.drawCourseInfo(ctx, canvasWidth, canvasHeight, currentY + cardHeight, resolve, reject)
              }
            },
            fail: () => {
              this.drawCourseInfo(ctx, canvasWidth, canvasHeight, currentY + cardHeight, resolve, reject)
            }
          })
        } else {
          this.drawCourseInfo(ctx, canvasWidth, canvasHeight, currentY + cardHeight, resolve, reject)
        }

        // 绘制课程文字信息
        ctx.setTextAlign('left')
        ctx.setFontSize(26)
        ctx.setFillStyle('#333333')
        const textX = cardX + 180
        ctx.fillText(this.posterData.courseName.substring(0, 12), textX, cardY + 50)
        if (this.posterData.courseName.length > 12) {
          ctx.fillText(this.posterData.courseName.substring(12, 24), textX, cardY + 80)
        }

        ctx.setFontSize(20)
        ctx.setFillStyle('#666666')
        ctx.fillText(`👨‍🏫 ${this.posterData.teacherName}`, textX, cardY + 110)
        ctx.fillText(`📅 ${this.completionDateText}`, textX, cardY + 140)
      })
    },

    // 绘制课程信息之后的内容
    drawCourseInfo(ctx, canvasWidth, canvasHeight, currentY, resolve, reject) {
      // 绘制成就数据
      currentY += 60
      const achievementY = currentY
      const achievementWidth = (canvasWidth - 120) / 3
      
      ctx.setTextAlign('center')
      
      // 获得学分
      ctx.setFontSize(48)
      ctx.setFillStyle('#667eea')
      ctx.fillText(this.posterData.achievementCredit.toString(), 60 + achievementWidth / 2, achievementY)
      ctx.setFontSize(22)
      ctx.setFillStyle('#999999')
      ctx.fillText('获得学分', 60 + achievementWidth / 2, achievementY + 50)
      
      // 签到次数
      ctx.setFontSize(48)
      ctx.setFillStyle('#667eea')
      ctx.fillText(this.posterData.checkinCount.toString(), 60 + achievementWidth * 1.5, achievementY)
      ctx.setFontSize(22)
      ctx.setFillStyle('#999999')
      ctx.fillText('签到次数', 60 + achievementWidth * 1.5, achievementY + 50)
      
      // 课程学分
      ctx.setFontSize(48)
      ctx.setFillStyle('#667eea')
      ctx.fillText(this.posterData.courseCredit.toString(), 60 + achievementWidth * 2.5, achievementY)
      ctx.setFontSize(22)
      ctx.setFillStyle('#999999')
      ctx.fillText('课程学分', 60 + achievementWidth * 2.5, achievementY + 50)

      // 底部文字
      currentY += 150
      ctx.setFontSize(24)
      ctx.setFillStyle('#999999')
      ctx.fillText('继续保持，再接再厉！', canvasWidth / 2, currentY)

      // 绘制完成，生成图片
      ctx.draw(false, () => {
        setTimeout(() => {
          uni.canvasToTempFilePath({
            canvasId: 'posterCanvas',
            success: (res) => {
              resolve(res.tempFilePath)
            },
            fail: (err) => {
              reject(new Error('生成图片失败'))
            }
          }, this)
        }, 500)
      })
    },

    // 绘制圆角矩形
    drawRoundRect(ctx, x, y, width, height, radius, fillColor) {
      ctx.beginPath()
      ctx.arc(x + radius, y + radius, radius, Math.PI, Math.PI * 1.5)
      ctx.arc(x + width - radius, y + radius, radius, Math.PI * 1.5, Math.PI * 2)
      ctx.arc(x + width - radius, y + height - radius, radius, 0, Math.PI * 0.5)
      ctx.arc(x + radius, y + height - radius, radius, Math.PI * 0.5, Math.PI)
      ctx.closePath()
      ctx.setFillStyle(fillColor)
      ctx.fill()
    }
  }
}
</script>

<style lang="scss" scoped>
.poster-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.poster-container {
  width: 660rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 40rpx;
  padding: 40rpx;
  position: relative;
  animation: slideUp 0.4s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(100rpx);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.close-btn {
  position: absolute;
  top: 32rpx;
  right: 32rpx;
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10rpx);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  transition: all 0.3s;
  
  &:active {
    transform: scale(0.9);
    background: rgba(255, 255, 255, 0.35);
  }
  
  .icon {
    color: #fff;
    font-size: 40rpx;
    font-weight: bold;
  }
}

.poster-content {
  background: #fff;
  border-radius: 32rpx;
  padding: 48rpx 40rpx 40rpx;
  overflow: hidden;
}

.poster-header {
  text-align: center;
  margin-bottom: 24rpx;
  
  .header-icon {
    font-size: 64rpx;
    display: block;
    margin-bottom: 16rpx;
  }
  
  .header-text {
    font-size: 36rpx;
    font-weight: bold;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
}

.user-section {
  text-align: center;
  margin-bottom: 32rpx;
  
  .user-name {
    display: block;
    font-size: 44rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 12rpx;
  }
  
  .congratulations {
    display: block;
    font-size: 26rpx;
    color: #999;
  }
}

.course-card {
  background: linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%);
  border-radius: 24rpx;
  padding: 24rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
  
  .course-cover-wrapper {
    width: 100%;
    height: 240rpx;
    border-radius: 16rpx;
    overflow: hidden;
    margin-bottom: 20rpx;
    
    .course-cover {
      width: 100%;
      height: 100%;
    }
  }
  
  .course-details {
    .course-title {
      display: block;
      font-size: 32rpx;
      font-weight: 600;
      color: #333;
      margin-bottom: 16rpx;
      line-height: 1.4;
    }
    
    .course-meta {
      display: flex;
      align-items: center;
      gap: 24rpx;
      
      .meta-item {
        font-size: 24rpx;
        color: #666;
        display: flex;
        align-items: center;
      }
    }
  }
}

.achievement-grid {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 32rpx 0;
  background: linear-gradient(135deg, #ffeef8 0%, #fff4f1 100%);
  border-radius: 20rpx;
  margin-bottom: 32rpx;
  
  .achievement-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    
    &:not(:last-child)::after {
      content: '';
      position: absolute;
      right: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 2rpx;
      height: 60rpx;
      background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.1) 50%, transparent 100%);
    }
    
    .achievement-value {
      font-size: 48rpx;
      font-weight: bold;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 8rpx;
      line-height: 1;
    }
    
    .achievement-label {
      font-size: 24rpx;
      color: #999;
    }
  }
}

.poster-actions {
  display: flex;
  gap: 12rpx;
  margin-bottom: 24rpx;
  
  button {
    flex: 1;
    height: 88rpx;
    border-radius: 44rpx;
    border: none;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: 24rpx;
    transition: all 0.3s;
    
    &::after {
      border: none;
    }
    
    &:active {
      transform: scale(0.98);
    }
  }
  
  .btn-share {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    box-shadow: 0 8rpx 24rpx rgba(245, 87, 108, 0.3);
    
    .btn-icon {
      font-size: 28rpx;
      margin-bottom: 4rpx;
    }
    
    .btn-text {
      color: #fff;
      font-weight: 500;
    }
  }
  
  .btn-save {
    background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
    box-shadow: 0 8rpx 24rpx rgba(168, 237, 234, 0.3);
    
    .btn-icon {
      font-size: 28rpx;
      margin-bottom: 4rpx;
    }
    
    .btn-text {
      color: #667eea;
      font-weight: 500;
    }
  }
  
  .btn-confirm {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.4);
    
    .btn-text {
      color: #fff;
      font-weight: 600;
    }
  }
}

.poster-footer {
  text-align: center;
  padding-top: 16rpx;
  border-top: 2rpx dashed #eee;
  
  .footer-text {
    font-size: 24rpx;
    color: #999;
  }
}
</style>
