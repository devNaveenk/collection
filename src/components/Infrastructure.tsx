import { ChevronDown, Cloud, Lock, Server } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { InventoryClassification, JoinedEntry } from '../data/types'
import { useDataset } from '../lib/DatasetContext'
import { CLASSIFICATIONS, entryUrls, groupByVm } from '../lib/selectors'
import { ClassBadge, NoteBadge } from './Badges'
import CopyButton from './CopyButton'
import ExternalLink from './ExternalLink'

function PublicNotice() {
  return (
    <div className="infra-locked">
      <Lock size={22} aria-hidden="true" />
      <div>
        <h3>Technical inventory is available after sign-in</h3>
        <p>Sign in to view the recorded hosting inventory.</p>
      </div>
    </div>
  )
}

function Hostnames({ e }: { e: JoinedEntry }) {
  const urls = entryUrls(e)
  if (urls.length === 0) {
    return <span className="inv-none">{e.urlState === 'internal-only' ? 'Internal only' : 'URL not provided'}</span>
  }
  const linkable = e.infra?.listing === 'public-catalog'
  return (
    <ul className="host-list">
      {urls.map((u) => (
        <li key={u.host}>
          <code>{u.host}</code>
          <CopyButton value={u.host} label={`hostname ${u.host}`} />
          {linkable && (
            <ExternalLink href={u.href} className="link link--sm" label={`Open ${u.host}`}>Open</ExternalLink>
          )}
        </li>
      ))}
    </ul>
  )
}

