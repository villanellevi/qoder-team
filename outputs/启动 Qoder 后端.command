#!/bin/bash

# Qoder Team 后端启动脚本
# 双击在 Terminal 中运行

cd "$(dirname "$0")"
SERVER_DIR="/Users/xuechen/.qoderwork/workspace/mpno9zj3d0fkyfsv/qoder-team-server"

echo "=========================================="
echo "  Qoder Team 后端服务启动器"
echo "=========================================="
echo ""

# 检查端口是否已被占用
PID=$(lsof -ti:3000 2>/dev/null)
if [ -n "$PID" ]; then
    echo "检测到后端服务已在运行 (PID: $PID)"
    echo "访问地址: http://localhost:3000"
    echo ""
    echo "如需重启，请先结束该进程:"
    echo "  kill -9 $PID"
    echo ""
    read -p "按回车键打开日志窗口..."
    # 尝试找到对应的 Terminal 窗口并前置
    osascript -e 'tell application "Terminal" to activate' 2>/dev/null
    exit 0
fi

# 检查目录是否存在
if [ ! -d "$SERVER_DIR" ]; then
    echo "错误: 找不到后端项目目录"
    echo "$SERVER_DIR"
    echo ""
    read -p "按回车键退出..."
    exit 1
fi

echo "正在启动 NestJS 开发服务器..."
echo "项目路径: $SERVER_DIR"
echo ""

cd "$SERVER_DIR"
npm run start:dev
