<template>
  <div class="course-evaluations">
    <el-page-header @back="handleBack">
      <template #content>
        <span class="page-title">{{ courseTitle }} - 课程评价</span>
      </template>
    </el-page-header>

    <el-card class="mt-20">
      <!-- 统计信息 -->
      <el-row :gutter="20" class="stats-row">
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-value">{{ statistics.totalCount }}</div>
            <div class="stat-label">评价总数</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-value">{{ statistics.averageRating }}</div>
            <div class="stat-label">平均评分</div>
            <el-rate
              :model-value="statistics.averageRating"
              disabled
              show-score
              text-color="#ff9900"
            />
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-value">{{ statistics.evaluationRate }}%</div>
            <div class="stat-label">评价率</div>
            <el-progress
              :percentage="statistics.evaluationRate"
              :color="getProgressColor(statistics.evaluationRate)"
            />
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-value">{{ statistics.totalStudents }}</div>
            <div class="stat-label">总学员数</div>
          </div>
        </el-col>
      </el-row>

      <!-- 评分分布 -->
      <div class="rating-distribution mt-20">
        <div class="section-title">评分分布</div>
        <div class="distribution-chart">
          <div
            v-for="star in [5, 4, 3, 2, 1]"
            :key="star"
            class="distribution-item"
          >
            <div class="star-label">{{ star }}星</div>
            <el-progress
              :percentage="getStarPercentage(star)"
              :color="getStarColor(star)"
            >
              <span class="progress-text">{{ statistics.ratingDistribution[star] }}人</span>
            </el-progress>
          </div>
        </div>
      </div>

      <!-- 评价列表 -->
      <div class="mt-20">
        <div class="section-title">学员评价</div>
        <div v-if="evaluations.length > 0" class="evaluations-list">
          <div
            v-for="evaluation in evaluations"
            :key="evaluation.id"
            class="evaluation-item"
          >
            <div class="evaluation-header">
              <div class="user-info">
                <el-avatar :src="evaluation.user.avatar" :size="40">
                  {{ evaluation.user.realName?.charAt(0) || evaluation.user.nickname?.charAt(0) || '学' }}
                </el-avatar>
                <div class="user-detail">
                  <div class="user-name">{{ evaluation.user.realName || evaluation.user.nickname }}</div>
                  <div class="eval-time">{{ formatDate(evaluation.createdAt) }}</div>
                </div>
              </div>
              <div class="rating-score">
                <el-rate
                  :model-value="evaluation.rating"
                  disabled
                  show-score
                  text-color="#ff9900"
                />
              </div>
            </div>
            
            <!-- 详细评分 -->
            <div v-if="hasDetailRatings(evaluation)" class="detail-ratings">
              <div v-if="evaluation.contentRating" class="rating-row">
                <span class="rating-label">内容质量：</span>
                <el-rate
                  :model-value="evaluation.contentRating"
                  disabled
                  size="small"
                />
                <span class="rating-value">{{ evaluation.contentRating }}分</span>
              </div>
              <div v-if="evaluation.teacherRating" class="rating-row">
                <span class="rating-label">讲师水平：</span>
                <el-rate
                  :model-value="evaluation.teacherRating"
                  disabled
                  size="small"
                />
                <span class="rating-value">{{ evaluation.teacherRating }}分</span>
              </div>
              <div v-if="evaluation.organizationRating" class="rating-row">
                <span class="rating-label">组织服务：</span>
                <el-rate
                  :model-value="evaluation.organizationRating"
                  disabled
                  size="small"
                />
                <span class="rating-value">{{ evaluation.organizationRating }}分</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <el-empty v-else-if="!loading" description="暂无评价" />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getCourseEvaluationStats } from '@/api/teacher'
import type { Evaluation, EvaluationStatsResponse } from '@/api/teacher'
import { formatDate } from '@/utils/format'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const evaluations = ref<Evaluation[]>([])
const statistics = ref({
  totalCount: 0,
  averageRating: 0,
  ratingDistribution: {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  },
  evaluationRate: 0,
  totalStudents: 0,
})

