@echo off
echo ==========================================
echo  网页快照服务启动器 - Windows版
echo ==========================================
echo.

REM 检查Node.js是否已安装
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [错误] 未找到Node.js! 请安装Node.js后再尝试。
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)

REM 输出当前Node版本
echo [信息] 使用Node.js版本:
node -v
echo.

REM 启动服务器脚本
echo [信息] 正在启动网页快照服务...
echo.
node start-snapshot-server.js

REM 如果脚本退出，保持命令行窗口打开
echo.
echo [信息] 服务已停止。
pause 