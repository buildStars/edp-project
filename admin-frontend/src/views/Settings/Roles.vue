<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">角色权限管理</h2>
      <p class="page-desc">为系统各角色分配菜单和功能权限</p>
    </div>

    <!-- 角色列表 -->
    <div class="roles-grid">
      <el-card
        v-for="role in roles"
        :key="role.key"
        shadow="hover"
        class="role-card"
        :class="{ active: selectedRole === role.key }"
        @click="handleSelectRole(role.key)"
      >
        <div class="role-header">
          <div class="role-icon" :style="{ background: role.color }">
            <el-icon :size="32"><component :is="role.icon" /></el-icon>
          </div>
          <div class="role-info">
            <div class="role-name">{{ role.label }}</div>
            <div class="role-desc">{{ role.desc }}</div>
          </div>
        </div>
        <div class="role-stats">
          <div class="stat-item">
            <span class="stat-label">已授权菜单</span>
            <span class="stat-value">{{ role.permissionCount || 0 }}</span>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 权限配置 -->
    <el-card v-if="selectedRole" class="permission-config">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-icon :size="24" :style="{ color: currentRole?.color }">
              <component :is="currentRole?.icon" />
            </el-icon>
            <span class="header-title">{{ currentRole?.label }} - 权限配置</span>
          </div>
          <div class="header-actions">
            <el-button @click="handleReset">
              <el-icon><RefreshLeft /></el-icon>
              重置
            </el-button>
            <el-button type="primary" :loading="saving" @click="handleSave">
              <el-icon><Select /></el-icon>
              保存配置
            </el-button>
          </div>
        </div>
      </template>

      <el-alert
        type="info"
        :closable="false"
        show-icon
        style="margin-bottom: 20px"
      >
        <template #title>
          为 <strong>{{ currentRole?.label }}</strong> 角色分配菜单和功能权限，勾选的权限将在管理后台中对该角色可见
        </template>
      </el-alert>

      <el-tree
        ref="permissionTreeRef"
        :data="permissionTree"
        :props="treeProps"
        show-checkbox
        node-key="code"
        :default-checked-keys="checkedPermissions"
        :default-expanded-keys="expandedKeys"
        class="permission-tree"
      >
        <template #default="{ node, data }">
          <div class="tree-node-content">
            <div class="node-left">
              <el-icon v-if="data.icon" :size="16" class="node-icon">
                <component :is="data.icon" />
              </el-icon>
              <span class="node-label">{{ node.label }}</span>
            </div>
            <el-tag v-if="data.isModule" size="small" type="info">模块</el-tag>
            <el-tag v-else size="small">{{ data.code }}</el-tag>
          </div>
        </template>
      </el-tree>
    </el-card>

    <el-empty
      v-else
      description="请选择一个角色以配置权限"
      :image-size="200"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  User as UserIcon,
  UserFilled,
  Service,
  Reading,
  Setting,
  RefreshLeft,
  Select,
  DataLine,
  Tickets,
  FolderOpened,
  OfficeBuilding,
  CircleCheck,
} from '@element-plus/icons-vue'
import type { ElTree } from 'element-plus'
import { menuConfig } from '@/config/permissions'
import { getAllRolePermissions, updateRolePermissions } from '@/api/permission'

// 角色定义
const roles = ref([
  {
    key: 'STUDENT',
    label: '学员',
    desc: '报名学习的普通用户',
    icon: UserIcon,
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    permissionCount: 0,
  },
  {
    key: 'ADVISOR',
    label: '课程顾问',
    desc: '为学员提供课程咨询',
    icon: Service,
    color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    permissionCount: 0,
  },
  {
    key: 'TEACHER',
    label: '教师',
    desc: '创建和管理课程',
    icon: Reading,
    color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    permissionCount: 0,
  },
  {
    key: 'STAFF',
    label: '教务人员',
    desc: '管理课程和报名',
    icon: Setting,
    color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    permissionCount: 0,
  },
  {
    key: 'ADMIN',
    label: '管理员',
    desc: '系统最高权限',
    icon: UserFilled,
    color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    permissionCount: 0,
  },
])

// 选中的角色
const selectedRole = ref<string>('')
const currentRole = computed(() => roles.value.find((r) => r.key === selectedRole.value))

// 权限树
const permissionTreeRef = ref<InstanceType<typeof ElTree>>()
const permissionTree = ref<any[]>([])
const checkedPermissions = ref<string[]>([])
const expandedKeys = ref<string[]>([])
const treeProps = {
  label: 'label',
  children: 'children',
}
const saving = ref(false)

// 图标映射
const iconMap: Record<string, any> = {
  DataLine,
  Reading,
  UserFilled,
  User: UserIcon,
  OfficeBuilding,
  Tickets,
  FolderOpened,
  Setting,
  CircleCheck,
}

/**
 * 构建权限树
 */
const buildPermissionTree = () => {
  const tree: any[] = []

  menuConfig.forEach((menu) => {
    // 跳过个人中心（不需要权限控制）
    if (menu.path === '/profile') return

    const menuNode: any = {
      code: menu.permission || menu.path,
      label: menu.title,
      icon: menu.icon ? iconMap[menu.icon] : undefined,
      isModule: true,
      children: [],
    }

    // 如果有子菜单
    if (menu.children && menu.children.length > 0) {
      menu.children.forEach((child) => {
        if (child.permission) {
          menuNode.children.push({
            code: child.permission,
            label: child.title,
            isModule: false,
          })
        }
      })
    }

    tree.push(menuNode)
  })

  return tree
}

