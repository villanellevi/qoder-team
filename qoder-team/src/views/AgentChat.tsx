import { useState, useRef, useEffect } from 'react'
import { Tag, useModal } from '../components/ui'
import { useTeamData } from '../context/TeamDataContext'
import { api } from '../api/client'
import type { ChatMessage, Conversation, PendingItem } from '../types'

/* 从 members 动态生成对话列表 */
function buildConversations(members: any[]): Conversation[] {
  const convs: Conversation[] = [
    { id: 'group', type: 'group', name: '全员群聊', icon: '👥', lastMsg: 'PRD 已更新至 v2.3', unread: 0, group: 'team' },
  ]
  // 单点人员&Agent协作
  members.filter(m => !m.isMe).forEach(m => {
    convs.push({
      id: m.id,
      type: 'direct',
      name: m.name,
      icon: m.agent.icon,
      memberId: m.id,
      lastMsg: getLastMsg(m.id),
      unread: m.id === 'wangchen' ? 1 : 0,
      group: 'direct',
    })
  })
  // 和自己的Agent协作
  const me = members.find(m => m.isMe)
  if (me) {
    convs.push({
      id: 'my-agent',
      type: 'myagent',
      name: `${me.name}的 Agent`,
      icon: me.agent.icon,
      memberId: me.id,
      lastMsg: '已为你整理今日日报',
      unread: 2,
      group: 'myagent',
    })
  }
  return convs
}

function getLastMsg(memberId: string): string {
  const msgs: Record<string, string> = {
    wangchen: '已封装 useLazyImage hook',
    jianchuan: '建议 recommend:batch:{hash}',
    guangling: 'v2.1 准确率 +3.2%',
    xubai: '卡片视觉规范已出初版',
    mengyu: '用例覆盖率 85%',
  }
  return msgs[memberId] || ''
}

/* ===== 群聊消息 ===== */
const GROUP_MESSAGES: ChatMessage[] = [
  { id: '1', sender: 'human', content: '推荐卡片需要展示标题、封面图和推荐理由，接口需要支持批量获取 20 条。请各 Agent 协同出方案。', time: '14:30' },
  { id: '2', sender: 'agent', agentId: 'xuechen', agentName: '雪辰的 Agent', time: '14:31',
    thinking: '1. 分析需求：展示层+接口层+推理层三层协作\n2. 拆解任务：前端组件、后端接口、算法模型\n3. 指派负责人：王辰（前端）、鉴川（后端）、广苓（算法）',
    content: '已拆解需求：<b>展示层</b>（前端）+ <b>接口层</b>（后端）+ <b>推理层</b>（算法）。请 @王辰 先出组件方案，@鉴川 同步设计 API。',
    kbRefs: ['6'] },
  { id: '3', sender: 'agent', agentId: 'wangchen', agentName: '王辰的 Agent', time: '14:32', targetAgent: 'xuechen',
    thinking: '1. 评估批量渲染性能：20条数据DOM操作开销\n2. 确定方案：虚拟列表 + reason_html直接渲染\n3. 生成组件代码并打包',
    content: '建议用虚拟列表处理批量渲染，组件初版已生成。<code>reason_html</code> 直接渲染减少拼接。',
    artifact: { type: 'code', name: 'RecommendCard.tsx', preview: 'export function RecommendCard({ title, cover, reason }) {\n  return (\n    <div className="recommend-card">\n      <img src={cover} alt={title} />\n      <h3>{title}</h3>\n      <div dangerouslySetInnerHTML={{ __html: reason }} />\n    </div>\n  )\n}', kbSynced: true },
    kbRefs: ['2', '7'] },
  { id: '4', sender: 'agent', agentId: 'jianchuan', agentName: '鉴川的 Agent', time: '14:34', targetAgent: 'wangchen',
    thinking: '1. 设计批量接口：GET /api/v2/recommend/batch\n2. 定义字段：title, cover_url, reason_html, score\n3. 确认默认值：count=20，最大50\n4. 询问算法延迟数据',
    content: '接口已设计：<code>GET /api/v2/recommend/batch?count=20</code>，返回 <code>title, cover_url, reason_html, score</code>。@广苓 推理延迟多少？',
    artifact: { type: 'api', name: 'recommend-api.yaml', preview: 'paths:\n  /api/v2/recommend/batch:\n    get:\n      parameters:\n        - name: count\n          schema: { type: integer, default: 20 }', kbSynced: true },
    kbRefs: ['1'] },
  { id: '5', sender: 'agent', agentId: 'guangling', agentName: '广苓的 Agent', time: '14:36', targetAgent: 'jianchuan',
    thinking: '1. 查询模型推理性能数据：P99=118ms\n2. 计算批量延迟：20条≈350ms\n3. 建议缓存层：Redis命中率85%\n4. 打包推理脚本',
    content: 'P99 延迟 <code>120ms</code>，批量 20 条约 <code>350ms</code>。建议加 Redis 缓存层，命中率约 85%。推理脚本已打包。',
    artifact: { type: 'model', name: 'model-v2.1.tar.gz', preview: '模型: recommend-bert-v2.1\n参数量: 110M\n推理框架: ONNX Runtime\nP50: 45ms | P99: 118ms', kbSynced: true },
    kbRefs: ['3'] },
  { id: '6', sender: 'human', content: '方案不错！缓存策略我来确认，TTL 10 分钟可以吗？', time: '14:38' },
  { id: '7', sender: 'agent', agentId: 'jianchuan', agentName: '鉴川的 Agent', time: '14:39',
    thinking: '1. 评估TTL 10分钟：业务实时性 vs 缓存命中率\n2. 结论：10分钟合理，命中率85%可接受\n3. 更新缓存配置\n4. 通知产品经理更新验收标准',
    content: 'TTL 10 分钟可以，已更新缓存配置。@雪辰 请更新 PRD 验收标准。',
    kbRefs: ['1'] },
  { id: '8', sender: 'agent', agentId: 'xuechen', agentName: '雪辰的 Agent', time: '14:40',
    thinking: '1. 接收缓存策略确认：TTL 10分钟\n2. 更新PRD文档：v2.2 → v2.3\n3. 新增章节：缓存策略和性能基线验收标准\n4. 同步至知识库',
    content: 'PRD 已更新至 v2.3，新增缓存策略和性能基线验收标准。',
    artifact: { type: 'doc', name: 'PRD-v2.3.md', preview: '# 推荐系统重构 v2.3\n\n## 验收标准\n- 批量接口响应 < 500ms\n- 缓存命中率 > 80%\n- 推荐理由 HTML 渲染', kbSynced: true },
    kbRefs: ['6'] },
]

