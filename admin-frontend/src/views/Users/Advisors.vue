<template>
  <div class="advisors-management">
    <el-page-header title="返回" @back="handleBack">
      <template #content>
        <span class="page-title">课程顾问管理</span>
      </template>
    </el-page-header>

    <!-- 统计卡片 -->
    <el-row :gutter="16" style="margin-top: 16px; margin-bottom: 16px">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-label">课程顾问总数</div>
          <div class="stat-value">{{ total }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-label">在职顾问</div>
          <div class="stat-value active">{{ activeAdvisors }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-label">管理学员总数</div>
          <div class="stat-value">{{ totalStudents }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-label">平均学员数</div>
          <div class="stat-value">{{ avgStudents }}</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 搜索栏 -->
    <el-card shadow="never" class="search-card">
      <el-form :model="queryParams" inline>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 150px">
            <el-option label="在职" value="ACTIVE" />
            <el-option label="离职" value="INACTIVE" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input
            v-model="queryParams.keyword"
            placeholder="姓名/手机号"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格 -->
    <el-card shadow="never">
      <el-table v-loading="loading" :data="tableData">
        <el-table-column label="头像" width="80">
          <template #default="{ row }">
            <el-avatar :src="row.avatar" :size="50">
              {{ row.realName?.charAt(0) || '顾' }}
            </el-avatar>
          </template>
        </el-table-column>
        <el-table-column prop="realName" label="姓名" width="120" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="email" label="邮箱" width="180" show-overflow-tooltip />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'ACTIVE' ? 'success' : 'danger'">
              {{ row.status === 'ACTIVE' ? '在职' : '离职' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="管理学员" width="120" align="center">
          <template #default="{ row }">
            <el-link type="primary" @click="handleViewStudents(row)">
              {{ row._count?.students || 0 }} 人
            </el-link>
          </template>
        </el-table-column>
        <el-table-column prop="company" label="公司" width="150" show-overflow-tooltip />
        <el-table-column prop="position" label="职位" width="120" />
        <el-table-column label="入职时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">查看</el-button>
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="primary" @click="handleAssignStudents(row)">
              分配学员
            </el-button>
            <el-button
              link
              :type="row.status === 'ACTIVE' ? 'warning' : 'success'"
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 'ACTIVE' ? '离职' : '在职' }}
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

    <!-- 编辑对话框 -->
    <el-dialog v-model="editDialogVisible" title="编辑顾问信息" width="600px">
      <el-form ref="formRef" :model="editForm" :rules="rules" label-width="100px">
        <el-form-item label="姓名" prop="realName">
          <el-input v-model="editForm.realName" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="editForm.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="公司">
          <el-input v-model="editForm.company" placeholder="请输入公司" />
        </el-form-item>
        <el-form-item label="职位">
          <el-input v-model="editForm.position" placeholder="请输入职位" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>

    <!-- 分配学员对话框 -->
    <el-dialog v-model="assignDialogVisible" title="分配学员" width="700px">
      <div class="assign-dialog">
        <div class="advisor-info">
          <el-avatar :src="currentAdvisor.avatar" :size="60">
            {{ currentAdvisor.realName?.charAt(0) }}
          </el-avatar>
          <div class="info">
            <div class="name">{{ currentAdvisor.realName }}</div>
            <div class="detail">当前管理 {{ currentAdvisor._count?.students || 0 }} 位学员</div>
          </div>
        </div>

        <el-divider />

        <!-- 学员搜索 -->
        <el-input
          v-model="studentSearchKeyword"
          placeholder="搜索学员（姓名/手机号）"
          clearable
          style="margin-bottom: 16px"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>

        <!-- 可选学员列表 -->
        <div class="student-list">
          <el-checkbox-group v-model="selectedStudentIds">
            <div
              v-for="student in filteredStudents"
              :key="student.id"
              class="student-item"
            >
              <el-checkbox :label="student.id">
                <div class="student-info">
                  <el-avatar :src="student.avatar" :size="40">
                    {{ student.realName?.charAt(0) || '学' }}
                  </el-avatar>
                  <div class="info">
                    <div class="name">{{ student.realName }}</div>
                    <div class="phone">{{ student.phone }}</div>
                  </div>
                </div>
              </el-checkbox>
            </div>
          </el-checkbox-group>
        </div>
      </div>
      <template #footer>
        <el-button @click="assignDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSaveAssign">
          确定分配 ({{ selectedStudentIds.length }})
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'
import { getUserList, updateUser, assignAdvisor } from '@/api/user'
import type { User } from '@/types/models'
import { formatDate } from '@/utils/format'
import { useTable } from '@/composables/useTable'
import { validatePhone, validateEmail } from '@/utils/validate'

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
} = useTable<User>({
  fetchApi: (params) => getUserList({ ...params, role: 'ADVISOR' }),
  immediate: false,
})

// 统计数据
const activeAdvisors = computed(() => {
  return tableData.value.filter(item => item.status === 'ACTIVE').length
})

const totalStudents = computed(() => {
  return tableData.value.reduce((sum, item) => sum + ((item as any)._count?.students || 0), 0)
})

const avgStudents = computed(() => {
  const active = activeAdvisors.value
  return active > 0 ? Math.round(totalStudents.value / active) : 0
})

// 编辑顾问
const editDialogVisible = ref(false)
const formRef = ref<FormInstance>()
const submitting = ref(false)

const editForm = reactive({
  id: '',
  realName: '',
  phone: '',
  email: '',
  company: '',
  position: '',
})

const rules: FormRules = {
  realName: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [{ validator: validatePhone as any, trigger: 'blur' }],
  email: [{ validator: validateEmail as any, trigger: 'blur' }],
}

const handleEdit = (row: User) => {
  Object.assign(editForm, {
    id: row.id,
    realName: row.realName || '',
    phone: row.phone || '',
    email: row.email || '',
    company: row.company || '',
    position: row.position || '',
  })
  editDialogVisible.value = true
}

const handleSave = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitting.value = true

    const { id, ...data } = editForm
    await updateUser(id, data)
    ElMessage.success('保存成功')
    editDialogVisible.value = false
    handleSearch()
  } catch (error: any) {
    if (error !== false) {
      ElMessage.error(error.message || '保存失败')
    }
  } finally {
    submitting.value = false
  }
}

