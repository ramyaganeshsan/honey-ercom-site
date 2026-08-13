/** Trimmed string required */
export function requiredText(value, label = 'This field') {
  if (!String(value ?? '').trim()) return `${label} is required`
  return ''
}

export function requiredSelect(value, label = 'This field') {
  if (value === '' || value === null || value === undefined) {
    return `${label} is required`
  }
  return ''
}

export function requiredNumber(value, label = 'This field', { min, allowZero = true } = {}) {
  if (value === '' || value === null || value === undefined) {
    return `${label} is required`
  }
  const n = Number(value)
  if (Number.isNaN(n)) return `${label} must be a number`
  if (!allowZero && n === 0) return `${label} must be greater than 0`
  if (min != null && n < min) return `${label} must be at least ${min}`
  return ''
}

/** Collect first error toast + return errors map */
export function collectErrors(checks) {
  const errors = {}
  for (const [key, message] of Object.entries(checks)) {
    if (message) errors[key] = message
  }
  return errors
}

export function firstError(errors) {
  const vals = Object.values(errors || {}).filter(Boolean)
  return vals[0] || ''
}
