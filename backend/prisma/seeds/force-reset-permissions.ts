/**
 * 强制重置权限数据脚本
 * 使用方法: npm run seed:permissions:force
 * 
 * ⚠️ 警告：此操作会删除所有自定义的权限配置！
 */
import { forceResetPermissions } from './permissions.seed';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('');
  console.log('⚠️⚠️⚠️  警告  ⚠️⚠️⚠️');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('此操作将：');
  console.log('  1. 删除所有角色的自定义权限配置');
  console.log('  2. 恢复为系统默认权限配置');
  console.log('');
  console.log('如果您只是想修改权限，请使用【系统设置 > 角色权限】');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  
  await forceResetPermissions();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

