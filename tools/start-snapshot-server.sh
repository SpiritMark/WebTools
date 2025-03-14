#!/bin/bash

echo "=========================================="
echo " 网页快照服务启动器 - Mac/Linux版"
echo "=========================================="
echo

# 检查Node.js是否已安装
if ! command -v node &> /dev/null; then
    echo "[错误] 未找到Node.js! 请安装Node.js后再尝试。"
    echo "下载地址: https://nodejs.org/"
    echo
    echo "按Enter键退出..."
    read
    exit 1
fi

# 输出当前Node版本
echo "[信息] 使用Node.js版本:"
node -v
echo

# 启动服务器脚本
echo "[信息] 正在启动网页快照服务..."
echo
node start-snapshot-server.js

# 如果脚本退出，保持终端窗口打开
echo
echo "[信息] 服务已停止。"
echo "按Enter键退出..."
read 