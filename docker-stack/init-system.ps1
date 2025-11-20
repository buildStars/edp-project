# ============================================================================
# 生产环境一键初始化脚本 (Windows PowerShell)
# 用于 Docker 部署后的首次初始化
# 
# 功能：
# 1. 初始化管理员账号 (13800138000 / admin123456)
# 2. 初始化权限数据 (ADMIN, TEACHER, STUDENT, STAFF 四种角色权限)
# 3. 初始化系统配置 (小程序名称、联系方式等)
#
# 使用方法：
#   PowerShell 中执行: .\init-system.ps1
# ============================================================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Blue
Write-Host "🚀 EDP 系统初始化脚本" -ForegroundColor Blue
Write-Host "========================================" -ForegroundColor Blue
Write-Host ""

# 检查 Docker 容器是否运行
$containerRunning = docker ps --filter "name=edp-backend" --format "{{.Names}}"

if (-not $containerRunning) {
    Write-Host "❌ 后端容器未运行！" -ForegroundColor Red
    Write-Host "请先启动服务: docker-compose up -d" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ 后端容器运行正常" -ForegroundColor Green
Write-Host ""

# 执行初始化脚本
Write-Host "📦 开始执行初始化..." -ForegroundColor Blue
Write-Host ""

docker exec edp-backend npm run prisma:init

Write-Host ""
Write-Host "========================================" -ForegroundColor Blue
Write-Host "✨ 初始化完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Blue
Write-Host ""
Write-Host "📋 管理员登录信息：" -ForegroundColor Yellow
Write-Host "   账号: " -NoNewline
Write-Host "13800138000" -ForegroundColor Green
Write-Host "   密码: " -NoNewline
Write-Host "admin123456" -ForegroundColor Green
Write-Host "   登录地址: " -NoNewline
Write-Host "http://192.168.0.28" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  安全提示：" -ForegroundColor Red
Write-Host "   1. 请登录后立即修改默认密码" -ForegroundColor Red
Write-Host "   2. 完善管理员个人信息" -ForegroundColor Red
Write-Host "   3. 定期备份数据库" -ForegroundColor Red
Write-Host ""

