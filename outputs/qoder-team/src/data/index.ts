/* ============================================
   Qoder Team — 数据层（ mock 数据 + 访问函数）
   ============================================ */

import type {
  MemberDef, ProjectDef, PendingItem, AgentDef,
  AgentAsset, DailyReport, ColorVariant,
} from '../types'

/* ===== 团队成员 ===== */
export const MEMBERS: MemberDef[] = [
  { id: 'xuechen', name: '雪辰', role: '产品经理', color: 'purple', isMe: true,
    agent: { name: '产品 Agent', icon: '📋', online: true,
      capabilities: ['需求分析', 'PRD撰写', '用户故事拆解', '项目协调'],
      autonomous: ['更新文档', '通知团队', '拆解需求', '整理信息'],
      needApproval: ['删除文档', '修改优先级', '发版决策'] } },
  { id: 'wangchen', name: '王辰', role: '前端工程师', color: 'green',
    agent: { name: '前端 Agent', icon: '🎨', online: true,
      capabilities: ['组件开发', '性能优化', '交互实现', '构建配置'],
      autonomous: ['编写代码', '生成组件', '跑测试', '优化性能'],
      needApproval: ['修改构建配置', '升级依赖', '重构架构'] } },
  { id: 'jianchuan', name: '鉴川', role: '后端工程师', color: 'blue',
    agent: { name: '后端 Agent', icon: '⚙️', online: true,
      capabilities: ['接口设计', '数据库设计', '缓存策略', '性能调优'],
      autonomous: ['设计API', '写文档', '生成SDK', '性能测试'],
      needApproval: ['修改线上配置', '数据库迁移', '服务上线'] } },
  { id: 'guangling', name: '广苓', role: '算法工程师', color: 'orange',
    agent: { name: '算法 Agent', icon: '🧠', online: true,
      capabilities: ['模型训练', '效果评估', 'A/B测试', '特征工程'],
      autonomous: ['训练模型', '跑评估', '生成报告', '特征分析'],
      needApproval: ['模型上线', '灰度扩量', '修改排序策略'] } },
  { id: 'xubai', name: '叙白', role: '设计师', color: 'pink',
    agent: { name: '设计 Agent', icon: '🎯', online: true,
      capabilities: ['视觉设计', '交互设计', '设计规范', '原型制作'],
      autonomous: ['出设计稿', '更新规范', '标注切图', '生成原型'],
      needApproval: ['修改设计系统', '品牌变更', '大改版'] } },
  { id: 'mengyu', name: '孟雨', role: '测试工程师', color: 'cyan',
    agent: { name: '测试 Agent', icon: '🧪', online: false,
      capabilities: ['用例设计', '自动化测试', '性能测试', '回归测试'],
      autonomous: ['写用例', '跑自动化', '生成报告', '回归验证'],
      needApproval: ['标记上线', '关闭 Bug', '跳过测试'] } },
]

export function getMember(id: string): MemberDef | undefined {
  return MEMBERS.find(m => m.id === id)
}

/* ===== Agent 兼容层 ===== */
export interface AgentCompat {
  id: string
  name: string
  icon: string
  owner: string
  ownerRole: string
  color: ColorVariant
  online: boolean
}

export const AGENTS: AgentCompat[] = MEMBERS.map(m => ({
  id: m.id,
  name: m.agent.name,
  icon: m.agent.icon,
  owner: m.name,
  ownerRole: m.role,
  color: m.color,
  online: m.agent.online,
}))

export function getAgent(id: string): AgentCompat | undefined {
  return AGENTS.find(a => a.id === id)
}

