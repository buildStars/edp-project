<template>
  <div class="error-container">
    <div class="error-content">
      <h1>404</h1>
      <h3>页面不存在</h3>
      <p>抱歉,您访问的页面不存在或已被删除。</p>
      <el-button type="primary" @click="goHome">返回首页</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}
</script>

<style lang="scss" scoped>
.error-container {
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f2f5;

  .error-content {
    text-align: center;

    h1 {
      font-size: 120px;
      color: #409eff;
      margin: 0;
    }

    h3 {
      font-size: 28px;
      color: #333;
      margin: 20px 0;
    }

    p {
      font-size: 16px;
      color: #999;
      margin-bottom: 30px;
    }
  }
}
</style>