/* ===== 各成员私聊消息（四人协作空间） ===== */
const DIRECT_MESSAGES: Record<string, ChatMessage[]> = {
  wangchen: [
    /* 我发起对话 */
    { id: 'd1', sender: 'human', senderMemberId: 'xuechen', content: '王辰，推荐卡片组件进度怎么样了？', time: '15:00' },
    /* 王辰本人回复 */
    { id: 'd2', sender: 'human', senderMemberId: 'wangchen', content: '组件框架搭好了，但有个性能问题。批量渲染 20 条数据时 DOM 操作开销比较大。', time: '15:01' },
    /* 我的Agent参与 */
    { id: 'd3', sender: 'agent', agentId: 'xuechen', agentName: '雪辰的 Agent', time: '15:02',
      thinking: '1. 检测到前端组件性能瓶颈：批量渲染 20 条数据\n2. 检索知识库：找到 React 性能优化指南\n3. 建议方案：虚拟列表 + 懒加载\n4. 同步相关文档到协作空间',
      content: '检测到 RecommendCard 批量渲染可能影响首屏性能。建议参考<a href="#">虚拟列表方案</a>，同时可以考虑 <code>IntersectionObserver</code> 实现图片懒加载。', kbRefs: ['2', '7'] },
    /* 王辰的Agent参与 */
    { id: 'd4', sender: 'agent', agentId: 'wangchen', agentName: '王辰的 Agent', time: '15:03',
      thinking: '1. 分析用户问题：批量渲染性能\n2. 检索知识库：找到 useLazyImage hook 实践\n3. 生成优化方案：虚拟列表 + 懒加载 hook\n4. 预估收益：首屏请求减少 40%',
      content: '已分析，建议用虚拟列表处理批量渲染，同时我封装了 <code>useLazyImage</code> hook。20 条数据可减少约 40% 首屏请求，代码可以直接复用。',
      kbRefs: ['7'] },
    /* 我继续追问 */
    { id: 'd5', sender: 'human', senderMemberId: 'xuechen', content: '那懒加载需要吗？直接给我生成完整代码吧', time: '15:04' },
    /* 王辰回复 */
    { id: 'd6', sender: 'human', senderMemberId: 'wangchen', content: '好，我这边把 useLazyImage 和 RecommendCard 一起发你。', time: '15:05' },
    /* 王辰的Agent发代码 */
    { id: 'd7', sender: 'agent', agentId: 'wangchen', agentName: '王辰的 Agent', time: '15:06',
      thinking: '1. 接收指令：生成完整代码\n2. 编写 useLazyImage hook\n3. 补充 TypeScript 类型\n4. 编写测试用例',
      content: '已生成 hook 和测试用例，可以直接在 RecommendCard 中使用。',
      artifact: { type: 'code', name: 'useLazyImage.ts', preview: 'import { useEffect, useRef, useState } from "react"\n\nexport function useLazyImage(src: string) {\n  const ref = useRef<HTMLImageElement>(null)\n  const [loaded, setLoaded] = useState(false)\n  useEffect(() => {\n    const observer = new IntersectionObserver(...);\n    return () => observer.disconnect()\n  }, [src])\n  return { ref, loaded }\n}', kbSynced: false },
      kbRefs: ['7'] },
    /* 我的Agent做总结 */
    { id: 'd8', sender: 'agent', agentId: 'xuechen', agentName: '雪辰的 Agent', time: '15:07',
      thinking: '1. 汇总当前进展：RecommendCard 组件完成\n2. useLazyImage hook 已生成\n3. 需要同步到知识库\n4. 更新 PRD 验收标准',
      content: '已将 <code>useLazyImage</code> 方案同步到知识库，PRD v2.3 的验收标准也已更新。王辰，记得把组件代码入库后标记一下里程碑。', kbRefs: ['6'] },
  ],
  jianchuan: [
    { id: 'd1', sender: 'human', senderMemberId: 'xuechen', content: '鉴川，批量接口设计得怎么样了？', time: '15:10' },
    { id: 'd2', sender: 'human', senderMemberId: 'jianchuan', content: '接口定义完成了，你看一下 recommend-api.yaml，返回 title、cover_url、reason_html、score 四个字段。', time: '15:11' },
    { id: 'd3', sender: 'agent', agentId: 'xuechen', agentName: '雪辰的 Agent', time: '15:12',
      thinking: '1. 检测接口设计完整性\n2. 发现缺少缓存策略章节\n3. 检索知识库找到缓存最佳实践\n4. 提醒补充 Redis 方案',
      content: '检测到接口设计缺少缓存策略。建议补充 Redis 缓存层和降级方案，确保高并发下 P99 < 200ms。', kbRefs: ['1'] },
    { id: 'd4', sender: 'agent', agentId: 'jianchuan', agentName: '鉴川的 Agent', time: '15:13',
      thinking: '1. 分析缓存需求：批量接口需要缓存\n2. 设计 Redis 方案：key 命名、TTL、命中率\n3. 补充降级策略：本地缓存→限流→静态列表\n4. 生成缓存配置代码',
      content: '已补充 Redis 缓存方案：key 格式 <code>recommend:batch:{hash}</code>，TTL 10 分钟，命中率约 85%。同时设计了三层降级策略。', kbRefs: ['1'] },
    { id: 'd5', sender: 'human', senderMemberId: 'xuechen', content: '缓存 key 的命名规范你有建议吗？如果缓存雪崩怎么办？', time: '15:14' },
    { id: 'd6', sender: 'human', senderMemberId: 'jianchuan', content: 'TTL 10 分钟可以，已更新缓存配置。雪崩问题我设计了三级降级，本地缓存兜底 + 限流 + 静态列表。', time: '15:15' },
    { id: 'd7', sender: 'agent', agentId: 'jianchuan', agentName: '鉴川的 Agent', time: '15:16',
      thinking: '1. 补充缓存雪崩处理方案\n2. 三级降级：本地缓存(TTL 30s) → 限流降级 → 静态列表\n3. 生成降级策略代码',
      content: '建议三级降级：1. 本地缓存兜底（TTL 30s）；2. 限流降级返回热门推荐；3. 熔断后回退静态列表。我可以生成完整的降级策略代码。', kbRefs: ['1'] },
    { id: 'd8', sender: 'agent', agentId: 'xuechen', agentName: '雪辰的 Agent', time: '15:17',
      content: '已将缓存策略同步到 PRD v2.3，验收标准新增「缓存命中率 > 80%」。鉴川，记得把接口文档入库。', kbRefs: ['6'] },
  ],
  guangling: [
    { id: 'd1', sender: 'human', senderMemberId: 'xuechen', content: '广苓，v2.1 模型评估报告出了吗？', time: '15:20' },
    { id: 'd2', sender: 'human', senderMemberId: 'guangling', content: '出来了！准确率提升了 3.2%，推理速度快了 15%（INT8 量化）。参数量多了 20M，还在可接受范围。', time: '15:21' },
    { id: 'd3', sender: 'agent', agentId: 'xuechen', agentName: '雪辰的 Agent', time: '15:22',
      thinking: '1. 评估模型指标提升\n2. 建议灰度验证方案\n3. 设定核心 A/B 指标',
      content: '建议灰度 10% 流量做 A/B 验证。核心指标：CTR 提升（目标 >2%）、人均浏览深度、推理延迟 P99。', kbRefs: ['3'] },
    { id: 'd4', sender: 'agent', agentId: 'guangling', agentName: '广苓的 Agent', time: '15:23',
      thinking: '1. 生成推理脚本\n2. 打包模型文件\n3. 同步评估报告到知识库',
      content: '推理脚本已打包，模型文件 recommend-bert-v2.1.tar.gz 已上传。P99 延迟 118ms，批量 20 条约 350ms。', kbRefs: ['3'] },
    { id: 'd5', sender: 'human', senderMemberId: 'xuechen', content: '那 A/B 测试的核心指标定哪些？', time: '15:24' },
    { id: 'd6', sender: 'human', senderMemberId: 'guangling', content: '核心指标建议定 CTR、浏览深度、延迟 P99，次要指标可以加多样性和冷启动覆盖率。', time: '15:25' },
    { id: 'd7', sender: 'agent', agentId: 'guangling', agentName: '广苓的 Agent', time: '15:26',
      content: '建议核心指标：1. CTR 提升（目标 >2%）；2. 人均浏览深度；3. 推理延迟 P99；4. 用户停留时长。次要指标：多样性得分、冷启动覆盖率。', kbRefs: ['3'] },
    { id: 'd8', sender: 'agent', agentId: 'xuechen', agentName: '雪辰的 Agent', time: '15:27',
      content: '已将 A/B 测试指标写入 PRD 验收标准。广苓，灰度方案确认后记得更新里程碑状态。', kbRefs: ['6'] },
  ],
  xubai: [
    { id: 'd1', sender: 'human', senderMemberId: 'xuechen', content: '叙白，推荐卡片的视觉规范有初版了吗？', time: '15:40' },
    { id: 'd2', sender: 'human', senderMemberId: 'xubai', content: '初版出了，封面图 3:4 比例，圆角 12px，理由文案最多 2 行。配色跟随主题色系。', time: '15:41' },
    { id: 'd3', sender: 'agent', agentId: 'xuechen', agentName: '雪辰的 Agent', time: '15:42',
      content: '建议补充配色色值说明，方便开发直接取用。Figma 链接可以同步到知识库。', kbRefs: ['6'] },
    { id: 'd4', sender: 'agent', agentId: 'xubai', agentName: '叙白的 Agent', time: '15:43',
      content: 'Figma 链接已同步至知识库。视觉规范文档包含完整的色值、间距和圆角说明。', kbRefs: ['6'] },
  ],
  mengyu: [
    { id: 'd1', sender: 'human', senderMemberId: 'xuechen', content: '孟雨，推荐接口的自动化用例准备好了吗？', time: '16:00' },
    { id: 'd2', sender: 'human', senderMemberId: 'mengyu', content: '已覆盖 85% 的接口场景，包括正常流程、缓存命中/未命中、降级策略触发等。', time: '16:01' },
    { id: 'd3', sender: 'agent', agentId: 'xuechen', agentName: '雪辰的 Agent', time: '16:02',
      content: '建议补充边界条件和异常流量场景用例，确保覆盖率 > 90%。', kbRefs: ['1', '6'] },
    { id: 'd4', sender: 'agent', agentId: 'mengyu', agentName: '孟雨的 Agent', time: '16:03',
      content: '已补充边界测试和异常流量用例，包括超时、断网、Redis 宕机等场景。回归测试脚本已生成。', kbRefs: ['1', '6'] },
  ],
}

