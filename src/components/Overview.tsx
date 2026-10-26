import { useDataset } from '../lib/DatasetContext'
import { computeMetrics } from '../lib/selectors'

interface Metric {
  label: string
  value: number
  note: string
}

export default function Overview() {
  const { ds } = useDataset()
  const m = computeMetrics(ds)
  const metrics: Metric[] = [
    { label: 'Products & platforms', value: m.catalogProducts, note: 'Total in the catalog; each product counts once' },
    { label: 'Product', value: m.byClassification.Product, note: 'Same count as the Product tab' },
    { label: 'UAT', value: m.byClassification.UAT, note: 'Same count as the UAT tab' },
    { label: 'Demo', value: m.byClassification.Demo, note: 'Same count as the Demo tab' },
    { label: 'With source repository', value: m.withRepository, note: 'Repository links supplied so far' },
  ]
  if (m.inventoryEntries !== null) {
    metrics.push({ label: 'Inventory entries', value: m.inventoryEntries, note: `Across ${m.vmGroups ?? 0} recorded VM groups` })
  }
  return (
    <section id="overview" className="section" aria-labelledby="overview-title">
      <div className="container">
        <p className="eyebrow">Portfolio overview</p>
        <h2 id="overview-title" className="section__title">The portfolio at a glance</h2>
        <p className="section__lede">
          Figures are calculated from the portfolio data on this site and match the catalog tabs. A product with both a
          production and a UAT environment, such as SupportIQ, appears in both tabs.
        </p>
        <dl className="metrics">
          {metrics.map((x) => (
            <div key={x.label} className="metric">
              <dt>{x.label}</dt>
              <dd className="metric__value">{x.value}</dd>
              <dd className="metric__note">{x.note}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
