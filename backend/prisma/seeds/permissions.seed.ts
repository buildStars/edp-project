import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 权限配置
 * 格式：{ code: '权限代码', name: '权限名称', description: '描述', module: '模块' }
 */
const permissions = [
  // ========== 首页概览 ==========
  { code: 'dashboard:view', name: '查看首页', description: '查看首页概览数据', module: 'dashboard' },
  
  // ========== 资讯管理 ==========
  { code: 'news:view', name: '资讯管理', description: '资讯管理菜单权限', module: 'news' },
  { code: 'news:list', name: '资讯列表', description: '查看资讯列表页面', module: 'news' },
  { code: 'news:create', name: '创建资讯', description: '创建新资讯', module: 'news' },
  { code: 'news:edit', name: '编辑资讯', description: '编辑资讯信息', module: 'news' },
  { code: 'news:delete', name: '删除资讯', description: '删除资讯', module: 'news' },
  { code: 'news:publish', name: '发布资讯', description: '发布/下架资讯', module: 'news' },
  
  // ========== 校友生活（协会管理）==========
  { code: 'associations:view', name: '校友生活', description: '校友生活菜单权限', module: 'associations' },
  { code: 'associations:list', name: '协会列表', description: '查看协会列表页面', module: 'associations' },
  { code: 'associations:create', name: '创建协会', description: '创建新协会', module: 'associations' },
  { code: 'associations:edit', name: '编辑协会', description: '编辑协会信息', module: 'associations' },
  { code: 'associations:delete', name: '删除协会', description: '删除协会', module: 'associations' },
  { code: 'associations:join-requests', name: '协会加入申请审批', description: '审批协会加入申请', module: 'associations' },
  
  { code: 'activities:view', name: '活动列表', description: '查看活动列表页面', module: 'associations' },
  { code: 'activities:create', name: '创建活动', description: '创建新活动', module: 'associations' },
  { code: 'activities:edit', name: '编辑活动', description: '编辑活动信息', module: 'associations' },
  { code: 'activities:delete', name: '删除活动', description: '删除活动', module: 'associations' },
  
  // ========== 课程管理 ==========
  { code: 'courses:view', name: '课程管理', description: '课程管理菜单权限', module: 'courses' },
  { code: 'courses:list', name: '课程列表', description: '查看课程列表页面', module: 'courses' },
  { code: 'courses:create', name: '创建课程', description: '创建新课程', module: 'courses' },
  { code: 'courses:edit', name: '编辑课程', description: '编辑课程信息', module: 'courses' },
  { code: 'courses:delete', name: '删除课程', description: '删除课程', module: 'courses' },
  { code: 'courses:publish', name: '发布课程', description: '发布/下架课程（直接发布）', module: 'courses' },
  { code: 'courses:approve', name: '审批课程', description: '审批教师提交的课程', module: 'courses' },
  { code: 'courses:assign-teacher', name: '分配老师', description: '为课程分配教师', module: 'courses' },
  
  { code: 'chapters:view', name: '查看章节', description: '查看课程章节', module: 'courses' },
  { code: 'chapters:manage', name: '管理章节', description: '创建、编辑、删除章节', module: 'courses' },
  
  // ========== 用户管理 ==========
  { code: 'users:view', name: '用户管理', description: '用户管理菜单权限', module: 'users' },
  { code: 'users:list', name: '用户列表', description: '查看用户列表页面', module: 'users' },
  { code: 'users:create', name: '创建用户', description: '创建新用户', module: 'users' },
  { code: 'users:edit', name: '编辑用户', description: '编辑用户信息', module: 'users' },
  { code: 'users:delete', name: '删除用户', description: '删除用户', module: 'users' },
  { code: 'users:status', name: '修改用户状态', description: '启用/禁用用户', module: 'users' },
  
  { code: 'advisors:view', name: '课程顾问', description: '查看课程顾问管理页面', module: 'users' },
  { code: 'advisors:assign', name: '分配课程顾问', description: '为用户分配课程顾问', module: 'users' },
  
  // ========== 企业管理 ==========
  { code: 'organizations:view', name: '企业管理', description: '企业管理菜单权限', module: 'organizations' },
  { code: 'organizations:list', name: '企业列表', description: '查看企业列表页面', module: 'organizations' },
  { code: 'organizations:create', name: '创建企业', description: '创建新企业', module: 'organizations' },
  { code: 'organizations:edit', name: '编辑企业', description: '编辑企业信息', module: 'organizations' },
  { code: 'organizations:delete', name: '删除企业', description: '删除企业', module: 'organizations' },
  { code: 'organizations:credits', name: '学分管理', description: '分配和管理企业学分', module: 'organizations' },
  { code: 'organizations:employees', name: '员工管理', description: '管理企业员工', module: 'organizations' },
  
  // ========== 报名管理 ==========
  { code: 'enrollments:view', name: '报名管理', description: '报名管理菜单权限', module: 'enrollments' },
  { code: 'enrollments:list', name: '课程报名', description: '查看课程报名页面', module: 'enrollments' },
  { code: 'enrollments:requests', name: '报名申请审核', description: '审核报名申请', module: 'enrollments' },
  { code: 'trials:view', name: '试听报名申请审批', description: '审批试听报名申请', module: 'enrollments' },
  { code: 'enrollments:refunds', name: '退课申请审核', description: '审核退课申请', module: 'enrollments' },
  { code: 'enrollments:gifts', name: '课程赠送管理', description: '管理课程赠送记录', module: 'enrollments' },
  { code: 'enrollments:checkin', name: '签到管理', description: '管理课程签到', module: 'enrollments' },
  { code: 'enrollments:evaluation', name: '评价管理', description: '查看课程评价', module: 'enrollments' },
  { code: 'course-gifts:view', name: '赠送记录', description: '查看课程赠送记录页面', module: 'enrollments' },
  { code: 'evaluations:view', name: '评价管理', description: '查看评价管理页面', module: 'enrollments' },
  
  // ========== 课件管理 ==========
  { code: 'courseware:view', name: '课件管理', description: '课件管理菜单权限', module: 'courseware' },
  { code: 'courseware:list', name: '课件列表', description: '查看课件列表页面', module: 'courseware' },
  { code: 'courseware:upload', name: '上传课件', description: '上传新课件', module: 'courseware' },
  { code: 'courseware:delete', name: '删除课件', description: '删除课件', module: 'courseware' },
  
  // ========== 审批管理 ==========
  { code: 'approvals:view', name: '查看审批管理', description: '查看审批管理菜单', module: 'approvals' },
  { code: 'refunds:view', name: '查看退课申请', description: '查看和审批退课申请', module: 'approvals' },
  
  // ========== 学习成果管理 ==========
  { code: 'achievements:view', name: '查看学习成果', description: '查看学习成果记录', module: 'achievements' },
  { code: 'achievements:issue', name: '发放学习成果', description: '手动发放学习成果', module: 'achievements' },
  { code: 'achievements:batch-issue', name: '批量发放学习成果', description: '批量发放学习成果（管理员）', module: 'achievements' },
  { code: 'achievements:students', name: '查看学员签到情况', description: '查看课程学员签到情况', module: 'achievements' },
  
  // ========== 结课申请管理 ==========
  { code: 'completion:create', name: '发起结课申请', description: '教师发起结课申请', module: 'completion' },
  { code: 'completion:view', name: '查看结课申请', description: '查看结课申请列表', module: 'completion' },
  { code: 'completion:review', name: '审批结课申请', description: '审批结课申请（教务/管理员）', module: 'completion' },
  { code: 'completion:cancel', name: '取消结课申请', description: '取消结课申请', module: 'completion' },
  
  // ========== 学分申请管理 ==========
  { code: 'credits:manage', name: '学分管理', description: '直接分配或扣除学分', module: 'credits' },
  { code: 'credit-requests:create', name: '创建学分申请', description: '教师创建学分申请', module: 'credits' },
  { code: 'credit-requests:view', name: '查看学分申请', description: '查看学分申请列表', module: 'credits' },
  { code: 'credit-requests:review', name: '审批学分申请', description: '审批学分申请（教务/管理员）', module: 'credits' },
  { code: 'credit-requests:cancel', name: '取消学分申请', description: '取消学分申请', module: 'credits' },
  
  // ========== 教师专属 ==========
  { code: 'my-courses:view', name: '我的课程', description: '我的课程菜单权限', module: 'teacher' },
  { code: 'my-courses:list', name: '课程列表', description: '查看我的课程列表页面', module: 'teacher' },
  { code: 'my-students:view', name: '查看我的学员', description: '查看教师自己的学员列表', module: 'teacher' },
  
  // ========== 数据统计 ==========
  { code: 'statistics:view', name: '查看统计', description: '查看数据统计', module: 'statistics' },
  { code: 'statistics:export', name: '导出数据', description: '导出统计数据', module: 'statistics' },
  
  // ========== 系统设置 ==========
  { code: 'settings:view', name: '系统设置', description: '系统设置菜单权限', module: 'settings' },
  { code: 'settings:basic', name: '基础设置', description: '查看基础设置页面', module: 'settings' },
  { code: 'settings:ai-config', name: 'AI配置', description: '查看AI配置页面', module: 'settings' },
  { code: 'settings:edit', name: '修改设置', description: '修改系统设置', module: 'settings' },
  { code: 'permissions:manage', name: '角色权限', description: '管理角色和权限', module: 'settings' },
];

