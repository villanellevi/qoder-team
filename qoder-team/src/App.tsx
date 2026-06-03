import { useState, useEffect } from 'react'
import { Avatar, Tag } from './components/ui'
import KnowledgeBase from './views/KnowledgeBase'
import AgentChat from './views/AgentChat'
import ProjectProgress from './views/ProjectProgress'
import ConfigView from './views/ConfigView'
import TodoView from './views/TodoView'
import RightPanel from './components/layout/RightPanel'
import Login from './views/Login'
import Workspace from './views/Workspace'
import { TeamDataProvider, useTeamData } from './context/TeamDataContext'
import type { SidebarTab, TeamView } from './types'

const SIDEBAR_TABS: { id: SidebarTab; label: string }[] = [
  { id: 'code', label: '代码' },
  { id: 'issues', label: 'Issues' },
  { id: 'pr', label: 'Pull Requests' },
  { id: 'team', label: '团队空间' },
]

const TEAM_NAV: { id: TeamView; icon: string; label: string; badge?: number; section?: string }[] = [
  { id: 'progress', icon: '📊', label: '项目进展', section: '项目' },
  { id: 'todo',     icon: '✅', label: '项目待办', badge: 5 },
  { id: 'chat',     icon: '💬', label: '协作', section: '协作', badge: 2 },
  { id: 'kb',       icon: '📚', label: '知识库', badge: 3 },
  { id: 'config',   icon: '⚙️', label: '配置与资产', section: '管理' },
]

/* ===== 文件树 ===== */
interface FileNode { name: string; type: 'file' | 'folder'; icon?: string; children?: FileNode[] }
const FILE_TREE: FileNode[] = [
  { name: 'src', type: 'folder', children: [
    { name: 'views', type: 'folder', children: [
      { name: 'AgentChat.tsx', type: 'file', icon: '📄' },
      { name: 'AgentQA.tsx', type: 'file', icon: '📄' },
      { name: 'ConfigView.tsx', type: 'file', icon: '📄' },
      { name: 'TodoView.tsx', type: 'file', icon: '📄' },
    ]},
    { name: 'App.tsx', type: 'file', icon: '📄' },
    { name: 'data.ts', type: 'file', icon: '📄' },
    { name: 'index.css', type: 'file', icon: '🎨' },
  ]},
  { name: 'package.json', type: 'file', icon: '📋' },
  { name: 'vite.config.ts', type: 'file', icon: '⚡' },
]

function FileTree({ nodes, depth = 0 }: { nodes: FileNode[]; depth?: number }) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ src: true, views: true })
  return (
    <div className="file-tree">
      {nodes.map(node => (
        <div key={node.name}>
          <div className="file-row" style={{ paddingLeft: 8 + depth * 16 }}
            onClick={() => node.type === 'folder' && setExpanded(p => ({ ...p, [node.name]: !p[node.name] }))}>
            <span className="file-icon">{node.type === 'folder' ? (expanded[node.name] ? '📂' : '📁') : (node.icon || '📄')}</span>
            <span className="file-name">{node.name}</span>
          </div>
          {node.type === 'folder' && expanded[node.name] && node.children && <FileTree nodes={node.children} depth={depth + 1} />}
        </div>
      ))}
    </div>
  )
}

/* ===== 占位视图 ===== */
function IssuesView() { return <div className="ide-center-content"><div className="empty-state"><div className="empty-icon">📋</div><div className="empty-text">暂无开放的 Issues</div></div></div> }
function PRView() { return <div className="ide-center-content"><div className="empty-state"><div className="empty-icon">🔀</div><div className="empty-text">暂无开放的 Pull Requests</div></div></div> }
function CodeCenterView() {
  return (
    <div className="ide-center-content">
      <div className="code-breadcrumb"><span>src</span> / <span>views</span> / <span>AgentChat.tsx</span></div>
      <div className="code-editor">
        <div className="code-line-numbers">{Array.from({ length: 20 }, (_, i) => <div key={i} className="code-line-num">{i + 1}</div>)}</div>
        <pre className="code-content"><code>{`import { useState } from 'react'
import { AGENTS, getAgent } from '../data'

/* Agent 协作视图
 * 多 Agent 交互 + 单 Agent 对话
 * 工作产物自动同步至知识库
 */

export default function AgentChat() {
  // ...
}`}</code></pre>
      </div>
    </div>
  )
}

/* ===== 团队空间视图路由 ===== */
function TeamCenterView({ teamView, chatTarget, onChatChange }: { teamView: TeamView; chatTarget?: string; onChatChange?: (id: string) => void }) {
  return (
    <div className="ide-center-content" style={{ padding: 16 }}>
      <div className="fade-in" key={teamView}>
        {teamView === 'progress' && <ProjectProgress />}
        {teamView === 'todo' && <TodoView />}
        {teamView === 'chat' && <AgentChat targetConv={chatTarget} onConvChange={onChatChange} />}
        {teamView === 'kb' && <KnowledgeBase />}
        {teamView === 'config' && <ConfigView />}
      </div>
    </div>
  )
}

