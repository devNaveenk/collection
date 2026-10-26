import { Link } from 'react-router-dom'
import { useDataset } from '../lib/DatasetContext'
import { catalogProducts, productPublicUrls } from '../lib/selectors'
import ExternalLink from './ExternalLink'
import Wordmark from './Wordmark'

export default function Footer({ contactUrl }: { contactUrl: string | null }) {
  const { ds } = useDataset()
  const featured = catalogProducts(ds)
    .filter((p) => p.inventoryLinks.length && ds.entries.get(p.inventoryLinks[0]!.entryId)?.classification === 'Product')
    .flatMap((p) => {
      const u = productPublicUrls(p, ds)[0]
      return u ? [{ name: p.displayName, href: u.href }] : []
    })
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <Wordmark inverse />
          <p className="footer-blurb">
            Sonline maintains a portfolio of software products and digital platforms. This site lists them with the
            information currently on record.
          </p>
        </div>
        <nav aria-label="Product directory">
          <h2 className="footer-h">Directory</h2>
          <ul className="footer-list">
            <li><Link to="/#products">All products</Link></li>
            <li><Link to="/#infrastructure">Infrastructure</Link></li>
            <li><Link to="/#about">About</Link></li>
            {contactUrl && <li><ExternalLink href={contactUrl}>Contact</ExternalLink></li>}
          </ul>
        </nav>
        <nav aria-label="Product websites">
          <h2 className="footer-h">Product websites</h2>
          <ul className="footer-list">
            {featured.map((f) => (
              <li key={f.href}><ExternalLink href={f.href}>{f.name}</ExternalLink></li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="container footer-legal">
        <p>© {new Date().getFullYear()} Sonline. All rights reserved.</p>
      </div>
    </footer>
  )
}
