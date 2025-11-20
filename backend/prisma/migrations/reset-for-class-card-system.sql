-- 次卡系统数据迁移脚本
-- 执行前请备份数据库！

-- 1. 删除旧的学分相关表（因为结构完全改变）
DROP TABLE IF EXISTS `credit_records`;
DROP TABLE IF EXISTS `credits`;

-- 2. 创建新的次卡表和学分表
-- 这些表会由 Prisma 自动创建，此处仅作记录

-- 3. 为所有现有用户创建次卡账户（余额为0）
-- 注意：这将在应用启动后通过 Prisma 自动处理

-- 4. 为所有现有用户创建学分账户（累计为0）
-- 注意：这将在应用启动后通过 Prisma 自动处理

-- 5. 清空现有报名记录的签到状态（可选，根据实际需求）
-- UPDATE enrollments SET checkedIn = false, checkInTime = NULL WHERE checkedIn = true;

-- 说明：
-- - 所有用户的次卡余额初始为 0
-- - 所有用户的学分累计初始为 0
-- - 管理员需要通过后台为用户充值次卡
-- - 学分将在用户完成课程后自动发放

