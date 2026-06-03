import { useState } from 'react'
import { Tag, Avatar, useModal } from '../components/ui'
import { MEMBERS } from '../data'
import type { Milestone, MilestoneArtifact, DailyReport } from '../types'

const MILESTONES_DATA: Milestone[] = [
  {
    id: 'ms-1', name: '需求评审', status: 'done', date: '5/15', owner: '雪辰',
    requiredArtifacts: [
      { name: 'PRD v2.3', type: 'doc', docId: '6', status: 'done', author: '雪辰', completedAt: '5/14' },
      { name: '用户故事拆解', type: 'doc', status: 'done', author: '雪辰', completedAt: '5/15' },
      { name: '需求评审会议纪要', type: 'doc', status: 'done', author: '雪辰', completedAt: '5/15' },
    ],
    gate: { name: '需求对齐会', passed: true },
  },
  {
    id: 'ms-2', name: '技术方案', status: 'done', date: '5/18', owner: '鉴川',
    requiredArtifacts: [
      { name: '架构设计文档', type: 'doc', status: 'done', author: '鉴川', completedAt: '5/17' },
      { name: 'API 接口规范 v2', type: 'doc', docId: '1', status: 'done', author: '鉴川', completedAt: '5/18' },
      { name: '技术选型评估', type: 'doc', status: 'done', author: '鉴川', completedAt: '5/16' },
    ],
    gate: { name: '技术评审会', passed: true },
  },
  {
    id: 'ms-3', name: '接口开发', status: 'running', date: '5/22', owner: '鉴川',
    requiredArtifacts: [
      { name: 'recommend-api.yaml', type: 'code', docId: '1', status: 'done', author: '鉴川', completedAt: '5/21' },
      { name: '缓存降级策略代码', type: 'code', status: 'missing' },
      { name: '接口联调文档', type: 'doc', status: 'missing' },
      { name: 'SDK 包', type: 'code', status: 'missing' },
    ],
  },
  {
    id: 'ms-4', name: '前端开发', status: 'running', date: '5/24', owner: '王辰',
    requiredArtifacts: [
      { name: 'RecommendCard.tsx', type: 'code', docId: '2', status: 'done', author: '王辰', completedAt: '5/23' },
      { name: 'useLazyImage Hook', type: 'code', docId: '7', status: 'done', author: '王辰', completedAt: '5/24' },
      { name: '视觉还原验收', type: 'design', status: 'missing' },
    ],
  },
  {
    id: 'ms-5', name: '模型训练', status: 'done', date: '5/20', owner: '广苓',
    requiredArtifacts: [
      { name: 'model-v2.1.tar.gz', type: 'model', docId: '3', status: 'done', author: '广苓', completedAt: '5/19' },
      { name: 'A/B 实验方案', type: 'doc', status: 'done', author: '广苓', completedAt: '5/20' },
      { name: '性能评估报告', type: 'doc', docId: '3', status: 'done', author: '广苓', completedAt: '5/20' },
    ],
  },
  {
    id: 'ms-6', name: '设计验收', status: 'running', date: '5/26', owner: '叙白',
    requiredArtifacts: [
      { name: '视觉规范文档', type: 'design', status: 'done', author: '叙白', completedAt: '5/25' },
      { name: '交互走查报告', type: 'design', status: 'missing' },
    ],
    gate: { name: '设计走查会', passed: false },
  },
  {
    id: 'ms-7', name: '联调测试', status: 'waiting', date: '5/28', owner: '孟雨',
    requiredArtifacts: [
      { name: '测试用例集', type: 'test', status: 'missing' },
      { name: '自动化测试报告', type: 'test', status: 'missing' },
      { name: '性能压测报告', type: 'test', status: 'missing' },
    ],
    gate: { name: '联调对齐会', passed: false },
  },
  {
    id: 'ms-8', name: '灰度发布', status: 'waiting', date: '6/1', owner: '鉴川',
    requiredArtifacts: [
      { name: '灰度方案', type: 'config', status: 'missing' },
      { name: '回滚预案', type: 'config', status: 'missing' },
      { name: '监控大盘配置', type: 'config', status: 'missing' },
    ],
  },
  {
    id: 'ms-9', name: '全量上线', status: 'waiting', date: '6/5', owner: '全员',
    requiredArtifacts: [
      { name: '上线 Checklist', type: 'doc', status: 'missing' },
      { name: 'A/B 实验结论', type: 'doc', status: 'missing' },
      { name: '发版 Release Notes', type: 'doc', status: 'missing' },
    ],
    gate: { name: '发布评审会', passed: false },
  },
]

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

