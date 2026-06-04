import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hash = await bcrypt.hash('demo123', 10)

  // ==========================================
  // 1. 创建核心用户（6人产品团队）
  // ==========================================
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'demo@qoder.team' },
      update: {},
      create: { email: 'demo@qoder.team', name: '雪辰', password: hash, role: 'admin', avatar: '❄️' },
    }),
    prisma.user.upsert({
      where: { email: 'wangchen@qoder.team' },
      update: {},
      create: { email: 'wangchen@qoder.team', name: '王辰', password: hash, role: 'member', avatar: '👑' },
    }),
    prisma.user.upsert({
      where: { email: 'jianchuan@qoder.team' },
      update: {},
      create: { email: 'jianchuan@qoder.team', name: '鉴川', password: hash, role: 'member', avatar: '🔍' },
    }),
    prisma.user.upsert({
      where: { email: 'guangling@qoder.team' },
      update: {},
      create: { email: 'guangling@qoder.team', name: '广苓', password: hash, role: 'member', avatar: '📊' },
    }),
    prisma.user.upsert({
      where: { email: 'xubai@qoder.team' },
      update: {},
      create: { email: 'xubai@qoder.team', name: '叙白', password: hash, role: 'member', avatar: '🎨' },
    }),
    prisma.user.upsert({
      where: { email: 'mengyu@qoder.team' },
      update: {},
      create: { email: 'mengyu@qoder.team', name: '孟雨', password: hash, role: 'member', avatar: '🌧️' },
    }),
  ])

  const [xuechen, wangchen, jianchuan, guangling, xubai, mengyu] = users

  // ==========================================
  // 2. 创建团队 + 成员关系
  // ==========================================
  const team = await prisma.team.upsert({
    where: { slug: 'qoder-demo' },
    update: {},
    create: {
      name: 'Qoder 产品团队',
      slug: 'qoder-demo',
      members: {
        create: [
          { userId: xuechen.id, role: 'owner' },
          { userId: wangchen.id, role: 'admin' },
          { userId: jianchuan.id, role: 'admin' },
          { userId: guangling.id, role: 'member' },
          { userId: xubai.id, role: 'member' },
          { userId: mengyu.id, role: 'member' },
        ],
      },
      channels: {
        create: [
          { name: '全员群聊', type: 'group', members: users.map(u => u.id) },
          { name: 'AI Agent 协作', type: 'myagent', members: [xuechen.id] },
          { name: '前端技术交流', type: 'group', members: [wangchen.id, xubai.id, xuechen.id] },
          { name: '后端架构讨论', type: 'group', members: [jianchuan.id, guangling.id, xuechen.id] },
        ],
      },
    },
    include: { channels: true },
  })

  const [groupChannel, agentChannel, feChannel, beChannel] = team.channels

  // ==========================================
  // 3. 创建待加入用户的邀请（展示"加入团队"流程）
  // ==========================================
  await prisma.teamInvitation.create({
    data: {
      teamId: team.id,
      inviterId: xuechen.id,
      email: 'newuser@example.com',
      code: 'WELCOME2026',
      status: 'pending',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  })

  // ==========================================
  // 4. 创建群聊历史（展示协作场景）
  // ==========================================
  await prisma.chatMessage.createMany({
    data: [
      // --- 全员群聊 ---
      { channelId: groupChannel.id, senderId: xuechen.id, senderType: 'human', content: '大家早！今天是 v2.3 冲刺的第 3 天，先同步一下各端进展 📋' },
      { channelId: groupChannel.id, senderId: wangchen.id, senderType: 'human', content: '前端这边 RecommendCard 组件初版已经出来了，虚拟列表也接上了，今天联调接口 🎨' },
      { channelId: groupChannel.id, senderId: jianchuan.id, senderType: 'human', content: '后端 recommend-api 的 YAML 定稿了，Redis 缓存层代码已提交，P99 从 350ms 降到 52ms ⚙️' },
      { channelId: groupChannel.id, senderId: guangling.id, senderType: 'human', content: '模型 v2.1 的 INT8 量化验证通过了，准确率只掉了 0.3%，可以接受 🧠' },
      { channelId: groupChannel.id, senderId: xubai.id, senderType: 'human', content: '设计稿更新了，推荐卡片加了骨架屏和空状态，已同步 Figma 🎯' },
      { channelId: groupChannel.id, senderId: xuechen.id, senderType: 'human', content: '太好了，进度比预期快！雪辰（我）整理一下待确认事项：\n1. 缓存 TTL 10min 是否 OK？\n2. 推荐理由格式用 HTML 还是 Markdown？\n3. 灰度比例定多少？' },
      { channelId: groupChannel.id, senderId: xuechen.id, senderType: 'agent', content: '📋 产品 Agent 已为您生成今日待办：\n• 确认缓存策略（鉴川 Agent 提交）\n• 审阅推荐卡片交互（王辰 Agent 提交）\n• 确认灰度方案（广苓 Agent 提交）\n• 更新 PRD 验收标准' },
      { channelId: groupChannel.id, senderId: jianchuan.id, senderType: 'agent', content: '⚙️ 后端 Agent 报告：recommend-api.yaml 已生成，包含批量推荐、实时推荐、缓存刷新三个端点。SDK 自动生成中，预计 2 小时完成。' },
      { channelId: groupChannel.id, senderId: wangchen.id, senderType: 'agent', content: '🎨 前端 Agent 报告：RecommendCard.tsx 组件已生成，支持虚拟列表 + 懒加载 + 骨架屏。正在优化渲染性能，当前 FPS 稳定在 55+。' },
      { channelId: groupChannel.id, senderId: guangling.id, senderType: 'agent', content: '🧠 算法 Agent 报告：model-v2.1.tar.gz 已打包，推理耗时 P99=118ms（INT8 量化后）。A/B 实验方案已撰写，建议灰度 10% 流量验证 CTR 提升。' },
      { channelId: groupChannel.id, senderId: xuechen.id, senderType: 'human', content: '各 Agent 产出质量都很高，感谢大家的配合！中午前把待确认项清掉，下午进入联调阶段 💪' },

      // --- 前端频道 ---
      { channelId: feChannel.id, senderId: wangchen.id, senderType: 'human', content: '叙白，推荐卡片的封面图比例定了吗？我在组件里先按 16:9 写的' },
      { channelId: feChannel.id, senderId: xubai.id, senderType: 'human', content: '定了，统一用 3:2，横屏场景更多。Figma 已更新，你拉一下最新版' },
      { channelId: feChannel.id, senderId: wangchen.id, senderType: 'agent', content: '🎨 前端 Agent：已根据最新 Figma 更新 RecommendCard 尺寸，3:2 比例适配完成。' },

      // --- 后端频道 ---
      { channelId: beChannel.id, senderId: jianchuan.id, senderType: 'human', content: '广苓，模型输出的推荐理由字段名叫什么？我接口里暂时用的 reason_text' },
      { channelId: beChannel.id, senderId: guangling.id, senderType: 'human', content: '叫 recommendation_reason，我同步一下模型端' },
      { channelId: beChannel.id, senderId: jianchuan.id, senderType: 'agent', content: '⚙️ 后端 Agent：接口字段已统一为 recommendation_reason，前后端契约更新完成。' },

      // --- AI Agent 私聊 ---
      { channelId: agentChannel.id, senderId: xuechen.id, senderType: 'human', content: '帮我整理一下今天所有 Agent 的产出，生成一份项目进展摘要' },
      { channelId: agentChannel.id, senderId: xuechen.id, senderType: 'agent', content: '📋 今日 Agent 产出摘要：\n\n1. 产品 Agent：更新 PRD v2.3，新增缓存策略和灰度方案章节\n2. 前端 Agent：完成 RecommendCard.tsx + useLazyImage Hook\n3. 后端 Agent：完成 recommend-api.yaml + Redis 缓存层 + SDK 生成中\n4. 算法 Agent：完成 model-v2.1 打包 + INT8 量化 + A/B 方案\n5. 设计 Agent：更新视觉规范 + 推荐卡片尺寸标注\n6. 测试 Agent：接口测试用例 85% 覆盖\n\n整体进度：62%，风险：视觉规范待最终确认' },
    ],
  })

  // ==========================================
  // 5. 创建知识库文档（丰富且真实）
  // ==========================================
  await prisma.document.createMany({
    data: [
      { teamId: team.id, authorId: jianchuan.id, title: '推荐系统 API 接口规范 v2.3', content: '## 端点列表\n- POST /recommend/batch 批量推荐（支持 1-50 条）\n- POST /recommend/realtime 实时推荐（< 100ms）\n- POST /recommend/refresh 缓存刷新\n\n## 关键字段\n- recommendation_reason: 推荐理由（HTML 格式）\n- confidence_score: 置信度 0-1\n- item_type: 内容类型（video/article/live）\n\n## 性能指标\n- P99 < 120ms（含缓存）\n- 缓存命中率 > 85%', source: 'agent', tags: ['api', 'agent', 'backend'] },
      { teamId: team.id, authorId: wangchen.id, title: 'RecommendCard.tsx 组件设计文档', content: '## 功能\n- 虚拟列表渲染（ react-window ）\n- 图片懒加载（ Intersection Observer ）\n- 骨架屏 + 空状态\n- 封面比例 3:2\n\n## Props\n- items: RecommendItem[]\n- onLoadMore: () => void\n- emptyText?: string\n\n## 性能\n- 首屏渲染 < 16ms\n- 滚动 FPS > 55', source: 'agent', tags: ['component', 'agent', 'frontend'] },
      { teamId: team.id, authorId: guangling.id, title: '模型 v2.1 推理性能评估报告', content: '## 测试环境\n- GPU: NVIDIA T4\n- Batch Size: 1 / 8 / 20\n\n## 结果\n| 批次 | FP32 | INT8 | 加速比 |\n|------|------|------|--------|\n| 1 | 180ms | 118ms | 1.53x |\n| 8 | 420ms | 290ms | 1.45x |\n| 20 | 850ms | 580ms | 1.47x |\n\n## 结论\nINT8 量化可行，准确率损失 0.3%，建议上线。', source: 'agent', tags: ['model', 'agent', 'ml'] },
      { teamId: team.id, authorId: xuechen.id, title: 'PRD v2.3 — 推荐系统重构', content: '## 背景\n当前推荐系统 CTR 2.1%，目标 3.5%+\n\n## 核心改动\n1. 模型升级：v1.5 → v2.1（DeepFM + Transformer）\n2. 前端重构：统一推荐卡片组件\n3. 缓存策略：Redis 多级缓存，TTL 10min\n4. 灰度方案：10% → 50% → 100%\n\n## 验收标准\n- P99 < 120ms\n- CTR 提升 > 2%\n- 缓存命中率 > 85%', source: 'collab', tags: ['prd', 'collab', 'product'] },
      { teamId: team.id, authorId: xuechen.id, title: 'Prompt 工程最佳实践', content: '## 原则\n1. 角色明确：给 Agent 设定具体身份和职责边界\n2. 上下文充足：提供相关文档和代码片段\n3. 输出规范：指定格式（JSON/Markdown/HTML）\n\n## 示例\n"你是一名资深前端工程师，请根据以下 Figma 设计稿生成 React 组件代码。要求：使用 TypeScript，支持虚拟列表，添加 JSDoc 注释。"', source: 'human', tags: ['practice', 'ai'] },
      { teamId: team.id, authorId: jianchuan.id, title: 'Redis 缓存策略设计', content: '## 架构\n- L1: 本地 Caffeine（JVM 内，TTL 1min）\n- L2: Redis 集群（TTL 10min）\n- L3: DB（兜底）\n\n## 降级策略\n- Redis 故障时自动穿透到 DB\n- 限流保护：单接口 QPS < 5000\n- 熔断：错误率 > 50% 时开启', source: 'agent', tags: ['cache', 'backend', 'agent'] },
      { teamId: team.id, authorId: wangchen.id, title: 'useLazyImage Hook 实现', content: '```tsx\nexport function useLazyImage(src: string) {\n  const [loaded, setLoaded] = useState(false);\n  const ref = useRef<HTMLImageElement>(null);\n  \n  useEffect(() => {\n    const observer = new IntersectionObserver(([entry]) => {\n      if (entry.isIntersecting) {\n        setLoaded(true);\n        observer.disconnect();\n      }\n    });\n    if (ref.current) observer.observe(ref.current);\n    return () => observer.disconnect();\n  }, []);\n  \n  return { ref, src: loaded ? src : placeholder };\n}\n```', source: 'agent', tags: ['hook', 'frontend', 'agent'] },
      { teamId: team.id, authorId: xubai.id, title: '推荐卡片视觉规范 v2', content: '## 尺寸\n- 封面：宽 300px，高 200px（3:2）\n- 标题：16px / 500 weight / 单行截断\n- 推荐理由：14px / 400 weight / 两行截断\n- 标签：12px / 圆角 4px\n\n## 颜色\n- 背景：#1a1a2e\n- 卡片背景：rgba(255,255,255,0.03)\n- 边框：rgba(255,255,255,0.06)\n- 主文字：#e0e0e0\n- 次要文字：#888', source: 'human', tags: ['design', 'ui'] },
      { teamId: team.id, authorId: mengyu.id, title: '接口测试用例清单', content: '## 覆盖度：85%\n\n### 批量推荐 /recommend/batch\n- [x] 正常请求（1-50 条）\n- [x] 边界：0 条、51 条\n- [x] 非法参数：负数、超大数\n- [x] 缓存命中 vs 未命中\n\n### 实时推荐 /recommend/realtime\n- [x] 正常请求 < 100ms\n- [x] 超时场景\n- [x] 降级到默认推荐', source: 'agent', tags: ['test', 'qa', 'agent'] },
      { teamId: team.id, authorId: xuechen.id, title: '灰度发布方案', content: '## 阶段\n1. **10% 灰度**（6/1-6/3）：核心指标 CTR、P99、错误率\n2. **50% 灰度**（6/4-6/6）：观察用户反馈、长尾内容效果\n3. **100% 全量**（6/7）：正式切换\n\n## 回滚条件\n- CTR 下降 > 0.5%\n- P99 > 200ms（持续 5min）\n- 错误率 > 1%', source: 'collab', tags: ['ops', 'collab', 'plan'] },
    ],
  })

  // ==========================================
  // 6. 创建项目（两个并行项目，展示团队多任务）
  // ==========================================
  const project1 = await prisma.project.create({
    data: {
      teamId: team.id,
      name: '智能推荐系统 v2.3',
      slug: 'recommend-v2',
      status: 'active',
      progress: 62,
      desc: '推荐系统全链路重构：前端组件统一、后端接口升级、算法模型迭代',
      deadline: '2026/06/07',
    },
  })

  const project2 = await prisma.project.create({
    data: {
      teamId: team.id,
      name: 'Agent 协作平台搭建',
      slug: 'agent-platform',
      status: 'active',
      progress: 35,
      desc: '内部 Agent 管理后台：Agent 配置、技能编排、工作流可视化',
      deadline: '2026/06/20',
    },
  })

  // ==========================================
  // 7. 创建里程碑（带产出物和关卡）
  // ==========================================
  const ms1 = await prisma.milestone.create({
    data: {
      projectId: project1.id, name: '需求评审', status: 'done', date: '2026/05/15', owner: '雪辰',
      requiredArtifacts: {
        create: [
          { name: 'PRD v2.3', type: 'doc', status: 'completed', author: '雪辰', completedAt: '2026/05/14' },
          { name: '技术方案评审纪要', type: 'doc', status: 'completed', author: '鉴川', completedAt: '2026/05/15' },
        ],
      },
      gate: { create: { name: '需求冻结', passed: true } },
    },
  })

  const ms2 = await prisma.milestone.create({
    data: {
      projectId: project1.id, name: '接口开发', status: 'running', date: '2026/05/22', owner: '鉴川',
      requiredArtifacts: {
        create: [
          { name: 'recommend-api.yaml', type: 'code', status: 'completed', author: '鉴川的 Agent', completedAt: '2026/05/21' },
          { name: 'Redis 缓存层代码', type: 'code', status: 'completed', author: '鉴川的 Agent', completedAt: '2026/05/22' },
          { name: 'SDK 包', type: 'code', status: 'missing', author: '鉴川' },
        ],
      },
      gate: { create: { name: '接口联调通过', passed: false } },
    },
  })

  const ms3 = await prisma.milestone.create({
    data: {
      projectId: project1.id, name: '前端开发', status: 'running', date: '2026/05/26', owner: '王辰',
      requiredArtifacts: {
        create: [
          { name: 'RecommendCard.tsx', type: 'code', status: 'completed', author: '王辰的 Agent', completedAt: '2026/05/24' },
          { name: 'useLazyImage Hook', type: 'code', status: 'completed', author: '王辰的 Agent', completedAt: '2026/05/24' },
          { name: '视觉走查报告', type: 'doc', status: 'missing', author: '叙白' },
        ],
      },
      gate: { create: { name: '设计还原度 100%', passed: false } },
    },
  })

  await prisma.milestone.createMany({
    data: [
      { projectId: project1.id, name: '模型训练', status: 'done', date: '2026/05/20', owner: '广苓' },
      { projectId: project1.id, name: '联调测试', status: 'waiting', date: '2026/05/28', owner: '孟雨' },
      { projectId: project1.id, name: '灰度发布', status: 'waiting', date: '2026/06/01', owner: '鉴川' },
      { projectId: project1.id, name: '全量上线', status: 'waiting', date: '2026/06/07', owner: '全员' },
      { projectId: project2.id, name: '产品方案', status: 'done', date: '2026/05/20', owner: '雪辰' },
      { projectId: project2.id, name: '技术预研', status: 'running', date: '2026/05/30', owner: '鉴川' },
      { projectId: project2.id, name: 'MVP 开发', status: 'waiting', date: '2026/06/10', owner: '王辰' },
    ],
  })

  // ==========================================
  // 8. 创建待办（更丰富的场景）
  // ==========================================
  await prisma.todo.createMany({
    data: [
      { projectId: project1.id, teamId: team.id, title: '确认 Redis 缓存策略（TTL + 降级）', assignee: '雪辰', priority: 'high', status: 'todo', due: '2026/05/27', type: 'human', background: '鉴川的 Agent 设计了缓存方案：TTL=10min, 命中率约 85%。需产品确认是否符合业务实时性要求。', materials: ['缓存策略文档', '性能测试报告'], actions: ['审阅方案', '确认 TTL', '确认降级策略'] },
      { projectId: project1.id, teamId: team.id, title: '审阅推荐卡片交互设计', assignee: '雪辰', priority: 'medium', status: 'todo', due: '2026/05/28', type: 'human', background: '王辰的 Agent 已生成组件初版，需确认交互细节和视觉规范。', materials: ['RecommendCard.tsx', 'Figma 设计稿'], actions: ['检查渲染效果', '确认封面尺寸', '验收文案展示'] },
      { projectId: project1.id, teamId: team.id, title: '确认灰度发布计划', assignee: '鉴川', priority: 'high', status: 'todo', due: '2026/05/28', type: 'human', background: '广苓的 Agent 打包了 v2.1 模型，P99=118ms，需工程确认灰度方案和回滚机制。', materials: ['模型性能报告', '灰度方案', '回滚手册'], actions: ['确认流量比例', '准备回滚预案'] },
      { projectId: project1.id, teamId: team.id, title: '更新 PRD 验收标准', assignee: '雪辰', priority: 'medium', status: 'done', due: '2026/05/24', type: 'human', background: '根据多 Agent 讨论结果更新 PRD 验收标准。', materials: ['PRD v2.2'], actions: ['更新标准', '同步团队'] },
      { projectId: project1.id, teamId: team.id, title: '推荐卡片组件开发', assignee: '王辰', priority: 'high', status: 'in-progress', due: '2026/05/26', type: 'agent', agent: '🎨 王辰的 Agent', agentIcon: '🎨', progress: '组件初版已生成，优化虚拟列表中' },
      { projectId: project1.id, teamId: team.id, title: '接口文档 + SDK 生成', assignee: '鉴川', priority: 'high', status: 'in-progress', due: '2026/05/27', type: 'agent', agent: '⚙️ 鉴川的 Agent', agentIcon: '⚙️', progress: '接口已设计，SDK 生成中（预计 2h）' },
      { projectId: project1.id, teamId: team.id, title: '模型 v2.1 上线灰度', assignee: '广苓', priority: 'medium', status: 'todo', due: '2026/05/28', type: 'agent', agent: '🧠 广苓的 Agent', agentIcon: '🧠', progress: '模型已打包，等待灰度审批' },
      { projectId: project1.id, teamId: team.id, title: '前端性能测试报告', assignee: '王辰', priority: 'low', status: 'todo', due: '2026/05/30', type: 'agent', agent: '🎨 王辰的 Agent', agentIcon: '🎨', progress: 'FPS 测试完成，整理报告中' },
      { projectId: project2.id, teamId: team.id, title: 'Agent 配置中心 UI 设计', assignee: '叙白', priority: 'high', status: 'todo', due: '2026/06/05', type: 'human', background: '需要设计 Agent 技能编排的可视化界面，支持拖拽配置。', materials: ['竞品分析', '用户访谈纪要'], actions: ['输出交互稿', '评审'] },
      { projectId: project2.id, teamId: team.id, title: '工作流引擎技术预研', assignee: '鉴川', priority: 'high', status: 'in-progress', due: '2026/05/30', type: 'agent', agent: '⚙️ 鉴川的 Agent', agentIcon: '⚙️', progress: '对比了 Temporal vs自研方案，倾向 Temporal' },
    ],
  })

  // ==========================================
  // 9. 创建待确认事项（展示人机协作决策点）
  // ==========================================
  await prisma.pendingItem.createMany({
    data: [
      { teamId: team.id, title: '缓存策略确认', desc: 'TTL=10min, 命中率 85%', assigner: '鉴川的 Agent', assignerType: 'agent', assignerIcon: '⚙️', status: 'pending', context: '鉴川的后端 Agent 设计了 Redis 缓存方案。批量推荐接口 P99=350ms，加缓存后可降至 50ms。需要你确认 TTL 10分钟是否满足业务实时性要求。如果不满足，建议调整为 5min 或 3min。', relatedMember: jianchuan.id },
      { teamId: team.id, title: '推荐理由格式', desc: '返回 HTML 还是 Markdown', assigner: '雪辰（你）', assignerType: 'human', status: 'pending', context: '前端需要渲染推荐理由文案，王辰的前端 Agent 建议用 HTML 直接渲染，但广苓的算法 Agent 输出是纯文本。需要你决定统一格式。HTML 更灵活但 XSS 风险需处理，Markdown 更安全但渲染成本高。', relatedMember: wangchen.id },
      { teamId: team.id, title: '模型灰度比例', desc: '建议 10% 流量 A/B 验证', assigner: '广苓的 Agent', assignerType: 'agent', assignerIcon: '🧠', status: 'pending', context: '广苓的算法 Agent 完成了 v2.1 模型打包（准确率 +3.2%），建议灰度 10% 流量做 A/B 测试。核心指标为 CTR 提升 >2%。需要你确认灰度方案和时间安排。', relatedMember: guangling.id },
      { teamId: team.id, title: '组件命名规范', desc: 'RecommendCard vs RecommendationCard', assigner: '雪辰的 Agent', assignerType: 'agent', assignerIcon: '📋', status: 'approved', context: '团队讨论后统一使用 RecommendCard 命名，已同步至设计规范文档。', relatedMember: xuechen.id },
      { teamId: team.id, title: 'Agent 平台技术选型', desc: 'Temporal vs 自研工作流引擎', assigner: '鉴川的 Agent', assignerType: 'agent', assignerIcon: '⚙️', status: 'pending', context: 'Agent 协作平台需要工作流引擎支持复杂编排。Temporal 成熟稳定但引入运维成本，自研更灵活但开发周期长。建议先用 Temporal MVP 验证。', relatedMember: jianchuan.id },
    ],
  })

  // ==========================================
  // 10. 创建日报（展示团队日常工作流）
  // ==========================================
  await prisma.dailyReport.createMany({
    data: [
      { teamId: team.id, memberId: xuechen.id, date: '今天', done: ['更新 PRD v2.3 缓存策略章节', '确认推荐理由格式为 HTML', '评审接口设计方案'], todo: ['组织设计走查会', '确认灰度方案时间安排'], blockers: [], humanFocus: ['确认灰度比例与时间安排', '组织设计走查会对齐视觉规范'], agentFocus: ['自动拆解需求为子任务', '跟踪各角色里程碑进度'] },
      { teamId: team.id, memberId: wangchen.id, date: '今天', done: ['完成 RecommendCard 组件开发', '封装 useLazyImage Hook', '组件代码已入库'], todo: ['等待视觉规范最终稿', '联调适配接口'], blockers: ['视觉规范未最终确认'], humanFocus: ['确认视觉规范最终稿', '联调接口字段对齐'], agentFocus: ['生成 RecommendCard.tsx 组件代码', '封装 useLazyImage 懒加载 Hook'] },
      { teamId: team.id, memberId: jianchuan.id, date: '今天', done: ['完成 recommend-api.yaml', 'Redis 缓存层集成', '缓存降级策略设计'], todo: ['完成 SDK 包封装', '编写接口联调文档'], blockers: [], humanFocus: ['评审缓存降级策略', '确认联调时间节点'], agentFocus: ['设计 recommend-api.yaml 接口规范', '编写 Redis 缓存层与降级策略代码'] },
      { teamId: team.id, memberId: guangling.id, date: '今天', done: ['模型 v2.1 推理性能评估', 'INT8 量化验证', 'A/B 实验方案撰写'], todo: ['等待灰度审批确认', '准备全量切换方案'], blockers: ['灰度比例需产品确认'], humanFocus: ['确认灰度比例与实验指标', '评估全量切换风险'], agentFocus: ['完成 v2.1 推理性能评估报告', 'INT8 量化验证与 A/B 实验方案'] },
      { teamId: team.id, memberId: xubai.id, date: '今天', done: ['视觉规范文档初版', '推荐卡片尺寸标注'], todo: ['完成交互走查报告', 'Figma 最终稿'], blockers: [], humanFocus: ['走查交互细节', '确认研发还原度'], agentFocus: ['生成视觉规范文档初版', '自动标注推荐卡片尺寸'] },
      { teamId: team.id, memberId: mengyu.id, date: '今天', done: ['自动化测试脚本 85% 覆盖', '接口用例编写'], todo: ['补充边界条件用例', '性能压测方案'], blockers: [], humanFocus: ['评审边界条件覆盖度', '确认性能压测基准'], agentFocus: ['自动生成接口测试用例', '编写自动化回归脚本'] },
    ],
  })

  // ==========================================
  // 11. 创建动态（展示团队活跃度）
  // ==========================================
  await prisma.activityItem.createMany({
    data: [
      { teamId: team.id, icon: '📋', text: '雪辰的 Agent 更新了 PRD v2.3 缓存策略章节', time: '10 分钟前', type: 'agent' },
      { teamId: team.id, icon: '🎨', text: '王辰的 Agent 生成了 RecommendCard.tsx', time: '30 分钟前', type: 'agent' },
      { teamId: team.id, icon: '⚙️', text: '鉴川的 Agent 设计了 recommend-api.yaml', time: '1 小时前', type: 'agent' },
      { teamId: team.id, icon: '🧠', text: '广苓的 Agent 打包了 model-v2.1.tar.gz', time: '2 小时前', type: 'agent' },
      { teamId: team.id, icon: '👤', text: '雪辰确认了推荐理由格式为 HTML', time: '3 小时前', type: 'human' },
      { teamId: team.id, icon: '🎯', text: '叙白更新了推荐卡片视觉规范 v2', time: '4 小时前', type: 'human' },
      { teamId: team.id, icon: '🧪', text: '孟雨的 Agent 完成了接口测试 85% 覆盖', time: '5 小时前', type: 'agent' },
      { teamId: team.id, icon: '📊', text: '项目进度更新：推荐系统 v2.3 完成 62%', time: '6 小时前', type: 'human' },
    ],
  })

  // ==========================================
  // 12. 创建 Agent（带丰富配置）
  // ==========================================
  const agentConfigs = [
    {
      user: xuechen, name: '产品 Agent', icon: '📋',
      prompt: '你是一名资深产品经理，擅长需求分析、PRD 撰写、项目进度跟踪。你的职责是帮助产品负责人梳理需求、拆解任务、跟踪进度。输出应简洁专业，使用中文。',
      skills: [
        { name: 'PRD 撰写', desc: '根据需求描述生成结构化 PRD 文档' },
        { name: '需求拆解', desc: '将大需求拆解为可执行的子任务' },
        { name: '进度跟踪', desc: '汇总各角色进展，生成项目日报' },
        { name: '决策辅助', desc: '分析利弊，提供数据支撑的决策建议' },
      ],
      memory: [
        { key: '项目背景', value: '推荐系统 v2.3 重构，目标 CTR 从 2.1% 提升到 3.5%+' },
        { key: '团队节奏', value: '每日早会 10:00，周报周五 18:00 前提交' },
        { key: '技术栈', value: 'React 18 + TypeScript + NestJS + PostgreSQL + Redis' },
        { key: '灰度策略', value: '10% → 50% → 100%，回滚阈值 CTR 下降 > 0.5%' },
      ],
      faq: [
        { question: '如何与开发 Agent 协作？', answer: '通过创建任务卡片并 @ 相关 Agent，Agent 会自动领取并执行。执行完成后会生成报告并等待人类确认。', likes: 5, dislikes: 0 },
        { question: 'Agent 产出的代码可以直接合并吗？', answer: '不建议直接合并。Agent 产出需经过人类 Code Review，确认无误后方可合并。', likes: 8, dislikes: 1 },
      ],
      workflows: [
        { name: '需求评审流程', steps: ['收集需求', '拆解任务', '分配角色', '设定里程碑', '跟踪进度', '验收交付'] },
        { name: '日常同步流程', steps: ['汇总昨日进展', '识别阻塞项', '生成今日计划', '同步团队'] },
      ],
    },
    {
      user: wangchen, name: '前端 Agent', icon: '🎨',
      prompt: '你是一名资深前端工程师，精通 React、TypeScript、性能优化。你的职责是根据设计稿生成高质量组件代码，封装可复用 Hooks，优化渲染性能。',
      skills: [
        { name: '组件生成', desc: '根据设计稿生成 React + TypeScript 组件' },
        { name: 'Hook 封装', desc: '将通用逻辑封装为可复用 Hooks' },
        { name: '性能优化', desc: '分析并优化渲染性能，提升 FPS' },
        { name: '代码审查', desc: '自动检查代码规范和潜在 Bug' },
      ],
      memory: [
        { key: '组件规范', value: '使用函数组件 + Hooks，Props 需有 JSDoc，支持 forwardRef' },
        { key: '性能基线', value: '首屏渲染 < 16ms，滚动 FPS > 55，Bundle 增量 < 20KB' },
        { key: '设计规范', value: '封面比例 3:2，卡片圆角 12px，边框 rgba(255,255,255,0.06)' },
      ],
      faq: [
        { question: '生成的组件支持暗色模式吗？', answer: '默认支持。所有颜色使用 CSS 变量，自动适配暗色/亮色主题。', likes: 3, dislikes: 0 },
      ],
      workflows: [
        { name: '组件开发流程', steps: ['解析设计稿', '生成组件结构', '添加样式', '编写测试', '性能优化', '提交代码'] },
      ],
    },
    {
      user: jianchuan, name: '后端 Agent', icon: '⚙️',
      prompt: '你是一名资深后端工程师，精通 NestJS、PostgreSQL、Redis、微服务架构。你的职责是设计 RESTful API、编写高性能服务端代码、设计缓存和降级策略。',
      skills: [
        { name: 'API 设计', desc: '设计 RESTful API 并生成 OpenAPI 文档' },
        { name: '缓存设计', desc: '设计多级缓存策略，提升接口性能' },
        { name: 'SDK 生成', desc: '根据 API 文档自动生成客户端 SDK' },
        { name: '性能调优', desc: '分析慢查询，优化数据库和接口性能' },
      ],
      memory: [
        { key: '缓存策略', value: 'L1 Caffeine(TTL 1min) → L2 Redis(TTL 10min) → L3 DB' },
        { key: '接口基线', value: 'P99 < 120ms，错误率 < 0.1%，QPS > 5000' },
        { key: '安全规范', value: '所有输入参数校验，SQL 防注入，XSS 过滤' },
      ],
      faq: [
        { question: 'SDK 支持哪些语言？', answer: '目前自动生成 TypeScript、Python、Go 三种语言的 SDK。', likes: 4, dislikes: 0 },
      ],
      workflows: [
        { name: '接口开发流程', steps: ['设计接口契约', '编写 Controller', '实现 Service', '添加缓存', '编写测试', '生成 SDK'] },
      ],
    },
    {
      user: guangling, name: '算法 Agent', icon: '🧠',
      prompt: '你是一名机器学习工程师，擅长推荐算法、模型优化、A/B 测试。你的职责是训练推荐模型、优化推理性能、设计实验方案。',
      skills: [
        { name: '模型训练', desc: '训练并迭代推荐模型' },
        { name: '量化优化', desc: 'INT8/FP16 量化，提升推理速度' },
        { name: 'A/B 实验', desc: '设计并分析 A/B 实验方案' },
        { name: '特征工程', desc: '构建和优化模型特征' },
      ],
      memory: [
        { key: '模型版本', value: '当前 v2.1，基于 DeepFM + Transformer，准确率 +3.2%' },
        { key: '推理基线', value: 'P99=118ms(INT8)，Batch=20 时 580ms' },
        { key: '实验指标', value: '核心指标 CTR，辅助指标停留时长、转化率' },
      ],
      faq: [
        { question: '模型多久迭代一次？', answer: '正常情况下每两周一个小版本，每月一个大版本。紧急需求可临时训练。', likes: 2, dislikes: 0 },
      ],
      workflows: [
        { name: '模型上线流程', steps: ['数据准备', '模型训练', '离线评估', '打包部署', '灰度验证', '全量上线'] },
      ],
    },
    {
      user: xubai, name: '设计 Agent', icon: '🎯',
      prompt: '你是一名 UI/UX 设计师，擅长设计系统构建、交互设计、视觉规范。你的职责是生成设计规范文档、标注组件尺寸、确保设计还原度。',
      skills: [
        { name: '规范生成', desc: '自动生成视觉规范文档' },
        { name: '自动标注', desc: '自动标注组件尺寸和间距' },
        { name: '走查报告', desc: '对比设计稿和实现，输出走查问题' },
        { name: '图标生成', desc: '根据语义生成 SVG 图标' },
      ],
      memory: [
        { key: '设计原则', value: '极简、深色优先、信息层级清晰、交互反馈即时' },
        { key: '色彩系统', value: '主色 #00d4ff，背景 #1a1a2e，卡片 rgba(255,255,255,0.03)' },
      ],
      faq: [],
      workflows: [
        { name: '设计交付流程', steps: ['接收需求', '输出初稿', '评审修改', '标注规范', '走查还原', '归档文档'] },
      ],
    },
    {
      user: mengyu, name: '测试 Agent', icon: '🧪',
      prompt: '你是一名 QA 工程师，擅长自动化测试、接口测试、性能压测。你的职责是编写测试用例、执行回归测试、输出测试报告。',
      skills: [
        { name: '用例生成', desc: '根据接口文档自动生成测试用例' },
        { name: '回归测试', desc: '自动执行回归测试套件' },
        { name: '性能压测', desc: '设计并执行性能压测方案' },
        { name: 'Bug 分析', desc: '分析 Bug 根因，提供修复建议' },
      ],
      memory: [
        { key: '覆盖度目标', value: '接口测试 90%+，单元测试 80%+，E2E 核心链路覆盖' },
        { key: '压测基线', value: 'QPS 5000，P99 < 120ms，错误率 < 0.1%' },
      ],
      faq: [],
      workflows: [
        { name: '测试流程', steps: ['需求评审', '用例设计', '用例评审', '测试执行', 'Bug 跟踪', '报告输出'] },
      ],
    },
  ]

  for (const cfg of agentConfigs) {
    await prisma.agent.create({
      data: {
        userId: cfg.user.id,
        teamId: team.id,
        name: cfg.name,
        icon: cfg.icon,
        systemPrompt: cfg.prompt,
        skills: { create: cfg.skills },
        memory: { create: cfg.memory },
        faq: { create: cfg.faq },
        workflows: { create: cfg.workflows },
      },
    })
  }

  // ==========================================
  // 13. Agent QA 记录（展示 Agent 工作绩效）
  // ==========================================
  await prisma.agentQARecord.createMany({
    data: [
      { teamId: team.id, name: '产品 Agent', icon: '📋', owner: '雪辰', tasks: 12, completed: 11, errors: 1, avgTime: '8m', accuracy: '92%' },
      { teamId: team.id, name: '前端 Agent', icon: '🎨', owner: '王辰', tasks: 8, completed: 8, errors: 0, avgTime: '15m', accuracy: '100%' },
      { teamId: team.id, name: '后端 Agent', icon: '⚙️', owner: '鉴川', tasks: 10, completed: 9, errors: 1, avgTime: '22m', accuracy: '90%' },
      { teamId: team.id, name: '算法 Agent', icon: '🧠', owner: '广苓', tasks: 6, completed: 6, errors: 0, avgTime: '45m', accuracy: '100%' },
      { teamId: team.id, name: '设计 Agent', icon: '🎯', owner: '叙白', tasks: 5, completed: 5, errors: 0, avgTime: '12m', accuracy: '100%' },
      { teamId: team.id, name: '测试 Agent', icon: '🧪', owner: '孟雨', tasks: 15, completed: 14, errors: 1, avgTime: '10m', accuracy: '93%' },
    ],
  })

  // ==========================================
  // 14. 协作日志（展示 Agent 间交互历史）
  // ==========================================
  await prisma.collabLogItem.createMany({
    data: [
      { teamId: team.id, fromId: xuechen.id, fromName: '产品 Agent', toId: jianchuan.id, toName: '后端 Agent', type: 'task', status: 'completed', time: '2 小时前' },
      { teamId: team.id, fromId: jianchuan.id, fromName: '后端 Agent', toId: wangchen.id, toName: '前端 Agent', type: 'sync', status: 'completed', time: '3 小时前' },
      { teamId: team.id, fromId: wangchen.id, fromName: '前端 Agent', toId: xubai.id, toName: '设计 Agent', type: 'review', status: 'pending', time: '4 小时前' },
      { teamId: team.id, fromId: guangling.id, fromName: '算法 Agent', toId: jianchuan.id, toName: '后端 Agent', type: 'deliver', status: 'completed', time: '5 小时前' },
      { teamId: team.id, fromId: xuechen.id, fromName: '产品 Agent', toId: guangling.id, toName: '算法 Agent', type: 'task', status: 'running', time: '6 小时前' },
      { teamId: team.id, fromId: mengyu.id, fromName: '测试 Agent', toId: jianchuan.id, toName: '后端 Agent', type: 'feedback', status: 'pending', time: '1 天前' },
    ],
  })

  console.log('✅ 增强版 Demo 数据已生成！')
  console.log(`   团队: ${team.name} (${team.slug})`)
  console.log(`   成员: ${users.length} 人`)
  console.log(`   频道: ${team.channels.length} 个`)
  console.log(`   项目: 2 个（推荐系统 v2.3、Agent 协作平台）`)
  console.log(`   待办: 10 条`)
  console.log(`   知识库: 10 篇文档`)
  console.log(`   Agent: 6 个（含技能/记忆/FAQ/工作流）`)
  console.log(`   日报: 6 份`)
  console.log(`   动态: 8 条`)
  console.log(`   邀请: 1 个（等待新用户加入）`)
  console.log(`\n🎯 访问 http://<服务器IP> 用 demo@qoder.team / demo123 登录体验`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
