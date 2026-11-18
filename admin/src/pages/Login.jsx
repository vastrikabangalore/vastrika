import { useState } from 'react'
import { TextField } from '../components/ui'
import { useAuth } from '../lib/auth.jsx'
import { friendlyError } from '../lib/helpers'
import { supabase } from '../lib/supabase'

export default function Login() {
  const { status, user, signOut } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    if (signInError) {
      setError(signInError.status === 400 ? 'That email or password is incorrect.' : friendlyError(signInError))
    }
    setBusy(false)
  }

  if (status === 'denied' || status === 'error') {
    return (
      <div className="centered">
        <div className="panel narrow">
          <h1>Admin access needed</h1>
          <p>
            {status === 'denied'
              ? `${user?.email} is not on the admin list. Add its User ID to the admins table in Supabase.`
              : 'Your access could not be checked. Try logging in again.'}
          </p>
          <button className="button" onClick={signOut}>Log out</button>
        </div>
      </div>
    )
  }

  return (
    <div className="centered login">
      <form className="panel narrow" onSubmit={submit}>
        <h1>Vastrika admin</h1>
        <TextField label="Email" type="email" autoComplete="username" required value={email} onChange={setEmail} />
        <TextField label="Password" type="password" autoComplete="current-password" required value={password} onChange={setPassword} />
        {error && <p className="error" role="alert">{error}</p>}
        <button className="button primary wide" disabled={busy}>{busy ? 'Logging in…' : 'Log in'}</button>
      </form>
    </div>
  )
}