// 角色权限数据（从后端加载）
const rolePermissionsData = ref<Record<string, string[]>>({})

/**
 * 从后端加载所有角色权限
 */
const loadRolePermissions = async () => {
  try {
    const data = await getAllRolePermissions()
    
    // 转换为 Map 结构
    rolePermissionsData.value = {}
    data.forEach((item: any) => {
      rolePermissionsData.value[item.role] = item.permissions
    })

    // 更新角色卡片的权限数量
    roles.value.forEach((role) => {
      const permissions = rolePermissionsData.value[role.key] || []
      role.permissionCount = permissions.length
    })

    console.log('✅ 已加载角色权限配置:', rolePermissionsData.value)
  } catch (error: any) {
    console.error('❌ 加载角色权限失败:', error)
    ElMessage.error(error.message || '加载角色权限失败')
  }
}

/**
 * 获取角色的权限
 */
const getRolePermissions = (roleKey: string): string[] => {
  return rolePermissionsData.value[roleKey] || []
}

/**
 * 选择角色
 */
const handleSelectRole = (roleKey: string) => {
  selectedRole.value = roleKey
  checkedPermissions.value = getRolePermissions(roleKey)
  
  // 展开所有节点
  expandedKeys.value = permissionTree.value.map((item) => item.code)

  // 设置树的选中状态
  setTimeout(() => {
    if (permissionTreeRef.value) {
      permissionTreeRef.value.setCheckedKeys(checkedPermissions.value)
    }
  }, 0)
}

/**
 * 重置权限
 */
const handleReset = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要重新加载该角色的权限配置吗？这将放弃未保存的修改。',
      '重置确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    // 重新加载角色权限
    await loadRolePermissions()
    
    // 重新设置当前角色的权限
    const permissions = getRolePermissions(selectedRole.value)
    checkedPermissions.value = permissions
    permissionTreeRef.value?.setCheckedKeys(permissions)
    
    ElMessage.success('已重置权限配置')
  } catch (error) {
    // 用户取消
  }
}

/**
 * 保存权限配置
 */
const handleSave = async () => {
  if (!permissionTreeRef.value) return

  const checkedKeys = permissionTreeRef.value.getCheckedKeys() as string[]
  const halfCheckedKeys = permissionTreeRef.value.getHalfCheckedKeys() as string[]
  const allKeys = [...checkedKeys, ...halfCheckedKeys]

  try {
    await ElMessageBox.confirm(
      `确定要保存 ${currentRole.value?.label} 的权限配置吗？共选择了 ${checkedKeys.length} 个权限。`,
      '保存确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    saving.value = true

    // 调用后端API保存权限配置
    await updateRolePermissions(selectedRole.value, allKeys)

    // 更新本地数据
    rolePermissionsData.value[selectedRole.value] = allKeys
    
    // 更新权限数量
    const role = roles.value.find((r) => r.key === selectedRole.value)
    if (role) {
      role.permissionCount = checkedKeys.length
    }

    ElMessage.success('权限配置保存成功')
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '保存失败')
    }
  } finally {
    saving.value = false
  }
}

// 初始化
onMounted(async () => {
  permissionTree.value = buildPermissionTree()
  
  // 从后端加载角色权限数据
  await loadRolePermissions()
  
  // 默认选择第一个角色
  if (roles.value.length > 0) {
    handleSelectRole(roles.value[0].key)
  }
})
</script>

<style lang="scss" scoped>
.page-container {
  padding: 20px;
}

.page-header {
  margin-bottom: 24px;

  .page-title {
    font-size: 24px;
    color: #333;
    margin-bottom: 8px;
  }

  .page-desc {
    font-size: 14px;
    color: #666;
  }
}

.roles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 24px;

  .role-card {
    cursor: pointer;
    transition: all 0.3s;
    border: 2px solid transparent;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    &.active {
      border-color: #409eff;
      box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
    }

    .role-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 16px;

      .role-icon {
        width: 56px;
        height: 56px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        flex-shrink: 0;
      }

      .role-info {
        flex: 1;

        .role-name {
          font-size: 18px;
          font-weight: 600;
          color: #333;
          margin-bottom: 4px;
        }

        .role-desc {
          font-size: 13px;
          color: #999;
        }
      }
    }

    .role-stats {
      padding-top: 12px;
      border-top: 1px solid #f0f0f0;

      .stat-item {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .stat-label {
          font-size: 13px;
          color: #666;
        }

        .stat-value {
          font-size: 18px;
          font-weight: 600;
          color: #409eff;
        }
      }
    }
  }
}

.permission-config {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;

      .header-title {
        font-size: 16px;
        font-weight: 600;
        color: #333;
      }
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }
  }

  .permission-tree {
    margin-top: 20px;

    :deep(.el-tree-node__content) {
      height: 40px;
      padding: 0 16px;
      border-radius: 6px;

      &:hover {
        background-color: #f5f7fa;
      }
    }

    .tree-node-content {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-right: 16px;

      .node-left {
        display: flex;
        align-items: center;
        gap: 8px;

        .node-icon {
          color: #409eff;
        }

        .node-label {
          font-size: 14px;
          color: #333;
        }
      }
    }
  }
}
</style>
