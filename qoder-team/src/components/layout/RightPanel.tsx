import { useState } from 'react'
import { Avatar, Tag, useModal } from '../ui'
import { useTeamData } from '../../context/TeamDataContext'

/* ===== Agent 当前活动数据 ===== */
interface AgentActivityDetail {
  doing: string
  lastOutput?: string
  outputTime?: string
  concurrent: number
  metrics: { label: string; value: string }[]
}

const AGENT_ACTIVITIES: Record<string, AgentActivityDetail> = {
  wangchen: {
    doing: '优化推荐卡片虚拟列表性能',
    lastOutput: 'useLazyImage.ts',
    outputTime: '15 min',
    concurrent: 3,
    metrics: [
      { label: '组件渲染耗时', value: '↓ 40%' },
      { label: '首屏请求数', value: '↓ 40%' },
      { label: '代码覆盖率', value: '92%' },
    ],
  },
  jianchuan: {
    doing: '编写缓存降级策略代码',
    lastOutput: 'recommend-api.yaml',
    outputTime: '30 min',
    concurrent: 4,
    metrics: [
      { label: '接口 P99', value: '350ms → 50ms' },
      { label: '缓存命中率', value: '85%' },
      { label: '降级触发率', value: '< 2%' },
    ],
  },
  guangling: {
    doing: '跑 v2.1 模型 A/B 评估报告',
    lastOutput: 'model-v2.1.tar.gz',
    outputTime: '1 h',
    concurrent: 2,
    metrics: [
      { label: '准确率提升', value: '+3.2%' },
      { label: '推理 P99', value: '118ms' },
      { label: 'INT8 精度损失', value: '< 0.5%' },
    ],
  },
  xuechen: {
    doing: '整理用户故事验收标准',
    concurrent: 2,
    metrics: [
      { label: 'PRD 完整度', value: '95%' },
      { label: '需求变更数', value: '3 处' },
    ],
  },
  xubai: {
    doing: '设计推荐卡片视觉规范',
    lastOutput: 'card-spec.fig',
    outputTime: '2 h',
    concurrent: 2,
    metrics: [
      { label: '设计还原度', value: '96%' },
      { label: '走查问题数', value: '5 处' },
    ],
  },
  mengyu: {
    doing: '离线中',
    concurrent: 0,
    metrics: [],
  },
}

interface Props {
  sidebarTab: string
  teamView: string
  activeProject?: string
  chatTarget?: string
  onNavigateChat?: (memberId: string) => void
}

export default function RightPanel({ sidebarTab, teamView, activeProject = 'recommend-v2', chatTarget, onNavigateChat }: Props) {
  return (
    <aside className="ide-right-panel">
      {sidebarTab === 'team' ? <TeamRightPanel teamView={teamView} projectId={activeProject} chatTarget={chatTarget} onNavigateChat={onNavigateChat} /> : <CodeRightPanel />}
    </aside>
  )
}

function CodeRightPanel() {
  return (
    <>
      <div className="rp-section">
        <div className="rp-title">仓库信息</div>
        <div className="rp-item"><span className="rp-label">仓库</span><span className="rp-value">qoder-team-demo</span></div>
        <div className="rp-item"><span className="rp-label">语言</span><span className="rp-value">TypeScript</span></div>
        <div className="rp-item"><span className="rp-label">框架</span><span className="rp-value">React + Vite</span></div>
      </div>
      <div className="rp-section">
        <div className="rp-title">最近提交</div>
        <div className="rp-commit"><div className="rp-commit-msg">feat: 团队空间模块</div><div className="rp-commit-meta">雪辰 · 2h</div></div>
        <div className="rp-commit"><div className="rp-commit-msg">feat: Agent 对话面板</div><div className="rp-commit-meta">王辰 · 5h</div></div>
      </div>
    </>
  )
}

