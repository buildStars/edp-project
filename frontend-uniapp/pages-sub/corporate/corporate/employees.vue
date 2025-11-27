<template>
  <view class="page-container">
    <!-- 顶部统计 -->
    <view class="stat-card">
      <view class="stat-title">企业员工管理</view>
      <view class="stat-info">
        <text class="stat-label">员工总数：</text>
        <text class="stat-value">{{ employees.length }}</text>
      </view>
    </view>

    <!-- 员工列表 -->
    <view class="employee-list">
      <view 
        v-for="emp in employees" 
        :key="emp.id" 
        class="employee-card"
        @click="handleEmployeeClick(emp)"
      >
        <view class="employee-info">
          <view class="employee-header">
            <text class="employee-name">{{ emp.realName || emp.nickname }}</text>
            <text v-if="emp.position" class="employee-position">{{ emp.position }}</text>
          </view>
          <view class="employee-phone">{{ emp.phone }}</view>
        </view>
        
        <view class="credit-info">
          <view class="credit-item">
            <text class="credit-label">个人学分</text>
            <text class="credit-value personal">{{ emp.personalBalance }}</text>
          </view>
          <view class="credit-item">
            <text class="credit-label">企业学分</text>
            <text class="credit-value corporate">{{ emp.corporateBalance }}</text>
          </view>
          <view class="credit-item total">
            <text class="credit-label">总学分</text>
            <text class="credit-value">{{ emp.totalBalance }}</text>
          </view>
        </view>
        
        <view class="action-btns">
          <button 
            class="btn-small btn-primary" 
            @click.stop="handleAllocate(emp)"
          >
            分配学分
          </button>
          <button 
            class="btn-small btn-success" 
            @click.stop="handlePurchase(emp)"
          >
            购买课程
          </button>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-if="!loading && employees.length === 0" class="empty-state">
        <text class="empty-text">暂无企业员工</text>
      </view>
    </view>

    <!-- 分配学分弹窗 -->
    <view v-if="showAllocatePopup" class="popup-mask" @click="closeAllocatePopup">
      <view class="popup-content" @click.stop>
        <view class="popup-header">
          <text class="popup-title">分配学分</text>
          <text class="popup-close" @click="closeAllocatePopup">×</text>
        </view>
        
        <view class="popup-body">
          <view class="form-item">
            <text class="form-label">员工姓名</text>
            <text class="form-value">{{ selectedEmployee?.realName || selectedEmployee?.nickname }}</text>
          </view>
          
          <view class="form-item">
            <text class="form-label">当前企业学分</text>
            <text class="form-value">{{ selectedEmployee?.corporateBalance }}</text>
          </view>
          
          <view class="form-item">
            <text class="form-label">分配数量</text>
            <input 
              v-model="allocateAmount" 
              class="form-input" 
              type="number" 
              placeholder="请输入学分数量"
            />
          </view>
          
          <view class="form-tip">
            您的个人学分余额：{{ myCredit }}
          </view>
        </view>
        
        <view class="popup-footer">
          <button class="btn-cancel" @click="closeAllocatePopup">取消</button>
          <button class="btn-confirm" @click="confirmAllocate">确认分配</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getCorpEmployees, allocateCredit } from '../../api/corporate'
import { getMyCredits } from '@/api/course'

const employees = ref([])
const loading = ref(false)
const myCredit = ref(0)

// 分配学分相关
const showAllocatePopup = ref(false)
const selectedEmployee = ref(null)
const allocateAmount = ref('')

// 加载数据
onLoad(async () => {
  await loadEmployees()
  await loadMyCredit()
})