const courseId = route.query.courseId as string
const courseTitle = route.query.courseTitle as string

// 加载评价统计
const loadEvaluationStats = async () => {
  if (!courseId) {
    ElMessage.error('缺少课程ID')
    return
  }

  loading.value = true
  try {
    const res: EvaluationStatsResponse = await getCourseEvaluationStats(courseId)
    evaluations.value = res.evaluations
    statistics.value = res.statistics
  } catch (error: any) {
    ElMessage.error(error.message || '加载失败')
  } finally {
    loading.value = false
  }
}

// 获取星级百分比
const getStarPercentage = (star: number) => {
  if (statistics.value.totalCount === 0) return 0
  return Math.round((statistics.value.ratingDistribution[star] / statistics.value.totalCount) * 100)
}

// 获取星级颜色
const getStarColor = (star: number) => {
  const colors: Record<number, string> = {
    5: '#67c23a',
    4: '#95d475',
    3: '#e6a23c',
    2: '#f56c6c',
    1: '#f56c6c',
  }
  return colors[star] || '#909399'
}

// 获取进度条颜色
const getProgressColor = (percentage: number) => {
  if (percentage >= 80) return '#67c23a'
  if (percentage >= 60) return '#e6a23c'
  return '#f56c6c'
}

// 判断是否有详细评分
const hasDetailRatings = (evaluation: Evaluation) => {
  return evaluation.contentRating || evaluation.teacherRating || evaluation.organizationRating
}

// 返回
const handleBack = () => {
  router.back()
}

onMounted(() => {
  loadEvaluationStats()
})
</script>

<style scoped lang="scss">
.course-evaluations {
  .page-title {
    font-size: 18px;
    font-weight: 600;
  }

  .stats-row {
    .stat-item {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
      border-radius: 8px;
      color: #fff;
      text-align: center;

      .stat-value {
        font-size: 32px;
        font-weight: 600;
        margin-bottom: 8px;
      }

      .stat-label {
        font-size: 14px;
        margin-bottom: 8px;
        opacity: 0.9;
      }

      :deep(.el-rate) {
        justify-content: center;
      }

      :deep(.el-progress) {
        margin-top: 8px;
      }
    }

    .el-col:nth-child(2) .stat-item {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }

    .el-col:nth-child(3) .stat-item {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    }

    .el-col:nth-child(4) .stat-item {
      background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
    }
  }

  .section-title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 16px;
    color: #303133;
  }

  .rating-distribution {
    background: #f5f7fa;
    padding: 20px;
    border-radius: 8px;

    .distribution-chart {
      .distribution-item {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 12px;

        &:last-child {
          margin-bottom: 0;
        }

        .star-label {
          width: 50px;
          font-size: 14px;
          color: #606266;
        }

        :deep(.el-progress) {
          flex: 1;
        }

        .progress-text {
          font-size: 12px;
          color: #606266;
        }
      }
    }
  }

  .evaluations-list {
    .evaluation-item {
      background: #fff;
      border: 1px solid #e4e7ed;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 16px;

      &:last-child {
        margin-bottom: 0;
      }

      .evaluation-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;

        .user-info {
          display: flex;
          align-items: center;
          gap: 12px;

          .user-detail {
            .user-name {
              font-size: 14px;
              font-weight: 500;
              color: #303133;
              margin-bottom: 4px;
            }

            .eval-time {
              font-size: 12px;
              color: #909399;
            }
          }
        }
      }

      .detail-ratings {
        background: #f5f7fa;
        padding: 12px;
        border-radius: 4px;

        .rating-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;

          &:last-child {
            margin-bottom: 0;
          }

          .rating-label {
            width: 80px;
            font-size: 13px;
            color: #606266;
          }

          .rating-value {
            font-size: 13px;
            color: #909399;
            margin-left: 8px;
          }
        }
      }
    }
  }
}
</style>





