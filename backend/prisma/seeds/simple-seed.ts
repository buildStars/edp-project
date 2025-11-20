/**
 * 简化的种子数据脚本 - 学分消耗模式
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 开始创建种子数据...\n');

  // 1. 创建管理员账号
  console.log('👤 创建管理员账号...');
  const adminPassword = await bcrypt.hash('admin123456', 10);
  const admin = await prisma.user.upsert({
    where: { phone: '13800000000' },
    update: {},
    create: {
      phone: '13800000000',
      password: adminPassword,
      nickname: '系统管理员',
      realName: '管理员',
      avatar: 'https://picsum.photos/200/200?random=admin',
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });
  console.log(`✅ 管理员: ${admin.nickname} (${admin.phone})\n`);

  // 2. 创建测试学生
  console.log('👥 创建测试学生...');
  const studentPassword = await bcrypt.hash('123456', 10);
  const students = [];
  
  for (let i = 1; i <= 5; i++) {
    const student = await prisma.user.upsert({
      where: { phone: `1380013800${i}` },
      update: {},
      create: {
        phone: `1380013800${i}`,
        password: studentPassword,
        nickname: `测试学生${i}`,
        realName: `张${i}`,
        avatar: `https://picsum.photos/200/200?random=${i}`,
        company: i % 2 === 0 ? '深圳某某科技公司' : '广州某某集团',
        position: i % 2 === 0 ? '技术总监' : '产品经理',
        role: 'STUDENT',
        status: 'ACTIVE',
      },
    });
    students.push(student);
    
    // 为每个学生创建学分账户，初始学分10-50不等
    const initialCredits = Math.floor(Math.random() * 5 + 1) * 10;
    const credit = await prisma.credit.create({
      data: {
        userId: student.id,
        balance: initialCredits,
        total: initialCredits,
        used: 0,
      },
    });

    // 创建初始学分记录
    await prisma.creditRecord.create({
      data: {
        creditId: credit.id,
        type: 'ADMIN_ADD',
        amount: initialCredits,
        balance: initialCredits,
        remark: '系统初始化赠送',
      },
    });

    console.log(`✅ ${student.nickname} (${student.phone}) - 学分: ${initialCredits}`);
  }
  console.log('');

  // 3. 创建课程
  console.log('📚 创建课程...');
  const courses = [
    {
      title: '企业战略管理与创新',
      introduction: '深入探讨企业战略规划、执行与创新管理，帮助企业家把握市场机遇。',
      teacherId: 'teacher-001',
      teacherName: '陈春花教授',
      teacherAvatar: 'https://picsum.photos/100/100?random=301',
      teacherTitle: '管理学教授',
      teacherIntro: '北京大学国家发展研究院教授，著名管理学家',
      startTime: new Date('2024-12-15T09:00:00'),
      endTime: new Date('2024-12-15T17:00:00'),
      location: '北京大学汇丰商学院',
      credit: 3,
      maxStudents: 100,
      enrollStatus: 'OPEN' as any,
      status: 'PUBLISHED' as any,
      coverImage: 'https://picsum.photos/800/600?random=201',
      views: 1250,
    },
    {
      title: '数字化转型与商业模式创新',
      introduction: '解析数字化时代的商业模式变革，探讨企业数字化转型路径。',
      teacherId: 'teacher-002',
      teacherName: '黄卫伟教授',
      teacherAvatar: 'https://picsum.photos/100/100?random=302',
      teacherTitle: '战略管理教授',
      teacherIntro: '中国人民大学教授，华为首席管理顾问',
      startTime: new Date('2024-12-20T09:00:00'),
      endTime: new Date('2024-12-20T17:00:00'),
      location: '深圳',
      credit: 2,
      maxStudents: 80,
      enrollStatus: 'OPEN' as any,
      status: 'PUBLISHED' as any,
      coverImage: 'https://picsum.photos/800/600?random=202',
      views: 980,
    },
    {
      title: '金融科技与产业创新',
      introduction: '探索金融科技前沿趋势，解读产业创新实践案例。',
      teacherId: 'teacher-003',
      teacherName: '王石教授',
      teacherAvatar: 'https://picsum.photos/100/100?random=303',
      teacherTitle: '金融学教授',
      teacherIntro: '清华大学金融学教授，金融创新研究专家',
      startTime: new Date('2025-01-10T09:00:00'),
      endTime: new Date('2025-01-10T17:00:00'),
      location: '广州',
      credit: 2,
      maxStudents: 60,
      enrollStatus: 'OPEN' as any,
      status: 'PUBLISHED' as any,
      coverImage: 'https://picsum.photos/800/600?random=203',
      views: 756,
    },
    {
      title: '领导力提升与团队管理',
      introduction: '提升领导力素养，掌握团队管理技巧，打造高效团队。',
      teacherId: 'teacher-004',
      teacherName: '宁向东教授',
      teacherAvatar: 'https://picsum.photos/100/100?random=304',
      teacherTitle: '管理学教授',
      teacherIntro: '清华大学经管学院教授，领导力研究专家',
      startTime: new Date('2024-12-25T09:00:00'),
      endTime: new Date('2024-12-25T17:00:00'),
      location: '北京',
      credit: 2,
      maxStudents: 50,
      enrollStatus: 'OPEN' as any,
      status: 'PUBLISHED' as any,
      coverImage: 'https://picsum.photos/800/600?random=204',
      views: 892,
    },
    {
      title: '资本运作与并购重组',
      introduction: '深度解析资本运作策略，分享并购重组实战经验。',
      teacherId: 'teacher-005',
      teacherName: '刘俏教授',
      teacherAvatar: 'https://picsum.photos/100/100?random=305',
      teacherTitle: '金融学教授',
      teacherIntro: '北京大学光华管理学院院长，金融学教授',
      startTime: new Date('2025-01-15T09:00:00'),
      endTime: new Date('2025-01-15T17:00:00'),
      location: '上海',
      credit: 3,
      maxStudents: 40,
      enrollStatus: 'OPEN' as any,
      status: 'PUBLISHED' as any,
      coverImage: 'https://picsum.photos/800/600?random=205',
      views: 1100,
    },
  ];

  const createdCourses = [];
  for (const courseData of courses) {
    const course = await prisma.course.create({
      data: courseData,
    });
    createdCourses.push(course);
    console.log(`✅ ${course.title} (学分: ${course.credit})`);
  }
  console.log('');

  // 4. 创建一些报名记录（消耗学分）
  console.log('📝 创建报名记录（消耗学分）...');
  for (let i = 0; i < 3; i++) {
    const student = students[i];
    const course = createdCourses[i];
    
    // 检查学分是否足够
    const studentCredit = await prisma.credit.findUnique({
      where: { userId: student.id },
    });

    if (studentCredit && studentCredit.balance >= course.credit) {
      // 创建报名记录
      await prisma.enrollment.create({
        data: {
          userId: student.id,
          courseId: course.id,
          status: 'ENROLLED',
          checkedIn: false,
        },
      });

      // 扣除学分
      const newBalance = studentCredit.balance - course.credit;
      const newUsed = studentCredit.used + course.credit;
      
      await prisma.credit.update({
        where: { id: studentCredit.id },
        data: {
          balance: newBalance,
          used: newUsed,
        },
      });

      // 创建学分消耗记录
      await prisma.creditRecord.create({
        data: {
          creditId: studentCredit.id,
          type: 'CONSUME',
          amount: -course.credit,
          balance: newBalance,
          courseId: course.id,
          courseName: course.title,
          remark: '课程报名消耗',
        },
      });

      console.log(`✅ ${student.nickname} 报名《${course.title}》，消耗学分: ${course.credit}, 剩余: ${newBalance}`);
    }
  }
  console.log('');

  // 5. 创建资讯
  console.log('📰 创建资讯...');
  const newsData = [
    {
      title: '北大汇丰EDP2024年度总结大会圆满举行',
      category: 'NOTICE' as any,
      content: '12月1日，北大汇丰EDP2024年度总结大会在深圳校区隆重举行，来自全国各地的企业家学员齐聚一堂，共同回顾2024年的精彩历程。',
      summary: '2024年度总结大会圆满举行，共话发展大计',
      coverImage: 'https://picsum.photos/800/600?random=401',
      publishTime: new Date('2024-12-01'),
      status: 'PUBLISHED' as any,
      isTop: true,
      views: 2580,
      createdBy: admin.id,
    },
    {
      title: '数字化转型专题讲座成功举办',
      category: 'NOTICE' as any,
      content: '11月25日，我院特邀知名数字化转型专家进行专题讲座，为学员们带来了前沿的数字化转型理念和实践经验。',
      summary: '数字化转型专题讲座，专家分享前沿理念',
      coverImage: 'https://picsum.photos/800/600?random=402',
      publishTime: new Date('2024-11-25'),
      status: 'PUBLISHED' as any,
      isTop: false,
      views: 1850,
      createdBy: admin.id,
    },
    {
      title: '校友企业IPO成功上市',
      category: 'ALUMNI' as any,
      content: '热烈祝贺我院EMBA2018级校友企业成功登陆科创板，这是继去年三家校友企业上市后的又一喜讯。',
      summary: '热烈祝贺校友企业成功上市',
      coverImage: 'https://picsum.photos/800/600?random=403',
      publishTime: new Date('2024-11-20'),
      status: 'PUBLISHED' as any,
      isTop: false,
      views: 1650,
      createdBy: admin.id,
    },
  ];

  for (const news of newsData) {
    await prisma.news.create({ data: news });
    console.log(`✅ ${news.title}`);
  }
  console.log('');

  // 6. 创建协会和活动
  console.log('🏛️ 创建协会和活动...');
  const assoc1 = await prisma.association.create({
    data: {
      name: '北大汇丰同学会',
      type: 'ALUMNI',
      logo: 'https://picsum.photos/200/200?random=alumni',
      description: '凝聚校友力量，共创美好未来',
      introduction: '北大汇丰同学会成立于2010年，旨在为校友提供交流平台，促进资源共享，共同发展。',
      contactPerson: '李老师',
      contactPhone: '0755-26032297',
      contactEmail: 'alumni@phbs.pku.edu.cn',
      views: 0,
    },
  });

  await prisma.activity.create({
    data: {
      associationId: assoc1.id,
      title: '2024年度校友年会',
      content: '诚邀各位校友参加年度盛会，共叙同窗情谊，共话发展大计。活动时间：2024年12月30日 18:00-21:00，地点：深圳威斯汀酒店。报名截止：12月25日。联系人：李老师 0755-12345678',
      images: JSON.stringify(['https://picsum.photos/800/600?random=601']),
      publishTime: new Date('2024-11-15'),
      status: 'PUBLISHED',
      views: 2100,
      likes: 156,
    },
  });
  console.log(`✅ ${assoc1.name} 及活动创建完成`);
  console.log('');

  // 7. 输出汇总
  console.log('📊 数据创建汇总:');
  console.log('═'.repeat(50));
  console.log(`👤 管理员: 账号 13800000000 / 密码 admin123456`);
  console.log(`👥 学生: 账号 13800138001-5 / 密码 123456`);
  console.log(`📚 课程: ${createdCourses.length} 门`);
  console.log(`📝 报名: 3 条（已消耗学分）`);
  console.log(`📰 资讯: ${newsData.length} 篇`);
  console.log(`🏛️ 协会和活动: 1 个协会, 1 个活动`);
  console.log('═'.repeat(50));
  console.log('\n✨ 种子数据创建完成！');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ 错误:', e);
    await prisma.$disconnect();
    process.exit(1);
  });

