<template>
  <el-container class="admin-layout">
    <!-- 侧边栏 -->
    <el-aside :width="isCollapse ? '64px' : '220px'" class="sidebar">
      <div class="logo" :class="{ collapse: isCollapse }">
        <img src="@/assets/logo.png" v-if="!isCollapse" alt="Logo" />
        <span v-if="!isCollapse">EDP管理后台</span>
        <span v-else>EDP</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :unique-opened="true"
        router
        class="sidebar-menu"
      >
        <template v-for="route in menuRoutes" :key="route.path">
          <sidebar-item :route="route" />
        </template>
      </el-menu>
    </el-aside>

    <!-- 主体内容 -->
    <el-container>
      <!-- 顶部导航栏 -->
      <el-header class="header">
        <div class="header-left">
          <el-icon class="collapse-icon" @click="toggleCollapse">
            <Expand v-if="isCollapse" />
            <Fold v-else />
          </el-icon>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item v-for="item in breadcrumbs" :key="item.path" :to="item.path">
              {{ item.meta?.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <div class="user-info">
              <el-avatar :src="userInfo?.avatar" :size="32">
                {{ userInfo?.nickname?.charAt(0) }}
              </el-avatar>
              <span class="username">{{ userInfo?.nickname || userInfo?.username }}</span>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                <el-dropdown-item command="changePassword">修改密码</el-dropdown-item>
                <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 内容区域 -->
      <el-main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="fade-transform" mode="out-in">
            <component :is="Component" :key="route.fullPath" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>

  <!-- 修改密码对话框 -->
  <el-dialog v-model="passwordDialogVisible" title="修改密码" width="500px">
    <el-form ref="passwordFormRef" :model="passwordForm" :rules="passwordRules" label-width="100px">
      <el-form-item label="原密码" prop="oldPassword">
        <el-input v-model="passwordForm.oldPassword" type="password" show-password />
      </el-form-item>
      <el-form-item label="新密码" prop="newPassword">
        <el-input v-model="passwordForm.newPassword" type="password" show-password />
      </el-form-item>
      <el-form-item label="确认密码" prop="confirmPassword">
        <el-input v-model="passwordForm.confirmPassword" type="password" show-password />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="passwordDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="handleChangePassword" :loading="loading">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { changePassword } from '@/api/auth'
import { ElMessage, ElMessageBox, FormInstance, FormRules } from 'element-plus'
import { Expand, Fold } from '@element-plus/icons-vue'
import SidebarItem from './components/SidebarItem.vue'
import { menuConfig, filterMenusByPermissions } from '@/config/permissions'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// 侧边栏折叠状态
const isCollapse = ref(false)
const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

// 当前激活的菜单
const activeMenu = computed(() => {
  // 如果当前路由的 meta 中指定了 activeMenu，则使用它
  if (route.meta.activeMenu) {
    return route.meta.activeMenu as string
  }
  // 否则使用当前路由的 path
  return route.path
})

// 用户信息
const userInfo = computed(() => authStore.userInfo)

// 菜单路由（基于权限过滤）
const menuRoutes = computed(() => {
  const permissions = authStore.permissions || []
  const userRole = authStore.userInfo?.role
  
  // 根据用户权限和角色过滤菜单
  return filterMenusByPermissions(menuConfig, permissions, userRole)
})

// 面包屑导航
const breadcrumbs = computed(() => {
  return route.matched.filter((item) => item.meta && item.meta.title)
})

// 修改密码
const passwordDialogVisible = ref(false)
const passwordFormRef = ref<FormInstance>()
const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})
const loading = ref(false)

const validateConfirmPassword = (_rule: any, value: any, callback: any) => {
  if (value !== passwordForm.value.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const passwordRules: FormRules = {
  oldPassword: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度为6-20位', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' },
  ],
}

const handleChangePassword = async () => {
  if (!passwordFormRef.value) return

  await passwordFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        await changePassword({
          oldPassword: passwordForm.value.oldPassword,
          newPassword: passwordForm.value.newPassword,
        })
        ElMessage.success('密码修改成功，请重新登录')
        passwordDialogVisible.value = false
        await authStore.logout()
      } catch (error) {
        // 错误已在request中处理
      } finally {
        loading.value = false
      }
    }
  })
}

// 用户操作
// 初始化：刷新页面时重新获取用户权限
onMounted(async () => {
  // 如果有 token 但没有权限数据，说明是刷新页面，需要重新获取
  if (authStore.token && authStore.permissions.length === 0) {
    try {
      await authStore.fetchUserInfo()
      console.log('✅ 页面刷新后已重新获取用户权限')
    } catch (error) {
      console.error('❌ 获取用户权限失败:', error)
      // 权限获取失败，可能 token 已过期，跳转登录页
      ElMessage.error('会话已过期，请重新登录')
      await authStore.logout(true)
    }
  }
})

const handleCommand = async (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'changePassword':
      passwordDialogVisible.value = true
      passwordForm.value = {
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      }
      break
    case 'logout':
      await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
      await authStore.logout()
      break
  }
}
</script>

<style lang="scss" scoped>
.admin-layout {
  width: 100%;
  height: 100%;

  .sidebar {
    background: linear-gradient(180deg, #1a2332 0%, #253447 100%);
    transition: width 0.3s;
    overflow-x: hidden;
    box-shadow: 2px 0 6px rgba(0, 21, 41, 0.1);

    .logo {
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;
      font-size: 18px;
      font-weight: bold;
      transition: all 0.3s;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);

      img {
        height: 40px;
        margin-right: 10px;
      }

      &.collapse {
        font-size: 16px;
      }
    }

    .sidebar-menu {
      border: none;
      background: transparent;
      
      :deep(.el-menu-item) {
        color: #bfcbd9;
        
        &:hover {
          background: rgba(0, 0, 0, 0.1) !important;
          color: #fff;
        }
        
        &.is-active {
          background: linear-gradient(90deg, rgba(102, 126, 234, 0.2) 0%, transparent 100%) !important;
          color: #409eff;
          border-right: 3px solid #409eff;
          
          &::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 3px;
            background: linear-gradient(180deg, #667eea 0%, #409eff 100%);
          }
        }
      }
      
      :deep(.el-sub-menu__title) {
        color: #bfcbd9;
        
        &:hover {
          background: rgba(0, 0, 0, 0.1) !important;
          color: #fff;
        }
      }
      
      :deep(.el-sub-menu.is-active > .el-sub-menu__title) {
        color: #409eff;
      }
      
      :deep(.el-menu) {
        background: rgba(0, 0, 0, 0.1);
      }
    }
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #fff;
    border-bottom: 1px solid #e6e6e6;
    padding: 0 24px;
    box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);

    .header-left {
      display: flex;
      align-items: center;
      gap: 20px;

      .collapse-icon {
        font-size: 20px;
        cursor: pointer;
        transition: all 0.3s;
        padding: 8px;
        border-radius: 4px;

        &:hover {
          color: #409eff;
          background: #ecf5ff;
        }
      }

      :deep(.el-breadcrumb) {
        font-size: 14px;

        .el-breadcrumb__item {
          .el-breadcrumb__inner {
            color: #606266;
            font-weight: 500;
            transition: color 0.3s;

            &:hover {
              color: #409eff;
            }
          }

          &:last-child .el-breadcrumb__inner {
            color: #409eff;
          }
        }
      }
    }

    .header-right {
      .user-info {
        display: flex;
        align-items: center;
        gap: 12px;
        cursor: pointer;
        padding: 8px 12px;
        border-radius: 20px;
        transition: all 0.3s;

        &:hover {
          background: #f5f7fa;
        }

        .username {
          font-size: 14px;
          font-weight: 500;
          color: #303133;
        }
      }
    }
  }

  .main-content {
    background: linear-gradient(135deg, #f5f7fa 0%, #e8ebf0 100%);
    min-height: calc(100vh - 60px);
    padding: 0;
    overflow-y: auto;
    
    &::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    
    &::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.05);
    }
    
    &::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.2);
      border-radius: 4px;
      
      &:hover {
        background: rgba(0, 0, 0, 0.3);
      }
    }
  }
}

// 过渡动画
.fade-transform-leave-active,
.fade-transform-enter-active {
  transition: all 0.2s;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>

