import axios from 'axios'
import { toast } from 'react-toastify'

const TOKEN_KEY = 'admin_token'

export const getToken = () => localStorage.getItem(TOKEN_KEY)

export const setToken = (token) => {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

export const clearToken = () => localStorage.removeItem(TOKEN_KEY)

const baseURL =
  import.meta.env.VITE_API_BASE || 'http://localhost:5000/api/admin'

const client = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

client.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.token = `Bearer ${token}`
  }
  // Let the browser set multipart boundary for FormData
  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    if (config.headers && typeof config.headers.set === 'function') {
      config.headers.set('Content-Type', false)
    } else {
      delete config.headers['Content-Type']
    }
  }
  return config
})

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status
    if (status === 401) {
      clearToken()
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

/**
 * Safe request wrapper — never throws.
 * Success only when API body.status is 1/true (not merely HTTP 200).
 */
export async function apiRequest(fn, { silent = false } = {}) {
  try {
    const res = await fn()
    const body = res?.data ?? {}
    const hasBodyStatus = Object.prototype.hasOwnProperty.call(body, 'status')
    const ok = hasBodyStatus
      ? body.status === 1 || body.status === true
      : res.status >= 200 && res.status < 300

    if (!ok && !silent) {
      toast.error(body.message || 'Request failed')
    }
    return {
      ok,
      data: body.data ?? null,
      message: body.message || (ok ? '' : 'Request failed'),
      status: hasBodyStatus ? body.status : res.status,
      raw: body,
    }
  } catch (err) {
    const message =
      err?.response?.data?.message ||
      err?.message ||
      'Network or server error'
    if (!silent) {
      toast.error(message)
    }
    return {
      ok: false,
      data: null,
      message,
      status: err?.response?.status ?? -1,
      raw: err?.response?.data ?? null,
    }
  }
}

export default client
