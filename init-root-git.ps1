# EDP 项目根目录 Git 初始化脚本（PowerShell 版本）
# 将所有子项目合并到一个统一的 Git 仓库

$ErrorActionPreference = "Stop"

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "EDP 项目根目录 Git 初始化" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# 1. 备份子目录的 .git（以防万一）
Write-Host "[1/6] 备份子目录的 Git 仓库..." -ForegroundColor Yellow

New-Item -ItemType Directory -Force -Path ".git-backup" | Out-Null

if (Test-Path "backend\.git") {
    Write-Host "  备份 backend\.git"
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    Copy-Item -Path "backend\.git" -Destination ".git-backup\backend-git-$timestamp" -Recurse
}

if (Test-Path "admin-frontend\.git") {
    Write-Host "  备份 admin-frontend\.git"
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    Copy-Item -Path "admin-frontend\.git" -Destination ".git-backup\admin-frontend-git-$timestamp" -Recurse
}

if (Test-Path "frontend-uniapp\.git") {
    Write-Host "  备份 frontend-uniapp\.git"
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    Copy-Item -Path "frontend-uniapp\.git" -Destination ".git-backup\frontend-uniapp-git-$timestamp" -Recurse
}

Write-Host "✓ 备份完成" -ForegroundColor Green
Write-Host ""

# 2. 移除子目录的 .git
Write-Host "[2/6] 移除子目录的 Git 仓库..." -ForegroundColor Yellow

if (Test-Path "backend\.git") {
    Write-Host "  移除 backend\.git"
    Remove-Item -Path "backend\.git" -Recurse -Force
}

if (Test-Path "admin-frontend\.git") {
    Write-Host "  移除 admin-frontend\.git"
    Remove-Item -Path "admin-frontend\.git" -Recurse -Force
}

if (Test-Path "frontend-uniapp\.git") {
    Write-Host "  移除 frontend-uniapp\.git"
    Remove-Item -Path "frontend-uniapp\.git" -Recurse -Force
}

Write-Host "✓ 子目录 .git 已移除" -ForegroundColor Green
Write-Host ""

# 3. 初始化根目录 Git
Write-Host "[3/6] 初始化根目录 Git 仓库..." -ForegroundColor Yellow

if (Test-Path ".git") {
    Write-Host "  警告: 根目录已存在 .git 目录，跳过初始化" -ForegroundColor Red
} else {
    git init
    Write-Host "✓ Git 仓库初始化完成" -ForegroundColor Green
}
Write-Host ""

# 4. 添加所有文件
Write-Host "[4/6] 添加文件到 Git..." -ForegroundColor Yellow
git add .
Write-Host "✓ 文件已添加" -ForegroundColor Green
Write-Host ""

# 5. 显示状态
Write-Host "[5/6] 查看 Git 状态..." -ForegroundColor Yellow
$statusOutput = git status --short
$fileCount = ($statusOutput | Measure-Object).Count
Write-Host "总计: $fileCount 个文件将被提交"
$statusOutput | Select-Object -First 20 | ForEach-Object { Write-Host $_ }
if ($fileCount -gt 20) {
    Write-Host "..."
}
Write-Host ""

# 6. 提交
Write-Host "[6/6] 创建首次提交..." -ForegroundColor Yellow

$commitMessage = @"
Initial commit: Complete EDP system

- Backend: NestJS + Prisma + MySQL
- Admin Frontend: Vue3 + Element Plus  
- Mini Program: Uni-app + WeChat
- Docker: Complete docker-compose setup
- Features: Course management, Credit system, Checkin, User management
"@

git commit -m $commitMessage

Write-Host "✓ 提交完成" -ForegroundColor Green
Write-Host ""

# 显示提交信息
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "✓ Git 仓库初始化成功！" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "统计信息:" -ForegroundColor Cyan
git log --oneline
Write-Host ""
git show --stat HEAD
Write-Host ""

Write-Host "后续步骤:" -ForegroundColor Yellow
Write-Host "1. 在 GitHub 上创建新仓库（如 edp-project）"
Write-Host "2. 添加远程仓库:"
Write-Host "   git remote add origin https://github.com/buildStars/edp-project.git"
Write-Host "3. 推送代码:"
Write-Host "   git branch -M main"
Write-Host "   git push -u origin main"
Write-Host ""
Write-Host "备份位置: .git-backup/" -ForegroundColor Cyan
Write-Host "如需恢复子项目的 Git 历史，请查看备份目录"
Write-Host ""

