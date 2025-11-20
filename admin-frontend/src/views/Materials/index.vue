<template>
  <div class="materials-management">
    <el-page-header :title="`${courseTitle} - 课件管理`" @back="handleBack" />

    <!-- 操作栏 -->
    <el-card shadow="never" class="toolbar-card">
      <el-button type="primary" :icon="Upload" @click="handleUpload">上传课件</el-button>
      <el-button
        type="danger"
        :icon="Delete"
        :disabled="selectedIds.length === 0"
        @click="handleBatchDelete"
      >
        批量删除
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
        <el-table-column label="文件类型" width="80">
          <template #default="{ row }">
            <el-icon :size="32" :color="getFileColor(row.fileType)">
              <Document />
            </el-icon>
          </template>
        </el-table-column>
        <el-table-column label="所属章节" width="180">
          <template #default="{ row }">
            <el-tag v-if="row.chapter" type="primary" size="small">
              {{ row.chapter.sortOrder }}. {{ row.chapter.title }}
            </el-tag>
            <el-tag v-else type="info" size="small">课程级课件</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="课件名称" min-width="200" show-overflow-tooltip />
        <el-table-column label="文件类型" width="100">
          <template #default="{ row }">
            <el-tag>{{ row.fileType?.toUpperCase() || 'PDF' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="文件大小" width="120">
          <template #default="{ row }">
            {{ formatFileSize(row.fileSize) }}
          </template>
        </el-table-column>
        <el-table-column label="下载次数" width="100" align="center">
          <template #default="{ row }">
            {{ row._count?.downloads || 0 }}
          </template>
        </el-table-column>
        <el-table-column label="上传时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleDownload(row)">下载</el-button>
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
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

    <!-- 上传对话框 -->
    <el-dialog v-model="uploadDialogVisible" title="上传课件" width="600px">
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
        <el-form-item label="所属章节">
          <el-select
            v-model="formData.chapterId"
            placeholder="不选择表示课程级课件"
            clearable
            style="width: 100%"
            :loading="loadingChapters"
          >
            <el-option label="课程级课件（不分章节）" value="" />
            <el-option
              v-for="chapter in courseChapters"
              :key="chapter.id"
              :label="`${chapter.sortOrder}. ${chapter.title}`"
              :value="chapter.id"
            />
          </el-select>
          <div style="margin-top: 4px; font-size: 12px; color: #909399;">
            {{ formData.chapterId ? '该课件将归属于选中的章节' : '该课件将作为课程级课件' }}
          </div>
        </el-form-item>
        <el-form-item label="课件名称" prop="title">
          <el-input v-model="formData.title" placeholder="请输入课件名称" />
        </el-form-item>
        <el-form-item label="课件文件" prop="fileUrl">
          <el-upload
            class="upload-demo"
            drag
            action="#"
            :auto-upload="false"
            :on-change="handleFileChange"
            :limit="1"
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
              将文件拖到此处，或<em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                支持 PDF、PPT、PPTX、DOC、DOCX、XLS、XLSX 等格式，大小不超过50MB
              </div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="uploadDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="uploading" @click="handleSaveUpload">
          确定上传
        </el-button>
      </template>
    </el-dialog>

    <!-- 编辑对话框 -->
    <el-dialog v-model="editDialogVisible" title="编辑课件" width="500px">
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="所属章节">
          <el-select
            v-model="editForm.chapterId"
            placeholder="不选择表示课程级课件"
            clearable
            style="width: 100%"
            :loading="loadingChapters"
          >
            <el-option label="课程级课件（不分章节）" value="" />
            <el-option
              v-for="chapter in courseChapters"
              :key="chapter.id"
              :label="`${chapter.sortOrder}. ${chapter.title}`"
              :value="chapter.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="课件名称">
          <el-input v-model="editForm.title" placeholder="请输入课件名称" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSaveEdit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules, type UploadFile } from 'element-plus'
import { Upload, Delete, Document, UploadFilled } from '@element-plus/icons-vue'
import { formatDate, formatFileSize } from '@/utils/format'
import {
  getMaterialList,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  batchDeleteMaterials,
  uploadFile,
  type Material,
} from '@/api/material'
import { getChapters, type Chapter } from '@/api/chapter'

const router = useRouter()
const route = useRoute()

const courseId = ref(route.query.courseId as string)
const courseTitle = ref(route.query.title as string || '课程')

// 表格数据
const loading = ref(false)
const tableData = ref<Material[]>([])
const selectedIds = ref<string[]>([])
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0,
})

// 章节数据
const loadingChapters = ref(false)
const courseChapters = ref<Chapter[]>([])

// 加载章节列表
const loadCourseChapters = async () => {
  if (!courseId.value) return
  
  loadingChapters.value = true
  try {
    const res = await getChapters({ courseId: courseId.value })
    courseChapters.value = (res as any).items || []
  } catch (error: any) {
    console.error('加载章节失败:', error)
    courseChapters.value = []
  } finally {
    loadingChapters.value = false
  }
}

