import { useEffect } from 'react'

/**
 * Full-page add/edit screen (replaces popup dialogs).
 * Kept as `Modal` so existing page imports keep working.
 */
export default function Modal({
  open,
  title,
  onClose,
  children,
  footer,
  wide = false,
  busy = false,
}) {
  useEffect(() => {
    if (!open) return undefined
    const main = document.querySelector('.page-content')
    if (main) {
      main.scrollTo({ top: 0, behavior: 'smooth' })
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
    return undefined
  }, [open])

  if (!open) return null

  return (
    <section
      className={`form-page${wide ? ' wide' : ''}`}
      role="region"
      aria-label={title}
    >
      <div className="form-page-header">
        <div className="form-page-heading">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={onClose}
            disabled={busy}
          >
            ← Back
          </button>
          <h2>{title}</h2>
        </div>
        {footer ? <div className="form-page-actions">{footer}</div> : null}
      </div>
      <div className="form-page-body panel">{children}</div>
    </section>
  )
}