// 加载员工列表
const loadEmployees = async () => {
  loading.value = true
  try {
    const data = await getCorpEmployees()
    employees.value = data
  } catch (error) {
    uni.showToast({
      title: error.message || '加载失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

// 加载我的学分
const loadMyCredit = async () => {
  try {
    const data = await getMyCredits()
    myCredit.value = data.balance || 0
  } catch (error) {
    console.error('加载学分失败:', error)
  }
}

// 点击员工卡片
const handleEmployeeClick = (emp) => {
  uni.navigateTo({
    url: `/pages/corporate/employee-detail?id=${emp.id}`
  })
}

// 分配学分
const handleAllocate = (emp) => {
  selectedEmployee.value = emp
  allocateAmount.value = ''
  showAllocatePopup.value = true
}

// 确认分配
const confirmAllocate = async () => {
  const amount = parseInt(allocateAmount.value)
  
  if (!amount || amount <= 0) {
    uni.showToast({
      title: '请输入有效的学分数量',
      icon: 'none'
    })
    return
  }
  
  if (amount > myCredit.value) {
    uni.showToast({
      title: '您的个人学分不足',
      icon: 'none'
    })
    return
  }
  
  try {
    uni.showLoading({ title: '分配中...' })
    
    await allocateCredit({
      toUserId: selectedEmployee.value.id,
      amount: amount
    })
    
    uni.hideLoading()
    uni.showToast({
      title: '分配成功',
      icon: 'success'
    })
    
    // 关闭弹窗并刷新数据
    closeAllocatePopup()
    await loadEmployees()
    await loadMyCredit()
    
  } catch (error) {
    uni.hideLoading()
    uni.showToast({
      title: error.message || '分配失败',
      icon: 'none'
    })
  }
}

// 关闭分配弹窗
const closeAllocatePopup = () => {
  showAllocatePopup.value = false
  selectedEmployee.value = null
  allocateAmount.value = ''
}

// 购买课程
const handlePurchase = (emp) => {
  uni.navigateTo({
    url: `/pages/corporate/purchase-course?employeeId=${emp.id}&employeeName=${encodeURIComponent(emp.realName || emp.nickname)}`
  })
}
</script>

<style scoped lang="scss">
.page-container {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: 40rpx;
}

.stat-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40rpx 30rpx;
  color: white;
  
  .stat-title {
    font-size: 32rpx;
    font-weight: bold;
    margin-bottom: 20rpx;
  }
  
  .stat-info {
    display: flex;
    align-items: center;
    
    .stat-label {
      font-size: 28rpx;
      opacity: 0.9;
    }
    
    .stat-value {
      font-size: 40rpx;
      font-weight: bold;
      margin-left: 10rpx;
    }
  }
}

.employee-list {
  padding: 20rpx 30rpx;
}

.employee-card {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
  
  .employee-info {
    margin-bottom: 24rpx;
    padding-bottom: 24rpx;
    border-bottom: 1rpx solid #f0f0f0;
    
    .employee-header {
      display: flex;
      align-items: center;
      margin-bottom: 12rpx;
      
      .employee-name {
        font-size: 32rpx;
        font-weight: bold;
        color: #333;
      }
      
      .employee-position {
        font-size: 24rpx;
        color: #999;
        margin-left: 16rpx;
        padding: 4rpx 12rpx;
        background: #f5f5f5;
        border-radius: 4rpx;
      }
    }
    
    .employee-phone {
      font-size: 26rpx;
      color: #666;
    }
  }
  
  .credit-info {
    display: flex;
    justify-content: space-between;
    margin-bottom: 24rpx;
    
    .credit-item {
      flex: 1;
      text-align: center;
      
      &.total {
        border-left: 1rpx solid #f0f0f0;
      }
      
      .credit-label {
        display: block;
        font-size: 24rpx;
        color: #999;
        margin-bottom: 8rpx;
      }
      
      .credit-value {
        display: block;
        font-size: 32rpx;
        font-weight: bold;
        color: #333;
        
        &.personal {
          color: #1890ff;
        }
        
        &.corporate {
          color: #52c41a;
        }
      }
    }
  }
  
  .action-btns {
    display: flex;
    gap: 16rpx;
    
    .btn-small {
      flex: 1;
      height: 64rpx;
      line-height: 64rpx;
      font-size: 26rpx;
      border-radius: 32rpx;
      border: none;
      padding: 0;
      &.btn-primary {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
      }
      
      &.btn-success {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        color: white;
      }
    }
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;
  
  .empty-image {
    width: 200rpx;
    height: 200rpx;
    margin-bottom: 30rpx;
  }
  
  .empty-text {
    font-size: 28rpx;
    color: #999;
  }
}

// 弹窗样式
.popup-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.popup-content {
  width: 600rpx;
  background: white;
  border-radius: 16rpx;
  overflow: hidden;
  
  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 30rpx;
    border-bottom: 1rpx solid #f0f0f0;
    
    .popup-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }
    
    .popup-close {
      font-size: 48rpx;
      color: #999;
      line-height: 1;
    }
  }
  
  .popup-body {
    padding: 30rpx;
    
    .form-item {
      margin-bottom: 24rpx;
      
      .form-label {
        display: block;
        font-size: 28rpx;
        color: #666;
        margin-bottom: 12rpx;
      }
      
      .form-value {
        display: block;
        font-size: 32rpx;
        color: #333;
        font-weight: bold;
      }
      
      .form-input {
        width: 100%;
        height: 80rpx;
        padding: 0 20rpx;
        font-size: 30rpx;
        border: 1rpx solid #e0e0e0;
        border-radius: 8rpx;
        box-sizing: border-box;
      }
    }
    
    .form-tip {
      font-size: 24rpx;
      color: #ff9800;
      padding: 16rpx;
      background: #fff3e0;
      border-radius: 8rpx;
    }
  }
  
  .popup-footer {
    display: flex;
    border-top: 1rpx solid #f0f0f0;
    
    button {
      flex: 1;
      height: 88rpx;
      line-height: 88rpx;
      font-size: 30rpx;
      border: none;
      border-radius: 0;
      
      &.btn-cancel {
        background: white;
        color: #666;
      }
      
      &.btn-confirm {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
      }
    }
  }
}
</style>

