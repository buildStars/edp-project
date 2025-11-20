<template>
  <div class="page-container">
    <h2 class="page-title">资讯管理</h2>

    <!-- 搜索栏 -->
    <el-card class="search-bar">
      <el-form :inline="true" :model="queryParams">
        <el-form-item label="分类">
          <el-select v-model="queryParams.category" placeholder="请选择分类" clearable>
            <el-option label="学院通知" value="NOTICE" />
            <el-option label="校友动态" value="ALUMNI" />
          </el-select>
        </el-form-item>

        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
            <el-option label="草稿" value="DRAFT" />
            <el-option label="已发布" value="PUBLISHED" />
            <el-option label="已归档" value="ARCHIVED" />
          </el-select>
        </el-form-item>

        <el-form-item label="关键词">
          <el-input
            v-model="queryParams.keyword"
            placeholder="请输入标题关键词"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作栏 -->
    <el-card class="mt-20">
      <div class="table-toolbar">
        <div>
          <el-button v-permission="'news:create'" type="primary" @click="handleCreate">
            <el-icon><Plus /></el-icon>
            发布资讯
          </el-button>
          <el-button
            v-permission="'news:delete'"
            type="danger"
            :disabled="selectedIds.length === 0"
            @click="handleBatchDelete"
          >
            <el-icon><Delete /></el-icon>
            批量删除
          </el-button>
        </div>
      </div>

      <!-- 表格 -->
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
              :preview-src-list="[row.coverImage]"
              fit="cover"
              class="cover-image"
            />
            <span v-else class="text-secondary">暂无封面</span>
          </template>
        </el-table-column>

        <el-table-column prop="title" label="标题" min-width="200">
          <template #default="{ row }">
            <div class="flex" style="align-items: center; gap: 8px">
              <el-tag v-if="row.isTop" type="danger" size="small">置顶</el-tag>
              <span>{{ row.title }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="category" label="分类" width="100">
          <template #default="{ row }">
            <el-tag :type="row.category === 'NOTICE' ? 'warning' : 'success'">
              {{ getCategoryLabel(row.category) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="views" label="浏览量" width="100" />

        <el-table-column prop="publishTime" label="发布时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.publishTime) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button v-permission="'news:edit'" link type="primary" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button
              v-permission="'news:edit'"
              link
              :type="row.isTop ? 'warning' : 'primary'"
              @click="handleToggleTop(row)"
            >
              {{ row.isTop ? '取消置顶' : '置顶' }}
            </el-button>
            <el-button
              v-if="row.status === 'DRAFT'"
              v-permission="'news:publish'"
              link
              type="success"
              @click="handlePublish(row)"
            >
              发布
            </el-button>
            <el-button
              v-if="row.status === 'PUBLISHED'"
              v-permission="'news:publish'"
              link
              type="warning"
              @click="handleArchive(row)"
            >
              归档
            </el-button>
            <el-button v-permission="'news:delete'" link type="danger" @click="handleDelete(row)">
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
        class="mt-20"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, Delete } from '@element-plus/icons-vue'
import { useTable } from '@/composables/useTable'
import { formatDate, getStatusLabel } from '@/utils/format'
import {
  getNewsList,
  deleteNews,
  batchDeleteNews,
  toggleTopNews,
  publishNews,
  archiveNews,
} from '@/api/news'
import type { News } from '@/types/models'

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
  refresh,
} = useTable<News>({
  fetchApi: getNewsList,
  immediate: true,
})

// 选中的ID
const selectedIds = ref<string[]>([])

// 选择变化
const handleSelectionChange = (selection: News[]) => {
  selectedIds.value = selection.map((item) => item.id)
}

// 获取分类标签
const getCategoryLabel = (category: string) => {
  const map: Record<string, string> = {
    NOTICE: '学院通知',
    ALUMNI: '校友动态',
  }
  return map[category] || category
}

// 获取状态类型
const getStatusType = (status: string) => {
  const map: Record<string, any> = {
    DRAFT: 'info',
    PUBLISHED: 'success',
    ARCHIVED: 'warning',
  }
  return map[status] || 'info'
}

// 新建
const handleCreate = () => {
  router.push('/news/create')
}

// 编辑
const handleEdit = (row: News) => {
  router.push(`/news/edit/${row.id}`)
}

// 删除
const handleDelete = async (row: News) => {
  try {
    await ElMessageBox.confirm(`确定要删除资讯《${row.title}》吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    await deleteNews(row.id)
    ElMessage.success('删除成功')
    refresh()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('Delete failed:', error)
    }
  }
}

// 批量删除
const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedIds.value.length} 条资讯吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    await batchDeleteNews(selectedIds.value)
    ElMessage.success('删除成功')
    selectedIds.value = []
    refresh()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('Batch delete failed:', error)
    }
  }
}

// 置顶/取消置顶
const handleToggleTop = async (row: News) => {
  try {
    const action = row.isTop ? '取消置顶' : '置顶'
    await ElMessageBox.confirm(`确定要${action}该资讯吗？${!row.isTop ? '（将取消其他资讯的置顶）' : ''}`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    await toggleTopNews(row.id, !row.isTop)
    ElMessage.success(`${action}成功`)
    refresh()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('Toggle top failed:', error)
    }
  }
}

// 发布
const handlePublish = async (row: News) => {
  try {
    await ElMessageBox.confirm('确定要发布该资讯吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info',
    })

    await publishNews(row.id)
    ElMessage.success('发布成功')
    refresh()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('Publish failed:', error)
    }
  }
}

// 归档
const handleArchive = async (row: News) => {
  try {
    await ElMessageBox.confirm('确定要归档该资讯吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    await archiveNews(row.id)
    ElMessage.success('归档成功')
    refresh()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('Archive failed:', error)
    }
  }
}
</script>

<style lang="scss" scoped>
.page-title {
  font-size: 24px;
  color: #333;
  margin-bottom: 20px;
}

.cover-image {
  width: 80px;
  height: 60px;
  border-radius: 4px;
}

.text-secondary {
  color: #999;
  font-size: 12px;
}
</style>


