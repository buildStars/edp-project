import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

/**
 * 创建教师测试账号
 */
async function createTeacher() {
  console.log('👨‍🏫 Creating teacher user...');

  // 密码加密
  const password = await bcrypt.hash('123456', 10);

  // 创建教师
  const teacher = await prisma.user.upsert({
    where: { phone: '13412233333' },
    update: {},
    create: {
      phone: '13412233333',
      email: 'teacher@edp.com',
      password,
      realName: '张老师',
      nickname: '张老师',
      role: 'TEACHER',
      status: 'ACTIVE',
    },
  });

  console.log('✅ Teacher user created:', {
    phone: teacher.phone,
    email: teacher.email,
    password: '123456',
    role: teacher.role,
  });

  console.log('\n🎉 Teacher user created successfully!\n');
  console.log('===== Login Credentials =====');
  console.log('Teacher:');
  console.log('   Username: 13412233333 or teacher@edp.com');
  console.log('   Password: 123456');
  console.log('=============================\n');
}

// 运行
createTeacher()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });





