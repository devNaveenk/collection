import { LogIn } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { MAX_FAILED_ATTEMPTS } from '../lib/auth'
import { useAuth } from '../lib/AuthContext'

export default function LoginPage() {
  const { login, locked } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const r = await login(email, password)
    setBusy(false)
    if (r === 'invalid') setError('Email or password is incorrect.')
    if (r === 'locked') setError(`Too many failed attempts (${MAX_FAILED_ATTEMPTS}). Sign-in is disabled in this browser.`)
  }

  return (
    <section className="login" aria-labelledby="login-title">
      <div className="login__brand">
        <div className="login__brand-inner">
          <p className="eyebrow eyebrow--light">Sonline</p>
          <h1 className="login__headline">Product portfolio</h1>
          <p className="login__sub">
            A directory of Sonline's software products and digital platforms, with their websites and source repositories.
          </p>
        </div>
      </div>
      <div className="login__panel">
        <form className="login__form" onSubmit={submit} noValidate>
          <h2 id="login-title" className="login__title">Sign in</h2>
          <p className="login__hint">Access is limited to approved Sonline stakeholders.</p>
          <div className="field">
            <label htmlFor="l-email">Email</label>
            <input id="l-email" className="text-input" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={locked} />
          </div>
          <div className="field">
            <label htmlFor="l-pw">Password</label>
            <input id="l-pw" className="text-input" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} disabled={locked} />
          </div>
          {(error || locked) && <p className="login__error" role="alert">{error ?? 'Sign-in is disabled in this browser.'}</p>}
          <button type="submit" className="btn btn--primary" disabled={busy || locked || !email || !password}>
            <LogIn size={16} aria-hidden="true" /> {busy ? 'Checking…' : 'Sign in'}
          </button>
        </form>
      </div>
    </section>
  )
}
