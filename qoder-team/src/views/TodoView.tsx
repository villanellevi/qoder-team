import { useState } from 'react'
import { Tag, useModal } from '../components/ui'
import { useTeamData } from '../context/TeamDataContext'
import type { HumanTodo, AgentTodo, TodoItem, SegFilter } from '../types'

const SEG_LABELS: { key: SegFilter; label: string; icon?: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'mine', label: '待我处理' },
  { key: 'human', label: '人的任务', icon: '👤' },
  { key: 'agent', label: 'Agent 任务', icon: '🤖' },
]

export default function TodoView() {
  const [seg, setSeg] = useState<SegFilter>('all')
  const modal = useModal()
  const { todos, members, loading } = useTeamData()
  const me = members.find(m => m.isMe)
  const myName = me?.name || '雪辰'

  if (loading) return <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-tertiary)' }}>加载中...</div>

  const filtered = todos.filter(t => {
    if (seg === 'mine') return t.assignee === myName && t.status !== 'done'
    if (seg === 'human') return t.type === 'human'
    if (seg === 'agent') return t.type === 'agent'
    return true
  })
  const humanTodos = filtered.filter(t => t.type === 'human')
  const agentTodos = filtered.filter(t => t.type === 'agent')
  const mineCount = todos.filter(t => t.assignee === myName && t.status !== 'done').length

  return (
    <div className="fade-in">
      {/* 段控筛选 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div className="seg-control">
          {SEG_LABELS.map(s => (
            <button key={s.key} className={`seg-btn${seg === s.key ? ' active' : ''}`} onClick={() => setSeg(s.key)}>
              {s.icon && <span style={{ marginRight: 4 }}>{s.icon}</span>}
              {s.label}
              {s.key === 'mine' && mineCount > 0 && <span className="seg-badge">{mineCount}</span>}
            </button>
          ))}
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => {
          modal.open('新建 Todo', (
            <div>
              <div className="form-group"><label className="form-label">类型</label>
                <select className="form-select"><option>👤 人的任务</option><option>🤖 Agent 任务</option></select></div>
              <div className="form-group"><label className="form-label">任务标题</label><input className="form-input" placeholder="输入任务描述..." /></div>
              <div className="form-group"><label className="form-label">负责人</label>
                <select className="form-select"><option>雪辰</option><option>王辰</option><option>鉴川</option><option>广苓</option><option>叙白</option><option>孟雨</option></select></div>
              <div className="modal-actions"><button className="btn btn-secondary" onClick={modal.close}>取消</button><button className="btn btn-primary" onClick={modal.close}>创建</button></div>
            </div>
          ))
        }}>+ 新建</button>
      </div>

      {/* 人的任务 —— 卡片 */}
      {humanTodos.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div className="todo-section-header">
            <span className="todo-section-icon">👤</span>
            <span className="todo-section-title">人的任务</span>
            <span className="todo-section-count">{humanTodos.length}</span>
          </div>
          <div className="todo-human-list">
            {humanTodos.map(todo => {
              const t = todo as HumanTodo
              return (
                <div key={t.id} className="todo-human-card">
                  <div className="todo-human-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                      <Tag variant={t.priority === 'high' ? 'red' : t.priority === 'medium' ? 'orange' : 'gray'}>{t.priority === 'high' ? '高' : t.priority === 'medium' ? '中' : '低'}</Tag>
                      <span className="todo-human-title">{t.title}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Tag variant={t.status === 'done' ? 'green' : t.status === 'in-progress' ? 'blue' : 'gray'}>{t.status === 'done' ? '已完成' : t.status === 'in-progress' ? '进行中' : '待处理'}</Tag>
                      <span className="todo-human-due">{t.due}</span>
                    </div>
                  </div>
                  <div className="todo-human-assignee">负责人：<b>{t.assignee}</b></div>
                  <div className="todo-human-section"><div className="todo-human-label">📋 背景</div><div className="todo-human-text">{t.background}</div></div>
                  <div className="todo-human-section"><div className="todo-human-label">📎 资料</div>
                    <div className="todo-human-tags">{t.materials.map((m, i) => <Tag key={i} variant="blue">{m}</Tag>)}</div></div>
                  <div className="todo-human-section"><div className="todo-human-label">✅ 要做的事</div>
                    <div className="todo-human-actions">{t.actions.map((a, i) => <div key={i} className="todo-action-item"><span className="todo-action-check">○</span><span>{a}</span></div>)}</div></div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Agent 任务 —— 表格 */}
      {agentTodos.length > 0 && (
        <div>
          <div className="todo-section-header">
            <span className="todo-section-icon">🤖</span>
            <span className="todo-section-title">Agent 任务</span>
            <span className="todo-section-count">{agentTodos.length}</span>
          </div>
          <div className="card">
            <table className="data-table">
              <thead><tr><th>任务</th><th>Agent</th><th>负责人</th><th>优先级</th><th>状态</th><th>进度</th><th>截止</th></tr></thead>
              <tbody>
                {agentTodos.map(todo => {
                  const t = todo as AgentTodo
                  return (
                    <tr key={t.id}>
                      <td style={{ fontWeight: 500 }}>{t.title}</td>
                      <td style={{ fontSize: 12 }}>{t.agent}</td>
                      <td>{t.assignee}</td>
                      <td><Tag variant={t.priority === 'high' ? 'red' : t.priority === 'medium' ? 'orange' : 'gray'}>{t.priority === 'high' ? '高' : t.priority === 'medium' ? '中' : '低'}</Tag></td>
                      <td><Tag variant={t.status === 'done' ? 'green' : t.status === 'in-progress' ? 'blue' : 'gray'}>{t.status === 'done' ? '已完成' : t.status === 'in-progress' ? '进行中' : '待处理'}</Tag></td>
                      <td style={{ fontSize: 12, color: 'var(--text-tertiary)', maxWidth: 140 }}>{t.progress || '—'}</td>
                      <td style={{ color: 'var(--text-tertiary)' }}>{t.due}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filtered.length === 0 && <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 13 }}>暂无符合条件的任务</div>}
      {modal.render()}
    </div>
  )
}
