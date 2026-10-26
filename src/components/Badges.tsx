import type { DataCompleteness, InventoryClassification, OperationalState } from '../data/types'

export function ClassBadge({ value }: { value: InventoryClassification }) {
  return <span className={`badge badge--${value.toLowerCase()}`}>{value}</span>
}

const OP_LABEL: Record<OperationalState, string> = {
  'verified-running': 'Verified running',
  disabled: 'Disabled (documented)',
  inactive: 'Inactive (documented)',
  unknown: 'State not checked',
  'requires-review': 'Requires review',
}

export function OpBadge({ value }: { value: OperationalState }) {
  return <span className={`badge badge--op-${value}`}>{OP_LABEL[value]}</span>
}

const COMPLETE_LABEL: Record<DataCompleteness, string> = {
  complete: 'Complete',
  partial: 'Partial',
  'awaiting-confirmation': 'Awaiting confirmation',
}

export function CompletenessBadge({ value }: { value: DataCompleteness }) {
  return <span className={`badge badge--c-${value}`}>{COMPLETE_LABEL[value]}</span>
}
