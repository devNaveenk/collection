import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Dataset } from '../data/types'
import { useAuth } from './AuthContext'
import { buildPublicDataset, loadDataset } from './dataset'

interface Ctx {
  ds: Dataset
  loading: boolean
}

const DatasetCtx = createContext<Ctx | null>(null)
const publicDs = buildPublicDataset()

export function DatasetProvider({ children }: { children: ReactNode }) {
  const { email } = useAuth()
  const authed = email !== null
  const [full, setFull] = useState<Dataset | null>(null)

  useEffect(() => {
    if (!authed) {
      setFull(null)
      return
    }
    let live = true
    loadDataset().then((d) => live && setFull(d))
    return () => {
      live = false
    }
  }, [authed])

  const loading = authed && full === null
  const ds = authed && full ? full : publicDs
  return <DatasetCtx.Provider value={{ ds, loading }}>{children}</DatasetCtx.Provider>
}

export function useDataset(): Ctx {
  const c = useContext(DatasetCtx)
  if (!c) throw new Error('useDataset outside provider')
  return c
}
