<template>
  <div class="credit-requests-approval">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span class="card-title">学分申请审批</span>
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
        <el-form-item label="申请教师">
          <el-input v-model="queryForm.keyword" placeholder="教师姓名" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 表格 -->
      <el-table v-loading="loading" :data="tableData" style="width: 100%">
        <el-table-column label="申请教师" width="150">
          <template #default="{ row }">
            <div class="user-cell">
              <el-avatar :src="row.teacher.avatar" :size="32">
                {{ row.teacher.realName?.charAt(0) || row.teacher.nickname?.charAt(0) || '教' }}
              </el-avatar>
              <span class="user-name">{{ row.teacher.realName || row.teacher.nickname }}</span>
            </div>
          </template>
        </el-table-column>
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
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">查看</el-button>
            <el-button
              v-if="row.status === 'PENDING'"
              link
              type="success"
              @click="handleApprove(row)"
            >
              通过
            </el-button>
            <el-button
              v-if="row.status === 'PENDING'"
              link
              type="danger"
              @click="handleReject(row)"
            >
              拒绝
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
        <el-descriptions-item label="申请教师">
          {{ currentRequest.teacher.realName || currentRequest.teacher.nickname }}
        </el-descriptions-item>
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
        <el-button
          v-if="currentRequest?.status === 'PENDING'"
          type="success"
          @click="handleApprove(currentRequest)"
        >
          通过
        </el-button>
        <el-button
          v-if="currentRequest?.status === 'PENDING'"
          type="danger"
          @click="handleReject(currentRequest)"
        >
          拒绝
        </el-button>
      </template>
    </el-dialog>

    <!-- 审批对话框 -->
    <el-dialog v-model="reviewDialogVisible" :title="reviewAction === 'APPROVE' ? '通过申请' : '拒绝申请'" width="500px">
      <el-alert
        v-if="reviewAction === 'APPROVE'"
        title="提示"
        type="success"
        :closable="false"
        show-icon
        style="margin-bottom: 20px"
      >
        通过后将自动为用户分配学分
      </el-alert>
      <el-alert
        v-else
        title="提示"
        type="warning"
        :closable="false"
        show-icon
        style="margin-bottom: 20px"
      >
        拒绝后教师需要重新提交申请
      </el-alert>
      <el-form :model="reviewForm" label-width="100px">
        <el-form-item label="申请教师">
          <el-input :value="currentRequest?.teacher.realName || currentRequest?.teacher.nickname" disabled />
        </el-form-item>
        <el-form-item label="申请对象">
          <el-input :value="currentRequest?.user.realName || currentRequest?.user.nickname" disabled />
        </el-form-item>
        <el-form-item label="申请学分">
          <el-tag type="warning" size="large">+{{ currentRequest?.amount }}</el-tag>
        </el-form-item>
        <el-form-item label="申请理由">
          <el-input :value="currentRequest?.reason" type="textarea" :rows="2" disabled />
        </el-form-item>
        <el-form-item :label="reviewAction === 'APPROVE' ? '审批备注' : '拒绝原因'">
          <el-input
            v-model="reviewForm.reviewRemark"
            type="textarea"
            :rows="3"
            :placeholder="reviewAction === 'APPROVE' ? '请输入审批备注（可选）' : '请输入拒绝原因（必填）'"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="reviewDialogVisible = false">取消</el-button>
        <el-button
          :type="reviewAction === 'APPROVE' ? 'success' : 'danger'"
          :loading="reviewing"
          @click="handleConfirmReview"
        >
          确定{{ reviewAction === 'APPROVE' ? '通过' : '拒绝' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'
import {
  getCreditRequests,
  reviewCreditRequest,
  type CreditRequest,
} from '@/api/credit-request'
import { formatDate } from '@/utils/format'

// 查询表单
const queryForm = reactive({
  status: '',
  keyword: '',
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

// 审批对话框
const reviewDialogVisible = ref(false)
const reviewAction = ref<'APPROVE' | 'REJECT'>('APPROVE')
const reviewing = ref(false)
const reviewForm = reactive({
  reviewRemark: '',
})

// 搜索
const handleSearch = async () => {
  loading.value = true
  try {
    const res = await getCreditRequests({
      page: pagination.page,
      pageSize: pagination.pageSize,
      status: queryForm.status || undefined,
      keyword: queryForm.keyword || undefined,
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
  queryForm.keyword = ''
  pagination.page = 1
  handleSearch()
}

// 查看详情
const handleView = (row: CreditRequest) => {
  currentRequest.value = row
  detailDialogVisible.value = true
}

// 通过申请
const handleApprove = (row: CreditRequest) => {
  currentRequest.value = row
  reviewAction.value = 'APPROVE'
  reviewForm.reviewRemark = ''
  reviewDialogVisible.value = true
  detailDialogVisible.value = false
}

// 拒绝申请
const handleReject = (row: CreditRequest) => {
  currentRequest.value = row
  reviewAction.value = 'REJECT'
  reviewForm.reviewRemark = ''
  reviewDialogVisible.value = true
  detailDialogVisible.value = false
}

// 确认审批
const handleConfirmReview = async () => {
  if (!currentRequest.value) return

  // 如果是拒绝，必须填写原因
  if (reviewAction.value === 'REJECT' && !reviewForm.reviewRemark.trim()) {
    ElMessage.warning('请输入拒绝原因')
    return
  }

  try {
    reviewing.value = true
    await reviewCreditRequest(currentRequest.value.id, {
      action: reviewAction.value,
      remark: reviewForm.reviewRemark || undefined,
    })

    ElMessage.success(reviewAction.value === 'APPROVE' ? '申请已通过，学分已发放' : '申请已拒绝')
    reviewDialogVisible.value = false
    handleSearch()
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败')
  } finally {
    reviewing.value = false
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
.credit-requests-approval {
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

