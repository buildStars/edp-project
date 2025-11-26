/**
 * 生产环境初始化脚本
 * 用于 Docker 部署后的首次初始化
 * 包含：管理员账号、权限数据、系统配置
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

/**
 * 1. 初始化管理员账号
 */
async function seedAdmin() {
  log('\n🔐 初始化管理员账号...', 'blue');

  try {
    const adminPhone = '13800138000';
    const adminPassword = 'admin123456';

    // 检查是否已存在
    const existing = await prisma.user.findUnique({
      where: { phone: adminPhone },
    });

    if (existing) {
      log(`✅ 管理员账号已存在 (${adminPhone})`, 'green');
      return existing;
    }

    // 创建管理员
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const admin = await prisma.user.create({
      data: {
        phone: adminPhone,
        email: 'admin@edp.com',
        password: hashedPassword,
        role: 'ADMIN',
        realName: '系统管理员',
        nickname: '管理员',
        status: 'ACTIVE',
        profileCompleted: true,
      },
    });

    log(`✅ 管理员账号创建成功！`, 'green');
    log(`   账号: ${adminPhone}`, 'yellow');
    log(`   密码: ${adminPassword}`, 'yellow');
    log(`   角色: ADMIN`, 'yellow');

    return admin;
  } catch (error) {
    log(`❌ 管理员账号初始化失败: ${error.message}`, 'red');
    throw error;
  }
}

/**
 * 2. 初始化权限数据
 */
