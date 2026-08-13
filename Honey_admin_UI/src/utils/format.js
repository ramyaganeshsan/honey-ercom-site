import dayjs from 'dayjs'

export function formatDate(value) {
  if (value == null || value === '') return '—'
  if (typeof value === 'number') {
    const ms = value < 1e12 ? value * 1000 : value
    return dayjs(ms).format('DD MMM YYYY, HH:mm')
  }
  const d = dayjs(value)
  return d.isValid() ? d.format('DD MMM YYYY, HH:mm') : String(value)
}

export function formatMoney(value, currency = 'KWD') {
  const n = Number(value)
  if (Number.isNaN(n)) return '—'
  return `${n.toFixed(3)} ${currency}`
}

export function pickList(data) {
  if (!data) return []
  if (Array.isArray(data)) return data
  if (Array.isArray(data.items)) return data.items
  if (Array.isArray(data.rows)) return data.rows
  if (Array.isArray(data.list)) return data.list
  if (Array.isArray(data.users)) return data.users
  if (Array.isArray(data.products)) return data.products
  if (Array.isArray(data.orders)) return data.orders
  if (Array.isArray(data.categories)) return data.categories
  return []
}

export function isActiveStatus(active) {
  return active === 1 || active === true || active === 'active'
}
