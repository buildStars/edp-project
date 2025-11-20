-- ================================================
-- 给用户添加 9999 学分
-- 用户ID: 3505330e-01fc-4b86-9c06-04dfa0a74678
-- ================================================

-- 方案1: 如果用户还没有学分账户，创建新账户
-- 注意：如果已存在会报错，使用方案2
INSERT INTO credits (
  id,
  userId,
  balance,
  total,
  used,
  createdAt,
  updatedAt
) VALUES (
  UUID(),
  '3505330e-01fc-4b86-9c06-04dfa0a74678',
  9999,    -- 余额
  9999,    -- 累计获得
  0,       -- 累计使用
  NOW(),
  NOW()
);

-- 同时创建学分记录
INSERT INTO credit_records (
  id,
  creditId,
  type,
  amount,
  balance,
  remark,
  createdAt
) VALUES (
  UUID(),
  (SELECT id FROM credits WHERE userId = '3505330e-01fc-4b86-9c06-04dfa0a74678'),
  'ADMIN_ADD',
  9999,
  9999,
  '管理员手动添加学分',
  NOW()
);

-- ================================================
-- 方案2: 如果用户已有学分账户，增加学分
-- 使用这个更安全，会自动处理新建或更新
-- ================================================

-- 使用 INSERT ... ON DUPLICATE KEY UPDATE
INSERT INTO credits (
  id,
  userId,
  balance,
  total,
  used,
  createdAt,
  updatedAt
) VALUES (
  UUID(),
  '3505330e-01fc-4b86-9c06-04dfa0a74678',
  9999,
  9999,
  0,
  NOW(),
  NOW()
)
ON DUPLICATE KEY UPDATE
  balance = balance + 9999,
  total = total + 9999,
  updatedAt = NOW();

-- 然后添加学分记录
INSERT INTO credit_records (
  id,
  creditId,
  type,
  amount,
  balance,
  remark,
  createdAt
) VALUES (
  UUID(),
  (SELECT id FROM credits WHERE userId = '3505330e-01fc-4b86-9c06-04dfa0a74678'),
  'ADMIN_ADD',
  9999,
  (SELECT balance FROM credits WHERE userId = '3505330e-01fc-4b86-9c06-04dfa0a74678'),
  '管理员手动添加9999学分',
  NOW()
);

-- ================================================
-- 查询验证
-- ================================================
SELECT 
  c.userId,
  u.nickname,
  u.realName,
  c.balance as '当前余额',
  c.total as '累计获得',
  c.used as '累计使用',
  c.updatedAt as '更新时间'
FROM credits c
LEFT JOIN users u ON c.userId = u.id
WHERE c.userId = '3505330e-01fc-4b86-9c06-04dfa0a74678';

-- 查看学分记录
SELECT 
  type as '类型',
  amount as '变动数量',
  balance as '操作后余额',
  remark as '备注',
  createdAt as '时间'
FROM credit_records
WHERE creditId = (SELECT id FROM credits WHERE userId = '3505330e-01fc-4b86-9c06-04dfa0a74678')
ORDER BY createdAt DESC
LIMIT 10;

