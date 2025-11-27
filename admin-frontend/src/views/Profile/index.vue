<template>
  <div class="profile-container">
    <el-card class="profile-card">
      <template #header>
        <div class="card-header">
          <span class="title">个人中心</span>
        </div>
      </template>

      <div class="profile-content">
        <!-- 左侧：个人信息展示 -->
        <div class="profile-info">
          <div class="avatar-section">
            <el-avatar :size="120" :src="userInfo?.avatar" class="avatar">
              <el-icon :size="60"><User /></el-icon>
            </el-avatar>
            <el-button type="primary" link @click="showAvatarDialog = true">
              <el-icon><Camera /></el-icon>
              更换头像
            </el-button>
          </div>

          <div class="info-list">
            <div class="info-item">
              <label>用户名</label>
              <div class="value">{{ userInfo?.username }}</div>
            </div>
            <div class="info-item">
              <label>昵称</label>
              <div class="value">{{ userInfo?.nickname || '未设置' }}</div>
            </div>
            <div class="info-item">
              <label>角色</label>
              <div class="value">
                <el-tag :type="getRoleType(userInfo?.role)">
                  {{ getRoleName(userInfo?.role) }}
                </el-tag>
              </div>
            </div>
            <div class="info-item">
              <label>手机号</label>
              <div class="value">{{ userInfo?.phone || '未设置' }}</div>
            </div>
            <div class="info-item">
              <label>邮箱</label>
              <div class="value">{{ userInfo?.email || '未设置' }}</div>
            </div>
          </div>

          <div class="action-buttons">
            <el-button type="primary" @click="showEditDialog = true">
              <el-icon><Edit /></el-icon>
              编辑资料
            </el-button>
            <el-button @click="showPasswordDialog = true">
              <el-icon><Lock /></el-icon>
              修改密码
            </el-button>
          </div>
        </div>

        <!-- 右侧：统计卡片 -->
        <div class="stats-section">
          <el-row :gutter="20">
            <el-col :span="24">
              <div class="stat-card">
                <el-icon class="stat-icon" :size="40" color="#409EFF">
                  <Calendar />
                </el-icon>
                <div class="stat-content">
                  <div class="stat-label">最近登录</div>
                  <div class="stat-value">刚刚</div>
                </div>
              </div>
            </el-col>
          </el-row>

          <div class="tips-card">
            <div class="tips-title">
              <el-icon><InfoFilled /></el-icon>
              安全提示
            </div>
            <ul class="tips-list">
              <li>定期修改密码，确保账户安全</li>
              <li>请勿在公共场所使用管理系统</li>
              <li>完善个人信息，方便系统消息通知</li>
              <li>如发现异常登录，请及时联系管理员</li>
            </ul>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 编辑资料对话框 -->
    <el-dialog
      v-model="showEditDialog"
      title="编辑资料"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="editRules"
        label-width="80px"
      >
        <el-form-item label="昵称" prop="nickname">
          <el-input
            v-model="editForm.nickname"
            placeholder="请输入昵称"
            clearable
          />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input
            v-model="editForm.phone"
            placeholder="请输入手机号"
            clearable
          />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input
            v-model="editForm.email"
            placeholder="请输入邮箱"
            clearable
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSaveProfile">
          保存
        </el-button>
      </template>
    </el-dialog>

    <!-- 修改密码对话框 -->
    <el-dialog
      v-model="showPasswordDialog"
      title="修改密码"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="passwordFormRef"
        :model="passwordForm"
        :rules="passwordRules"
        label-width="100px"
      >
        <el-form-item label="原密码" prop="oldPassword">
          <el-input
            v-model="passwordForm.oldPassword"
            type="password"
            placeholder="请输入原密码"
            show-password
            clearable
          />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="passwordForm.newPassword"
            type="password"
            placeholder="请输入新密码（6-20位）"
            show-password
            clearable
          />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="passwordForm.confirmPassword"
            type="password"
            placeholder="请再次输入新密码"
            show-password
            clearable
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showPasswordDialog = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleChangePassword">
          确认修改
        </el-button>
      </template>
    </el-dialog>

    <!-- 更换头像对话框 -->
    <el-dialog
      v-model="showAvatarDialog"
      title="更换头像"
      width="400px"
      :close-on-click-modal="false"
    >
      <div class="avatar-upload-section">
        <ImageUpload
          v-model="avatarUrl"
          :limit="1"
          accept="image/*"
        />
        <div class="avatar-tips">建议上传正方形图片，大小不超过2MB</div>
      </div>
      <template #footer>
        <el-button @click="showAvatarDialog = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSaveAvatar">
          保存
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage, FormInstance, FormRules } from 'element-plus'
import {
  User,
  Edit,
  Lock,
  Camera,
  Calendar,
  InfoFilled,
} from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { updateProfile, changePassword } from '@/api/auth'
import type { UpdateProfileParams } from '@/api/auth'
import ImageUpload from '@/components/Upload/ImageUpload.vue'

