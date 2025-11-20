<template>
  <div class="course-gifts-page">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span class="title">课程赠送记录</span>
          <el-button type="primary" :icon="Refresh" @click="loadData">刷新</el-button>
        </div>
      </template>

      <!-- 搜索筛选 -->
      <el-form :inline="true" :model="queryForm" class="search-form">
        <el-form-item label="状态">
          <el-select v-model="queryForm.status" placeholder="全部状态" clearable @change="handleSearch">
            <el-option label="待接收" value="PENDING" />
            <el-option label="已接收" value="ACCEPTED" />
            <el-option label="已拒绝" value="REJECTED" />
            <el-option label="已过期" value="EXPIRED" />
          </el-select>
        </el-form-item>
      </el-form>

      <!-- 数据表格 -->
      <el-table
        v-loading="loading"
        :data="tableData"
        stripe
        border
        style="width: 100%"
      >
        <el-table-column type="index" label="#" width="60" />
        
        <el-table-column label="课程信息" min-width="250">
          <template #default="{ row }">
            <div class="course-info">
              <el-image
                :src="row.course?.coverImage"
                fit="cover"
                class="course-cover"
              >
                <template #error>
                  <div class="image-slot">
                    <el-icon><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
              <div class="course-detail">
                <div class="course-title">{{ row.course?.title || '未知课程' }}</div>
                <div class="course-credit">
                  消耗学分：<el-tag size="small" type="danger">{{ row.creditCost }}</el-tag>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="赠送方" min-width="150">
          <template #default="{ row }">
            <div class="user-info">
              <div class="info-row">
                <strong>{{ row.fromUser?.realName || row.fromUser?.nickname || '未知用户' }}</strong>
              </div>
              <div class="info-row text-secondary">
                {{ row.fromUser?.phone || '-' }}
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="接收方" min-width="150">
          <template #default="{ row }">
            <div class="user-info">
              <div class="info-row">
                <strong>{{ row.toUser?.realName || row.toUser?.nickname || '未知用户' }}</strong>
              </div>
              <div class="info-row text-secondary">
                {{ row.toUser?.phone || '-' }}
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="赠送留言" min-width="180">
          <template #default="{ row }">
            <el-text v-if="row.message" type="info" size="small">
              {{ row.message }}
            </el-text>
            <el-text v-else type="info" size="small">无</el-text>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag
              :type="getStatusType(row.status)"
              effect="dark"
            >
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="赠送时间" width="160">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>

        <el-table-column label="接收时间" width="160">
          <template #default="{ row }">
            {{ row.acceptedAt ? formatDateTime(row.acceptedAt) : '-' }}
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="queryForm.page"
          v-model:page-size="queryForm.pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadData"
          @current-change="loadData"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, Picture } from '@element-plus/icons-vue'
import type { CourseGift, CourseGiftQuery } from '@/api/course-gift'
import { getCourseGifts } from '@/api/course-gift'
import dayjs from 'dayjs'

// 查询表单
const queryForm = reactive<CourseGiftQuery>({
  page: 1,
  pageSize: 20,
  status: undefined
})

// 表格数据
const loading = ref(false)
const tableData = ref<CourseGift[]>([])
const total = ref(0)

// 加载数据
const loadData = async () => {
  try {
    loading.value = true
    const res = await getCourseGifts(queryForm)
    tableData.value = res.items
    total.value = res.total
  } catch (error: any) {
    ElMessage.error(error.msg || '加载失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  queryForm.page = 1
  loadData()
}

// 格式化日期时间
const formatDateTime = (dateTime: string) => {
  if (!dateTime) return '-'
  return dayjs(dateTime).format('YYYY-MM-DD HH:mm')
}

// 获取状态文本
const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    PENDING: '待接收',
    ACCEPTED: '已接收',
    REJECTED: '已拒绝',
    EXPIRED: '已过期'
  }
  return map[status] || status
}

// 获取状态类型
const getStatusType = (status: string) => {
  const map: Record<string, any> = {
    PENDING: 'warning',
    ACCEPTED: 'success',
    REJECTED: 'danger',
    EXPIRED: 'info'
  }
  return map[status] || 'info'
}

onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.course-gifts-page {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .title {
      font-size: 18px;
      font-weight: 600;
    }
  }

  .search-form {
    margin-bottom: 16px;
  }

  .user-info {
    .info-row {
      line-height: 1.8;
      font-size: 14px;

      &.text-secondary {
        color: #909399;
        font-size: 13px;
      }
    }
  }

  .course-info {
    display: flex;
    gap: 12px;
    align-items: center;

    .course-cover {
      width: 80px;
      height: 60px;
      border-radius: 4px;
      flex-shrink: 0;

      .image-slot {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100%;
        background: #f5f7fa;
        color: #909399;
        font-size: 24px;
      }
    }

    .course-detail {
      flex: 1;

      .course-title {
        font-weight: 500;
        margin-bottom: 4px;
        line-height: 1.4;
      }

      .course-credit {
        font-size: 13px;
        color: #909399;
      }
    }
  }

  .pagination-wrapper {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>



