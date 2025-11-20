/**
 * 简单的测试通知创建脚本（JavaScript 版本）
 * 
 * 使用方法：
 * 1. 修改下面的 TEST_USER_ID 为你的测试用户ID
 * 2. 运行: node scripts/test-notifications-simple.js
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// ⚠️ 修改为你的测试用户ID
const TEST_USER_ID = '5fb1dc1f-b81a-4d11-8eb3-c4dc22cdc33d';

async function createTestNotifications() {
  console.log('🚀 开始创建测试通知...\n');

  const testNotifications = [
    {
      userId: TEST_USER_ID,
      type: 'NEWS_UPDATE',
      title: '新资讯发布',
      content: '《企业数字化转型与商业创新》已发布，快来查看吧！',
      data: {
        newsId: 'test-news-1',
        url: '/pages/news/detail?id=test-news-1',
      },
    },
    {
      userId: TEST_USER_ID,
      type: 'ACTIVITY_REMIND',
      title: '活动即将开始',
      content: '您报名的活动"北大汇丰同学会年度聚会"将于明天10:00开始',
      data: {
        activityId: 'test-activity-1',
        url: '/pages/association/activity-detail?id=test-activity-1',
      },
    },
    {
      userId: TEST_USER_ID,
      type: 'COURSE_CHECKIN',
      title: '课程签到提醒',
      content: '《企业战略管理与创新》课程现已开始，请及时签到',
      data: {
        courseId: 'course-001',
        url: '/pages/course/detail?id=course-001',
      },
    },
    {
      userId: TEST_USER_ID,
      type: 'ENROLLMENT_AUDIT',
      title: '报名审核通过',
      content: '您的课程"金融科技与产业创新"报名申请已通过审核',
      data: {
        courseId: 'course-003',
        url: '/pages/mine/my-courses',
      },
    },
    {
      userId: TEST_USER_ID,
      type: 'COURSE_EVALUATE',
      title: '课程评价提醒',
      content: '您的课程"领导力提升与团队管理"已结束，快来评价吧',
      data: {
        courseId: 'course-004',
        url: '/pages/mine/my-courses',
      },
    },
    {
      userId: TEST_USER_ID,
      type: 'CREDIT_EXPIRE',
      title: '学分即将到期',
      content: '您有10学分将于2024年12月31日到期，请及时使用',
      data: {
        url: '/pages/mine/my-credits',
      },
    },
    {
      userId: TEST_USER_ID,
      type: 'SYSTEM',
      title: '系统维护通知',
      content: '系统将于今晚22:00-24:00进行维护升级，期间可能无法访问',
      data: null,
    },
  ];

  try {
    console.log(`准备创建 ${testNotifications.length} 条测试通知...\n`);

    for (const notification of testNotifications) {
      const created = await prisma.notification.create({
        data: notification,
      });
      console.log(`✅ 已创建通知: ${created.title}`);
      console.log(`   ID: ${created.id}`);
      console.log(`   类型: ${created.type}`);
      console.log(`   时间: ${created.createdAt.toLocaleString('zh-CN')}\n`);
    }

    console.log(`🎉 成功创建 ${testNotifications.length} 条测试通知！\n`);
    
    // 查询未读数量
    const unreadCount = await prisma.notification.count({
      where: {
        userId: TEST_USER_ID,
        isRead: false,
      },
    });
    console.log(`📊 当前未读消息数: ${unreadCount}`);
    
    // 查询所有通知
    const allNotifications = await prisma.notification.findMany({
      where: { userId: TEST_USER_ID },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
    console.log(`📋 最近10条通知:\n`);
    allNotifications.forEach((n, i) => {
      console.log(`${i + 1}. [${n.isRead ? '已读' : '未读'}] ${n.title}`);
    });

  } catch (error) {
    console.error('\n❌ 创建通知失败:');
    console.error('错误信息:', error.message);
    if (error.code) {
      console.error('错误代码:', error.code);
    }
    if (error.meta) {
      console.error('详细信息:', error.meta);
    }
  } finally {
    await prisma.$disconnect();
    console.log('\n✅ 数据库连接已断开');
  }
}

// 执行脚本
createTestNotifications()
  .then(() => {
    console.log('\n✨ 脚本执行完成！');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 脚本执行失败:', error);
    process.exit(1);
  });

