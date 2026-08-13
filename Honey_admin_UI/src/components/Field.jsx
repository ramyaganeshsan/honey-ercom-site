/** Label with optional red required asterisk */
export function FieldLabel({ children, required = false, htmlFor }) {
  return (
    <label htmlFor={htmlFor}>
      {children}
      {required ? <span className="req-star" aria-hidden="true"> *</span> : null}
    </label>
  )
}

/** Form field wrapper with error message */
export default function Field({
  label,
  required = false,
  error = '',
  className = '',
  children,
  hint = '',
}) {
  return (
    <div className={`form-field${className ? ` ${className}` : ''}${error ? ' has-error' : ''}`}>
      {label ? <FieldLabel required={required}>{label}</FieldLabel> : null}
      {children}
      {error ? <p className="field-error">{error}</p> : null}
      {!error && hint ? <p className="field-hint">{hint}</p> : null}
    </div>
  )
}
