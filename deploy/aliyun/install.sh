#!/bin/bash
# Qoder Team 阿里云一键部署脚本
# 适用于 Ubuntu 22.04 LTS

set -e

APP_DIR="/opt/qoder-team"
FRONTEND_DIR="/var/www/qoder-team"
DOMAIN="${1:-}"

echo "=========================================="
echo "  Qoder Team 阿里云部署脚本"
echo "=========================================="

# 检查是否以 root 运行
if [ "$EUID" -ne 0 ]; then
    echo "请使用 sudo 运行此脚本"
    exit 1
fi

# 1. 更新系统
echo "[1/8] 更新系统..."
apt update && apt upgrade -y

# 2. 安装必要工具
echo "[2/8] 安装必要工具..."
apt install -y curl wget git nginx certbot python3-certbot-nginx

# 3. 安装 Docker
echo "[3/8] 安装 Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
fi

# 安装 Docker Compose
if ! command -v docker-compose &> /dev/null; then
    apt install -y docker-compose-plugin || {
        # 备用安装方式
        curl -L "https://github.com/docker/compose/releases/download/v2.23.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        chmod +x /usr/local/bin/docker-compose
    }
fi

# 4. 创建应用目录
echo "[4/8] 创建应用目录..."
mkdir -p $APP_DIR
mkdir -p $FRONTEND_DIR

# 5. 复制项目文件（假设当前在项目根目录）
echo "[5/8] 复制项目文件..."
if [ -d "qoder-team-server" ]; then
    cp -r qoder-team-server/* $APP_DIR/
else
    echo "错误：未找到 qoder-team-server 目录"
    echo "请确保在代码根目录运行此脚本"
    exit 1
fi

# 6. 配置环境变量
echo "[6/8] 配置环境变量..."
cd $APP_DIR

# 生成 JWT Secret
JWT_SECRET=$(openssl rand -base64 32)

# 获取服务器公网 IP
SERVER_IP=$(curl -s http://checkip.amazonaws.com || curl -s http://icanhazip.com || echo "localhost")

cat > .env << EOF
NODE_ENV=production
PORT=3000
DATABASE_URL="postgresql://qoder:qoder@db:5432/qoder_team?schema=public"
JWT_SECRET="$JWT_SECRET"
FRONTEND_URL="http://$SERVER_IP"
REDIS_URL=redis://redis:6379
EOF

echo "JWT_SECRET 已生成: $JWT_SECRET"
echo "服务器 IP: $SERVER_IP"

# 7. 启动服务
echo "[7/8] 启动 Docker 服务..."
docker compose -f docker-compose.prod.yml up -d

# 等待数据库就绪
echo "等待数据库就绪..."
sleep 10

# 执行数据库迁移
docker compose -f docker-compose.prod.yml exec -T app npx prisma migrate deploy

# 导入 seed 数据
echo "导入演示数据..."
docker compose -f docker-compose.prod.yml exec -T app npx tsx prisma/seed.ts || echo "Seed 已完成或跳过"

# 8. 配置 Nginx
echo "[8/8] 配置 Nginx..."

if [ -n "$DOMAIN" ]; then
    # 使用域名配置
    sed -i "s/server_name _;/server_name $DOMAIN;/" /etc/nginx/sites-available/qoder-team 2>/dev/null || true
fi

# 复制 Nginx 配置
cp /opt/qoder-team/nginx.conf /etc/nginx/sites-available/qoder-team 2>/dev/null || cat > /etc/nginx/sites-available/qoder-team << 'NGINX_EOF'
server {
    listen 80;
    server_name _;

    location / {
        root /var/www/qoder-team;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
    }
}
NGINX_EOF

# 启用配置
ln -sf /etc/nginx/sites-available/qoder-team /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# 测试 Nginx 配置
nginx -t

# 重启 Nginx
systemctl restart nginx
systemctl enable nginx

echo ""
echo "=========================================="
echo "  部署完成！"
echo "=========================================="
echo ""
echo "后端 API: http://$SERVER_IP:3000"
echo "前端页面: http://$SERVER_IP"
echo "健康检查: http://$SERVER_IP/api/health"
echo ""

if [ -n "$DOMAIN" ]; then
    echo "域名: http://$DOMAIN"
    echo ""
    echo "如需配置 HTTPS，请运行："
    echo "  certbot --nginx -d $DOMAIN"
fi

echo ""
echo "登录账号: demo@qoder.team"
echo "登录密码: demo123"
echo ""
echo "管理命令："
echo "  查看日志:   docker compose -f $APP_DIR/docker-compose.prod.yml logs -f"
echo "  重启服务:   docker compose -f $APP_DIR/docker-compose.prod.yml restart"
echo "  停止服务:   docker compose -f $APP_DIR/docker-compose.prod.yml down"
echo "  数据库:     docker compose -f $APP_DIR/docker-compose.prod.yml exec db psql -U qoder -d qoder_team"
echo ""