/* ===== 日报数据 ===== */
const TEAM_DAILY: DailyReport[] = [
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

const ARTIFACT_TYPE_ICON: Record<string, string> = {
  doc: '📄', code: '💻', design: '🎨', model: '🧠', test: '🧪', config: '⚙️',
}

type ProgressView = 'milestone' | 'swimlane' | 'daily'

export default function ProjectProgress() {
  const [milestones, setMilestones] = useState<Milestone[]>(MILESTONES_DATA)
  const [expandedMs, setExpandedMs] = useState<string | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [view, setView] = useState<ProgressView>('milestone')
  const [dailyFilter, setDailyFilter] = useState<string>('all')
  const modal = useModal()

  const doneCount = milestones.filter(m => m.status === 'done').length
  const totalCount = milestones.length
  const progressPercent = Math.round((doneCount / totalCount) * 100)

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

  const filteredDaily = dailyFilter === 'all' ? TEAM_DAILY : TEAM_DAILY.filter(d => d.memberId === dailyFilter)

  return (
    <div className="fade-in">
      {/* 项目信息头 */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-body">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>推荐系统重构 v2</h2>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                重构推荐卡片展示，支持批量获取、缓存优化、模型升级
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Tag variant="green">进行中</Tag>
              <Tag variant="blue">{progressPercent}%</Tag>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 24, marginTop: 12, fontSize: 12, color: 'var(--text-secondary)' }}>
            <span>开始：2024/5/15</span>
            <span>截止：2024/6/5</span>
            <span>
              成员：
              <span style={{ display: 'inline-flex', marginLeft: 4, verticalAlign: 'middle' }}>
                <Avatar name="雪" color="purple" size="sm" />
                <Avatar name="王" color="green" size="sm" />
                <Avatar name="鉴" color="blue" size="sm" />
                <Avatar name="广" color="orange" size="sm" />
                <Avatar name="叙" color="pink" size="sm" />
                <Avatar name="孟" color="cyan" size="sm" />
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
              <div className="card-title">📰 团队日报 — 5/29</div>
              <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{TEAM_DAILY.length} 人提交</span>
            </div>
            <div className="card-body">
              <div className="daily-summary">
                <div className="daily-stat">
                  <span className="daily-stat-num">{TEAM_DAILY.reduce((s, d) => s + d.done.length, 0)}</span>
                  <span className="daily-stat-label">已完成</span>
                </div>
                <div className="daily-stat">
                  <span className="daily-stat-num">{TEAM_DAILY.reduce((s, d) => s + d.todo.length, 0)}</span>
                  <span className="daily-stat-label">待完成</span>
                </div>
                <div className="daily-stat">
                  <span className="daily-stat-num daily-stat-warn">{TEAM_DAILY.reduce((s, d) => s + d.blockers.length, 0)}</span>
                  <span className="daily-stat-label">阻塞项</span>
                </div>
              </div>
              {TEAM_DAILY.some(d => d.blockers.length > 0) && (
                <div className="daily-blockers">
                  <div className="daily-blockers-title">⚠️ 今日阻塞</div>
                  {TEAM_DAILY.filter(d => d.blockers.length > 0).map(d => {
                    const member = MEMBERS.find(m => m.id === d.memberId)
                    return (
                      <div key={d.memberId} className="daily-blocker-item">
                        <span>{member?.agent.icon} {member?.name}：</span>
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
              <div className={`tab-item${dailyFilter === 'all' ? ' active' : ''}`} onClick={() => setDailyFilter('all')}>全员</div>
              {MEMBERS.map(m => (
                <div key={m.id} className={`tab-item${dailyFilter === m.id ? ' active' : ''}`} onClick={() => setDailyFilter(m.id)}>
                  {m.agent.icon} {m.name}
                </div>
              ))}
            </div>
          </div>

          {/* 个人日报卡片 */}
          <div className="daily-grid">
            {filteredDaily.map(d => {
              const member = MEMBERS.find(m => m.id === d.memberId)!
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
                      <div className="daily-section-title">✅ 已完成（{d.done.length}）</div>
                      {d.done.map((item, i) => (
                        <div key={i} className="daily-item done">{item}</div>
                      ))}
                    </div>
                    <div className="daily-section">
                      <div className="daily-section-title">📋 待完成（{d.todo.length}）</div>
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
