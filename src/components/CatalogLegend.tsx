import { Info } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

const TERMS: { term: string; meaning: string }[] = [
  { term: 'Product', meaning: 'Listed as a Product in the inventory.' },
  { term: 'UAT', meaning: 'A user-acceptance testing environment.' },
  { term: 'Demo', meaning: 'A demonstration site, not necessarily a commercial product.' },
  { term: 'Complete', meaning: 'Official description, public URL, repository and category are all on record.' },
  { term: 'Partial', meaning: 'Some details are on record; others are still missing.' },
  { term: 'Awaiting confirmation', meaning: 'The purpose is not confirmed yet, so no description is shown.' },
  { term: 'Needs Classification', meaning: 'Category not decided yet; categories are provisional.' },
  { term: 'Repository not provided', meaning: 'No source repository link has been supplied yet.' },
  { term: 'Internal only / URL not provided', meaning: 'No public website address is on record.' },
]

/** Info button that blinks a few times when it first scrolls into view (the catalog heading). */
export default function CatalogLegend() {
  const [open, setOpen] = useState(false)
  const [blink, setBlink] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const seen = useRef(false)

  useEffect(() => {
    const target = root.current
    if (!target || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !seen.current) {
          seen.current = true
          setBlink(true)
          window.setTimeout(() => setBlink(false), 3600)
        }
      },
      { threshold: 0.9 },
    )
    io.observe(target)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    const onDown = (e: MouseEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('mousedown', onDown)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('mousedown', onDown)
    }
  }, [open])

  return (
    <div className="legend" ref={root}>
      <button
        type="button"
        className={`legend__btn${blink ? ' is-blinking' : ''}`}
        aria-expanded={open}
        aria-controls="legend-panel"
        aria-label="What do these labels mean?"
        onClick={() => {
          setOpen(!open)
          setBlink(false)
        }}
      >
        <Info size={18} aria-hidden="true" />
      </button>
      {open && (
        <div id="legend-panel" className="legend__panel" role="region" aria-label="What the labels mean">
          <h3>What the labels mean</h3>
          <dl>
            {TERMS.map((t) => (
              <div key={t.term}>
                <dt>{t.term}</dt>
                <dd>{t.meaning}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </div>
  )
}
