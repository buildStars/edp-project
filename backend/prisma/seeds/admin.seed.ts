import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

/**
 * 创建初始管理员账号
 */
export async function seedAdmin() {
  console.log('🔐 Creating admin users...');

  // 密码加密
  const password = await bcrypt.hash('123456', 10);

  // 1. 创建超级管理员
  const admin = await prisma.user.upsert({
    where: { phone: '13800138000' },
    update: {},
    create: {
      phone: '13800138000',
      email: 'admin@edp.com',
      password,
      realName: '超级管理员',
      nickname: 'Admin',
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });

  console.log('✅ Admin user created:', {
    phone: admin.phone,
    email: admin.email,
    password: '123456',
    role: admin.role,
  });

  // 2. 创建教务人员
  const staff = await prisma.user.upsert({
    where: { phone: '13800138001' },
    update: {},
    create: {
      phone: '13800138001',
      email: 'staff@edp.com',
      password,
      realName: '教务人员',
      nickname: 'Staff',
      role: 'STAFF',
      status: 'ACTIVE',
    },
  });

  console.log('✅ Staff user created:', {
    phone: staff.phone,
    email: staff.email,
    password: '123456',
    role: staff.role,
  });

  // 3. 创建课程顾问
  const advisor = await prisma.user.upsert({
    where: { phone: '13800138002' },
    update: {},
    create: {
      phone: '13800138002',
      email: 'advisor@edp.com',
      password,
      realName: '课程顾问',
      nickname: 'Advisor',
      role: 'ADVISOR',
      status: 'ACTIVE',
    },
  });

  console.log('✅ Advisor user created:', {
    phone: advisor.phone,
    email: advisor.email,
    password: '123456',
    role: advisor.role,
  });

  console.log('\n🎉 Admin users seeded successfully!\n');
  console.log('===== Login Credentials =====');
  console.log('1. Super Admin:');
  console.log('   Username: 13800138000 or admin@edp.com');
  console.log('   Password: 123456\n');
  console.log('2. Staff:');
  console.log('   Username: 13800138001 or staff@edp.com');
  console.log('   Password: 123456\n');
  console.log('3. Advisor:');
  console.log('   Username: 13800138002 or advisor@edp.com');
  console.log('   Password: 123456');
  console.log('=============================\n');
}

// 如果直接运行此文件
if (require.main === module) {
  seedAdmin()
    .then(async () => {
      await prisma.$disconnect();
    })
    .catch(async (e) => {
      console.error(e);
      await prisma.$disconnect();
      process.exit(1);
    });
}


