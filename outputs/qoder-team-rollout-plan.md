# Qoder Team —— 从 Demo 到 MVP 的分阶段上线计划

## 当前状态诊断

你的 Demo 是一个**纯前端 React 项目**，所有数据写死在 `src/data/` 和 `src/views/` 里，部署在 GitHub Pages 上。要让一个真实团队注册进来、收发消息、建立文档，需要**接入后端服务、数据库和实时通信**。

下面的路线图把「从 Demo 到能用」拆成 5 个阶段，每阶段都有明确的交付物和可验收的标准。

---

## 阶段一：后端骨架 + 数据库（2 周）

**目标**：搭好后端服务，让前端能真正读写数据。

### 技术选型

| 层 | 选型 | 理由 |
|---|---|---|
| 后端框架 | **Node.js + Express** 或 **NestJS** | 团队熟悉 JS/TS，NestJS 有天然模块化结构 |
| 数据库 | **PostgreSQL** + **Prisma ORM** | PG 支持 JSONB，适合存 Agent 配置、聊天记录等半结构化数据；Prisma 的 migrations 和类型推导能省大量时间 |
| 实时通信 | **Socket.IO** | 比纯 WebSocket 更稳定，自动降级、房间管理开箱即用 |
| 文件存储 | 初期用本地磁盘 + 后期接入 **S3/MinIO** | MVP 阶段先本地存储 |
| 认证 | **Clerk** 或自建 JWT | Clerk 省时间，自建更可控 |

### 数据模型（Prisma Schema 核心部分）

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String
  avatar    String?
  role      String   // admin, member, guest
  createdAt DateTime @default(now())
  teams     TeamMember[]
  messages  ChatMessage[]
  docs      Document[]
  agents    Agent[]
}

model Team {
  id        String   @id @default(uuid())
  name      String
  slug      String   @unique // 用于 URL: /t/:slug
  createdAt DateTime @default(now())
  members   TeamMember[]
  channels  Channel[]
  docs      Document[]
}

model TeamMember {
  id     String @id @default(uuid())
  userId String
  teamId String
  role   String // owner, admin, member
  user   User   @relation(fields: [userId], references: [id])
  team   Team   @relation(fields: [teamId], references: [id])
}

model Channel {
  id        String   @id @default(uuid())
  teamId    String
  name      String
  type      String   // group, direct, myagent
  members   String[] // userId[]
  messages  ChatMessage[]
  team      Team     @relation(fields: [teamId], references: [id])
}

model ChatMessage {
  id        String   @id @default(uuid())
  channelId String
  senderId  String
  senderType String // human, agent
  content   String
  createdAt DateTime @default(now())
  channel   Channel  @relation(fields: [channelId], references: [id])
  sender    User     @relation(fields: [senderId], references: [id])
  // 保留你 Demo 中的扩展字段
  kbRefs    String[]
  artifact  Json?
}

model Document {
  id        String   @id @default(uuid())
  teamId    String
  authorId  String
  title     String
  content   String   // Markdown / JSON
  source    String   // human, agent, collab
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  team      Team     @relation(fields: [teamId], references: [id])
  author    User     @relation(fields: [authorId], references: [id])
}
```

### 交付标准
- [ ] 本地 `docker compose up` 能一键启动 PG + 后端
- [ ] API 文档可用（Swagger/OpenAPI）
- [ ] 前端 `fetch('/api/...')` 能获取真实数据

---

## 阶段二：团队注册 + 成员管理（1 周）

**目标**：任何人能注册账号、创建/加入团队。

### 实现清单

1. **注册 / 登录页**
   - 邮箱 + 密码注册（或接入 Clerk 一键 OAuth）
   - JWT token 存入 `localStorage`，Axios interceptor 自动带 `Authorization: Bearer`

2. **团队创建流程**
   ```
   注册成功 → 引导创建团队 → 设置团队名称 → 进入工作台
   ```

3. **邀请链接**
   - 生成 `/join/:teamId/:inviteCode`
   - 被邀请人打开链接 → 登录/注册 → 自动加入团队

4. **前端改造**
   - 目前 `App.tsx` 里 `@qoder-team` 是写死的 → 改为从 `/api/teams/current` 读取
   - `MEMBERS` 数组 → 改为 `/api/teams/:id/members`
   - `PROJECTS` 数组 → 改为 `/api/teams/:id/projects`

### 交付标准
- [ ] 新用户注册后能看到「创建团队」入口
- [ ] 生成邀请链接，另一个人通过链接能加入团队
- [ ] 团队切换器下拉拉取的是真实团队列表

---

## 阶段三：实时消息（1.5 周）

**目标**：团队内能群聊、私聊，消息实时送达。

### Socket 事件设计

```ts
// 客户端 → 服务端
socket.emit('message:send', {
  channelId: 'group-001',
  content: 'PRD 已更新',
  kbRefs: ['doc-123'],
})