async function seedPermissions() {
  log('\n🔑 初始化权限数据...', 'blue');

  try {
    // 定义所有权限（code -> 权限详情）
    // 与 prisma/seeds/permissions.seed.ts 保持一致
    const allPermissions = [
      // ========== 首页概览 ==========
      { code: 'dashboard:view', name: '查看首页', module: 'dashboard', description: '查看首页概览数据' },
      
      // ========== 资讯管理 ==========
      { code: 'news:view', name: '查看资讯', module: 'news', description: '查看资讯列表' },
      { code: 'news:create', name: '创建资讯', module: 'news', description: '创建新资讯' },
      { code: 'news:edit', name: '编辑资讯', module: 'news', description: '编辑资讯信息' },
      { code: 'news:delete', name: '删除资讯', module: 'news', description: '删除资讯' },
      { code: 'news:publish', name: '发布资讯', module: 'news', description: '发布/下架资讯' },
      
      // ========== 校友生活（协会管理）==========
      { code: 'associations:view', name: '查看协会', module: 'associations', description: '查看协会列表' },
      { code: 'associations:create', name: '创建协会', module: 'associations', description: '创建新协会' },
      { code: 'associations:edit', name: '编辑协会', module: 'associations', description: '编辑协会信息' },
      { code: 'associations:delete', name: '删除协会', module: 'associations', description: '删除协会' },
      
      { code: 'activities:view', name: '查看活动', module: 'associations', description: '查看活动列表' },
      { code: 'activities:create', name: '创建活动', module: 'associations', description: '创建新活动' },
      { code: 'activities:edit', name: '编辑活动', module: 'associations', description: '编辑活动信息' },
      { code: 'activities:delete', name: '删除活动', module: 'associations', description: '删除活动' },
      
      // ========== 课程管理 ==========
      { code: 'courses:view', name: '查看课程', module: 'courses', description: '查看课程列表' },
      { code: 'courses:create', name: '创建课程', module: 'courses', description: '创建新课程' },
      { code: 'courses:edit', name: '编辑课程', module: 'courses', description: '编辑课程信息' },
      { code: 'courses:delete', name: '删除课程', module: 'courses', description: '删除课程' },
      { code: 'courses:publish', name: '发布课程', module: 'courses', description: '发布/下架课程（直接发布）' },
      { code: 'courses:approve', name: '审批课程', module: 'courses', description: '审批教师提交的课程' },
      { code: 'courses:assign-teacher', name: '分配老师', module: 'courses', description: '为课程分配教师' },
      
      { code: 'chapters:view', name: '查看章节', module: 'courses', description: '查看课程章节' },
      { code: 'chapters:manage', name: '管理章节', module: 'courses', description: '创建、编辑、删除章节' },
      
      // ========== 用户管理 ==========
      { code: 'users:view', name: '查看用户', module: 'users', description: '查看用户列表' },
      { code: 'users:create', name: '创建用户', module: 'users', description: '创建新用户' },
      { code: 'users:edit', name: '编辑用户', module: 'users', description: '编辑用户信息' },
      { code: 'users:delete', name: '删除用户', module: 'users', description: '删除用户' },
      { code: 'users:status', name: '修改用户状态', module: 'users', description: '启用/禁用用户' },
      
      { code: 'advisors:view', name: '查看课程顾问', module: 'users', description: '查看课程顾问管理' },
      { code: 'advisors:assign', name: '分配课程顾问', module: 'users', description: '为用户分配课程顾问' },
      
      // ========== 企业管理 ==========
      { code: 'organizations:view', name: '查看企业', module: 'organizations', description: '查看企业列表' },
      { code: 'organizations:create', name: '创建企业', module: 'organizations', description: '创建新企业' },
      { code: 'organizations:edit', name: '编辑企业', module: 'organizations', description: '编辑企业信息' },
      { code: 'organizations:delete', name: '删除企业', module: 'organizations', description: '删除企业' },
      { code: 'organizations:credits', name: '学分管理', module: 'organizations', description: '分配和管理企业学分' },
      { code: 'organizations:employees', name: '员工管理', module: 'organizations', description: '管理企业员工' },
      
      // ========== 报名管理 ==========
      { code: 'enrollments:view', name: '查看报名', module: 'enrollments', description: '查看报名记录' },
      { code: 'enrollments:requests', name: '报名申请审核', module: 'enrollments', description: '审核报名申请' },
      { code: 'enrollments:refunds', name: '退课申请审核', module: 'enrollments', description: '审核退课申请' },
      { code: 'enrollments:gifts', name: '课程赠送管理', module: 'enrollments', description: '管理课程赠送记录' },
      { code: 'enrollments:checkin', name: '签到管理', module: 'enrollments', description: '管理课程签到' },
      { code: 'enrollments:evaluation', name: '评价管理', module: 'enrollments', description: '查看课程评价' },
      
      // ========== 课件管理 ==========
      { code: 'courseware:view', name: '查看课件', module: 'courseware', description: '查看课件列表' },
      { code: 'courseware:upload', name: '上传课件', module: 'courseware', description: '上传新课件' },
      { code: 'courseware:delete', name: '删除课件', module: 'courseware', description: '删除课件' },
      
      // ========== 学习成果管理 ==========
      { code: 'achievements:view', name: '查看学习成果', module: 'achievements', description: '查看学习成果记录' },
      { code: 'achievements:issue', name: '发放学习成果', module: 'achievements', description: '手动发放学习成果' },
      { code: 'achievements:batch-issue', name: '批量发放学习成果', module: 'achievements', description: '批量发放学习成果（管理员）' },
      { code: 'achievements:students', name: '查看学员签到情况', module: 'achievements', description: '查看课程学员签到情况' },
      
      // ========== 结课申请管理 ==========
      { code: 'completion:create', name: '发起结课申请', module: 'completion', description: '教师发起结课申请' },
      { code: 'completion:view', name: '查看结课申请', module: 'completion', description: '查看结课申请列表' },
      { code: 'completion:review', name: '审批结课申请', module: 'completion', description: '审批结课申请（教务/管理员）' },
      { code: 'completion:cancel', name: '取消结课申请', module: 'completion', description: '取消结课申请' },
      
      // ========== 学分申请管理 ==========
      { code: 'credits:manage', name: '学分管理', module: 'credits', description: '直接分配或扣除学分' },
      { code: 'credit-requests:create', name: '创建学分申请', module: 'credits', description: '教师创建学分申请' },
      { code: 'credit-requests:view', name: '查看学分申请', module: 'credits', description: '查看学分申请列表' },
      { code: 'credit-requests:review', name: '审批学分申请', module: 'credits', description: '审批学分申请（教务/管理员）' },
      { code: 'credit-requests:cancel', name: '取消学分申请', module: 'credits', description: '取消学分申请' },
      
      // ========== 教师专属 ==========
      { code: 'my-courses:view', name: '查看我的课程', module: 'teacher', description: '查看教师自己的课程列表' },
      { code: 'my-students:view', name: '查看我的学员', module: 'teacher', description: '查看教师自己的学员列表' },
      
      // ========== 数据统计 ==========
      { code: 'statistics:view', name: '查看统计', module: 'statistics', description: '查看数据统计' },
      { code: 'statistics:export', name: '导出数据', module: 'statistics', description: '导出统计数据' },
      
      // ========== 系统设置 ==========
      { code: 'settings:view', name: '查看设置', module: 'settings', description: '查看系统设置' },
      { code: 'settings:edit', name: '修改设置', module: 'settings', description: '修改系统设置' },
      { code: 'settings:roles', name: '角色权限管理', module: 'settings', description: '管理角色和权限' },
      { code: 'permissions:manage', name: '权限管理', module: 'settings', description: '管理角色和权限' },
    ];

    log(`📝 准备创建 ${allPermissions.length} 个权限...`, 'yellow');

    // 使用 upsert 创建或更新权限
    for (const perm of allPermissions) {
      await prisma.permission.upsert({
        where: { code: perm.code },
        update: {
          name: perm.name,
          description: perm.description,
          module: perm.module,
        },
        create: perm,
      });
    }

    log(`✅ 权限基础数据创建成功！`, 'green');

    // 定义角色-权限映射
    // 与 prisma/seeds/permissions.seed.ts 保持一致
    const rolePermissionMap = {
      // 超级管理员：拥有所有权限
      ADMIN: allPermissions.map(p => p.code),
      
      // 教务人员：负责课程、报名、协会等运营工作（包含教师的所有功能）
      STAFF: [
        'dashboard:view',
        'news:view', 'news:create', 'news:edit', 'news:delete', 'news:publish',
        'associations:view', 'associations:create', 'associations:edit', 'associations:delete',
        'activities:view', 'activities:create', 'activities:edit', 'activities:delete',
        'courses:view', 'courses:create', 'courses:edit', 'courses:publish', 'courses:approve', 'courses:assign-teacher',
        'chapters:view', 'chapters:manage',
        'users:view', 'users:create', 'users:edit',
        'advisors:view', 'advisors:assign',
        'organizations:view', 'organizations:create', 'organizations:edit', 'organizations:credits', 'organizations:employees',
        'enrollments:view', 'enrollments:requests', 'enrollments:refunds', 'enrollments:gifts', 'enrollments:checkin', 'enrollments:evaluation',
        'courseware:view', 'courseware:upload', 'courseware:delete',
        'achievements:view', 'achievements:issue', 'achievements:batch-issue', 'achievements:students',
        'completion:create', 'completion:view', 'completion:review', 'completion:cancel',
        'credits:manage', 'credit-requests:create', 'credit-requests:view', 'credit-requests:review', 'credit-requests:cancel',
        'statistics:view',
        'my-courses:view',
        'my-students:view',
      ],
      
      // 教师：可以创建和编辑课程，但只能保存为草稿或提交审批
      TEACHER: [
        'dashboard:view',
        'my-courses:view',
        'my-students:view',
        'courses:view', 'courses:create', 'courses:edit',
        'chapters:view', 'chapters:manage',
        'users:view', 'users:create', 'users:edit',
        'organizations:view', 'organizations:create', 'organizations:edit', 'organizations:credits', 'organizations:employees',
        'enrollments:view', 'enrollments:requests', 'enrollments:refunds', 'enrollments:checkin', 'enrollments:evaluation',
        'courseware:view', 'courseware:upload', 'courseware:delete',
        'achievements:view', 'achievements:issue', 'achievements:students',
        'completion:create', 'completion:view', 'completion:cancel',
        'credit-requests:create', 'credit-requests:view', 'credit-requests:cancel',
        'statistics:view',
      ],
      
      // 学员：基本查看权限
      STUDENT: [
        'dashboard:view',
        'news:view',
        'courses:view',
      ],
    };

    log(`📝 准备分配角色权限...`, 'yellow');

    // 为每个角色分配权限
    for (const [role, permissionCodes] of Object.entries(rolePermissionMap)) {
      for (const code of permissionCodes) {
        // 查找权限 ID
        const permission = await prisma.permission.findUnique({
          where: { code },
        });

        if (!permission) {
          log(`⚠️  权限 ${code} 不存在，跳过`, 'yellow');
          continue;
        }

        // 检查是否已存在
        const existing = await prisma.rolePermission.findUnique({
          where: {
            role_permissionId: {
              role: role,
              permissionId: permission.id,
            },
          },
        });

        if (!existing) {
          await prisma.rolePermission.create({
            data: {
              role: role,
              permissionId: permission.id,
            },
          });
        }
      }
    }

    const totalRolePermissions = await prisma.rolePermission.count();
    log(`✅ 角色权限分配完成！共创建 ${totalRolePermissions} 条`, 'green');

    return true;
  } catch (error) {
    log(`❌ 权限初始化失败: ${error.message}`, 'red');
    console.error(error);
    throw error;
  }
}

