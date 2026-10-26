import { ArrowLeft, GitBranch, Lock } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { ClassBadge, CompletenessBadge, OpBadge } from '../components/Badges'
import CopyButton from '../components/CopyButton'
import ExternalLink from '../components/ExternalLink'
import { CATEGORY_ICON, CATEGORY_KEY } from '../lib/categories'
import { useDataset } from '../lib/DatasetContext'
import { assessCompleteness, entryUrls, productEntries, productRepositories, productVms } from '../lib/selectors'
import type { EntryRelation } from '../data/types'
import NotFoundPage from './NotFoundPage'

const RELATION: Record<EntryRelation, string> = {
  primary: 'Primary entry',
  'related-environment': 'Related environment',
  'backend-service': 'Backend service',
  'same-name-unconfirmed': 'Same name; relationship not confirmed',
}

function Field({ label, children, empty }: { label: string; children?: React.ReactNode; empty?: string }) {
  return (
    <div className="field-row">
      <dt>{label}</dt>
      <dd>{children ?? <span className="muted">{empty ?? 'Not provided'}</span>}</dd>
    </div>
  )
}

export default function ProductPage() {
  const { slug } = useParams()
  const { ds, loading } = useDataset()
  const product = ds.products.find((p) => p.slug === slug && (p.displayInPublicCatalog || ds.reviewMode))
  if (!product) return loading ? <section className="section"><div className="container"><p>Loading…</p></div></section> : <NotFoundPage />

  const Icon = CATEGORY_ICON[product.category]
  const entries = productEntries(product, ds)
  const repos = productRepositories(product, ds)
  const c = assessCompleteness(product, ds)
  const vms = productVms(product, ds)

  return (
    <article className="detail" data-cat={CATEGORY_KEY[product.category]}>
      <header className="detail__hero">
        <div className="container">
          <Link to="/#products" className="back-link"><ArrowLeft size={15} aria-hidden="true" /> All products</Link>
          <div className="detail__title-row">
            <span className="detail__icon" aria-hidden="true"><Icon size={26} /></span>
            <div>
              <p className="eyebrow eyebrow--light">{product.category}{product.productFamily ? ` · ${product.productFamily} family` : ''}</p>
              <h1 className="detail__title">{product.displayName}</h1>
            </div>
          </div>
          {!product.displayInPublicCatalog && <p className="detail__flag"><Lock size={14} aria-hidden="true" /> Not listed in the public catalog (review build only)</p>}
        </div>
      </header>

      <div className="container detail__grid">
        <div>
          <h2 className="h-sm">About</h2>
          <p className={product.description ? 'detail__desc' : 'detail__desc muted'}>
            {product.description ?? 'Description awaiting confirmation.'}
          </p>
          {product.descriptionStatus === 'cautious' && (
            <p className="note">This description is cautious wording based on the product name and inventory record, not an official statement.</p>
          )}

          <h2 className="h-sm">Websites and environments</h2>
          {entries.length === 0 ? (
            <p className="muted">No inventory entry is recorded for this product yet.</p>
          ) : (
            <ul className="env-list">
              {entries.map(({ entry, relation }) => {
                const urls = entryUrls(entry)
                return (
                  <li key={entry.id} className="env">
                    <div className="env__head">
                      <strong>{entry.applicationName}</strong>
                      <ClassBadge value={entry.classification} />
                      {entry.infra && <OpBadge value={entry.infra.operationalState} />}
                    </div>
                    <p className="env__rel">{RELATION[relation]}</p>
                    {urls.length > 0 && entry.infra && entry.infra.listing !== 'public-catalog' ? (
                      <ul className="host-list">
                        {urls.map((u) => (
                          <li key={u.host}><code>{u.host}</code><span className="muted">Recorded hostname; not offered as a public link</span></li>
                        ))}
                      </ul>
                    ) : urls.length > 0 ? (
                      <ul className="host-list">
                        {urls.map((u) => (
                          <li key={u.host}>
                            <ExternalLink href={u.href} className="link link--strong" label={`Visit ${u.host}`}>Visit Website</ExternalLink>
                            <code>{u.host}</code>
                            <CopyButton value={u.host} label={`hostname ${u.host}`} />
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="muted">{entry.urlState === 'internal-only' ? 'Internal only' : 'URL not provided'}</p>
                    )}
                    {entry.infra && (
                      <dl className="env__review">
                        <div><dt>VM</dt><dd><code>{entry.infra.vmId}</code></dd></div>
                        <div><dt>Port</dt><dd>{entry.infra.port !== null ? <code>{entry.infra.port}</code> : (entry.infra.portNote ?? 'Not provided')}</dd></div>
                        <div><dt>Notes</dt><dd>{entry.infra.notes.length ? entry.infra.notes.join(' ') : 'None recorded'}</dd></div>
                        {entry.infra.reviewReasons.map((r) => <div key={r} className="env__warn"><dt>Review</dt><dd>{r}</dd></div>)}
                      </dl>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <aside className="detail__side" aria-label="Product facts">
          <dl>
            <Field label="Category">{product.category}</Field>
            <Field label="Classification">
              {entries.length ? (
                <span className="badges">{[...new Set(entries.map((x) => x.entry.classification))].map((k) => <ClassBadge key={k} value={k} />)}</span>
              ) : undefined}
            </Field>
            <Field label="Data completeness">
              <CompletenessBadge value={c.status} />
              {c.missing.length > 0 && <span className="missing">Awaiting: {c.missing.join(', ')}</span>}
            </Field>
            {ds.reviewMode && <Field label="VM (review)">{vms.length ? vms.join(', ') : undefined}</Field>}
          </dl>
          <h2 className="h-sm">Source repository</h2>
          {repos.length > 0 ? (
            <ul className="repo-list">
              {repos.map((r) => (
                <li key={r.id}>
                  <ExternalLink
                    href={r.url}
                    className="btn btn--primary"
                    label={`View source repository for ${r.label} on ${r.host}`}
                    icon={<GitBranch size={15} aria-hidden="true" />}
                  >
                    View Source Repository
                  </ExternalLink>
                  <p className="repo__host">{r.host}</p>
                  {r.suppliedAs && <p className="note">Supplied under the name "{r.suppliedAs}".</p>}
                  {r.mappingNote && <p className="note">{r.mappingNote}</p>}
                  <p className="note">Link accessibility has not been tested.</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">Repository not provided</p>
          )}
        </aside>
      </div>
    </article>
  )
}
