@echo off
echo ======================================
echo    启动 EDP 后端服务
echo ======================================
echo.

cd /d D:\edp-project\backend

echo [1/2] 检查环境...
if not exist "node_modules" (
    echo 错误: node_modules 不存在，请先运行 npm install
    pause
    exit /b 1
)

if not exist ".env" (
    echo 警告: .env 文件不存在
    echo 请确保配置了以下环境变量：
    echo   - DATABASE_URL
    echo   - JWT_SECRET
    echo.
)

echo [2/2] 启动开发服务器...
echo.
echo 服务将运行在: http://localhost:3000
echo API文档地址: http://localhost:3000/api/docs
echo.
echo 按 Ctrl+C 停止服务
echo ======================================
echo.

npm run start:dev


