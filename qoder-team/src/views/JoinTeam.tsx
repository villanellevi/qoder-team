import { useState, useEffect } from 'react'
import { api } from '../api/client'

interface Invitation {
  id: string
  code: string
  team: { id: string; name: string; slug: string }
  inviter: { name: string; email: string; avatar?: string }
  createdAt: string
}

export default function JoinTeam({ onJoined }: { onJoined: () => void }) {
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.myInvitations()
      .then(setInvitations)
      .catch(() => setError('加载邀请失败'))
      .finally(() => setLoading(false))
  }, [])

  async function accept(code: string) {
    setAccepting(code)
    setError('')
    try {
      await api.acceptInvitation(code)
      onJoined()
    } catch (err: any) {
      setError(err.message || '接受邀请失败')
    } finally {
      setAccepting(null)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f7f8fa',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      <div style={{
        width: 480,
        padding: 40,
        background: '#ffffff',
        border: '1px solid #e8eaed',
        borderRadius: 12,
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 10,
            background: '#4f6ef7',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
            color: '#fff',
            marginBottom: 16,
          }}>Q</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a1d21', marginBottom: 6 }}>加入团队</h1>
          <p style={{ fontSize: 14, color: '#5f6368' }}>
            {loading ? '正在加载邀请...' : invitations.length > 0 ? '您收到以下团队邀请' : '暂无团队邀请'}
          </p>
        </div>

        {error && (
          <div style={{
            marginBottom: 16,
            padding: 10,
            background: '#fce8e6',
            borderRadius: 8,
            color: '#ea4335',
            fontSize: 13,
          }}>
            {error}
          </div>
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: 40, color: '#9aa0a6', fontSize: 14 }}>
            加载中...
          </div>
        )}

        {!loading && invitations.length === 0 && (
          <div style={{ textAlign: 'center', padding: 24 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
            <p style={{ fontSize: 14, color: '#5f6368', marginBottom: 8 }}>您还没有收到团队邀请</p>
            <p style={{ fontSize: 13, color: '#9aa0a6' }}>请联系团队管理员发送邀请，或稍后再试</p>
          </div>
        )}

        {!loading && invitations.map(inv => (
          <div key={inv.id} style={{
            padding: 16,
            background: '#fbfbfc',
            border: '1px solid #e8eaed',
            borderRadius: 8,
            marginBottom: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: '#eef1fe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                flexShrink: 0,
              }}>
                {inv.inviter.avatar || '👤'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1d21' }}>{inv.team.name}</div>
                <div style={{ fontSize: 12, color: '#5f6368', marginTop: 2 }}>
                  邀请人：{inv.inviter.name}（{inv.inviter.email}）
                </div>
              </div>
            </div>
            <button
              onClick={() => accept(inv.code)}
              disabled={accepting === inv.code}
              style={{
                width: '100%',
                padding: '10px 0',
                background: '#4f6ef7',
                border: 'none',
                borderRadius: 8,
                color: '#fff',
                fontSize: 14,
                fontWeight: 600,
                cursor: accepting === inv.code ? 'not-allowed' : 'pointer',
                opacity: accepting === inv.code ? 0.7 : 1,
              }}
            >
              {accepting === inv.code ? '加入中...' : '接受邀请并加入'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
