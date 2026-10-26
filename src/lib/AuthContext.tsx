import { createContext, useContext, useState, type ReactNode } from 'react'
import { stakeholders } from '../data/stakeholders'
import { MAX_FAILED_ATTEMPTS, verifyCredentials } from './auth'

const SESSION_KEY = 'sonline.session'
const FAILS_KEY = 'sonline.failedAttempts'

export type LoginResult = 'ok' | 'invalid' | 'locked'

interface Ctx {
  email: string | null
  login: (email: string, password: string) => Promise<LoginResult>
  logout: () => void
  locked: boolean
}

const AuthCtx = createContext<Ctx | null>(null)

function read(storage: Storage | undefined, key: string): string | null {
  try {
    return storage?.getItem(key) ?? null
  } catch {
    return null
  }
}
function write(storage: Storage | undefined, key: string, value: string | null) {
  try {
    if (value === null) storage?.removeItem(key)
    else storage?.setItem(key, value)
  } catch {
    /* storage unavailable: the session just won't persist */
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [email, setEmail] = useState<string | null>(() => read(sessionStorage, SESSION_KEY))
  const [fails, setFails] = useState(() => Number(read(localStorage, FAILS_KEY) ?? 0) || 0)
  const locked = fails >= MAX_FAILED_ATTEMPTS

  async function login(e: string, password: string): Promise<LoginResult> {
    if (locked) return 'locked'
    if (await verifyCredentials(e, password, stakeholders)) {
      write(sessionStorage, SESSION_KEY, e.trim().toLowerCase())
      write(localStorage, FAILS_KEY, '0')
      setFails(0)
      setEmail(e.trim().toLowerCase())
      return 'ok'
    }
    const next = fails + 1
    write(localStorage, FAILS_KEY, String(next))
    setFails(next)
    return next >= MAX_FAILED_ATTEMPTS ? 'locked' : 'invalid'
  }

  function logout() {
    write(sessionStorage, SESSION_KEY, null)
    setEmail(null)
  }

  return <AuthCtx.Provider value={{ email, login, logout, locked }}>{children}</AuthCtx.Provider>
}

export function useAuth(): Ctx {
  const c = useContext(AuthCtx)
  if (!c) throw new Error('useAuth outside provider')
  return c
}
