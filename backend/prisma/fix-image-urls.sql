-- ============================================
-- 批量修复数据库中的图片URL
-- 将内网IP替换为公网域名
-- ============================================

-- 使用前请备份数据库！
-- mysqldump -u root -p edp_db > backup_$(date +%Y%m%d_%H%M%S).sql

-- 1. 更新用户表的头像URL
UPDATE users 
SET avatar = REPLACE(
    REPLACE(
        REPLACE(avatar, 'http://192.168.0.28', 'https://edp.yunchuangshuan.com'),
        'http://192.168.0.76', 'https://edp.yunchuangshuan.com'
    ),
    'http://127.0.0.1:3000', 'https://edp.yunchuangshuan.com'
)
WHERE avatar LIKE 'http://192.168.%' 
   OR avatar LIKE 'http://127.0.0.1%'
   OR avatar LIKE 'http://localhost%';

-- 2. 更新课程表的封面图
UPDATE courses 
SET cover_image = REPLACE(
    REPLACE(
        REPLACE(cover_image, 'http://192.168.0.28', 'https://edp.yunchuangshuan.com'),
        'http://192.168.0.76', 'https://edp.yunchuangshuan.com'
    ),
    'http://127.0.0.1:3000', 'https://edp.yunchuangshuan.com'
)
WHERE cover_image LIKE 'http://192.168.%' 
   OR cover_image LIKE 'http://127.0.0.1%'
   OR cover_image LIKE 'http://localhost%';

-- 3. 更新课程表的详情图片（JSON字段）
-- 注意：这个需要根据实际字段结构调整
UPDATE courses 
SET images = REPLACE(
    REPLACE(
        REPLACE(images, 'http://192.168.0.28', 'https://edp.yunchuangshuan.com'),
        'http://192.168.0.76', 'https://edp.yunchuangshuan.com'
    ),
    'http://127.0.0.1:3000', 'https://edp.yunchuangshuan.com'
)
WHERE images LIKE '%http://192.168.%' 
   OR images LIKE '%http://127.0.0.1%'
   OR images LIKE '%http://localhost%';

-- 4. 更新课件表的文件URL
UPDATE materials 
SET file_url = REPLACE(
    REPLACE(
        REPLACE(file_url, 'http://192.168.0.28', 'https://edp.yunchuangshuan.com'),
        'http://192.168.0.76', 'https://edp.yunchuangshuan.com'
    ),
    'http://127.0.0.1:3000', 'https://edp.yunchuangshuan.com'
)
WHERE file_url LIKE 'http://192.168.%' 
   OR file_url LIKE 'http://127.0.0.1%'
   OR file_url LIKE 'http://localhost%';

-- 5. 更新新闻表的封面图
UPDATE news 
SET cover_image = REPLACE(
    REPLACE(
        REPLACE(cover_image, 'http://192.168.0.28', 'https://edp.yunchuangshuan.com'),
        'http://192.168.0.76', 'https://edp.yunchuangshuan.com'
    ),
    'http://127.0.0.1:3000', 'https://edp.yunchuangshuan.com'
)
WHERE cover_image LIKE 'http://192.168.%' 
   OR cover_image LIKE 'http://127.0.0.1%'
   OR cover_image LIKE 'http://localhost%';

-- 6. 更新新闻表的内容图片（JSON字段）
UPDATE news 
SET images = REPLACE(
    REPLACE(
        REPLACE(images, 'http://192.168.0.28', 'https://edp.yunchuangshuan.com'),
        'http://192.168.0.76', 'https://edp.yunchuangshuan.com'
    ),
    'http://127.0.0.1:3000', 'https://edp.yunchuangshuan.com'
)
WHERE images LIKE '%http://192.168.%' 
   OR images LIKE '%http://127.0.0.1%'
   OR images LIKE '%http://localhost%';

-- 7. 更新活动表的封面图
UPDATE activities 
SET cover_image = REPLACE(
    REPLACE(
        REPLACE(cover_image, 'http://192.168.0.28', 'https://edp.yunchuangshuan.com'),
        'http://192.168.0.76', 'https://edp.yunchuangshuan.com'
    ),
    'http://127.0.0.1:3000', 'https://edp.yunchuangshuan.com'
)
WHERE cover_image LIKE 'http://192.168.%' 
   OR cover_image LIKE 'http://127.0.0.1%'
   OR cover_image LIKE 'http://localhost%';

