@echo off
chcp 65001 >nul
echo ================================
echo 启动 EDP 项目 Docker 服务
echo ================================
echo.

cd /d "%~dp0\..\infra\docker"

echo [1/3] 检查 Docker 是否运行...
docker version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker 未运行！请先启动 Docker Desktop
    pause
    exit /b 1
)
echo ✅ Docker 正在运行

echo.
echo [2/3] 停止旧容器（如果有）...
docker-compose down 2>nul

echo.
echo [3/3] 启动 MySQL 和 Redis 服务...
echo.
docker-compose up -d mysql redis

echo.
echo ================================
echo 等待服务启动中...
echo ================================
timeout /t 10 /nobreak >nul

echo.
echo 检查服务状态...
docker-compose ps

echo.
echo ================================
echo ✅ Docker 服务启动完成！
echo ================================
echo.
echo 服务信息：
echo - MySQL: localhost:3306
echo   用户名: root
echo   密码: root123456
echo   数据库: edp_db
echo.
echo - Redis: localhost:6379
echo   密码: redis123456
echo.
echo 现在可以启动后端服务了！
echo 运行: npm run start:dev
echo.

pause




