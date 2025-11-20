@echo off
chcp 65001 >nul
echo ================================
echo 停止 EDP 项目 Docker 服务
echo ================================
echo.

cd /d "%~dp0\..\infra\docker"

echo 停止所有服务...
docker-compose down

echo.
echo ✅ Docker 服务已停止
echo.
pause




