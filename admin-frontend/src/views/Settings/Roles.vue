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
import { ref, onMounted, computed, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
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
import { getAllPermissions, getAllRolePermissions, updateRolePermissions, getMenuConfig } from '@/api/permission'

// 角色定义（排除学员，因为学员只使用小程序，无法登录管理后台）
const roles = ref([
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

// 模块图标映射
const moduleIconMap: Record<string, any> = {
  dashboard: DataLine,
  news: Reading,
  associations: UserFilled,
  courses: Reading,
  users: UserIcon,
  organizations: OfficeBuilding,
  enrollments: Tickets,
  courseware: FolderOpened,
  achievements: CircleCheck,
  completion: CircleCheck,
  credits: CircleCheck,
  approvals: CircleCheck,
  teacher: Reading,
  statistics: DataLine,
  settings: Setting,
}

// 模块名称映射
const moduleNameMap: Record<string, string> = {
  dashboard: '首页概览',
  news: '资讯管理',
  associations: '校友生活',
  courses: '课程管理',
  users: '用户管理',
  organizations: '企业管理',
  enrollments: '报名管理',
  courseware: '课件管理',
  achievements: '学习成果管理',
  completion: '结课申请',
  credits: '学分管理',
  approvals: '审批管理',
  teacher: '教师专属',
  statistics: '数据统计',
  settings: '系统设置',
}

/**
 * 从后端菜单配置构建权限树
 * 直接使用后端的菜单结构，只显示菜单权限
 */
const buildPermissionTree = async () => {
  try {
    const response = await getMenuConfig()
    console.log('🔍 后端菜单配置:', response)
    
    // 兼容不同的响应格式
    const menus = Array.isArray(response.data) 
      ? response.data 
      : Array.isArray(response) 
        ? response 
        : []
    
    console.log('📦 解析后的菜单配置:', menus)
    
    const tree: any[] = []

    menus.forEach((menu: any) => {
      // 跳过没有权限要求的菜单（如个人中心）
      if (!menu.permission) return

      const node: any = {
        code: menu.permission,
        label: menu.title,
        icon: moduleIconMap[menu.icon] || moduleIconMap[menu.permission?.split(':')[0]],
        isModule: !!menu.children,
        children: [],
      }

      // 如果有子菜单，添加子菜单权限
      if (menu.children && menu.children.length > 0) {
        node.children = menu.children
          .filter((child: any) => child.permission) // 只要有权限的子菜单
          .map((child: any) => ({
            code: child.permission,
            label: child.title,
            isModule: false,
          }))
      }

      tree.push(node)
    })
    
    console.log('🌲 从后端菜单配置构建权限树 (' + tree.length + '个模块):', tree)
    return tree
  } catch (error) {
    console.error('❌ 构建权限树失败:', error)
    return []
  }
}

/**
 * 获取权限树中的所有权限代码（用于过滤后端返回的权限）
 */
const getTreePermissionCodes = () => {
  const codes: string[] = []
  
  const traverse = (nodes: any[]) => {
    nodes.forEach(node => {
      // 只收集实际的权限代码，跳过模块级别的虚拟节点
      if (node.code && !node.code.endsWith('-module')) {
        codes.push(node.code)
      }
      if (node.children) {
        traverse(node.children)
      }
    })
  }
  
  traverse(permissionTree.value)
  return codes
}

/**
 * 获取权限树中的所有叶子节点权限代码
 */
const getLeafPermissions = (nodes: any[]): string[] => {
  const leafCodes: string[] = []
  
  const traverse = (nodes: any[]) => {
    nodes.forEach(node => {
      if (node.children && node.children.length > 0) {
        // 有子节点，继续遍历
        traverse(node.children)
      } else {
        // 没有子节点，是叶子节点
        if (node.code && !node.code.endsWith('-module')) {
          leafCodes.push(node.code)
        }
      }
    })
  }
  
  traverse(nodes)
  return leafCodes
}

// 角色权限数据（从后端加载）
const rolePermissionsData = ref<Record<string, string[]>>({})

/**
 * 从后端加载所有角色权限
 */
const loadRolePermissions = async () => {
  try {
    const response = await getAllRolePermissions()
    const data = response.data || response // 兼容不同的响应格式
    
    // 转换为 Map 结构
    rolePermissionsData.value = {}
    if (Array.isArray(data)) {
      data.forEach((item: any) => {
        rolePermissionsData.value[item.role] = item.permissions
      })
    }

    // 更新角色卡片的权限数量（统计 :view 后缀的权限，即菜单访问权限）
    roles.value.forEach((role) => {
      const permissions = rolePermissionsData.value[role.key] || []
      // 只统计以 :view 结尾的权限（菜单访问权限）
      const viewPermissions = permissions.filter(p => p.endsWith(':view'))
      role.permissionCount = viewPermissions.length
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
const handleSelectRole = async (roleKey: string) => {
  selectedRole.value = roleKey
  const allPermissions = getRolePermissions(roleKey)
  
  // 只保留权限树中存在的权限（过滤掉操作权限，只保留菜单权限）
  const treePermissionCodes = getTreePermissionCodes()
  const filteredPermissions = allPermissions.filter(p => treePermissionCodes.includes(p))
  
  console.log(`🔍 角色 ${roleKey} 的权限过滤:`)
  console.log('  - 后端返回权限数:', allPermissions.length)
  console.log('  - 权限树中的权限数:', treePermissionCodes.length)
  console.log('  - 过滤后显示的权限数:', filteredPermissions.length)
  console.log('  - 过滤后的权限:', filteredPermissions)
  
  checkedPermissions.value = filteredPermissions
  
  // 展开所有节点
  expandedKeys.value = permissionTree.value.map((item) => item.code)

  // 等待 DOM 更新完成后再设置选中状态
  await nextTick()
  
  if (permissionTreeRef.value) {
    // 先清空选中状态
    permissionTreeRef.value.setCheckedKeys([])
    
    // 再次等待 DOM 更新
    await nextTick()
    
    // 只设置叶子节点（子菜单）的权限，避免设置父节点导致所有子节点被勾选
    // 获取所有叶子节点的权限代码
    const leafPermissions = getLeafPermissions(permissionTree.value)
    const checkedLeafPermissions = filteredPermissions.filter(p => leafPermissions.includes(p))
    
    console.log('  - 叶子节点权限:', checkedLeafPermissions)
    
    // 设置新的选中状态（只设置叶子节点）
    permissionTreeRef.value.setCheckedKeys(checkedLeafPermissions)
    
    console.log('✅ 已设置权限树选中状态:', filteredPermissions.length, '个权限')
  }
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
    
    // 重新设置当前角色的权限（过滤后）
    const allPermissions = getRolePermissions(selectedRole.value)
    const treePermissionCodes = getTreePermissionCodes()
    const filteredPermissions = allPermissions.filter(p => treePermissionCodes.includes(p))
    
    checkedPermissions.value = filteredPermissions
    
    // 等待 DOM 更新完成后再设置选中状态
    await nextTick()
    
    if (permissionTreeRef.value) {
      // 先清空选中状态
      permissionTreeRef.value.setCheckedKeys([])
      
      // 再次等待 DOM 更新
      await nextTick()
      
      // 设置新的选中状态
      permissionTreeRef.value.setCheckedKeys(filteredPermissions)
    }
    
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
  
  // 用户选中的菜单权限（包括完全勾选的节点和半勾选的父节点）
  const selectedMenuPermissions = Array.from(new Set([...checkedKeys, ...halfCheckedKeys]))

  // 调试日志
  console.log('🔍 保存权限配置:')
  console.log('  - 完全勾选的节点 (checkedKeys):', checkedKeys)
  console.log('  - 半勾选的节点 (halfCheckedKeys):', halfCheckedKeys)
  console.log('  - 最终发送的权限:', selectedMenuPermissions)
  console.log('  - 权限数量:', selectedMenuPermissions.length)

  try {
    // 统计菜单数量（只统计 :view 后缀的权限）
    const viewPermissions = selectedMenuPermissions.filter(key => key.endsWith(':view'))
    const menuCount = viewPermissions.length
    
    await ElMessageBox.confirm(
      `确定要保存 ${currentRole.value?.label} 的权限配置吗？共选择了 ${menuCount} 个菜单。`,
      '保存确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    saving.value = true

    // 调用后端API保存权限配置（只保存用户选中的菜单权限）
    const result = await updateRolePermissions(selectedRole.value, selectedMenuPermissions)
    
    console.log('✅ 保存成功，后端返回:', result)

    // 更新本地数据（使用后端返回的实际权限）
    const responseData = result.data || result
    rolePermissionsData.value[selectedRole.value] = responseData.permissions || selectedMenuPermissions
    
    // 更新权限数量（只统计 :view 权限）
    const role = roles.value.find((r) => r.key === selectedRole.value)
    if (role) {
      const savedPermissions = responseData.permissions || selectedMenuPermissions
      const savedViewPermissions = savedPermissions.filter((p: string) => p.endsWith(':view'))
      role.permissionCount = savedViewPermissions.length
    }

    ElMessage.success('权限配置保存成功')
    
    // 如果修改的是当前用户的角色，提示重新登录
    const authStore = useAuthStore()
    if (authStore.userInfo?.role === selectedRole.value) {
      ElMessageBox.alert(
        '您修改了自己所属角色的权限，需要重新登录才能看到菜单变化',
        '提示',
        {
          confirmButtonText: '重新登录',
          callback: () => {
            authStore.logout()
          },
        }
      )
      return
    }
    
    // 刷新当前角色的选中状态（使用后端返回的最新权限）
    const latestPermissions = responseData.permissions || selectedMenuPermissions
    
    // 更新 checkedPermissions（使用后端返回的全部权限，不过滤）
    checkedPermissions.value = latestPermissions
    
    // 等待 DOM 更新后刷新树的选中状态
    await nextTick()
    
    if (permissionTreeRef.value) {
      permissionTreeRef.value.setCheckedKeys([])
      await nextTick()
      
      // 只设置叶子节点的权限
      const leafPermissions = getLeafPermissions(permissionTree.value)
      const checkedLeafPermissions = latestPermissions.filter((p: string) => leafPermissions.includes(p))
      
      permissionTreeRef.value.setCheckedKeys(checkedLeafPermissions)
      console.log('✅ 保存后刷新权限树选中状态:', latestPermissions.length, '个权限，其中叶子节点:', checkedLeafPermissions.length)
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('❌ 保存失败:', error)
      ElMessage.error(error.message || '保存失败')
    }
  } finally {
    saving.value = false
  }
}

// 初始化
onMounted(async () => {
  // 从后端加载权限树
  permissionTree.value = await buildPermissionTree()
  
  // 从后端加载角色权限数据
  await loadRolePermissions()
  
  // 默认选择第一个角色
  if (roles.value.length > 0) {
    await handleSelectRole(roles.value[0].key)
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
