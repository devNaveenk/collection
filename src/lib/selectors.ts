import type {
  Dataset,
  InventoryClassification,
  JoinedEntry,
  PortfolioProduct,
  ProductCategory,
  Repository,
  InventoryLink,
} from '../data/types'
import { hostToUrl } from './url'

export const CLASSIFICATIONS: InventoryClassification[] = ['Product', 'UAT', 'Demo', 'DEAD']

export interface ResolvedEntry {
  entry: JoinedEntry
  relation: InventoryLink['relation']
}

export function productLinks(p: PortfolioProduct, ds: Dataset): InventoryLink[] {
  return [...p.inventoryLinks, ...(ds.extraLinks[p.id] ?? [])]
}

/** Entries that exist in this dataset. Missing ids (withheld from a public build) are skipped. */
export function productEntries(p: PortfolioProduct, ds: Dataset): ResolvedEntry[] {
  const out: ResolvedEntry[] = []
  for (const l of productLinks(p, ds)) {
    const entry = ds.entries.get(l.entryId)
    if (entry) out.push({ entry, relation: l.relation })
  }
  return out
}

export function productRepositories(p: PortfolioProduct, ds: Dataset): Repository[] {
  return p.repositoryIds.flatMap((id) => ds.repositories.get(id) ?? [])
}

export interface PublicUrl {
  host: string
  href: string
}

export function entryUrls(entry: JoinedEntry): PublicUrl[] {
  return entry.domains.flatMap((host) => {
    const href = hostToUrl(host)
    return href ? [{ host, href }] : []
  })
}

/** Public URLs for a product, only from entries that are not withheld from the catalog. */
export function productPublicUrls(p: PortfolioProduct, ds: Dataset): PublicUrl[] {
  const seen = new Set<string>()
  const out: PublicUrl[] = []
  for (const { entry } of productEntries(p, ds)) {
    if (entry.infra && entry.infra.listing !== 'public-catalog') continue
    if (entry.classification === 'DEAD') continue
    for (const u of entryUrls(entry)) {
      if (!seen.has(u.href)) {
        seen.add(u.href)
        out.push(u)
      }
    }
  }
  return out
}

export function productClassifications(p: PortfolioProduct, ds: Dataset): InventoryClassification[] {
  const set = new Set(productEntries(p, ds).map((r) => r.entry.classification))
  if (set.size === 0 && p.listedAs) set.add(p.listedAs)
  return CLASSIFICATIONS.filter((c) => set.has(c))
}

export function productVms(p: PortfolioProduct, ds: Dataset): string[] {
  const set = new Set<string>()
  for (const { entry } of productEntries(p, ds)) if (entry.infra) set.add(entry.infra.vmId)
  return [...set]
}

export const isClassified = (c: ProductCategory) => c !== 'Needs Classification'

export function catalogProducts(ds: Dataset): PortfolioProduct[] {
  return ds.products.filter((p) => p.displayInPublicCatalog)
}

export interface Filters {
  q: string
  classification: InventoryClassification | ''
  vm: string
  repoOnly: boolean
}

export const EMPTY_FILTERS: Filters = { q: '', classification: '', vm: '', repoOnly: false }

export function hasActiveFilters(f: Filters): boolean {
  return Boolean(f.q.trim() || f.vm || f.repoOnly)
}

export function filterProducts(list: PortfolioProduct[], f: Filters, ds: Dataset): PortfolioProduct[] {
  const q = f.q.trim().toLowerCase()
  return list.filter((p) => {
    const entries = productEntries(p, ds)
    if (f.classification && !productClassifications(p, ds).includes(f.classification)) return false
    if (f.vm && !entries.some((r) => r.entry.infra?.vmId === f.vm)) return false
    if (f.repoOnly && p.repositoryIds.length === 0) return false
    if (q) {
      const hay = [
        p.name,
        p.displayName,
        p.description ?? '',
        p.category,
        p.productFamily ?? '',
        ...entries.flatMap((r) => [r.entry.applicationName, ...r.entry.domains]),
      ]
        .join(' ')
        .toLowerCase()
      if (!hay.includes(q)) return false
    }
    return true
  })
}

export interface PortfolioMetrics {
  catalogProducts: number
  byClassification: Record<InventoryClassification, number>
  withRepository: number
  /** Review mode only. */
  inventoryEntries: number | null
  vmGroups: number | null
}

export function computeMetrics(ds: Dataset): PortfolioMetrics {
  const cat = catalogProducts(ds)
  // Same unit and rule as the catalog tabs: a product counts under every classification it has.
  const byClassification: Record<InventoryClassification, number> = { Product: 0, UAT: 0, Demo: 0, DEAD: 0 }
  for (const p of cat) for (const c of productClassifications(p, ds)) byClassification[c] += 1
  const all = [...ds.entries.values()]
  return {
    catalogProducts: cat.length,
    byClassification,
    withRepository: cat.filter((p) => p.repositoryIds.length > 0).length,
    inventoryEntries: ds.reviewMode ? all.length : null,
    vmGroups: ds.reviewMode ? new Set(all.map((e) => e.infra?.vmId).filter(Boolean)).size : null,
  }
}

export function groupByVm(ds: Dataset): { vmId: string; entries: JoinedEntry[] }[] {
  const all = [...ds.entries.values()].filter((e) => e.infra)
  const ids = [...new Set([...ds.vmOrder, ...all.map((e) => e.infra!.vmId)])]
  return ids.map((vmId) => ({
    vmId,
    entries: all
      .filter((e) => e.infra!.vmId === vmId)
      .sort((a, b) => a.infra!.source.sequence - b.infra!.source.sequence),
  }))
}
