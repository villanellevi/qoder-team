import { useState, useEffect, useRef } from 'react'
import { api } from '../api/client'
import { getSocket, disconnectSocket } from '../api/socket'

interface User {
  id: string
  name: string
  email: string
}

interface Team {
  id: string
  name: string
  slug: string
}

interface Channel {
  id: string
  name: string
  type: string
}

interface Message {
  id: string
  channelId?: string
  senderId: string
  senderType: string
  content: string
  createdAt: string
  sender?: { name: string; avatar?: string }
}

interface Doc {
  id: string
  title: string
  content: string
  source: string
  updatedAt: string
  author?: { name: string }
}

export default function Workspace({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [teams, setTeams] = useState<Team[]>([])
  const [activeTeam, setActiveTeam] = useState<Team | null>(null)
  const [channels, setChannels] = useState<Channel[]>([])
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [docs, setDocs] = useState<Doc[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const chatRef = useRef<HTMLDivElement>(null)
  const socketRef = useRef<any>(null)

  // 加载团队列表
  useEffect(() => {
    api.listTeams().then(setTeams).catch(console.error)
  }, [])

  // 选择团队后加载频道和文档
  useEffect(() => {
    if (!activeTeam) return
    api.listChannels(activeTeam.id).then(setChannels).catch(console.error)
    api.listDocs(activeTeam.id).then(setDocs).catch(console.error)
  }, [activeTeam])

  // 选择频道后加载消息并加入 Socket 房间
  useEffect(() => {
    if (!activeChannel) return

    api.listMessages(activeChannel.id).then(msgs => {
      setMessages(msgs)
    }).catch(console.error)

    const socket = getSocket()
    socketRef.current = socket
    socket.emit('channel:join', { channelId: activeChannel.id })

    const onNewMsg = (msg: Message) => {
      if (msg.channelId === activeChannel.id || !msg.channelId) {
        setMessages(prev => [...prev, msg])
      }
    }
    socket.on('message:new', onNewMsg)

    return () => {
      socket.off('message:new', onNewMsg)
      socket.emit('channel:leave', { channelId: activeChannel.id })
    }
  }, [activeChannel])

  // 自动滚动到底部
  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight
  }, [messages])

  const sendMessage = () => {
    if (!input.trim() || !activeChannel) return
    const socket = socketRef.current || getSocket()
    socket.emit('message:send', {
      channelId: activeChannel.id,
      senderId: user.id,
      senderType: 'human',
      content: input.trim(),
    })
    setInput('')
  }

  const createDoc = async () => {
    const title = prompt('文档标题')
    if (!title || !activeTeam) return
    const doc = await api.createDoc({
      teamId: activeTeam.id,
      title,
      content: '# ' + title + '\n\n',
      source: 'human',
    })
    setDocs(prev => [doc, ...prev])
  }

  const formatTime = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0d1117', color: '#c9d1d9', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      {/* 左侧边栏 */}
      <div style={{ width: 240, background: '#161b22', borderRight: '1px solid #30363d', display: 'flex', flexDirection: 'column' }}>
        {/* 用户信息 */}
        <div style={{ padding: 16, borderBottom: '1px solid #30363d' }}>
          <div style={{ fontWeight: 600, fontSize: 14 }}>{user.name}</div>
          <div style={{ fontSize: 12, color: '#8b949e', marginTop: 2 }}>{user.email}</div>
          <button onClick={onLogout} style={{ marginTop: 8, fontSize: 11, color: '#f85149', background: 'none', border: 'none', cursor: 'pointer' }}>
            退出登录
          </button>
        </div>

        {/* 团队列表 */}
        <div style={{ padding: '12px 16px', fontSize: 11, color: '#8b949e', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          团队
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {teams.map(t => (
            <div
              key={t.id}
              onClick={() => setActiveTeam(t)}
              style={{
                padding: '8px 16px',
                cursor: 'pointer',
                fontSize: 13,
                background: activeTeam?.id === t.id ? '#1f6feb' : 'transparent',
                color: activeTeam?.id === t.id ? '#fff' : '#c9d1d9',
              }}
            >
              {t.name}
            </div>
          ))}
          {teams.length === 0 && (
            <div style={{ padding: 16, fontSize: 12, color: '#555' }}>暂无团队</div>
          )}
        </div>
      </div>

      {/* 中间频道列表 */}
      <div style={{ width: 220, background: '#0d1117', borderRight: '1px solid #30363d', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '12px 16px', fontSize: 11, color: '#8b949e', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          频道
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {channels.map(c => (
            <div
              key={c.id}
              onClick={() => setActiveChannel(c)}
              style={{
                padding: '8px 16px',
                cursor: 'pointer',
                fontSize: 13,
                background: activeChannel?.id === c.id ? 'rgba(31,111,235,0.15)' : 'transparent',
                color: activeChannel?.id === c.id ? '#58a6ff' : '#c9d1d9',
                borderLeft: activeChannel?.id === c.id ? '3px solid #1f6feb' : '3px solid transparent',
              }}
            >
              {c.type === 'group' ? '#' : c.type === 'myagent' ? '🤖' : '💬'} {c.name}
            </div>
          ))}
          {activeTeam && channels.length === 0 && (
            <div style={{ padding: 16, fontSize: 12, color: '#555' }}>暂无频道</div>
          )}
          {!activeTeam && (
            <div style={{ padding: 16, fontSize: 12, color: '#555' }}>请先选择一个团队</div>
          )}
        </div>
      </div>

      {/* 中间聊天区域 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {activeChannel ? (
          <>
            <div style={{ padding: '12px 20px', borderBottom: '1px solid #30363d', fontWeight: 600, fontSize: 15 }}>
              {activeChannel.name}
            </div>
            <div ref={chatRef} style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
              {messages.length === 0 && (
                <div style={{ textAlign: 'center', color: '#555', paddingTop: 100 }}>暂无消息</div>
              )}
              {messages.map(msg => (
                <div key={msg.id} style={{ marginBottom: 16, display: 'flex', gap: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', background: msg.senderType === 'agent' ? '#1f6feb' : '#238636',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#fff', flexShrink: 0,
                  }}>
                    {msg.sender?.name?.[0] || (msg.senderType === 'agent' ? '🤖' : '👤')}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 2 }}>
                      <span style={{ fontWeight: 600, fontSize: 13 }}>{msg.sender?.name || (msg.senderType === 'agent' ? 'Agent' : '用户')}</span>
                      <span style={{ fontSize: 11, color: '#555' }}>{formatTime(msg.createdAt)}</span>
                    </div>
                    <div style={{ fontSize: 14, lineHeight: 1.5, wordBreak: 'break-word' }}>{msg.content}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: '12px 20px', borderTop: '1px solid #30363d', display: 'flex', gap: 10 }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="输入消息..."
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  background: '#21262d',
                  border: '1px solid #30363d',
                  borderRadius: 10,
                  color: '#c9d1d9',
                  fontSize: 14,
                  outline: 'none',
                }}
              />
              <button
                onClick={sendMessage}
                style={{
                  padding: '10px 20px',
                  background: '#238636',
                  border: 'none',
                  borderRadius: 10,
                  color: '#fff',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                发送
              </button>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555' }}>
            选择一个频道开始聊天
          </div>
        )}
      </div>

      {/* 右侧文档 */}
      <div style={{ width: 280, background: '#161b22', borderLeft: '1px solid #30363d', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #30363d', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: '#8b949e', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>文档</span>
          <button onClick={createDoc} style={{ fontSize: 12, color: '#58a6ff', background: 'none', border: 'none', cursor: 'pointer' }}>+ 新建</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {docs.map(doc => (
            <div key={doc.id} style={{ padding: '10px 16px', cursor: 'pointer', fontSize: 13 }}>
              <div style={{ fontWeight: 500, marginBottom: 4 }}>{doc.title}</div>
              <div style={{ fontSize: 11, color: '#555' }}>
                {doc.author?.name || '未知'} · {doc.source === 'agent' ? 'Agent' : doc.source === 'collab' ? '协作' : '个人'}
              </div>
            </div>
          ))}
          {activeTeam && docs.length === 0 && (
            <div style={{ padding: 16, fontSize: 12, color: '#555' }}>暂无文档</div>
          )}
          {!activeTeam && (
            <div style={{ padding: 16, fontSize: 12, color: '#555' }}>请先选择一个团队</div>
          )}
        </div>
      </div>
    </div>
  )
}
