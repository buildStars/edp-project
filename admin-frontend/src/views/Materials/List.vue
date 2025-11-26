<template>
  <div class="app-container">
    <!-- 自定义面包屑（当从课程进入时显示） -->
    <div v-if="fromCourse" class="custom-breadcrumb">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="breadcrumbFirstPath">
          {{ breadcrumbFirstTitle }}
        </el-breadcrumb-item>
        <el-breadcrumb-item>课件列表</el-breadcrumb-item>
      </el-breadcrumb>
      <div class="page-subtitle">{{ courseTitle }}</div>
    </div>

    <!-- 搜索栏 -->
    <el-card shadow="never" style="margin-bottom: 16px">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="课件名称">
          <el-input
            v-model="searchForm.keyword"
            placeholder="请输入课件名称"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="所属课程">
          <el-select
            v-model="searchForm.courseId"
            placeholder="请选择课程"
            clearable
            filterable
          >
            <el-option
              v-for="course in courseList"
              :key="course.id"
              :label="course.title"
              :value="course.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="文件类型">
          <el-select v-model="searchForm.fileType" placeholder="请选择" clearable>
            <el-option label="PDF" value="pdf" />
            <el-option label="Word" value="doc" />
            <el-option label="Excel" value="xls" />
            <el-option label="PPT" value="ppt" />
            <el-option label="图片" value="image" />
            <el-option label="视频" value="video" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">
            搜索
          </el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作栏 -->
    <el-card shadow="never">
      <div class="toolbar">
        <el-button type="primary" :icon="Plus" @click="handleAdd">
          新增课件
        </el-button>
        <el-button
          type="danger"
          :icon="Delete"
          :disabled="selectedIds.length === 0"
          @click="handleBatchDelete"
        >
          批量删除
        </el-button>
      </div>

      <!-- 表格 -->
      <el-table
        v-loading="loading"
        :data="tableData"
        @selection-change="handleSelectionChange"
        style="margin-top: 16px"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column label="课件名称" prop="title" min-width="200" show-overflow-tooltip />
        <el-table-column label="所属课程" min-width="180" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.course?.title || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="所属章节" min-width="150" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.chapter?.title || '课程级别' }}
          </template>
        </el-table-column>
        <el-table-column label="文件类型" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getFileTypeTag(row.fileType)">
              {{ getFileTypeLabel(row.fileType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="文件大小" width="120" align="center">
          <template #default="{ row }">
            {{ formatFileSize(row.fileSize) }}
          </template>
        </el-table-column>
        <el-table-column label="下载次数" width="100" align="center" prop="_count.downloads" />
        <el-table-column label="上传时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handlePreview(row)">
              预览
            </el-button>
            <el-button link type="primary" @click="handleDownload(row)">
              下载
            </el-button>
            <el-button link type="primary" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button link type="danger" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadData"
          @current-change="loadData"
        />
      </div>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="课件名称" prop="title">
          <el-input v-model="formData.title" placeholder="请输入课件名称" />
        </el-form-item>
        <el-form-item label="所属课程" prop="courseId">
          <el-select
            v-model="formData.courseId"
            placeholder="请选择课程"
            filterable
            @change="handleCourseChange"
            style="width: 100%"
          >
            <el-option
              v-for="course in courseList"
              :key="course.id"
              :label="course.title"
              :value="course.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="所属章节">
          <el-select
            v-model="formData.chapterId"
            placeholder="请选择章节（可选）"
            clearable
            filterable
            style="width: 100%"
          >
            <el-option
              v-for="chapter in chapterList"
              :key="chapter.id"
              :label="chapter.title"
              :value="chapter.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="课件文件" prop="fileUrl">
          <el-upload
            ref="uploadRef"
            :action="uploadAction"
            :headers="uploadHeaders"
            :on-success="handleUploadSuccess"
            :on-error="handleUploadError"
            :before-upload="handleBeforeUpload"
            :limit="1"
            :file-list="fileList"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.jpg,.jpeg,.png,.mp4"
          >
            <el-button type="primary">选择文件</el-button>
            <template #tip>
              <div class="el-upload__tip">
                支持 PDF、Word、Excel、PPT、图片、视频、压缩包等格式，最大 100MB
              </div>
            </template>
          </el-upload>
          <div v-if="formData.fileUrl" class="file-info">
            <span>当前文件：{{ formData.fileUrl }}</span>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Search, Refresh, Plus, Delete } from '@element-plus/icons-vue'
import {
  getMaterialList,
  createMaterial,
  updateMaterial,
  deleteMaterial
} from '@/api/material'
import { getCourseList } from '@/api/course'
import { getChapters } from '@/api/chapter'
import { formatDate } from '@/utils/format'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()

const authStore = useAuthStore()

// 从 URL 参数中读取课程信息
const fromCourse = computed(() => !!route.query.courseId)
const courseTitle = computed(() => (route.query.title as string) || '')

// 判断是否为教师角色
const isTeacher = computed(() => authStore.userInfo?.role === 'TEACHER')

// 面包屑导航
const breadcrumbFirstTitle = computed(() => {
  return isTeacher.value ? '我的课程' : '课程管理'
})

const breadcrumbFirstPath = computed(() => {
  return isTeacher.value ? '/teacher/courses' : '/courses/list'
})

// 搜索表单
const searchForm = reactive({
  keyword: '',
  courseId: '',
  fileType: ''
})

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

// 表格数据
const loading = ref(false)
const tableData = ref<any[]>([])
const selectedIds = ref<string[]>([])

// 课程和章节列表
const courseList = ref<any[]>([])
const chapterList = ref<any[]>([])

// 对话框
const dialogVisible = ref(false)
const dialogTitle = computed(() => (isEdit.value ? '编辑课件' : '新增课件'))
const isEdit = ref(false)
const submitting = ref(false)

// 表单
const formRef = ref<FormInstance>()
const formData = reactive<any>({
  id: '',
  title: '',
  courseId: '',
  chapterId: '',
  fileUrl: '',
  fileType: '',
  fileSize: 0
})

const formRules: FormRules = {
  title: [{ required: true, message: '请输入课件名称', trigger: 'blur' }],
  courseId: [{ required: true, message: '请选择所属课程', trigger: 'change' }],
  fileUrl: [{ required: true, message: '请上传课件文件', trigger: 'change' }]
}

// 文件上传
const uploadRef = ref()
const fileList = ref<any[]>([])
const uploadAction = computed(() => {
  return `${import.meta.env.VITE_API_BASE_URL}/materials/upload`
})
const uploadHeaders = computed(() => {
  return {
    Authorization: `Bearer ${authStore.token}`
  }
})

// 加载数据
const loadData = async () => {
  try {
    loading.value = true
    const params = {
      ...searchForm,
      page: pagination.page,
      pageSize: pagination.pageSize
    }
    const data = await getMaterialList(params) as any
    tableData.value = data.items || []
    pagination.total = data.total || 0
  } catch (error: any) {
    ElMessage.error(error.message || '加载数据失败')
  } finally {
    loading.value = false
  }
}

// 加载课程列表
const loadCourseList = async () => {
  try {
    const data = await getCourseList({ pageSize: 1000 }) as any
    courseList.value = data.items || []
  } catch (error: any) {
    console.error('加载课程列表失败：', error)
  }
}

// 加载章节列表
const loadChapterList = async (courseId: string) => {
  if (!courseId) {
    chapterList.value = []
    return
  }
  try {
    const data = await getChapters({ courseId }) as any
    chapterList.value = data.items || []
  } catch (error: any) {
    console.error('加载章节列表失败：', error)
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  loadData()
}

// 重置
const handleReset = () => {
  searchForm.keyword = ''
  searchForm.courseId = ''
  searchForm.fileType = ''
  handleSearch()
}

// 表格选择
const handleSelectionChange = (selection: any[]) => {
  selectedIds.value = selection.map(item => item.id)
}

// 新增
const handleAdd = () => {
  isEdit.value = false
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: any) => {
  isEdit.value = true
  Object.assign(formData, {
    id: row.id,
    title: row.title,
    courseId: row.courseId,
    chapterId: row.chapterId || '',
    fileUrl: row.fileUrl,
    fileType: row.fileType,
    fileSize: row.fileSize
  })
  loadChapterList(row.courseId)
  fileList.value = row.fileUrl ? [{ name: row.fileUrl, url: row.fileUrl }] : []
  dialogVisible.value = true
}

// 删除
const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要删除这个课件吗？', '提示', {
      type: 'warning'
    })
    await deleteMaterial(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

// 批量删除
const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedIds.value.length} 个课件吗？`, '提示', {
      type: 'warning'
    })
    await Promise.all(selectedIds.value.map(id => deleteMaterial(id)))
    ElMessage.success('批量删除成功')
    loadData()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '批量删除失败')
    }
  }
}

// 预览
const handlePreview = (row: any) => {
  window.open(row.fileUrl, '_blank')
}

// 下载
const handleDownload = (row: any) => {
  const link = document.createElement('a')
  link.href = row.fileUrl
  link.download = row.title
  link.click()
}

// 课程变化
const handleCourseChange = (courseId: string) => {
  formData.chapterId = ''
  loadChapterList(courseId)
}

// 文件上传前
const handleBeforeUpload = (file: File) => {
  const maxSize = 100 * 1024 * 1024 // 100MB
  if (file.size > maxSize) {
    ElMessage.error('文件大小不能超过 100MB')
    return false
  }
  return true
}

// 文件上传成功
const handleUploadSuccess = (response: any) => {
  if (response.code === 200) {
    formData.fileUrl = response.data.url
    formData.fileSize = response.data.size
    formData.fileType = response.data.type
    ElMessage.success('文件上传成功')
  } else {
    ElMessage.error(response.msg || '文件上传失败')
  }
}

// 文件上传失败
const handleUploadError = () => {
  ElMessage.error('文件上传失败')
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
    submitting.value = true
    
    const data = {
      title: formData.title,
      courseId: formData.courseId,
      chapterId: formData.chapterId || undefined,
      fileUrl: formData.fileUrl,
      fileType: formData.fileType,
      fileSize: formData.fileSize
    }

    if (isEdit.value) {
      await updateMaterial(formData.id, data)
      ElMessage.success('更新成功')
    } else {
      await createMaterial(data)
      ElMessage.success('创建成功')
    }
    
    dialogVisible.value = false
    loadData()
  } catch (error: any) {
    if (error !== false) {
      ElMessage.error(error.message || '操作失败')
    }
  } finally {
    submitting.value = false
  }
}

// 关闭对话框
const handleDialogClose = () => {
  formRef.value?.resetFields()
  Object.assign(formData, {
    id: '',
    title: '',
    courseId: '',
    chapterId: '',
    fileUrl: '',
    fileType: '',
    fileSize: 0
  })
  fileList.value = []
  chapterList.value = []
}

// 获取文件类型标签
const getFileTypeTag = (type: string) => {
  const map: Record<string, any> = {
    pdf: 'danger',
    doc: 'primary',
    xls: 'success',
    ppt: 'warning',
    image: 'info',
    video: '',
    other: 'info'
  }
  return map[type] || 'info'
}

// 获取文件类型文本
const getFileTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    pdf: 'PDF',
    doc: 'Word',
    xls: 'Excel',
    ppt: 'PPT',
    image: '图片',
    video: '视频',
    other: '其他'
  }
  return map[type] || type.toUpperCase()
}

// 格式化文件大小
const formatFileSize = (bytes: number) => {
  if (!bytes) return '-'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
  if (bytes < 1024 * 1024 * 1024) return (bytes / 1024 / 1024).toFixed(2) + ' MB'
  return (bytes / 1024 / 1024 / 1024).toFixed(2) + ' GB'
}

onMounted(() => {
  // 如果从课程进入，自动设置课程筛选
  if (route.query.courseId) {
    searchForm.courseId = route.query.courseId as string
  }
  
  loadData()
  loadCourseList()
})
</script>

<style scoped lang="scss">
.app-container {
  padding: 20px;
}

.toolbar {
  display: flex;
  gap: 12px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.file-info {
  margin-top: 12px;
  padding: 8px 12px;
  background: #f5f7fa;
  border-radius: 4px;
  font-size: 14px;
  color: #606266;
}
</style>

