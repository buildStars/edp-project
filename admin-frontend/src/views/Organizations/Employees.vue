<template>
  <div class="app-container">
    <!-- 页面头部 -->
    <el-page-header @back="handleBack">
      <template #content>
        <div class="page-header-content">
          <el-icon :size="24"><OfficeBuilding /></el-icon>
          <span class="org-name">{{ organizationName }}</span>
          <el-tag type="info" size="small">员工管理</el-tag>
        </div>
      </template>
    </el-page-header>

    <el-divider />

    <!-- 统计卡片 -->
    <el-row :gutter="16" style="margin-bottom: 20px">
      <el-col :span="6">
        <el-card shadow="hover">
          <el-statistic title="总员工数" :value="statistics.totalEmployees">
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <el-statistic title="可上课人数" :value="statistics.maxStudents">
            <template #prefix>
              <el-icon><Reading /></el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <el-statistic title="总学分" :value="statistics.totalCredits">
            <template #prefix>
              <el-icon><Trophy /></el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <el-statistic title="已用学分" :value="statistics.usedCredits">
            <template #prefix>
              <el-icon><DocumentChecked /></el-icon>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
    </el-row>

    <!-- 搜索和操作 -->
    <el-card shadow="never" style="margin-bottom: 16px">
      <el-form :inline="true" :model="queryParams">
        <el-form-item label="关键词">
          <el-input
            v-model="queryParams.keyword"
            placeholder="姓名/手机号"
            clearable
            style="width: 250px"
            @keyup.enter="loadList"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadList">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
          <el-button type="success" @click="handleAddEmployee">
            <el-icon><Plus /></el-icon>
            添加员工
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 员工列表 -->
    <el-card shadow="never">
      <el-table v-loading="loading" :data="list" stripe>
        <el-table-column label="员工信息" min-width="200">
          <template #default="{ row }">
            <div class="user-info">
              <el-avatar :size="40" :src="row.avatar">
                {{ row.realName?.[0] || row.nickname?.[0] || '用' }}
              </el-avatar>
              <div class="user-details">
                <div class="user-name">
                  {{ row.realName || row.nickname || '未命名' }}
                </div>
                <div class="user-phone">{{ row.phone }}</div>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="邮箱" prop="email" min-width="180" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.email || '-' }}
          </template>
        </el-table-column>

        <el-table-column label="公司/职位" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <span v-if="row.company || row.position">
              {{ row.company }} {{ row.position ? `/ ${row.position}` : '' }}
            </span>
            <span v-else style="color: #999">-</span>
          </template>
        </el-table-column>

        <el-table-column label="角色" width="100">
          <template #default="{ row }">
            <el-tag :type="getRoleType(row.role)">
              {{ getRoleLabel(row.role) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="学分" width="100" align="center">
          <template #default="{ row }">
            <div v-if="row.credit">
              <div style="font-weight: 600; color: #409eff">
                {{ row.credit.balance }}
              </div>
              <div style="font-size: 12px; color: #999">
                总: {{ row.credit.total }}
              </div>
            </div>
            <span v-else style="color: #999">0</span>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'ACTIVE' ? 'success' : 'danger'">
              {{ row.status === 'ACTIVE' ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="加入时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleViewUser(row)">
              <el-icon><View /></el-icon>
              详情
            </el-button>
            <el-button link type="primary" @click="handleManageCredits(row)">
              <el-icon><Coin /></el-icon>
              学分
            </el-button>
            <el-popconfirm
              title="确定要将该员工从企业中移除吗？"
              @confirm="handleRemoveEmployee(row)"
            >
              <template #reference>
                <el-button link type="danger">
                  <el-icon><Delete /></el-icon>
                  移除
                </el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="loadList"
          @size-change="loadList"
        />
      </div>
    </el-card>

    <!-- 添加员工对话框 -->
    <el-dialog
      v-model="addDialogVisible"
      title="添加员工"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="addFormRef"
        :model="addForm"
        :rules="addFormRules"
        label-width="100px"
      >
        <el-form-item label="选择用户" prop="userId">
          <el-select
            v-model="addForm.userId"
            filterable
            remote
            reserve-keyword
            clearable
            placeholder="输入手机号或姓名搜索"
            :remote-method="searchUsers"
            :loading="userSearchLoading"
            style="width: 100%"
          >
            <el-option
              v-for="user in userOptions"
              :key="user.id"
              :label="`${user.realName || user.nickname} (${user.phone})`"
              :value="user.id"
            >
              <div class="user-option">
                <el-avatar :size="32" :src="user.avatar">
                  {{ user.realName?.[0] || user.nickname?.[0] }}
                </el-avatar>
                <div class="user-option-info">
                  <div>{{ user.realName || user.nickname }}</div>
                  <div style="font-size: 12px; color: #999">{{ user.phone }}</div>
                </div>
              </div>
            </el-option>
          </el-select>
        </el-form-item>

        <el-alert
          type="info"
          :closable="false"
          show-icon
          style="margin-bottom: 16px"
        >
          <template #title>
            添加员工后，该用户将绑定到企业账户，可以使用企业学分报名课程
          </template>
        </el-alert>
      </el-form>

      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleConfirmAdd">
          确定添加
        </el-button>
      </template>
    </el-dialog>

    <!-- 学分管理对话框 -->
    <el-dialog
      v-model="creditDialogVisible"
      title="学分管理"
      width="500px"
      :close-on-click-modal="false"
    >
      <div v-if="currentUser" class="credit-dialog-content">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="姓名">
            {{ currentUser.realName || currentUser.nickname }}
          </el-descriptions-item>
          <el-descriptions-item label="手机号">
            {{ currentUser.phone }}
          </el-descriptions-item>
          <el-descriptions-item label="当前学分">
            <el-tag type="success" size="large">
              {{ currentUser.credit?.balance || 0 }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="总学分">
            {{ currentUser.credit?.total || 0 }}
          </el-descriptions-item>
          <el-descriptions-item label="已用学分">
            {{ currentUser.credit?.used || 0 }}
          </el-descriptions-item>
        </el-descriptions>

        <el-divider />

        <el-form :model="creditForm" label-width="100px">
          <el-form-item label="操作类型">
            <el-radio-group v-model="creditForm.type">
              <el-radio-button label="ADD">增加学分</el-radio-button>
              <el-radio-button label="DEDUCT">扣除学分</el-radio-button>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="学分数量">
            <el-input-number
              v-model="creditForm.amount"
              :min="1"
              :max="1000"
              :step="1"
              style="width: 100%"
            />
          </el-form-item>

          <el-form-item label="备注">
            <el-input
              v-model="creditForm.remark"
              type="textarea"
              :rows="3"
              placeholder="请输入操作备注"
            />
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <el-button @click="creditDialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          :loading="submitting"
          @click="handleConfirmCreditOperation"
        >
          确认操作
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  OfficeBuilding,
  User,
  Reading,
  Trophy,
  DocumentChecked,
  Search,
  Refresh,
  Plus,
  View,
  Coin,
  Delete,
} from '@element-plus/icons-vue'
import { formatDate } from '@/utils/format'
import { getUserList } from '@/api/user'
import * as organizationApi from '@/api/organization'
import { addCorporateCredit, deductCorporateCredit } from '@/api/credit'

const route = useRoute()
const router = useRouter()

// 企业ID
const organizationId = computed(() => route.params.id as string)
const organizationName = ref('')

// 统计数据
const statistics = ref({
  totalEmployees: 0,
  maxStudents: 0,
  totalCredits: 0,
  usedCredits: 0,
})

// 查询参数
const queryParams = reactive({
  page: 1,
  pageSize: 10,
  keyword: '',
})

// 列表数据
const loading = ref(false)
const list = ref<any[]>([])
const total = ref(0)

// 添加员工
const addDialogVisible = ref(false)
const addFormRef = ref<FormInstance>()
const addForm = reactive({
  userId: '',
})
const addFormRules: FormRules = {
  userId: [{ required: true, message: '请选择用户', trigger: 'change' }],
}
const userSearchLoading = ref(false)
const userOptions = ref<any[]>([])
const submitting = ref(false)

// 学分管理
const creditDialogVisible = ref(false)
const currentUser = ref<any>(null)
const creditForm = reactive({
  type: 'ADD' as 'ADD' | 'DEDUCT',
  amount: 1,
  remark: '',
})

/**
 * 返回企业列表
 */
const handleBack = () => {
  router.push('/organizations/list')
}

/**
 * 加载企业统计
 */
const loadStatistics = async () => {
  try {
    const data = await organizationApi.getOrganizationStatistics(organizationId.value) as any
    
    statistics.value = {
      totalEmployees: data.totalUsers || 0,
      maxStudents: data.maxStudents || 0,
      totalCredits: data.totalCredits || 0,
      usedCredits: data.usedCredits || 0,
    }
    
    organizationName.value = data.name || ''
  } catch (error: any) {
    console.error('加载统计失败:', error)
  }
}

/**
 * 加载员工列表
 */
const loadList = async () => {
  loading.value = true
  try {
    const data = await organizationApi.getOrganizationUsers(organizationId.value, queryParams) as any
    
    list.value = data.items || []
    total.value = data.total || 0
  } catch (error: any) {
    ElMessage.error(error.message || '加载失败')
  } finally {
    loading.value = false
  }
}

/**
 * 重置搜索
 */
const handleReset = () => {
  queryParams.page = 1
  queryParams.keyword = ''
  loadList()
}

/**
 * 添加员工
 */
const handleAddEmployee = () => {
  addDialogVisible.value = true
  addForm.userId = ''
  userOptions.value = []
}

/**
 * 搜索用户（仅搜索学员角色，排除当前登录用户和已在企业的用户）
 */
const searchUsers = async (query: string) => {
  if (!query) {
    userOptions.value = []
    return
  }

  userSearchLoading.value = true
  try {
    const data = await getUserList({
      keyword: query,
      role: 'STUDENT', // 只搜索学员
      page: 1,
      pageSize: 20,
    })
    
    // 获取当前登录用户ID
    const currentUserId = localStorage.getItem('userId')
    
    // 过滤掉：1. 已经在本企业的用户  2. 当前登录用户自己
    const currentEmployeeIds = new Set(list.value.map((emp: any) => emp.id))
    userOptions.value = (data.items || []).filter((user: any) => 
      !currentEmployeeIds.has(user.id) && user.id !== currentUserId
    )
  } catch (error: any) {
    console.error('搜索用户失败:', error)
  } finally {
    userSearchLoading.value = false
  }
}

/**
 * 确认添加员工
 */
const handleConfirmAdd = async () => {
  if (!addFormRef.value) return

  await addFormRef.value.validate(async (valid) => {
    if (!valid) return

    try {
      submitting.value = true
      
      await organizationApi.addOrganizationUser(organizationId.value, addForm.userId)

      ElMessage.success('添加员工成功')
      addDialogVisible.value = false
      loadList()
      loadStatistics()
    } catch (error: any) {
      ElMessage.error(error.message || '添加失败')
    } finally {
      submitting.value = false
    }
  })
}

/**
 * 移除员工
 */
const handleRemoveEmployee = async (row: any) => {
  try {
    await organizationApi.removeOrganizationUser(organizationId.value, row.id)

    ElMessage.success('移除员工成功')
    loadList()
    loadStatistics()
  } catch (error: any) {
    ElMessage.error(error.message || '移除失败')
  }
}

/**
 * 查看用户详情
 */
const handleViewUser = (row: any) => {
  router.push(`/users/detail/${row.id}`)
}

/**
 * 管理学分
 */
const handleManageCredits = (row: any) => {
  currentUser.value = row
  creditForm.type = 'ADD'
  creditForm.amount = 1
  creditForm.remark = ''
  creditDialogVisible.value = true
}

/**
 * 确认学分操作
 */
const handleConfirmCreditOperation = async () => {
  if (!currentUser.value) return

  try {
    await ElMessageBox.confirm(
      `确定要${creditForm.type === 'ADD' ? '增加' : '扣除'} ${creditForm.amount} 学分吗？`,
      '确认操作',
      { type: 'warning' }
    )

    submitting.value = true

    if (creditForm.type === 'ADD') {
      await addCorporateCredit(currentUser.value.id, {
        amount: creditForm.amount,
        remark: creditForm.remark,
      })
    } else {
      await deductCorporateCredit(currentUser.value.id, {
        amount: creditForm.amount,
        remark: creditForm.remark,
      })
    }

    ElMessage.success('学分操作成功')
    creditDialogVisible.value = false
    loadList()
    loadStatistics()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '操作失败')
    }
  } finally {
    submitting.value = false
  }
}

/**
 * 获取角色类型
 */
const getRoleType = (role: string) => {
  const map: Record<string, any> = {
    STUDENT: '',
    ADVISOR: 'success',
    TEACHER: 'warning',
    STAFF: 'info',
    ADMIN: 'danger',
  }
  return map[role] || ''
}

/**
 * 获取角色标签
 */
const getRoleLabel = (role: string) => {
  const map: Record<string, string> = {
    STUDENT: '学员',
    ADVISOR: '顾问',
    TEACHER: '教师',
    STAFF: '教务',
    ADMIN: '管理员',
  }
  return map[role] || role
}

// 初始化
onMounted(() => {
  loadStatistics()
  loadList()
})
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;
}

.page-header-content {
  display: flex;
  align-items: center;
  gap: 12px;

  .org-name {
    font-size: 18px;
    font-weight: 600;
    color: #333;
  }
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;

  .user-details {
    flex: 1;

    .user-name {
      font-size: 14px;
      font-weight: 500;
      color: #333;
      margin-bottom: 4px;
    }

    .user-phone {
      font-size: 12px;
      color: #999;
    }
  }
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.user-option {
  display: flex;
  align-items: center;
  gap: 12px;

  .user-option-info {
    flex: 1;
  }
}

.credit-dialog-content {
  :deep(.el-descriptions__body) {
    background: #fff;
  }
}
</style>
