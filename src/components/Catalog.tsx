import { SearchX, Search, X } from 'lucide-react'
import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { InventoryClassification } from '../data/types'
import { useDataset } from '../lib/DatasetContext'
import { CLASSIFICATIONS, EMPTY_FILTERS, catalogProducts, filterProducts, hasActiveFilters, productVms, type Filters } from '../lib/selectors'
import CatalogLegend from './CatalogLegend'
import ProductCard from './ProductCard'

const DEFAULT_TAB: InventoryClassification = 'Product'

export default function Catalog() {
  const { ds, loading } = useDataset()
  const [params, setParams] = useSearchParams()

  const envParam = params.get('env') as InventoryClassification | null
  const tab: InventoryClassification = envParam && CLASSIFICATIONS.includes(envParam) ? envParam : DEFAULT_TAB
  const filters: Filters = {
    q: params.get('q') ?? '',
    classification: tab,
    vm: params.get('vm') ?? '',
    repoOnly: params.get('repo') === '1',
  }

  function update(next: Partial<Filters>) {
    const f = { ...filters, ...next }
    const p = new URLSearchParams(params)
    const set = (k: string, v: string) => (v ? p.set(k, v) : p.delete(k))
    set('q', f.q)
    set('env', f.classification === DEFAULT_TAB ? '' : f.classification)
    set('vm', f.vm)
    set('repo', f.repoOnly ? '1' : '')
    setParams(p, { replace: true, preventScrollReset: true })
  }

  const all = useMemo(() => catalogProducts(ds), [ds])
  const vms = useMemo(() => [...new Set(all.flatMap((p) => productVms(p, ds)))].sort(), [all, ds])
  const counts = useMemo(() => {
    const base = { ...EMPTY_FILTERS, q: filters.q, vm: filters.vm, repoOnly: filters.repoOnly }
    return Object.fromEntries(CLASSIFICATIONS.map((c) => [c, filterProducts(all, { ...base, classification: c }, ds).length])) as Record<InventoryClassification, number>
  }, [all, ds, filters.q, filters.vm, filters.repoOnly])
  const results = useMemo(() => filterProducts(all, filters, ds), [all, filters.q, filters.classification, filters.vm, filters.repoOnly, ds]) // eslint-disable-line react-hooks/exhaustive-deps
  const active = hasActiveFilters(filters)
  const tabs = CLASSIFICATIONS.filter((c) => ds.reviewMode || c !== 'DEAD')

  return (
    <section id="products" className="section section--tint" aria-labelledby="products-title">
      <div className="container">
        <div className="section__head">
          <div>
            <p className="eyebrow">Product catalog</p>
            <h2 id="products-title" className="section__title">Products and platforms</h2>
          </div>
          <CatalogLegend />
        </div>
        <p className="section__lede">
          Browse by classification. Search by name, description or domain.
        </p>

        <div className="tabs" role="tablist" aria-label="Classification">
          {tabs.map((c) => (
            <button
              key={c}
              type="button"
              role="tab"
              id={`tab-${c}`}
              aria-selected={tab === c}
              aria-controls="catalog-panel"
              className="tab"
              onClick={() => update({ classification: c })}
            >
              {c} <span className="tab__count">{counts[c]}</span>
            </button>
          ))}
        </div>

        <form className="filters" role="search" aria-label="Filter products" onSubmit={(e) => e.preventDefault()}>
          <div className="field field--search">
            <label htmlFor="f-q">Search</label>
            <div className="input-wrap">
              <Search size={16} aria-hidden="true" />
              <input id="f-q" type="search" value={filters.q} placeholder="Name, description or domain" onChange={(e) => update({ q: e.target.value })} />
            </div>
          </div>
          {ds.reviewMode && (
            <div className="field">
              <label htmlFor="f-vm">VM</label>
              <select id="f-vm" value={filters.vm} onChange={(e) => update({ vm: e.target.value })}>
                <option value="">All</option>
                {vms.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
          )}
          <label className="check">
            <input type="checkbox" checked={filters.repoOnly} onChange={(e) => update({ repoOnly: e.target.checked })} />
            Has source repository
          </label>
          <button type="button" className="btn btn--quiet" onClick={() => update({ q: '', vm: '', repoOnly: false })} disabled={!active}>
            <X size={14} aria-hidden="true" /> Clear all
          </button>
        </form>

        <p className="results-count" role="status" aria-live="polite">
          {loading ? 'Loading catalog…' : `Showing ${results.length} ${tab} ${results.length === 1 ? 'entry' : 'entries'}`}
        </p>

        <div id="catalog-panel" role="tabpanel" aria-labelledby={`tab-${tab}`}>
          {results.length > 0 ? (
            <div className="grid">
              {results.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <div className="empty">
              <SearchX size={28} aria-hidden="true" />
              <h3>No {tab} entries match</h3>
              <p>Try a different search term, another tab, or clear the filters.</p>
              <button type="button" className="btn btn--primary btn--sm" onClick={() => update({ q: '', vm: '', repoOnly: false })}>Clear all filters</button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