// Store
const authStore = useAuthStore()
const userInfo = computed(() => authStore.userInfo)

// 对话框显示状态
const showEditDialog = ref(false)
const showPasswordDialog = ref(false)
const showAvatarDialog = ref(false)
const saving = ref(false)

// 编辑资料表单
const editFormRef = ref<FormInstance>()
const editForm = reactive<UpdateProfileParams>({
  nickname: '',
  phone: '',
  email: '',
})

// 表单验证规则
const editRules: FormRules = {
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 20, message: '昵称长度在2-20个字符', trigger: 'blur' },
  ],
  phone: [
    {
      pattern: /^1[3-9]\d{9}$/,
      message: '请输入正确的手机号',
      trigger: 'blur',
    },
  ],
  email: [
    {
      type: 'email',
      message: '请输入正确的邮箱地址',
      trigger: 'blur',
    },
  ],
}

// 修改密码表单
const passwordFormRef = ref<FormInstance>()
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

// 自定义验证规则：确认密码
const validateConfirmPassword = (_rule: any, value: string, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入新密码'))
  } else if (value !== passwordForm.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const passwordRules: FormRules = {
  oldPassword: [
    { required: true, message: '请输入原密码', trigger: 'blur' },
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在6-20个字符', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, validator: validateConfirmPassword, trigger: 'blur' },
  ],
}

// 头像上传
const avatarUrl = ref('')

// 打开编辑对话框时初始化表单
const openEditDialog = () => {
  editForm.nickname = userInfo.value?.nickname || ''
  editForm.phone = userInfo.value?.phone || ''
  editForm.email = userInfo.value?.email || ''
  showEditDialog.value = true
}

// 打开头像对话框时初始化
const openAvatarDialog = () => {
  avatarUrl.value = userInfo.value?.avatar || ''
  showAvatarDialog.value = true
}

// 保存个人资料
const handleSaveProfile = async () => {
  if (!editFormRef.value) return

  try {
    await editFormRef.value.validate()
    saving.value = true

    await updateProfile(editForm)
    
    // 刷新用户信息
    await authStore.fetchUserInfo()
    
    ElMessage.success('个人资料更新成功')
    showEditDialog.value = false
  } catch (error: any) {
    if (error !== false) {
      ElMessage.error(error.message || '更新失败')
    }
  } finally {
    saving.value = false
  }
}

// 修改密码
const handleChangePassword = async () => {
  if (!passwordFormRef.value) return

  try {
    await passwordFormRef.value.validate()
    saving.value = true

    await changePassword({
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword,
    })

    ElMessage.success('密码修改成功，请重新登录')
    showPasswordDialog.value = false

    // 重置表单
    passwordForm.oldPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''

    // 延迟后登出
    setTimeout(() => {
      authStore.logout()
    }, 1500)
  } catch (error: any) {
    if (error !== false) {
      ElMessage.error(error.message || '修改密码失败')
    }
  } finally {
    saving.value = false
  }
}

// 保存头像
const handleSaveAvatar = async () => {
  if (!avatarUrl.value) {
    ElMessage.warning('请先上传头像')
    return
  }

  try {
    saving.value = true
    await updateProfile({ avatar: avatarUrl.value })
    
    // 刷新用户信息
    await authStore.fetchUserInfo()
    
    ElMessage.success('头像更新成功')
    showAvatarDialog.value = false
  } catch (error: any) {
    ElMessage.error(error.message || '更新头像失败')
  } finally {
    saving.value = false
  }
}

// 获取角色名称
const getRoleName = (role?: string) => {
  const roleMap: Record<string, string> = {
    ADMIN: '超级管理员',
    STAFF: '运营人员',
    TEACHER: '教师',
    ADVISOR: '课程顾问',
  }
  return roleMap[role || ''] || '未知角色'
}

// 获取角色标签类型
const getRoleType = (role?: string) => {
  const typeMap: Record<string, any> = {
    ADMIN: 'danger',
    STAFF: 'warning',
    TEACHER: 'success',
    ADVISOR: 'info',
  }
  return typeMap[role || ''] || ''
}

// 监听编辑按钮点击
const handleEditClick = () => {
  openEditDialog()
}

// 监听头像更换按钮点击
const handleAvatarClick = () => {
  openAvatarDialog()
}
</script>

<style scoped lang="scss">
.profile-container {
  padding: 20px;

  .profile-card {
    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .title {
        font-size: 18px;
        font-weight: 600;
        color: #303133;
      }
    }
  }

  .profile-content {
    display: grid;
    grid-template-columns: 400px 1fr;
    gap: 40px;
    padding: 20px 0;

    @media (max-width: 1200px) {
      grid-template-columns: 1fr;
      gap: 30px;
    }
  }

  .profile-info {
    .avatar-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 15px;
      padding: 30px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px;
      margin-bottom: 30px;

      .avatar {
        background: rgba(255, 255, 255, 0.2);
        border: 4px solid rgba(255, 255, 255, 0.3);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
      }

      .el-button {
        color: #fff;
        font-size: 14px;

        &:hover {
          color: #fff;
          opacity: 0.8;
        }
      }
    }

    .info-list {
      .info-item {
        display: flex;
        align-items: center;
        padding: 16px 0;
        border-bottom: 1px solid #f0f0f0;

        &:last-child {
          border-bottom: none;
        }

        label {
          width: 80px;
          color: #909399;
          font-size: 14px;
        }

        .value {
          flex: 1;
          color: #303133;
          font-size: 14px;
          font-weight: 500;
        }
      }
    }

    .action-buttons {
      display: flex;
      gap: 12px;
      margin-top: 30px;

      .el-button {
        flex: 1;
      }
    }
  }

  .stats-section {
    display: flex;
    flex-direction: column;
    gap: 20px;

    .stat-card {
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 30px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px;
      box-shadow: 0 2px 12px rgba(102, 126, 234, 0.3);

      .stat-icon {
        color: #fff;
      }

      .stat-content {
        flex: 1;

        .stat-label {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 8px;
        }

        .stat-value {
          font-size: 24px;
          font-weight: 600;
          color: #fff;
        }
      }
    }

    .tips-card {
      padding: 24px;
      background: #f8f9fa;
      border-radius: 12px;
      border: 1px solid #e9ecef;

      .tips-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 16px;
        font-weight: 600;
        color: #303133;
        margin-bottom: 16px;

        .el-icon {
          color: #409eff;
        }
      }

      .tips-list {
        padding-left: 20px;
        margin: 0;

        li {
          color: #606266;
          font-size: 14px;
          line-height: 2;
          list-style: disc;

          &::marker {
            color: #409eff;
          }
        }
      }
    }
  }

  .avatar-upload-section {
    text-align: center;
    padding: 20px;

    .avatar-tips {
      margin-top: 16px;
      color: #909399;
      font-size: 13px;
    }
  }
}
</style>