/* ===== 项目定义 ===== */
export const PROJECTS: ProjectDef[] = [
  {
    id: 'recommend-v2', name: '推荐系统重构 v2', status: 'active',
    members: 4, progress: 60, desc: '推荐系统全链路重构，含前端组件、后端接口、算法模型',
    deadline: '6/5', milestones: '4/8', todos: 8,
  },
  {
    id: 'user-center', name: '用户中心改版', status: 'active',
    members: 3, progress: 35, desc: '优化注册登录流程和个人主页',
    deadline: '7/15', milestones: '2/6', todos: 5,
  },
  {
    id: 'data-platform', name: '数据平台搭建', status: 'planning',
    members: 2, progress: 10, desc: '搭建统一数据分析平台，支持自助查询和报表',
    deadline: '9/30', milestones: '1/10', todos: 3,
  },
]

/* ===== 待确认事项 ===== */
export const INITIAL_PENDING: PendingItem[] = [
  { id: 'p1', title: '缓存策略确认', desc: 'TTL=10min, 命中率 85%', assigner: '鉴川的 Agent', assignerType: 'agent', assignerIcon: '⚙️', status: 'pending',
    context: '鉴川的后端 Agent 设计了 Redis 缓存方案。批量推荐接口 P99=350ms，加缓存后可降至 50ms。需要你确认 TTL 10分钟是否满足业务实时性要求。', relatedMember: 'jianchuan' },
  { id: 'p2', title: '推荐理由格式', desc: '返回 HTML 还是 Markdown', assigner: '雪辰（你）', assignerType: 'human', status: 'pending',
    context: '前端需要渲染推荐理由文案，王辰的前端 Agent 建议用 HTML 直接渲染，但广苓的算法 Agent 输出是纯文本。需要你决定统一格式。', relatedMember: 'wangchen' },
  { id: 'p3', title: '模型灰度比例', desc: '建议 10% 流量 A/B 验证', assigner: '广苓的 Agent', assignerType: 'agent', assignerIcon: '🧠', status: 'pending',
    context: '广苓的算法 Agent 完成了 v2.1 模型打包（准确率 +3.2%），建议灰度 10% 流量做 A/B 测试。核心指标为 CTR 提升 >2%。需要你确认灰度方案和时间安排。', relatedMember: 'guangling' },
  { id: 'p4', title: '组件命名规范', desc: 'RecommendCard vs RecommendationCard', assigner: '雪辰的 Agent', assignerType: 'agent', assignerIcon: '📋', status: 'approved',
    context: '团队讨论后统一使用 RecommendCard 命名，已同步至设计规范文档。', relatedMember: 'xuechen' },
]