const handleSearch = async () => {
  if (!courseId.value) return

  loading.value = true
  try {
    const res = await getMaterialList({
      courseId: courseId.value,
      page: pagination.page,
      pageSize: pagination.pageSize,
    })
    tableData.value = res.items || []
    pagination.total = res.total || 0
  } catch (error: any) {
    ElMessage.error(error.message || '加载失败')
  } finally {
    loading.value = false
  }
}

const handleSelectionChange = (selection: any[]) => {
  selectedIds.value = selection.map(item => item.id)
}

// 文件类型颜色
const getFileColor = (fileType: string) => {
  const colorMap: Record<string, string> = {
    pdf: '#F40F02',
    ppt: '#D24625',
    pptx: '#D24625',
    doc: '#2B579A',
    docx: '#2B579A',
    xls: '#1D6F42',
    xlsx: '#1D6F42',
  }
  return colorMap[fileType?.toLowerCase()] || '#909399'
}

// 上传课件
const uploadDialogVisible = ref(false)
const formRef = ref<FormInstance>()
const uploading = ref(false)
const currentFile = ref<UploadFile | null>(null)

const formData = reactive({
  title: '',
  fileUrl: '',
  fileType: '',
  fileSize: 0,
  chapterId: '',
})

const rules: FormRules = {
  title: [{ required: true, message: '请输入课件名称', trigger: 'blur' }],
  fileUrl: [{ required: true, message: '请上传课件文件', trigger: 'change' }],
}

const handleUpload = () => {
  Object.assign(formData, {
    title: '',
    fileUrl: '',
    fileType: '',
    fileSize: 0,
    chapterId: '',
  })
  currentFile.value = null
  uploadDialogVisible.value = true
  
  // 加载章节列表
  if (courseChapters.value.length === 0) {
    loadCourseChapters()
  }
}

const handleFileChange = (file: UploadFile) => {
  currentFile.value = file
  formData.fileUrl = file.name
  formData.fileType = file.name.split('.').pop() || ''
  formData.fileSize = file.size || 0

  // 自动填充课件名称
  if (!formData.title) {
    formData.title = file.name.replace(/\.[^/.]+$/, '')
  }
}

const handleSaveUpload = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    if (!currentFile.value || !currentFile.value.raw) {
      ElMessage.warning('请选择文件')
      return
    }

    uploading.value = true
    
    // 1. 先上传文件
    const uploadRes = await uploadFile(currentFile.value.raw, (percent) => {
      console.log('上传进度:', percent + '%')
    })
    
    // 2. 创建课件记录
    await createMaterial({
      courseId: courseId.value,
      title: formData.title,
      fileUrl: uploadRes.url,
      fileType: uploadRes.fileType,
      fileSize: uploadRes.fileSize,
      chapterId: formData.chapterId || undefined,
    })
    
    ElMessage.success('上传成功')
    uploadDialogVisible.value = false
    handleSearch()
  } catch (error: any) {
    if (error !== false) {
      ElMessage.error(error.message || '上传失败')
    }
  } finally {
    uploading.value = false
  }
}

// 编辑课件
const editDialogVisible = ref(false)
const submitting = ref(false)
const editForm = reactive({
  id: '',
  title: '',
  chapterId: '',
})

const handleEdit = (row: any) => {
  Object.assign(editForm, {
    id: row.id,
    title: row.title,
    chapterId: row.chapterId || '',
  })
  editDialogVisible.value = true
  
  // 加载章节列表
  if (courseChapters.value.length === 0) {
    loadCourseChapters()
  }
}

const handleSaveEdit = async () => {
  if (!editForm.title.trim()) {
    ElMessage.warning('请输入课件名称')
    return
  }

  try {
    submitting.value = true
    await updateMaterial(editForm.id, {
      title: editForm.title,
      chapterId: editForm.chapterId || undefined,
    })
    ElMessage.success('保存成功')
    editDialogVisible.value = false
    handleSearch()
  } catch (error: any) {
    ElMessage.error(error.message || '保存失败')
  } finally {
    submitting.value = false
  }
}

// 下载课件
const handleDownload = (row: Material) => {
  window.open(row.fileUrl, '_blank')
}

// 删除课件
const handleDelete = async (row: Material) => {
  try {
    await ElMessageBox.confirm(`确定要删除课件"${row.title}"吗？`, '提示', {
      type: 'warning',
    })
    await deleteMaterial(row.id)
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
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请选择要删除的课件')
    return
  }

  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedIds.value.length} 个课件吗？`, '提示', {
      type: 'warning',
    })
    await batchDeleteMaterials(selectedIds.value)
    ElMessage.success('删除成功')
    selectedIds.value = []
    handleSearch()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

// 返回
const handleBack = () => {
  router.back()
}

onMounted(() => {
  if (!courseId.value) {
    ElMessage.error('课程ID不存在')
    handleBack()
    return
  }
  handleSearch()
  loadCourseChapters()
})
</script>

<style scoped lang="scss">
.materials-management {
  :deep(.el-page-header) {
    margin-bottom: 16px;
  }

  .toolbar-card {
    margin-bottom: 16px;
  }

  .upload-demo {
    width: 100%;
  }

  :deep(.el-pagination) {
    margin-top: 16px;
    justify-content: flex-end;
  }
}
</style>