socket.emit('channel:join', { channelId: 'group-001' })

// 服务端 → 客户端
socket.on('message:new', (msg: ChatMessage) => {
  // 前端接到新消息，append 到对应 channel
})

socket.on('presence:update', (users: OnlineUser[]) => {
  // 更新右侧在线成员列表
})
```

### 前端改造

- `AgentChat.tsx` 中 `DIRECT_MESSAGES` → 用 `useEffect` + `socket.on('message:new')` 动态拉取
- `buildConversations()` → `GET /api/channels` 从后端拉取
- 发送消息 → `socket.emit('message:send', ...)`
- 新增 `useSocket()` Hook 统一管理连接状态

### 交付标准
- [ ] 打开两个浏览器窗口，A 发送消息 B 秒级收到
- [ ] 群聊 / 私聊 / Agent 对话三种类型都可用
- [ ] 未读消息 badge 实时更新

---

## 阶段四：知识库文档（1 周）

**目标**：团队能创建、编辑、查看文档。

### 接口设计

```
GET    /api/docs?teamId=xxx&source=human
POST   /api/docs                 { title, content, source }
GET    /api/docs/:id
PATCH  /api/docs/:id             { title?, content? }
DELETE /api/docs/:id
```

### 前端改造

- `KnowledgeBase.tsx` 中 `KB_DOCS` → `useEffect(() => fetch('/api/docs'), [])`
- 新建文档按钮 → 打开编辑器 → `POST /api/docs`
- 文档编辑器：MVP 阶段用 textarea 存 Markdown 即可，后续再接入富文本
- Agent 修改建议：保留现有 UI，但改为调用后端 API（后续接入 LLM）

### 交付标准
- [ ] 能创建、编辑、删除文档
- [ ] 文档列表按 source（human / agent / collab）筛选
- [ ] 文档内容支持 Markdown 渲染

---

## 阶段五：Agent 接入（1 周）

**目标**：让 Demo 里的 Agent 真正动起来（至少能回复消息）。

### 最小实现

1. **Agent 回复触发**
   - 用户发消息后，后端检测是否 @Agent → 调用 LLM API
   - MVP 阶段先接 OpenAI API（gpt-4o-mini 便宜够用）

2. **Agent 配置持久化**
   - `ConfigView.tsx` 中的 `systemPrompt`、`skills`、`memory`、`faq`
   - → `POST /api/agents/:id/config`
   - 读取时 `GET /api/agents/:id/config`

3. **FAQ → Memory 同步**
   - 现有 `syncFaqToMemory` 是前端函数
   - → 改为调用 `POST /api/agents/:id/sync-faq`

### 交付标准
- [ ] @Agent 提问后 5 秒内收到回复
- [ ] Agent 配置修改后刷新页面仍保留
- [ ] FAQ 同步到 Memory 后 Agent 回复能引用

---

## 技术栈汇总与部署建议

### 本地开发

```yaml
# docker-compose.yml
version: '3.8'
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: qoder
      POSTGRES_PASSWORD: qoder
      POSTGRES_DB: qoder_team
    ports:
      - "5432:5432"
  
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
```

### 部署架构（MVP 阶段）

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Vercel    │────▶│  Railway /  │────▶│  PostgreSQL │
│  (Frontend) │     │   Render    │     │   + Redis   │
└─────────────┘     │  (Backend)  │     └─────────────┘
                    └─────────────┘
```

- **前端**：继续 Vercel / GitHub Pages（免费的 CDN 全球加速）
- **后端**：Railway 或 Render（每月 $5~20，自动部署、SSL、DB 一键配）
- **数据库**：Railway 内置 PostgreSQL，或 AWS RDS Free Tier

---

## 时间线与优先级

| 阶段 | 功能 | 周期 | 优先级 |
|---|---|---|---|
| 阶段一 | 后端骨架 + 数据库 | 2 周 | P0 |
| 阶段二 | 团队注册 + 成员管理 | 1 周 | P0 |
| 阶段三 | 实时消息 | 1.5 周 | P0 |
| 阶段四 | 知识库文档 | 1 周 | P1 |
| 阶段五 | Agent 接入 | 1 周 | P1 |

**合计约 6.5 周，保守按 8 周排期。**

---

## 下一步行动建议

1. **本周先搭后端骨架**：新建 `qoder-team-server/` 目录，用 NestJS + Prisma + PostgreSQL 跑通 `/api/health` 和 `/api/docs`
2. **保持前端 Demo 可用**：后端接口就绪前，先用 `if (process.env.NODE_ENV === 'development')` fallback 到 mock 数据
3. **先跑通一个链路**：注册 → 创建团队 → 发送消息 → 收到消息，这条链路跑通后再扩展其他功能

如果你需要，我可以直接帮你生成阶段一的完整代码骨架（NestJS + Prisma + Socket.IO），包括 `docker-compose.yml` 和前端 API 封装层。
