import { useState, useEffect } from 'react'
import { Tag, Avatar, useModal } from '../components/ui'
import { useTeamData } from '../context/TeamDataContext'
import { api } from '../api/client'
import type { Milestone, MilestoneArtifact, DailyReport } from '../types'



/* ===== 泳道数据 ===== */
const SWIMLANE_PHASES = [
  { id: 'L0', name: '需求构想', status: 'done' },
  { id: 'L1', name: '需求定义', status: 'done' },
  { id: 'L2', name: '概要设计', status: 'done' },
  { id: 'L3', name: '详细设计', status: 'done' },
  { id: 'L4', name: '开发', status: 'running' },
  { id: 'L5', name: '联调', status: 'waiting' },
  { id: 'L6', name: '测试', status: 'waiting' },
  { id: 'L7', name: '灰度', status: 'waiting' },
  { id: 'L8', name: '发布', status: 'waiting' },
]

const SWIMLANE_ROLES = [
  { id: 'pm', name: '产品', icon: '📋', color: 'purple' },
  { id: 'design', name: '设计', icon: '🎯', color: 'pink' },
  { id: 'fe', name: '前端', icon: '🎨', color: 'green' },
  { id: 'be', name: '后端', icon: '⚙️', color: 'blue' },
  { id: 'algo', name: '算法', icon: '🧠', color: 'orange' },
  { id: 'qa', name: '测试', icon: '🧪', color: 'cyan' },
]

const SWIMLANE_MATRIX: Record<string, Record<string, { task: string; agent: boolean; status: 'done' | 'running' | 'waiting' | 'na' }>> = {
  pm: {
    L0: { task: '用户调研', agent: false, status: 'done' },
    L1: { task: 'PRD 撰写', agent: true, status: 'done' },
    L2: { task: '需求评审', agent: false, status: 'done' },
    L3: { task: '验收标准', agent: true, status: 'done' },
    L4: { task: '进度跟踪', agent: true, status: 'running' },
    L5: { task: '验收确认', agent: false, status: 'waiting' },
    L6: { task: 'UAT 验收', agent: false, status: 'waiting' },
    L7: { task: '灰度观察', agent: true, status: 'waiting' },
    L8: { task: 'Release Notes', agent: true, status: 'waiting' },
  },
  design: {
    L0: { task: '竞品分析', agent: true, status: 'done' },
    L1: { task: '交互原型', agent: false, status: 'done' },
    L2: { task: '设计规范', agent: true, status: 'done' },
    L3: { task: '视觉稿', agent: false, status: 'done' },
    L4: { task: '切图标注', agent: true, status: 'running' },
    L5: { task: '走查验收', agent: false, status: 'waiting' },
    L6: { task: '—', agent: false, status: 'na' },
    L7: { task: '—', agent: false, status: 'na' },
    L8: { task: '—', agent: false, status: 'na' },
  },
  fe: {
    L0: { task: '—', agent: false, status: 'na' },
    L1: { task: '技术预研', agent: false, status: 'done' },
    L2: { task: '组件规划', agent: true, status: 'done' },
    L3: { task: '接口对齐', agent: true, status: 'done' },
    L4: { task: '组件开发', agent: true, status: 'running' },
    L5: { task: '联调适配', agent: true, status: 'waiting' },
    L6: { task: 'Bug 修复', agent: true, status: 'waiting' },
    L7: { task: '性能监控', agent: true, status: 'waiting' },
    L8: { task: '上线部署', agent: false, status: 'waiting' },
  },
  be: {
    L0: { task: '—', agent: false, status: 'na' },
    L1: { task: '可行性评估', agent: false, status: 'done' },
    L2: { task: '架构设计', agent: true, status: 'done' },
    L3: { task: 'API 设计', agent: true, status: 'done' },
    L4: { task: '接口开发', agent: true, status: 'running' },
    L5: { task: '联调支持', agent: true, status: 'waiting' },
    L6: { task: 'Bug 修复', agent: true, status: 'waiting' },
    L7: { task: '灰度配置', agent: true, status: 'waiting' },
    L8: { task: '上线发布', agent: false, status: 'waiting' },
  },
  algo: {
    L0: { task: '—', agent: false, status: 'na' },
    L1: { task: '效果预估', agent: true, status: 'done' },
    L2: { task: '方案设计', agent: false, status: 'done' },
    L3: { task: '特征工程', agent: true, status: 'done' },
    L4: { task: '模型训练', agent: true, status: 'done' },
    L5: { task: '效果评估', agent: true, status: 'running' },
    L6: { task: 'A/B 实验', agent: true, status: 'waiting' },
    L7: { task: '灰度扩量', agent: false, status: 'waiting' },
    L8: { task: '全量切换', agent: false, status: 'waiting' },
  },
  qa: {
    L0: { task: '—', agent: false, status: 'na' },
    L1: { task: '—', agent: false, status: 'na' },
    L2: { task: '用例规划', agent: true, status: 'done' },
    L3: { task: '用例编写', agent: true, status: 'done' },
    L4: { task: '自动化脚本', agent: true, status: 'running' },
    L5: { task: '联调测试', agent: true, status: 'waiting' },
    L6: { task: '回归测试', agent: true, status: 'waiting' },
    L7: { task: '灰度验证', agent: true, status: 'waiting' },
    L8: { task: '上线验证', agent: false, status: 'waiting' },
  },
}

