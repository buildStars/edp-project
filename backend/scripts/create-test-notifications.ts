/**
 * 创建测试通知脚本
 * 
 * 使用方法：
 * 1. 修改下面的 TEST_USER_ID 为你的测试用户ID
 * 2. 运行: npx ts-node scripts/create-test-notifications.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ⚠️ 修改为你的测试用户ID
const TEST_USER_ID = '5fb1dc1f-b81a-4d11-8eb3-c4dc22cdc33d';

async function createTestNotifications() {
  console.log('🚀 开始创建测试通知...\n');

  const testNotifications = [
    {
      userId: TEST_USER_ID,
      type: 'NEWS_UPDATE' as const,
      title: '新资讯发布',
      content: '《企业数字化转型与商业创新》已发布，快来查看吧！',
      data: {
        newsId: 'test-news-1',
        url: '/pages/news/detail?id=test-news-1',
      },
    },
    {
      userId: TEST_USER_ID,
      type: 'ACTIVITY_REMIND' as const,
      title: '活动即将开始',
      content: '您报名的活动"北大汇丰同学会年度聚会"将于明天10:00开始',
      data: {
        activityId: 'test-activity-1',
        url: '/pages/association/activity-detail?id=test-activity-1',
      },
    },
    {
      userId: TEST_USER_ID,
      type: 'COURSE_CHECKIN' as const,
      title: '课程签到提醒',
      content: '《企业战略管理与创新》课程现已开始，请及时签到',
      data: {
        courseId: 'course-001',
        url: '/pages/course/detail?id=course-001',
      },
    },
    {
      userId: TEST_USER_ID,
      type: 'ENROLLMENT_AUDIT' as const,
      title: '报名审核通过',
      content: '您的课程"金融科技与产业创新"报名申请已通过审核',
      data: {
        courseId: 'course-003',
        url: '/pages/mine/my-courses',
      },
    },
    {
      userId: TEST_USER_ID,
      type: 'COURSE_EVALUATE' as const,
      title: '课程评价提醒',
      content: '您的课程"领导力提升与团队管理"已结束，快来评价吧',
      data: {
        courseId: 'course-004',
        url: '/pages/mine/my-courses',
      },
    },
    {
      userId: TEST_USER_ID,
      type: 'CREDIT_EXPIRE' as const,
      title: '学分即将到期',
      content: '您有10学分将于2024年12月31日到期，请及时使用',
      data: {
        url: '/pages/mine/my-credits',
      },
    },
    {
      userId: TEST_USER_ID,
      type: 'SYSTEM' as const,
      title: '系统维护通知',
      content: '系统将于今晚22:00-24:00进行维护升级，期间可能无法访问',
      data: null,
    },
  ];

  try {
    for (const notification of testNotifications) {
      const created = await prisma.notification.create({
        data: {
          userId: notification.userId,
          type: notification.type,
          title: notification.title,
          content: notification.content,
          data: notification.data,
        },
      });
      console.log(`✅ 已创建通知: ${created.title} (ID: ${created.id})`);
    }

    console.log(`\n🎉 成功创建 ${testNotifications.length} 条测试通知！`);
    
    // 查询未读数量
    const unreadCount = await prisma.notification.count({
      where: {
        userId: TEST_USER_ID,
        isRead: false,
      },
    });
    console.log(`📊 当前未读消息数: ${unreadCount}\n`);

  } catch (error) {
    console.error('❌ 创建通知失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// 执行脚本
createTestNotifications();

