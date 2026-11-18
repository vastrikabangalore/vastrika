/* eslint-disable react/only-export-components */
import { createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, useState } from 'react'
import { friendlyError } from '../lib/helpers'

const FeedbackContext = createContext(null)

export function FeedbackProvider({ children }) {
  const [toast, setToast] = useState(null)
  const [request, setRequest] = useState(null)
  const dialog = useRef(null)
  const timer = useRef(null)

  const notify = useCallback((message, tone = 'ok') => {
    clearTimeout(timer.current)
    setToast({ message, tone })
    timer.current = setTimeout(() => setToast(null), tone === 'error' ? 8000 : 3500)
  }, [])

  const confirm = useCallback((options) => new Promise((resolve) => {
    setRequest({ ...options, resolve })
  }), [])

  useEffect(() => {
    if (request) dialog.current?.showModal()
  }, [request])

  const answer = (value) => {
    dialog.current?.close()
    request?.resolve(value)
    setRequest(null)
  }

  const value = useMemo(() => ({ notify, confirm }), [notify, confirm])

  return (
    <FeedbackContext.Provider value={value}>
      {children}
      {toast && <div className={`toast ${toast.tone}`} role="status">{toast.message}</div>}
      <dialog ref={dialog} className="confirm" onCancel={(event) => { event.preventDefault(); answer(false) }}>
        {request && (
          <>
            <h2>{request.title}</h2>
            {request.body && <p>{request.body}</p>}
            <div className="actions">
              <button className="button" onClick={() => answer(false)}>Cancel</button>
              <button className="button danger" onClick={() => answer(true)}>{request.action}</button>
            </div>
          </>
        )}
      </dialog>
    </FeedbackContext.Provider>
  )
}

export const useFeedback = () => useContext(FeedbackContext)

export function Field({ label, hint, children }) {
  const id = useId()
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {children(id)}
      {hint && <p className="hint">{hint}</p>}
    </div>
  )
}

export function TextField({ label, hint, value, onChange, ...rest }) {
  return (
    <Field label={label} hint={hint}>
      {(id) => <input id={id} value={value} onChange={(e) => onChange(e.target.value)} {...rest} />}
    </Field>
  )
}

export function TextArea({ label, hint, value, onChange, rows = 5 }) {
  return (
    <Field label={label} hint={hint}>
      {(id) => <textarea id={id} rows={rows} value={value} onChange={(e) => onChange(e.target.value)} />}
    </Field>
  )
}

export function SelectField({ label, value, onChange, options, empty }) {
  return (
    <Field label={label}>
      {(id) => (
        <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
          <option value="">{empty}</option>
          {options.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}
        </select>
      )}
    </Field>
  )
}

export function Toggle({ label, hint, checked, onChange }) {
  return (
    <label className="toggle">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>
        {label}
        {hint && <small>{hint}</small>}
      </span>
    </label>
  )
}

export function Status({ published }) {
  return <span className={published ? 'pill live' : 'pill'}>{published ? 'Published' : 'Draft'}</span>
}

export function PageHead({ title, children }) {
  return (
    <div className="page-head">
      <h1>{title}</h1>
      {children && <div className="actions">{children}</div>}
    </div>
  )
}

export function LoadState({ loading, error, retry }) {
  if (loading) return <p className="muted" role="status">Loading…</p>
  if (error) {
    return (
      <div className="panel" role="alert">
        <p>{friendlyError(error)}</p>
        {retry && <button className="button" onClick={retry}>Try again</button>}
      </div>
    )
  }
  return null
}
