import { Tag } from '../components/ui'

/* ===== Agent 质检数据 ===== */
const AGENT_QA_DATA = [
  {
    id: 'wangchen', name: '王辰的 Agent', icon: '🎨', owner: '王辰',
    metrics: { tasks: 24, completed: 22, errors: 2, avgTime: '3.2m', accuracy: '92%' },
    recent: [
      { task: '推荐卡片组件', quality: 'pass', time: '2.5m' },
      { task: '表单验证模块', quality: 'pass', time: '4.1m' },
      { task: '用户列表页', quality: 'warn', time: '5.8m' },
    ],
  },
  {
    id: 'jianchuan', name: '鉴川的 Agent', icon: '⚙️', owner: '鉴川',
    metrics: { tasks: 31, completed: 29, errors: 2, avgTime: '4.5m', accuracy: '94%' },
    recent: [
      { task: '推荐批量接口', quality: 'pass', time: '3.8m' },
      { task: 'Redis 缓存集成', quality: 'pass', time: '5.2m' },
      { task: '用户鉴权中间件', quality: 'pass', time: '4.0m' },
    ],
  },
  {
    id: 'guangling', name: '广苓的 Agent', icon: '🧠', owner: '广苓',
    metrics: { tasks: 18, completed: 17, errors: 1, avgTime: '8.3m', accuracy: '94%' },
    recent: [
      { task: '模型 v2.1 训练', quality: 'pass', time: '12m' },
      { task: '推理脚本打包', quality: 'pass', time: '6.5m' },
      { task: '特征工程优化', quality: 'warn', time: '9.1m' },
    ],
  },
  {
    id: 'xuechen', name: '雪辰的 Agent', icon: '📋', owner: '雪辰',
    metrics: { tasks: 15, completed: 15, errors: 0, avgTime: '2.1m', accuracy: '100%' },
    recent: [
      { task: 'PRD v2.3 生成', quality: 'pass', time: '1.5m' },
      { task: '验收标准拆解', quality: 'pass', time: '2.8m' },
      { task: '竞品分析报告', quality: 'pass', time: '3.2m' },
    ],
  },
]

const COLLAB_LOG = [
  { from: '🎨', fromName: '王辰的 Agent', to: '⚙️', toName: '鉴川的 Agent', type: '接口对齐', status: 'resolved', time: '14:33' },
  { from: '⚙️', fromName: '鉴川的 Agent', to: '🧠', toName: '广苓的 Agent', type: '延迟确认', status: 'resolved', time: '14:35' },
  { from: '🧠', fromName: '广苓的 Agent', to: '⚙️', toName: '鉴川的 Agent', type: '脚本交付', status: 'resolved', time: '14:37' },
  { from: '📋', fromName: '雪辰的 Agent', to: 'all', toName: '所有 Agent', type: '需求变更通知', status: 'resolved', time: '14:20' },
]

export default function AgentQA() {
  return (
    <div className="fade-in">
      {/* 总览指标 */}
      <div className="grid grid-4" style={{ marginBottom: 16 }}>
        <div className="stat-card">
          <div className="stat-label">总任务数</div>
          <div className="stat-value">88</div>
          <div className="stat-meta positive">本周 +12</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">完成率</div>
          <div className="stat-value">94%</div>
          <div className="stat-meta positive">↑ 3%</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">平均耗时</div>
          <div className="stat-value">4.5m</div>
          <div className="stat-meta positive">↓ 1.2m</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Agent 间协作</div>
          <div className="stat-value">16</div>
          <div className="stat-meta">次自动协作</div>
        </div>
      </div>

      {/* Agent 质量卡片 */}
      <div className="grid grid-2" style={{ marginBottom: 16 }}>
        {AGENT_QA_DATA.map(agent => (
          <div key={agent.id} className="card">
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 20 }}>{agent.icon}</span>
                <div>
                  <div className="card-title">{agent.name}</div>
                  <div className="card-subtitle">所有者：{agent.owner}</div>
                </div>
              </div>
              <Tag variant={Number(agent.metrics.accuracy.replace('%','')) >= 90 ? 'green' : 'orange'}>
                准确率 {agent.metrics.accuracy}
              </Tag>
            </div>
            <div className="card-body">
              <div className="grid grid-4" style={{ marginBottom: 12 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{agent.metrics.tasks}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>总任务</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--green)' }}>{agent.metrics.completed}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>完成</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: agent.metrics.errors > 0 ? 'var(--red)' : 'var(--green)' }}>{agent.metrics.errors}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>错误</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{agent.metrics.avgTime}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>平均耗时</div>
                </div>
              </div>

              {/* 质量条 */}
              <div className="qa-bar-container">
                <div className="qa-bar">
                  <div className="qa-bar-fill pass" style={{ width: `${(agent.metrics.completed / agent.metrics.tasks) * 100}%` }} />
                  <div className="qa-bar-fill error" style={{ width: `${(agent.metrics.errors / agent.metrics.tasks) * 100}%` }} />
                </div>
              </div>

              {/* 最近任务 */}
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 600, marginBottom: 6 }}>最近任务</div>
                {agent.recent.map((r, i) => (
                  <div key={i} className="qa-recent-row">
                    <span style={{ fontSize: 12, flex: 1 }}>{r.task}</span>
                    <Tag variant={r.quality === 'pass' ? 'green' : 'orange'}>
                      {r.quality === 'pass' ? '通过' : '需关注'}
                    </Tag>
                    <span style={{ fontSize: 11, color: 'var(--text-tertiary)', width: 40, textAlign: 'right' }}>{r.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 协作日志 */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Agent 间协作日志</div>
          <Tag variant="blue">今日 {COLLAB_LOG.length} 次</Tag>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>发起方</th>
              <th>接收方</th>
              <th>类型</th>
              <th>状态</th>
              <th>时间</th>
            </tr>
          </thead>
          <tbody>
            {COLLAB_LOG.map((log, i) => (
              <tr key={i}>
                <td><span style={{ marginRight: 4 }}>{log.from}</span> {log.fromName}</td>
                <td><span style={{ marginRight: 4 }}>{log.to}</span> {log.toName}</td>
                <td>{log.type}</td>
                <td><Tag variant="green">已解决</Tag></td>
                <td style={{ color: 'var(--text-tertiary)' }}>{log.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
