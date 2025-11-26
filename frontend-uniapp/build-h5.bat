@echo off
REM uni-app H5本地构建脚本 (Windows)

echo 🚀 开始构建 uni-app H5版本...

cd /d "%~dp0"

REM 检查node_modules
if not exist "node_modules" (
    echo ❌ node_modules不存在
    echo 💡 请在HBuilderX中打开此项目，它会自动安装依赖
    exit /b 1
)

REM 构建H5版本
echo 📦 正在构建...
call npm run build:h5

REM 检查构建产物
if exist "dist\build\h5" (
    echo ✅ 构建成功！输出目录: dist\build\h5
    dir /s dist\build\h5
) else if exist "unpackage\dist\build\h5" (
    echo ✅ 构建成功！输出目录: unpackage\dist\build\h5
    dir /s unpackage\dist\build\h5
    REM 创建符号链接方便Docker使用
    mklink /J dist unpackage\dist 2>nul
) else (
    echo ❌ 构建失败，未找到输出目录
    exit /b 1
)

echo.
echo 🎉 构建完成！现在可以执行：
echo    cd ..\docker-stack
echo    docker-compose build uniapp-h5
echo    docker-compose up -d uniapp-h5
pause

