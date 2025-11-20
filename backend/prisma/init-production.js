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
    const allPermissions = [
      // ========== 用户管理 ==========
      { code: 'user:view', name: '查看用户', module: 'user', description: '查看用户列表和详情' },
      { code: 'user:create', name: '创建用户', module: 'user', description: '创建新用户' },
      { code: 'user:edit', name: '编辑用户', module: 'user', description: '编辑用户信息' },
      { code: 'user:delete', name: '删除用户', module: 'user', description: '删除用户' },
      { code: 'user:role', name: '分配角色', module: 'user', description: '修改用户角色' },
      { code: 'user:status', name: '修改状态', module: 'user', description: '启用/禁用用户' },

      // ========== 课程管理 ==========
      { code: 'course:view', name: '查看课程', module: 'course', description: '查看课程列表和详情' },
      { code: 'course:create', name: '创建课程', module: 'course', description: '创建新课程' },
      { code: 'course:edit', name: '编辑课程', module: 'course', description: '编辑课程信息' },
      { code: 'course:delete', name: '删除课程', module: 'course', description: '删除课程' },
      { code: 'course:approve', name: '审批课程', module: 'course', description: '审批课程发布' },
      { code: 'course:publish', name: '发布课程', module: 'course', description: '发布课程' },
      { code: 'course:archive', name: '归档课程', module: 'course', description: '将课程归档（结课）' },
      { code: 'course:assign-teacher', name: '分配教师', module: 'course', description: '为课程分配教师' },

      // ========== 章节管理 ==========
      { code: 'chapter:view', name: '查看章节', module: 'chapter', description: '查看章节列表' },
      { code: 'chapter:create', name: '创建章节', module: 'chapter', description: '创建新章节' },
      { code: 'chapter:edit', name: '编辑章节', module: 'chapter', description: '编辑章节信息' },
      { code: 'chapter:delete', name: '删除章节', module: 'chapter', description: '删除章节' },
      { code: 'chapter:sort', name: '排序章节', module: 'chapter', description: '调整章节顺序' },

      // ========== 学分管理 ==========
      { code: 'credit:view', name: '查看学分', module: 'credit', description: '查看学分记录' },
      { code: 'credit:allocate', name: '分配学分', module: 'credit', description: '为用户分配学分' },
      { code: 'credit:deduct', name: '扣除学分', module: 'credit', description: '扣除用户学分' },
      { code: 'credit:request:view', name: '查看学分申请', module: 'credit', description: '查看学分申请' },
      { code: 'credit:request:create', name: '创建学分申请', module: 'credit', description: '创建学分申请' },
      { code: 'credit:request:review', name: '审批学分申请', module: 'credit', description: '审批学分申请' },
      { code: 'credit:request:cancel', name: '取消学分申请', module: 'credit', description: '取消学分申请' },

      // ========== 报名管理 ==========
      { code: 'enrollment:view', name: '查看报名', module: 'enrollment', description: '查看报名记录' },
      { code: 'enrollment:approve', name: '审批报名', module: 'enrollment', description: '审批报名申请' },
      { code: 'enrollment:trial:view', name: '查看试听申请', module: 'enrollment', description: '查看试听申请' },
      { code: 'enrollment:trial:approve', name: '审批试听', module: 'enrollment', description: '审批试听申请' },
      { code: 'enrollment:refund:view', name: '查看退课申请', module: 'enrollment', description: '查看退课申请' },
      { code: 'enrollment:refund:approve', name: '审批退课', module: 'enrollment', description: '审批退课申请' },

      // ========== 签到管理 ==========
      { code: 'checkin:view', name: '查看签到', module: 'checkin', description: '查看签到记录' },
      { code: 'checkin:create', name: '创建签到', module: 'checkin', description: '创建签到会话' },
      { code: 'checkin:delete', name: '删除签到', module: 'checkin', description: '删除签到记录' },
      { code: 'checkin:makeup', name: '补签', module: 'checkin', description: '为学员补签' },

      // ========== 资讯管理 ==========
      { code: 'news:view', name: '查看资讯', module: 'news', description: '查看资讯列表' },
      { code: 'news:create', name: '创建资讯', module: 'news', description: '创建新资讯' },
      { code: 'news:edit', name: '编辑资讯', module: 'news', description: '编辑资讯内容' },
      { code: 'news:delete', name: '删除资讯', module: 'news', description: '删除资讯' },
      { code: 'news:publish', name: '发布资讯', module: 'news', description: '发布资讯' },
      { code: 'news:top', name: '置顶资讯', module: 'news', description: '置顶/取消置顶资讯' },
      { code: 'news:archive', name: '归档资讯', module: 'news', description: '归档资讯' },

      // ========== 活动管理 ==========
      { code: 'activity:view', name: '查看活动', module: 'activity', description: '查看活动列表' },
      { code: 'activity:create', name: '创建活动', module: 'activity', description: '创建新活动' },
      { code: 'activity:edit', name: '编辑活动', module: 'activity', description: '编辑活动内容' },
      { code: 'activity:delete', name: '删除活动', module: 'activity', description: '删除活动' },

      // ========== 协会管理 ==========
      { code: 'association:view', name: '查看协会', module: 'association', description: '查看协会列表' },
      { code: 'association:create', name: '创建协会', module: 'association', description: '创建新协会' },
      { code: 'association:edit', name: '编辑协会', module: 'association', description: '编辑协会信息' },
      { code: 'association:delete', name: '删除协会', module: 'association', description: '删除协会' },

      // ========== 企业管理 ==========
      { code: 'organization:view', name: '查看企业', module: 'organization', description: '查看企业列表' },
      { code: 'organization:create', name: '创建企业', module: 'organization', description: '创建新企业' },
      { code: 'organization:edit', name: '编辑企业', module: 'organization', description: '编辑企业信息' },
      { code: 'organization:delete', name: '删除企业', module: 'organization', description: '删除企业' },
      { code: 'organization:credit:allocate', name: '分配企业学分', module: 'organization', description: '为企业分配学分' },
      { code: 'organization:user:manage', name: '管理企业用户', module: 'organization', description: '管理企业员工账户' },

      // ========== 教材管理 ==========
      { code: 'material:view', name: '查看教材', module: 'material', description: '查看教材列表' },
      { code: 'material:create', name: '上传教材', module: 'material', description: '上传新教材' },
      { code: 'material:edit', name: '编辑教材', module: 'material', description: '编辑教材信息' },
      { code: 'material:delete', name: '删除教材', module: 'material', description: '删除教材' },

      // ========== 评价管理 ==========
      { code: 'evaluation:view', name: '查看评价', module: 'evaluation', description: '查看课程评价' },
      { code: 'evaluation:delete', name: '删除评价', module: 'evaluation', description: '删除课程评价' },

      // ========== 成就管理 ==========
      { code: 'achievement:view', name: '查看成就', module: 'achievement', description: '查看成就记录' },
      { code: 'achievement:issue', name: '颁发成就', module: 'achievement', description: '为学员颁发成就' },
      { code: 'achievement:batch-issue', name: '批量颁发成就', module: 'achievement', description: '批量为学员颁发成就' },

      // ========== 结课管理 ==========
      { code: 'completion:view', name: '查看结课申请', module: 'completion', description: '查看结课申请' },
      { code: 'completion:create', name: '创建结课申请', module: 'completion', description: '发起结课申请' },
      { code: 'completion:review', name: '审批结课', module: 'completion', description: '审批结课申请' },
      { code: 'completion:cancel', name: '取消结课申请', module: 'completion', description: '取消自己的结课申请' },

      // ========== 课程赠送管理 ==========
      { code: 'course_gift:view', name: '查看课程赠送', module: 'course_gift', description: '查看课程赠送记录' },
      { code: 'course_gift:create', name: '赠送课程', module: 'course_gift', description: '为用户赠送课程' },
      { code: 'course_gift:delete', name: '删除赠送记录', module: 'course_gift', description: '删除课程赠送记录' },

      // ========== 教师-学员管理 ==========
      { code: 'teacher_student:view', name: '查看师生关系', module: 'teacher_student', description: '查看教师学员关系' },
      { code: 'teacher_student:manage', name: '管理师生关系', module: 'teacher_student', description: '建立/解除师生关系' },

      // ========== AI 功能 ==========
      { code: 'ai:config:view', name: '查看AI配置', module: 'ai', description: '查看AI配置信息' },
      { code: 'ai:config:edit', name: '编辑AI配置', module: 'ai', description: '修改AI配置' },
      { code: 'ai:report:view', name: '查看AI报告', module: 'ai', description: '查看AI生成的报告' },
      { code: 'ai:report:generate', name: '生成AI报告', module: 'ai', description: '生成AI分析报告' },

      // ========== 文件上传 ==========
      { code: 'upload:image', name: '上传图片', module: 'upload', description: '上传图片文件' },
      { code: 'upload:file', name: '上传文件', module: 'upload', description: '上传普通文件' },

      // ========== 系统设置 ==========
      { code: 'system:settings', name: '系统设置', module: 'system', description: '修改系统设置' },
      { code: 'system:permissions', name: '权限管理', module: 'system', description: '管理角色权限' },
      { code: 'system:banner', name: '轮播图管理', module: 'system', description: '管理首页轮播图' },

      // ========== 统计分析 ==========
      { code: 'statistics:view', name: '查看统计', module: 'statistics', description: '查看统计数据' },
      { code: 'statistics:dashboard', name: '数据看板', module: 'statistics', description: '查看数据看板' },
      { code: 'statistics:export', name: '导出数据', module: 'statistics', description: '导出统计数据' },
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
    const rolePermissionMap = {
      // 管理员：拥有所有权限
      ADMIN: allPermissions.map(p => p.code),
      // 教师：管理自己的课程和学员
      TEACHER: [
        // 课程与章节
        'course:view', 'course:create', 'course:edit',
        'chapter:view', 'chapter:create', 'chapter:edit', 'chapter:delete', 'chapter:sort',
        // 报名管理
        'enrollment:view', 'enrollment:trial:view', 'enrollment:trial:approve', 'enrollment:refund:view', 'enrollment:refund:approve',
        // 签到管理
        'checkin:view', 'checkin:create', 'checkin:makeup',
        // 评价查看
        'evaluation:view',
        // 教材管理
        'material:view', 'material:create', 'material:edit', 'material:delete',
        // 成就发放
        'achievement:view', 'achievement:issue',
        // 结课管理
        'completion:view', 'completion:create', 'completion:cancel',
        // 学分申请
        'credit:view', 'credit:request:view', 'credit:request:create', 'credit:request:cancel', 'credit:request:review',
        // 师生关系
        'teacher_student:view', 'teacher_student:manage',
        // 用户管理（学员）
        'user:view', 'user:create', 'user:edit',
        // 统计查看
        'statistics:view', 'statistics:dashboard',
        // 上传文件
        'upload:image', 'upload:file',
      ],

      // 教务人员：大部分运营权限
      STAFF: [
        // 用户管理
        'user:view', 'user:edit',
        // 课程管理
        'course:view', 'course:create', 'course:edit', 'course:approve', 'course:publish', 'course:archive', 'course:assign-teacher',
        'chapter:view', 'chapter:create', 'chapter:edit', 'chapter:delete', 'chapter:sort',
        // 学分管理
        'credit:view', 'credit:allocate', 'credit:deduct', 'credit:request:view', 'credit:request:review',
        // 报名管理
        'enrollment:view', 'enrollment:approve', 'enrollment:trial:view', 'enrollment:trial:approve', 'enrollment:refund:view', 'enrollment:refund:approve',
        // 签到管理
        'checkin:view', 'checkin:create', 'checkin:makeup',
        // 资讯管理
        'news:view', 'news:create', 'news:edit', 'news:delete', 'news:publish', 'news:top', 'news:archive',
        // 活动与协会
        'activity:view', 'activity:create', 'activity:edit', 'activity:delete',
        'association:view', 'association:create', 'association:edit', 'association:delete',
        // 企业管理
        'organization:view', 'organization:edit',
        // 教材管理
        'material:view', 'material:create', 'material:edit', 'material:delete',
        // 评价管理
        'evaluation:view', 'evaluation:delete',
        // 成就管理
        'achievement:view', 'achievement:issue', 'achievement:batch-issue',
        // 结课管理
        'completion:view', 'completion:review',
        // 课程赠送
        'course_gift:view', 'course_gift:create', 'course_gift:delete',
        // 统计查看
        'statistics:view', 'statistics:dashboard',
        // 上传文件
        'upload:image', 'upload:file',
      ],

      // 学员：基本查看权限
      STUDENT: [
        'course:view',
        'chapter:view',
        'enrollment:view',
        'checkin:view',
        'news:view',
        'activity:view',
        'association:view',
        'evaluation:view',
        'material:view',
        'achievement:view',
        'credit:view',
        'statistics:view',
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
