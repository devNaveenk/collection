import { ChevronDown, ClipboardCheck, Lock, Server, TriangleAlert } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { InventoryClassification, JoinedEntry } from '../data/types'
import { useDataset } from '../lib/DatasetContext'
import { CLASSIFICATIONS, entryUrls, groupByVm } from '../lib/selectors'
import { ClassBadge, OpBadge } from './Badges'
import CopyButton from './CopyButton'
import ExternalLink from './ExternalLink'

function PublicNotice() {
  return (
    <div className="infra-locked">
      <Lock size={22} aria-hidden="true" />
      <div>
        <h3>Technical inventory is held for internal review</h3>
        <p>
          Hosting details, internal-only entries and operational notes are not published on this site. They will be
          added only after the organization approves the specific information to be shown. Public product websites are
          listed in the catalog above.
        </p>
      </div>
    </div>
  )
}

function EntryRow({ e }: { e: JoinedEntry }) {
  const i = e.infra!
  const urls = entryUrls(e)
  return (
    <li className="vm-entry">
      <div className="vm-entry__head">
        <span className="vm-entry__name">{e.applicationName}</span>
        <ClassBadge value={e.classification} />
        <OpBadge value={i.operationalState} />
        {i.listing !== 'public-catalog' && (
          <span className="badge badge--hold">{i.listing === 'internal-only' ? 'Not in public catalog' : 'Held for review'}</span>
        )}
      </div>
      <dl className="vm-entry__facts">
        <div>
          <dt>URL</dt>
          <dd>
            {urls.length > 0 ? (
              <ul className="host-list">
                {urls.map((u) => (
                  <li key={u.host}>
                    <code>{u.host}</code>
                    <CopyButton value={u.host} label={`hostname ${u.host}`} />
                    {i.listing === 'public-catalog' && (
                      <ExternalLink href={u.href} className="link link--sm" label={`Open ${u.host}`}>Open</ExternalLink>
                    )}
                  </li>
                ))}
              </ul>
            ) : e.urlState === 'internal-only' ? (
              'Internal only'
            ) : (
              'URL not provided'
            )}
          </dd>
        </div>
        <div>
          <dt>Port</dt>
          <dd>{i.port !== null ? <code>{i.port}</code> : (i.portNote ?? 'Not provided')}</dd>
        </div>
        {i.notes.length > 0 && (
          <div className="wide">
            <dt>Operational notes (as recorded)</dt>
            <dd>{i.notes.join(' ')}</dd>
          </div>
        )}
        {i.vmResolution === 'inherited-ambiguous' && (
          <div className="wide">
            <dt>VM association</dt>
            <dd>Inherited from the preceding group (blank VM cell); ambiguous.</dd>
          </div>
        )}
      </dl>
      {i.reviewReasons.length > 0 && (
        <ul className="review-reasons">
          {i.reviewReasons.map((r) => (
            <li key={r}><TriangleAlert size={14} aria-hidden="true" /> {r}</li>
          ))}
        </ul>
      )}
    </li>
  )
}

function ReviewInventory() {
  const { ds } = useDataset()
  const [vm, setVm] = useState('')
  const [cls, setCls] = useState<InventoryClassification | ''>('')
  const [reviewOnly, setReviewOnly] = useState(false)
  const [open, setOpen] = useState<Record<string, boolean>>({})

  const groups = useMemo(() => groupByVm(ds), [ds])
  const visible = useMemo(
    () =>
      groups
        .filter((g) => !vm || g.vmId === vm)
        .map((g) => ({
          ...g,
          entries: g.entries.filter((e) => (!cls || e.classification === cls) && (!reviewOnly || e.infra?.requiresReview)),
        }))
        .filter((g) => g.entries.length > 0),
    [groups, vm, cls, reviewOnly],
  )
  const total = visible.reduce((n, g) => n + g.entries.length, 0)
  const queue = useMemo(() => [...ds.entries.values()].filter((e) => e.infra?.requiresReview), [ds])
  const filtered = vm || cls || reviewOnly

  return (
    <>
      <form className="filters filters--infra" onSubmit={(e) => e.preventDefault()} aria-label="Filter inventory">
        <div className="field">
          <label htmlFor="i-vm">VM</label>
          <select id="i-vm" value={vm} onChange={(e) => setVm(e.target.value)}>
            <option value="">All VMs</option>
            {groups.map((g) => <option key={g.vmId} value={g.vmId}>{g.vmId}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="i-cls">Classification</label>
          <select id="i-cls" value={cls} onChange={(e) => setCls(e.target.value as InventoryClassification | '')}>
            <option value="">All</option>
            {CLASSIFICATIONS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <label className="check">
          <input type="checkbox" checked={reviewOnly} onChange={(e) => setReviewOnly(e.target.checked)} /> Needs review only
        </label>
        <button type="button" className="btn btn--quiet btn--dark" disabled={!filtered} onClick={() => { setVm(''); setCls(''); setReviewOnly(false) }}>
          Clear all
        </button>
        <span className="results-count" role="status" aria-live="polite">{total} entries in {visible.length} VM groups</span>
      </form>

      {visible.length === 0 ? (
        <div className="empty empty--dark"><h3>No inventory entries match</h3><p>Adjust or clear the filters.</p></div>
      ) : (
        <div className="vm-grid">
          {visible.map((g) => {
            const isOpen = open[g.vmId] ?? false
            const review = g.entries.filter((e) => e.infra?.requiresReview).length
            return (
              <section key={g.vmId} className="vm" aria-labelledby={`vm-${g.vmId}`}>
                <h3 id={`vm-${g.vmId}`} className="vm__head">
                  <button type="button" aria-expanded={isOpen} aria-controls={`vm-panel-${g.vmId}`} onClick={() => setOpen({ ...open, [g.vmId]: !isOpen })}>
                    <Server size={16} aria-hidden="true" />
                    <code>{g.vmId}</code>
                    <span className="vm__count">{g.entries.length} {g.entries.length === 1 ? 'entry' : 'entries'}{review > 0 && ` · ${review} to review`}</span>
                    <ChevronDown size={16} className="vm__chev" aria-hidden="true" />
                  </button>
                </h3>
                {!isOpen && (
                  <p className="vm__peek">{g.entries.map((e) => e.applicationName).join(' · ')}</p>
                )}
                {isOpen && (
                  <ul id={`vm-panel-${g.vmId}`} className="vm__list">
                    {g.entries.map((e) => <EntryRow key={e.id} e={e} />)}
                  </ul>
                )}
              </section>
            )
          })}
        </div>
      )}

      <div className="queue">
        <h3><ClipboardCheck size={18} aria-hidden="true" /> Review queue ({queue.length})</h3>
        <p>Entries flagged during import. Items are preserved as recorded; nothing has been corrected or inferred.</p>
        <ol>
          {queue.map((e) => (
            <li key={e.id}>
              <strong>{e.applicationName}</strong> <span className="muted-dark">({e.infra!.vmId})</span>
              <ul>{e.infra!.reviewReasons.map((r) => <li key={r}>{r}</li>)}</ul>
            </li>
          ))}
        </ol>
      </div>
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
          A human-readable record of applications grouped by the VM identifiers in the inventory snapshot dated 6 October
          2026. It is a recorded snapshot, not live monitoring: nothing here indicates current availability.
        </p>
        {ds.reviewMode ? <ReviewInventory /> : loading ? <p className="muted-dark">Loading…</p> : <PublicNotice />}
      </div>
    </section>
  )
}
