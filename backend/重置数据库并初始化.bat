@echo off
chcp 65001 >nul
echo =====================================
echo 北大汇丰EDP - 数据库重置与初始化
echo =====================================
echo.

echo [1/4] 停止后端服务...
taskkill /F /IM node.exe 2>nul
timeout /t 2 >nul
echo ✓ 已停止所有Node进程
echo.

echo [2/4] 重新生成 Prisma Client...
cd /d "%~dp0"
call npx prisma generate
if %errorlevel% neq 0 (
    echo ✗ Prisma Client 生成失败
    pause
    exit /b 1
)
echo ✓ Prisma Client 生成成功
echo.

echo [3/4] 同步数据库...
call npx prisma db push --accept-data-loss --skip-generate
if %errorlevel% neq 0 (
    echo ✗ 数据库同步失败
    pause
    exit /b 1
)
echo ✓ 数据库同步成功
echo.

echo [4/4] 创建种子数据...
call npx tsx prisma/seeds/simple-seed.ts
if %errorlevel% neq 0 (
    echo ✗ 种子数据创建失败
    pause
    exit /b 1
)
echo.

echo =====================================
echo ✨ 数据库重置与初始化完成！
echo =====================================
echo.
echo 📝 测试账号：
echo    管理员: 13800000000 / admin123456
echo    学生: 13800138001-5 / 123456
echo.
pause

