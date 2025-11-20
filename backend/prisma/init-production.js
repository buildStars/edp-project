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
    // 检查是否已有权限数据
    const count = await prisma.rolePermission.count();
    if (count > 0) {
      log(`✅ 权限数据已存在 (共 ${count} 条)`, 'green');
      return;
    }

    // 定义所有权限
    const permissions = {
      ADMIN: [
        // 用户管理
        'user:view',
        'user:create',
        'user:edit',
        'user:delete',
        'user:role',
        'user:status',
        // 课程管理
        'course:view',
        'course:create',
        'course:edit',
        'course:delete',
        'course:approve',
        'course:publish',
        'course:assign-teacher',
        // 章节管理
        'chapter:view',
        'chapter:create',
        'chapter:edit',
        'chapter:delete',
        // 学分管理
        'credit:view',
        'credit:allocate',
        'credit:deduct',
        'credit:request:view',
        'credit:request:review',
        // 报名管理
        'enrollment:view',
        'enrollment:approve',
        'enrollment:trial:view',
        'enrollment:trial:approve',
        'enrollment:refund:view',
        'enrollment:refund:approve',
        // 签到管理
        'checkin:view',
        'checkin:create',
        'checkin:delete',
        'checkin:makeup',
        // 资讯管理
        'news:view',
        'news:create',
        'news:edit',
        'news:delete',
        'news:publish',
        // 活动管理
        'activity:view',
        'activity:create',
        'activity:edit',
        'activity:delete',
        // 协会管理
        'association:view',
        'association:create',
        'association:edit',
        'association:delete',
        // 组织管理
        'organization:view',
        'organization:create',
        'organization:edit',
        'organization:delete',
        'organization:credit:allocate',
        // 资料管理
        'material:view',
        'material:create',
        'material:edit',
        'material:delete',
        // 评价管理
        'evaluation:view',
        'evaluation:delete',
        // 成就管理
        'achievement:view',
        'achievement:issue',
        // 课程完成管理
        'completion:view',
        'completion:review',
        // 系统设置
        'system:settings',
        'system:permissions',
        'system:banner',
        // 数据统计
        'statistics:view',
        'statistics:dashboard',
      ],
      TEACHER: [
        // 课程查看
        'course:view',
        // 学员管理
        'enrollment:view',
        'enrollment:trial:view',
        'enrollment:trial:approve',
        // 签到管理
        'checkin:view',
        'checkin:create',
        'checkin:makeup',
        // 评价查看
        'evaluation:view',
        // 资料管理
        'material:view',
        'material:create',
        'material:edit',
        // 成绩管理
        'completion:view',
        // 统计数据
        'statistics:view',
      ],
      STUDENT: [
        // 课程浏览
        'course:view',
        // 报名
        'enrollment:view',
        // 签到
        'checkin:view',
        // 评价
        'evaluation:view',
        // 资料下载
        'material:view',
        // 成就查看
        'achievement:view',
      ],
      STAFF: [
        // 用户查看
        'user:view',
        // 课程管理
        'course:view',
        'course:create',
        'course:edit',
        // 报名管理
        'enrollment:view',
        'enrollment:trial:view',
        'enrollment:trial:approve',
        // 签到管理
        'checkin:view',
        // 资讯管理
        'news:view',
        'news:create',
        'news:edit',
        // 活动管理
        'activity:view',
        'activity:create',
        'activity:edit',
        // 资料管理
        'material:view',
        'material:create',
        'material:edit',
        // 统计查看
        'statistics:view',
      ],
    };

    // 创建权限记录
    const rolePermissions = [];
    for (const [role, perms] of Object.entries(permissions)) {
      for (const permission of perms) {
        rolePermissions.push({
          role: role,
          permission: permission,
        });
      }
    }

    await prisma.rolePermission.createMany({
      data: rolePermissions,
      skipDuplicates: true,
    });

    log(`✅ 权限初始化成功！共创建 ${rolePermissions.length} 条权限`, 'green');
    log(`   - ADMIN: ${permissions.ADMIN.length} 个权限`, 'yellow');
    log(`   - TEACHER: ${permissions.TEACHER.length} 个权限`, 'yellow');
    log(`   - STUDENT: ${permissions.STUDENT.length} 个权限`, 'yellow');
    log(`   - STAFF: ${permissions.STAFF.length} 个权限`, 'yellow');
  } catch (error) {
    log(`❌ 权限初始化失败: ${error.message}`, 'red');
    throw error;
  }
}

/**
 * 3. 初始化系统配置
 */
async function seedSystemConfig() {
  log('\n⚙️  初始化系统配置...', 'blue');

  try {
    // 检查是否已有配置
    const existing = await prisma.systemConfig.findFirst();
    if (existing) {
      log(`✅ 系统配置已存在`, 'green');
      return;
    }

    // 创建默认配置
    await prisma.systemConfig.create({
      data: {
        appName: '北大汇丰EDP',
        appDesc: '北京大学汇丰商学院高层管理教育项目',
        contactPhone: '0755-26032121',
        contactEmail: 'edp@phbs.pku.edu.cn',
        contactAddress: '广东省深圳市南山区西丽大学城北京大学汇丰商学院',
        isMaintenance: false,
      },
    });

    log(`✅ 系统配置初始化成功`, 'green');
  } catch (error) {
    log(`❌ 系统配置初始化失败: ${error.message}`, 'red');
    throw error;
  }
}

/**
 * 主函数
 */
async function main() {
  log('\n========================================', 'blue');
  log('🚀 开始初始化生产环境数据...', 'blue');
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
    log('\n📋 管理员登录信息：', 'yellow');
    log('   账号: 13800138000', 'yellow');
    log('   密码: admin123456', 'yellow');
    log('   登录地址: http://your-domain/login', 'yellow');
    log('\n⚠️  请及时修改默认密码！\n', 'red');
  } catch (error) {
    log('\n========================================', 'red');
    log('❌ 初始化失败！', 'red');
    log('========================================', 'red');
    log(`错误: ${error.message}`, 'red');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// 执行
main();