/* ===== 项目切换器 ===== */
function ProjectSwitcher({ activeProject, onSelect }: { activeProject: string; onSelect: (id: string) => void }) {
  const [open, setOpen] = useState(false)
  const { projects, loading } = useTeamData()
  const current = projects.find(p => p.id === activeProject)
  if (loading) return <div className="project-trigger"><span className="project-trigger-icon">📁</span><span>加载中...</span></div>
  return (
    <div className="project-switcher" style={{ position: 'relative' }}>
      <div className="project-trigger" onClick={() => setOpen(!open)}>
        <span className="project-trigger-icon">📁</span>
        <span className="project-trigger-name">{current?.name || '选择项目'}</span>
        <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor" style={{ opacity: 0.5 }}>
          <path d="M4.427 7.427l3.396 3.396a.25.25 0 00.354 0l3.396-3.396A.25.25 0 0011.396 7H4.604a.25.25 0 00-.177.427z"/>
        </svg>
      </div>
      {open && (
        <div className="project-dropdown">
          {projects.map(p => (
            <div key={p.id} className={`project-dropdown-item${p.id === activeProject ? ' active' : ''}`}
              onClick={() => { onSelect(p.id); setOpen(false) }}>
              <div>
                <div style={{ fontWeight: 500 }}>{p.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>{p.desc}</div>
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0, marginLeft: 12 }}>
                <Tag variant={p.status === 'active' ? 'green' : 'gray'}>{p.status === 'active' ? '进行中' : '规划中'}</Tag>
                <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{p.members}人</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ===== Demo 模式 ===== */
function DemoApp() {
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('team')
  const [teamView, setTeamView] = useState<TeamView>('progress')
  const [activeProject, setActiveProject] = useState('recommend-v2')
  const [chatTarget, setChatTarget] = useState<string | undefined>(undefined)
  const [leftCollapsed, setLeftCollapsed] = useState(false)
  const [rightCollapsed, setRightCollapsed] = useState(false)
  const { pendingItems, members, loading } = useTeamData()

  const myIncomingCount = pendingItems.filter(p => p.assignerType === 'agent' && p.status === 'pending').length
  const me = members.find(m => m.isMe)

  return (
    <div className="app-layout">
      {/* 顶部导航 */}
      <header className="ide-topbar">
        <div className="ide-topbar-left">
          <span className="ide-repo-icon">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8zM5 12.25v3.25a.25.25 0 00.4.2l1.45-1.087a.25.25 0 01.3 0L8.6 15.7a.25.25 0 00.4-.2v-3.25a.25.25 0 00-.25-.25h-3.5a.25.25 0 00-.25.25z"/>
            </svg>
          </span>
          <span className="ide-repo-org">@qoder-team</span>
          <span className="ide-repo-sep">/</span>
          <span className="ide-repo-name">qoder-team-demo</span>
        </div>
        <div className="ide-topbar-center">
          <ProjectSwitcher activeProject={activeProject} onSelect={setActiveProject} />
          <div className="ide-branch-selector">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" style={{ marginRight: 4, opacity: 0.6 }}>
              <path d="M11.75 2.5a.75.75 0 100 1.5.75.75 0 000-1.5zm-2.25.75a2.25 2.25 0 113 2.122V6A2.5 2.5 0 0110 8.5H6a1 1 0 00-1 1v1.128a2.251 2.251 0 11-1.5 0V5.372a2.25 2.25 0 111.5 0v1.836A2.492 2.492 0 016 7h4a1 1 0 001-1v-.628A2.25 2.25 0 019.5 3.25zM4.25 12a.75.75 0 100 1.5.75.75 0 000-1.5zM3.5 3.25a.75.75 0 111.5 0 .75.75 0 01-1.5 0z"/>
            </svg>
            main
          </div>
        </div>
        <div className="ide-topbar-right">
          <button className="ide-topbar-btn">Compare</button>
          <button className="ide-topbar-btn primary">Pull request</button>
          <div className="avatar-stack" style={{ marginLeft: 8 }}>
            {loading ? <Avatar name="?" color="purple" size="sm" /> : members.slice(0, 4).map(m => (
              <Avatar key={m.id} name={m.name[0]} color={m.color} size="sm" />
            ))}
          </div>
        </div>
      </header>

      {/* 三栏主体 */}
      <div className="ide-body">
        <aside className={`ide-sidebar${leftCollapsed ? ' collapsed' : ''}`}>
          {!leftCollapsed && (
            <>
              <div className="ide-sidebar-tabs">
                {SIDEBAR_TABS.map(tab => (
                  <div key={tab.id} className={`ide-sidebar-tab${sidebarTab === tab.id ? ' active' : ''}`} onClick={() => setSidebarTab(tab.id)}>
                    {tab.label}
                    {tab.id === 'team' && <span className="ide-new-badge">NEW</span>}
                  </div>
                ))}
              </div>
              <div className="ide-sidebar-content">
                {sidebarTab === 'code' && <><div className="ide-sidebar-search"><input placeholder="搜索文件..." /></div><FileTree nodes={FILE_TREE} /></>}
                {sidebarTab === 'issues' && <div style={{ padding: 16, textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 12 }}>暂无 Issues</div>}
                {sidebarTab === 'pr' && <div style={{ padding: 16, textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 12 }}>暂无 Pull Requests</div>}
                {sidebarTab === 'team' && (
                  <nav className="ide-team-nav">
                    {TEAM_NAV.map(item => (
                      <div key={item.id}>
                        {item.section && <div className="sidebar-section" style={{ marginTop: item.section === '项目' ? 0 : 12 }}>{item.section}</div>}
                        <div className={`nav-item${teamView === item.id ? ' active' : ''}`} onClick={() => setTeamView(item.id)}>
                          <span className="nav-icon">{item.icon}</span>
                          <span className="nav-label">{item.label}</span>
                          {item.badge && <span className="nav-badge">{item.badge}</span>}
                        </div>
                      </div>
                    ))}
                  </nav>
                )}
              </div>
              <div className="sidebar-footer">
                <div className="user-card">
                  {loading ? <Avatar name="?" color="purple" /> : <Avatar name={me?.name?.[0] || '我'} color={me?.color || 'purple'} />}
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{me?.name || '加载中...'}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{me?.role || ''}</div>
                  </div>
                </div>
              </div>
            </>
          )}
          <button
            className="panel-toggle-btn left"
            title={leftCollapsed ? '展开侧边栏' : '收起侧边栏'}
            onClick={() => setLeftCollapsed(!leftCollapsed)}
          >
            {leftCollapsed ? '▸' : '◂'}
          </button>
        </aside>

        <main className="ide-center">
          {sidebarTab === 'code' && <CodeCenterView />}
          {sidebarTab === 'issues' && <IssuesView />}
          {sidebarTab === 'pr' && <PRView />}
          {sidebarTab === 'team' && <TeamCenterView teamView={teamView} chatTarget={chatTarget} onChatChange={setChatTarget} />}
        </main>

        <aside className={`ide-right-panel${rightCollapsed ? ' collapsed' : ''}`}>
          {!rightCollapsed && (
            <RightPanel sidebarTab={sidebarTab} teamView={teamView} activeProject={activeProject} chatTarget={chatTarget} onNavigateChat={(memberId) => { setTeamView('chat'); setChatTarget(memberId) }} />
          )}
          <button
            className="panel-toggle-btn right"
            title={rightCollapsed ? '展开右侧面板' : '收起右侧面板'}
            onClick={() => setRightCollapsed(!rightCollapsed)}
          >
            {rightCollapsed ? '◂' : '▸'}
          </button>
          {rightCollapsed && myIncomingCount > 0 && (
            <span className="panel-toggle-badge">{myIncomingCount}</span>
          )}
        </aside>
      </div>
    </div>
  )
}

/* ===== 主应用（登录 + 工作区） ===== */
export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('qoder_token'))
  const [user, setUser] = useState<any>(null)
  const [mode, setMode] = useState<'workspace' | 'demo'>('workspace')

  useEffect(() => {
    const saved = localStorage.getItem('qoder_user')
    if (saved) {
      try { setUser(JSON.parse(saved)) } catch {}
    }
  }, [])

  const handleLogin = (t: string, u: any) => {
    setToken(t)
    setUser(u)
  }

  const handleLogout = () => {
    localStorage.removeItem('qoder_token')
    localStorage.removeItem('qoder_user')
    setToken(null)
    setUser(null)
  }

  if (!token) {
    return <Login onLogin={handleLogin} />
  }

  if (mode === 'demo') {
    return (
      <>
        <div style={{ position: 'fixed', top: 0, right: 0, zIndex: 9999, padding: 8 }}>
          <button
            onClick={() => setMode('workspace')}
            style={{ padding: '6px 12px', fontSize: 12, background: '#1f6feb', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}
          >
            切换到工作区
          </button>
        </div>
        <TeamDataProvider>
          <DemoApp />
        </TeamDataProvider>
      </>
    )
  }

  return (
    <>
      <div style={{ position: 'fixed', top: 0, right: 0, zIndex: 9999, padding: 8, display: 'flex', gap: 8 }}>
        <button
          onClick={() => setMode('demo')}
          style={{ padding: '6px 12px', fontSize: 12, background: 'rgba(255,255,255,0.1)', color: '#aaa', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 6, cursor: 'pointer' }}
        >
          Demo 模式
        </button>
      </div>
      <Workspace user={user} onLogout={handleLogout} />
    </>
  )
}