/**
 * 角色权限配置
 * 定义每个角色拥有的权限
 */
const rolePermissions = {
  // 超级管理员：拥有所有权限（包含所有菜单和操作权限）
  ADMIN: [
    'dashboard:view',
    'news:view', 'news:list', 'news:create', 'news:edit', 'news:delete', 'news:publish',
    'associations:view', 'associations:list', 'associations:create', 'associations:edit', 'associations:delete', 'associations:join-requests',
    'activities:view', 'activities:create', 'activities:edit', 'activities:delete',
    'courses:view', 'courses:list', 'courses:create', 'courses:edit', 'courses:delete', 'courses:publish', 'courses:approve',
    'chapters:view', 'chapters:manage',
    'users:view', 'users:list', 'users:create', 'users:edit', 'users:delete', 'users:status',
    'advisors:view', 'advisors:assign',
    'organizations:view', 'organizations:list', 'organizations:create', 'organizations:edit', 'organizations:delete', 'organizations:credits', 'organizations:employees',
    'enrollments:view', 'enrollments:list', 'enrollments:requests', 'trials:view', 'enrollments:refunds', 'enrollments:gifts', 'enrollments:checkin', 'enrollments:evaluation',
    'course-gifts:view', 'evaluations:view',
    'courseware:view', 'courseware:list', 'courseware:upload', 'courseware:delete',
    'achievements:view', 'achievements:issue', 'achievements:batch-issue', 'achievements:students',
    'approvals:view', 'refunds:view',
    'completion:create', 'completion:view', 'completion:review', 'completion:cancel',
    'credits:manage', 'credit-requests:create', 'credit-requests:view', 'credit-requests:review', 'credit-requests:cancel',
    'statistics:view', 'statistics:export',
    'settings:view', 'settings:basic', 'settings:ai-config', 'settings:edit', 'permissions:manage',
    'my-courses:view', 'my-courses:list',
  ],
  
  // 教务人员：负责课程、报名、协会等运营工作（包含所有菜单和操作权限，除了权限管理）
  STAFF: [
    'dashboard:view',
    'news:view', 'news:list', 'news:create', 'news:edit', 'news:delete', 'news:publish',
    'associations:view', 'associations:list', 'associations:create', 'associations:edit', 'associations:delete', 'associations:join-requests',
    'activities:view', 'activities:create', 'activities:edit', 'activities:delete',
    'courses:view', 'courses:list', 'courses:create', 'courses:edit', 'courses:publish', 'courses:approve', 'courses:assign-teacher',
    'chapters:view', 'chapters:manage',
    'users:view', 'users:list', 'users:create', 'users:edit',
    'advisors:view', 'advisors:assign',
    'organizations:view', 'organizations:list', 'organizations:create', 'organizations:edit', 'organizations:credits', 'organizations:employees',
    'enrollments:view', 'enrollments:list', 'enrollments:requests', 'trials:view', 'enrollments:refunds', 'enrollments:gifts', 'enrollments:checkin', 'enrollments:evaluation',
    'course-gifts:view', 'evaluations:view',
    'courseware:view', 'courseware:list', 'courseware:upload', 'courseware:delete',
    'achievements:view', 'achievements:issue', 'achievements:batch-issue', 'achievements:students',
    'approvals:view', 'refunds:view',
    'completion:create', 'completion:view', 'completion:review', 'completion:cancel',
    'credits:manage', 'credit-requests:create', 'credit-requests:view', 'credit-requests:review', 'credit-requests:cancel',
    'statistics:view',
    'settings:view', 'settings:basic', 'settings:ai-config',
    'my-courses:view', 'my-courses:list',
    'my-students:view',
  ],
  
  // 教师：可以创建和编辑课程，但只能保存为草稿或提交审批
  TEACHER: [
    'dashboard:view',
    'my-courses:view', 'my-courses:list',
    'my-students:view',
    'courses:view', 'courses:list', 'courses:create', 'courses:edit',
    'chapters:view', 'chapters:manage',
    'users:view', 'users:list', 'users:create', 'users:edit',
    'organizations:view', 'organizations:list', 'organizations:create', 'organizations:edit', 'organizations:credits', 'organizations:employees',
    'enrollments:view', 'enrollments:list', 'enrollments:requests', 'enrollments:refunds', 'enrollments:checkin', 'enrollments:evaluation',
    'courseware:view', 'courseware:list', 'courseware:upload', 'courseware:delete',
    'achievements:view', 'achievements:issue', 'achievements:students',
    'completion:create', 'completion:view', 'completion:cancel',
    'credit-requests:create', 'credit-requests:view', 'credit-requests:cancel',
    'statistics:view',
  ],
  
  // 课程顾问：主要负责学员管理和咨询
  ADVISOR: [
    'dashboard:view',
    'news:view', 'news:list',
    'courses:view', 'courses:list',
    'users:view', 'users:list', 'users:edit',
    'enrollments:view', 'enrollments:list',
    'statistics:view',
  ],
  
  // 学员：只能使用小程序，无法登录管理后台
  // 因此不需要配置管理后台权限
  STUDENT: [],
};

