@echo off
REM uni-app H5本地构建脚本 (Windows)

echo ========================================
echo    uni-app H5 本地构建工具
echo ========================================

cd /d "%~dp0"

REM 方法1：尝试使用HBuilderX CLI（如果已安装）
echo.
echo 方法1: 尝试使用 HBuilderX CLI...
where cli >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ 找到 HBuilderX CLI
    echo 📦 正在构建...
    cli publish --platform h5 --project edp-uniapp
    if %errorlevel% equ 0 (
        echo ✅ CLI构建成功！
        goto :check_output
    ) else (
        echo ⚠️  CLI构建失败，尝试方法2...
    )
) else (
    echo ℹ️  未安装 HBuilderX CLI，尝试方法2...
)

REM 方法2：使用npm构建
echo.
echo 方法2: 使用 npm 构建...
if not exist "node_modules" (
    echo ❌ node_modules不存在
    echo.
    echo 💡 解决方案：
    echo    1. 在HBuilderX中打开此项目（会自动安装依赖）
    echo    2. 或手动运行: npm install --legacy-peer-deps
    pause
    exit /b 1
)

echo 📦 正在构建...
call npm run build:h5

:check_output
REM 检查构建产物
echo.
echo 🔍 检查构建产物...
if exist "dist\build\h5\index.html" (
    echo ✅ 构建成功！输出目录: dist\build\h5
    dir dist\build\h5 | findstr /i "index.html"
    set BUILD_DIR=dist\build\h5
) else if exist "unpackage\dist\build\h5\index.html" (
    echo ✅ 构建成功！输出目录: unpackage\dist\build\h5
    dir unpackage\dist\build\h5 | findstr /i "index.html"
    set BUILD_DIR=unpackage\dist\build\h5
) else (
    echo ❌ 构建失败，未找到 index.html
    echo.
    echo 💡 请使用HBuilderX手动构建：
    echo    1. 打开HBuilderX
    echo    2. 打开本项目
    echo    3. 点击: 发行 → 网站-H5移动版
    pause
    exit /b 1
)

echo.
echo ========================================
echo 🎉 构建完成！
echo ========================================
echo.
echo 📁 构建产物: %BUILD_DIR%
echo.
echo 📋 下一步操作：
echo    1. 提交构建产物:
echo       git add -f frontend-uniapp/%BUILD_DIR%/
echo       git commit -m "build: uni-app h5"
echo       git push origin main
echo.
echo    2. 服务器部署:
echo       cd ..\docker-stack
echo       docker-compose build uniapp-h5
echo       docker-compose up -d uniapp-h5
echo.
pause

