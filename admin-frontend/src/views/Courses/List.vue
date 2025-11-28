<template>
  <div class="courses-list">
    <!-- 搜索栏 -->
    <el-card shadow="never" class="search-card">
      <el-form :model="queryParams" inline>
        <el-form-item label="课程分类">
          <el-select v-model="queryParams.category" placeholder="全部" clearable style="width: 150px">
            <el-option label="加速课堂" value="ACCELERATE" />
            <el-option label="大师课堂" value="MASTER" />
            <el-option label="赋能课堂" value="EMPOWER" />
          </el-select>
        </el-form-item>
        <el-form-item label="课程状态">
          <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 150px">
            <el-option label="草稿" value="DRAFT" />
            <el-option label="已发布" value="PUBLISHED" />
            <el-option label="已归档" value="ARCHIVED" />
          </el-select>
        </el-form-item>
        <el-form-item label="报名状态">
          <el-select v-model="queryParams.enrollStatus" placeholder="全部" clearable style="width: 150px">
            <el-option label="报名中" value="OPEN" />
            <el-option label="已截止" value="CLOSED" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input
            v-model="queryParams.keyword"
            placeholder="请输入课程标题或讲师"
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

    <!-- 操作栏 -->
    <el-card shadow="never" class="toolbar-card">
      <el-button v-permission="'courses:create'" type="primary" :icon="Plus" @click="handleAdd">
        新增课程
      </el-button>
      <el-button
        v-permission="'courses:delete'"
        type="danger"
        :icon="Delete"
        :disabled="selectedIds.length === 0"
        @click="handleBatchDelete"
      >
        批量删除
      </el-button>
      <el-button v-permission="'courses:approve'" :icon="Document" @click="goToApprove">
        待审批课程
      </el-button>
    </el-card>

    <!-- 表格 -->
    <el-card shadow="never">
      <el-table
        v-loading="loading"
        :data="tableData"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column label="封面" width="120">
          <template #default="{ row }">
            <el-image
              v-if="row.coverImage"
              :src="row.coverImage"
              fit="cover"
              style="width: 100px; height: 60px; border-radius: 4px"
              :preview-src-list="[row.coverImage]"
            />
            <span v-else class="text-secondary">暂无图片</span>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="课程标题" min-width="200" show-overflow-tooltip />
        <el-table-column label="分类" width="100">
          <template #default="{ row }">
            <el-tag :type="getCategoryType(row.category)">
              {{ getCategoryLabel(row.category) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="teacherName" label="讲师" width="120" />
        <el-table-column prop="credit" label="学分" width="80" align="center" />
        <el-table-column label="学员数量" width="100" align="center">
          <template #default="{ row }">
            <el-text type="primary">{{ row.enrollmentCount || 0 }}</el-text>
          </template>
        </el-table-column>
        <el-table-column label="待签到" width="100" align="center">
          <template #default="{ row }">
            <el-text :type="(row.pendingCheckinCount || 0) > 0 ? 'warning' : 'success'">
              {{ row.pendingCheckinCount || 0 }}
            </el-text>
          </template>
        </el-table-column>
        <el-table-column label="报名状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.enrollStatus === 'OPEN' ? 'success' : 'info'">
              {{ row.enrollStatus === 'OPEN' ? '报名中' : '已截止' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="课程状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.status === 'DRAFT'" type="info">草稿</el-tag>
            <el-tag v-else-if="row.status === 'PUBLISHED'" type="success">已发布</el-tag>
            <el-tag v-else type="warning">已归档</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="views" label="浏览量" width="100" align="center" />
        <el-table-column label="开课时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.startTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="380" fixed="right">
          <template #default="{ row }">
            <el-button v-permission="'courses:edit'" link type="primary" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button v-permission="'courses:assign-teacher'" link type="primary" @click="handleAssignTeacher(row)">
              分配老师
            </el-button>
            <el-button link type="primary" @click="handleMaterials(row)">课件</el-button>
            <el-button
              v-if="row.status === 'DRAFT'"
              v-permission="'courses:publish'"
              link
              type="success"
              @click="handlePublish(row)"
            >
              发布
            </el-button>
            <el-button
              v-if="row.status === 'DRAFT'"
              v-permission="'courses:approve'"
              link
              type="primary"
              @click="handleApprove(row)"
            >
              审批
            </el-button>
            <el-button
              v-if="row.status === 'PUBLISHED'"
              v-permission="'courses:publish'"
              link
              type="warning"
              @click="handleArchive(row)"
            >
              归档
            </el-button>
            <el-button v-permission="'courses:delete'" link type="danger" @click="handleDelete(row)">
              删除
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

    <!-- 分配老师对话框 -->
    <el-dialog
      v-model="assignDialogVisible"
      title="分配老师"
      width="500px"
      @close="handleAssignDialogClose"
    >
      <el-form :model="assignForm" label-width="100px">
        <el-form-item label="课程名称">
          <el-input v-model="currentCourse.title" disabled />
        </el-form-item>
        <el-form-item label="当前老师">
          <el-input v-model="currentCourse.teacherName" disabled placeholder="未分配" />
        </el-form-item>
        <el-form-item label="选择老师" required>
          <el-select
            v-model="assignForm.teacherId"
            placeholder="请选择老师"
            filterable
            style="width: 100%"
            @change="handleTeacherSelect"
          >
            <el-option
              v-for="teacher in teachers"
              :key="teacher.id"
              :label="`${teacher.realName || teacher.nickname} (${teacher.phone})`"
              :value="teacher.id"
            >
              <div style="display: flex; align-items: center; gap: 8px">
                <el-avatar :size="24" :src="teacher.avatar">
                  {{ (teacher.realName || teacher.nickname)?.charAt(0) }}
                </el-avatar>
                <span>{{ teacher.realName || teacher.nickname }}</span>
                <span style="color: #999; font-size: 12px">({{ teacher.phone }})</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="assignDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="assigning" @click="handleConfirmAssign">
          确定分配
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, Delete, Document } from '@element-plus/icons-vue'
import {
  getCourseList,
  deleteCourse,
  batchDeleteCourse,
  publishCourse,
  archiveCourse,
  assignTeacherToCourse,
} from '@/api/course'
import { getUserList } from '@/api/user'
import type { Course } from '@/types/models'
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
} = useTable<Course>({
  fetchApi: getCourseList,
  immediate: false,
})

const selectedIds = ref<string[]>([])
const handleSelectionChange = (selection: Course[]) => {
  selectedIds.value = selection.map(item => item.id)
}

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

// 新增
const handleAdd = () => {
  router.push('/courses/create')
}

// 编辑
const handleEdit = (row: Course) => {
  router.push(`/courses/edit/${row.id}`)
}

// 课件管理
const handleMaterials = (row: Course) => {
  router.push({
    path: '/materials/list',
    query: {
      courseId: row.id,
      title: row.title
    }
  })
}

// 发布
const handlePublish = async (row: Course) => {
  try {
    await ElMessageBox.confirm(`确定要发布课程"${row.title}"吗？`, '提示', {
      type: 'warning',
    })
    await publishCourse(row.id)
    ElMessage.success('发布成功')
    handleSearch()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '发布失败')
    }
  }
}