/**
 * 初始化权限数据
 */
export async function seedPermissions() {
  console.log('🌱 开始初始化权限数据...');

  try {
    // 1. 检查权限是否已存在
    const existingPermissions = await prisma.permission.count();
    
    if (existingPermissions > 0) {
      console.log(`ℹ️  权限数据已存在 (${existingPermissions} 个权限)，跳过初始化`);
      console.log('💡 如需重置权限，请手动运行: npm run seed:permissions:force');
      return;
    }

    console.log('未找到权限数据，开始创建...');

    // 2. 创建权限
    console.log('创建权限...');
    const createdPermissions = await Promise.all(
      permissions.map((permission) =>
        prisma.permission.create({
          data: permission,
        })
      )
    );
    console.log(`✅ 已创建 ${createdPermissions.length} 个权限`);

    // 3. 创建权限映射表（code -> id）
    const permissionMap = new Map<string, string>();
    createdPermissions.forEach((permission) => {
      permissionMap.set(permission.code, permission.id);
    });

    // 4. 为每个角色分配默认权限
    console.log('为角色分配默认权限...');
    let totalAssignments = 0;

    for (const [role, permissionCodes] of Object.entries(rolePermissions)) {
      const assignments = permissionCodes
        .map((code) => {
          const permissionId = permissionMap.get(code);
          if (!permissionId) {
            console.warn(`⚠️  警告：未找到权限 ${code}`);
            return null;
          }
          return {
            role: role as UserRole,
            permissionId,
          };
        })
        .filter((item) => item !== null);

      await prisma.rolePermission.createMany({
        data: assignments,
        skipDuplicates: true,
      });

      totalAssignments += assignments.length;
      console.log(`  - ${role}: ${assignments.length} 个权限`);
    }

    console.log(`✅ 已创建 ${totalAssignments} 个角色权限关联`);
    console.log('✅ 权限数据初始化完成！');
    console.log('');
    console.log('💡 提示：现在可以在【系统设置 > 角色权限】中自定义各角色的权限');
    console.log('');
  } catch (error) {
    console.error('❌ 权限数据初始化失败:', error);
    throw error;
  }
}

