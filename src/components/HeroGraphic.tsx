import { useDataset } from '../lib/DatasetContext'
import { catalogProducts, productClassifications } from '../lib/selectors'

/** Abstract map of the portfolio drawn from the catalog data. Decorative only. */
export default function HeroGraphic() {
  const { ds } = useDataset()
  const list = catalogProducts(ds)
  const withClass = list.map((p) => ({ p, c: productClassifications(p, ds) }))
  const inner = withClass.filter((x) => x.c.includes('Product'))
  const outer = withClass.filter((x) => !x.c.includes('Product'))
  const place = (n: number, i: number, r: number, offset: number) => {
    const a = (i / n) * Math.PI * 2 + offset
    return { x: 260 + Math.cos(a) * r, y: 260 + Math.sin(a) * r }
  }
  return (
    <svg className="hero-graphic" viewBox="0 0 520 520" role="img" aria-label="Diagram of the Sonline portfolio: product nodes in an inner ring, demonstrations and other entries in an outer ring">
      <circle cx="260" cy="260" r="110" className="hg-ring" />
      <circle cx="260" cy="260" r="205" className="hg-ring hg-ring--dash" />
      {inner.map(({ p }, i) => {
        const pt = place(inner.length, i, 110, -Math.PI / 2)
        return <line key={p.id} x1="260" y1="260" x2={pt.x} y2={pt.y} className="hg-spoke" />
      })}
      {outer.map(({ p }, i) => {
        const pt = place(outer.length, i, 205, -Math.PI / 2 + 0.2)
        const anchor = place(inner.length || 1, i % (inner.length || 1), 110, -Math.PI / 2)
        return <line key={p.id} x1={anchor.x} y1={anchor.y} x2={pt.x} y2={pt.y} className="hg-link" />
      })}
      {outer.map(({ p }, i) => {
        const pt = place(outer.length, i, 205, -Math.PI / 2 + 0.2)
        return <circle key={p.id} cx={pt.x} cy={pt.y} r="5" className="hg-node hg-node--outer" />
      })}
      {inner.map(({ p }, i) => {
        const pt = place(inner.length, i, 110, -Math.PI / 2)
        return <circle key={p.id} cx={pt.x} cy={pt.y} r="9" className="hg-node hg-node--inner" />
      })}
      <circle cx="260" cy="260" r="38" className="hg-core" />
      <text x="260" y="272" textAnchor="middle" className="hg-core-text">S</text>
    </svg>
  )
}
