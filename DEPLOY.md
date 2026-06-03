# Qoder Team 线上部署指南

本文档介绍如何将 Qoder Team 部署到线上。推荐方案：**Railway（后端）+ Vercel（前端）**，完全免费，5 分钟上线。

项目结构（Monorepo）：

```
qoder-team/           # React + Vite 前端
qoder-team-server/    # NestJS + Prisma 后端
deploy/               # 部署脚本
```

---

## 方案一：Railway + Vercel（推荐）

### 准备工作

1. 注册 [GitHub](https://github.com/) 账号（如已有请跳过）
2. 注册 [Railway](https://railway.app/) 账号（建议用 GitHub 登录）
3. 注册 [Vercel](https://vercel.com/) 账号（建议用 GitHub 登录）

### 第一步：推送代码到 GitHub

在本地项目根目录执行：

```bash
# 配置 Git 用户信息（如未配置）
git config user.name "你的用户名"
git config user.email "你的邮箱"

# 在 GitHub 新建一个仓库（例如 qoder-team），不要初始化 README

# 关联远程仓库并推送
git remote add origin https://github.com/你的用户名/qoder-team.git
git branch -M main
git push -u origin main
```

推送成功后，GitHub 仓库应包含 `qoder-team/` 和 `qoder-team-server/` 两个目录。

### 第二步：部署后端到 Railway

1. 登录 [Railway Dashboard](https://railway.app/dashboard)
2. 点击 **"New"** → **"Project"** → **"Deploy from GitHub repo"**
3. 选择你刚创建的 `qoder-team` 仓库
4. **关键设置**：在部署配置中找到 **"Root Directory"**，填写 `qoder-team-server`
   - 这样 Railway 会进入后端目录进行构建和部署
5. Railway 会自动识别 `railway.toml` 配置
6. 添加 **PostgreSQL 数据库**：
   - 在项目页面点击 **"New"** → **"Database"** → **"Add PostgreSQL"**
   - Railway 会自动创建一个数据库实例
7. 配置环境变量（Project Settings → Variables）：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `DATABASE_URL` | 自动生成 | 添加 PostgreSQL 后，Railway 会自动注入此变量，无需手动填写 |
| `JWT_SECRET` | 随机字符串 | 执行 `openssl rand -base64 32` 生成，用于 JWT 签名 |
| `FRONTEND_URL` | `*` | 先填通配符 `*`，部署完前端后再修改为真实前端域名 |

8. 点击 **"Deploy"**，等待构建完成
9. 部署成功后，记录后端域名（例如 `https://qoder-team-api.up.railway.app`）
   - 可在 Service Settings → Domains 中查看或自定义域名

**Railway 自动执行的操作**：

- `npm install` 安装依赖
- `npm run build` 构建 NestJS 项目（包含 `prisma generate`）
- `npm run start:railway` 启动服务（自动执行数据库迁移 + 数据 Seed）
- 健康检查通过 `/health` 端点

### 第三步：部署前端到 Vercel

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 **"Add New..."** → **"Project"**
3. 导入你的 `qoder-team` GitHub 仓库
4. **关键设置**：
   - **Framework Preset**：选择 `Vite`
   - **Root Directory**：填写 `qoder-team`
   - **Build Command**：`npm run build`
   - **Output Directory**：`dist`
5. 添加环境变量（Settings → Environment Variables）：

| 变量名 | 值 |
|--------|-----|
| `VITE_API_URL` | 你的 Railway 后端域名，例如 `https://qoder-team-api.up.railway.app` |

6. 点击 **"Deploy"**
7. 部署成功后，记录前端域名（例如 `https://qoder-team.vercel.app`）

### 第四步：配置跨域（CORS）

前端部署完成后，需要将 Railway 后端的 `FRONTEND_URL` 修改为真实的前端域名：

1. 回到 [Railway Dashboard](https://railway.app/dashboard)
2. 进入你的后端项目 → Settings → Variables
3. 将 `FRONTEND_URL` 从 `*` 修改为 Vercel 前端域名，例如：
   ```
   https://qoder-team.vercel.app
   ```
   - 如需支持多个域名，可用英文逗号分隔，例如：
     ```
     https://qoder-team.vercel.app,https://qoder-team-git-main-你的用户名.vercel.app
     ```
4. Railway 会自动重新部署

### 第五步：验证部署

打开 Vercel 前端地址，检查以下功能：

- [ ] 页面正常加载，登录页显示
- [ ] 使用默认账号 `admin@qoder.team` / `admin123` 可登录
- [ ] 登录后各模块数据正常加载（项目、待办、知识库、Agent 配置等）
- [ ] 访问 `https://你的后端域名/health` 返回 `{"status":"ok"}`

---

## 方案二：Render（备选）

Render 同样提供免费 PostgreSQL，操作逻辑与 Railway 类似。

1. 注册 [Render](https://render.com/) 账号
2. 创建 **Blueprint** → 连接 GitHub 仓库 → Render 自动读取 `render.yaml`
3. 环境变量按 Railway 方案配置即可
4. 前端同样使用 Vercel 部署

---

## 方案三：自有云服务器

如需完全控制权，可参考 `deploy/aliyun/` 目录下的一键部署脚本。

---

## 环境变量完整说明

### 后端（Railway）

| 变量名 | 必填 | 说明 | 示例 |
|--------|------|------|------|
| `DATABASE_URL` | 是 | PostgreSQL 连接字符串 | Railway 自动生成 |
| `JWT_SECRET` | 是 | JWT 签名密钥 | `openssl rand -base64 32` |
| `FRONTEND_URL` | 是 | 前端域名（CORS） | `https://qoder-team.vercel.app` |
| `PORT` | 否 | 服务端口 | `3000`（Railway 自动覆盖） |

### 前端（Vercel）

| 变量名 | 必填 | 说明 | 示例 |
|--------|------|------|------|
| `VITE_API_URL` | 是 | 后端 API 域名 | `https://qoder-team-api.up.railway.app` |

---

## 数据库管理

### 重新 Seed 数据

如需重置线上数据库为演示数据：

```bash
# 安装 Railway CLI
npm install -g @railway/cli

# 登录并关联项目
railway login
railway link

# 进入后端目录执行 seed
railway run --service "你的后端服务名" -- npm run db:seed
```

或在 Railway Dashboard 中打开服务的 **Shell**，执行：

```bash
cd qoder-team-server && npx tsx prisma/seed.ts
```

### 查看数据库

Railway 提供内置的数据库管理界面：

1. 进入 Railway 项目
2. 点击 PostgreSQL 服务
3. 选择 **"Data"** 标签页即可查看和编辑数据

---

## 常见问题

### CORS 错误

浏览器控制台出现 `CORS policy` 错误：

- 检查 Railway 的 `FRONTEND_URL` 是否与 Vercel 实际域名完全一致
- 确认包含 `https://` 前缀
- 修改后 Railway 会自动重部署，等待 1-2 分钟再试

### 数据库连接失败

- 检查 `DATABASE_URL` 格式：`postgresql://username:password@host:port/database?schema=public`
- Railway 的 PostgreSQL 变量会自动生成，通常无需手动修改

### 前端页面空白或 404

- 检查 Vercel 的 **Root Directory** 是否设为 `qoder-team`
- 检查 **Framework Preset** 是否选为 `Vite`

### Socket.IO（实时聊天）连接失败

- 确认前端 `VITE_API_URL` 指向正确的后端域名
- 确认后端 `FRONTEND_URL` 包含前端域名
- Railway 和 Vercel 都支持 WebSocket，无需额外配置

---

## 部署检查清单

- [ ] 代码已推送到 GitHub
- [ ] Railway 后端部署成功，`/health` 返回 `{"status":"ok"}`
- [ ] PostgreSQL 数据库已自动创建并连接
- [ ] 数据库迁移和 Seed 已自动执行
- [ ] `JWT_SECRET` 已设置为随机字符串
- [ ] Vercel 前端部署成功，页面可访问
- [ ] 前端 `VITE_API_URL` 已配置为 Railway 后端域名
- [ ] Railway `FRONTEND_URL` 已配置为 Vercel 前端域名
- [ ] 登录功能正常（`admin@qoder.team` / `admin123`）
- [ ] 各模块数据加载正常
