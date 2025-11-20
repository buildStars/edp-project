/**
 * 为指定用户创建测试通知
 * 使用方法：npx tsx scripts/create-notifications-for-user.ts <userId>
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 从命令行获取用户ID，或使用默认值
  const userId = process.argv[2] || await getFirstUserId();

  if (!userId) {
    console.error('❌ 错误：找不到用户，请指定用户ID');
    console.log('用法: npx tsx scripts/create-notifications-for-user.ts <userId>');
    process.exit(1);
  }

  console.log(`🚀 为用户 ${userId} 创建测试通知...\n`);

  // 验证用户是否存在
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, nickname: true, phone: true },
  });

  if (!user) {
    console.error(`❌ 错误：用户 ${userId} 不存在`);
    process.exit(1);
  }

  console.log(`✓ 找到用户: ${user.nickname || user.phone} (${user.id})\n`);

  // 获取真实的数据用于通知
  const [firstNews, firstCourse, firstActivity] = await Promise.all([
    prisma.news.findFirst({ select: { id: true, title: true } }),
    prisma.course.findFirst({ select: { id: true, title: true } }),
    prisma.activity.findFirst({ select: { id: true, title: true } }),
  ]);

  // 创建测试通知
  const notifications: any[] = [
    {
      userId,
      type: 'SYSTEM' as const,
      title: '系统通知',
      content: '欢迎使用北大汇丰EDP系统！您可以在这里查看各类通知消息。',
      data: null,
    },
  ];

  // 如果有资讯，添加资讯通知
  if (firstNews) {
    notifications.push({
      userId,
      type: 'NEWS_UPDATE' as const,
      title: '新资讯发布',
      content: `《${firstNews.title}》已发布，快来查看吧！`,
      data: {
        newsId: firstNews.id,
        url: `/pages/news/detail?id=${firstNews.id}`,
      },
    });
  }

  // 如果有活动，添加活动通知
  if (firstActivity) {
    notifications.push({
      userId,
      type: 'ACTIVITY_REMIND' as const,
      title: '活动提醒',
      content: `您关注的活动《${firstActivity.title}》即将开始，请准时参加！`,
      data: {
        activityId: firstActivity.id,
        url: `/pages/association/activity-detail?id=${firstActivity.id}`,
      },
    });
  }

  // 如果有课程，添加课程通知
  if (firstCourse) {
    notifications.push(
      {
        userId,
        type: 'COURSE_CHECKIN' as const,
        title: '签到提醒',
        content: `您的课程《${firstCourse.title}》即将开始，请及时签到。`,
        data: {
          courseId: firstCourse.id,
          url: `/pages/course/detail?id=${firstCourse.id}`,
        },
      },
      {
        userId,
        type: 'ENROLLMENT_AUDIT' as const,
        title: '报名审核通过',
        content: `您报名的课程《${firstCourse.title}》已审核通过，请按时上课。`,
        data: {
          courseId: firstCourse.id,
          url: `/pages/course/detail?id=${firstCourse.id}`,
        },
        isRead: true, // 设置为已读
      }
    );
  }

  console.log('📝 开始创建通知...\n');

  for (const notification of notifications) {
    try {
      const created = await prisma.notification.create({
        data: notification,
      });
      
      const status = created.isRead ? '已读' : '未读';
      console.log(`✅ [${status}] ${created.title}`);
    } catch (error) {
      console.error(`❌ 创建通知失败: ${notification.title}`, error.message);
    }
  }

  console.log('\n📊 统计信息:');
  console.log('════════════════════════════════');
  
  const [totalCount, unreadCount, readCount] = await Promise.all([
    prisma.notification.count({ where: { userId } }),
    prisma.notification.count({ where: { userId, isRead: false } }),
    prisma.notification.count({ where: { userId, isRead: true } }),
  ]);

  console.log(`总通知数: ${totalCount}`);
  console.log(`未读: ${unreadCount}`);
  console.log(`已读: ${readCount}`);
  console.log('════════════════════════════════');

  console.log('\n✨ 通知创建完成！');
  console.log(`\n💡 提示: 现在可以在前端消息中心查看这些通知了`);
}

/**
 * 获取第一个学生用户ID
 */
async function getFirstUserId(): Promise<string | null> {
  const user = await prisma.user.findFirst({
    where: { role: 'STUDENT' },
    select: { id: true },
  });
  return user?.id || null;
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

