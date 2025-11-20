<template>
  <div class="activities-list">
    <el-page-header :title="`${associationName} - 活动管理`" @back="handleBack" />

    <!-- 搜索栏 -->
    <el-card shadow="never" class="search-card">
      <el-form :model="queryParams" inline>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 150px">
            <el-option label="草稿" value="DRAFT" />
            <el-option label="已发布" value="PUBLISHED" />
            <el-option label="已归档" value="ARCHIVED" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input
            v-model="queryParams.keyword"
            placeholder="请输入活动标题"
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
      <el-button type="primary" :icon="Plus" @click="handleAdd">新增活动</el-button>
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
        <el-table-column label="活动图片" width="120">
          <template #default="{ row }">
            <el-image
              v-if="row.images && row.images.length > 0"
              :src="row.images[0]"
              fit="cover"
              style="width: 100px; height: 60px; border-radius: 4px"
              :preview-src-list="row.images"
            />
            <span v-else class="text-secondary">暂无图片</span>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="活动标题" min-width="200" show-overflow-tooltip />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.status === 'DRAFT'" type="info">草稿</el-tag>
            <el-tag v-else-if="row.status === 'PUBLISHED'" type="success">已发布</el-tag>
            <el-tag v-else type="warning">已归档</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="views" label="浏览量" width="100" align="center" />
        <el-table-column prop="likes" label="点赞数" width="100" align="center" />
        <el-table-column label="发布时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.publishTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button
              v-if="row.status === 'DRAFT'"
              link
              type="success"
              @click="handlePublish(row)"
            >
              发布
            </el-button>
            <el-button
              v-if="row.status === 'PUBLISHED'"
              link
              type="warning"
              @click="handleArchive(row)"
            >
              归档
            </el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, Delete } from '@element-plus/icons-vue'
import {
  getActivityList,
  deleteActivity,
  batchDeleteActivity,
  publishActivity,
  archiveActivity,
} from '@/api/activity'
import type { Activity } from '@/types/models'
import { formatDate } from '@/utils/format'
import { useTable } from '@/composables/useTable'

const router = useRouter()
const route = useRoute()

const associationId = ref(route.query.associationId as string)
const associationName = ref(route.query.name as string || '协会')

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
} = useTable<Activity>({
  fetchApi: getActivityList,
  immediate: false,
})

const selectedIds = ref<string[]>([])
const handleSelectionChange = (selection: Activity[]) => {
  selectedIds.value = selection.map(item => item.id)
}

// 设置协会ID筛选
onMounted(() => {
  if (associationId.value) {
    queryParams.associationId = associationId.value
  }
  handleSearch()
})

// 新增
const handleAdd = () => {
  router.push(`/associations/activities/create?associationId=${associationId.value}`)
}

// 编辑
const handleEdit = (row: Activity) => {
  router.push(`/associations/activities/edit?id=${row.id}&associationId=${associationId.value}`)
}

// 发布
const handlePublish = async (row: Activity) => {
  try {
    await ElMessageBox.confirm(`确定要发布活动"${row.title}"吗？`, '提示', {
      type: 'warning',
    })
    await publishActivity(row.id)
    ElMessage.success('发布成功')
    handleSearch()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '发布失败')
    }
  }
}

// 归档
const handleArchive = async (row: Activity) => {
  try {
    await ElMessageBox.confirm(`确定要归档活动"${row.title}"吗？`, '提示', {
      type: 'warning',
    })
    await archiveActivity(row.id)
    ElMessage.success('归档成功')
    handleSearch()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '归档失败')
    }
  }
}

// 删除
const handleDelete = async (row: Activity) => {
  try {
    await ElMessageBox.confirm(`确定要删除活动"${row.title}"吗？`, '提示', {
      type: 'warning',
    })
    await deleteActivity(row.id)
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
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedIds.value.length} 个活动吗？`, '提示', {
      type: 'warning',
    })
    await batchDeleteActivity(selectedIds.value)
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
</script>

<style scoped lang="scss">
.activities-list {
  :deep(.el-page-header) {
    margin-bottom: 16px;
  }

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
