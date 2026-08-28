import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { authApi } from '../api/adminApi'
import Field from '../components/Field'
import { getToken, setToken } from '../api/client'
import { collectErrors, firstError, requiredText } from '../utils/form'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')

  if (getToken()) {
    return <Navigate to="/" replace />
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    const next = collectErrors({
      email: requiredText(email, 'Email'),
      password: requiredText(password, 'Password'),
    })
    setErrors(next)
    if (Object.keys(next).length) {
      toast.error(firstError(next))
      return
    }

    setLoading(true)
    const res = await authApi.login({ email: email.trim(), password })
    setLoading(false)

    if (!res.ok) {
      const msg =
        res.message ||
        'Login failed. Check API is running on :5000 and admin user is seeded.'
      setFormError(msg)
      toast.error(msg)
      return
    }

    const token =
      res.data?.token ||
      res.raw?.data?.token ||
      res.raw?.token ||
      null
    if (!token) {
      const msg =
        res.message ||
        'Login failed: no token returned. On the API folder, set JWT_SECRECT in .env (see envformat.txt) and restart npm run start.'
      setFormError(msg)
      toast.error(msg)
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

        <form onSubmit={onSubmit} noValidate>
          <p className="legend-required">
            <span className="req-star">*</span> Required fields
          </p>
          {formError ? <div className="form-alert">{formError}</div> : null}

          <Field label="Email" required error={errors.email}>
            <input
              id="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setErrors((prev) => ({ ...prev, email: '' }))
              }}
            />
          </Field>
          <Field label="Password" required error={errors.password}>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setErrors((prev) => ({ ...prev, password: '' }))
              }}
            />
          </Field>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: 8 }}
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
