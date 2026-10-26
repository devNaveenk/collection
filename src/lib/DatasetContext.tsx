import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Dataset } from '../data/types'
import { buildPublicDataset, loadDataset } from './dataset'

interface Ctx {
  ds: Dataset
  loading: boolean
  /** Review build only: lets the team preview what the public build would show. */
  publicPreview: boolean
  setPublicPreview: (v: boolean) => void
}

const DatasetCtx = createContext<Ctx | null>(null)
const publicDs = buildPublicDataset()

export function DatasetProvider({ children }: { children: ReactNode }) {
  const [full, setFull] = useState<Dataset | null>(null)
  const [loading, setLoading] = useState(true)
  const [publicPreview, setPublicPreview] = useState(false)

  useEffect(() => {
    let live = true
    loadDataset().then((d) => {
      if (!live) return
      setFull(d)
      setLoading(false)
    })
    return () => {
      live = false
    }
  }, [])

  const ds = full && !publicPreview ? full : publicDs
  return <DatasetCtx.Provider value={{ ds, loading, publicPreview, setPublicPreview }}>{children}</DatasetCtx.Provider>
}

export function useDataset(): Ctx {
  const c = useContext(DatasetCtx)
  if (!c) throw new Error('useDataset outside provider')
  return c
}
