import { PrismaClient } from '@prisma/client';
import { seedPermissions } from './seeds/permissions.seed';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');
  
  // 先初始化权限数据
  await seedPermissions();

  // 清空现有数据（可选）
  // ⚠️ 注意：这会删除所有测试数据，但保留用户数据
  console.log('🗑️  Cleaning existing data...');
  await prisma.activityLike.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.collection.deleteMany();
  await prisma.download.deleteMany();
  await prisma.creditRecord.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.courseMaterial.deleteMany();
  await prisma.course.deleteMany();
  await prisma.credit.deleteMany();
  await prisma.news.deleteMany();
  await prisma.association.deleteMany();
  // 先删除企业（有 adminId 外键）
  await prisma.organization.deleteMany();
  // ⚠️⚠️⚠️ 不删除用户数据，避免误删真实用户 ⚠️⚠️⚠️
  // await prisma.user.deleteMany();  // 已注释，如需重置用户请单独运行 admin.seed.ts

  // 1. 创建协会数据
  console.log('📋 Creating associations...');
  await prisma.association.createMany({
    data: [
      {
        id: 'assoc-001',
        name: '深圳校友会',
        type: 'ALUMNI',
        logo: 'https://picsum.photos/200/200?random=1',
        description: '深圳地区的北大汇丰校友组织',
        introduction: '深圳校友会成立于2010年，是北大汇丰商学院在深圳地区的重要校友组织。汇聚了众多优秀企业家和金融精英，定期举办各类交流活动。',
        contactPerson: '张老师',
        contactPhone: '13800138000',
        contactEmail: 'sz@edp.pku.edu.cn',
        wechat: 'edp_sz',
        views: 156,
      },
      {
        id: 'assoc-002',
        name: '北京校友会',
        type: 'ALUMNI',
        logo: 'https://picsum.photos/200/200?random=2',
        description: '北京地区的北大汇丰校友组织',
        introduction: '北京校友会汇聚了在京的北大汇丰精英校友，定期举办各类活动，促进校友间的交流与合作。',
        contactPerson: '李老师',
        contactPhone: '13900139000',
        contactEmail: 'bj@edp.pku.edu.cn',
        wechat: 'edp_bj',
        views: 223,
      },
      {
        id: 'assoc-003',
        name: '上海校友会',
        type: 'ALUMNI',
        logo: 'https://picsum.photos/200/200?random=3',
        description: '上海地区的北大汇丰校友组织',
        introduction: '上海校友会服务于上海及长三角地区的北大汇丰校友，搭建高端交流平台。',
        contactPerson: '王老师',
        contactPhone: '13700137000',
        contactEmail: 'sh@edp.pku.edu.cn',
        wechat: 'edp_sh',
        views: 189,
      },
      {
        id: 'assoc-004',
        name: '金融投资俱乐部',
        type: 'CLUB',
        logo: 'https://picsum.photos/200/200?random=4',
        description: '专注于金融投资领域的交流俱乐部',
        introduction: '金融投资俱乐部致力于为校友提供专业的金融投资交流平台，分享投资经验，探讨市场趋势。',
        contactPerson: '赵老师',
        contactPhone: '13600136000',
        contactEmail: 'finance@edp.pku.edu.cn',
        wechat: 'edp_finance',
        views: 312,
      },
      {
        id: 'assoc-005',
        name: '创业创新俱乐部',
        type: 'CLUB',
        logo: 'https://picsum.photos/200/200?random=5',
        description: '专注创业创新的交流平台',
        introduction: '创业创新俱乐部为有创业意向的校友提供资源对接和经验分享，助力校友创业成功。',
        contactPerson: '刘老师',
        contactPhone: '13500135000',
        contactEmail: 'startup@edp.pku.edu.cn',
        wechat: 'edp_startup',
        views: 267,
      },
      {
        id: 'assoc-006',
        name: '企业家俱乐部',
        type: 'CLUB',
        logo: 'https://picsum.photos/200/200?random=6',
        description: '高端企业家交流平台',
        introduction: '企业家俱乐部汇聚了众多成功企业家，分享管理经验，探讨商业机会。',
        contactPerson: '陈老师',
        contactPhone: '13400134000',
        contactEmail: 'ceo@edp.pku.edu.cn',
        wechat: 'edp_ceo',
        views: 445,
      },
    ],
    skipDuplicates: true,
  });
  console.log('✅ 6个协会创建成功');

  // 2. 创建活动数据
  console.log('📋 Creating activities...');
  await prisma.activity.createMany({
    data: [
      {
        id: 'act-001',
        associationId: 'assoc-001',
        title: '深圳校友会2024新春联谊会',
        images: JSON.stringify(['https://picsum.photos/400/300?random=11', 'https://picsum.photos/400/300?random=12', 'https://picsum.photos/400/300?random=13']),
        content: '<p>2024年1月20日，深圳校友会新春联谊会在深圳湾成功举办，近200位校友参加...</p>',
        status: 'PUBLISHED',
        views: 523,
        likes: 89,
        publishTime: new Date('2024-01-21'),
      },
      {
        id: 'act-002',
        associationId: 'assoc-004',
        title: '金融投资沙龙：2024年市场展望',
        images: JSON.stringify(['https://picsum.photos/400/300?random=21', 'https://picsum.photos/400/300?random=22']),
        content: '<p>金融投资俱乐部举办2024年市场展望沙龙，邀请多位投资大咖分享见解...</p>',
        status: 'PUBLISHED',
        views: 678,
        likes: 134,
        publishTime: new Date('2024-01-15'),
      },
      {
        id: 'act-003',
        associationId: 'assoc-005',
        title: '创业项目路演活动',
        images: JSON.stringify(['https://picsum.photos/400/300?random=31', 'https://picsum.photos/400/300?random=32', 'https://picsum.photos/400/300?random=33', 'https://picsum.photos/400/300?random=34']),
        content: '<p>创业创新俱乐部举办项目路演，10个优秀创业项目进行展示...</p>',
        status: 'PUBLISHED',
        views: 445,
        likes: 67,
        publishTime: new Date('2024-01-10'),
      },
    ],
    skipDuplicates: true,
  });
  console.log('✅ 3个活动创建成功');

  // 3. 创建资讯数据
  console.log('📋 Creating news...');
  await prisma.news.createMany({
    data: [
      {
        id: 'news-001',
        title: '北大汇丰商学院2024年EDP招生简章发布',
        category: 'NOTICE',
        coverImage: 'https://picsum.photos/800/400?random=101',
        summary: '2024年EDP课程全面升级，三大课堂体系助力企业家成长，现已开放报名！',
        content: '<h2>2024年EDP课程体系</h2><p>北大汇丰商学院2024年EDP课程现已开放报名。本年度课程包括：</p><ul><li>加速课堂：聚焦企业快速成长</li><li>大师课堂：顶级专家授课</li><li>赋能课堂：实战能力提升</li></ul><p>欢迎企业家和高管报名参加！</p>',
        status: 'PUBLISHED',
        isTop: true,
        views: 1256,
        publishTime: new Date('2024-01-25'),
      },
      {
        id: 'news-002',
        title: '深圳校友会年度聚会圆满举办',
        category: 'ALUMNI',
        coverImage: 'https://picsum.photos/800/400?random=102',
        summary: '近200位校友齐聚深圳湾，共话发展，共谋未来',
        content: '<p>1月20日，深圳校友会年度聚会在深圳湾成功举行，近200位来自各行各业的北大汇丰校友参加了本次活动。</p><p>活动期间，校友们进行了深入交流，分享了各自的发展经验...</p>',
        status: 'PUBLISHED',
        isTop: false,
        views: 834,
        publishTime: new Date('2024-01-21'),
      },
      {
        id: 'news-003',
        title: '北大汇丰教授团队获国家级研究课题',
        category: 'NOTICE',
        coverImage: 'https://picsum.photos/800/400?random=103',
        summary: '我院多位教授获得国家社科基金重大项目立项',
        content: '<p>近日，国家社科基金重大项目立项名单公布，北大汇丰商学院多位教授的研究课题成功立项...</p>',
        status: 'PUBLISHED',
        isTop: true,
        views: 567,
        publishTime: new Date('2024-01-18'),
      },
      {
        id: 'news-004',
        title: '校友企业成功上市，创造行业奇迹',
        category: 'ALUMNI',
        coverImage: 'https://picsum.photos/800/400?random=104',
        summary: 'EDP校友企业成功登陆科创板，市值突破百亿',
        content: '<p>1月15日，北大汇丰EDP校友创办的科技企业成功在科创板上市，开盘市值突破百亿元...</p>',
        status: 'PUBLISHED',
        isTop: false,
        views: 923,
        publishTime: new Date('2024-01-15'),
      },
      {
        id: 'news-005',
        title: '国际商学院认证再获佳绩',
        category: 'NOTICE',
        coverImage: 'https://picsum.photos/800/400?random=105',
        summary: '北大汇丰通过EQUIS国际认证，跻身全球顶尖商学院',
        content: '<p>北大汇丰商学院成功通过EQUIS国际认证，成为国内少数获得此认证的商学院之一...</p>',
        status: 'PUBLISHED',
        isTop: false,
        views: 445,
        publishTime: new Date('2024-01-12'),
      },
      {
        id: 'news-006',
        title: '2023年度优秀校友表彰大会举行',
        category: 'ALUMNI',
        coverImage: 'https://picsum.photos/800/400?random=106',
        summary: '10位杰出校友获得年度表彰，成为行业标杆',
        content: '<p>1月8日，北大汇丰商学院2023年度优秀校友表彰大会在深圳举行...</p>',
        status: 'PUBLISHED',
        isTop: false,
        views: 678,
        publishTime: new Date('2024-01-08'),
      },
    ],
    skipDuplicates: true,
  });
  console.log('✅ 6条资讯创建成功');

  // 4. 创建课程数据
  console.log('📋 Creating courses...');
  const courses = await prisma.course.createMany({
    data: [
      {
        id: 'course-001',
        title: '企业战略管理与创新',
        category: 'MASTER',
        coverImage: 'https://picsum.photos/800/600?random=201',
        introduction: '本课程由顶级战略管理专家授课，深入探讨企业战略规划、组织变革和创新管理的核心理念与实践方法。',
        teacherId: 'teacher-001',
        teacherName: '张维教授',
        teacherAvatar: 'https://picsum.photos/100/100?random=301',
        teacherTitle: '北京大学汇丰商学院院长、教授',
        teacherIntro: '张维教授，北京大学汇丰商学院院长，金融学教授，博士生导师。主要研究领域为金融工程、风险管理等。',
        startTime: new Date('2024-03-15T09:00:00'),
        endTime: new Date('2024-03-15T17:00:00'),
        location: '北京大学汇丰商学院',
        credit: 2,
        maxStudents: 60,
        enrollStatus: 'OPEN',
        status: 'PUBLISHED',
        views: 1234,
      },
      {
        id: 'course-002',
        title: '数字化转型与商业模式创新',
        category: 'ACCELERATE',
        coverImage: 'https://picsum.photos/800/600?random=202',
        introduction: '探讨数字经济时代的商业模式创新，分析成功案例，助力企业数字化转型。',
        teacherId: 'teacher-002',
        teacherName: '李志军教授',
        teacherAvatar: 'https://picsum.photos/100/100?random=302',
        teacherTitle: '管理学教授',
        teacherIntro: '李志军教授，管理学教授，专注于企业数字化转型、商业模式创新研究20余年。',
        startTime: new Date('2024-03-22T09:00:00'),
        endTime: new Date('2024-03-22T17:00:00'),
        location: '深圳',
        credit: 1,
        maxStudents: 80,
        enrollStatus: 'OPEN',
        status: 'PUBLISHED',
        views: 987,
      },
      {
        id: 'course-003',
        title: '金融科技与产业创新',
        category: 'MASTER',
        coverImage: 'https://picsum.photos/800/600?random=203',
        introduction: '深入解析金融科技发展趋势，探讨区块链、AI等技术在金融领域的应用。',
        teacherId: 'teacher-003',
        teacherName: '王明辉教授',
        teacherAvatar: 'https://picsum.photos/100/100?random=303',
        teacherTitle: '金融学教授',
        teacherIntro: '王明辉教授，金融学教授，金融科技研究专家，曾在多家知名金融机构担任顾问。',
        startTime: new Date('2024-03-29T09:00:00'),
        endTime: new Date('2024-03-29T17:00:00'),
        location: '北京大学汇丰商学院',
        credit: 2,
        maxStudents: 50,
        enrollStatus: 'OPEN',
        status: 'PUBLISHED',
        views: 876,
      },
      {
        id: 'course-004',
        title: '领导力提升与团队管理',
        category: 'EMPOWER',
        coverImage: 'https://picsum.photos/800/600?random=204',
        introduction: '提升领导力，打造高效团队，掌握现代管理精髓。',
        teacherId: 'teacher-004',
        teacherName: '陈春花教授',
        teacherAvatar: 'https://picsum.photos/100/100?random=304',
        teacherTitle: '管理学教授',
        teacherIntro: '陈春花教授，著名管理学家，畅销书作者，专注于组织管理和领导力研究。',
        startTime: new Date('2024-04-05T09:00:00'),
        endTime: new Date('2024-04-05T17:00:00'),
        location: '上海',
        credit: 1,
        maxStudents: 100,
        enrollStatus: 'OPEN',
        status: 'PUBLISHED',
        views: 1456,
      },
      {
        id: 'course-005',
        title: '宏观经济形势与政策解读',
        category: 'MASTER',
        coverImage: 'https://picsum.photos/800/600?random=205',
        introduction: '权威专家解读最新宏观经济政策，分析经济形势，把握投资机遇。',
        teacherId: 'teacher-005',
        teacherName: '刘俏教授',
        teacherAvatar: 'https://picsum.photos/100/100?random=305',
        teacherTitle: '经济学教授',
        teacherIntro: '刘俏教授，经济学教授，宏观经济研究专家，长期关注中国经济发展。',
        startTime: new Date('2024-04-12T09:00:00'),
        endTime: new Date('2024-04-12T17:00:00'),
        location: '北京大学汇丰商学院',
        credit: 2,
        maxStudents: 80,
        enrollStatus: 'OPEN',
        status: 'PUBLISHED',
        views: 1123,
      },
      {
        id: 'course-006',
        title: '资本运作与并购重组',
        category: 'ACCELERATE',
        coverImage: 'https://picsum.photos/800/600?random=206',
        introduction: '深入学习资本市场运作规则，掌握并购重组实战技巧。',
        teacherId: 'teacher-006',
        teacherName: '周其仁教授',
        teacherAvatar: 'https://picsum.photos/100/100?random=306',
        teacherTitle: '经济学教授',
        teacherIntro: '周其仁教授，著名经济学家，专注于产权制度、企业理论等领域研究。',
        startTime: new Date('2024-04-19T09:00:00'),
        endTime: new Date('2024-04-19T17:00:00'),
        location: '深圳',
        credit: 1,
        maxStudents: 60,
        enrollStatus: 'OPEN',
        status: 'PUBLISHED',
        views: 789,
      },
      {
        id: 'course-007',
        title: '企业文化建设与品牌塑造',
        category: 'EMPOWER',
        coverImage: 'https://picsum.photos/800/600?random=207',
        introduction: '打造卓越企业文化，提升品牌价值，增强企业核心竞争力。',
        teacherId: 'teacher-007',
        teacherName: '许小年教授',
        teacherAvatar: 'https://picsum.photos/100/100?random=307',
        teacherTitle: '经济学教授',
        teacherIntro: '许小年教授，经济学教授，企业战略专家，多年企业咨询经验。',
        startTime: new Date('2024-04-26T09:00:00'),
        endTime: new Date('2024-04-26T17:00:00'),
        location: '广州',
        credit: 1,
        maxStudents: 70,
        enrollStatus: 'OPEN',
        status: 'PUBLISHED',
        views: 654,
      },
      {
        id: 'course-008',
        title: '人工智能与商业应用',
        category: 'ACCELERATE',
        coverImage: 'https://picsum.photos/800/600?random=208',
        introduction: 'AI时代的商业机遇，探索人工智能在各行业的创新应用。',
        teacherId: 'teacher-008',
        teacherName: '李开复博士',
        teacherAvatar: 'https://picsum.photos/100/100?random=308',
        teacherTitle: '人工智能专家',
        teacherIntro: '李开复博士，人工智能科学家，创新工场创始人，AI领域权威专家。',
        startTime: new Date('2024-02-28T09:00:00'),
        endTime: new Date('2024-02-28T17:00:00'),
        location: '北京',
        credit: 1,
        maxStudents: 120,
        enrollStatus: 'CLOSED',
        status: 'PUBLISHED',
        views: 2345,
      },
    ],
    skipDuplicates: true,
  });
  console.log('✅ 8门课程创建成功');

  console.log('\n🎉 数据库填充完成！');
  console.log('\n📊 数据统计:');
  console.log(`   - 协会: 6个 (3个校友会 + 3个俱乐部)`);
  console.log(`   - 活动: 3个`);
  console.log(`   - 资讯: 6条 (3条学院通知 + 3条校友动态)`);
  console.log(`   - 课程: 8门 (3门大师课堂 + 3门加速课堂 + 2门赋能课堂)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

