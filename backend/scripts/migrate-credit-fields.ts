/**
 * 学分字段迁移脚本
 * 将旧的 corporateBalance/transferableBalance 迁移到新的 personalBalance/lockedBalance
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('开始迁移学分字段...');

  // 获取所有学分记录
  const credits = await prisma.$queryRaw<any[]>`
    SELECT 
      id, 
      userId,
      balance,
      total,
      used,
      corporateBalance,
      corporateTotal,
      corporateUsed,
      transferableBalance,
      personalBalance,
      lockedBalance
    FROM credits
  `;

  console.log(`找到 ${credits.length} 条学分记录需要迁移`);

  for (const credit of credits) {
    // 迁移逻辑：
    // - lockedBalance = corporateBalance (企业余额 → 锁定余额)
    // - personalBalance = transferableBalance (可转赠余额 → 个人余额)
    // - 如果 personalBalance 和 lockedBalance 都为 0，则使用旧数据
    
    const needsMigration = 
      (credit.corporateBalance > 0 || credit.transferableBalance > 0) &&
      (credit.personalBalance === 0 && credit.lockedBalance === 0);

    if (needsMigration) {
      const newLockedBalance = credit.corporateBalance || 0;
      const newPersonalBalance = credit.transferableBalance || 0;

      await prisma.$executeRaw`
        UPDATE credits 
        SET 
          lockedBalance = ${newLockedBalance},
          personalBalance = ${newPersonalBalance}
        WHERE id = ${credit.id}
      `;

      console.log(
        `迁移用户 ${credit.userId}: lockedBalance=${newLockedBalance}, personalBalance=${newPersonalBalance}`
      );
    }
  }

  console.log('学分字段迁移完成！');
}

main()
  .catch((e) => {
    console.error('迁移失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

