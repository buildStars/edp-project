<template>
  <div class="activities-container">
    <!-- 搜索栏 -->
    <el-card shadow="never" class="search-card">
      <el-form :model="queryParams" inline>
        <el-form-item label="协会">
          <el-select
            v-model="queryParams.associationId"
            placeholder="全部协会"
            clearable
            filterable
            style="width: 200px"
          >
            <el-option
              v-for="assoc in associations"
              :key="assoc.id"
              :label="assoc.name"
              :value="assoc.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input
            v-model="queryParams.keyword"
            placeholder="请输入活动标题"
            clearable
            style="width: 200px"
            @keyup.enter="loadData"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="loadData">搜索</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作栏 -->
    <el-card shadow="never" class="toolbar-card">
      <el-button type="primary" :icon="Plus" @click="handleAdd">创建活动</el-button>
    </el-card>

    <!-- 表格 -->
    <el-card shadow="never">
      <el-table v-loading="loading" :data="tableData" stripe>
        <el-table-column label="封面" width="120">
          <template #default="{ row }">
            <el-image
              v-if="row.images && row.images.length > 0"
              :src="row.images[0]"
              fit="cover"
              style="width: 80px; height: 80px; border-radius: 4px"
              :preview-src-list="row.images"
            />
            <span v-else class="text-secondary">暂无图片</span>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="活动标题" min-width="200" show-overflow-tooltip />
        <el-table-column label="关联协会" width="150">
          <template #default="{ row }">
            <el-tag v-if="row.association" type="primary">
              {{ row.association.name }}
            </el-tag>
            <el-tag v-else type="info">无关联</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'PUBLISHED' ? 'success' : 'warning'">
              {{ row.status === 'PUBLISHED' ? '已发布' : '草稿' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="views" label="浏览量" width="100" align="center">
          <template #default="{ row }">
            <el-text type="info">
              <el-icon><View /></el-icon>
              {{ row.views }}
            </el-text>
          </template>
        </el-table-column>
        <el-table-column prop="likes" label="点赞数" width="100" align="center">
          <template #default="{ row }">
            <el-text type="danger">
              <el-icon><StarFilled /></el-icon>
              {{ row.likes }}
            </el-text>
          </template>
        </el-table-column>
        <el-table-column label="发布时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.publishTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadData"
          @current-change="loadData"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, View, StarFilled } from '@element-plus/icons-vue'
import { getActivityList, deleteActivity } from '@/api/activity'
import { getAssociationList } from '@/api/association'
import dayjs from 'dayjs'

const router = useRouter()

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const associations = ref([])

const queryParams = reactive({
  page: 1,
  pageSize: 10,
  associationId: '',
  keyword: '',
})

// 格式化日期
const formatDate = (date: string) => {
  return date ? dayjs(date).format('YYYY-MM-DD HH:mm:ss') : '-'
}

// 加载协会列表
const loadAssociations = async () => {
  try {
    const res = await getAssociationList({ page: 1, pageSize: 100 })
    associations.value = res.items || []
  } catch (error: any) {
    console.error('加载协会列表失败:', error)
  }
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const params: any = {
      page: queryParams.page,
      pageSize: queryParams.pageSize,
    }
    
    if (queryParams.associationId) {
      params.associationId = queryParams.associationId
    }
    
    if (queryParams.keyword) {
      params.keyword = queryParams.keyword
    }

    const res = await getActivityList(params)
    tableData.value = res.items || []
    total.value = res.total || 0
  } catch (error: any) {
    ElMessage.error(error.message || '加载失败')
  } finally {
    loading.value = false
  }
}

// 重置
const handleReset = () => {
  queryParams.page = 1
  queryParams.associationId = ''
  queryParams.keyword = ''
  loadData()
}

// 新增
const handleAdd = () => {
  router.push('/associations/activities/create')
}

// 编辑
const handleEdit = (row: any) => {
  router.push({
    path: '/associations/activities/edit',
    query: { id: row.id },
  })
}

// 删除
const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(`确定要删除活动"${row.title}"吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    await deleteActivity(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

onMounted(() => {
  loadAssociations()
  loadData()
})
</script>

<style scoped lang="scss">
.activities-container {
  padding: 20px;
}

.search-card,
.toolbar-card {
  margin-bottom: 16px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.text-secondary {
  color: #909399;
  font-size: 12px;
}
</style>
