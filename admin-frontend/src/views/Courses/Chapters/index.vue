<template>
  <div class="course-chapters">
    <!-- 头部操作栏 -->
    <div class="chapter-header">
      <el-button type="primary" :icon="Plus" @click="handleAdd">添加章节</el-button>
      <el-button 
        v-if="selectedIds.length > 0" 
        type="danger" 
        :icon="Delete"
        @click="handleBatchDelete"
      >
        批量删除 ({{ selectedIds.length }})
      </el-button>
    </div>

    <!-- 章节列表 -->
    <el-table
      v-loading="loading"
      :data="chapters"
      row-key="id"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      
      <el-table-column label="排序" width="80">
        <template #default="{ row, $index }">
          <div class="sort-controls">
            <el-button
              link
              :icon="Top"
              :disabled="$index === 0"
              @click="handleMove(row, 'up')"
              title="上移"
            />
            <span>{{ row.sortOrder }}</span>
            <el-button
              link
              :icon="Bottom"
              :disabled="$index === chapters.length - 1"
              @click="handleMove(row, 'down')"
              title="下移"
            />
          </div>
        </template>
      </el-table-column>

      <el-table-column label="章节标题" min-width="200">
        <template #default="{ row }">
          <div>
            <strong>{{ row.title }}</strong>
            <el-tag v-if="row.status === 'DRAFT'" type="info" size="small" style="margin-left: 8px">
              草稿
            </el-tag>
            <el-tag v-else-if="row.status === 'PUBLISHED'" type="success" size="small" style="margin-left: 8px">
              已发布
            </el-tag>
            <el-tag v-else-if="row.status === 'COMPLETED'" type="warning" size="small" style="margin-left: 8px">
              已完成
            </el-tag>
          </div>
          <div v-if="row.description" class="chapter-desc">{{ row.description }}</div>
        </template>
      </el-table-column>

      <el-table-column label="时长" width="100">
        <template #default="{ row }">
          {{ row.duration ? `${row.duration}分钟` : '-' }}
        </template>
      </el-table-column>

      <el-table-column label="上课时间" width="180">
        <template #default="{ row }">
          <div v-if="row.startTime">
            {{ formatDateTime(row.startTime) }}
          </div>
          <div v-else class="text-gray">未设置</div>
        </template>
      </el-table-column>

      <el-table-column label="地点" width="120">
        <template #default="{ row }">
          {{ row.location || '-' }}
        </template>
      </el-table-column>

      <el-table-column label="统计" width="180">
        <template #default="{ row }">
          <div class="chapter-stats">
            <el-tag size="small">课件 {{ row._count?.materials || 0 }}</el-tag>
            <el-tag size="small" type="success">签到 {{ row._count?.checkinSessions || 0 }}</el-tag>
            <el-tag size="small" type="warning">评价 {{ row._count?.evaluations || 0 }}</el-tag>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" :icon="Edit" @click="handleEdit(row)">
            编辑
          </el-button>
          <el-button link type="danger" :icon="Delete" @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 空状态 -->
    <el-empty v-if="!loading && chapters.length === 0" description="暂无章节，点击上方按钮添加">
      <el-button type="primary" :icon="Plus" @click="handleAdd">添加第一个章节</el-button>
    </el-empty>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑章节' : '添加章节'"
      width="700px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="章节标题" prop="title">
          <el-input
            v-model="formData.title"
            placeholder="请输入章节标题"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="章节描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入章节描述"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="排序号" prop="sortOrder">
              <el-input-number
                v-model="formData.sortOrder"
                :min="0"
                :max="999"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="预计时长" prop="duration">
              <el-input-number
                v-model="formData.duration"
                :min="1"
                :max="999"
                placeholder="分钟"
                style="width: 100%"
              />
              <span style="margin-left: 8px; color: #909399;">分钟</span>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="开始时间" prop="startTime">
              <el-date-picker
                v-model="formData.startTime"
                type="datetime"
                placeholder="选择开始时间"
                format="YYYY-MM-DD HH:mm"
                value-format="YYYY-MM-DDTHH:mm:ss.000Z"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结束时间" prop="endTime">
              <el-date-picker
                v-model="formData.endTime"
                type="datetime"
                placeholder="选择结束时间"
                format="YYYY-MM-DD HH:mm"
                value-format="YYYY-MM-DDTHH:mm:ss.000Z"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="上课地点" prop="location">
          <el-input
            v-model="formData.location"
            placeholder="请输入上课地点"
          />
        </el-form-item>

        <el-form-item label="章节状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio label="DRAFT">草稿</el-radio>
            <el-radio label="PUBLISHED">已发布</el-radio>
            <el-radio label="COMPLETED">已完成</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus, Edit, Delete, Top, Bottom } from '@element-plus/icons-vue'
import {
  getChapters,
  createChapter,
  updateChapter,
  deleteChapter,
  batchDeleteChapters,
  updateChapterSort,
  type Chapter,
} from '@/api/chapter'
import dayjs from 'dayjs'

const props = defineProps<{
  courseId: string
}>()

