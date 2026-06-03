import { useState, useEffect } from 'react'
import { Avatar, Tag, useModal } from '../components/ui'
import { useTeamData } from '../context/TeamDataContext'
import type { KBDocument, DocSource } from '../types'

const FILTER_LABELS: Record<string, string> = {
  all: '全部', agent: 'Agent 产物', human: '个人产物', collab: '协作产物',
}

const AGENT_FILTER_OPTIONS = [
  { id: 'all', label: '所有 Agent', icon: '' },
  { id: 'wangchen', label: '王辰的 Agent', icon: '🎨' },
  { id: 'jianchuan', label: '鉴川的 Agent', icon: '⚙️' },
  { id: 'guangling', label: '广苓的 Agent', icon: '🧠' },
  { id: 'xuechen', label: '雪辰的 Agent', icon: '📋' },
  { id: 'xubai', label: '叙白的 Agent', icon: '🎯' },
  { id: 'mengyu', label: '孟雨的 Agent', icon: '🧪' },
]

const SOURCE_INFO: Record<DocSource, { label: string; variant: 'purple' | 'green' | 'blue' | 'orange' }> = {
  agent: { label: 'Agent 产物', variant: 'blue' },
  human: { label: '个人产物', variant: 'purple' },
  collab: { label: '人+Agent', variant: 'green' },
}

/* Agent 修改建议模拟 */
const AGENT_SUGGESTIONS: Record<string, string> = {
  xuechen: '建议在「验收标准」部分补充性能基线的具体数值，方便后续量化评估。',
  wangchen: '可以考虑在组件 Props 中增加 loading 状态，提升用户体验。',
  jianchuan: '建议在缓存策略章节补充缓存穿透和缓存雪崩的处理方案。',
  guangling: '建议增加模型冷启动场景的效果评估数据。',
  xubai: '可以增加视觉规范的配色色值说明，方便开发直接取用。',
  mengyu: '建议补充异常流量场景的用例设计。',
}

