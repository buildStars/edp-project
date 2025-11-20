@echo off
chcp 65001 >nul
echo ==========================================
echo 🔧 重启后端服务脚本
echo ==========================================
echo.

echo 🔍 正在查找占用 3000 端口的进程...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
    set PID=%%a
    goto :found
)

echo ⚠️  未发现占用 3000 端口的进程
goto :start

:found
echo ✅ 发现进程 PID: %PID%
echo 🔪 正在停止进程...
taskkill /PID %PID% /F
if %ERRORLEVEL% EQU 0 (
    echo ✅ 进程已停止
) else (
    echo ❌ 停止失败，请手动停止
)
timeout /t 2 >nul

:start
echo.
echo 🚀 启动后端服务...
echo ==========================================
call npm run start:dev