/* ===== Agent 初始资产 ===== */
export const INITIAL_ASSETS: Record<string, AgentAsset> = {
  wangchen: {
    systemPrompt: '你是一个专业的前端开发 Agent，擅长 React、TypeScript 和 CSS。任务是根据需求生成高质量组件代码，注意性能优化和代码规范。',
    skills: [
      { name: '代码生成', desc: '根据需求自动生成 React 组件' },
      { name: '组件设计', desc: '设计可复用的组件结构和 Props' },
      { name: '性能优化', desc: '分析性能瓶颈并提供优化方案' },
    ],
    workflows: [{ name: '需求转代码', steps: ['接收需求', '拆解结构', '生成代码', '自动 Review', '输出'] }],
    memory: [
      { key: '技术栈', value: 'React 18 + TypeScript + Vite', updatedAt: '2 天前' },
      { key: '代码风格', value: '函数式组件优先', updatedAt: '3 天前' },
    ],
  },
  jianchuan: {
    systemPrompt: '你是一个专业的后端开发 Agent，擅长 API 设计、数据库优化和系统架构。确保接口性能、安全性和可扩展性。',
    skills: [
      { name: '接口设计', desc: '设计 RESTful API 并生成文档' },
      { name: '部署脚本', desc: '生成 Docker 和 CI/CD 配置' },
    ],
    workflows: [{ name: '需求到接口', steps: ['分析需求', '设计 API', '生成代码', '编写测试', '部署'] }],
    memory: [
      { key: '数据库', value: 'MySQL 8.0 + Redis 7.0', updatedAt: '1 天前' },
      { key: '部署', value: 'Kubernetes + Docker', updatedAt: '5 天前' },
    ],
  },
  guangling: {
    systemPrompt: '你是一个专业的算法 Agent，擅长推荐算法、模型训练和推理优化。提交模型前必须完成性能评估。',
    skills: [
      { name: '模型训练', desc: '配置和启动训练任务' },
      { name: '推理优化', desc: '量化、剪枝和推理加速' },
    ],
    workflows: [{ name: '模型迭代', steps: ['数据分析', '特征工程', '训练', '评估', '打包'] }],
    memory: [{ key: '当前模型', value: 'recommend-bert-v2.1 (110M)', updatedAt: '4 小时前' }],
  },
  xuechen: {
    systemPrompt: '你是一个专业的产品 Agent，擅长需求分析、PRD 撰写和用户故事拆解。始终从用户视角出发。',
    skills: [
      { name: 'PRD 生成', desc: '自动生成产品需求文档' },
      { name: '用户故事', desc: '从 Epic 拆解 User Story' },
    ],
    workflows: [{ name: '需求处理', steps: ['接收反馈', '提取需求', '排序', '撰写 PRD', '验收标准'] }],
    memory: [{ key: '当前项目', value: '推荐系统重构 v2', updatedAt: '1 天前' }],
  },
  xubai: {
    systemPrompt: '你是一个专业的设计 Agent，擅长视觉设计、交互规范和设计系统维护。确保设计一致性。',
    skills: [
      { name: '视觉生成', desc: '根据需求生成视觉稿' },
      { name: '设计规范', desc: '维护设计系统一致性' },
    ],
    workflows: [{ name: '设计流程', steps: ['接收需求', '竞品分析', '出稿', '走查', '标注'] }],
    memory: [{ key: '设计系统', value: 'Q Design System v3', updatedAt: '3 天前' }],
  },
  mengyu: {
    systemPrompt: '你是一个专业的测试 Agent，擅长用例设计、自动化测试和性能压测。确保产品质量。',
    skills: [
      { name: '用例生成', desc: '自动设计测试用例' },
      { name: '自动化脚本', desc: '生成测试脚本' },
    ],
    workflows: [{ name: '测试流程', steps: ['分析需求', '设计用例', '编写脚本', '执行测试', '报告'] }],
    memory: [{ key: '测试框架', value: 'Jest + Playwright', updatedAt: '1 天前' }],
  },
}

/* ===== 团队日报数据 ===== */
export const TEAM_DAILY: DailyReport[] = [
  {
    memberId: 'xuechen', date: '今天',
    done: ['更新 PRD v2.3 缓存策略章节', '确认推荐理由格式为 HTML', '评审接口设计方案'],
    todo: ['组织设计走查会', '确认灰度方案时间安排'],
    blockers: [],
  },
  {
    memberId: 'wangchen', date: '今天',
    done: ['完成 RecommendCard 组件开发', '封装 useLazyImage Hook', '组件代码已入库'],
    todo: ['等待视觉规范最终稿', '联调适配接口'],
    blockers: ['视觉规范未最终确认'],
  },
  {
    memberId: 'jianchuan', date: '今天',
    done: ['完成 recommend-api.yaml', 'Redis 缓存层集成', '缓存降级策略设计'],
    todo: ['完成 SDK 包封装', '编写接口联调文档'],
    blockers: [],
  },
  {
    memberId: 'guangling', date: '今天',
    done: ['模型 v2.1 推理性能评估', 'INT8 量化验证', 'A/B 实验方案撰写'],
    todo: ['等待灰度审批确认', '准备全量切换方案'],
    blockers: ['灰度比例需产品确认'],
  },
  {
    memberId: 'xubai', date: '今天',
    done: ['视觉规范文档初版', '推荐卡片尺寸标注'],
    todo: ['完成交互走查报告', 'Figma 最终稿'],
    blockers: [],
  },
  {
    memberId: 'mengyu', date: '今天',
    done: ['自动化测试脚本 85% 覆盖', '接口用例编写'],
    todo: ['补充边界条件用例', '性能压测方案'],
    blockers: [],
  },
]