export default function KnowledgeBase() {
  const { kbDocs, loading } = useTeamData()
  const [filter, setFilter] = useState<string>('all')
  const [agentFilter, setAgentFilter] = useState<string>('all')
  const [agentFilterOpen, setAgentFilterOpen] = useState(false)
  const [docs, setDocs] = useState<KBDocument[]>([])
  const [readingDoc, setReadingDoc] = useState<KBDocument | null>(null)

  useEffect(() => {
    setDocs(kbDocs)
  }, [kbDocs])
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [agentReviewing, setAgentReviewing] = useState(false)
  const [agentSuggestion, setAgentSuggestion] = useState('')
  const modal = useModal()

  if (loading) return <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-tertiary)' }}>加载中...</div>

  let filteredDocs = filter === 'all' ? docs : docs.filter(d => d.source === filter)
  if (agentFilter !== 'all') {
    filteredDocs = filteredDocs.filter(d => d.agentId === agentFilter)
  }

  const currentAgentLabel = AGENT_FILTER_OPTIONS.find(a => a.id === agentFilter)?.label || '所有 Agent'

  const openDoc = (doc: KBDocument) => {
    setReadingDoc(doc)
    setEditTitle(doc.title)
    setEditContent(doc.content)
    setEditDesc(doc.desc)
    setIsEditing(false)
    setAgentReviewing(false)
    setAgentSuggestion('')
  }

  const closeDoc = () => {
    setReadingDoc(null)
    setIsEditing(false)
    setAgentReviewing(false)
  }

  const saveEdit = () => {
    if (!readingDoc) return
    setDocs(prev => prev.map(d => d.id === readingDoc.id
      ? { ...d, title: editTitle, content: editContent, desc: editDesc, updatedAt: '刚刚', version: bumpVersion(d.version) }
      : d
    ))
    setIsEditing(false)
    setReadingDoc(prev => prev ? { ...prev, title: editTitle, content: editContent, desc: editDesc, updatedAt: '刚刚', version: bumpVersion(prev.version) } : null)
  }

  const bumpVersion = (v: string) => {
    const m = v.match(/v(\d+)\.(\d+)/)
    if (!m) return v
    return `v${m[1]}.${parseInt(m[2]) + 1}`
  }

  const summonAgent = () => {
    setAgentReviewing(true)
    setAgentSuggestion('')
    setTimeout(() => {
      const suggestion = AGENT_SUGGESTIONS[readingDoc?.agentId || 'xuechen'] || AGENT_SUGGESTIONS.xuechen
      setAgentSuggestion(suggestion)
      setAgentReviewing(false)
    }, 1200)
  }

  const applySuggestion = () => {
    if (!agentSuggestion) return
    setEditContent(prev => prev + `\n\n---\n\n**💡 我的 Agent 建议**\n${agentSuggestion}`)
    setAgentSuggestion('')
  }

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div className="tabs" style={{ borderBottom: 'none' }}>
          {Object.entries(FILTER_LABELS).map(([key, label]) => (
            <div key={key} className={`tab-item${filter === key ? ' active' : ''}`} onClick={() => setFilter(key)}>
              {label}
              <span style={{ marginLeft: 4, fontSize: 11, color: 'var(--text-tertiary)' }}>
                ({key === 'all' ? docs.length : docs.filter(d => d.source === key).length})
              </span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {/* Agent 产出筛选器 */}
          <div className="agent-filter-wrapper">
            <button
              className={`btn btn-secondary btn-sm${agentFilter !== 'all' ? ' active-filter' : ''}`}
              onClick={() => setAgentFilterOpen(!agentFilterOpen)}
            >
              {agentFilter !== 'all' ? `${AGENT_FILTER_OPTIONS.find(a => a.id === agentFilter)?.icon} ${currentAgentLabel}` : '🤖 按 Agent 筛选'}
              <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor" style={{ marginLeft: 4, opacity: 0.5 }}>
                <path d="M4.427 7.427l3.396 3.396a.25.25 0 00.354 0l3.396-3.396A.25.25 0 0011.396 7H4.604a.25.25 0 00-.177.427z"/>
              </svg>
            </button>
            {agentFilterOpen && (
              <div className="agent-filter-dropdown">
                {AGENT_FILTER_OPTIONS.map(opt => (
                  <div
                    key={opt.id}
                    className={`agent-filter-item${agentFilter === opt.id ? ' active' : ''}`}
                    onClick={() => { setAgentFilter(opt.id); setAgentFilterOpen(false) }}
                  >
                    {opt.icon && <span style={{ marginRight: 6 }}>{opt.icon}</span>}
                    {opt.label}
                  </div>
                ))}
              </div>
            )}
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => {
            modal.open('🤖 AI 知识库整理', (
              <div>
                <p className="modal-desc">让 AI Agent 自动整理和优化知识库：</p>
                {['自动去重和合并相似文档', '为 Agent 产物生成摘要', '检查过时内容并提醒更新', '自动关联相关文档'].map((opt, i) => (
                  <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, marginBottom: 8 }}>
                    <input type="checkbox" defaultChecked={i < 3} /> {opt}
                  </label>
                ))}
                <div className="modal-actions">
                  <button className="btn btn-secondary" onClick={modal.close}>取消</button>
                  <button className="btn btn-primary" onClick={modal.close}>开始整理</button>
                </div>
              </div>
            ))
          }}>🤖 AI 整理</button>
          <button className="btn btn-primary btn-sm" onClick={() => {
            modal.open('新建知识库文档', (
              <div>
                <div className="form-group">
                  <label className="form-label">文档标题</label>
                  <input className="form-input" placeholder="输入文档标题..." />
                </div>
                <div className="form-group">
                  <label className="form-label">来源</label>
                  <select className="form-select">
                    <option>👤 个人编写</option>
                    <option>🤖 Agent 生成</option>
                    <option>🤝 人+Agent 协作</option>
                  </select>
                </div>
                <div className="modal-actions">
                  <button className="btn btn-secondary" onClick={modal.close}>取消</button>
                  <button className="btn btn-primary" onClick={modal.close}>创建</button>
                </div>
              </div>
            ))
          }}>+ 新建文档</button>
        </div>
      </div>

      {/* 当前筛选状态提示 */}
      {agentFilter !== 'all' && (
        <div className="filter-hint">
          当前筛选：<b>{currentAgentLabel}</b> 的产物
          <span className="filter-hint-clear" onClick={() => setAgentFilter('all')}>清除筛选 ×</span>
        </div>
      )}

      <div className="card">
        {filteredDocs.length > 0 ? filteredDocs.map(doc => {
          const src = SOURCE_INFO[doc.source]
          return (
            <div key={doc.id} className="kb-item" onClick={() => openDoc(doc)} style={{ cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div className="kb-title">{doc.title}</div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {doc.milestoneName && (
                    <span className="kb-milestone-tag" title={`关联里程碑：${doc.milestoneName}`}>
                      🏁 {doc.milestoneName}
                    </span>
                  )}
                  <Tag variant={src.variant}>{src.label}</Tag>
                </div>
              </div>
              <div className="kb-desc">{doc.desc}</div>
              {doc.dualDoc && (
                <div className="kb-dual-doc">
                  <span className="kb-dual-doc-icon">📖↔🤖</span>
                  <span className="kb-dual-doc-text">双文档：配对 <b>{doc.dualDoc.pairedTitle}</b></span>
                </div>
              )}
              {doc.relatedDocs && doc.relatedDocs.length > 0 && (
                <div className="kb-related">
                  <span className="kb-related-label">关联</span>
                  {doc.relatedDocs.map(rid => {
                    const rd = docs.find(d => d.id === rid)
                    return rd ? (
                      <span key={rid} className="kb-related-chip" title={rd.desc}>{rd.title}</span>
                    ) : null
                  })}
                </div>
              )}
              <div className="kb-meta">
                <Avatar name={doc.author.name} color={doc.author.color} size="sm" />
                <span>{doc.author.name}（{doc.author.role}）</span>
                {doc.agentName && <><span className="kb-meta-sep" /><span style={{ color: 'var(--accent)' }}>{doc.agentName}</span></>}
                <span className="kb-meta-sep" />
                <span>{doc.updatedAt}</span>
                <span className="kb-meta-sep" />
                <span>{doc.version}</span>
                <span className="kb-meta-sep" />
                {typeof doc.refCount === 'number' && (
                  <><span className="kb-health-ref">🔁 {doc.refCount} 次引用</span><span className="kb-meta-sep" /></>
                )}
                {doc.verifiedAt && (
                  <><span className="kb-health-verified">✅ {doc.verifiedAt}验证</span><span className="kb-meta-sep" /></>
                )}
                <span style={{ color: 'var(--text-tertiary)', fontSize: 11 }}>👁 点击阅读</span>
              </div>
            </div>
          )
        }) : (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 13 }}>
            暂无符合条件的文档
          </div>
        )}
      </div>

      {/* ===== 文档阅读/编辑模态框 ===== */}
      {readingDoc && (
        <div className="modal-overlay" onClick={closeDoc}>
          <div className="modal-panel kb-doc-panel" onClick={e => e.stopPropagation()}>
            {/* 头部 */}
            <div className="modal-header kb-doc-header">
              <div style={{ flex: 1, minWidth: 0 }}>
                {isEditing ? (
                  <input className="form-input" value={editTitle} onChange={e => setEditTitle(e.target.value)} style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }} />
                ) : (
                  <h3 className="modal-title" style={{ marginBottom: 4 }}>{readingDoc.title}</h3>
                )}
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <Tag variant={SOURCE_INFO[readingDoc.source].variant}>{SOURCE_INFO[readingDoc.source].label}</Tag>
                  {readingDoc.milestoneName && <span className="kb-milestone-tag">🏁 {readingDoc.milestoneName}</span>}
                  <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{readingDoc.version} · {readingDoc.updatedAt}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                {isEditing ? (
                  <>
                    <button className="btn btn-secondary btn-sm" onClick={() => setIsEditing(false)}>取消</button>
                    <button className="btn btn-primary btn-sm" onClick={saveEdit}>💾 保存</button>
                  </>
                ) : (
                  <>
                    <button className="btn btn-secondary btn-sm" onClick={() => setIsEditing(true)}>✏️ 编辑</button>
                    <button className="btn btn-icon" onClick={closeDoc}>✕</button>
                  </>
                )}
              </div>
            </div>

            {/* 作者信息 */}
            <div className="kb-doc-author-bar">
              <Avatar name={readingDoc.author.name} color={readingDoc.author.color} size="sm" />
              <span>{readingDoc.author.name}（{readingDoc.author.role}）</span>
              {readingDoc.agentName && <><span className="kb-meta-sep" /><span style={{ color: 'var(--accent)' }}>{readingDoc.agentName}</span></>}
              <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-tertiary)' }}>{readingDoc.contributors} 位贡献者</span>
            </div>

            {/* 内容区 */}
            <div className="kb-doc-body">
              {isEditing ? (
                <div>
                  <textarea className="form-textarea" value={editDesc} onChange={e => setEditDesc(e.target.value)} placeholder="文档摘要..." style={{ minHeight: 60, marginBottom: 12, fontSize: 13 }} />
                  <textarea className="form-textarea" value={editContent} onChange={e => setEditContent(e.target.value)} placeholder="文档内容..." style={{ minHeight: 400, fontSize: 13, lineHeight: 1.8, fontFamily: 'monospace' }} />
                </div>
              ) : (
                <div className="kb-doc-content">
                  <div className="kb-doc-desc">{readingDoc.desc}</div>
                  <pre className="kb-doc-text">{readingDoc.content}</pre>
                </div>
              )}
            </div>

            {/* Agent 协作区（仅编辑模式） */}
            {isEditing && (
              <div className="kb-doc-agent-bar">
                {agentReviewing ? (
                  <div className="kb-agent-thinking">
                    <span className="kb-agent-thinking-dot" />
                    <span>📋 我的 Agent 正在审阅文档...</span>
                  </div>
                ) : agentSuggestion ? (
                  <div className="kb-agent-suggestion">
                    <div className="kb-agent-suggestion-header">
                      <span>💡 我的 Agent 建议</span>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-xs btn-secondary" onClick={() => setAgentSuggestion('')}>忽略</button>
                        <button className="btn btn-xs btn-primary" onClick={applySuggestion}>采纳并插入</button>
                      </div>
                    </div>
                    <div className="kb-agent-suggestion-text">{agentSuggestion}</div>
                  </div>
                ) : (
                  <button className="btn btn-secondary btn-sm" onClick={summonAgent}>
                    📋 召唤我的 Agent 参与修改
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {modal.render()}
    </div>
  )
}