function VmTable({ id, entries }: { id: string; entries: JoinedEntry[] }) {
  return (
    <table id={id} className="inv-table">
      <thead>
        <tr><th scope="col">Application</th><th scope="col">Hostname</th><th scope="col">Port</th><th scope="col">Type</th></tr>
      </thead>
      <tbody>
        {entries.map((e) => {
          const i = e.infra!
          return (
            <tr key={e.id}>
              <th scope="row" data-label="Application">
                <span className="inv-name">{e.applicationName}</span>
                {i.note && <NoteBadge value={i.note} />}
              </th>
              <td data-label="Hostname"><Hostnames e={e} /></td>
              <td data-label="Port">{i.port !== null ? <code>{i.port}</code> : <span className="inv-none">—</span>}</td>
              <td data-label="Type"><ClassBadge value={e.classification} /></td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

function InventoryView() {
  const { ds } = useDataset()
  const [vm, setVm] = useState('')
  const [cls, setCls] = useState<InventoryClassification | ''>('')
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const groups = useMemo(() => groupByVm(ds), [ds])
  const visible = useMemo(
    () =>
      groups
        .filter((g) => !vm || g.vmId === vm)
        .map((g) => ({ ...g, entries: g.entries.filter((e) => !cls || e.classification === cls) }))
        .filter((g) => g.entries.length > 0),
    [groups, vm, cls],
  )
  const total = visible.reduce((n, g) => n + g.entries.length, 0)
  const counts = useMemo(() => {
    const c: Record<InventoryClassification, number> = { Product: 0, UAT: 0, Demo: 0, DEAD: 0 }
    for (const g of visible) for (const e of g.entries) c[e.classification] += 1
    return c
  }, [visible])
  const allExpanded = visible.length > 0 && visible.every((g) => expanded.has(g.vmId))
  const filtered = Boolean(vm || cls)

  function toggle(id: string) {
    setExpanded((s) => {
      const n = new Set(s)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })
  }

  return (
    <>
      <p className="inv-caption">Counts here are inventory entries, one per workbook row, so they can differ from the product counts in the catalog above (for example, a backend service has its own row).</p>
      <dl className="inv-summary">
        <div><dt>VM groups</dt><dd>{visible.length}</dd></div>
        <div><dt>Entries</dt><dd>{total}</dd></div>
        {CLASSIFICATIONS.map((c) => (
          <div key={c}><dt>{c}</dt><dd>{counts[c]}</dd></div>
        ))}
      </dl>

      <form className="inv-controls" onSubmit={(e) => e.preventDefault()} aria-label="Filter inventory">
        <div className="field">
          <label htmlFor="i-vm">VM</label>
          <select id="i-vm" value={vm} onChange={(e) => setVm(e.target.value)}>
            <option value="">All VMs</option>
            {groups.map((g) => <option key={g.vmId} value={g.vmId}>{g.vmId}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="i-cls">Type</label>
          <select id="i-cls" value={cls} onChange={(e) => setCls(e.target.value as InventoryClassification | '')}>
            <option value="">All</option>
            {CLASSIFICATIONS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <button type="button" className="btn btn--quiet btn--dark" disabled={!filtered} onClick={() => { setVm(''); setCls('') }}>Clear all</button>
        <button
          type="button"
          className="btn btn--quiet btn--dark inv-controls__end"
          onClick={() => setExpanded(allExpanded ? new Set() : new Set(visible.map((g) => g.vmId)))}
        >
          {allExpanded ? 'Collapse all' : 'Expand all'}
        </button>
      </form>
      <p className="sr-only" role="status" aria-live="polite">{total} entries in {visible.length} VM groups</p>

      {Object.keys(ds.hosting).length > 0 && !vm && !cls && (
        <div className="hosting-strip">
          <Cloud size={16} aria-hidden="true" />
          <span className="hosting-strip__label">Hosted outside the VM inventory</span>
          {Object.entries(ds.hosting).map(([id, h]) => (
            <span key={id} className="hosting-strip__item">
              <strong>{ds.products.find((p) => p.id === id)?.displayName ?? id}</strong>
              <span>{h.provider}</span>
              <code>{h.ip}</code>
              <CopyButton value={h.ip} label={`IP address for ${id}`} />
            </span>
          ))}
        </div>
      )}

      {visible.length === 0 ? (
        <div className="empty empty--dark"><h3>No inventory entries match</h3><p>Adjust or clear the filters.</p></div>
      ) : (
        <div className="vm-grid">
          {visible.map((g) => {
            const isOpen = expanded.has(g.vmId)
            const types = CLASSIFICATIONS.map((c) => [c, g.entries.filter((e) => e.classification === c).length] as const).filter(([, n]) => n > 0)
            return (
              <section key={g.vmId} className="vm" aria-labelledby={`vm-${g.vmId}`}>
                <h3 id={`vm-${g.vmId}`} className="vm__head">
                  <button type="button" aria-expanded={isOpen} aria-controls={`vm-panel-${g.vmId}`} onClick={() => toggle(g.vmId)}>
                    <Server size={16} aria-hidden="true" />
                    <code className="vm__name">{g.vmId}</code>
                    <span className="vm__types">
                      {types.map(([c, n]) => <span key={c} className={`vm__type vm__type--${c.toLowerCase()}`}>{n} {c}</span>)}
                    </span>
                    <ChevronDown size={16} className="vm__chev" aria-hidden="true" />
                  </button>
                </h3>
                {isOpen && <VmTable id={`vm-panel-${g.vmId}`} entries={g.entries} />}
              </section>
            )
          })}
        </div>
      )}
    </>
  )
}

export default function Infrastructure() {
  const { ds, loading } = useDataset()
  return (
    <section id="infrastructure" className="section section--dark" aria-labelledby="infra-title">
      <div className="container">
        <p className="eyebrow eyebrow--light">Infrastructure inventory</p>
        <h2 id="infra-title" className="section__title">Known application inventory</h2>
        <p className="section__lede">
          Applications grouped by the VM identifiers in the inventory snapshot dated 6 October 2026. It is a recorded
          snapshot, not live monitoring: nothing here indicates current availability.
        </p>
        {ds.reviewMode ? <InventoryView /> : loading ? <p className="muted-dark">Loading…</p> : <PublicNotice />}
      </div>
    </section>
  )
}
