import { useState } from 'react'
import { Avatar, Tag } from '../ui'
import { PROJECTS, AGENTS, INITIAL_PENDING, MEMBERS, getMember } from '../../data'

/* ===== Agent 当前活动数据 ===== */
const AGENT_ACTIVITIES: Record<string, { doing: string; lastOutput?: string; outputTime?: string }> = {
  wangchen: { doing: '优化推荐卡片虚拟列表性能', lastOutput: 'useLazyImage.ts', outputTime: '15 min' },
  jianchuan: { doing: '编写缓存降级策略代码', lastOutput: 'recommend-api.yaml', outputTime: '30 min' },
  guangling: { doing: '跑 v2.1 模型 A/B 评估报告', lastOutput: 'model-v2.1.tar.gz', outputTime: '1 h' },
  xuechen: { doing: '整理用户故事验收标准' },
  xubai: { doing: '设计推荐卡片视觉规范', lastOutput: 'card-spec.fig', outputTime: '2 h' },
  mengyu: { doing: '离线中' },
}

interface Props {
  sidebarTab: string
  teamView: string
  activeProject?: string
  onNavigateChat?: (memberId: string) => void
}

export default function RightPanel({ sidebarTab, teamView, activeProject = 'recommend-v2', onNavigateChat }: Props) {
  return (
    <aside className="ide-right-panel">
      {sidebarTab === 'team' ? <TeamRightPanel teamView={teamView} projectId={activeProject} onNavigateChat={onNavigateChat} /> : <CodeRightPanel />}
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

function TeamRightPanel({ teamView, projectId, onNavigateChat }: { teamView: string; projectId: string; onNavigateChat?: (memberId: string) => void }) {
  const project = PROJECTS.find(p => p.id === projectId)
  const pending = INITIAL_PENDING.filter(p => p.status === 'pending')
  const [agentCollapsed, setAgentCollapsed] = useState(false)
  const [pendingCollapsed, setPendingCollapsed] = useState(false)

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
          {MEMBERS.map(m => (
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
    chat: () => (
      <>
        {/* ===== Agent 状态卡片：可收起 ===== */}
        <div className="rp-section">
          <div className="rp-title rp-title-collapsible" onClick={() => setAgentCollapsed(!agentCollapsed)}>
            <span className={`rp-collapse-arrow${agentCollapsed ? '' : ' expanded'}`}>▸</span>
            <span>Agent 状态</span>
          </div>
          {!agentCollapsed && MEMBERS.filter(m => !m.isMe).map(m => {
            const activity = AGENT_ACTIVITIES[m.id]
            return (
              <div key={m.id} className="rp-agent-card" onClick={() => onNavigateChat?.(m.id)}>
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

        {/* ===== 待确认事项：可收起 + 小红点 ===== */}
        <div className="rp-section">
          <div className="rp-title rp-title-collapsible" onClick={() => setPendingCollapsed(!pendingCollapsed)}>
            <span className={`rp-collapse-arrow${pendingCollapsed ? '' : ' expanded'}`}>▸</span>
            <span>待确认 ({pending.length})</span>
            {pending.length > 0 && pendingCollapsed && <span className="rp-red-dot" />}
          </div>
          {!pendingCollapsed && pending.map(p => {
            const member = p.relatedMember ? getMember(p.relatedMember) : null
            return (
              <div key={p.id} className="rp-pending-rich" onClick={() => p.relatedMember && onNavigateChat?.(p.relatedMember)}>
                <div className="rp-pending-header">
                  <span className="rp-pending-title">{p.title}</span>
                  <span className="rp-pending-arrow">→</span>
                </div>
                <div className="rp-pending-desc">{p.desc}</div>
                {p.context && (
                  <div className="rp-pending-context">
                    <div className="rp-pending-context-label">为什么需要你确认：</div>
                    <div className="rp-pending-context-text">{p.context}</div>
                  </div>
                )}
                <div className="rp-pending-footer">
                  <span className="rp-pending-assigner">{p.assignerIcon && `${p.assignerIcon} `}{p.assigner}</span>
                  {member && <span className="rp-pending-jump">→ 查看对话</span>}
                </div>
              </div>
            )
          })}
        </div>
      </>
    ),
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
        <div className="rp-item"><span className="rp-label">Agent 数</span><span className="rp-value">{AGENTS.length}</span></div>
        <div className="rp-item"><span className="rp-label">审批规则</span><span className="rp-value">6 条</span></div>
        <div className="rp-item"><span className="rp-label">自主执行</span><span className="rp-value" style={{ color: 'var(--green)' }}>3 条</span></div>
        <div className="rp-item"><span className="rp-label">需审批</span><span className="rp-value" style={{ color: 'var(--orange)' }}>3 条</span></div>
      </div>
    ),
  }

  const render = panels[teamView]
  return render ? render() : null
}
