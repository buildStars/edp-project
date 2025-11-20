<template>
  <div class="associations-list">
    <!-- 搜索栏 -->
    <el-card shadow="never" class="search-card">
      <el-form :model="queryParams" inline>
        <el-form-item label="协会类型">
          <el-select v-model="queryParams.type" placeholder="全部" clearable style="width: 150px">
            <el-option label="同学会" value="ALUMNI" />
            <el-option label="俱乐部" value="CLUB" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input
            v-model="queryParams.keyword"
            placeholder="请输入协会名称"
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
      <el-button type="primary" :icon="Plus" @click="handleAdd">新增协会</el-button>
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
        <el-table-column label="协会LOGO" width="100">
          <template #default="{ row }">
            <el-image
              v-if="row.logo"
              :src="row.logo"
              fit="cover"
              style="width: 60px; height: 60px; border-radius: 4px"
              :preview-src-list="[row.logo]"
            />
            <span v-else class="text-secondary">暂无图片</span>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="协会名称" min-width="150" />
        <el-table-column label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.type === 'ALUMNI' ? 'primary' : 'success'">
              {{ row.type === 'ALUMNI' ? '同学会' : '俱乐部' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="简介" min-width="200" show-overflow-tooltip />
        <el-table-column prop="contactPerson" label="联系人" width="100" />
        <el-table-column prop="contactPhone" label="联系电话" width="120" />
        <el-table-column prop="views" label="浏览量" width="100" align="center" />
        <el-table-column label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="primary" @click="handleViewActivities(row)">查看活动</el-button>
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, Delete } from '@element-plus/icons-vue'
import { getAssociationList, deleteAssociation, batchDeleteAssociation } from '@/api/association'
import type { Association } from '@/types/models'
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
} = useTable<Association>({
  fetchApi: getAssociationList,
  immediate: false,
})

const selectedIds = ref<string[]>([])
const handleSelectionChange = (selection: Association[]) => {
  selectedIds.value = selection.map(item => item.id)
}

// 新增
const handleAdd = () => {
  router.push('/associations/create')
}

// 编辑
const handleEdit = (row: Association) => {
  router.push(`/associations/edit/${row.id}`)
}

// 查看活动
const handleViewActivities = (row: Association) => {
  router.push(`/associations/activities?associationId=${row.id}&name=${row.name}`)
}

// 删除
const handleDelete = async (row: Association) => {
  try {
    await ElMessageBox.confirm(`确定要删除协会"${row.name}"吗？`, '提示', {
      type: 'warning',
    })
    await deleteAssociation(row.id)
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
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedIds.value.length} 个协会吗？`, '提示', {
      type: 'warning',
    })
    await batchDeleteAssociation(selectedIds.value)
    ElMessage.success('删除成功')
    selectedIds.value = []
    handleSearch()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

// 初始加载
handleSearch()
</script>

<style scoped lang="scss">
.associations-list {
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
