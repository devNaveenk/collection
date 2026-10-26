import { SearchX, Search, X } from 'lucide-react'
import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { InventoryClassification, ProductCategory } from '../data/types'
import { useDataset } from '../lib/DatasetContext'
import { CLASSIFICATIONS, EMPTY_FILTERS, catalogProducts, filterProducts, hasActiveFilters, productVms, type Filters } from '../lib/selectors'
import ProductCard from './ProductCard'

export default function Catalog() {
  const { ds, loading } = useDataset()
  const [params, setParams] = useSearchParams()

  const filters: Filters = {
    q: params.get('q') ?? '',
    classification: (params.get('env') as InventoryClassification | null) ?? '',
    category: (params.get('cat') as ProductCategory | null) ?? '',
    vm: params.get('vm') ?? '',
    repoOnly: params.get('repo') === '1',
  }

  function update(next: Partial<Filters>) {
    const f = { ...filters, ...next }
    const p = new URLSearchParams(params)
    const set = (k: string, v: string) => (v ? p.set(k, v) : p.delete(k))
    set('q', f.q)
    set('env', f.classification)
    set('cat', f.category)
    set('vm', f.vm)
    set('repo', f.repoOnly ? '1' : '')
    setParams(p, { replace: true, preventScrollReset: true })
  }

  const all = useMemo(() => catalogProducts(ds), [ds])
  const categories = useMemo(() => [...new Set(all.map((p) => p.category))].sort(), [all])
  const vms = useMemo(() => [...new Set(all.flatMap((p) => productVms(p, ds)))].sort(), [all, ds])
  const results = useMemo(() => filterProducts(all, filters, ds), [all, filters.q, filters.classification, filters.category, filters.vm, filters.repoOnly, ds]) // eslint-disable-line react-hooks/exhaustive-deps
  const active = hasActiveFilters(filters)

  return (
    <section id="products" className="section section--tint" aria-labelledby="products-title">
      <div className="container">
        <p className="eyebrow">Product catalog</p>
        <h2 id="products-title" className="section__title">Products and platforms</h2>
        <p className="section__lede">
          Search the directory by name, description or domain. Descriptions are cautious and marked where purpose is still
          awaiting confirmation.
        </p>

        <form className="filters" role="search" aria-label="Filter products" onSubmit={(e) => e.preventDefault()}>
          <div className="field field--search">
            <label htmlFor="f-q">Search</label>
            <div className="input-wrap">
              <Search size={16} aria-hidden="true" />
              <input id="f-q" type="search" value={filters.q} placeholder="Name, description or domain" onChange={(e) => update({ q: e.target.value })} />
            </div>
          </div>
          <div className="field">
            <label htmlFor="f-env">Classification</label>
            <select id="f-env" value={filters.classification} onChange={(e) => update({ classification: e.target.value as Filters['classification'] })}>
              <option value="">All</option>
              {CLASSIFICATIONS.filter((c) => ds.reviewMode || c !== 'DEAD').map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="f-cat">Category</label>
            <select id="f-cat" value={filters.category} onChange={(e) => update({ category: e.target.value as Filters['category'] })}>
              <option value="">All</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          {ds.reviewMode && (
            <div className="field">
              <label htmlFor="f-vm">VM (review)</label>
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
          <button type="button" className="btn btn--quiet" onClick={() => update({ ...EMPTY_FILTERS })} disabled={!active}>
            <X size={14} aria-hidden="true" /> Clear all
          </button>
        </form>

        <p className="results-count" role="status" aria-live="polite">
          {loading ? 'Loading catalog…' : `Showing ${results.length} of ${all.length} products`}
        </p>

        {results.length > 0 ? (
          <div className="grid">
            {results.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <div className="empty">
            <SearchX size={28} aria-hidden="true" />
            <h3>No products match these filters</h3>
            <p>Try a different search term or remove a filter.</p>
            <button type="button" className="btn btn--primary btn--sm" onClick={() => update({ ...EMPTY_FILTERS })}>Clear all filters</button>
          </div>
        )}
      </div>
    </section>
  )
}
