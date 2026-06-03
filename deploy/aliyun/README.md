# Qoder Team 阿里云轻量服务器部署指南

## 服务器选购建议

- **地域**：选择离你团队最近的地域（如华东1杭州、华北2北京）
- **配置**：2核 2GB 内存 + 50GB SSD（约 60-80 元/月，足够 10-20 人团队使用）
- **系统**：Ubuntu 22.04 LTS
- **带宽**：3-5Mbps（按量付费更省钱）

购买地址：[阿里云轻量应用服务器](https://www.aliyun.com/product/swas)

---

## 快速开始（推荐）

### 第一步：购买并配置服务器

1. 购买后进入阿里云控制台，找到你的轻量服务器
2. 在「防火墙」中开放以下端口：
   - 22（SSH，默认已开放）
   - 80（HTTP）
   - 443（HTTPS）
   - 3000（后端 API，可选，Nginx 代理后不需要）

3. 重置密码并记录 root 密码

### 第二步：连接服务器并一键部署

```bash
# 连接服务器（Mac/Linux 终端）
ssh root@你的服务器公网IP

# 上传代码（在本地执行）
scp -r qoder-team-server root@你的服务器公网IP:/opt/

# 或者直接用 git 克隆到服务器
git clone https://github.com/你的用户名/qoder-team.git /opt/qoder-team
cd /opt/qoder-team
```

### 第三步：运行安装脚本

```bash
cd /opt/qoder-team
chmod +x deploy/aliyun/install.sh
sudo ./deploy/aliyun/install.sh
```

脚本会自动完成：安装 Docker、构建镜像、启动服务、配置 Nginx、导入 seed 数据。

安装完成后，直接访问 `http://你的服务器IP` 即可使用。

---

## 手动部署（如果你想更灵活地控制每一步）

### 1. 安装 Docker

```bash
sudo apt update
sudo apt install -y curl git nginx
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
newgrp docker
```

### 2. 上传后端代码

```bash
# 在本地执行
scp -r qoder-team-server root@服务器IP:/opt/qoder-team
```

### 3. 配置环境变量

```bash
ssh root@服务器IP
cd /opt/qoder-team

cp .env.example .env
# 编辑 .env，修改以下关键配置：
# - JWT_SECRET：生成强随机字符串（openssl rand -base64 32）
# - FRONTEND_URL：你的服务器 IP 或域名
```

### 4. 启动服务

```bash
cd /opt/qoder-team
docker compose -f docker-compose.prod.yml up -d

# 等待 10 秒后执行数据库迁移
docker compose -f docker-compose.prod.yml exec app npx prisma migrate deploy

# 导入 seed 数据（可选）
docker compose -f docker-compose.prod.yml exec app npx tsx prisma/seed.ts
```

### 5. 配置 Nginx

```bash
# 复制配置文件
sudo cp deploy/aliyun/nginx.conf /etc/nginx/sites-available/qoder-team
sudo ln -sf /etc/nginx/sites-available/qoder-team /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### 6. 部署前端

```bash
# 在本地构建并上传
cd qoder-team
npm run build

# 确保 .env.production 中的 VITE_API_URL 指向你的服务器
# VITE_API_URL=http://你的服务器IP/api

# 上传到服务器
scp -r dist/* root@服务器IP:/var/www/qoder-team/
```

或者使用部署脚本：

```bash
cd deploy/aliyun
./deploy-frontend.sh 你的服务器IP root
```

---

## 配置域名和 HTTPS

### 1. 域名解析

在阿里云域名控制台，添加 A 记录指向你的服务器公网 IP。

### 2. 申请 SSL 证书（Let's Encrypt）

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com

# 自动续期已默认开启，可通过以下命令测试：
sudo certbot renew --dry-run
```

### 3. 更新环境变量

```bash
# 修改后端 CORS 允许域名
sudo sed -i 's|FRONTEND_URL=.*|FRONTEND_URL=https://your-domain.com|' /opt/qoder-team/.env
sudo docker compose -f /opt/qoder-team/docker-compose.prod.yml restart app

# 修改前端 API 地址（重新构建上传）
# VITE_API_URL=https://your-domain.com/api
```

---

## 数据迁移（从本地到线上）

### 方式一：重新 Seed（线上是全新数据库）

```bash
docker compose -f docker-compose.prod.yml exec app npx tsx prisma/seed.ts
```

### 方式二：导出本地数据导入线上

```bash
# 在本地导出
pg_dump -U qoder -d qoder_team > backup.sql

# 上传到服务器
scp backup.sql root@服务器IP:/opt/

# 在服务器导入
docker exec -i qoder-postgres psql -U qoder -d qoder_team < /opt/backup.sql
```

### 方式三：使用 Prisma 数据迁移

```bash
# 在服务器执行迁移
docker compose -f docker-compose.prod.yml exec app npx prisma migrate deploy
```

---

## 日常运维

### 查看服务状态

```bash
# 查看所有容器
docker ps

# 查看后端日志
docker compose -f /opt/qoder-team/docker-compose.prod.yml logs -f app

# 查看数据库日志
docker compose -f /opt/qoder-team/docker-compose.prod.yml logs -f db

# 重启服务
docker compose -f /opt/qoder-team/docker-compose.prod.yml restart

# 停止服务
docker compose -f /opt/qoder-team/docker-compose.prod.yml down
```

### 数据库备份

已提供自动备份脚本：

```bash
sudo cp /opt/qoder-team/deploy/aliyun/backup.sh /opt/qoder-team/backup.sh
sudo chmod +x /opt/qoder-team/backup.sh

# 手动执行备份
sudo /opt/qoder-team/backup.sh

# 添加定时任务（每天凌晨2点自动备份）
sudo crontab -e
# 添加一行：
# 0 2 * * * /opt/qoder-team/backup.sh >> /var/log/qoder-backup.log 2>&1
```

备份文件保存在 `/opt/backups/qoder-team/`。

### 更新代码

```bash
# 1. 拉取最新代码
cd /opt/qoder-team
git pull

# 2. 重建并重启后端
docker compose -f docker-compose.prod.yml up -d --build

# 3. 执行数据库迁移（如有 schema 变更）
docker compose -f docker-compose.prod.yml exec app npx prisma migrate deploy

# 4. 重新构建并上传前端（在本地执行）
cd deploy/aliyun
./deploy-frontend.sh 服务器IP root
```

---

## 常见问题

### 1. 服务器防火墙问题

如果无法访问，检查阿里云轻量服务器的防火墙设置：
- 进入阿里云控制台 → 轻量应用服务器 → 你的服务器 → 防火墙
- 确保 80、443 端口已开放

### 2. Docker 容器无法启动

```bash
# 查看错误日志
docker compose -f /opt/qoder-team/docker-compose.prod.yml logs app

# 常见问题：端口被占用
sudo lsof -ti:3000 | xargs kill -9
sudo systemctl restart docker
```

### 3. Nginx 502 错误

后端服务未启动或端口配置错误：
```bash
# 检查后端是否运行
curl http://localhost:3000/health

# 重启后端
docker compose -f /opt/qoder-team/docker-compose.prod.yml restart app
```

### 4. 数据库连接失败

检查 `.env` 中的 `DATABASE_URL`：
```bash
# 在 Docker 网络中，数据库主机名是 "db" 而不是 localhost
DATABASE_URL="postgresql://qoder:qoder@db:5432/qoder_team?schema=public"
```

### 5. 前端 API 请求失败（CORS）

确保后端的 `FRONTEND_URL` 与前端实际访问地址一致：
```bash
# 修改 .env 后重启
sudo sed -i 's|FRONTEND_URL=.*|FRONTEND_URL=https://your-domain.com|' /opt/qoder-team/.env
docker compose -f /opt/qoder-team/docker-compose.prod.yml restart app
```

---

## 费用预估

| 项目 | 配置 | 月费用 |
|------|------|--------|
| 轻量应用服务器 | 2核2G + 50GB SSD + 3Mbps | ~60-80 元 |
| 域名（可选） | .com / .cn | ~30-60 元/年 |
| SSL 证书 | Let's Encrypt | 免费 |
| **总计** | | **约 60-80 元/月** |

如需更高配置（5-10人团队）：
- 4核 8GB + 100GB SSD + 5Mbps：约 200-300 元/月
