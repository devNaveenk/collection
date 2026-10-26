import { products as publicProducts, publicEntries, repositories } from '../data/portfolio'
import type { Dataset, JoinedEntry } from '../data/types'

/** Replaced at build time. When false, the review-only module is not bundled at all. */
export const REVIEW_BUILD = import.meta.env.VITE_REVIEW_MODE === 'true'

export function buildPublicDataset(): Dataset {
  return {
    reviewMode: false,
    products: publicProducts,
    entries: new Map(publicEntries.map((e): [string, JoinedEntry] => [e.id, { ...e, infra: null }])),
    repositories: new Map(repositories.map((r) => [r.id, r])),
    extraLinks: {},
    vmOrder: [],
  }
}

export async function loadDataset(): Promise<Dataset> {
  const base = buildPublicDataset()
  if (!REVIEW_BUILD) return base
  const internal = await import('../data/internal/infrastructure')
  const details = new Map(internal.infraDetails.map((d) => [d.entryId, d]))
  const entries = new Map<string, JoinedEntry>()
  for (const e of [...publicEntries, ...internal.internalEntries]) {
    entries.set(e.id, { ...e, infra: details.get(e.id) ?? null })
  }
  return {
    reviewMode: true,
    products: [...publicProducts, ...internal.internalProducts],
    entries,
    repositories: base.repositories,
    extraLinks: internal.internalLinks,
    vmOrder: internal.vmOrder,
  }
}