const loading = ref(false)
const chapters = ref<Chapter[]>([])
const selectedIds = ref<string[]>([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const formRef = ref<FormInstance>()

const formData = reactive<Partial<Chapter>>({
  courseId: props.courseId,
  title: '',
  description: '',
  sortOrder: 1,
  duration: undefined,
  startTime: '',
  endTime: '',
  location: '',
  status: 'DRAFT',
})

const rules: FormRules = {
  title: [{ required: true, message: '请输入章节标题', trigger: 'blur' }],
  sortOrder: [{ required: true, message: '请输入排序号', trigger: 'blur' }],
  status: [{ required: true, message: '请选择章节状态', trigger: 'change' }],
}

// 格式化日期时间
const formatDateTime = (dateStr: string) => {
  return dayjs(dateStr).format('YYYY-MM-DD HH:mm')
}

// 加载章节列表
const loadChapters = async () => {
  loading.value = true
  try {
    const res = await getChapters({ courseId: props.courseId })
    // API返回的数据已经被响应拦截器提取，直接使用
    chapters.value = res.items || []
  } catch (error: any) {
    ElMessage.error(error.message || '加载章节列表失败')
    chapters.value = []
  } finally {
    loading.value = false
  }
}

// 选择变化
const handleSelectionChange = (selection: Chapter[]) => {
  selectedIds.value = selection.map(item => item.id)
}

// 添加章节
const handleAdd = () => {
  isEdit.value = false
  dialogVisible.value = true
  
  // 重置表单
  Object.assign(formData, {
    courseId: props.courseId,
    title: '',
    description: '',
    sortOrder: chapters.value.length + 1,
    duration: undefined,
    startTime: '',
    endTime: '',
    location: '',
    status: 'DRAFT',
  })
  
  formRef.value?.clearValidate()
}

// 编辑章节
const handleEdit = (row: Chapter) => {
  isEdit.value = true
  dialogVisible.value = true
  
  Object.assign(formData, {
    id: row.id,
    courseId: row.courseId,
    title: row.title,
    description: row.description,
    sortOrder: row.sortOrder,
    duration: row.duration,
    startTime: row.startTime || '',
    endTime: row.endTime || '',
    location: row.location || '',
    status: row.status,
  })
  
  formRef.value?.clearValidate()
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitting.value = true

    if (isEdit.value && formData.id) {
      // 更新时，不传递 id 字段（id 已经在 URL 中）
      const { id, ...updateData } = formData
      await updateChapter(id, updateData)
      ElMessage.success('更新成功')
    } else {
      await createChapter(formData)
      ElMessage.success('创建成功')
    }

    dialogVisible.value = false
    loadChapters()
  } catch (error: any) {
    if (error !== false) {
      ElMessage.error(error.message || '操作失败')
    }
  } finally {
    submitting.value = false
  }
}

// 删除章节
const handleDelete = async (row: Chapter) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除章节"${row.title}"吗？<br/><br/>
      ${row._count && (row._count.materials > 0 || row._count.checkinSessions > 0 || row._count.evaluations > 0)
        ? '<span style="color: #f56c6c;">⚠️ 该章节下有关联数据，删除后将无法恢复！</span>'
        : ''}`,
      '删除确认',
      {
        type: 'warning',
        dangerouslyUseHTMLString: true,
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
      }
    )

    await deleteChapter(row.id)
    ElMessage.success('删除成功')
    loadChapters()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

// 批量删除
const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedIds.value.length} 个章节吗？`,
      '批量删除确认',
      {
        type: 'warning',
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
      }
    )

    await batchDeleteChapters(selectedIds.value)
    ElMessage.success('批量删除成功')
    selectedIds.value = []
    loadChapters()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '批量删除失败')
    }
  }
}

// 移动章节
const handleMove = async (row: Chapter, direction: 'up' | 'down') => {
  const currentIndex = chapters.value.findIndex(item => item.id === row.id)
  if (currentIndex === -1) return

  const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
  if (targetIndex < 0 || targetIndex >= chapters.value.length) return

  // 交换排序号
  const updates = [
    { id: chapters.value[currentIndex].id, sortOrder: chapters.value[targetIndex].sortOrder },
    { id: chapters.value[targetIndex].id, sortOrder: chapters.value[currentIndex].sortOrder },
  ]

  try {
    await updateChapterSort(updates)
    ElMessage.success('排序更新成功')
    loadChapters()
  } catch (error: any) {
    ElMessage.error(error.message || '排序更新失败')
  }
}

// 关闭对话框
const handleDialogClose = () => {
  formRef.value?.resetFields()
}

onMounted(() => {
  loadChapters()
})
</script>

<style scoped lang="scss">
.course-chapters {
  .chapter-header {
    margin-bottom: 16px;
    display: flex;
    gap: 12px;
  }

  .sort-controls {
    display: flex;
    align-items: center;
    gap: 4px;

    span {
      min-width: 30px;
      text-align: center;
      font-weight: 600;
      color: #409eff;
    }
  }

  .chapter-desc {
    margin-top: 4px;
    font-size: 12px;
    color: #909399;
    line-height: 1.5;
  }

  .text-gray {
    color: #909399;
  }

  .chapter-stats {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }
}
</style>

