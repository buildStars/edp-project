<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">评价管理</h2>
      <div class="stats-cards">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-label">总评价数</div>
            <div class="stat-value total">{{ total }}</div>
          </div>
        </el-card>
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-label">平均评分</div>
            <div class="stat-value rating">{{ averageRating.toFixed(1) }}</div>
          </div>
        </el-card>
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-label">五星好评</div>
            <div class="stat-value excellent">{{ stats.fiveStar }}</div>
          </div>
        </el-card>
      </div>
    </div>

    <el-card>
      <!-- 筛选栏 -->
      <div class="filter-bar">
        <el-select
          v-model="queryParams.rating"
          placeholder="评分筛选"
          clearable
          style="width: 150px"
          @change="handleFilterChange"
        >
          <el-option label="全部评分" value="" />
          <el-option label="5星" :value="5" />
          <el-option label="4星" :value="4" />
          <el-option label="3星" :value="3" />
          <el-option label="2星" :value="2" />
          <el-option label="1星" :value="1" />
        </el-select>

        <div class="search-box">
          <el-input
            v-model="queryParams.keyword"
            placeholder="搜索课程、用户"
            clearable
            style="width: 300px"
            @keyup.enter="loadList"
            @clear="loadList"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <el-button type="primary" @click="loadList">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
        </div>
      </div>

      <!-- 评价列表 -->
      <el-table
        v-loading="loading"
        :data="list"
        style="width: 100%"
      >
        <el-table-column label="课程信息" min-width="250">
          <template #default="{ row }">
            <div class="course-info">
              <el-image
                :src="row.course?.coverImage || '/default-course.png'"
                class="course-cover"
                fit="cover"
              >
                <template #error>
                  <div class="image-slot">
                    <el-icon><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
              <div class="course-details">
                <div class="course-title">{{ row.course?.title }}</div>
                <div class="course-meta">
                  <span>讲师: {{ row.course?.teacherName }}</span>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="评价用户" width="150">
          <template #default="{ row }">
            <div class="user-info">
              <el-avatar :size="32" :src="row.user?.avatar">
                {{ row.user?.realName?.[0] || row.user?.nickname?.[0] || '用' }}
              </el-avatar>
              <span class="user-name">
                {{ row.user?.realName || row.user?.nickname || '匿名用户' }}
              </span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="总评分" width="120">
          <template #default="{ row }">
            <el-rate
              v-model="row.rating"
              disabled
              show-score
              text-color="#ff9900"
            />
          </template>
        </el-table-column>

        <el-table-column label="详细评分" width="200">
          <template #default="{ row }">
            <div class="rating-details">
              <div class="rating-item" v-if="row.contentRating">
                <span class="rating-label">内容:</span>
                <el-rate v-model="row.contentRating" disabled size="small" />
              </div>
              <div class="rating-item" v-if="row.teacherRating">
                <span class="rating-label">讲师:</span>
                <el-rate v-model="row.teacherRating" disabled size="small" />
              </div>
              <div class="rating-item" v-if="row.organizationRating">
                <span class="rating-label">组织:</span>
                <el-rate v-model="row.organizationRating" disabled size="small" />
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="评价内容" min-width="300" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="comment-text">{{ row.comment || '无评价内容' }}</div>
          </template>
        </el-table-column>

        <el-table-column label="评价时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleViewDetail(row)">
              查看
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

    <!-- 详情对话框 -->
    <el-dialog
      v-model="detailVisible"
      title="评价详情"
      width="700px"
    >
      <div v-if="currentEvaluation" class="evaluation-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="课程">
            {{ currentEvaluation.course?.title }}
          </el-descriptions-item>
          <el-descriptions-item label="讲师">
            {{ currentEvaluation.course?.teacherName }}
          </el-descriptions-item>
          <el-descriptions-item label="评价用户">
            {{ currentEvaluation.user?.realName || currentEvaluation.user?.nickname || '匿名用户' }}
          </el-descriptions-item>
          <el-descriptions-item label="评价时间">
            {{ formatDate(currentEvaluation.createdAt) }}
          </el-descriptions-item>
          <el-descriptions-item label="总评分">
            <el-rate
              v-model="currentEvaluation.rating"
              disabled
              show-score
              text-color="#ff9900"
            />
          </el-descriptions-item>
          <el-descriptions-item label="详细评分">
            <div class="detail-ratings">
              <div v-if="currentEvaluation.contentRating">
                内容: <el-rate v-model="currentEvaluation.contentRating" disabled size="small" />
              </div>
              <div v-if="currentEvaluation.teacherRating">
                讲师: <el-rate v-model="currentEvaluation.teacherRating" disabled size="small" />
              </div>
              <div v-if="currentEvaluation.organizationRating">
                组织: <el-rate v-model="currentEvaluation.organizationRating" disabled size="small" />
              </div>
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="评价内容" :span="2">
            <div class="comment-content">
              {{ currentEvaluation.comment || '无评价内容' }}
            </div>
          </el-descriptions-item>
        </el-descriptions>

        <div class="course-preview" v-if="currentEvaluation.course?.coverImage">
          <div class="preview-label">课程封面：</div>
          <el-image
            :src="currentEvaluation.course.coverImage"
            fit="cover"
            style="width: 200px; height: 150px; border-radius: 8px;"
          />
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="detailVisible = false">关闭</el-button>
          <el-button type="danger" @click="handleDelete(currentEvaluation)">
            删除此评价
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Picture } from '@element-plus/icons-vue'
import {
  getEvaluationList,
  deleteEvaluation,
  type Evaluation,
} from '@/api/evaluation'
import { formatDate } from '@/utils/format'

