# Qoder Team 线上部署指南

## 方案一：Railway（推荐，最简单）

Railway 提供免费 PostgreSQL + 自动部署，适合快速上线。

### 1. 准备工作

- 注册 [Railway](https://railway.app/) 账号（可用 GitHub 登录）
- 将代码推送到 GitHub 仓库

### 2. 部署后端

1. 在 Railway Dashboard 点击 "New Project" → "Deploy from GitHub repo"
2. 选择你的 `qoder-team-server` 仓库
3. Railway 会自动识别 `railway.json` 和 `Dockerfile`
4. 添加环境变量：
   - `DATABASE_URL`：Railway 会自动创建一个 PostgreSQL 数据库，从数据库服务复制连接字符串
   - `JWT_SECRET`：生成一个强随机字符串（如 `openssl rand -base64 32`）
   - `FRONTEND_URL`：先填 `*`，部署完前端后再修改为真实前端域名
5. 部署完成后，记录后端域名（如 `https://qoder-team-api.up.railway.app`）

### 3. 数据库迁移

Railway 会自动执行 `npx prisma migrate deploy`（已配置在 `railway.json` 中）。

如需手动执行 seed：
```bash
railway login
railway link
railway run npx tsx prisma/seed.ts
```

### 4. 部署前端

1. 注册 [Vercel](https://vercel.com/) 账号
2. 导入前端仓库 `qoder-team`
3. 修改环境变量 `VITE_API_URL` 为你的 Railway 后端域名
4. 部署完成后，将 Vercel 域名填回 Railway 后端的 `FRONTEND_URL`

---

## 方案二：Render

Render 也提供免费 PostgreSQL，配置更直观。

### 1. 部署后端

1. 注册 [Render](https://render.com/) 账号
2. 点击 "New Web Service" → 连接 GitHub 仓库
3. Render 会自动识别 `render.yaml`
4. 环境变量会自动配置，只需确认 `FRONTEND_URL`
5. 部署完成后记录域名

### 2. 部署前端

同方案一的 Vercel 部署步骤。

---

## 方案三：自有云服务器（阿里云/腾讯云/AWS）

适合需要完全控制权的场景。

### 1. 服务器要求

- 1核 2GB 内存以上
- Ubuntu 22.04 LTS
- 开放端口：22(SSH)、3000(API)、80/443(HTTP/HTTPS)

### 2. 安装 Docker

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker
```

### 3. 上传代码并启动

```bash
# 克隆代码
git clone <your-repo>
cd qoder-team-server

# 配置环境变量
cp .env.example .env
# 编辑 .env，修改 DATABASE_URL、JWT_SECRET、FRONTEND_URL

# 启动服务
docker compose -f docker-compose.prod.yml up -d

# 执行数据库迁移
docker compose -f docker-compose.prod.yml exec app npx prisma migrate deploy

# 执行数据 seed
docker compose -f docker-compose.prod.yml exec app npx tsx prisma/seed.ts
```

### 4. 配置 Nginx（可选，用于 HTTPS）

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

使用 Let's Encrypt 配置 HTTPS：
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## 环境变量说明

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `DATABASE_URL` | PostgreSQL 连接字符串 | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | JWT 签名密钥 | 32位以上随机字符串 |
| `FRONTEND_URL` | 前端域名（CORS） | `https://qoder-team.vercel.app` |
| `PORT` | 后端端口 | `3000` |
| `REDIS_URL` | Redis 连接（可选） | `redis://localhost:6379` |

---

## 数据迁移（从本地到线上）

### 方法 1：重新 Seed

如果线上是全新数据库，直接执行 seed：
```bash
npx prisma db seed
```

### 方法 2：导出导入

如果本地已有真实数据，使用 pg_dump 迁移：

```bash
# 导出本地数据
pg_dump -U qoder -d qoder_team > backup.sql

# 导入到线上数据库
psql -U <online_user> -d <online_db> -h <online_host> < backup.sql
```

### 方法 3：Prisma 数据迁移脚本

在项目根目录创建迁移脚本：

```bash
cd qoder-team-server
npx prisma migrate deploy
```

---

## 常见问题

### 1. CORS 错误

确保 `FRONTEND_URL` 与前端实际域名完全一致，包括 `https://` 前缀。

### 2. 数据库连接失败

检查 `DATABASE_URL` 格式：
```
postgresql://username:password@host:port/database?schema=public
```

### 3. JWT 验证失败

生产环境必须更换 `JWT_SECRET`，不能使用默认的开发密钥。

### 4. Socket.IO 连接失败

确保前端 `VITE_API_URL` 指向正确的后端域名，且后端已正确配置 CORS。

---

## 部署检查清单

- [ ] 后端域名可访问（`https://your-api.com/health` 返回 `ok`）
- [ ] 数据库迁移已执行
- [ ] Seed 数据已导入（或有真实数据）
- [ ] `JWT_SECRET` 已更换为生产环境密钥
- [ ] `FRONTEND_URL` 已配置为真实前端域名
- [ ] 前端 `VITE_API_URL` 已配置为真实后端域名
- [ ] 登录功能正常
- [ ] 各模块数据加载正常（项目、待办、知识库、Agent 配置等）
