import { useState } from 'react'
import { api } from '../api/client'

export default function Login({ onLogin }: { onLogin: (token: string, user: any) => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = mode === 'login'
        ? await api.login({ email, password })
        : await api.register({ email, password, name })
      localStorage.setItem('qoder_token', res.token)
      localStorage.setItem('qoder_user', JSON.stringify(res.user))
      onLogin(res.token, res.user)
    } catch (err: any) {
      setError(err.message || '请求失败')
    } finally {
      setLoading(false)
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
        width: 400,
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
            marginBottom: 16,
          }}>Q</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a1d21', marginBottom: 6 }}>Qoder Team</h1>
          <p style={{ fontSize: 14, color: '#5f6368' }}>
            {mode === 'login' ? '登录到您的团队工作空间' : '创建账号加入团队'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#1a1d21', marginBottom: 6 }}>姓名</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                placeholder="请输入您的姓名"
                style={inputStyle}
              />
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#1a1d21', marginBottom: 6 }}>邮箱</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#1a1d21', marginBottom: 6 }}>密码</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="请输入密码"
              style={inputStyle}
            />
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

          <button type="submit" disabled={loading} style={buttonStyle(loading)}>
            {loading ? '请稍候...' : (mode === 'login' ? '登录' : '注册')}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#5f6368' }}>
          {mode === 'login' ? '还没有账号？' : '已有账号？'}
          <button
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}
            style={{
              background: 'none',
              border: 'none',
              color: '#4f6ef7',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 500,
              marginLeft: 4,
            }}
          >
            {mode === 'login' ? '去注册' : '去登录'}
          </button>
        </p>

        {mode === 'login' && (
          <p style={{ textAlign: 'center', marginTop: 12, fontSize: 12, color: '#9aa0a6' }}>
            演示账号: demo@qoder.team / demo123
          </p>
        )}
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  background: '#f5f6f8',
  border: '1px solid #e8eaed',
  borderRadius: 8,
  fontSize: 14,
  color: '#1a1d21',
  outline: 'none',
  transition: 'border-color 0.12s ease',
  boxSizing: 'border-box',
}

function buttonStyle(loading: boolean): React.CSSProperties {
  return {
    width: '100%',
    padding: 12,
    background: '#4f6ef7',
    border: 'none',
    borderRadius: 8,
    color: '#fff',
    fontSize: 15,
    fontWeight: 600,
    cursor: loading ? 'not-allowed' : 'pointer',
    opacity: loading ? 0.7 : 1,
    transition: 'opacity 0.12s ease',
  }
}
