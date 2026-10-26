import { describe, expect, it } from 'vitest'
import { publicEntries, products, repositories } from '../data/portfolio'
import { infraDetails, internalEntries, internalLinks, internalProducts, vmOrder } from '../data/internal/infrastructure'
import type { Dataset, JoinedEntry } from '../data/types'
import { catalogProducts, computeMetrics, EMPTY_FILTERS, NO_VM, filterProducts, groupByVm, productPublicUrls } from './selectors'
import { buildPublicDataset } from './dataset'
import { hostToUrl, safeHttpUrl } from './url'

function reviewDataset(): Dataset {
  const details = new Map(infraDetails.map((d) => [d.entryId, d]))
  const entries = new Map<string, JoinedEntry>()
  for (const e of [...publicEntries, ...internalEntries]) entries.set(e.id, { ...e, infra: details.get(e.id) ?? null })
  return {
    reviewMode: true,
    products: [...products, ...internalProducts],
    entries,
    repositories: new Map(repositories.map((r) => [r.id, r])),
    extraLinks: internalLinks,
    vmOrder,
    hosting: {},
  }
}

describe('inventory import', () => {
  const ds = reviewDataset()
  it('accounts for all 32 entries with infra detail', () => {
    expect(ds.entries.size).toBe(32)
    expect([...ds.entries.values()].every((e) => e.infra)).toBe(true)
  })
  it('has eight VM groups with the recorded sizes', () => {
    const sizes = Object.fromEntries(groupByVm(ds).map((g) => [g.vmId, g.entries.length]))
    expect(sizes).toEqual({
      'sos-ballotda': 7, supportiq: 8, dvkumarnadiaai: 5, 'ballotda-website': 4,
      edukaduwebsite: 3, sonlineaiui: 3, nadiaui: 1, nadiadb: 1,
    })
  })
  it('links every entry to exactly one product', () => {
    const count = new Map<string, number>()
    for (const p of ds.products)
      for (const l of [...p.inventoryLinks, ...(ds.extraLinks[p.id] ?? [])]) count.set(l.entryId, (count.get(l.entryId) ?? 0) + 1)
    for (const id of ds.entries.keys()) expect(count.get(id), id).toBe(1)
  })
  it('keeps classification distinct from operational state', () => {
    expect(ds.entries.get('inv-24')?.classification).toBe('DEAD')
    expect(ds.entries.get('inv-31')?.classification).toBe('Product')
    expect(ds.entries.get('inv-31')?.infra?.note).toBe('Service DISABLED — reboot risk')
    expect(ds.entries.get('inv-24')?.infra?.note).toBe('Nothing listening — vhost dead')
  })
  it('has no VoterSMS entry on sonlineaiui', () => {
    expect(ds.entries.has('inv-30')).toBe(false)
    expect(ds.entries.get('inv-07')?.applicationName).toBe('VoterSMS Outreach')
    expect(groupByVm(ds).find((g) => g.vmId === 'sonlineaiui')?.entries.map((e) => e.applicationName)).toEqual(['Sonline.ai', 'MyFlorida', 'Sonline AI backend API'])
  })
})

describe('repositories', () => {
  it('contains the three supplied links exactly', () => {
    expect(repositories.map((r) => r.url)).toEqual([
      'https://bitbucket.org/sonline21/cftrack.ballotda/src/main/',
      'https://github.com/shrinivasan2003/absentee',
      'https://github.com/shrinivasan2003/votersms',
    ])
    for (const r of repositories) expect(safeHttpUrl(r.url)).not.toBeNull()
  })
})

describe('public dataset', () => {
  const ds = buildPublicDataset()
  it('exposes no infra detail and no withheld entries', () => {
    expect([...ds.entries.values()].every((e) => e.infra === null)).toBe(true)
    expect(ds.entries.size).toBe(28)
    const names = JSON.stringify([...ds.entries.values()])
    for (const hidden of ['Fenix', 'Winter Park', 'backendapi', 'reboot']) expect(names).not.toContain(hidden)
    expect(catalogProducts(ds).some((p) => p.id === 'fenix')).toBe(false)
  })
  it('computes metrics from data', () => {
    const m = computeMetrics(ds)
    expect(m.inventoryEntries).toBeNull()
    expect(m.byClassification.DEAD).toBe(0)
    expect(m.byClassification).toEqual({ Product: 9, UAT: 2, Demo: 16, DEAD: 0 })
    expect(m.withRepository).toBe(3)
  })
  it('does not inflate product count with multiple URLs', () => {
    const ballotda = ds.products.find((p) => p.id === 'ballotda')!
    expect(productPublicUrls(ballotda, ds).length).toBeGreaterThan(1)
    expect(ds.products.filter((p) => p.name === 'BallotDA')).toHaveLength(1)
  })
  it('search and filters combine', () => {
    const list = catalogProducts(ds)
    expect(filterProducts(list, { ...EMPTY_FILTERS, q: 'resourz' }, ds).length).toBeGreaterThan(5)
    expect(filterProducts(list, { ...EMPTY_FILTERS, q: 'zzzz' }, ds)).toHaveLength(0)
    expect(filterProducts(list, { ...EMPTY_FILTERS, repoOnly: true }, ds).map((p) => p.id).sort()).toEqual(['absentee-ballot', 'cf-track', 'votersms'])
    expect(filterProducts(list, { ...EMPTY_FILTERS, classification: 'UAT', q: 'supportiq' }, ds).map((p) => p.id)).toEqual(['supportiq'])
    expect(filterProducts(list, { ...EMPTY_FILTERS, classification: 'DEAD' }, ds)).toHaveLength(0)
  })
})

describe('VM filter', () => {
  const ds = reviewDataset()
  const list = catalogProducts(ds)
  it('per-VM product counts match the inventory', () => {
    const count = (vm: string, c?: 'Product') => filterProducts(list, { ...EMPTY_FILTERS, vm, classification: c ?? '' }, ds).length
    expect(Object.fromEntries(vmOrder.map((v) => [v, count(v)]))).toEqual({
      'sos-ballotda': 7, supportiq: 6, dvkumarnadiaai: 4, 'ballotda-website': 3, edukaduwebsite: 2, sonlineaiui: 2, nadiaui: 1, nadiadb: 1,
    })
    expect(vmOrder.reduce((n, v) => n + count(v, 'Product'), 0)).toBe(8)
  })
  it('lists products without a VM under the No VM option', () => {
    expect(filterProducts(list, { ...EMPTY_FILTERS, vm: NO_VM }, ds).map((p) => p.id)).toEqual(['cf-track'])
    expect(filterProducts(list, { ...EMPTY_FILTERS, classification: 'Product' }, ds)).toHaveLength(9)
  })
})

describe('url helpers', () => {
  it('builds https urls from valid hosts only', () => {
    expect(hostToUrl('IDAdminrules.resourz.net')).toBe('https://idadminrules.resourz.net')
    expect(hostToUrl('not a host')).toBeNull()
    expect(safeHttpUrl('javascript:alert(1)')).toBeNull()
  })
})
