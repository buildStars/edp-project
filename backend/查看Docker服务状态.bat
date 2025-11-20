@echo off
chcp 65001 >nul
echo ================================
echo EDP 项目 Docker 服务状态
echo ================================
echo.

cd /d "%~dp0\..\infra\docker"

echo 正在运行的容器：
docker-compose ps

echo.
echo ================================
echo MySQL 日志（最后20行）：
echo ================================
docker-compose logs --tail=20 mysql

echo.
echo ================================
echo Redis 日志（最后20行）：
echo ================================
docker-compose logs --tail=20 redis

echo.
pause




