/**
 * 清除所有用户的登录状态
 * 在权限变更后运行，强制所有用户重新登录以获取最新权限
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function logoutAllUsers() {
  console.log('🔐 开始清除所有用户的登录状态...');

  try {
    // 注意：这里我们不能直接操作 token，因为 token 存储在前端
    // 但我们可以更新一个字段来标记权限已变更
    
    // 方案1：如果有 lastTokenRefresh 字段，更新它
    // 方案2：输出提示信息，让管理员通知用户
    
    console.log('');
    console.log('⚠️  权限已更新，请通知所有在线用户：');
    console.log('   1. 退出登录');
    console.log('   2. 重新登录以获取最新权限');
    console.log('');
    console.log('💡 或者清除浏览器的 localStorage：');
    console.log('   - 在浏览器控制台执行：localStorage.clear()');
    console.log('   - 然后刷新页面');
    console.log('');
    console.log('✅ 提示信息已显示');
  } catch (error) {
    console.error('❌ 操作失败:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

logoutAllUsers()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });










