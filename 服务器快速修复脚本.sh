#!/bin/bash

# 服务器快速修复脚本
# 用于确保服务器上的代码是最新版本

set -e

echo "=========================================="
echo "EDP 项目 - 服务器快速修复脚本"
echo "=========================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 配置
PROJECT_DIR="/opt/edp-project"  # 根据实际情况修改
DOCKER_STACK_DIR="$PROJECT_DIR/docker-stack"

echo -e "${YELLOW}[1/7] 检查项目目录...${NC}"
if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${RED}错误: 项目目录不存在: $PROJECT_DIR${NC}"
    echo "请修改脚本中的 PROJECT_DIR 变量"
    exit 1
fi
cd "$PROJECT_DIR"
echo -e "${GREEN}✓ 项目目录存在${NC}"
echo ""

echo -e "${YELLOW}[2/7] 检查当前版本...${NC}"
git log --oneline -1
echo ""

echo -e "${YELLOW}[3/7] 备份本地修改（如有）...${NC}"
if [ -n "$(git status --porcelain)" ]; then
    echo "发现本地修改，创建备份..."
    git stash save "backup-$(date +%Y%m%d_%H%M%S)"
    echo -e "${GREEN}✓ 已备份本地修改${NC}"
else
    echo "没有本地修改"
fi
echo ""

echo -e "${YELLOW}[4/7] 拉取最新代码...${NC}"
git fetch origin
git reset --hard origin/main
echo -e "${GREEN}✓ 代码已更新到最新版本${NC}"
echo ""

echo -e "${YELLOW}[5/7] 验证最新提交...${NC}"
echo "最近的 5 个提交："
git log --oneline -5
echo ""
echo "检查关键修复是否存在..."

# 检查后端 Dockerfile 是否包含修复
if grep -q "COPY --from=build /app/node_modules/.prisma" backend/Dockerfile; then
    echo -e "${GREEN}✓ 后端 Dockerfile 已包含 Prisma Client 复制修复${NC}"
else
    echo -e "${RED}✗ 后端 Dockerfile 缺少 Prisma Client 复制修复${NC}"
    echo "请检查是否正确拉取了最新代码"
fi

if grep -q "node:18-alpine3.17" backend/Dockerfile; then
    echo -e "${GREEN}✓ 后端 Dockerfile 使用 Alpine 3.17${NC}"
else
    echo -e "${RED}✗ 后端 Dockerfile 未使用 Alpine 3.17${NC}"
fi

if grep -q "registry.npmmirror.com" backend/Dockerfile; then
    echo -e "${GREEN}✓ 后端 Dockerfile 使用淘宝镜像源${NC}"
else
    echo -e "${RED}✗ 后端 Dockerfile 未配置淘宝镜像源${NC}"
fi
echo ""

echo -e "${YELLOW}[6/7] 查看关键文件差异...${NC}"
echo "后端 Dockerfile 的关键部分："
echo "---"
grep -A 3 "从构建阶段复制" backend/Dockerfile || echo "未找到复制 Prisma Client 的代码"
echo "---"
echo ""

echo -e "${YELLOW}[7/7] 准备重新构建...${NC}"
if [ -d "$DOCKER_STACK_DIR" ]; then
    cd "$DOCKER_STACK_DIR"
    echo "当前在: $(pwd)"
    echo ""
    echo -e "${GREEN}准备就绪！${NC}"
    echo ""
    echo "接下来请手动执行以下命令："
    echo ""
    echo -e "${YELLOW}# 停止现有服务${NC}"
    echo "docker-compose down -v"
    echo ""
    echo -e "${YELLOW}# 清理旧镜像和缓存${NC}"
    echo "docker system prune -af"
    echo ""
    echo -e "${YELLOW}# 重新构建（不使用缓存）${NC}"
    echo "docker-compose build --no-cache"
    echo ""
    echo -e "${YELLOW}# 启动服务${NC}"
    echo "docker-compose up -d"
    echo ""
    echo -e "${YELLOW}# 查看日志${NC}"
    echo "docker-compose logs -f backend"
else
    echo -e "${RED}错误: Docker stack 目录不存在: $DOCKER_STACK_DIR${NC}"
    exit 1
fi

echo ""
echo "=========================================="
echo -e "${GREEN}检查完成！${NC}"
echo "=========================================="