-- 8. 更新活动表的图片列表（JSON字段）
UPDATE activities 
SET images = REPLACE(
    REPLACE(
        REPLACE(images, 'http://192.168.0.28', 'https://edp.yunchuangshuan.com'),
        'http://192.168.0.76', 'https://edp.yunchuangshuan.com'
    ),
    'http://127.0.0.1:3000', 'https://edp.yunchuangshuan.com'
)
WHERE images LIKE '%http://192.168.%' 
   OR images LIKE '%http://127.0.0.1%'
   OR images LIKE '%http://localhost%';

-- 9. 更新系统配置表的banner图片（JSON字段）
UPDATE system_settings 
SET value = REPLACE(
    REPLACE(
        REPLACE(value, 'http://192.168.0.28', 'https://edp.yunchuangshuan.com'),
        'http://192.168.0.76', 'https://edp.yunchuangshuan.com'
    ),
    'http://127.0.0.1:3000', 'https://edp.yunchuangshuan.com'
)
WHERE `key` = 'banners' 
  AND (value LIKE '%http://192.168.%' 
    OR value LIKE '%http://127.0.0.1%'
    OR value LIKE '%http://localhost%');

-- 10. 更新协会表的logo
UPDATE associations 
SET logo = REPLACE(
    REPLACE(
        REPLACE(logo, 'http://192.168.0.28', 'https://edp.yunchuangshuan.com'),
        'http://192.168.0.76', 'https://edp.yunchuangshuan.com'
    ),
    'http://127.0.0.1:3000', 'https://edp.yunchuangshuan.com'
)
WHERE logo LIKE 'http://192.168.%' 
   OR logo LIKE 'http://127.0.0.1%'
   OR logo LIKE 'http://localhost%';

-- ============================================
-- 验证修复结果
-- ============================================

-- 查看是否还有内网IP的URL
SELECT 'users' as table_name, COUNT(*) as count FROM users 
WHERE avatar LIKE '%192.168.%' OR avatar LIKE '%127.0.0.1%' OR avatar LIKE '%localhost%'
UNION ALL
SELECT 'courses', COUNT(*) FROM courses 
WHERE cover_image LIKE '%192.168.%' OR cover_image LIKE '%127.0.0.1%' OR cover_image LIKE '%localhost%'
   OR images LIKE '%192.168.%' OR images LIKE '%127.0.0.1%' OR images LIKE '%localhost%'
UNION ALL
SELECT 'materials', COUNT(*) FROM materials 
WHERE file_url LIKE '%192.168.%' OR file_url LIKE '%127.0.0.1%' OR file_url LIKE '%localhost%'
UNION ALL
SELECT 'news', COUNT(*) FROM news 
WHERE cover_image LIKE '%192.168.%' OR cover_image LIKE '%127.0.0.1%' OR cover_image LIKE '%localhost%'
   OR images LIKE '%192.168.%' OR images LIKE '%127.0.0.1%' OR images LIKE '%localhost%'
UNION ALL
SELECT 'activities', COUNT(*) FROM activities 
WHERE cover_image LIKE '%192.168.%' OR cover_image LIKE '%127.0.0.1%' OR cover_image LIKE '%localhost%'
   OR images LIKE '%192.168.%' OR images LIKE '%127.0.0.1%' OR images LIKE '%localhost%'
UNION ALL
SELECT 'associations', COUNT(*) FROM associations 
WHERE logo LIKE '%192.168.%' OR logo LIKE '%127.0.0.1%' OR logo LIKE '%localhost%';

-- ============================================
-- 使用说明
-- ============================================
-- 1. 先备份数据库！
-- 2. 在服务器上执行：
--    docker exec -i edp-mysql mysql -uroot -p密码 edp_db < fix-image-urls.sql
-- 3. 检查验证结果，确认所有内网IP都已替换
-- ============================================

