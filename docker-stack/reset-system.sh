#!/bin/bash

##############################################
# 系统完全重置脚本
# 警告：此脚本会删除所有用户和权限数据！
##############################################

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${RED}⚠️  警告：系统完全重置${NC}"
echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}此操作将：${NC}"
echo "  1. 删除所有用户账号"
echo "  2. 删除所有权限数据"
echo "  3. 删除所有角色权限配置"
echo "  4. 重新创建管理员账号"
echo "  5. 重新初始化权限系统"
echo ""
echo -e "${RED}此操作不可逆！${NC}"
echo ""

# 二次确认
read -p "确定要继续吗？(输入 YES 继续): " confirm
if [ "$confirm" != "YES" ]; then
    echo -e "${BLUE}已取消操作${NC}"
    exit 0
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}开始重置系统...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# 数据库密码（从 .env 文件读取）
DB_PASSWORD=$(grep MYSQL_ROOT_PASSWORD .env | cut -d '=' -f2)

echo ""
echo -e "${YELLOW}步骤 1/5: 清空数据表...${NC}"
docker exec edp-mysql mysql -uroot -p${DB_PASSWORD} edp_db -e "
TRUNCATE TABLE role_permissions;
TRUNCATE TABLE permissions;
TRUNCATE TABLE users;
SELECT '✅ 数据表已清空' as status;
"

echo ""
echo -e "${YELLOW}步骤 2/5: 重新初始化权限和管理员...${NC}"
docker exec edp-backend npm run prisma:init

echo ""
echo -e "${YELLOW}步骤 3/5: 重启后端服务...${NC}"
docker-compose restart backend

echo ""
echo -e "${YELLOW}步骤 4/5: 等待后端服务启动...${NC}"
sleep 15

echo ""
echo -e "${YELLOW}步骤 5/5: 验证初始化结果...${NC}"
docker exec edp-mysql mysql -uroot -p${DB_PASSWORD} edp_db -e "
SELECT '📊 数据统计' as ''; 
SELECT 'users' as 'Table', COUNT(*) as 'Count' FROM users
UNION ALL
SELECT 'permissions', COUNT(*) FROM permissions
UNION ALL
SELECT 'role_permissions', COUNT(*) FROM role_permissions;
"

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ 系统重置完成！${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}📋 管理员账号信息：${NC}"
docker exec edp-mysql mysql -uroot -p${DB_PASSWORD} edp_db -e "
SELECT phone as '手机号', email as '邮箱', name as '姓名', role as '角色' 
FROM users WHERE role = 'ADMIN';
"

echo ""
echo -e "${YELLOW}默认管理员账号：${NC}"
echo "  手机号: 13800138000"
echo "  密码: admin123456"
echo ""
echo -e "${GREEN}现在可以使用此账号登录系统了！${NC}"
echo ""

