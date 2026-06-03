import { useState } from 'react'
import { Avatar, Tag, useModal } from '../components/ui'
import type { KBDocument, DocSource } from '../types'

const DOCS: KBDocument[] = [
  {
    id: '1', title: '推荐系统 API 接口规范 v2',
    desc: '鉴川的 Agent 自动生成的 RESTful API 文档，包含数据输入、模型推理、结果缓存端点',
    content: `# 推荐系统 API 接口规范 v2

## 1. 批量推荐接口

### GET /api/v2/recommend/batch

**请求参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| count | integer | 否 | 返回条数，默认20，最大50 |
| user_id | string | 是 | 用户唯一标识 |
| scene | string | 否 | 场景标识：home/feed/detail |

**响应结构：**
\`\`\`json
{
  "code": 0,
  "data": {
    "items": [
      {
        "item_id": "string",
        "title": "string",
        "cover_url": "string",
        "reason_html": "string",
        "score": 0.95
      }
    ],
    "trace_id": "string"
  }
}
\`\`\`

## 2. 缓存策略

- Redis Key: \`recommend:batch:{hash}\`
- TTL: 600s
- 降级策略：本地缓存兜底 → 限流 → 静态列表

## 3. 性能基线

- P50 < 50ms
- P99 < 200ms
- 缓存命中率 > 80%`,
    category: 'api', source: 'agent', agentId: 'jianchuan', agentName: '⚙️ 鉴川的 Agent',
    author: { name: '鉴川', role: '后端', color: 'blue' }, updatedAt: '3 小时前', contributors: 3, version: 'v2.1',
    milestoneId: 'ms-3', milestoneName: '接口开发',
    dualDoc: { type: 'human', pairedTitle: 'recommend-api.yaml (OpenAPI Spec)' },
  },
  {
    id: '2', title: 'RecommendCard.tsx 组件',
    desc: '王辰的 Agent 根据需求自动生成的推荐卡片组件，含虚拟列表和 HTML 渲染',
    content: `// RecommendCard.tsx
// 推荐卡片组件，支持懒加载和虚拟列表

import { useLazyImage } from './hooks/useLazyImage'

interface RecommendCardProps {
  title: string
  cover: string
  reason: string
  score?: number
}

export function RecommendCard({ title, cover, reason, score }: RecommendCardProps) {
  const { ref, loaded } = useLazyImage(cover)

  return (
    <div className="recommend-card">
      <img ref={ref} src={loaded ? cover : placeholder} alt={title} />
      <h3>{title}</h3>
      <div dangerouslySetInnerHTML={{ __html: reason }} />
      {score && <span className="score">{score.toFixed(2)}</span>}
    </div>
  )
}`,
    category: 'agent-output', source: 'agent', agentId: 'wangchen', agentName: '🎨 王辰的 Agent',
    author: { name: '王辰', role: '前端', color: 'green' }, updatedAt: '2 小时前', contributors: 1, version: 'v1.0',
    milestoneId: 'ms-4', milestoneName: '前端开发',
  },
  {
    id: '3', title: '模型 v2.1 推理性能报告',
    desc: '广苓的 Agent 自动生成的模型评估报告，P99=118ms，批量 20 条=350ms',
    content: `# 模型 v2.1 推理性能报告

## 模型信息
- 名称: recommend-bert-v2.1
- 参数量: 110M
- 框架: ONNX Runtime
- 量化: INT8

## 性能数据

| 指标 | v2.0 | v2.1 | 提升 |
|------|------|------|------|
| P50 | 52ms | 45ms | +13% |
| P99 | 138ms | 118ms | +15% |
| 准确率 | 0.823 | 0.849 | +3.2% |

## 批量推理
- 20条/批: 350ms
- 50条/批: 780ms

## 建议
建议灰度10%流量做A/B验证，核心指标CTR提升>2%。`,
    category: 'agent-output', source: 'agent', agentId: 'guangling', agentName: '🧠 广苓的 Agent',
    author: { name: '广苓', role: '算法', color: 'orange' }, updatedAt: '4 小时前', contributors: 1, version: 'v1.0',
    milestoneId: 'ms-5', milestoneName: '模型训练',
  },
  {
    id: '4', title: 'Prompt 工程最佳实践 — Agent 对话模板库',
    desc: '整理了各 Agent 常用的 Prompt 模板和优化技巧',
    content: `# Prompt 工程最佳实践

## 1. 角色定义模板
\`\`\`
你是一个专业的{role} Agent，擅长{skills}。
你的任务是根据需求{task}，注意{constraints}。
\`\`\`

## 2. 上下文注入
- 始终注入当前项目上下文
- 引用知识库中的相关文档
- 保持对话历史连续性

## 3. 输出格式控制
- 代码生成：要求注释和类型定义
- 文档生成：要求 Markdown 格式
- 分析任务：要求结构化输出

## 4. 安全约束
- 禁止生成敏感信息
- 涉及生产环境操作需审批
- 模型上线前必须完成评估`,
    category: 'practice', source: 'human',
    author: { name: '雪辰', role: '产品', color: 'purple' }, updatedAt: '2 天前', contributors: 4, version: 'v3.0',
  },
  {
    id: '5', title: 'React 性能优化指南',
    desc: '鉴川整理的 React 性能优化最佳实践，含代码示例和测试数据',
    content: `# React 性能优化指南

## 1. 渲染优化
- 使用 React.memo 避免不必要的重渲染
- useMemo / useCallback 合理使用
- 虚拟列表处理大数据量

## 2. 加载优化
- 图片懒加载（Intersection Observer）
- 代码分割（React.lazy + Suspense）
- 预加载关键资源

## 3. 状态管理
- 避免状态层级过深
- 使用 Zustand 替代 Redux（轻量场景）
- 服务端状态用 React Query

## 4. 测试数据
| 优化项 | 优化前 | 优化后 |
|--------|--------|--------|
| 首屏加载 | 2.3s | 1.1s |
| 交互响应 | 120ms | 45ms |`,
    category: 'practice', source: 'human',
    author: { name: '鉴川', role: '后端', color: 'blue' }, updatedAt: '昨天', contributors: 2, version: 'v1.2',
  },
  {
    id: '6', title: 'PRD v2.3 — 推荐系统重构',
    desc: '雪辰的 Agent 辅助生成，雪辰审核确认的需求文档',
    content: `# PRD v2.3 — 推荐系统重构

## 背景
当前推荐卡片展示存在性能瓶颈，需重构前端组件、后端接口和算法模型。

## 目标
- 批量接口响应 < 500ms
- 缓存命中率 > 80%
- 推荐理由 HTML 渲染
- 模型准确率提升 > 3%

## 需求拆解

### 前端
- RecommendCard 组件重构
- 虚拟列表支持
- 图片懒加载

### 后端
- 批量推荐接口
- Redis 缓存层
- 降级策略

### 算法
- v2.1 模型训练
- INT8 量化
- A/B 实验方案

## 验收标准
1. 接口 P99 < 200ms
2. 首屏加载 < 1.5s
3. CTR 提升 > 2%
4. 用例覆盖率 > 90%`,
    category: 'note', source: 'collab', agentId: 'xuechen', agentName: '📋 雪辰的 Agent',
    author: { name: '雪辰', role: '产品', color: 'purple' }, updatedAt: '1 天前', contributors: 2, version: 'v2.3',
    milestoneId: 'ms-1', milestoneName: '需求评审',
    dualDoc: { type: 'human', pairedTitle: 'PRD-prompt-template.md (Agent Prompt)' },
  },
  {
    id: '7', title: 'useLazyImage Hook',
    desc: '王辰的 Agent 封装的图片懒加载 Hook，基于 Intersection Observer',
    content: `import { useEffect, useRef, useState } from 'react'

export function useLazyImage(src: string) {
  const ref = useRef<HTMLImageElement>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setLoaded(true)
            observer.disconnect()
          }
        })
      },
      { rootMargin: '50px' }
    )

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [src])

  return { ref, loaded }
}`,
    category: 'agent-output', source: 'agent', agentId: 'wangchen', agentName: '🎨 王辰的 Agent',
    author: { name: '王辰', role: '前端', color: 'green' }, updatedAt: '1 小时前', contributors: 1, version: 'v1.0',
    milestoneId: 'ms-4', milestoneName: '前端开发',
  },
]

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
  const [filter, setFilter] = useState<string>('all')
  const [agentFilter, setAgentFilter] = useState<string>('all')
  const [agentFilterOpen, setAgentFilterOpen] = useState(false)
  const [docs, setDocs] = useState(DOCS)
  const [readingDoc, setReadingDoc] = useState<KBDocument | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [agentReviewing, setAgentReviewing] = useState(false)
  const [agentSuggestion, setAgentSuggestion] = useState('')
  const modal = useModal()

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
              <div className="kb-meta">
                <Avatar name={doc.author.name} color={doc.author.color} size="sm" />
                <span>{doc.author.name}（{doc.author.role}）</span>
                {doc.agentName && <><span className="kb-meta-sep" /><span style={{ color: 'var(--accent)' }}>{doc.agentName}</span></>}
                <span className="kb-meta-sep" />
                <span>{doc.updatedAt}</span>
                <span className="kb-meta-sep" />
                <span>{doc.version}</span>
                <span className="kb-meta-sep" />
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
