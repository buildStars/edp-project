const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

/**
 * 权限配置
 * 与 permissions.seed.ts 保持完全一致
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
 * 与 permissions.seed.ts 保持完全一致
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

async function main() {
  console.log('========================================');
  console.log('🚀 开始初始化生产环境数据');
  console.log('========================================\n');

  try {
    // 1. 初始化管理员账号
    console.log('🔐 初始化管理员账号...');
    const hashedPassword = await bcrypt.hash('admin123456', 10);
    
    await prisma.user.upsert({
      where: { phone: '13800138000' },
      update: {},
      create: {
        phone: '13800138000',
        password: hashedPassword,
        realName: '系统管理员',
        nickname: '超级管理员',
        role: 'ADMIN',
        status: 'ACTIVE',
      },
    });
    console.log('✅ 管理员账号已存在 (13800138000)\n');

    // 2. 初始化权限数据
    console.log('🔑 初始化权限数据...');
    console.log(`📝 准备创建 ${permissions.length} 个权限...`);
    
    // 清空现有权限（避免重复）
    await prisma.$executeRaw`DELETE FROM role_permissions`;
    await prisma.$executeRaw`DELETE FROM permissions`;
    
    // 批量创建权限
    await prisma.permission.createMany({
      data: permissions,
      skipDuplicates: true,
    });
    console.log('✅ 权限基础数据创建成功！\n');

    // 3. 分配角色权限
    console.log('📝 准备分配角色权限...');
    
    const allPermissions = await prisma.permission.findMany();
    const permissionMap = new Map(allPermissions.map(p => [p.code, p.id]));
    
    let totalRolePermissions = 0;
    
    for (const [role, codes] of Object.entries(rolePermissions)) {
      const rolePermissionData = codes
        .map(code => {
          const permissionId = permissionMap.get(code);
          if (!permissionId) {
            console.warn(`⚠️  警告: 权限 ${code} 不存在，跳过分配给 ${role}`);
            return null;
          }
          return { role, permissionId };
        })
        .filter(Boolean);

      if (rolePermissionData.length > 0) {
        await prisma.rolePermission.createMany({
          data: rolePermissionData,
          skipDuplicates: true,
        });
        totalRolePermissions += rolePermissionData.length;
      }
    }
    
    console.log(`✅ 角色权限分配完成！共创建 ${totalRolePermissions} 条\n`);

    // 4. 初始化系统配置
    console.log('⚙️ 初始化系统配置...');
    await prisma.systemConfig.upsert({
      where: { id: 1 },
      update: {},
      create: {
        siteName: '高校思政教育平台',
        siteDescription: '思想政治教育数字化管理平台',
        contactPhone: '400-123-4567',
        contactEmail: 'support@edp.com',
      },
    });
    console.log('✅ 系统配置已存在\n');

    console.log('========================================');
    console.log('🎉 初始化完成！');
    console.log('========================================');
    console.log('📌 管理员登录信息：');
    console.log('   账号: 13800138000');
    console.log('   密码: admin123456');
    console.log('⚠️  请尽快登录并修改默认密码！');
    
  } catch (error) {
    console.error('❌ 初始化失败:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

