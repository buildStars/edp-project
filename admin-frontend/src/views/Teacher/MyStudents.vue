<template>
  <div class="teacher-students">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>我的学员 (共 {{ total }} 人)</span>
          <el-input
            v-model="keyword"
            placeholder="搜索学员姓名/手机号"
            clearable
            style="width: 300px"
            @keyup.enter="handleSearch"
          >
            <template #append>
              <el-button :icon="Search" @click="handleSearch" />
            </template>
          </el-input>
        </div>
      </template>

      <el-table v-loading="loading" :data="students">
        <el-table-column label="头像" width="80">
          <template #default="{ row }">
            <el-avatar :src="row.avatar" :size="50">
              {{ row.realName?.charAt(0) || row.nickname?.charAt(0) || '学' }}
            </el-avatar>
          </template>
        </el-table-column>
        <el-table-column prop="realName" label="姓名" width="120" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="company" label="公司" width="150" show-overflow-tooltip />
        <el-table-column prop="position" label="职位" width="120" />
        <el-table-column label="报名课程" min-width="250">
          <template #default="{ row }">
            <el-tag
              v-for="course in row.courses"
              :key="course.id"
              class="course-tag"
              type="primary"
            >
              {{ course.title }}
            </el-tag>
            <span v-if="row.courses.length === 0" class="text-secondary">暂无课程</span>
          </template>
        </el-table-column>
        <el-table-column label="签到次数" width="100" align="center">
          <template #default="{ row }">
            <el-tag type="success">{{ row.checkinCount }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="评价次数" width="100" align="center">
          <template #default="{ row }">
            <el-tag type="warning">{{ row.evaluationCount }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="注册时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="loadStudents"
        @current-change="loadStudents"
      />

      <!-- 空状态 -->
      <el-empty v-if="!loading && students.length === 0" description="暂无学员" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { getTeacherStudents } from '@/api/teacher'
import type { StudentInfo } from '@/api/teacher'
import { formatDate } from '@/utils/format'

// 数据
const loading = ref(false)
const students = ref<StudentInfo[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const keyword = ref('')

// 加载学员列表
const loadStudents = async () => {
  loading.value = true
  try {
    const res = await getTeacherStudents({
      page: page.value,
      pageSize: pageSize.value,
      keyword: keyword.value || undefined,
    })
    students.value = res.students
    total.value = res.total
  } catch (error: any) {
    ElMessage.error(error.message || '加载失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  page.value = 1
  loadStudents()
}

onMounted(() => {
  loadStudents()
})
</script>

<style scoped lang="scss">
.teacher-students {
  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .course-tag {
    margin-right: 8px;
    margin-bottom: 4px;
  }

  .text-secondary {
    color: #909399;
    font-size: 12px;
  }

  :deep(.el-pagination) {
    margin-top: 16px;
    justify-content: flex-end;
  }
}
</style>











