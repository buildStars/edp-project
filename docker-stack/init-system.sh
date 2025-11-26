#!/bin/bash

###############################################################################
# 生产环境一键初始化脚本
# 用于 Docker 部署后的首次初始化
# 
# 功能：
# 1. 初始化管理员账号 (13800138000 / admin123456)
# 2. 初始化权限数据 (ADMIN, TEACHER, STUDENT, STAFF 四种角色权限)
# 3. 初始化系统配置 (小程序名称、联系方式等)
#
# 使用方法：
#   chmod +x init-system.sh
#   ./init-system.sh
###############################################################################

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}🚀 EDP 系统初始化脚本${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 检查 Docker 容器是否运行
if ! docker ps | grep -q edp-backend; then
    echo -e "${RED}❌ 后端容器未运行！${NC}"
    echo -e "${YELLOW}请先启动服务: docker-compose up -d${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 后端容器运行正常${NC}"
echo ""

# 执行初始化脚本
echo -e "${BLUE}📦 开始执行初始化...${NC}"
echo ""

docker exec edp-backend npm run prisma:init

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✨ 初始化完成！${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${YELLOW}📋 管理员登录信息：${NC}"
echo -e "   账号: ${GREEN}13800138000${NC}"
echo -e "   密码: ${GREEN}admin123456${NC}"
echo -e "   登录地址: ${GREEN}http://192.168.0.28${NC}"
echo ""
echo -e "${RED}⚠️  安全提示：${NC}"
echo -e "${RED}   1. 请登录后立即修改默认密码${NC}"
echo -e "${RED}   2. 完善管理员个人信息${NC}"
echo -e "${RED}   3. 定期备份数据库${NC}"
echo ""






