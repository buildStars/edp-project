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
import { ref, onMounted, computed } from 'vue'
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
import { getAllRolePermissions, updateRolePermissions } from '@/api/permission'

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

/**
 * 构建权限树
 * 包含所有66个权限（菜单权限 + 操作权限）
 */
const buildPermissionTree = () => {
  const tree: any[] = [
    // ========== 数据统计 ==========
    {
      code: 'statistics-module',
      label: '数据统计',
      icon: DataLine,
      isModule: true,
      children: [
        { code: 'dashboard:view', label: '查看首页', isModule: false },
        { code: 'statistics:view', label: '查看统计', isModule: false },
        { code: 'statistics:export', label: '导出数据', isModule: false },
      ],
    },
    
    // ========== 资讯管理 ==========
    {
      code: 'news-module',
      label: '资讯管理',
      icon: Reading,
      isModule: true,
      children: [
        { code: 'news:view', label: '查看资讯', isModule: false },
        { code: 'news:create', label: '创建资讯', isModule: false },
        { code: 'news:edit', label: '编辑资讯', isModule: false },
        { code: 'news:delete', label: '删除资讯', isModule: false },
        { code: 'news:publish', label: '发布资讯', isModule: false },
      ],
    },
    
    // ========== 校友生活 ==========
    {
      code: 'associations-module',
      label: '校友生活',
      icon: UserFilled,
      isModule: true,
      children: [
        { code: 'associations:view', label: '查看协会', isModule: false },
        { code: 'associations:create', label: '创建协会', isModule: false },
        { code: 'associations:edit', label: '编辑协会', isModule: false },
        { code: 'associations:delete', label: '删除协会', isModule: false },
        { code: 'activities:view', label: '查看活动', isModule: false },
        { code: 'activities:create', label: '创建活动', isModule: false },
        { code: 'activities:edit', label: '编辑活动', isModule: false },
        { code: 'activities:delete', label: '删除活动', isModule: false },
      ],
    },
    
    // ========== 课程管理 ==========
    {
      code: 'courses-module',
      label: '课程管理',
      icon: Reading,
      isModule: true,
      children: [
        { code: 'courses:view', label: '查看课程', isModule: false },
        { code: 'courses:create', label: '创建课程', isModule: false },
        { code: 'courses:edit', label: '编辑课程', isModule: false },
        { code: 'courses:delete', label: '删除课程', isModule: false },
        { code: 'courses:publish', label: '发布课程', isModule: false },
        { code: 'courses:approve', label: '审批课程', isModule: false },
        { code: 'courses:assign-teacher', label: '分配老师', isModule: false },
        { code: 'chapters:view', label: '查看章节', isModule: false },
        { code: 'chapters:manage', label: '管理章节', isModule: false },
      ],
    },
    
    // ========== 用户管理 ==========
    {
      code: 'users-module',
      label: '用户管理',
      icon: UserIcon,
      isModule: true,
      children: [
        { code: 'users:view', label: '查看用户', isModule: false },
        { code: 'users:create', label: '创建用户', isModule: false },
        { code: 'users:edit', label: '编辑用户', isModule: false },
        { code: 'users:delete', label: '删除用户', isModule: false },
        { code: 'users:status', label: '修改用户状态', isModule: false },
        { code: 'advisors:view', label: '查看课程顾问', isModule: false },
        { code: 'advisors:assign', label: '分配课程顾问', isModule: false },
      ],
    },
    
    // ========== 企业管理 ==========
    {
      code: 'organizations-module',
      label: '企业管理',
      icon: OfficeBuilding,
      isModule: true,
      children: [
        { code: 'organizations:view', label: '查看企业', isModule: false },
        { code: 'organizations:create', label: '创建企业', isModule: false },
        { code: 'organizations:edit', label: '编辑企业', isModule: false },
        { code: 'organizations:delete', label: '删除企业', isModule: false },
        { code: 'organizations:credits', label: '学分管理', isModule: false },
        { code: 'organizations:employees', label: '员工管理', isModule: false },
        { code: 'credits:manage', label: '直接学分管理', isModule: false },
      ],
    },
    
    // ========== 报名管理 ==========
    {
      code: 'enrollments-module',
      label: '报名管理',
      icon: Tickets,
      isModule: true,
      children: [
        { code: 'enrollments:view', label: '查看报名', isModule: false },
        { code: 'enrollments:requests', label: '报名申请审核', isModule: false },
        { code: 'enrollments:refunds', label: '退课申请审核', isModule: false },
        { code: 'enrollments:gifts', label: '课程赠送管理', isModule: false },
        { code: 'enrollments:checkin', label: '签到管理', isModule: false },
        { code: 'enrollments:evaluation', label: '评价管理', isModule: false },
        { code: 'refunds:view', label: '查看退费申请', isModule: false },
        { code: 'trials:view', label: '查看试听申请', isModule: false },
        { code: 'associations:join-requests', label: '协会加入申请', isModule: false },
      ],
    },
    
    // ========== 课件管理 ==========
    {
      code: 'courseware-module',
      label: '课件管理',
      icon: FolderOpened,
      isModule: true,
      children: [
        { code: 'courseware:view', label: '查看课件', isModule: false },
        { code: 'courseware:upload', label: '上传课件', isModule: false },
        { code: 'courseware:delete', label: '删除课件', isModule: false },
      ],
    },
    
    // ========== 学习成果管理 ==========
    {
      code: 'achievements-module',
      label: '学习成果管理',
      icon: CircleCheck,
      isModule: true,
      children: [
        { code: 'achievements:view', label: '查看学习成果', isModule: false },
        { code: 'achievements:issue', label: '发放学习成果', isModule: false },
        { code: 'achievements:batch-issue', label: '批量发放学习成果', isModule: false },
        { code: 'achievements:students', label: '查看学员签到情况', isModule: false },
      ],
    },
    
    // ========== 结课申请管理 ==========
    {
      code: 'completion-module',
      label: '结课申请管理',
      icon: CircleCheck,
      isModule: true,
      children: [
        { code: 'completion:create', label: '发起结课申请', isModule: false },
        { code: 'completion:view', label: '查看结课申请', isModule: false },
        { code: 'completion:review', label: '审批结课申请', isModule: false },
        { code: 'completion:cancel', label: '取消结课申请', isModule: false },
      ],
    },
    
    // ========== 学分申请管理 ==========
    {
      code: 'credit-requests-module',
      label: '学分申请管理',
      icon: CircleCheck,
      isModule: true,
      children: [
        { code: 'credit-requests:create', label: '创建学分申请', isModule: false },
        { code: 'credit-requests:view', label: '查看学分申请', isModule: false },
        { code: 'credit-requests:review', label: '审批学分申请', isModule: false },
        { code: 'credit-requests:cancel', label: '取消学分申请', isModule: false },
      ],
    },
    
    // ========== 教师专属 ==========
    {
      code: 'teacher-module',
      label: '教师专属',
      icon: Reading,
      isModule: true,
      children: [
        { code: 'my-courses:view', label: '查看我的课程', isModule: false },
        { code: 'my-students:view', label: '查看我的学员', isModule: false },
      ],
    },
    
    // ========== 系统设置 ==========
    {
      code: 'settings-module',
      label: '系统设置',
      icon: Setting,
      isModule: true,
      children: [
        { code: 'settings:view', label: '查看设置', isModule: false },
        { code: 'settings:edit', label: '修改设置', isModule: false },
        { code: 'settings:roles', label: '角色权限管理', isModule: false },
        { code: 'permissions:manage', label: '权限管理', isModule: false },
        { code: 'approvals:view', label: '查看审批', isModule: false },
      ],
    },
  ]

  console.log('🌲 权限树构建完成 (66个权限):', tree)
  return tree
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

    // 更新角色卡片的权限数量（只统计view权限，即菜单访问权限）
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
  
  // 合并并去重（防止父节点和子节点的权限代码重复）
  const allKeys = Array.from(new Set([...checkedKeys, ...halfCheckedKeys]))

  // 调试日志
  console.log('🔍 保存权限配置:')
  console.log('  - 完全选中的节点:', checkedKeys)
  console.log('  - 半选中的节点:', halfCheckedKeys)
  console.log('  - 合并后的权限:', allKeys)

  try {
    // 统计菜单数量（只统计 :view 权限，即菜单访问权限）
    const viewPermissions = allKeys.filter(key => key.endsWith(':view'))
    const menuCount = viewPermissions.length
    
    await ElMessageBox.confirm(
      `确定要保存 ${currentRole.value?.label} 的权限配置吗？共选择了 ${menuCount} 个菜单，${allKeys.length} 个权限。`,
      '保存确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    saving.value = true

    // 调用后端API保存权限配置
    const result = await updateRolePermissions(selectedRole.value, allKeys)
    
    console.log('✅ 保存成功，后端返回:', result)

    // 更新本地数据（使用后端返回的实际权限）
    // 兼容不同的响应格式
    const responseData = result.data || result
    rolePermissionsData.value[selectedRole.value] = responseData.permissions || allKeys
    
    // 更新权限数量（只统计 :view 权限）
    const role = roles.value.find((r) => r.key === selectedRole.value)
    if (role) {
      const savedViewPermissions = (responseData.permissions || allKeys).filter((p: string) => p.endsWith(':view'))
      role.permissionCount = savedViewPermissions.length
    }

    ElMessage.success('权限配置保存成功')
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
