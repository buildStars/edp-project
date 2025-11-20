<template>
  <div class="enrollments-list">
    <!-- 搜索栏 -->
    <el-card shadow="never" class="search-card">
      <el-form :model="queryParams" inline>
        <el-form-item label="报名状态">
          <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 150px">
            <el-option label="已报名" value="ENROLLED" />
            <el-option label="已完成" value="COMPLETED" />
            <el-option label="已取消" value="CANCELLED" />
          </el-select>
        </el-form-item>
        <el-form-item label="签到状态">
          <el-select v-model="queryParams.checkedIn" placeholder="全部" clearable style="width: 150px">
            <el-option label="已签到" :value="true" />
            <el-option label="未签到" :value="false" />
          </el-select>
        </el-form-item>
        <el-form-item label="评价状态">
          <el-select v-model="queryParams.rated" placeholder="全部" clearable style="width: 150px">
            <el-option label="已评价" :value="true" />
            <el-option label="未评价" :value="false" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作栏 -->
    <el-card shadow="never" class="toolbar-card">
      <el-button v-if="['ADMIN', 'STAFF','TEACHER'].includes(userRole)" type="primary" :icon="Document" @click="goToTrials">
        试听申请
      </el-button>
    
      <el-button v-if="['ADMIN', 'STAFF','TEACHER'].includes(userRole)" type="warning" :icon="RefreshRight" @click="goToRefundRequests">
        退课申请
      </el-button>
    </el-card>

    <!-- 表格 -->
    <el-card shadow="never">
      <el-table v-loading="loading" :data="tableData">
        <el-table-column prop="user.realName" label="学员姓名" width="120" />
        <el-table-column prop="user.phone" label="手机号" width="130" />
        <el-table-column prop="course.title" label="课程名称" min-width="200" show-overflow-tooltip />
        <el-table-column label="课程分类" width="120">
          <template #default="{ row }">
            <el-tag :type="getCategoryType(row.course?.category)">
              {{ getCategoryLabel(row.course?.category) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="报名状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.status === 'ENROLLED'" type="primary">已报名</el-tag>
            <el-tag v-else-if="row.status === 'COMPLETED'" type="success">已完成</el-tag>
            <el-tag v-else type="info">已取消</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="签到" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.checkedIn" type="success">
              <el-icon><Check /></el-icon> 已签到
            </el-tag>
            <el-tag v-else type="info">未签到</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="评价" width="120" align="center">
          <template #default="{ row }">
            <el-rate v-if="row.rated" :model-value="row.rating" disabled />
            <span v-else class="text-secondary">未评价</span>
          </template>
        </el-table-column>
        <el-table-column label="报名时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">查看详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="queryParams.page"
        v-model:page-size="queryParams.pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Refresh, Document, RefreshRight, Check } from '@element-plus/icons-vue'
import { getEnrollmentList } from '@/api/enrollment'
import type { Enrollment } from '@/types/models'
import { formatDate } from '@/utils/format'
import { useTable } from '@/composables/useTable'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// 获取当前用户角色
const userRole = computed(() => authStore.userInfo?.role || '')

// 表格数据
const {
  loading,
  tableData,
  total,
  queryParams,
  handleSearch,
  handleReset,
  handlePageChange,
  handleSizeChange,
} = useTable<Enrollment>({
  fetchApi: getEnrollmentList,
  immediate: false,
})

// 分类标签
const getCategoryType = (category: string): 'primary' | 'danger' | 'success' | 'info' => {
  const map: Record<string, 'primary' | 'danger' | 'success' | 'info'> = {
    ACCELERATE: 'primary',
    MASTER: 'danger',
    EMPOWER: 'success',
  }
  return map[category] || 'info'
}

const getCategoryLabel = (category: string) => {
  const map: Record<string, string> = {
    ACCELERATE: '加速课堂',
    MASTER: '大师课堂',
    EMPOWER: '赋能课堂',
  }
  return map[category] || category
}

// 查看详情
const handleView = (row: Enrollment) => {
  router.push(`/courses/detail?id=${row.courseId}`)
}

// 跳转页面
const goToTrials = () => {
  router.push('/enrollments/trials')
}

const goToRefundRequests = () => {
  router.push('/enrollments/refund-requests')
}

// 初始加载
handleSearch()
</script>

<style scoped lang="scss">
.enrollments-list {
  padding: 20px;

  .search-card,
  .toolbar-card {
    margin-bottom: 20px;
    border-radius: 8px;
    transition: all 0.3s;
    
    &:hover {
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    }

    :deep(.el-card__body) {
      padding: 20px;
    }
  }

  .search-card {
    :deep(.el-form) {
      .el-form-item {
        margin-bottom: 0;
      }
      
      .el-form-item__label {
        font-weight: 500;
        color: #606266;
      }
    }
  }

  .toolbar-card {
    :deep(.el-card__body) {
      display: flex;
      gap: 12px;
      padding: 16px 20px;
    }

    .el-button {
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
      }
    }
  }

  :deep(.el-card) {
    border-radius: 8px;
    
    .el-table {
      border-radius: 8px;
      overflow: hidden;
      
      th {
        background: #f5f7fa;
        color: #606266;
        font-weight: 600;
      }
      
      tr:hover {
        background: #f5f7fa;
      }
    }
  }

  .text-secondary {
    color: var(--el-text-color-secondary);
    font-size: 12px;
  }

  :deep(.el-pagination) {
    margin-top: 20px;
    justify-content: flex-end;
    padding: 16px 0;
  }

  :deep(.el-tag) {
    border-radius: 4px;
    font-weight: 500;
  }

  :deep(.el-button.is-link) {
    font-weight: 500;
    
    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
