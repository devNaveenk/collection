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
    { label: 'Products & platforms', value: m.catalogProducts, note: 'Distinct catalog records; multiple URLs or environments count once' },
    { label: 'Listed environments', value: m.listedEnvironments, note: 'Websites and environments shown in the catalog' },
    { label: 'Product', value: m.byClassification.Product, note: 'Environments classified Product' },
    { label: 'UAT', value: m.byClassification.UAT, note: 'Environments classified UAT' },
    { label: 'Demo', value: m.byClassification.Demo, note: 'Environments classified Demo' },
    { label: 'With source repository', value: m.withRepository, note: 'Repository links supplied so far' },
  ]
  if (m.inventoryEntries !== null) {
    metrics.push(
      { label: 'Inventory entries', value: m.inventoryEntries, note: `Across ${m.vmGroups ?? 0} recorded VM groups. Review only` },
      { label: 'Requires review', value: m.requiresReview ?? 0, note: 'Entries flagged in the inventory import. Review only' },
    )
  }
  return (
    <section id="overview" className="section" aria-labelledby="overview-title">
      <div className="container">
        <p className="eyebrow">Portfolio overview</p>
        <h2 id="overview-title" className="section__title">The portfolio at a glance</h2>
        <p className="section__lede">
          Figures are calculated from the portfolio data on this site. An inventory entry is a recorded environment or
          service; it is not the same as a distinct product.
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
