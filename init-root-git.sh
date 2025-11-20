#!/bin/bash

# EDP 项目根目录 Git 初始化脚本
# 将所有子项目合并到一个统一的 Git 仓库

set -e

echo "======================================"
echo "EDP 项目根目录 Git 初始化"
echo "======================================"

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. 备份子目录的 .git（以防万一）
echo -e "${YELLOW}[1/6] 备份子目录的 Git 仓库...${NC}"
mkdir -p .git-backup

if [ -d "backend/.git" ]; then
    echo "  备份 backend/.git"
    cp -r backend/.git .git-backup/backend-git-$(date +%Y%m%d_%H%M%S)
fi

if [ -d "admin-frontend/.git" ]; then
    echo "  备份 admin-frontend/.git"
    cp -r admin-frontend/.git .git-backup/admin-frontend-git-$(date +%Y%m%d_%H%M%S)
fi

if [ -d "frontend-uniapp/.git" ]; then
    echo "  备份 frontend-uniapp/.git"
    cp -r frontend-uniapp/.git .git-backup/frontend-uniapp-git-$(date +%Y%m%d_%H%M%S)
fi

echo -e "${GREEN}✓ 备份完成${NC}"

# 2. 移除子目录的 .git
echo -e "${YELLOW}[2/6] 移除子目录的 Git 仓库...${NC}"

if [ -d "backend/.git" ]; then
    echo "  移除 backend/.git"
    rm -rf backend/.git
fi

if [ -d "admin-frontend/.git" ]; then
    echo "  移除 admin-frontend/.git"
    rm -rf admin-frontend/.git
fi

if [ -d "frontend-uniapp/.git" ]; then
    echo "  移除 frontend-uniapp/.git"
    rm -rf frontend-uniapp/.git
fi

echo -e "${GREEN}✓ 子目录 .git 已移除${NC}"

# 3. 初始化根目录 Git
echo -e "${YELLOW}[3/6] 初始化根目录 Git 仓库...${NC}"

if [ -d ".git" ]; then
    echo -e "${RED}  警告: 根目录已存在 .git 目录，跳过初始化${NC}"
else
    git init
    echo -e "${GREEN}✓ Git 仓库初始化完成${NC}"
fi

# 4. 添加所有文件
echo -e "${YELLOW}[4/6] 添加文件到 Git...${NC}"
git add .

echo -e "${GREEN}✓ 文件已添加${NC}"

# 5. 显示状态
echo -e "${YELLOW}[5/6] 查看 Git 状态...${NC}"
git status --short | head -20
echo "..."
echo "总计: $(git status --short | wc -l) 个文件"

# 6. 提交
echo -e "${YELLOW}[6/6] 创建首次提交...${NC}"
git commit -m "Initial commit: Complete EDP system with backend, admin frontend and mini-program

- Backend: NestJS + Prisma + MySQL
- Admin Frontend: Vue3 + Element Plus
- Mini Program: Uni-app + WeChat
- Docker: Complete docker-compose setup
- Features: Course management, Credit system, Checkin, User management, etc."

echo -e "${GREEN}✓ 提交完成${NC}"

# 显示提交信息
echo ""
echo "======================================"
echo -e "${GREEN}✓ Git 仓库初始化成功！${NC}"
echo "======================================"
echo ""
echo "统计信息:"
git log --oneline
echo ""
git show --stat HEAD
echo ""
echo "后续步骤:"
echo "1. 在 GitHub 上创建新仓库（如 edp-project）"
echo "2. 添加远程仓库:"
echo "   git remote add origin https://github.com/buildStars/edp-project.git"
echo "3. 推送代码:"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "备份位置: .git-backup/"
echo "如需恢复子项目的 Git 历史，请查看备份目录"
echo ""

