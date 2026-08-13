import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { authApi } from '../api/adminApi'
import { getToken, setToken } from '../api/client'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('admin@thunayanhoney.com')
  const [password, setPassword] = useState('Admin@123')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (getToken()) {
    return <Navigate to="/" replace />
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await authApi.login({ email, password })
    setLoading(false)

    if (!res.ok) {
      setError(res.message || 'Login failed')
      toast.error(res.message || 'Login failed')
      return
    }

    const token = res.data?.token || res.raw?.token
    if (!token) {
      setError('No token returned from server')
      toast.error('No token returned from server')
      return
    }

    setToken(token)
    toast.success('Welcome back')
    navigate('/', { replace: true })
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-brand">
          Thunayan <span>Honey</span>
        </h1>
        <p className="login-sub">Sign in to the admin panel</p>

        <form onSubmit={onSubmit}>
          <div className="form-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error ? <p className="error-text">{error}</p> : null}
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: 8 }}
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="login-hint">
          Default login: <strong>admin@thunayanhoney.com</strong> /{' '}
          <strong>Admin@123</strong>
        </div>
      </div>
    </div>
  )
}
