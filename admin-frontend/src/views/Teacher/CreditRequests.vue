<template>
  <div class="credit-requests">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span class="card-title">我的学分申请</span>
          <el-button type="primary" :icon="Plus" @click="router.push('/users/list')">
            新建申请
          </el-button>
        </div>
      </template>

      <!-- 筛选栏 -->
      <el-form :model="queryForm" :inline="true">
        <el-form-item label="状态">
          <el-select v-model="queryForm.status" placeholder="全部状态" clearable style="width: 150px">
            <el-option label="待审批" value="PENDING" />
            <el-option label="已通过" value="APPROVED" />
            <el-option label="已拒绝" value="REJECTED" />
            <el-option label="已取消" value="CANCELLED" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 表格 -->
      <el-table v-loading="loading" :data="tableData" style="width: 100%">
        <el-table-column label="申请对象" width="150">
          <template #default="{ row }">
            <div class="user-cell">
              <el-avatar :src="row.user.avatar" :size="32">
                {{ row.user.realName?.charAt(0) || row.user.nickname?.charAt(0) || '用' }}
              </el-avatar>
              <span class="user-name">{{ row.user.realName || row.user.nickname }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="申请学分" width="100" align="center">
          <template #default="{ row }">
            <el-tag type="warning" size="large">+{{ row.amount }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="申请理由" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.reason }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="审批人" width="120">
          <template #default="{ row }">
            <span v-if="row.reviewer">{{ row.reviewer.realName || row.reviewer.nickname }}</span>
            <span v-else class="text-secondary">-</span>
          </template>
        </el-table-column>
        <el-table-column label="审批备注" width="150" show-overflow-tooltip>
          <template #default="{ row }">
            <span v-if="row.reviewRemark">{{ row.reviewRemark }}</span>
            <span v-else class="text-secondary">-</span>
          </template>
        </el-table-column>
        <el-table-column label="申请时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">查看</el-button>
            <el-button
              v-if="row.status === 'PENDING'"
              link
              type="danger"
              @click="handleCancel(row)"
            >
              取消
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSearch"
        @current-change="handleSearch"
      />
    </el-card>

    <!-- 详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="申请详情" width="600px">
      <el-descriptions :column="1" border v-if="currentRequest">
        <el-descriptions-item label="申请对象">
          {{ currentRequest.user.realName || currentRequest.user.nickname }}
        </el-descriptions-item>
        <el-descriptions-item label="申请学分">
          <el-tag type="warning" size="large">+{{ currentRequest.amount }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="申请理由">
          {{ currentRequest.reason }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(currentRequest.status)">
            {{ getStatusLabel(currentRequest.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="申请时间">
          {{ formatDate(currentRequest.createdAt) }}
        </el-descriptions-item>
        <el-descriptions-item v-if="currentRequest.reviewer" label="审批人">
          {{ currentRequest.reviewer.realName || currentRequest.reviewer.nickname }}
        </el-descriptions-item>
        <el-descriptions-item v-if="currentRequest.reviewTime" label="审批时间">
          {{ formatDate(currentRequest.reviewTime) }}
        </el-descriptions-item>
        <el-descriptions-item v-if="currentRequest.reviewRemark" label="审批备注">
          {{ currentRequest.reviewRemark }}
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus } from '@element-plus/icons-vue'
import {
  getCreditRequests,
  cancelCreditRequest,
  type CreditRequest,
} from '@/api/credit-request'
import { formatDate } from '@/utils/format'

const router = useRouter()

// 查询表单
const queryForm = reactive({
  status: '',
})

// 表格数据
const loading = ref(false)
const tableData = ref<CreditRequest[]>([])
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0,
})

// 详情对话框
const detailDialogVisible = ref(false)
const currentRequest = ref<CreditRequest | null>(null)

// 搜索
const handleSearch = async () => {
  loading.value = true
  try {
    const res = await getCreditRequests({
      page: pagination.page,
      pageSize: pagination.pageSize,
      status: queryForm.status || undefined,
    })
    tableData.value = res.items || []
    pagination.total = res.total || 0
  } catch (error: any) {
    ElMessage.error(error.message || '加载失败')
  } finally {
    loading.value = false
  }
}

// 重置
const handleReset = () => {
  queryForm.status = ''
  pagination.page = 1
  handleSearch()
}

// 查看详情
const handleView = (row: CreditRequest) => {
  currentRequest.value = row
  detailDialogVisible.value = true
}

// 取消申请
const handleCancel = async (row: CreditRequest) => {
  try {
    await ElMessageBox.confirm('确定要取消该学分申请吗？', '提示', {
      type: 'warning',
    })

    await cancelCreditRequest(row.id)
    ElMessage.success('取消成功')
    handleSearch()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '取消失败')
    }
  }
}

// 状态类型
const getStatusType = (status: string) => {
  const typeMap: Record<string, any> = {
    PENDING: 'warning',
    APPROVED: 'success',
    REJECTED: 'danger',
    CANCELLED: 'info',
  }
  return typeMap[status] || ''
}

// 状态标签
const getStatusLabel = (status: string) => {
  const labelMap: Record<string, string> = {
    PENDING: '待审批',
    APPROVED: '已通过',
    REJECTED: '已拒绝',
    CANCELLED: '已取消',
  }
  return labelMap[status] || status
}

onMounted(() => {
  handleSearch()
})
</script>

<style scoped lang="scss">
.credit-requests {
  padding: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .card-title {
      font-size: 18px;
      font-weight: 500;
    }
  }

  .user-cell {
    display: flex;
    align-items: center;
    gap: 8px;

    .user-name {
      font-size: 14px;
    }
  }

  .text-secondary {
    color: #909399;
  }

  :deep(.el-table) {
    margin: 20px 0;
  }
}
</style>