/* ===== 和自己的Agent对话 ===== */
const MY_AGENT_MESSAGES: ChatMessage[] = [
  { id: 'a1', sender: 'agent', agentId: 'xuechen', agentName: '雪辰的 Agent', time: '09:00',
    thinking: '1. 汇总各成员昨日进展\n2. 检查待确认事项：缓存策略、推荐理由格式、灰度比例\n3. 整理为晨报格式\n4. 提醒查看右侧面板',
    content: '早上好！今日项目进展：\n\n1. 王辰完成 RecommendCard 组件\n2. 鉴川完成 Redis 缓存集成\n3. 广苓模型评估 P99=118ms\n\n有 3 项待你确认，请查看右侧面板。',
    kbRefs: ['6'] },
  { id: 'a2', sender: 'human', content: '帮我整理一下今天的日报', time: '09:05' },
  { id: 'a3', sender: 'agent', agentId: 'xuechen', agentName: '雪辰的 Agent', time: '09:06',
    thinking: '1. 识别指令：整理今日日报\n2. 收集各成员任务状态：已完成/待完成/阻塞\n3. 分类整理为结构化日报\n4. 询问是否需要发送给团队',
    content: '已为你生成今日日报：\n\n<b>已完成</b>：更新 PRD v2.3、确认推荐理由格式、评审接口设计\n<b>待完成</b>：组织设计走查会、确认灰度方案\n<b>阻塞</b>：无\n\n需要我帮你发送给团队吗？',
    kbRefs: ['6'] },
  { id: 'a4', sender: 'human', content: '帮我检查一下 PRD 的验收标准是否完整', time: '10:30' },
  { id: 'a5', sender: 'agent', agentId: 'xuechen', agentName: '雪辰的 Agent', time: '10:31',
    thinking: '1. 读取PRD v2.3验收标准章节\n2. 逐项检查完整性：性能指标、加载指标、业务指标\n3. 识别缺失项：异常场景兜底策略未覆盖\n4. 生成检查报告',
    content: 'PRD v2.3 验收标准检查完成：\n\n✅ 接口 P99 < 200ms（有具体数值）\n✅ 首屏加载 < 1.5s\n✅ CTR 提升 > 2%\n⚠️ <b>建议补充</b>：异常场景下的兜底策略验收标准\n\n要我现在帮你补充吗？',
    kbRefs: ['6'] },
]

