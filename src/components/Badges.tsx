import type { InventoryClassification } from '../data/types'

export function ClassBadge({ value }: { value: InventoryClassification }) {
  return <span className={`badge badge--${value.toLowerCase()}`}>{value}</span>
}

/** A note exactly as recorded in the inventory workbook. */
export function NoteBadge({ value }: { value: string }) {
  return <span className="badge badge--note">{value}</span>
}