// 审批课程
const handleApprove = async (row: Course) => {
  try {
    await ElMessageBox.confirm(
      `确定要审批通过课程"${row.title}"吗？审批后将自动发布。`,
      '课程审批',
      {
        type: 'warning',
        confirmButtonText: '审批通过',
        cancelButtonText: '取消',
      }
    )
    await publishCourse(row.id)
    ElMessage.success('审批通过，课程已发布')
    handleSearch()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '审批失败')
    }
  }
}

// 归档
const handleArchive = async (row: Course) => {
  try {
    await ElMessageBox.confirm(`确定要归档课程"${row.title}"吗？`, '提示', {
      type: 'warning',
    })
    await archiveCourse(row.id)
    ElMessage.success('归档成功')
    handleSearch()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '归档失败')
    }
  }
}

// 删除
const handleDelete = async (row: Course) => {
  try {
    await ElMessageBox.confirm(`确定要删除课程"${row.title}"吗？`, '提示', {
      type: 'warning',
    })
    await deleteCourse(row.id)
    ElMessage.success('删除成功')
    handleSearch()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

// 批量删除
const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedIds.value.length} 个课程吗？`, '提示', {
      type: 'warning',
    })
    await batchDeleteCourse(selectedIds.value)
    ElMessage.success('删除成功')
    selectedIds.value = []
    handleSearch()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

// 跳转审批页
const goToApprove = () => {
  router.push('/courses/approve')
}

// 分配老师相关
const assignDialogVisible = ref(false)
const assigning = ref(false)
const currentCourse = ref<any>({})
const teachers = ref<any[]>([])
const assignForm = ref({
  teacherId: '',
  teacherName: '',
  teacherAvatar: '',
})

// 打开分配老师对话框
const handleAssignTeacher = async (row: Course) => {
  currentCourse.value = { ...row }
  assignForm.value = {
    teacherId: row.teacherId || '',
    teacherName: row.teacherName || '',
    teacherAvatar: row.teacherAvatar || '',
  }
  
  // 加载老师列表
  try {
    const res = await getUserList({ role: 'TEACHER', pageSize: 100 })
    teachers.value = res.items || []
    assignDialogVisible.value = true
  } catch (error: any) {
    ElMessage.error(error.message || '加载老师列表失败')
  }
}

// 选择老师时更新老师信息
const handleTeacherSelect = (teacherId: string) => {
  const teacher = teachers.value.find(t => t.id === teacherId)
  if (teacher) {
    assignForm.value.teacherName = teacher.realName || teacher.nickname
    assignForm.value.teacherAvatar = teacher.avatar || ''
  }
}

// 确认分配
const handleConfirmAssign = async () => {
  if (!assignForm.value.teacherId) {
    ElMessage.warning('请选择老师')
    return
  }
  
  try {
    assigning.value = true
    await assignTeacherToCourse(currentCourse.value.id, {
      teacherId: assignForm.value.teacherId,
      teacherName: assignForm.value.teacherName,
      teacherAvatar: assignForm.value.teacherAvatar,
    })
    ElMessage.success('分配成功')
    assignDialogVisible.value = false
    handleSearch()
  } catch (error: any) {
    ElMessage.error(error.message || '分配失败')
  } finally {
    assigning.value = false
  }
}

// 关闭对话框
const handleAssignDialogClose = () => {
  assignForm.value = {
    teacherId: '',
    teacherName: '',
    teacherAvatar: '',
  }
  currentCourse.value = {}
}

// 初始加载
handleSearch()
</script>

<style scoped lang="scss">
.courses-list {
  .search-card,
  .toolbar-card {
    margin-bottom: 16px;
  }

  .text-secondary {
    color: var(--el-text-color-secondary);
    font-size: 12px;
  }

  :deep(.el-pagination) {
    margin-top: 16px;
    justify-content: flex-end;
  }
}
</style>
