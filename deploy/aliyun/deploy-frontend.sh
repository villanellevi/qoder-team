#!/bin/bash
# 前端构建并部署到阿里云服务器脚本
# 在本地开发机运行，将构建好的前端上传到服务器

set -e

SERVER_IP="${1:-}"
SERVER_USER="${2:-root}"
FRONTEND_DIR="/Users/xuechen/.qoderwork/workspace/mpno9zj3d0fkyfsv/qoder-team"
REMOTE_DIR="/var/www/qoder-team"

if [ -z "$SERVER_IP" ]; then
    echo "用法: ./deploy-frontend.sh <服务器IP> [用户名]"
    echo "示例: ./deploy-frontend.sh 123.45.67.89 root"
    exit 1
fi

echo "=========================================="
echo "  Qoder Team 前端部署"
echo "  目标服务器: $SERVER_USER@$SERVER_IP"
echo "=========================================="

# 1. 构建前端
echo "[1/3] 构建前端..."
cd $FRONTEND_DIR

# 确保使用生产环境 API 地址
if [ ! -f ".env.production" ]; then
    echo "错误：缺少 .env.production 文件"
    echo "请先配置 VITE_API_URL 为你的后端域名"
    exit 1
fi

npm run build

# 2. 上传到服务器
echo "[2/3] 上传到服务器..."
ssh $SERVER_USER@$SERVER_IP "mkdir -p $REMOTE_DIR"
rsync -avz --delete $FRONTEND_DIR/dist/ $SERVER_USER@$SERVER_IP:$REMOTE_DIR/

# 3. 重启 Nginx
echo "[3/3] 重启 Nginx..."
ssh $SERVER_USER@$SERVER_IP "systemctl restart nginx"

echo ""
echo "=========================================="
echo "  前端部署完成！"
echo "=========================================="
echo ""
echo "访问地址: http://$SERVER_IP"
echo ""
