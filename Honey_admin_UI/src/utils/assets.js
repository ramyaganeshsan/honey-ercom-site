/** Base URL for cloud/uploads assets (same host as API :5000). */
export function dashboardBaseUrl() {
  const fromEnv = import.meta.env.VITE_DASHBOARD_URL
  if (fromEnv) {
    return fromEnv.endsWith('/') ? fromEnv : `${fromEnv}/`
  }
  const api = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api/admin'
  try {
    const u = new URL(api)
    return `${u.protocol}//${u.host}/`
  } catch {
    return 'http://localhost:5000/'
  }
}

export function productImageUrl(dealKey, bust, index = 1) {
  if (!dealKey) return ''
  const slot = Math.min(8, Math.max(1, Number(index) || 1))
  const base = dashboardBaseUrl()
  const url = `${base}cloud/uploads/products/1000_800/${dealKey}_${slot}.png`
  return bust ? `${url}?t=${bust}` : url
}

export function bannerImageUrl(bannerId, bust) {
  if (!bannerId) return ''
  const base = dashboardBaseUrl()
  const url = `${base}cloud/uploads/banner_images/${bannerId}.png`
  return bust ? `${url}?t=${bust}` : url
}
