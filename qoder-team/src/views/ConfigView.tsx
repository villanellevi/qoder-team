import { useState } from 'react'
import { Tag, useModal } from '../components/ui'
import { useTeamData } from '../context/TeamDataContext'
import type { ConfigTab, AgentAsset, SkillItem, WorkflowItem, MemoryItem, PermRule, AgentFAQItem } from '../types'

/* ----- 权限规则数据 ----- */
const PERM_RULES: PermRule[] = [
  { op: '部署到生产环境', agent: '⚙️ 鉴川的 Agent', mode: '审批', approver: '产品/后端' },
  { op: '代码生成 & PR', agent: '所有 Agent', mode: '自主', approver: '—' },
  { op: '知识库文档创建', agent: '所有 Agent', mode: '自主', approver: '—' },
  { op: '知识库文档删除', agent: '所有 Agent', mode: '审批', approver: '文档所有者' },
  { op: '模型上线', agent: '🧠 广苓的 Agent', mode: '审批', approver: '产品/算法' },
  { op: '单元测试执行', agent: '所有 Agent', mode: '自主', approver: '—' },
]

export default function ConfigView() {
  const [tab, setTab] = useState<ConfigTab>('assets')
  const [selectedAgent, setSelectedAgent] = useState('xuechen')
  const [assets, setAssets] = useState<Record<string, AgentAsset>>({})
  const [editingPrompt, setEditingPrompt] = useState(false)
  const [promptValue, setPromptValue] = useState('')
  const [editingSkill, setEditingSkill] = useState<number | null>(null)
  const [skillEditValue, setSkillEditValue] = useState({ name: '', desc: '' })
  const [editingMemory, setEditingMemory] = useState<number | null>(null)
  const [memoryEditValue, setMemoryEditValue] = useState({ key: '', value: '' })
  const [editingFaq, setEditingFaq] = useState<number | null>(null)
  const [faqEditValue, setFaqEditValue] = useState({ question: '', answer: '' })
  const [analyzingFaq, setAnalyzingFaq] = useState<number | null>(null)
  const modal = useModal()
  const { members, agentAssets, kbDocs, loading } = useTeamData()

  if (loading) {
    return (
      <div className="fade-in">
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)' }}>加载中...</div>
      </div>
    )
  }

  const member = members.find(m => m.id === selectedAgent)
  if (!member) {
    return (
      <div className="fade-in">
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)' }}>未找到成员</div>
      </div>
    )
  }
  const asset = assets[selectedAgent] || agentAssets[selectedAgent]
  if (!asset) {
    return (
      <div className="fade-in">
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)' }}>未找到 Agent 资产</div>
      </div>
    )
  }

  const updateAsset = (patch: Partial<AgentAsset>) => {
    setAssets(prev => ({
      ...prev,
      [selectedAgent]: { ...(prev[selectedAgent] || agentAssets[selectedAgent] || {}), ...patch },
    }))
  }

  const handleEditPrompt = () => {
    setPromptValue(asset.systemPrompt)
    setEditingPrompt(true)
  }
  const handleSavePrompt = () => {
    updateAsset({ systemPrompt: promptValue })
    setEditingPrompt(false)
  }

  /* --- Skill 增删改 --- */
  const addSkill = () => {
    modal.open(`为 ${member.agent.name} 添加 Skill`, (
      <div>
        <div className="form-group"><label className="form-label">Skill 名称</label><input className="form-input" id="new-skill-name" placeholder="如：API 文档生成" /></div>
        <div className="form-group"><label className="form-label">描述</label><textarea className="form-textarea" id="new-skill-desc" placeholder="简述该 Skill 的能力..." style={{ minHeight: 60 }} /></div>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={modal.close}>取消</button>
          <button className="btn btn-primary" onClick={() => {
            const name = (document.getElementById('new-skill-name') as HTMLInputElement)?.value
            const desc = (document.getElementById('new-skill-desc') as HTMLTextAreaElement)?.value
            if (name) { updateAsset({ skills: [...asset.skills, { name, desc }] }); modal.close() }
          }}>添加</button>
        </div>
      </div>
    ))
  }
  const removeSkill = (idx: number) => {
    const next = [...asset.skills]
    next.splice(idx, 1)
    updateAsset({ skills: next })
  }
  const startEditSkill = (idx: number) => {
    setSkillEditValue({ name: asset.skills[idx].name, desc: asset.skills[idx].desc })
    setEditingSkill(idx)
  }
  const saveSkillEdit = () => {
    if (editingSkill === null) return
    const next = [...asset.skills]
    next[editingSkill] = { ...next[editingSkill], ...skillEditValue }
    updateAsset({ skills: next })
    setEditingSkill(null)
  }

  /* --- Workflow 增删改 --- */
  const addWorkflow = () => {
    modal.open(`为 ${member.agent.name} 添加工作流`, (
      <div>
        <div className="form-group"><label className="form-label">工作流名称</label><input className="form-input" id="new-wf-name" placeholder="如：Bug 修复流程" /></div>
        <div className="form-group"><label className="form-label">步骤（用逗号分隔）</label><input className="form-input" id="new-wf-steps" placeholder="发现, 分析, 修复, 验证, 关闭" /></div>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={modal.close}>取消</button>
          <button className="btn btn-primary" onClick={() => {
            const name = (document.getElementById('new-wf-name') as HTMLInputElement)?.value
            const stepsStr = (document.getElementById('new-wf-steps') as HTMLInputElement)?.value
            if (name && stepsStr) {
              updateAsset({ workflows: [...asset.workflows, { name, steps: stepsStr.split(/[,，]/).map(s => s.trim()).filter(Boolean) }] })
              modal.close()
            }
          }}>添加</button>
        </div>
      </div>
    ))
  }
  const removeWorkflow = (idx: number) => {
    const next = [...asset.workflows]
    next.splice(idx, 1)
    updateAsset({ workflows: next })
  }

  /* --- Memory 增删改 --- */
  const addMemory = () => {
    modal.open(`为 ${member.agent.name} 添加 Memory`, (
      <div>
        <div className="form-group"><label className="form-label">Key</label><input className="form-input" id="new-mem-key" placeholder="如：技术栈" /></div>
        <div className="form-group"><label className="form-label">Value</label><input className="form-input" id="new-mem-val" placeholder="如：React 18 + TypeScript" /></div>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={modal.close}>取消</button>
          <button className="btn btn-primary" onClick={() => {
            const key = (document.getElementById('new-mem-key') as HTMLInputElement)?.value
            const value = (document.getElementById('new-mem-val') as HTMLInputElement)?.value
            if (key) { updateAsset({ memory: [...asset.memory, { key, value, updatedAt: '刚刚' }] }); modal.close() }
          }}>添加</button>
        </div>
      </div>
    ))
  }
  const removeMemory = (idx: number) => {
    const next = [...asset.memory]
    next.splice(idx, 1)
    updateAsset({ memory: next })
  }
  const startEditMemory = (idx: number) => {
    setMemoryEditValue({ key: asset.memory[idx].key, value: asset.memory[idx].value })
    setEditingMemory(idx)
  }
  const saveMemoryEdit = () => {
    if (editingMemory === null) return
    const next = [...asset.memory]
    next[editingMemory] = { ...next[editingMemory], ...memoryEditValue, updatedAt: '刚刚' }
    updateAsset({ memory: next })
    setEditingMemory(null)
  }

  /* --- FAQ 增删改 + AI分析 --- */
  const addFaq = () => {
    modal.open(`为 ${member.agent.name} 添加 FAQ`, (
      <div>
        <div className="form-group"><label className="form-label">问题</label><input className="form-input" id="new-faq-q" placeholder="用户提出的问题..." /></div>
        <div className="form-group"><label className="form-label">回答</label><textarea className="form-textarea" id="new-faq-a" placeholder="Agent 的解答..." style={{ minHeight: 60 }} /></div>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={modal.close}>取消</button>
          <button className="btn btn-primary" onClick={() => {
            const question = (document.getElementById('new-faq-q') as HTMLInputElement)?.value
            const answer = (document.getElementById('new-faq-a') as HTMLTextAreaElement)?.value
            if (question && answer) {
              updateAsset({ faq: [...asset.faq, { id: Date.now().toString(), question, answer, likes: 0, dislikes: 0 }] })
              modal.close()
            }
          }}>添加</button>
        </div>
      </div>
    ))
  }
  const removeFaq = (idx: number) => {
    const next = [...asset.faq]
    next.splice(idx, 1)
    updateAsset({ faq: next })
  }
  const startEditFaq = (idx: number) => {
    setFaqEditValue({ question: asset.faq[idx].question, answer: asset.faq[idx].answer })
    setEditingFaq(idx)
  }
  const saveFaqEdit = () => {
    if (editingFaq === null) return
    const next = [...asset.faq]
    next[editingFaq] = { ...next[editingFaq], question: faqEditValue.question, answer: faqEditValue.answer }
    updateAsset({ faq: next })
    setEditingFaq(null)
  }
  const analyzeFaq = (idx: number) => {
    setAnalyzingFaq(idx)
    setTimeout(() => {
      const next = [...asset.faq]
      const item = next[idx]
      const suggestion = item.feedbackType === 'error'
        ? `该回答被标记为“有错误”。建议：1. 核实数据准确性（如 ${item.answer.match(/\d+/)?.[0] || '相关数值'}）；2. 补充来源说明；3. 修正后重新验证。`
        : `该回答被标记为“有疑问”。建议：1. 补充更多背景信息；2. 分步骤解释；3. 增加示例帮助理解。`
      next[idx] = { ...item, aiSuggestion: suggestion }
      updateAsset({ faq: next })
      setAnalyzingFaq(null)
    }, 1500)
  }
  const applyAiSuggestion = (idx: number) => {
    const next = [...asset.faq]
    if (next[idx].aiSuggestion) {
      next[idx] = { ...next[idx], answer: next[idx].answer + '\n\n💡 AI 建议：' + next[idx].aiSuggestion, aiSuggestion: undefined, dislikes: 0 }
      updateAsset({ faq: next })
    }
  }
  const syncFaqToMemory = (idx: number) => {
    const faqItem = asset.faq[idx]
    const existingIndex = asset.memory.findIndex(m => m.key === faqItem.question)
    let nextMemory = [...asset.memory]
    if (existingIndex >= 0) {
      nextMemory[existingIndex] = { key: faqItem.question, value: faqItem.answer, updatedAt: '刚刚' }
    } else {
      nextMemory.push({ key: faqItem.question, value: faqItem.answer, updatedAt: '刚刚' })
    }
    updateAsset({ memory: nextMemory })
  }

  return (
    <div className="fade-in">
      {/* 顶部 Tab */}
      <div className="tabs" style={{ marginBottom: 16 }}>
        <div className={`tab-item${tab === 'assets' ? ' active' : ''}`} onClick={() => setTab('assets')}>🧩 Agent 资产</div>
        <div className={`tab-item${tab === 'skills' ? ' active' : ''}`} onClick={() => setTab('skills')}>🎯 Skill 框架</div>
        <div className={`tab-item${tab === 'permissions' ? ' active' : ''}`} onClick={() => setTab('permissions')}>🔐 权限与审批</div>
      </div>

      {/* ===== Agent 资产 ===== */}
      {tab === 'assets' && (
        <div>
          {/* Agent 选择条 */}
          <div className="asset-agent-tabs">
            {members.map(m => (
              <div key={m.id} className={`asset-agent-tab${selectedAgent === m.id ? ' active' : ''}`}
                onClick={() => { setSelectedAgent(m.id); setEditingPrompt(false); setEditingSkill(null); setEditingMemory(null) }}>
                <span style={{ fontSize: 18 }}>{m.agent.icon}</span>
                <span className="asset-agent-name">{m.agent.name}</span>
                <span className="asset-agent-owner">{m.name}</span>
              </div>
            ))}
          </div>

          {/* 当前选中 Agent 的信息头 */}
          <div className="config-agent-header" style={{ marginBottom: 12 }}>
            <div className="config-agent-info">
              <span className="config-agent-icon">{member.agent.icon}</span>
              <div>
                <div className="config-agent-title">{member.agent.name} 配置</div>
                <div className="config-agent-subtitle">归属：{member.name}（{member.role}）· {asset.skills.length} 个 Skill · {asset.workflows.length} 个工作流 · {asset.memory.length} 条 Memory</div>
              </div>
            </div>
            <Tag variant={member.agent.online ? 'green' : 'gray'}>{member.agent.online ? '在线' : '离线'}</Tag>
          </div>

          {/* Prompt */}
          <div className="card" style={{ marginBottom: 12 }}>
            <div className="card-header">
              <div className="card-title">系统 Prompt</div>
              {!editingPrompt
                ? <button className="btn btn-secondary btn-sm" onClick={handleEditPrompt}>✏️ 编辑</button>
                : <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => setEditingPrompt(false)}>取消</button>
                    <button className="btn btn-primary btn-sm" onClick={handleSavePrompt}>💾 保存</button>
                  </div>}
            </div>
            <div className="card-body">
              {editingPrompt
                ? <textarea className="form-textarea" value={promptValue} onChange={e => setPromptValue(e.target.value)} style={{ minHeight: 120, lineHeight: 1.7 }} />
                : <div className="asset-prompt-display">{asset.systemPrompt}</div>}
            </div>
          </div>

          {/* 关联知识库 */}
          <div className="card" style={{ marginBottom: 12 }}>
            <div className="card-header">
              <div className="card-title">🔗 关联知识库 ({asset.linkedDocs?.length || 0})</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <select
                  className="form-select"
                  style={{ width: 220, fontSize: 12 }}
                  value=""
                  onChange={e => {
                    const docId = e.target.value
                    if (!docId) return
                    const current = asset.linkedDocs || []
                    if (!current.includes(docId)) {
                      updateAsset({ linkedDocs: [...current, docId] })
                    }
                    e.target.value = ''
                  }}
                >
                  <option value="">+ 添加关联文档</option>
                  {kbDocs.filter(d => !(asset.linkedDocs || []).includes(d.id)).map(doc => (
                    <option key={doc.id} value={doc.id}>{doc.title}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="card-body">
              {(asset.linkedDocs || []).length === 0 && (
                <div style={{ padding: 8, textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 12 }}>暂无关联文档，从上方选择添加</div>
              )}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {(asset.linkedDocs || []).map(docId => {
                  const doc = kbDocs.find(d => d.id === docId)
                  if (!doc) return null
                  return (
                    <span key={docId} className="config-linked-doc-chip">
                      <span className="config-linked-doc-title" title={doc.desc}>{doc.title}</span>
                      <button
                        className="config-linked-doc-remove"
                        onClick={() => {
                          const next = (asset.linkedDocs || []).filter(id => id !== docId)
                          updateAsset({ linkedDocs: next })
                        }}
                        title="移除关联"
                      >×</button>
                    </span>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Skills + Workflows + Memory 并排 */}
          <div className="grid grid-3">
            {/* Skills */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">🛠 Skills ({asset.skills.length})</div>
                <button className="btn btn-secondary btn-xs" onClick={addSkill}>+ 添加</button>
              </div>
              <div className="card-body">
                {asset.skills.map((s, i) => (
                  <div key={i} className="config-list-item">
                    {editingSkill === i ? (
                      <div className="config-inline-edit">
                        <input className="form-input" value={skillEditValue.name} onChange={e => setSkillEditValue(v => ({ ...v, name: e.target.value }))} placeholder="Skill 名称" />
                        <textarea className="form-textarea" value={skillEditValue.desc} onChange={e => setSkillEditValue(v => ({ ...v, desc: e.target.value }))} placeholder="描述" style={{ minHeight: 40, marginTop: 4 }} />
                        <div className="config-inline-actions">
                          <button className="btn btn-xs btn-secondary" onClick={() => setEditingSkill(null)}>取消</button>
                          <button className="btn btn-xs btn-primary" onClick={saveSkillEdit}>保存</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 13, fontWeight: 500 }}>{s.name}</span>
                          <div className="config-item-actions">
                            <button className="config-icon-btn" onClick={() => startEditSkill(i)} title="编辑">✏️</button>
                            <button className="config-icon-btn" onClick={() => removeSkill(i)} title="删除">🗑️</button>
                          </div>
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{s.desc}</div>
                      </>
                    )}
                  </div>
                ))}
                {asset.skills.length === 0 && (
                  <div style={{ padding: 12, textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 12 }}>暂无 Skills，点击添加</div>
                )}
              </div>
            </div>

            {/* Workflows */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">⚡ 工作流 ({asset.workflows.length})</div>
                <button className="btn btn-secondary btn-xs" onClick={addWorkflow}>+ 添加</button>
              </div>
              <div className="card-body">
                {asset.workflows.map((wf, i) => (
                  <div key={i} style={{ marginBottom: i < asset.workflows.length - 1 ? 12 : 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 500 }}>{wf.name}</span>
                      <button className="config-icon-btn" onClick={() => removeWorkflow(i)} title="删除">🗑️</button>
                    </div>
                    <div className="workflow-steps">
                      {wf.steps.map((step, j) => (
                        <div key={j} className="workflow-step">
                          <div className="workflow-step-num">{j + 1}</div>
                          <div className="workflow-step-text">{step}</div>
                          {j < wf.steps.length - 1 && <div className="workflow-step-arrow">→</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {asset.workflows.length === 0 && (
                  <div style={{ padding: 12, textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 12 }}>暂无工作流，点击添加</div>
                )}
              </div>
            </div>

            {/* Memory */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">💾 Memory ({asset.memory.length})</div>
                <button className="btn btn-secondary btn-xs" onClick={addMemory}>+ 添加</button>
              </div>
              <div className="card-body">
                {asset.memory.map((m, i) => (
                  <div key={i} className="config-list-item">
                    {editingMemory === i ? (
                      <div className="config-inline-edit">
                        <input className="form-input" value={memoryEditValue.key} onChange={e => setMemoryEditValue(v => ({ ...v, key: e.target.value }))} placeholder="Key" />
                        <input className="form-input" value={memoryEditValue.value} onChange={e => setMemoryEditValue(v => ({ ...v, value: e.target.value }))} placeholder="Value" style={{ marginTop: 4 }} />
                        <div className="config-inline-actions">
                          <button className="btn btn-xs btn-secondary" onClick={() => setEditingMemory(null)}>取消</button>
                          <button className="btn btn-xs btn-primary" onClick={saveMemoryEdit}>保存</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 12, fontWeight: 500 }}>{m.key}</span>
                          <div className="config-item-actions">
                            <button className="config-icon-btn" onClick={() => startEditMemory(i)} title="编辑">✏️</button>
                            <button className="config-icon-btn" onClick={() => removeMemory(i)} title="删除">🗑️</button>
                          </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
                          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{m.value}</span>
                          <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{m.updatedAt}</span>
                        </div>
                      </>
                    )}
                  </div>
                ))}
                {asset.memory.length === 0 && (
                  <div style={{ padding: 12, textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 12 }}>暂无 Memory，点击添加</div>
                )}
              </div>
            </div>
          </div>

          {/* FAQ 库 */}
          <div className="card" style={{ marginTop: 12 }}>
            <div className="card-header">
              <div className="card-title">💬 FAQ 库 ({asset.faq.length})</div>
              <button className="btn btn-secondary btn-xs" onClick={addFaq}>+ 添加</button>
            </div>
            <div className="card-body">
              {asset.faq.length === 0 && (
                <div style={{ padding: 12, textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 12 }}>暂无 FAQ，点击添加</div>
              )}
              {asset.faq.map((faq, i) => (
                <div key={faq.id} className="config-list-item" style={{ marginBottom: i < asset.faq.length - 1 ? 10 : 0 }}>
                  {editingFaq === i ? (
                    <div className="config-inline-edit">
                      <input className="form-input" value={faqEditValue.question} onChange={e => setFaqEditValue(v => ({ ...v, question: e.target.value }))} placeholder="问题" />
                      <textarea className="form-textarea" value={faqEditValue.answer} onChange={e => setFaqEditValue(v => ({ ...v, answer: e.target.value }))} placeholder="回答" style={{ minHeight: 40, marginTop: 4 }} />
                      <div className="config-inline-actions">
                        <button className="btn btn-xs btn-secondary" onClick={() => setEditingFaq(null)}>取消</button>
                        <button className="btn btn-xs btn-primary" onClick={saveFaqEdit}>保存</button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{faq.question}</span>
                        <div className="config-item-actions">
                          <button className="config-icon-btn" onClick={() => startEditFaq(i)} title="编辑">✏️</button>
                          <button className="config-icon-btn" onClick={() => removeFaq(i)} title="删除">🗑️</button>
                        </div>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 6 }}>{faq.answer}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 11, color: 'var(--green)' }}>👍 {faq.likes}</span>
                        <span style={{ fontSize: 11, color: faq.dislikes > 0 ? 'var(--red)' : 'var(--text-tertiary)' }}>👎 {faq.dislikes}</span>
                        {faq.feedbackType && (
                          <Tag variant={faq.feedbackType === 'error' ? 'red' : 'orange'}>
                            {faq.feedbackType === 'error' ? '有错误' : '有疑问'}
                          </Tag>
                        )}
                        <button className="btn btn-xs btn-secondary" onClick={() => syncFaqToMemory(i)} title="将该问答同步到 Agent Memory">
                          💾 同步到 Memory
                        </button>
                        {faq.dislikes > 0 && !faq.aiSuggestion && (
                          <button className="btn btn-xs btn-secondary" onClick={() => analyzeFaq(i)} disabled={analyzingFaq === i}>
                            {analyzingFaq === i ? '🔍 AI 分析中...' : '🔍 AI 分析'}
                          </button>
                        )}
                        {faq.aiSuggestion && (
                          <button className="btn btn-xs btn-primary" onClick={() => applyAiSuggestion(i)}>
                            💡 采纳 AI 建议
                          </button>
                        )}
                      </div>
                      {faq.aiSuggestion && (
                        <div style={{ marginTop: 8, padding: 8, background: 'var(--accent-light)', borderRadius: 6, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                          <b>AI 建议：</b>{faq.aiSuggestion}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===== Skill 框架 ===== */}
      {tab === 'skills' && (
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header">
              <div>
                <div className="card-title">Skill = 角色定义</div>
                <div className="card-subtitle">每个角色的 Skill 定义了其 Agent 的能力边界，Skill 是角色协同的基本单位</div>
              </div>
            </div>
            <div className="card-body">
              <div className="skill-framework">
                {members.map(m => (
                  <div key={m.id} className="skill-role-card" onClick={() => { setSelectedAgent(m.id); setTab('assets') }} style={{ cursor: 'pointer' }}>
                    <div className="skill-role-header">
                      <span className="skill-role-icon">{m.agent.icon}</span>
                      <div>
                        <div className="skill-role-name">{m.name}</div>
                        <div className="skill-role-title">{m.role}</div>
                      </div>
                    </div>
                    <div className="skill-section">
                      <div className="skill-section-label">Agent 能力（Skills）</div>
                      <div className="skill-tags">
                        {m.agent.capabilities.map((cap, i) => (
                          <span key={i} className="skill-tag cap">{cap}</span>
                        ))}
                      </div>
                    </div>
                    <div className="skill-section">
                      <div className="skill-section-label">可自主执行</div>
                      <div className="skill-tags">
                        {m.agent.autonomous.map((a, i) => (
                          <span key={i} className="skill-tag auto">{a}</span>
                        ))}
                      </div>
                    </div>
                    <div className="skill-section">
                      <div className="skill-section-label">需人工审批</div>
                      <div className="skill-tags">
                        {m.agent.needApproval.map((a, i) => (
                          <span key={i} className="skill-tag approval">{a}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><div className="card-title">协同模式说明</div></div>
            <div className="card-body" style={{ fontSize: 13, lineHeight: 1.8, color: 'var(--text-secondary)' }}>
              <p style={{ marginBottom: 12 }}><b>Skill = Role</b>：每个团队成员的 Agent 能力由其角色的 Skill 定义决定。Agent 不是独立实体，而是人的能力延伸。</p>
              <p style={{ marginBottom: 12 }}><b>双文档策略</b>：每个核心产物同时维护「人读文档」和「机器规范」两份。人读文档供团队协作，机器规范（Prompt/Schema/Config）供 Agent 执行。</p>
              <p style={{ marginBottom: 12 }}><b>阶段门禁</b>：关键阶段切换时设置离线对齐点（Gate），全员确认后才能进入下一阶段，避免 Agent 自动推进导致方向偏离。</p>
              <p><b>知识库即基座</b>：所有 Agent 产物自动沉淀到知识库，作为后续阶段 Agent 的上下文基础，形成知识积累闭环。</p>
            </div>
          </div>
        </div>
      )}

      {/* ===== 权限与审批 ===== */}
      {tab === 'permissions' && (
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header">
              <div><div className="card-title">审批流配置</div><div className="card-subtitle">Agent 可自主执行 vs 需人工审批</div></div>
              <button className="btn btn-primary btn-sm">+ 新建规则</button>
            </div>
            <table className="data-table">
              <thead><tr><th>操作</th><th>Agent</th><th>执行方式</th><th>审批人</th></tr></thead>
              <tbody>
                {PERM_RULES.map((r, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 500 }}>{r.op}</td>
                    <td>{r.agent}</td>
                    <td><Tag variant={r.mode === '自主' ? 'green' : 'orange'}>{r.mode === '自主' ? '🤖 自主执行' : '👤 需审批'}</Tag></td>
                    <td style={{ color: 'var(--text-secondary)' }}>{r.approver}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="card">
            <div className="card-header"><div className="card-title">Agent 权限边界</div></div>
            <table className="data-table">
              <thead><tr><th>Agent</th><th>可自主执行</th><th>需人工确认</th></tr></thead>
              <tbody>
                {[
                  { a: '📋 产品 Agent', auto: '更新文档、通知团队、拆解需求', confirm: '删除文档、修改权限' },
                  { a: '🎨 前端 Agent', auto: '代码生成、组件更新、提交 PR', confirm: '接口变更、部署触发' },
                  { a: '⚙️ 后端 Agent', auto: '代码生成、单元测试、提交 PR', confirm: '生产环境发布' },
                  { a: '🧠 算法 Agent', auto: '模型训练、数据分析', confirm: '模型上线、参数调整' },
                ].map((r, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 500 }}>{r.a}</td>
                    <td><Tag variant="green">{r.auto}</Tag></td>
                    <td><Tag variant="orange">{r.confirm}</Tag></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modal.render()}
    </div>
  )
}