function TeamRightPanel({ teamView, projectId, chatTarget, onNavigateChat }: { teamView: string; projectId: string; chatTarget?: string; onNavigateChat?: (memberId: string) => void }) {
  const { projects, pendingItems, members, agents } = useTeamData()
  const project = projects.find(p => p.id === projectId)
  const isGroupChat = teamView === 'chat' && !chatTarget
  const isMyAgentChat = teamView === 'chat' && chatTarget === 'my-agent'
  const isMemberChat = teamView === 'chat' && !!chatTarget && chatTarget !== 'my-agent'
  const modal = useModal()

  /* 待办分区逻辑 */
  const allPending = pendingItems.filter(p => p.status === 'pending')
  const myOutgoing = allPending.filter(p => p.assignerType === 'human')
  const myIncoming = allPending.filter(p => p.assignerType === 'agent')

  const singleOutgoing = isMemberChat
    ? pendingItems.filter(p => p.assignerType === 'human' && p.relatedMember === chatTarget)
    : []
  const singleIncoming = isMemberChat
    ? pendingItems.filter(p => p.assignerType === 'agent' && p.relatedMember === chatTarget)
    : []

  const [agentCollapsed, setAgentCollapsed] = useState(isGroupChat)
  const [outgoingCollapsed, setOutgoingCollapsed] = useState(false)
  const [incomingCollapsed, setIncomingCollapsed] = useState(false)

  const getMember = (id: string) => members.find(m => m.id === id)

  const renderPendingItem = (p: typeof pendingItems[0], onNav?: (id: string) => void) => {
    const member = p.relatedMember ? getMember(p.relatedMember) : null
    return (
      <div key={p.id} className="rp-pending-rich" onClick={() => p.relatedMember && onNav?.(p.relatedMember)}>
        <div className="rp-pending-header">
          <span className="rp-pending-title">{p.title}</span>
          <span className="rp-pending-arrow">→</span>
        </div>
        <div className="rp-pending-desc">{p.desc}</div>
        {p.context && (
          <div className="rp-pending-context">
            <div className="rp-pending-context-label">{p.assignerType === 'human' ? '为什么需要他确认：' : '为什么需要你确认：'}</div>
            <div className="rp-pending-context-text">{p.context}</div>
          </div>
        )}
        <div className="rp-pending-footer">
          <span className="rp-pending-assigner">{p.assignerIcon && `${p.assignerIcon} `}{p.assigner}</span>
          {member && <span className="rp-pending-jump">→ 查看对话</span>}
        </div>
      </div>
    )
  }

  const panels: Record<string, () => JSX.Element> = {
    progress: () => (
      <>
        <div className="rp-section">
          <div className="rp-title">项目概览</div>
          <div className="rp-stat"><span className="rp-stat-label">进度</span><span className="rp-stat-value">{project?.progress}%</span></div>
          <div className="rp-stat"><span className="rp-stat-label">里程碑</span><span className="rp-stat-value">{project?.milestones}</span></div>
          <div className="rp-stat"><span className="rp-stat-label">截止</span><span className="rp-stat-value">{project?.deadline}</span></div>
        </div>
        <div className="rp-section">
          <div className="rp-title">团队成员</div>
          {members.map(m => (
            <div key={m.id} className="rp-member">
              <Avatar name={m.name[0]} color={m.color} size="sm" />
              <div className="rp-member-info"><div className="rp-member-name">{m.name}</div><div className="rp-member-role">{m.role}</div></div>
              <div className={`rp-member-status${m.agent.online ? ' online' : ''}`} />
            </div>
          ))}
        </div>
      </>
    ),
    todo: () => (
      <div className="rp-section">
        <div className="rp-title">待办统计</div>
        <div className="rp-item"><span className="rp-label">总任务</span><span className="rp-value">{project?.todos}</span></div>
        <div className="rp-item"><span className="rp-label">人的任务</span><span className="rp-value">4</span></div>
        <div className="rp-item"><span className="rp-label">Agent 任务</span><span className="rp-value">4</span></div>
        <div className="rp-item"><span className="rp-label">待我处理</span><span className="rp-value" style={{ color: 'var(--orange)' }}>2</span></div>
      </div>
    ),
    chat: () => {
      const targetMember = isMemberChat ? members.find(m => m.id === chatTarget) : null
      const me = members.find(m => m.isMe)
      const agentMembers = isGroupChat
        ? members
        : isMemberChat
          ? (targetMember ? [targetMember] : [])
          : isMyAgentChat
            ? (me ? [me] : [])
            : []

      const openAgentModal = (m: typeof members[0]) => {
        const activity = AGENT_ACTIVITIES[m.id]
        modal.open(`${m.name} 的 Agent 详情`, (
          <div style={{ minWidth: 320 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <span style={{ fontSize: 28 }}>{m.agent.icon}</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{m.agent.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{m.role} · {m.agent.online ? '在线' : '离线'}</div>
              </div>
              <div style={{ marginLeft: 'auto' }}>
                <Tag variant={m.agent.online ? 'green' : 'gray'}>{m.agent.online ? '运行中' : '离线'}</Tag>
              </div>
            </div>
            {activity && (
              <>
                <div style={{ background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', padding: 10, marginBottom: 10 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 4 }}>当前正在做</div>
                  <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{activity.doing}</div>
                  {activity.lastOutput && (
                    <div style={{ fontSize: 12, color: 'var(--accent)', marginTop: 4 }}>
                      📄 最新产出：{activity.lastOutput} · {activity.outputTime}前
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                  <div style={{ flex: 1, background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', padding: 10, textAlign: 'center' }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--accent)' }}>{activity.concurrent}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>并发任务</div>
                  </div>
                  <div style={{ flex: 1, background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', padding: 10, textAlign: 'center' }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--green)' }}>{activity.metrics.length}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>效果指标</div>
                  </div>
                </div>
                {activity.metrics.length > 0 && (
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 6 }}>效果情况</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {activity.metrics.map((metric, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, padding: '6px 10px', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>{metric.label}</span>
                          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{metric.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={modal.close}>关闭</button>
              <button className="btn btn-primary" onClick={() => { modal.close(); onNavigateChat?.(m.id) }}>进入对话</button>
            </div>
          </div>
        ))
      }

      return (
        <>
          {/* ===== Agent 状态卡片：全员可收起 / 单人聚焦 ===== */}
          <div className="rp-section">
            <div className={`rp-title${(isMemberChat || isMyAgentChat) ? '' : ' rp-title-collapsible'}`} onClick={() => isGroupChat && setAgentCollapsed(!agentCollapsed)}>
              {isGroupChat && <span className={`rp-collapse-arrow${agentCollapsed ? '' : ' expanded'}`}>▸</span>}
              <span>{isMemberChat ? `${targetMember?.name || ''} 的状态` : isMyAgentChat ? '我的 Agent 状态' : 'Agent 状态'}</span>
            </div>
            {!agentCollapsed && agentMembers.map(m => {
              const activity = AGENT_ACTIVITIES[m.id]
              return (
                <div key={m.id} className="rp-agent-card" onClick={() => isGroupChat ? openAgentModal(m) : undefined}>
                  <div className="rp-agent-card-header">
                    <span className="rp-agent-card-icon">{m.agent.icon}</span>
                    <div className="rp-agent-card-meta">
                      <span className="rp-agent-card-name">{m.name}</span>
                      <span className="rp-agent-card-role">{m.role}</span>
                    </div>
                    <div className={`rp-agent-dot${m.agent.online ? ' online' : ' offline'}`} />
                  </div>
                  {activity && m.agent.online && (
                    <div className="rp-agent-card-body">
                      <div className="rp-agent-doing">
                        <span className="rp-doing-dot" />
                        <span className="rp-doing-text">{activity.doing}</span>
                      </div>
                      {activity.lastOutput && (
                        <div className="rp-agent-output">
                          <span className="rp-output-icon">📄</span>
                          <span className="rp-output-name">{activity.lastOutput}</span>
                          <span className="rp-output-time">{activity.outputTime}前</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* ===== 待办分区 ===== */}
          {isMemberChat ? (
            <>
              {/* 单人：我留给他的 */}
              {singleOutgoing.length > 0 && (
                <div className="rp-section">
                  <div className="rp-title rp-title-collapsible" onClick={() => setOutgoingCollapsed(!outgoingCollapsed)}>
                    <span className={`rp-collapse-arrow${outgoingCollapsed ? '' : ' expanded'}`}>▸</span>
                    <span>我留给他的（{singleOutgoing.length}）</span>
                  </div>
                  {!outgoingCollapsed && singleOutgoing.map(p => renderPendingItem(p, onNavigateChat))}
                </div>
              )}
              {/* 单人：他留给我的 */}
              {singleIncoming.length > 0 && (
                <div className="rp-section">
                  <div className="rp-title rp-title-collapsible" onClick={() => setIncomingCollapsed(!incomingCollapsed)}>
                    <span className={`rp-collapse-arrow${incomingCollapsed ? '' : ' expanded'}`}>▸</span>
                    <span>他留给我的（{singleIncoming.length}）</span>
                    {singleIncoming.length > 0 && incomingCollapsed && <span className="rp-red-dot" />}
                  </div>
                  {!incomingCollapsed && singleIncoming.map(p => renderPendingItem(p, onNavigateChat))}
                </div>
              )}
            </>
          ) : (
            <>
              {/* 全员 / 我的Agent：我发出的 */}
              {myOutgoing.length > 0 && (
                <div className="rp-section">
                  <div className="rp-title rp-title-collapsible" onClick={() => setOutgoingCollapsed(!outgoingCollapsed)}>
                    <span className={`rp-collapse-arrow${outgoingCollapsed ? '' : ' expanded'}`}>▸</span>
                    <span>我发出的（{myOutgoing.length}）</span>
                  </div>
                  {!outgoingCollapsed && myOutgoing.map(p => renderPendingItem(p, onNavigateChat))}
                </div>
              )}
              {/* 全员 / 我的Agent：我待办的 */}
              {myIncoming.length > 0 && (
                <div className="rp-section">
                  <div className="rp-title rp-title-collapsible" onClick={() => setIncomingCollapsed(!incomingCollapsed)}>
                    <span className={`rp-collapse-arrow${incomingCollapsed ? '' : ' expanded'}`}>▸</span>
                    <span>我待办的（{myIncoming.length}）</span>
                    {myIncoming.length > 0 && incomingCollapsed && <span className="rp-red-dot" />}
                  </div>
                  {!incomingCollapsed && myIncoming.map(p => renderPendingItem(p, onNavigateChat))}
                </div>
              )}
            </>
          )}
          {modal.render()}
        </>
      )
    },

    kb: () => (
      <>
        <div className="rp-section">
          <div className="rp-title">知识库统计</div>
          <div className="rp-item"><span className="rp-label">Agent 产物</span><span className="rp-stat-value">3</span></div>
          <div className="rp-item"><span className="rp-label">个人产物</span><span className="rp-stat-value">2</span></div>
          <div className="rp-item"><span className="rp-label">协作产物</span><span className="rp-stat-value">1</span></div>
        </div>
        <div className="rp-section">
          <div className="rp-title">最近更新</div>
          <div className="rp-commit"><div className="rp-commit-msg">API 接口规范</div><div className="rp-commit-meta">⚙️ 鉴川的 Agent · 3h</div></div>
          <div className="rp-commit"><div className="rp-commit-msg">推荐卡片组件</div><div className="rp-commit-meta">🎨 王辰的 Agent · 2h</div></div>
        </div>
      </>
    ),
    config: () => (
      <div className="rp-section">
        <div className="rp-title">配置概览</div>
        <div className="rp-item"><span className="rp-label">Agent 数</span><span className="rp-value">{agents.length}</span></div>
        <div className="rp-item"><span className="rp-label">审批规则</span><span className="rp-value">6 条</span></div>
        <div className="rp-item"><span className="rp-label">自主执行</span><span className="rp-value" style={{ color: 'var(--green)' }}>3 条</span></div>
        <div className="rp-item"><span className="rp-label">需审批</span><span className="rp-value" style={{ color: 'var(--orange)' }}>3 条</span></div>
      </div>
    ),
  }

  const render = panels[teamView]
  return render ? render() : null
}
