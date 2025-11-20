-- 查询刚创建的资讯
SELECT 
  id,
  title,
  category,
  status,
  isTop,
  publishTime,
  createdAt
FROM news
WHERE id = '752b9e18-6ccb-4d1e-a189-e39ad73798c2';

-- 查看所有资讯状态分布
SELECT 
  status,
  COUNT(*) as count
FROM news
GROUP BY status;

-- 查看最近创建的5条资讯
SELECT 
  id,
  title,
  status,
  isTop,
  createdAt
FROM news
ORDER BY createdAt DESC
LIMIT 5;

-- 发布这条资讯
UPDATE news
SET status = 'PUBLISHED'
WHERE id = '752b9e18-6ccb-4d1e-a189-e39ad73798c2';

-- 验证更新
SELECT 
  id,
  title,
  status,
  publishTime,
  updatedAt
FROM news
WHERE id = '752b9e18-6ccb-4d1e-a189-e39ad73798c2';