const PHASE_GATES: Record<string, { name: string; passed: boolean }> = {
  L1: { name: '需求对齐', passed: true },
  L3: { name: '技术评审', passed: true },
  L5: { name: '联调对齐', passed: false },
  L7: { name: '灰度评审', passed: false },
}

const RECENT_ACTIVITIES = [
  { icon: '⚙️', text: '鉴川的 Agent 完成了 Redis 缓存层集成', time: '30 分钟前', type: 'agent' },
  { icon: '📋', text: '雪辰 更新了 PRD v2.3', time: '1 小时前', type: 'human' },
  { icon: '🎨', text: '王辰的 Agent 生成了推荐卡片组件', time: '2 小时前', type: 'agent' },
  { icon: '🧠', text: '广苓的 Agent 完成模型 v2.1 训练', time: '3 小时前', type: 'agent' },
  { icon: '👤', text: '鉴川 审批通过了接口设计方案', time: '4 小时前', type: 'human' },
]



const ARTIFACT_TYPE_ICON: Record<string, string> = {
  doc: '📄', code: '💻', design: '🎨', model: '🧠', test: '🧪', config: '⚙️',
}

type ProgressView = 'milestone' | 'swimlane' | 'daily'

export default function ProjectProgress() {
  const { members, dailyReports, loading: teamLoading, teamId } = useTeamData()
  const [activeProject, setActiveProject] = useState<string>('recommend-v2')
  const [projectList, setProjectList] = useState<any[]>([])
  const [projectsLoading, setProjectsLoading] = useState(false)

  useEffect(() => {
    if (!teamId) return
    setProjectsLoading(true)
    api.listProjects(teamId)
      .then((res: any[]) => {
        setProjectList(res)
        if (res.length > 0) {
          const valid = res.find(p => (p.slug || p.id) === activeProject)
          if (!valid) {
            setActiveProject(res[0].slug || res[0].id)
          }
        }
      })
      .catch(() => {})
      .finally(() => setProjectsLoading(false))
  }, [teamId])

  const activeProjectData = projectList.find(p => (p.slug || p.id) === activeProject)

  const [milestones, setMilestones] = useState<Milestone[]>([])
  useEffect(() => {
    const data = projectList.find(p => (p.slug || p.id) === activeProject)
    const ms = (data?.milestones || []).map((m: any) => ({
      id: m.id,
      name: m.name,
      status: m.status,
      date: m.date,
      owner: m.owner,
      requiredArtifacts: m.requiredArtifacts?.map((a: any) => ({
        name: a.name,
        type: a.type,
        docId: a.docId,
        status: a.status,
        author: a.author,
        completedAt: a.completedAt,
      })) || [],
      gate: m.gate ? { name: m.gate.name, passed: m.gate.passed } : undefined,
    }))
    setMilestones(ms)
  }, [activeProject, projectList])

  const [expandedMs, setExpandedMs] = useState<string | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [view, setView] = useState<ProgressView>('daily')
  const [dailyFilter, setDailyFilter] = useState<string>('all')
  const modal = useModal()

  const doneCount = milestones.filter(m => m.status === 'done').length
  const totalCount = milestones.length
  const progressPercent = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0

  const moveMilestone = (idx: number, dir: -1 | 1) => {
    const next = [...milestones]
    const target = idx + dir
    if (target < 0 || target >= next.length) return
    ;[next[idx], next[target]] = [next[target], next[idx]]
    setMilestones(next)
  }

  const addMilestone = (name: string, owner: string, date: string) => {
    const newMs: Milestone = {
      id: `ms-new-${Date.now()}`, name, status: 'waiting', date, owner, requiredArtifacts: [],
    }
    setMilestones(prev => [...prev, newMs])
  }

  const removeMilestone = (id: string) => {
    setMilestones(prev => prev.filter(m => m.id !== id))
  }

  const filteredDaily = dailyFilter === 'all' ? dailyReports : dailyReports.filter(d => d.memberId === dailyFilter)

  if (teamLoading || projectsLoading) {
    return (
      <div className="fade-in">
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-body" style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
            加载中...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fade-in">
      {/* 项目信息头 */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-body">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>{activeProjectData?.name || '加载中...'}</h2>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                {activeProjectData?.desc || ''}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Tag variant="green">进行中</Tag>
              <Tag variant="blue">{progressPercent}%</Tag>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 24, marginTop: 12, fontSize: 12, color: 'var(--text-secondary)' }}>
            <span>截止：{activeProjectData?.deadline || '—'}</span>
            <span>
              成员：
              <span style={{ display: 'inline-flex', marginLeft: 4, verticalAlign: 'middle' }}>
                {members.slice(0, 6).map(m => (
                  <Avatar key={m.id} name={m.name[0]} color={m.color} size="sm" />
                ))}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* 视图切换 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div className="seg-control">
          <button className={`seg-btn${view === 'milestone' ? ' active' : ''}`} onClick={() => setView('milestone')}>📋 里程碑</button>
          <button className={`seg-btn${view === 'swimlane' ? ' active' : ''}`} onClick={() => setView('swimlane')}>🏊 泳道视图</button>
          <button className={`seg-btn${view === 'daily' ? ' active' : ''}`} onClick={() => setView('daily')}>📰 日报</button>
        </div>
        {view === 'milestone' && (
          <button className={`btn btn-xs ${editMode ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setEditMode(!editMode)}>
            {editMode ? '完成编辑' : '自定义流程'}
          </button>
        )}
      </div>

      {/* ===== 日报视图 ===== */}
      {view === 'daily' && (
        <div>
          {/* 团队日报摘要 */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header">
              <div className="card-title">📰 团队日报 — 6/1（今日）</div>
              <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{dailyReports.length} 人提交 · 汇总昨日 5/31</span>
            </div>
            <div className="card-body">
              {/* 统计摘要 + 文字总结 */}
              <div className="daily-summary">
                <div className="daily-summary-stats">
                  <div className="daily-stat">
                    <span className="daily-stat-num">{dailyReports.reduce((s, d) => s + d.done.length, 0)}</span>
                    <span className="daily-stat-label">昨日完成</span>
                  </div>
                  <div className="daily-stat">
                    <span className="daily-stat-num">{dailyReports.reduce((s, d) => s + d.todo.length, 0)}</span>
                    <span className="daily-stat-label">今日待办</span>
                  </div>
                  <div className="daily-stat">
                    <span className="daily-stat-num daily-stat-warn">{dailyReports.reduce((s, d) => s + d.blockers.length, 0)}</span>
                    <span className="daily-stat-label">核心卡点</span>
                  </div>
                </div>
                <div className="daily-summary-text">
                  <div className="daily-summary-yesterday">
                    <span className="daily-summary-tag">昨日</span>
                    <span>团队共推进 12 项工作：前端完成 RecommendCard 组件与懒加载 Hook；后端完成 API 规范与 Redis 缓存集成；算法完成 v2.1 模型评估与 A/B 方案；设计输出视觉规范初版；测试覆盖率达 85%。整体节奏正常，无重大延期。</span>
                  </div>
                  <div className="daily-summary-today">
                    <span className="daily-summary-tag">今日</span>
                    <span>重点推进接口联调、视觉规范终稿确认、灰度比例决策。2 项阻塞需人工介入：视觉规范未最终确认影响前端联调；灰度比例待产品拍板影响算法上线节奏。建议今日内完成决策。</span>
                  </div>
                </div>
              </div>

              {/* 人核心关注 vs Agent 核心在做 */}
              <div className="daily-focus-grid">
                <div className="daily-focus-card">
                  <div className="daily-focus-title" title="Agent 无法代劳、必须人工决策或外部沟通的事项"><span>👤</span> 人核心要关注</div>
                  <div className="daily-focus-project">
                    当前项目进入开发中后期，需人工确认灰度比例、视觉规范终稿，以及组织设计走查会。涉及外部协调、跨团队对齐与关键决策的事项需优先推进，Agent 无法替代。
                  </div>
                  <div className="daily-focus-list">
                    {dailyReports.flatMap(d => d.humanFocus || []).map((item, i) => (
                      <div key={i} className="daily-focus-item human">
                        <span className="daily-focus-dot" />{item}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="daily-focus-card">
                  <div className="daily-focus-title" title="Agent 在各自负责范围内自动推进、无需人工干预的工作"><span>🤖</span> Agent 核心在做</div>
                  <div className="daily-focus-project">
                    各 Agent 在各自专业领域自动推进：前端生成组件代码与性能优化、后端设计缓存策略与 API 规范、算法完成模型评估与 A/B 实验、测试编写自动化脚本。Agent 产出已实时同步至知识库，可随时查看最新进展。
                  </div>
                  <div className="daily-focus-list">
                    {dailyReports.flatMap(d => d.agentFocus || []).map((item, i) => (
                      <div key={i} className="daily-focus-item agent">
                        <span className="daily-focus-dot" />{item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 核心卡点 */}
              {dailyReports.some(d => d.blockers.length > 0) && (
                <div className="daily-blockers">
                  <div className="daily-blockers-title">⚠️ 核心卡点 · 需尽快推进</div>
                  {dailyReports.filter(d => d.blockers.length > 0).map(d => {
                    const member = members.find(m => m.id === d.memberId)
                    return (
                      <div key={d.memberId} className="daily-blocker-item">
                        <span style={{ fontWeight: 500 }}>{member?.agent.icon} {member?.name}：</span>
                        <span>{d.blockers.join('；')}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* 日报筛选 */}
          <div style={{ marginBottom: 12 }}>
            <div className="tabs" style={{ borderBottom: 'none' }}>
              <div className={`tab-item${dailyFilter === 'all' ? ' active' : ''}`} onClick={() => setDailyFilter('all')}>全员视图</div>
              {members.map(m => (
                <div key={m.id} className={`tab-item${dailyFilter === m.id ? ' active' : ''}`} onClick={() => setDailyFilter(m.id)}>
                  {m.agent.icon} {m.name}
                </div>
              ))}
            </div>
          </div>

          {/* 个人日报卡片 */}
          <div className="daily-grid">
            {filteredDaily.map(d => {
              const member = members.find(m => m.id === d.memberId)
              if (!member) return null
              return (
                <div key={d.memberId} className="card daily-card">
                  <div className="daily-card-header">
                    <Avatar name={member.name[0]} color={member.color} size="sm" />
                    <div>
                      <div className="daily-card-name">{member.name}</div>
                      <div className="daily-card-role">{member.role}</div>
                    </div>
                    <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-tertiary)' }}>{d.date}</span>
                  </div>
                  <div className="daily-card-body">
                    <div className="daily-section">
                      <div className="daily-section-title">✅ 昨日完成（{d.done.length}）</div>
                      {d.done.map((item, i) => (
                        <div key={i} className="daily-item done">{item}</div>
                      ))}
                    </div>
                    <div className="daily-section">
                      <div className="daily-section-title">📋 今日待办（{d.todo.length}）</div>
                      {d.todo.map((item, i) => (
                        <div key={i} className="daily-item todo">{item}</div>
                      ))}
                    </div>
                    {d.blockers.length > 0 && (
                      <div className="daily-section">
                        <div className="daily-section-title">🚧 阻塞（{d.blockers.length}）</div>
                        {d.blockers.map((item, i) => (
                          <div key={i} className="daily-item blocker">{item}</div>
                        ))}
                      </div>
                    )}
                    {(d.humanFocus?.length || 0) > 0 && (
                      <div className="daily-section">
                        <div className="daily-section-title">👤 人核心关注</div>
                        {d.humanFocus!.map((item, i) => (
                          <div key={i} className="daily-item human-focus">{item}</div>
                        ))}
                      </div>
                    )}
                    {(d.agentFocus?.length || 0) > 0 && (
                      <div className="daily-section">
                        <div className="daily-section-title">🤖 Agent 核心在做</div>
                        {d.agentFocus!.map((item, i) => (
                          <div key={i} className="daily-item agent-focus">{item}</div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ===== 泳道视图 ===== */}
      {view === 'swimlane' && (
        <div className="card" style={{ marginBottom: 16, overflow: 'auto' }}>
          <div className="card-body" style={{ padding: 0 }}>
            <div className="swimlane-container">
              <table className="swimlane-table">
                <thead>
                  <tr>
                    <th className="swimlane-corner">角色 \ 阶段</th>
                    {SWIMLANE_PHASES.map((phase) => (
                      <th key={phase.id} className={`swimlane-phase-header ${phase.status}`}>
                        <div className="swimlane-phase-id">{phase.id}</div>
                        <div className="swimlane-phase-name">{phase.name}</div>
                        {PHASE_GATES[phase.id] && (
                          <div className={`swimlane-gate${PHASE_GATES[phase.id].passed ? ' passed' : ''}`}>
                            🚪 {PHASE_GATES[phase.id].name}
                          </div>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SWIMLANE_ROLES.map(role => (
                    <tr key={role.id}>
                      <td className="swimlane-role-cell">
                        <span className="swimlane-role-icon">{role.icon}</span>
                        <span className="swimlane-role-name">{role.name}</span>
                      </td>
                      {SWIMLANE_PHASES.map(phase => {
                        const cell = SWIMLANE_MATRIX[role.id]?.[phase.id]
                        if (!cell || cell.status === 'na') {
                          return <td key={phase.id} className="swimlane-cell na"><span className="swimlane-na">—</span></td>
                        }
                        return (
                          <td key={phase.id} className={`swimlane-cell ${cell.status}`}>
                            <div className="swimlane-task">
                              <span className="swimlane-task-text">{cell.task}</span>
                              {cell.agent && <span className="swimlane-agent-badge" title="Agent 参与">🤖</span>}
                            </div>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="swimlane-legend">
              <span className="swimlane-legend-item"><span className="swimlane-legend-dot done" />已完成</span>
              <span className="swimlane-legend-item"><span className="swimlane-legend-dot running" />进行中</span>
              <span className="swimlane-legend-item"><span className="swimlane-legend-dot waiting" />等待</span>
              <span className="swimlane-legend-item"><span className="swimlane-legend-badge">🤖</span>Agent 参与</span>
              <span className="swimlane-legend-item"><span className="swimlane-legend-badge">🚪</span>阶段门禁（离线对齐点）</span>
            </div>
          </div>
        </div>
      )}

      {/* ===== 里程碑视图 ===== */}
      {view === 'milestone' && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-header">
            <div className="card-title">里程碑进度</div>
            <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{doneCount}/{totalCount} 完成</span>
          </div>
          <div className="card-body">
            <div className="milestone-bar" style={{ marginBottom: 20 }}>
              <div className="milestone-bar-track">
                <div className="milestone-bar-fill" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>

            <div className="milestone-list">
              {milestones.map((m, i) => {
                const isExpanded = expandedMs === m.id
                const doneArtifacts = m.requiredArtifacts.filter(a => a.status === 'done').length
                const totalArtifacts = m.requiredArtifacts.length
                const artifactProgress = totalArtifacts > 0 ? `${doneArtifacts}/${totalArtifacts}` : '—'

                return (
                  <div key={m.id} className="ms-item-wrapper">
                    {m.gate && (
                      <div className={`ms-gate-bar${m.gate.passed ? ' passed' : ''}`}>
                        <span className="ms-gate-icon">🚪</span>
                        <span className="ms-gate-name">{m.gate.name}</span>
                        <span className="ms-gate-status">{m.gate.passed ? '✓ 已通过' : '⏳ 待召开'}</span>
                      </div>
                    )}
                    <div
                      className={`milestone-item${isExpanded ? ' ms-expanded' : ''}`}
                      onClick={() => setExpandedMs(isExpanded ? null : m.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      {editMode && (
                        <div className="ms-edit-controls" onClick={e => e.stopPropagation()}>
                          <button className="ms-move-btn" onClick={() => moveMilestone(i, -1)} disabled={i === 0}>↑</button>
                          <button className="ms-move-btn" onClick={() => moveMilestone(i, 1)} disabled={i === milestones.length - 1}>↓</button>
                          <button className="ms-move-btn ms-delete" onClick={() => removeMilestone(m.id)}>×</button>
                        </div>
                      )}
                      <div className={`milestone-dot ${m.status}`} />
                      <div className="milestone-content" style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span className="milestone-name">{m.name}</span>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <span className="ms-artifact-badge" title="产物完成度">📎 {artifactProgress}</span>
                            <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{m.date}</span>
                            <Tag variant={m.status === 'done' ? 'green' : m.status === 'running' ? 'blue' : 'gray'}>
                              {m.status === 'done' ? '完成' : m.status === 'running' ? '进行中' : '等待'}
                            </Tag>
                          </div>
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span>负责人：{m.owner}</span>
                          {isExpanded ? <span style={{ color: 'var(--accent)' }}>▾ 收起产物</span> : <span>▸ 查看产物</span>}
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="ms-artifacts">
                        <div className="ms-artifacts-header">
                          <span className="ms-artifacts-title">关联产物 ({doneArtifacts}/{totalArtifacts})</span>
                          {m.status !== 'done' && totalArtifacts > 0 && doneArtifacts < totalArtifacts && (
                            <span className="ms-artifacts-hint">需完成全部产物才能标记为完成</span>
                          )}
                        </div>
                        {m.requiredArtifacts.map((art, j) => (
                          <div key={j} className={`ms-artifact-row${art.status === 'done' ? ' done' : ' missing'}`}>
                            <span className="ms-artifact-icon">{ARTIFACT_TYPE_ICON[art.type]}</span>
                            <span className="ms-artifact-name">{art.name}</span>
                            {art.docId && <span className="ms-artifact-link" title="已关联知识库">📚</span>}
                            <span style={{ flex: 1 }} />
                            {art.status === 'done' ? (
                              <span className="ms-artifact-done-info">
                                <span className="ms-artifact-author">{art.author}</span>
                                <span className="ms-artifact-date">{art.completedAt}</span>
                                <Tag variant="green">✓</Tag>
                              </span>
                            ) : (
                              <Tag variant="orange">待产出</Tag>
                            )}
                          </div>
                        ))}
                        {editMode && (
                          <button className="btn btn-xs btn-secondary ms-add-artifact" onClick={(e) => {
                            e.stopPropagation()
                            modal.open(`为「${m.name}」添加产物`, (
                              <div>
                                <div className="form-group">
                                  <label className="form-label">产物名称</label>
                                  <input className="form-input" id="new-art-name" placeholder="如：接口设计文档" />
                                </div>
                                <div className="form-group">
                                  <label className="form-label">类型</label>
                                  <select className="form-select" id="new-art-type">
                                    <option value="doc">📄 文档</option><option value="code">💻 代码</option>
                                    <option value="design">🎨 设计</option><option value="model">🧠 模型</option>
                                    <option value="test">🧪 测试</option><option value="config">⚙️ 配置</option>
                                  </select>
                                </div>
                                <div className="modal-actions">
                                  <button className="btn btn-secondary" onClick={modal.close}>取消</button>
                                  <button className="btn btn-primary" onClick={() => {
                                    const nameEl = document.getElementById('new-art-name') as HTMLInputElement
                                    const typeEl = document.getElementById('new-art-type') as HTMLSelectElement
                                    if (nameEl?.value) {
                                      setMilestones(prev => prev.map(ms => ms.id === m.id
                                        ? { ...ms, requiredArtifacts: [...ms.requiredArtifacts, { name: nameEl.value, type: typeEl.value as MilestoneArtifact['type'], status: 'missing' }] }
                                        : ms
                                      ))
                                      modal.close()
                                    }
                                  }}>添加</button>
                                </div>
                              </div>
                            ))
                          }}>+ 添加产物要求</button>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {editMode && (
              <button className="btn btn-secondary ms-add-milestone" onClick={() => {
                modal.open('添加里程碑', (
                  <div>
                    <div className="form-group"><label className="form-label">里程碑名称</label><input className="form-input" id="new-ms-name" placeholder="如：安全审计" /></div>
                    <div className="form-group"><label className="form-label">负责人</label>
                      <select className="form-select" id="new-ms-owner"><option>雪辰</option><option>王辰</option><option>鉴川</option><option>广苓</option><option>叙白</option><option>孟雨</option><option>全员</option></select></div>
                    <div className="form-group"><label className="form-label">预计完成日期</label><input className="form-input" id="new-ms-date" placeholder="如：6/10" /></div>
                    <div className="modal-actions">
                      <button className="btn btn-secondary" onClick={modal.close}>取消</button>
                      <button className="btn btn-primary" onClick={() => {
                        const name = (document.getElementById('new-ms-name') as HTMLInputElement)?.value
                        const owner = (document.getElementById('new-ms-owner') as HTMLSelectElement)?.value
                        const date = (document.getElementById('new-ms-date') as HTMLInputElement)?.value
                        if (name && date) { addMilestone(name, owner, date); modal.close() }
                      }}>添加</button>
                    </div>
                  </div>
                ))
              }}>+ 添加里程碑节点</button>
            )}
          </div>
        </div>
      )}

      {/* 最近动态 + 产物统计 */}
      {view !== 'daily' && (
        <div className="grid grid-2">
          <div className="card">
            <div className="card-header"><div className="card-title">最近动态</div></div>
            <div className="card-body">
              <div className="activity-list">
                {RECENT_ACTIVITIES.map((a, i) => (
                  <div key={i} className="activity-row">
                    <div style={{ background: a.type === 'agent' ? 'var(--accent)' : 'var(--green)', width: 8, height: 8, borderRadius: '50%', marginTop: 5, flexShrink: 0 }} />
                    <div>
                      <div className="activity-text"><span style={{ marginRight: 4 }}>{a.icon}</span>{a.text}</div>
                      <div className="activity-time">{a.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-header"><div className="card-title">产物统计</div></div>
            <div className="card-body">
              {(() => {
                const allArts = milestones.flatMap(m => m.requiredArtifacts)
                const doneArts = allArts.filter(a => a.status === 'done')
                const linkedArts = allArts.filter(a => a.docId)
                const gates = milestones.filter(m => m.gate)
                const passedGates = gates.filter(m => m.gate?.passed)
                return [
                  { label: '总产物要求', value: `${allArts.length}`, sub: `${doneArts.length} 已完成` },
                  { label: '已入知识库', value: `${linkedArts.length}`, sub: '自动关联' },
                  { label: '阶段门禁', value: `${passedGates.length}/${gates.length}`, sub: '已通过' },
                  { label: '阻塞产物', value: `${allArts.length - doneArts.length}`, sub: '需尽快完成' },
                ].map((s, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderTop: i > 0 ? '1px solid var(--border-light)' : 'none' }}>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{s.label}</span>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: 16, fontWeight: 700 }}>{s.value}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-tertiary)', marginLeft: 6 }}>{s.sub}</span>
                    </div>
                  </div>
                ))
              })()}
            </div>
          </div>
        </div>
      )}
      {modal.render()}
    </div>
  )
}