// 查询参数
const queryParams = reactive({
  page: 1,
  pageSize: 10,
  rating: '',
  keyword: '',
})

// 列表数据
const loading = ref(false)
const list = ref<Evaluation[]>([])
const total = ref(0)

// 统计数据
const stats = reactive({
  fiveStar: 0,
  fourStar: 0,
  threeStar: 0,
  twoStar: 0,
  oneStar: 0,
})

// 计算平均评分
const averageRating = computed(() => {
  if (list.value.length === 0) return 0
  const sum = list.value.reduce((acc, item) => acc + item.rating, 0)
  return sum / list.value.length
})

// 详情对话框
const detailVisible = ref(false)
const currentEvaluation = ref<Evaluation | null>(null)

/**
 * 加载列表
 */
const loadList = async () => {
  loading.value = true
  try {
    const data = await getEvaluationList(queryParams)
    list.value = data.items || []
    total.value = data.total || 0

    // 计算统计数据
    stats.fiveStar = list.value.filter((item) => item.rating === 5).length
    stats.fourStar = list.value.filter((item) => item.rating === 4).length
    stats.threeStar = list.value.filter((item) => item.rating === 3).length
    stats.twoStar = list.value.filter((item) => item.rating === 2).length
    stats.oneStar = list.value.filter((item) => item.rating === 1).length
  } catch (error: any) {
    ElMessage.error(error.message || '加载失败')
  } finally {
    loading.value = false
  }
}

/**
 * 筛选变化
 */
const handleFilterChange = () => {
  queryParams.page = 1
  loadList()
}

/**
 * 查看详情
 */
const handleViewDetail = (row: Evaluation) => {
  currentEvaluation.value = row
  detailVisible.value = true
}

/**
 * 删除评价
 */
const handleDelete = async (row: Evaluation | null) => {
  if (!row) return

  try {
    await ElMessageBox.confirm(
      `确定要删除这条评价吗？此操作不可恢复`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    await deleteEvaluation(row.id)
    ElMessage.success('删除成功')
    detailVisible.value = false
    loadList()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

// 初始化
onMounted(() => {
  loadList()
})
</script>

<style lang="scss" scoped>
.page-container {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;

  .page-title {
    font-size: 24px;
    color: #333;
    margin-bottom: 16px;
  }

  .stats-cards {
    display: flex;
    gap: 16px;

    .stat-card {
      flex: 1;
      cursor: pointer;
      transition: transform 0.2s;

      &:hover {
        transform: translateY(-2px);
      }

      .stat-content {
        text-align: center;

        .stat-label {
          font-size: 14px;
          color: #666;
          margin-bottom: 8px;
        }

        .stat-value {
          font-size: 32px;
          font-weight: bold;

          &.total {
            color: #409eff;
          }

          &.rating {
            color: #ff9900;
          }

          &.excellent {
            color: #67c23a;
          }
        }
      }
    }
  }
}

.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  .search-box {
    display: flex;
    gap: 10px;
  }
}

.course-info {
  display: flex;
  gap: 12px;
  align-items: center;

  .course-cover {
    width: 80px;
    height: 60px;
    border-radius: 4px;
    flex-shrink: 0;

    .image-slot {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      background: #f5f7fa;
      color: #909399;
    }
  }

  .course-details {
    flex: 1;

    .course-title {
      font-size: 14px;
      font-weight: 500;
      color: #333;
      margin-bottom: 6px;
    }

    .course-meta {
      font-size: 12px;
      color: #909399;
    }
  }
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;

  .user-name {
    font-size: 14px;
    color: #333;
  }
}

.rating-details {
  .rating-item {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;

    &:last-child {
      margin-bottom: 0;
    }

    .rating-label {
      font-size: 12px;
      color: #666;
      width: 40px;
    }
  }
}

.comment-text {
  font-size: 14px;
  color: #333;
  line-height: 1.6;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.evaluation-detail {
  .detail-ratings {
    div {
      margin-bottom: 8px;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  .comment-content {
    font-size: 14px;
    color: #333;
    line-height: 1.8;
    padding: 10px;
    background: #f5f7fa;
    border-radius: 4px;
    min-height: 60px;
  }

  .course-preview {
    margin-top: 20px;

    .preview-label {
      font-size: 14px;
      color: #666;
      margin-bottom: 10px;
    }
  }

  :deep(.el-descriptions__body) {
    background: #fff;
  }

  :deep(.el-descriptions__label) {
    width: 120px;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
