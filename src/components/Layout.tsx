import { Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { REVIEW_BUILD } from '../lib/dataset'
import { useDataset } from '../lib/DatasetContext'
import { company } from '../data/portfolio'
import Wordmark from './Wordmark'
import Footer from './Footer'

const NAV = [
  { label: 'Home', to: '/#home' },
  { label: 'Products', to: '/#products' },
  { label: 'Infrastructure', to: '/#infrastructure' },
  { label: 'About', to: '/#about' },
]

export default function Layout() {
  const [open, setOpen] = useState(false)
  const { pathname, hash } = useLocation()
  const { loading } = useDataset()

  useEffect(() => {
    setOpen(false)
    if (REVIEW_BUILD && loading) return
    if (hash) {
      const el = document.getElementById(hash.slice(1))
      if (el) {
        el.scrollIntoView()
        return
      }
    }
    window.scrollTo(0, 0)
  }, [pathname, hash, loading])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <a href="#main" className="skip-link">Skip to content</a>
      <header className="site-header">
        <div className="container site-header__bar">
          <Wordmark />
          <nav aria-label="Primary" className="nav nav--desktop">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} className="nav__link">{n.label}</Link>
            ))}
          </nav>
          <Link to="/#products" className="btn btn--primary btn--sm nav--desktop">Explore Products</Link>
          <button
            type="button"
            className="menu-btn"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
          </button>
        </div>
        {open && (
          <nav id="mobile-nav" aria-label="Mobile" className="mobile-nav">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} className="mobile-nav__link">{n.label}</Link>
            ))}
            <Link to="/#products" className="btn btn--primary">Explore Products</Link>
          </nav>
        )}
      </header>
      <main id="main" tabIndex={-1}>
        {REVIEW_BUILD && loading ? <p className="container section" role="status">Loading inventory…</p> : <Outlet />}
      </main>
      <Footer contactUrl={company.contactUrl} />
    </>
  )
}