/* ===== Agent 任务状态 ===== */
const AGENT_TASKS = [
  { memberId: 'wangchen', task: '推荐卡片组件', status: 'done' },
  { memberId: 'jianchuan', task: '批量接口 + 缓存', status: 'running' },
  { memberId: 'guangling', task: '推理脚本打包', status: 'done' },
  { memberId: 'xubai', task: '卡片视觉规范', status: 'running' },
  { memberId: 'mengyu', task: '接口测试用例', status: 'done' },
]

export default function AgentChat({ targetConv, onConvChange }: { targetConv?: string; onConvChange?: (convId: string) => void }) {
  const { members, agents, pendingItems, kbDocs, channels, loading } = useTeamData()
  if (loading) return <div>加载中...</div>
  const CONVERSATIONS = buildConversations(members)

  const [activeConv, setActiveConv] = useState(targetConv || 'group')
  const [allMessages, setAllMessages] = useState<Record<string, ChatMessage[]>>({
    group: GROUP_MESSAGES, ...DIRECT_MESSAGES, 'my-agent': MY_AGENT_MESSAGES,
  })
  const [inputValue, setInputValue] = useState('')
  const [pending, setPending] = useState<PendingItem[]>(pendingItems)
  const [mentionIndex, setMentionIndex] = useState(0)
  const chatRef = useRef<HTMLDivElement>(null)
  const modal = useModal()
  const [expandedThinking, setExpandedThinking] = useState<Set<string>>(new Set())
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadMode, setUploadMode] = useState<'file' | 'kb'>('file')
  const [uploadFileName, setUploadFileName] = useState('')
  const [kbTarget, setKbTarget] = useState<'personal' | 'team'>('team')
  const [selectedKbDoc, setSelectedKbDoc] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const switchConv = (id: string) => {
    setActiveConv(id)
    onConvChange?.(id)
  }

  /* 接收外部跳转指令 */
  useEffect(() => {
    if (targetConv && targetConv !== activeConv && CONVERSATIONS.find(c => c.id === targetConv)) {
      setActiveConv(targetConv)
    }
  }, [targetConv])

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight
  }, [allMessages, activeConv])

  /* @ 提及选项 */
  interface MentionOption { label: string; value: string; type: string; memberId: string }
  const MENTION_OPTIONS: MentionOption[] = members.flatMap(m => [
    { label: m.name, value: `@${m.name}`, type: '人', memberId: m.id },
    { label: `${m.name}的 Agent`, value: `@${m.name}的 Agent`, type: 'Agent', memberId: m.id },
    { label: `${m.name} & Agent`, value: `@${m.name} & Agent`, type: '人和Agent', memberId: m.id },
  ])

  const mentionMatch = inputValue.match(/(?:^|\s)@([^ ]*)$/)
  const mentionQuery = mentionMatch ? mentionMatch[1] : ''
  const mentionMembers = mentionMatch !== null
    ? members.filter(m => m.name.toLowerCase().includes(mentionQuery.toLowerCase()))
    : []
  const showMention = mentionMembers.length > 0

  const insertMention = (option: MentionOption) => {
    const lastAt = inputValue.lastIndexOf('@')
    const before = inputValue.slice(0, lastAt)
    setInputValue(before + option.value + ' ')
    setMentionIndex(0)
  }

  const currentConv = CONVERSATIONS.find(c => c.id === activeConv)!
  const currentMsgs = allMessages[activeConv] || []
  const activePending = pending.filter(p => p.status === 'pending')
  const isGroup = currentConv.type === 'group'
  const isMyAgent = currentConv.type === 'myagent'

  const [msgFeedback, setMsgFeedback] = useState<Record<string, { feedback: 'like' | 'dislike'; type?: 'question' | 'error' }>>({})

  const toggleThinking = (msgId: string) => {
    setExpandedThinking(prev => {
      const next = new Set(prev)
      if (next.has(msgId)) next.delete(msgId)
      else next.add(msgId)
      return next
    })
  }

  function generateAgentReply(_convId: string, userText: string): { thinking: string; content: string; kbRefs: string[] } {
    const text = userText.toLowerCase()
    if (text.includes('缓存') || text.includes('redis') || text.includes('雪崩')) {
      return {
        thinking: `1. 识别关键词：用户询问缓存相关问题\n2. 检索知识库：找到 Redis 配置文档和缓存策略设计\n3. 评估当前状态：批量接口已集成缓存，TTL 10 分钟\n4. 分析风险点：缓存雪崩、缓存穿透、缓存击穿\n5. 生成建议：补充三级降级方案`,
        content: '缓存策略方面，建议采用三级降级方案：\n\n1. <b>Redis 缓存层</b>：TTL 10 分钟，命中率约 85%\n2. <b>本地缓存兜底</b>：Caffeine，TTL 30 秒\n3. <b>限流降级</b>：返回热门推荐列表\n4. <b>熔断回退</b>：静态推荐列表兜底\n\n需要我生成完整的降级策略代码吗？',
        kbRefs: ['1']
      }
    }
    if (text.includes('测试') || text.includes('用例') || text.includes('覆盖率')) {
      return {
        thinking: `1. 识别意图：用户关注测试覆盖度\n2. 检查当前进度：已覆盖 85% 接口场景\n3. 分析缺口：边界条件和异常流量场景待补充\n4. 检索测试规范：找到接口测试标准文档\n5. 生成建议：补充边界测试和性能测试`,
        content: '目前接口测试覆盖 85%，建议补充以下场景：\n\n- <b>边界条件</b>：count=0、count=1000、空参数\n- <b>异常流量</b>：超时、断网、Redis 宕机\n- <b>性能测试</b>：并发 1000 QPS 下的响应时间\n- <b>A/B 验证</b>：灰度流量切换验证\n\n我可以帮你生成这些用例的骨架代码。',
        kbRefs: ['1', '6']
      }
    }
    if (text.includes('模型') || text.includes('算法') || text.includes('准确率')) {
      return {
        thinking: `1. 识别关键词：用户询问模型/算法相关问题\n2. 检索知识库：找到模型 v2.1 评估报告\n3. 对比版本差异：v2.1 vs v2.0 准确率 +3.2%\n4. 评估部署状态：建议灰度 10% 流量做 A/B 验证\n5. 生成回复：给出核心指标建议`,
        content: 'v2.1 模型评估结果如下：\n\n- <b>准确率</b>：+3.2%（vs v2.0）\n- <b>推理速度</b>：快 15%（INT8 量化）\n- <b>参数量</b>：110M（多 20M）\n- <b>部署建议</b>：灰度 10% 流量做 A/B 验证\n\n建议核心指标：CTR 提升（目标 >2%）、人均浏览深度、推理延迟 P99。',
        kbRefs: ['3']
      }
    }
    if (text.includes('ui') || text.includes('视觉') || text.includes('设计') || text.includes('样式')) {
      return {
        thinking: `1. 识别关键词：用户询问 UI/视觉相关问题\n2. 检索设计规范：找到卡片视觉规范初版\n3. 检查组件状态：RecommendCard 组件已封装\n4. 评估一致性：封面图 3:4、圆角 12px、理由文案最多 2 行\n5. 生成回复：给出设计规范要点`,
        content: '推荐卡片视觉规范初版已确定：\n\n- <b>封面图</b>：3:4 比例，懒加载\n- <b>圆角</b>：12px\n- <b>理由文案</b>：最多 2 行\n- <b>配色</b>：跟随主题色系\n\nFigma 链接已同步至知识库，需要我帮你检查组件实现是否符合规范吗？',
        kbRefs: ['2', '6']
      }
    }
    if (text.includes('日报') || text.includes('总结') || text.includes('进展')) {
      return {
        thinking: `1. 识别意图：用户需要日报或进展总结\n2. 汇总项目状态：RecommendCard 完成、缓存集成中、模型评估完成\n3. 识别阻塞点：目前无明显阻塞\n4. 生成今日待办：组织设计走查会、确认灰度方案\n5. 整理输出：生成结构化日报`,
        content: '今日项目进展汇总：\n\n<b>已完成</b>：\n- 王辰：RecommendCard 组件封装 + useLazyImage hook\n- 鉴川：Redis 缓存集成（批量接口）\n- 广苓：模型 v2.1 评估（P99=118ms）\n\n<b>待完成</b>：\n- 组织设计走查会\n- 确认灰度方案\n\n<b>阻塞</b>：无\n\n需要我帮你发送给团队吗？',
        kbRefs: ['6']
      }
    }
    return {
      thinking: `1. 理解用户意图：分析输入内容「${userText}」\n2. 检索相关上下文：查看项目文档和当前任务状态\n3. 评估影响范围：判断涉及哪些模块和人员\n4. 生成行动建议：给出具体的下一步操作`,
      content: `收到，我来帮你处理「${userText}」。\n\n我已经分析了当前项目状态和知识库，建议按以下步骤推进：\n\n1. 先确认需求范围和验收标准\n2. 同步给相关模块负责人评估\n3. 产出具体方案后走评审流程\n\n有什么具体细节需要我进一步分析吗？`,
      kbRefs: ['6']
    }
  }

  const handleSend = () => {
    if (!inputValue.trim()) return
    const convId = activeConv
    const msg: ChatMessage = {
      id: Date.now().toString(), sender: 'human', senderMemberId: 'xuechen', content: inputValue,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    }
    setAllMessages(prev => ({ ...prev, [convId]: [...(prev[convId] || []), msg] }))
    setInputValue('')

    // 模拟 Agent 思考过程
    const thinkingId = Date.now().toString() + '_t'
    const agentId = convId === 'group' ? 'xuechen' : convId === 'my-agent' ? 'xuechen' : convId
    const agent = agents.find(a => a.id === agentId)
    const agentName = agent?.name || 'Agent'

    const thinkingMsg: ChatMessage = {
      id: thinkingId,
      sender: 'agent',
      agentId,
      agentName,
      content: '...',
      time: msg.time,
      isThinking: true,
    }

    setAllMessages(prev => ({ ...prev, [convId]: [...(prev[convId] || []), thinkingMsg] }))

    setTimeout(() => {
      const reply = generateAgentReply(convId, msg.content)
      const finalMsg: ChatMessage = {
        id: Date.now().toString(),
        sender: 'agent',
        agentId,
        agentName,
        content: reply.content,
        thinking: reply.thinking,
        kbRefs: reply.kbRefs,
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      }
      setAllMessages(prev => ({
        ...prev,
        [convId]: prev[convId].map(m => m.id === thinkingId ? finalMsg : m)
      }))
    }, 2500)
  }

  const handleLike = (msgId: string) => {
    setMsgFeedback(prev => ({ ...prev, [msgId]: { feedback: 'like' } }))
  }

  const handleDislike = (msgId: string) => {
    modal.open('反馈标记', (
      <div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
          该回复存在什么问题？标记后将在「配置与资产」中由管辖人审核。
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className="btn btn-secondary"
            style={{ flex: 1 }}
            onClick={() => { setMsgFeedback(prev => ({ ...prev, [msgId]: { feedback: 'dislike', type: 'question' } })); modal.close() }}
          >
            有疑问
          </button>
          <button
            className="btn btn-danger"
            style={{ flex: 1 }}
            onClick={() => { setMsgFeedback(prev => ({ ...prev, [msgId]: { feedback: 'dislike', type: 'error' } })); modal.close() }}
          >
            有错误
          </button>
        </div>
        <div className="modal-actions" style={{ marginTop: 12 }}>
          <button className="btn btn-secondary" onClick={modal.close}>取消</button>
        </div>
      </div>
    ))
  }

  const openArtifactModal = (art: NonNullable<ChatMessage['artifact']>) => {
    modal.open(art.name, (
      <div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
          <Tag variant="blue">{art.type}</Tag>
          {art.kbSynced && <Tag variant="green">已同步至知识库</Tag>}
        </div>
        <div className="code-block" style={{ fontSize: 12, maxHeight: 300, overflow: 'auto' }}>{art.preview}</div>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={modal.close}>关闭</button>
          {art.kbSynced
            ? <button className="btn btn-primary" onClick={modal.close}>在知识库中查看</button>
            : <button className="btn btn-primary" onClick={modal.close}>同步至知识库</button>}
        </div>
      </div>
    ))
  }

  /* 分组对话列表 */
  const teamConvs = CONVERSATIONS.filter(c => c.group === 'team')
  const directConvs = CONVERSATIONS.filter(c => c.group === 'direct')
  const myAgentConvs = CONVERSATIONS.filter(c => c.group === 'myagent')

  const renderConvItem = (conv: Conversation) => {
    const isActive = conv.id === activeConv
    const member = conv.memberId ? members.find(m => m.id === conv.memberId) : null
    return (
      <div
        key={conv.id}
        className={`conv-item${isActive ? ' active' : ''}`}
        onClick={() => switchConv(conv.id)}
      >
        <div className="conv-item-icon">{conv.icon}</div>
        <div className="conv-item-body">
          <div className="conv-item-name">
            {conv.name}
            {member && <span className={`conv-online-dot${member.agent.online ? ' online' : ''}`} />}
            {conv.type === 'myagent' && <span className="conv-myagent-badge">我的</span>}
          </div>
          <div className="conv-item-preview">{conv.lastMsg}</div>
        </div>
        {conv.unread > 0 && <span className="conv-unread">{conv.unread}</span>}
      </div>
    )
  }

  return (
    <div className="fade-in chat-layout">
      {/* ===== 左侧：对话列表（分组） ===== */}
      <div className="conv-sidebar">
        {/* 全员协作 */}
        <div className="conv-sidebar-header">👥 全员协作</div>
        {teamConvs.map(renderConvItem)}

        {/* 单点人员&Agent协作 */}
        <div className="conv-sidebar-header">💬 人员 & Agent</div>
        {directConvs.map(renderConvItem)}

        {/* 和自己的Agent协作 */}
        <div className="conv-sidebar-header">🤖 我的 Agent</div>
        {myAgentConvs.map(renderConvItem)}

        {/* Agent 任务状态 */}
        <div className="conv-tasks-section">
          <div className="conv-tasks-title">Agent 任务</div>
          {AGENT_TASKS.map((t, i) => {
            const member = members.find(m => m.id === t.memberId)
            return (
              <div key={i} className="conv-task-item">
                <span>{member?.agent.icon}</span>
                <span className="conv-task-name">{t.task}</span>
                <span className={`conv-task-dot ${t.status}`} />
              </div>
            )
          })}
        </div>
      </div>

      {/* ===== 右侧：对话内容区 ===== */}
      <div className="conv-main">
        {/* 对话头部 */}
        <div className="conv-header">
          {!isGroup && !isMyAgent && (
            <button className="conv-back-btn" onClick={() => switchConv('group')}>
              ← 返回群聊
            </button>
          )}
          {isMyAgent && (
            <button className="conv-back-btn" onClick={() => switchConv('group')}>
              ← 返回群聊
            </button>
          )}
          <div className="conv-header-info">
            <span className="conv-header-icon">{currentConv.icon}</span>
            <span className="conv-header-name">{currentConv.name}</span>
            {isGroup && <span className="conv-header-count">{members.length} 人协作</span>}
            {!isGroup && currentConv.memberId && !isMyAgent && (
              <span className="conv-header-owner">{members.find(m => m.id === currentConv.memberId)?.role}</span>
            )}
            {isMyAgent && <Tag variant="purple">专属助手</Tag>}
          </div>
          <div style={{ flex: 1 }} />
          {/* 待确认入口 */}
          {activePending.length > 0 && (
            <button className="btn btn-xs btn-warning" onClick={() => {
              modal.open(`待确认事项 (${activePending.length})`, (
                <div>
                  {pending.map(p => (
                    <div key={p.id} className={`pending-item${p.status !== 'pending' ? ' resolved' : ''}`} style={{ marginBottom: 8 }}>
                      <div className="pending-item-header">
                        <span className="pending-item-title">{p.title}</span>
                        {p.status === 'approved' && <Tag variant="green">已批准</Tag>}
                        {p.status === 'rejected' && <Tag variant="red">已拒绝</Tag>}
                      </div>
                      <div className="pending-item-desc">{p.desc}</div>
                      <div className="pending-item-assigner">
                        指派方：{p.assignerIcon && <span>{p.assignerIcon} </span>}{p.assigner}
                      </div>
                      {p.status === 'pending' && (
                        <div className="pending-item-actions">
                          <button className="btn btn-xs btn-success" onClick={() => setPending(prev => prev.map(x => x.id === p.id ? { ...x, status: 'approved' } : x))}>批准</button>
                          <button className="btn btn-xs btn-danger" onClick={() => setPending(prev => prev.map(x => x.id === p.id ? { ...x, status: 'rejected' } : x))}>拒绝</button>
                        </div>
                      )}
                    </div>
                  ))}
                  <div className="modal-actions"><button className="btn btn-primary" onClick={modal.close}>关闭</button></div>
                </div>
              ))
            }}>
              ⚠ {activePending.length} 项待确认
            </button>
          )}
        </div>

        {/* 消息列表 */}
        <div className="chat-messages" ref={chatRef}>
          {/* 对话类型提示 */}
          <div className="conv-type-hint">
            {isGroup
              ? '📢 全员群聊 — 所有成员的 Agent 可相互交互，你也可以参与讨论'
              : isMyAgent
                ? '🤖 我的 Agent — 你的专属助手，可帮你整理日报、审阅文档、提醒待办'
                : `💬 与 ${currentConv.name} 的对话 — 你和对方 + 双方 Agent 可见`}
          </div>
          {currentMsgs.map(msg => {
            const agent = agents.find(a => a.id === (msg.agentId || ''))
            const senderMember = msg.senderMemberId ? members.find(m => m.id === msg.senderMemberId) : null
            const targetInfo = msg.targetAgent ? agents.find(a => a.id === msg.targetAgent) : null
            const isMe = msg.sender === 'human' && (!msg.senderMemberId || msg.senderMemberId === 'xuechen')
            const isOtherHuman = msg.sender === 'human' && msg.senderMemberId && msg.senderMemberId !== 'xuechen'
            return (
              <div key={msg.id} className={`chat-msg ${msg.sender}${msg.sender === 'agent' && msg.thinking && expandedThinking.has(msg.id) ? ' thinking-expanded' : ''}${isOtherHuman ? ' other-human' : ''}`}>
                {/* Agent 头像 */}
                {msg.sender === 'agent' && <div className="chat-msg-avatar">{agent?.icon || '🤖'}</div>}
                {/* 对方人类头像 */}
                {isOtherHuman && <div className="chat-msg-avatar">{senderMember?.name.charAt(0) || '👤'}</div>}
                {/* 我的头像（可选，也可以不显示） */}
                {isMe && <div className="chat-msg-avatar">你</div>}
                <div className="chat-msg-body">
                  <div className="chat-msg-header">
                    <span className="chat-msg-name">
                      {msg.sender === 'agent' ? msg.agentName : isMe ? '雪辰（你）' : senderMember?.name || '雪辰（你）'}
                    </span>
                    {msg.sender === 'agent' && agent?.owner && <span className="chat-msg-owner">{agent.owner}</span>}
                    {isOtherHuman && <span className="chat-msg-owner">{senderMember?.role}</span>}
                    {targetInfo && <span className="chat-msg-target">→ {targetInfo.icon} {targetInfo.owner}</span>}
                    <span className="chat-msg-time">{msg.time}</span>
                  </div>

                  {/* 思考中状态 */}
                  {msg.sender === 'agent' && msg.isThinking && (
                    <div className="chat-msg-thinking">
                      <div className="thinking-dots"><span /><span /><span /></div>
                      <span>Agent 正在思考...</span>
                    </div>
                  )}

                  {/* 消息内容 */}
                  {!msg.isThinking && (
                    <div className="chat-msg-bubble-wrap">
                      <div className="chat-msg-content" dangerouslySetInnerHTML={{ __html: msg.content }} />
                      {msg.sender === 'agent' && msg.thinking && !msg.isThinking && (
                        <button className={`chat-thinking-trigger-bubble${expandedThinking.has(msg.id) ? ' active' : ''}`} onClick={() => toggleThinking(msg.id)} title="思考过程">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z"/>
                            <path d="M9 21h6"/>
                          </svg>
                        </button>
                      )}
                    </div>
                  )}

                  {/* 消息框内展开的思考过程 */}
                  {msg.sender === 'agent' && msg.thinking && !msg.isThinking && expandedThinking.has(msg.id) && (
                    <div className="chat-thinking-fold">
                      {msg.thinking.split('\n').map((line, i) => (
                        line.trim() ? <div key={i} className="chat-thinking-fold-line">{line}</div> : null
                      ))}
                    </div>
                  )}

                  {/* KB 引用 */}
                  {msg.sender === 'agent' && msg.kbRefs && msg.kbRefs.length > 0 && !msg.isThinking && (
                    <div className="chat-kb-refs">
                      <span className="chat-kb-refs-label">📚 引用了知识库</span>
                      <div className="chat-kb-refs-list">
                        {msg.kbRefs.map(refId => {
                          const doc = kbDocs.find(d => d.id === refId)
                          return doc ? (
                            <span key={refId} className="chat-kb-ref-chip" title={doc.desc}>
                              {doc.title}
                            </span>
                          ) : null
                        })}
                      </div>
                    </div>
                  )}

                  {/* 附件 */}
                  {msg.attachment && (
                    <div className="chat-artifact" style={{ marginTop: 6 }}>
                      <span className="chat-artifact-icon">📎</span>
                      <div style={{ flex: 1 }}>
                        <div className="chat-artifact-name">{msg.attachment.name}</div>
                        <div className="chat-artifact-type">{msg.attachment.kbTarget === 'personal' ? '个人知识库' : '团队知识库'}</div>
                      </div>
                    </div>
                  )}

                  {/* 反馈 */}
                  {msg.sender === 'agent' && !msg.isThinking && (
                    <div className="chat-msg-feedback">
                      <button
                        className={`chat-msg-feedback-btn${msgFeedback[msg.id]?.feedback === 'like' ? ' active-like' : ''}`}
                        onClick={() => handleLike(msg.id)}
                        title="有用"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"/></svg>
                      </button>
                      <button
                        className={`chat-msg-feedback-btn${msgFeedback[msg.id]?.feedback === 'dislike' ? ' active-dislike' : ''}`}
                        onClick={() => handleDislike(msg.id)}
                        title="有问题"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 14V2"/><path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z"/></svg>
                        {msgFeedback[msg.id]?.feedback === 'dislike' && msgFeedback[msg.id]?.type && (
                          <span style={{ fontSize: 10 }}>{msgFeedback[msg.id]?.type === 'question' ? '疑问' : '错误'}</span>
                        )}
                      </button>
                    </div>
                  )}

                  {msg.artifact && (
                    <div className="chat-artifact" onClick={() => openArtifactModal(msg.artifact!)}>
                      <span className="chat-artifact-icon">
                        {msg.artifact.type === 'code' ? '📄' : msg.artifact.type === 'api' ? '🔗' : msg.artifact.type === 'model' ? '🧠' : '📎'}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div className="chat-artifact-name">{msg.artifact.name}</div>
                        <div className="chat-artifact-type">{msg.artifact.type}</div>
                      </div>
                      {msg.artifact.kbSynced && <Tag variant="green">已入库</Tag>}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* 输入区 */}
        <div className="chat-input-area" style={{ position: 'relative' }}>
          {showMention && (
            <div className="chat-mention-dropdown">
              {mentionMembers.map((m, i) => (
                <div
                  key={m.id}
                  className={`chat-mention-row${i === mentionIndex ? ' active' : ''}`}
                  onMouseEnter={() => setMentionIndex(i)}
                >
                  <span className="chat-mention-name">
                    <span className="chat-mention-avatar">{m.agent.icon}</span>
                    {m.name}
                  </span>
                  <span className="chat-mention-tags">
                    {MENTION_OPTIONS.filter(o => o.memberId === m.id).map(opt => (
                      <span
                        key={opt.type}
                        className="chat-mention-tag"
                        onClick={(e) => { e.stopPropagation(); insertMention(opt) }}
                      >
                        {opt.type}
                      </span>
                    ))}
                  </span>
                </div>
              ))}
            </div>
          )}
          <div className="chat-input-toolbar">
            <button className="chat-input-tool-btn" title="发送文件" onClick={() => { setUploadMode('file'); setShowUploadModal(true); setUploadFileName(''); setSelectedKbDoc(''); setKbTarget('team') }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              style={{ display: 'none' }}
              onChange={e => {
                const file = e.target.files?.[0]
                if (file) { setUploadFileName(file.name); setKbTarget('team'); setUploadMode('file'); setShowUploadModal(true) }
              }}
            />
            {uploadFileName && (
              <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                待发送: {uploadFileName}
                <span style={{ cursor: 'pointer', marginLeft: 4, color: 'var(--red)' }} onClick={() => setUploadFileName('')}>×</span>
              </span>
            )}
          </div>
          <div className="chat-input-row">
            <input
              className="chat-input" value={inputValue}
              onChange={e => { setInputValue(e.target.value); setMentionIndex(0) }}
              onKeyDown={e => {
                if (showMention) {
                  if (e.key === 'ArrowDown') { e.preventDefault(); setMentionIndex(i => (i + 1) % mentionMembers.length) }
                  if (e.key === 'ArrowUp') { e.preventDefault(); setMentionIndex(i => (i - 1 + mentionMembers.length) % mentionMembers.length) }
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    const member = mentionMembers[mentionIndex]
                    const opt = MENTION_OPTIONS.find(o => o.memberId === member.id && o.type === '人')
                    if (opt) insertMention(opt)
                  }
                  if (e.key === 'Escape') { e.preventDefault(); const lastAt = inputValue.lastIndexOf('@'); setInputValue(inputValue.slice(0, lastAt) + inputValue.slice(lastAt + 1)) }
                  return
                }
                if (e.key === 'Enter') handleSend()
              }}
              placeholder={isGroup ? '发送到群聊，所有成员的 Agent 都能看到...' : isMyAgent ? '向你的 Agent 提问或下达任务...' : `和 ${currentConv.name} 说...`}
            />
            <button className="btn btn-primary btn-sm" onClick={handleSend}>发送</button>
          </div>
        </div>

        {/* 文件上传弹窗 */}
        {showUploadModal && (
          <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
            <div className="modal-panel" onClick={e => e.stopPropagation()} style={{ maxWidth: 440 }}>
              <div className="modal-header">
                <h3 className="modal-title">发送文件</h3>
                <button className="modal-close" onClick={() => setShowUploadModal(false)}>×</button>
              </div>
              <div className="modal-body">
                {/* 模式切换 */}
                <div className="modal-tabs">
                  <button className={`modal-tab${uploadMode === 'file' ? ' active' : ''}`} onClick={() => setUploadMode('file')}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                    上传本地文件
                  </button>
                  <button className={`modal-tab${uploadMode === 'kb' ? ' active' : ''}`} onClick={() => setUploadMode('kb')}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                    选择知识库文档
                  </button>
                </div>

                {uploadMode === 'file' && (
                  <div>
                    <div
                      className={`modal-upload-zone${uploadFileName ? ' has-file' : ''}`}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {uploadFileName ? (
                        <>
                          <div className="modal-upload-icon">📄</div>
                          <div className="modal-upload-text">{uploadFileName}</div>
                          <div className="modal-upload-hint">点击更换文件</div>
                        </>
                      ) : (
                        <>
                          <div className="modal-upload-icon">📎</div>
                          <div className="modal-upload-text">点击选择本地文件</div>
                          <div className="modal-upload-hint">支持 PDF、Word、图片、代码文件</div>
                        </>
                      )}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 10, marginTop: 16 }}>存入知识库</div>
                    <div className="modal-option-cards">
                      <div
                        className={`modal-option-card${kbTarget === 'personal' ? ' selected' : ''}`}
                        onClick={() => setKbTarget('personal')}
                      >
                        <input type="radio" className="modal-option-radio" checked={kbTarget === 'personal'} readOnly />
                        个人知识库
                      </div>
                      <div
                        className={`modal-option-card${kbTarget === 'team' ? ' selected' : ''}`}
                        onClick={() => setKbTarget('team')}
                      >
                        <input type="radio" className="modal-option-radio" checked={kbTarget === 'team'} readOnly />
                        团队知识库
                      </div>
                    </div>
                  </div>
                )}

                {uploadMode === 'kb' && (
                  <div className="modal-doc-list">
                    {kbDocs.map(doc => (
                      <div
                        key={doc.id}
                        className={`modal-doc-item${selectedKbDoc === doc.id ? ' selected' : ''}`}
                        onClick={() => setSelectedKbDoc(doc.id)}
                      >
                        <div className="modal-doc-title">{doc.title}</div>
                        <div className="modal-doc-meta">
                          <span>{doc.author.name}（{doc.author.role}）</span>
                          {doc.agentName && <span style={{ color: 'var(--accent)' }}>{doc.agentName}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowUploadModal(false)}>取消</button>
                <button className="btn btn-primary" onClick={() => {
                  setShowUploadModal(false)
                  const convId = activeConv
                  if (uploadMode === 'file' && uploadFileName) {
                    const msg: ChatMessage = {
                      id: Date.now().toString(), sender: 'human', content: inputValue.trim() || `发送文件: ${uploadFileName}`,
                      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
                      attachment: { name: uploadFileName, size: '--', kbTarget },
                    }
                    setAllMessages(prev => ({ ...prev, [convId]: [...(prev[convId] || []), msg] }))
                    setInputValue('')
                    setUploadFileName('')
                  } else if (uploadMode === 'kb' && selectedKbDoc) {
                    const doc = kbDocs.find(d => d.id === selectedKbDoc)
                    if (doc) {
                      const msg: ChatMessage = {
                        id: Date.now().toString(), sender: 'human', content: inputValue.trim() || `引用知识库: ${doc.title}`,
                        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
                        attachment: { name: doc.title, size: '--', kbTarget: 'team' },
                      }
                      setAllMessages(prev => ({ ...prev, [convId]: [...(prev[convId] || []), msg] }))
                      setInputValue('')
                      setSelectedKbDoc('')
                    }
                  }
                }}>
                  确认发送
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {modal.render()}
    </div>
  )
}
