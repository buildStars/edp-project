#!/bin/bash
# ================================================
# 快速添加学分脚本
# ================================================

USER_ID="3505330e-01fc-4b86-9c06-04dfa0a74678"
AMOUNT=9999

echo "================================================"
echo "给用户添加学分"
echo "用户ID: $USER_ID"
echo "学分数: $AMOUNT"
echo "================================================"

# 进入项目目录
cd "$(dirname "$0")"

# 读取数据库配置
if [ -f .env ]; then
    source .env
fi

# 执行SQL（推荐使用方案2 - 安全模式）
cat << EOF | mysql --default-character-set=utf8mb4
-- 使用数据库
USE edp_db;

-- 创建或更新学分账户
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
  '$USER_ID',
  $AMOUNT,
  $AMOUNT,
  0,
  NOW(),
  NOW()
)
ON DUPLICATE KEY UPDATE
  balance = balance + $AMOUNT,
  total = total + $AMOUNT,
  updatedAt = NOW();

-- 添加学分记录
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
  (SELECT id FROM credits WHERE userId = '$USER_ID'),
  'ADMIN_ADD',
  $AMOUNT,
  (SELECT balance FROM credits WHERE userId = '$USER_ID'),
  '管理员手动添加${AMOUNT}学分',
  NOW()
);

-- 查询结果
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
WHERE c.userId = '$USER_ID';
EOF

echo ""
echo "✅ 学分添加完成！"
echo "================================================"

