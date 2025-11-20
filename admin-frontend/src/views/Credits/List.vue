<template>
  <div class="credits-list">
    <!-- 搜索栏 -->
    <el-card shadow="never" class="search-card">
      <el-form :model="queryParams" inline>
        <el-form-item label="学分类型">
          <el-select v-model="queryParams.type" placeholder="全部" clearable style="width: 150px">
            <el-option label="个人次卡" value="PERSONAL" />
            <el-option label="企业次卡" value="ENTERPRISE" />
          </el-select>
        </el-form-item>
        <el-form-item label="学分状态">
          <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 150px">
            <el-option label="有效" value="ACTIVE" />
            <el-option label="已过期" value="EXPIRED" />
            <el-option label="已用完" value="USED_UP" />
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
      <el-button type="primary" :icon="Plus" @click="handleAllocate">分配学分</el-button>
      <el-button type="success" :icon="Document" @click="goToRecords">使用记录</el-button>
    </el-card>

    <!-- 统计卡片 -->
    <el-row :gutter="16" style="margin-bottom: 16px">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-label">总学分账户</div>
          <div class="stat-value">{{ total }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-label">有效学分总数</div>
          <div class="stat-value">{{ totalActive }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-label">已用学分总数</div>
          <div class="stat-value">{{ totalUsed }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-label">剩余学分总数</div>
          <div class="stat-value">{{ totalRemaining }}</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 表格 -->
    <el-card shadow="never">
      <el-table v-loading="loading" :data="tableData">
        <el-table-column prop="user.realName" label="用户姓名" width="120" />
        <el-table-column prop="user.phone" label="手机号" width="130" />
        <el-table-column label="类型" width="120">
          <template #default="{ row }">
            <el-tag :type="row.type === 'PERSONAL' ? 'primary' : 'success'">
              {{ row.type === 'PERSONAL' ? '个人次卡' : '企业次卡' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="total" label="总学分" width="100" align="center" />
        <el-table-column prop="remaining" label="剩余学分" width="100" align="center">
          <template #default="{ row }">
            <span :style="{ color: row.remaining > 0 ? '#67C23A' : '#909399' }">
              {{ row.remaining }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="used" label="已用学分" width="100" align="center" />
        <el-table-column label="使用进度" width="200">
          <template #default="{ row }">
            <el-progress
              :percentage="row.total > 0 ? Math.round((row.used / row.total) * 100) : 0"
              :color="getProgressColor(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.status === 'ACTIVE'" type="success">有效</el-tag>
            <el-tag v-else-if="row.status === 'EXPIRED'" type="warning">已过期</el-tag>
            <el-tag v-else type="info">已用完</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="过期时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.expireDate) }}
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleViewRecords(row)">
              使用记录
            </el-button>
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

    <!-- 分配学分对话框 -->
    <el-dialog v-model="allocateDialogVisible" title="分配学分" width="600px">
      <el-form ref="formRef" :model="allocateForm" :rules="rules" label-width="100px">
        <el-form-item label="选择用户" prop="userId">
          <el-select
            v-model="allocateForm.userId"
            filterable
            remote
            reserve-keyword
            placeholder="请输入手机号或姓名搜索用户"
            :remote-method="searchUsers"
            :loading="userSearchLoading"
            style="width: 100%"
            @change="handleUserSelect"
          >
            <el-option
              v-for="user in userOptions"
              :key="user.id"
              :label="`${user.realName || user.nickname || '未命名'} (${user.phone})`"
              :value="user.id"
            >
              <div style="display: flex; justify-content: space-between; align-items: center">
                <span>{{ user.realName || user.nickname || '未命名' }}</span>
                <span style="font-size: 12px; color: #999">{{ user.phone }}</span>
              </div>
            </el-option>
          </el-select>
          <div v-if="selectedUser" class="user-info">
            <div class="info-item">
              <span class="label">姓名：</span>
              <span>{{ selectedUser.realName || selectedUser.nickname || '未命名' }}</span>
            </div>
            <div class="info-item">
              <span class="label">手机号：</span>
              <span>{{ selectedUser.phone }}</span>
            </div>
            <div v-if="selectedUser.organization" class="info-item">
              <span class="label">企业：</span>
              <span>{{ selectedUser.organization.name }}</span>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="学分类型" prop="type">
          <el-radio-group v-model="allocateForm.type">
            <el-radio label="PERSONAL">个人次卡</el-radio>
            <el-radio label="ENTERPRISE">企业次卡</el-radio>
          </el-radio-group>
          <div class="form-tip">企业次卡仅限企业员工使用</div>
        </el-form-item>
        <el-form-item label="学分数量" prop="amount">
          <el-input-number
            v-model="allocateForm.amount"
            :min="1"
            :max="1000"
            placeholder="请输入学分数量"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="有效天数" prop="validDays">
          <el-input-number
            v-model="allocateForm.validDays"
            :min="1"
            :max="3650"
            placeholder="请输入有效天数"
            style="width: 100%"
          />
          <div class="form-tip">学分将在指定天数后过期</div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="allocateDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSaveAllocate">
          确定分配
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { Search, Refresh, Plus, Document } from '@element-plus/icons-vue'
import { getCreditList, allocateCredit } from '@/api/credit'
import { getUserList } from '@/api/user'
import type { Credit, User } from '@/types/models'
import { formatDate } from '@/utils/format'
import { useTable } from '@/composables/useTable'

const router = useRouter()

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
} = useTable<Credit>({
  fetchApi: getCreditList,
  immediate: false,
})

// 统计数据
const totalActive = computed(() => {
  return tableData.value
    .filter(item => item.status === 'ACTIVE')
    .reduce((sum, item) => sum + item.total, 0)
})

const totalUsed = computed(() => {
  return tableData.value.reduce((sum, item) => sum + item.used, 0)
})

const totalRemaining = computed(() => {
  return tableData.value.reduce((sum, item) => sum + item.remaining, 0)
})

// 进度条颜色
const getProgressColor = (row: Credit) => {
  const percentage = row.total > 0 ? (row.used / row.total) * 100 : 0
  if (percentage >= 80) return '#F56C6C'
  if (percentage >= 50) return '#E6A23C'
  return '#67C23A'
}

// 分配学分
const allocateDialogVisible = ref(false)
const formRef = ref<FormInstance>()
const submitting = ref(false)

const allocateForm = reactive({
  userId: '',
  type: 'PERSONAL' as 'PERSONAL' | 'ENTERPRISE',
  amount: 10,
  validDays: 365,
})

const rules: FormRules = {
  userId: [{ required: true, message: '请输入用户ID', trigger: 'blur' }],
  type: [{ required: true, message: '请选择学分类型', trigger: 'change' }],
  amount: [{ required: true, message: '请输入学分数量', trigger: 'blur' }],
  validDays: [{ required: true, message: '请输入有效天数', trigger: 'blur' }],
}

// 用户搜索
const userOptions = ref<User[]>([])
const userSearchLoading = ref(false)
const selectedUser = ref<User | null>(null)

const searchUsers = async (query: string) => {
  if (!query) {
    userOptions.value = []
    return
  }

  try {
    userSearchLoading.value = true
    const result = await getUserList({
      keyword: query,
      page: 1,
      pageSize: 20,
    })
    userOptions.value = result.items
  } catch (error: any) {
    ElMessage.error(error.message || '搜索用户失败')
  } finally {
    userSearchLoading.value = false
  }
}

const handleUserSelect = (userId: string) => {
  selectedUser.value = userOptions.value.find(u => u.id === userId) || null
}

const handleAllocate = () => {
  Object.assign(allocateForm, {
    userId: '',
    type: 'PERSONAL',
    amount: 10,
    validDays: 365,
  })
  selectedUser.value = null
  userOptions.value = []
  allocateDialogVisible.value = true
}

const handleSaveAllocate = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitting.value = true
    await allocateCredit(allocateForm)
    ElMessage.success('学分分配成功')
    allocateDialogVisible.value = false
    handleSearch()
  } catch (error: any) {
    if (error !== false) {
      ElMessage.error(error.message || '分配失败')
    }
  } finally {
    submitting.value = false
  }
}

// 查看使用记录
const handleViewRecords = (row: Credit) => {
  router.push(`/credits/records?userId=${row.userId}`)
}

// 跳转使用记录
const goToRecords = () => {
  router.push('/credits/records')
}

// 初始加载
handleSearch()
</script>

<style scoped lang="scss">
.credits-list {
  .search-card,
  .toolbar-card {
    margin-bottom: 16px;
  }

  .stat-card {
    text-align: center;
    
    .stat-label {
      font-size: 14px;
      color: var(--el-text-color-secondary);
      margin-bottom: 8px;
    }

    .stat-value {
      font-size: 28px;
      font-weight: bold;
      color: var(--el-color-primary);
    }
  }

  .form-tip {
    color: var(--el-text-color-secondary);
    font-size: 12px;
    line-height: 1.5;
    margin-top: 4px;
  }

  .user-info {
    margin-top: 12px;
    padding: 12px;
    background: #f5f7fa;
    border-radius: 4px;

    .info-item {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
      font-size: 13px;

      &:last-child {
        margin-bottom: 0;
      }

      .label {
        color: #606266;
        font-weight: 500;
        width: 60px;
      }

      span:last-child {
        color: #303133;
      }
    }
  }

  :deep(.el-pagination) {
    margin-top: 16px;
    justify-content: flex-end;
  }
}
</style>