/**
 * 3. 初始化系统配置
 */
async function seedSystemConfig() {
  log('\n⚙️  初始化系统配置...', 'blue');

  try {
    const existing = await prisma.systemConfig.findFirst();
    if (existing) {
      log(`✅ 系统配置已存在`, 'green');
      return existing;
    }

    const config = await prisma.systemConfig.create({
      data: {
        appName: '北大汇丰EDP',
        appLogo: '/uploads/images/default-logo.png',
        appDesc: '北大汇丰EDP项目，致力于培养具有全球视野和创新精神的商业领袖。',
        contactPhone: '0755-26033000',
        contactEmail: 'edp@phbs.pku.edu.cn',
        contactAddress: '深圳市南山区大学城北大汇丰商学院',
        isMaintenance: false,
        maintenanceMsg: '系统维护中，请稍后访问。',
        wechatQrCode: '/uploads/images/default-wechat-qrcode.png',
        weiboUrl: 'https://weibo.com/phbsedp',
      },
    });

    log(`✅ 系统配置创建成功`, 'green');
    return config;
  } catch (error) {
    log(`❌ 系统配置初始化失败: ${error.message}`, 'red');
    throw error;
  }
}

/**
 * 主函数
 */
async function main() {
  log('========================================', 'blue');
  log('🚀 开始初始化生产环境数据', 'blue');
  log('========================================', 'blue');

  try {
    // 1. 初始化管理员
    await seedAdmin();

    // 2. 初始化权限
    await seedPermissions();

    // 3. 初始化系统配置
    await seedSystemConfig();

    log('\n========================================', 'green');
    log('🎉 初始化完成！', 'green');
    log('========================================', 'green');
    log('\n📌 管理员登录信息：', 'yellow');
    log('   账号: 13800138000', 'yellow');
    log('   密码: admin123456', 'yellow');
    log('\n⚠️  请尽快登录并修改默认密码！', 'red');

    process.exit(0);
  } catch (error) {
    log('\n========================================', 'red');
    log('❌ 初始化失败！', 'red');
    log('========================================', 'red');
    log(`\n错误: ${error.message}`, 'red');
    if (error.stack) {
      log(`\n堆栈: ${error.stack}`, 'red');
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// 执行主函数
main();