// 分配学员
const assignDialogVisible = ref(false)
const currentAdvisor = reactive<any>({})
const availableStudents = ref<User[]>([])
const selectedStudentIds = ref<string[]>([])
const studentSearchKeyword = ref('')

const filteredStudents = computed(() => {
  if (!studentSearchKeyword.value) return availableStudents.value
  
  const keyword = studentSearchKeyword.value.toLowerCase()
  return availableStudents.value.filter(student => 
    student.realName?.toLowerCase().includes(keyword) ||
    student.phone?.includes(keyword)
  )
})

const handleAssignStudents = async (row: User) => {
  Object.assign(currentAdvisor, row)
  selectedStudentIds.value = []
  
  // 加载未分配顾问的学员
  try {
    const res = await getUserList({ role: 'STUDENT', pageSize: 1000 })
    availableStudents.value = res.items.filter(s => !s.advisorId)
    assignDialogVisible.value = true
  } catch (error: any) {
    ElMessage.error(error.message || '加载学员列表失败')
  }
}

const handleSaveAssign = async () => {
  if (selectedStudentIds.value.length === 0) {
    ElMessage.warning('请选择要分配的学员')
    return
  }

  try {
    submitting.value = true
    
    // 批量分配
    await Promise.all(
      selectedStudentIds.value.map(studentId =>
        assignAdvisor(studentId, currentAdvisor.id)
      )
    )
    
    ElMessage.success(`成功分配 ${selectedStudentIds.value.length} 位学员`)
    assignDialogVisible.value = false
    handleSearch()
  } catch (error: any) {
    ElMessage.error(error.message || '分配失败')
  } finally {
    submitting.value = false
  }
}

// 查看详情
const handleView = (row: User) => {
  router.push(`/users/detail?id=${row.id}`)
}

// 查看管理的学员
const handleViewStudents = (row: User) => {
  router.push(`/users/list?advisorId=${row.id}`)
}

// 切换状态
const handleToggleStatus = async (row: User) => {
  const newStatus = row.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
  const action = newStatus === 'ACTIVE' ? '设为在职' : '设为离职'

  try {
    await ElMessageBox.confirm(`确定要${action}顾问"${row.realName}"吗？`, '提示', {
      type: 'warning',
    })
    await updateUser(row.id, { status: newStatus })
    ElMessage.success(`${action}成功`)
    handleSearch()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || `${action}失败`)
    }
  }
}

// 返回
const handleBack = () => {
  router.back()
}

// 初始加载
handleSearch()
</script>

<style scoped lang="scss">
.advisors-management {
  .page-title {
    font-size: 16px;
    font-weight: 500;
  }

  .stat-card {
    text-align: center;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      transform: translateY(-4px);
    }
    
    .stat-label {
      font-size: 14px;
      color: var(--el-text-color-secondary);
      margin-bottom: 8px;
    }

    .stat-value {
      font-size: 28px;
      font-weight: bold;
      color: var(--el-color-primary);

      &.active {
        color: var(--el-color-success);
      }
    }
  }

  .search-card {
    margin-bottom: 16px;
  }

  :deep(.el-pagination) {
    margin-top: 16px;
    justify-content: flex-end;
  }

  .assign-dialog {
    .advisor-info {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      background: var(--el-fill-color-light);
      border-radius: 8px;

      .info {
        flex: 1;

        .name {
          font-size: 16px;
          font-weight: 500;
          margin-bottom: 4px;
        }

        .detail {
          font-size: 14px;
          color: var(--el-text-color-secondary);
        }
      }
    }

    .student-list {
      max-height: 400px;
      overflow-y: auto;

      .student-item {
        padding: 8px;
        border-bottom: 1px solid var(--el-border-color-lighter);

        &:last-child {
          border-bottom: none;
        }

        :deep(.el-checkbox) {
          width: 100%;

          .el-checkbox__label {
            width: 100%;
          }
        }

        .student-info {
          display: flex;
          align-items: center;
          gap: 12px;

          .info {
            flex: 1;

            .name {
              font-size: 14px;
              margin-bottom: 4px;
            }

            .phone {
              font-size: 12px;
              color: var(--el-text-color-secondary);
            }
          }
        }
      }
    }
  }
}
</style>
