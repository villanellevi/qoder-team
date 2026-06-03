import { useState } from 'react'
import { api } from '../api/client'

export default function Login({ onLogin }: { onLogin: (token: string, user: any) => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('demo@qoder.team')
  const [password, setPassword] = useState('demo123')
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
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    }}>
      <div style={{
        width: 360,
        padding: 40,
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 20,
        backdropFilter: 'blur(10px)',
      }}>
        <h1 style={{
          textAlign: 'center',
          fontSize: 24,
          marginBottom: 8,
          background: 'linear-gradient(90deg, #00d4ff, #7b2cbf)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>Qoder Team</h1>
        <p style={{ textAlign: 'center', color: '#888', fontSize: 14, marginBottom: 32 }}>
          {mode === 'login' ? '登录到您的团队' : '创建新账号'}
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, color: '#aaa', marginBottom: 6 }}>邮箱</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px 14px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10,
                color: '#e0e0e0',
                fontSize: 14,
                outline: 'none',
              }}
            />
          </div>

          {mode === 'register' && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, color: '#aaa', marginBottom: 6 }}>姓名</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 10,
                  color: '#e0e0e0',
                  fontSize: 14,
                  outline: 'none',
                }}
              />
            </div>
          )}

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 13, color: '#aaa', marginBottom: 6 }}>密码</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px 14px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10,
                color: '#e0e0e0',
                fontSize: 14,
                outline: 'none',
              }}
            />
          </div>

          {error && (
            <div style={{ marginBottom: 16, padding: 10, background: 'rgba(255,82,82,0.1)', borderRadius: 8, color: '#ff5252', fontSize: 13 }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: 12,
              background: 'linear-gradient(135deg, #00d4ff, #0099cc)',
              border: 'none',
              borderRadius: 12,
              color: '#fff',
              fontSize: 15,
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? '请稍候...' : (mode === 'login' ? '登录' : '注册')}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#888' }}>
          {mode === 'login' ? '还没有账号？' : '已有账号？'}
          <button
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}
            style={{ background: 'none', border: 'none', color: '#00d4ff', cursor: 'pointer', fontSize: 13 }}
          >
            {mode === 'login' ? '去注册' : '去登录'}
          </button>
        </p>

        {mode === 'login' && (
          <p style={{ textAlign: 'center', marginTop: 12, fontSize: 12, color: '#555' }}>
            默认账号: demo@qoder.team / demo123
          </p>
        )}
      </div>
    </div>
  )
}
