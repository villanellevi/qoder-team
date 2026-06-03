import { useState, useRef, useEffect } from 'react'
import { Tag, useModal } from '../components/ui'
import { getAgent, MEMBERS, getMember, INITIAL_PENDING } from '../data'
import type { ChatMessage, Conversation, PendingItem } from '../types'

/* 从 MEMBERS 动态生成对话列表 */
function buildConversations(): Conversation[] {
  const convs: Conversation[] = [
    { id: 'group', type: 'group', name: '全员群聊', icon: '👥', lastMsg: 'PRD 已更新至 v2.3', unread: 0, group: 'team' },
  ]
  // 单点人员&Agent协作
  MEMBERS.filter(m => !m.isMe).forEach(m => {
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
  const me = MEMBERS.find(m => m.isMe)
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

const CONVERSATIONS = buildConversations()

/* ===== 群聊消息 ===== */
const GROUP_MESSAGES: ChatMessage[] = [
  { id: '1', sender: 'human', content: '推荐卡片需要展示标题、封面图和推荐理由，接口需要支持批量获取 20 条。请各 Agent 协同出方案。', time: '14:30' },
  { id: '2', sender: 'agent', agentId: 'xuechen', agentName: '雪辰的 Agent', time: '14:31',
    content: '已拆解需求：<b>展示层</b>（前端）+ <b>接口层</b>（后端）+ <b>推理层</b>（算法）。请 @王辰 先出组件方案，@鉴川 同步设计 API。' },
  { id: '3', sender: 'agent', agentId: 'wangchen', agentName: '王辰的 Agent', time: '14:32', targetAgent: 'xuechen',
    content: '建议用虚拟列表处理批量渲染，组件初版已生成。<code>reason_html</code> 直接渲染减少拼接。',
    artifact: { type: 'code', name: 'RecommendCard.tsx', preview: 'export function RecommendCard({ title, cover, reason }) {\n  return (\n    <div className="recommend-card">\n      <img src={cover} alt={title} />\n      <h3>{title}</h3>\n      <div dangerouslySetInnerHTML={{ __html: reason }} />\n    </div>\n  )\n}', kbSynced: true } },
  { id: '4', sender: 'agent', agentId: 'jianchuan', agentName: '鉴川的 Agent', time: '14:34', targetAgent: 'wangchen',
    content: '接口已设计：<code>GET /api/v2/recommend/batch?count=20</code>，返回 <code>title, cover_url, reason_html, score</code>。@广苓 推理延迟多少？',
    artifact: { type: 'api', name: 'recommend-api.yaml', preview: 'paths:\n  /api/v2/recommend/batch:\n    get:\n      parameters:\n        - name: count\n          schema: { type: integer, default: 20 }', kbSynced: true } },
  { id: '5', sender: 'agent', agentId: 'guangling', agentName: '广苓的 Agent', time: '14:36', targetAgent: 'jianchuan',
    content: 'P99 延迟 <code>120ms</code>，批量 20 条约 <code>350ms</code>。建议加 Redis 缓存层，命中率约 85%。推理脚本已打包。',
    artifact: { type: 'model', name: 'model-v2.1.tar.gz', preview: '模型: recommend-bert-v2.1\n参数量: 110M\n推理框架: ONNX Runtime\nP50: 45ms | P99: 118ms', kbSynced: true } },
  { id: '6', sender: 'human', content: '方案不错！缓存策略我来确认，TTL 10 分钟可以吗？', time: '14:38' },
  { id: '7', sender: 'agent', agentId: 'jianchuan', agentName: '鉴川的 Agent', time: '14:39',
    content: 'TTL 10 分钟可以，已更新缓存配置。@雪辰 请更新 PRD 验收标准。' },
  { id: '8', sender: 'agent', agentId: 'xuechen', agentName: '雪辰的 Agent', time: '14:40',
    content: 'PRD 已更新至 v2.3，新增缓存策略和性能基线验收标准。',
    artifact: { type: 'doc', name: 'PRD-v2.3.md', preview: '# 推荐系统重构 v2.3\n\n## 验收标准\n- 批量接口响应 < 500ms\n- 缓存命中率 > 80%\n- 推荐理由 HTML 渲染', kbSynced: true } },
]

/* ===== 各成员私聊消息 ===== */
const DIRECT_MESSAGES: Record<string, ChatMessage[]> = {
  wangchen: [
    { id: 's1', sender: 'human', content: '推荐卡片封面图需要做懒加载吗？', time: '15:00' },
    { id: 's2', sender: 'agent', agentId: 'wangchen', agentName: '王辰的 Agent', time: '15:01',
      content: '建议用 Intersection Observer，我已封装了 <code>useLazyImage</code> hook。20 条数据可减少约 40% 首屏请求。' },
    { id: 's3', sender: 'human', content: '好的，帮我生成一下完整代码', time: '15:02' },
    { id: 's4', sender: 'agent', agentId: 'wangchen', agentName: '王辰的 Agent', time: '15:03',
      content: '已生成 hook 和测试用例，可以直接在 RecommendCard 中使用。',
      artifact: { type: 'code', name: 'useLazyImage.ts', preview: 'import { useEffect, useRef, useState } from "react"\n\nexport function useLazyImage(src: string) {\n  const ref = useRef<HTMLImageElement>(null)\n  const [loaded, setLoaded] = useState(false)\n  useEffect(() => {\n    const observer = new IntersectionObserver(...);\n    return () => observer.disconnect()\n  }, [src])\n  return { ref, loaded }\n}', kbSynced: false } },
  ],
  jianchuan: [
    { id: 's1', sender: 'human', content: 'Redis 缓存 key 的命名规范你有建议吗？', time: '15:10' },
    { id: 's2', sender: 'agent', agentId: 'jianchuan', agentName: '鉴川的 Agent', time: '15:11',
      content: '建议用 <code>recommend:batch:{hash}</code> 格式，hash 基于请求参数生成。TTL 10 分钟。既保证命中率又不会缓存过期数据。' },
    { id: 's3', sender: 'human', content: '如果缓存雪崩怎么办？有降级方案吗？', time: '15:13' },
    { id: 's4', sender: 'agent', agentId: 'jianchuan', agentName: '鉴川的 Agent', time: '15:14',
      content: '建议三级降级：1. 本地缓存兜底（TTL 30s）；2. 限流降级返回热门推荐；3. 熔断后回退静态列表。我可以生成降级策略代码。' },
  ],
  guangling: [
    { id: 's1', sender: 'human', content: '模型 v2.1 和 v2.0 效果差异大吗？', time: '15:20' },
    { id: 's2', sender: 'agent', agentId: 'guangling', agentName: '广苓的 Agent', time: '15:21',
      content: 'v2.1 vs v2.0：准确率 +3.2%，推理速度快 15%（INT8 量化），参数量多 20M。建议灰度 10% 流量做 A/B 验证。' },
    { id: 's3', sender: 'human', content: '那 A/B 测试的核心指标定哪些？', time: '15:23' },
    { id: 's4', sender: 'agent', agentId: 'guangling', agentName: '广苓的 Agent', time: '15:24',
      content: '建议核心指标：1. CTR 提升（目标 >2%）；2. 人均浏览深度；3. 推理延迟 P99；4. 用户停留时长。次要指标：多样性得分、冷启动覆盖率。' },
  ],
  xubai: [
    { id: 's1', sender: 'human', content: '推荐卡片的视觉规范有初版了吗？', time: '15:40' },
    { id: 's2', sender: 'agent', agentId: 'xubai', agentName: '叙白的 Agent', time: '15:41',
      content: '初版已出，封面图 3:4 比例，圆角 12px，理由文案最多 2 行。配色跟随主题色系。Figma 链接已同步至知识库。' },
  ],
  mengyu: [
    { id: 's1', sender: 'human', content: '推荐接口的自动化用例准备好了吗？', time: '16:00' },
    { id: 's2', sender: 'agent', agentId: 'mengyu', agentName: '孟雨的 Agent', time: '16:01',
      content: '已覆盖 85% 的接口场景，包括正常流程、缓存命中/未命中、降级策略触发等。还需补充边界条件和异常流量场景。' },
  ],
}

/* ===== 和自己的Agent对话 ===== */
const MY_AGENT_MESSAGES: ChatMessage[] = [
  { id: 'a1', sender: 'agent', agentId: 'xuechen', agentName: '雪辰的 Agent', time: '09:00',
    content: '早上好！今日项目进展：\n\n1. 王辰完成 RecommendCard 组件\n2. 鉴川完成 Redis 缓存集成\n3. 广苓模型评估 P99=118ms\n\n有 3 项待你确认，请查看右侧面板。' },
  { id: 'a2', sender: 'human', content: '帮我整理一下今天的日报', time: '09:05' },
  { id: 'a3', sender: 'agent', agentId: 'xuechen', agentName: '雪辰的 Agent', time: '09:06',
    content: '已为你生成今日日报：\n\n<b>已完成</b>：更新 PRD v2.3、确认推荐理由格式、评审接口设计\n<b>待完成</b>：组织设计走查会、确认灰度方案\n<b>阻塞</b>：无\n\n需要我帮你发送给团队吗？' },
  { id: 'a4', sender: 'human', content: '帮我检查一下 PRD 的验收标准是否完整', time: '10:30' },
  { id: 'a5', sender: 'agent', agentId: 'xuechen', agentName: '雪辰的 Agent', time: '10:31',
    content: 'PRD v2.3 验收标准检查完成：\n\n✅ 接口 P99 < 200ms（有具体数值）\n✅ 首屏加载 < 1.5s\n✅ CTR 提升 > 2%\n⚠️ <b>建议补充</b>：异常场景下的兜底策略验收标准\n\n要我现在帮你补充吗？', },
]

/* ===== Agent 任务状态 ===== */
const AGENT_TASKS = [
  { memberId: 'wangchen', task: '推荐卡片组件', status: 'done' },
  { memberId: 'jianchuan', task: '批量接口 + 缓存', status: 'running' },
  { memberId: 'guangling', task: '推理脚本打包', status: 'done' },
  { memberId: 'xubai', task: '卡片视觉规范', status: 'running' },
  { memberId: 'mengyu', task: '接口测试用例', status: 'done' },
]

export default function AgentChat({ targetConv }: { targetConv?: string }) {
  const [activeConv, setActiveConv] = useState('group')
  const [allMessages, setAllMessages] = useState<Record<string, ChatMessage[]>>({
    group: GROUP_MESSAGES, ...DIRECT_MESSAGES, 'my-agent': MY_AGENT_MESSAGES,
  })
  const [inputValue, setInputValue] = useState('')
  const [pending, setPending] = useState<PendingItem[]>(INITIAL_PENDING)
  const chatRef = useRef<HTMLDivElement>(null)
  const modal = useModal()

  /* 接收外部跳转指令 */
  useEffect(() => {
    if (targetConv && CONVERSATIONS.find(c => c.id === targetConv)) {
      setActiveConv(targetConv)
    }
  }, [targetConv])

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight
  }, [allMessages, activeConv])

  const currentConv = CONVERSATIONS.find(c => c.id === activeConv)!
  const currentMsgs = allMessages[activeConv] || []
  const activePending = pending.filter(p => p.status === 'pending')
  const isGroup = currentConv.type === 'group'
  const isMyAgent = currentConv.type === 'myagent'

  const handleSend = () => {
    if (!inputValue.trim()) return
    const msg: ChatMessage = {
      id: Date.now().toString(), sender: 'human', content: inputValue,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    }
    setAllMessages(prev => ({ ...prev, [activeConv]: [...(prev[activeConv] || []), msg] }))
    setInputValue('')
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
    const member = conv.memberId ? getMember(conv.memberId) : null
    return (
      <div
        key={conv.id}
        className={`conv-item${isActive ? ' active' : ''}`}
        onClick={() => setActiveConv(conv.id)}
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
            const member = getMember(t.memberId)
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
            <button className="conv-back-btn" onClick={() => setActiveConv('group')}>
              ← 返回群聊
            </button>
          )}
          {isMyAgent && (
            <button className="conv-back-btn" onClick={() => setActiveConv('group')}>
              ← 返回群聊
            </button>
          )}
          <div className="conv-header-info">
            <span className="conv-header-icon">{currentConv.icon}</span>
            <span className="conv-header-name">{currentConv.name}</span>
            {isGroup && <span className="conv-header-count">{MEMBERS.length} 人协作</span>}
            {!isGroup && currentConv.memberId && !isMyAgent && (
              <span className="conv-header-owner">{getMember(currentConv.memberId)?.role}</span>
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
            const agent = getAgent(msg.agentId || '')
            const targetInfo = msg.targetAgent ? getAgent(msg.targetAgent) : null
            return (
              <div key={msg.id} className={`chat-msg ${msg.sender}`}>
                {msg.sender === 'agent' && <div className="chat-msg-avatar">{agent?.icon || '🤖'}</div>}
                <div className="chat-msg-body">
                  <div className="chat-msg-header">
                    <span className="chat-msg-name">{msg.sender === 'agent' ? msg.agentName : '雪辰（你）'}</span>
                    {msg.sender === 'agent' && agent?.owner && <span className="chat-msg-owner">{agent.owner}</span>}
                    {targetInfo && <span className="chat-msg-target">→ {targetInfo.icon} {targetInfo.owner}</span>}
                    <span className="chat-msg-time">{msg.time}</span>
                  </div>
                  <div className="chat-msg-content" dangerouslySetInnerHTML={{ __html: msg.content }} />
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
        <div className="chat-input-area">
          <div className="chat-input-row">
            <input
              className="chat-input" value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder={isGroup ? '发送到群聊，所有成员的 Agent 都能看到...' : isMyAgent ? '向你的 Agent 提问或下达任务...' : `和 ${currentConv.name} 说...`}
            />
            <button className="btn btn-primary btn-sm" onClick={handleSend}>发送</button>
          </div>
        </div>
      </div>

      {modal.render()}
    </div>
  )
}
