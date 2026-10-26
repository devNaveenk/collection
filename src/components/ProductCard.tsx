import { ArrowRight, GitBranch, Lock } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { PortfolioProduct } from '../data/types'
import { CATEGORY_ICON, CATEGORY_KEY } from '../lib/categories'
import { useDataset } from '../lib/DatasetContext'
import { isClassified, productClassifications, productEntries, productPublicUrls, productRepositories, productVms } from '../lib/selectors'
import { ClassBadge, NoteBadge } from './Badges'
import ExternalLink from './ExternalLink'

export default function ProductCard({ product }: { product: PortfolioProduct }) {
  const { ds } = useDataset()
  const Icon = CATEGORY_ICON[product.category]
  const urls = productPublicUrls(product, ds)
  const repos = productRepositories(product, ds)
  const classes = productClassifications(product, ds)
  const vms = productVms(product, ds)
  const deadNote = classes.length > 0 && classes.every((c) => c === 'DEAD') ? (productEntries(product, ds)[0]?.entry.infra?.note ?? 'Inactive') : null
  const hasInternalOnly = product.inventoryLinks.length > 0 && urls.length === 0
  return (
    <article className="card" data-cat={CATEGORY_KEY[product.category]}>
      <div className="card__visual" aria-hidden="true">
        <span className="card__mono">{product.displayName.slice(0, 2)}</span>
        <Icon size={22} className="card__icon" />
      </div>
      <div className="card__body">
        <div className="card__meta">
          <span className="card__category">{isClassified(product.category) ? product.category : ''}</span>
          <div className="card__badges">
            {classes.map((c) => <ClassBadge key={c} value={c} />)}
          </div>
        </div>
        <h3 className="card__title">
          <Link to={`/products/${product.slug}`} className="card__link">{product.displayName}</Link>
        </h3>
        {product.description ? <p className="card__desc">{product.description}</p> : <div className="card__desc" />}
        <ul className="card__facts">
          <li>
            <GitBranch size={14} aria-hidden="true" />
            {repos.length > 0 ? `${repos.length} source repository linked` : 'Repository not provided'}
          </li>
          {ds.reviewMode && vms.length > 0 && <li className="is-review">VM: {vms.join(', ')}</li>}
        </ul>
        <div className="card__footer">
          <div className="card__actions">
            {deadNote ? (
              <NoteBadge value={deadNote} />
            ) : urls[0] ? (
              <ExternalLink href={urls[0].href} className="link link--strong" label={`Visit ${product.displayName} website`}>Visit Website</ExternalLink>
            ) : (
              <span className="muted">
                {hasInternalOnly ? (<><Lock size={13} aria-hidden="true" /> Internal only</>) : 'URL not provided'}
              </span>
            )}
          </div>
        </div>
        <Link to={`/products/${product.slug}`} className="card__more" aria-label={`View details for ${product.displayName}`}>
          Details <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>
    </article>
  )
}