/**
 * 强制重置权限数据（清空并重建）
 * ⚠️ 警告：此操作会删除所有自定义的权限配置！
 */
export async function forceResetPermissions() {
  console.log('⚠️  强制重置权限数据...');
  console.log('警告：这将删除所有自定义的权限配置！');

  try {
    // 1. 清空现有权限数据
    console.log('清空现有权限数据...');
    await prisma.rolePermission.deleteMany({});
    await prisma.permission.deleteMany({});

    // 2. 创建权限
    console.log('创建权限...');
    const createdPermissions = await Promise.all(
      permissions.map((permission) =>
        prisma.permission.create({
          data: permission,
        })
      )
    );
    console.log(`✅ 已创建 ${createdPermissions.length} 个权限`);

    // 3. 创建权限映射表（code -> id）
    const permissionMap = new Map<string, string>();
    createdPermissions.forEach((permission) => {
      permissionMap.set(permission.code, permission.id);
    });

    // 4. 为每个角色分配权限
    console.log('为角色分配权限...');
    let totalAssignments = 0;

    for (const [role, permissionCodes] of Object.entries(rolePermissions)) {
      const assignments = permissionCodes
        .map((code) => {
          const permissionId = permissionMap.get(code);
          if (!permissionId) {
            console.warn(`⚠️  警告：未找到权限 ${code}`);
            return null;
          }
          return {
            role: role as UserRole,
            permissionId,
          };
        })
        .filter((item) => item !== null);

      await prisma.rolePermission.createMany({
        data: assignments,
        skipDuplicates: true,
      });

      totalAssignments += assignments.length;
      console.log(`  - ${role}: ${assignments.length} 个权限`);
    }

    console.log(`✅ 已创建 ${totalAssignments} 个角色权限关联`);
    console.log('✅ 权限数据强制重置完成！');
    console.log('');
    console.log('⚠️  重要提示：权限已更新！');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📢 请通知所有在线用户重新登录以获取最新权限：');
    console.log('   1️⃣  点击右上角头像');
    console.log('   2️⃣  选择"退出登录"');
    console.log('   3️⃣  重新登录');
    console.log('');
    console.log('💡 或者在浏览器控制台执行以下命令强制刷新：');
    console.log('   localStorage.clear(); location.reload();');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
  } catch (error) {
    console.error('❌ 权限数据强制重置失败:', error);
    throw error;
  }
}

/**
 * 查询角色权限（用于验证）
 */
export async function queryRolePermissions(role: UserRole) {
  const rolePermissions = await prisma.rolePermission.findMany({
    where: { role },
    include: {
      permission: true,
    },
  });

  console.log(`\n角色 ${role} 的权限：`);
  rolePermissions.forEach((rp) => {
    console.log(`  - ${rp.permission.code}: ${rp.permission.name}`);
  });

  return rolePermissions;
}

// 如果直接运行此文件
if (require.main === module) {
  seedPermissions()
    .then(async () => {
      // 验证一下 ADMIN 和 STAFF 的权限
      await queryRolePermissions(UserRole.ADMIN);
      await queryRolePermissions(UserRole.STAFF);
      await prisma.$disconnect();
    })
    .catch(async (error) => {
      console.error(error);
      await prisma.$disconnect();
      process.exit(1);
    });
}

