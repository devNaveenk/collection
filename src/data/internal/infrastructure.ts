import type {
  InfraDetail,
  InventoryClassification,
  InventoryLink,
  Listing,
  OperationalState,
  PortfolioProduct,
  PublicEntry,
  VmResolution,
} from '../types'

/**
 * REVIEW-ONLY DATA. This module is loaded only when the site is built with
 * VITE_REVIEW_MODE=true (see src/lib/dataset.ts). It holds VM identifiers, ports,
 * operational notes and entries withheld from the public catalog.
 *
 * Source: Sonline application inventory (Excel workbook), SSH-verified snapshot
 * dated 6 October 2026, as transcribed in the project brief. The workbook file
 * itself was not present in the repository, so values are as supplied in the brief.
 */

const SNAPSHOT = '2026-10-06'
const DOC = 'Sonline application inventory (Excel workbook)'

export const vmOrder = [
  'sos-ballotda',
  'supportiq',
  'dvkumarnadiaai',
  'ballotda-website',
  'edukaduwebsite',
  'sonlineaiui',
  'nadiaui',
  'nadiadb',
]

interface Row {
  seq: number
  vm: string
  vmResolution?: VmResolution
  port: number | null
  portNote?: string
  state?: OperationalState
  notes?: string[]
  listing?: Listing
  review?: string[]
}

const firstOfGroup = new Set([1, 8, 16, 21, 25, 28, 32, 33])

function detail(r: Row): InfraDetail {
  const review = r.review ?? []
  return {
    entryId: `inv-${String(r.seq).padStart(2, '0')}`,
    vmId: r.vm,
    vmResolution: r.vmResolution ?? (firstOfGroup.has(r.seq) ? 'explicit' : 'inherited-from-group'),
    port: r.port,
    portNote: r.portNote ?? null,
    operationalState: r.state ?? (review.length > 0 ? 'requires-review' : 'unknown'),
    notes: r.notes ?? [],
    source: { document: DOC, snapshotDate: SNAPSHOT, sequence: r.seq },
    lastVerifiedAt: SNAPSHOT,
    listing: r.listing ?? 'public-catalog',
    requiresReview: review.length > 0,
    reviewReasons: review,
  }
}

const NO_VHOST = 'Internal only; no public vhost.'
const MIXED_CASE =
  'Hostname recorded with mixed case ("IDAdminrules"). Preserved as recorded; confirm intended spelling.'

export const infraDetails: InfraDetail[] = [
  // Group A — sos-ballotda
  detail({ seq: 1, vm: 'sos-ballotda', port: 8010 }),
  detail({ seq: 2, vm: 'sos-ballotda', port: 8011 }),
  detail({ seq: 3, vm: 'sos-ballotda', port: 8091 }),
  detail({ seq: 4, vm: 'sos-ballotda', port: 8000 }),
  detail({ seq: 5, vm: 'sos-ballotda', port: 3000 }),
  detail({ seq: 6, vm: 'sos-ballotda', port: 8001 }),
  detail({ seq: 7, vm: 'sos-ballotda', port: 8002 }),
  // Group B — supportiq
  detail({ seq: 8, vm: 'supportiq', port: 443 }),
  detail({ seq: 9, vm: 'supportiq', port: 80, review: ['Recorded port is 80; the scheme used for the generated link is the project default and is unverified.'] }),
  detail({ seq: 10, vm: 'supportiq', port: 8003 }),
  detail({ seq: 11, vm: 'supportiq', port: 8000 }),
  detail({ seq: 12, vm: 'supportiq', port: 8002 }),
  detail({ seq: 13, vm: 'supportiq', port: 8001 }),
  detail({ seq: 14, vm: 'supportiq', port: 8004 }),
  detail({ seq: 15, vm: 'supportiq', port: 8005, notes: [NO_VHOST], listing: 'internal-only' }),
  // Group C — dvkumarnadiaai
  detail({ seq: 16, vm: 'dvkumarnadiaai', port: 8080 }),
  detail({ seq: 17, vm: 'dvkumarnadiaai', port: 8081 }),
  detail({ seq: 18, vm: 'dvkumarnadiaai', port: 9091 }),
  detail({ seq: 19, vm: 'dvkumarnadiaai', port: 9090, review: [MIXED_CASE] }),
  detail({ seq: 20, vm: 'dvkumarnadiaai', port: null, portNote: 'Not provided', notes: [NO_VHOST], listing: 'internal-only' }),
  // Group D — ballotda-website
  detail({ seq: 21, vm: 'ballotda-website', port: 443 }),
  detail({ seq: 22, vm: 'ballotda-website', port: 443 }),
  detail({ seq: 23, vm: 'ballotda-website', port: 443 }),
  detail({
    seq: 24, vm: 'ballotda-website', port: 8000, state: 'inactive',
    notes: ['Nothing listening; vhost dead.'], listing: 'internal-only',
    review: ['Classified DEAD in the inventory. Historical or inactive service requiring review.'],
  }),
  // Group E — edukaduwebsite
  detail({ seq: 25, vm: 'edukaduwebsite', port: 8000 }),
  detail({
    seq: 26, vm: 'edukaduwebsite', port: 8000, listing: 'hold-for-review',
    review: ['Recorded hostname www.edukadu.com overlaps with the primary Edukadu entry. Preserved as recorded; intended mapping not inferred.'],
  }),
  detail({
    seq: 27, vm: 'edukaduwebsite', vmResolution: 'inherited-ambiguous', port: 9001,
    review: ['VM cell is blank in the workbook; association with edukaduwebsite is inherited from the preceding group and not independently confirmed.'],
  }),
  // Group F — sonlineaiui
  detail({ seq: 28, vm: 'sonlineaiui', port: 443 }),
  detail({ seq: 29, vm: 'sonlineaiui', port: 9001 }),
  detail({
    seq: 30, vm: 'sonlineaiui', port: 80, notes: ['Uses the Nginx default server; no dedicated vhost.'],
    listing: 'internal-only',
    review: ['Separate from "VoterSMS Outreach". Relationship to that entry is by name only and is not confirmed.'],
  }),
  detail({
    seq: 31, vm: 'sonlineaiui', port: 8000, state: 'disabled',
    notes: ['Serves Sonline.ai API.', 'Service disabled; reboot risk.'], listing: 'internal-only',
    review: ['Inventory classification is Product, but the service is documented as disabled.'],
  }),
  // Group G — nadiaui
  detail({ seq: 32, vm: 'nadiaui', port: 443 }),
  // Group H — nadiadb
  detail({ seq: 33, vm: 'nadiadb', port: 8000, notes: ['Listed under the nadiadb VM in the workbook. Underlying technology not assumed.'] }),
]

const i = (
  id: string,
  applicationName: string,
  domains: string[],
  classification: InventoryClassification,
  urlState: PublicEntry['urlState'],
): PublicEntry => ({ id, applicationName, domains, classification, urlState })

/** Entries withheld from the public catalog. */
export const internalEntries: PublicEntry[] = [
  i('inv-15', 'Fenix', [], 'Demo', 'internal-only'),
  i('inv-20', 'Winter Park', [], 'Demo', 'internal-only'),
  i('inv-24', 'BallotDA backend API', ['backendapi.ballotda.com'], 'DEAD', 'url'),
  i('inv-26', 'Edukadu (new)', ['new.edukadu.com', 'www.edukadu.com'], 'Product', 'url'),
  i('inv-30', 'VoterSMS', [], 'Demo', 'not-provided'),
  i('inv-31', 'Sonline AI backend API', [], 'Product', 'not-provided'),
]

const base = {
  repositoryIds: [],
  productFamily: null,
  displayInPublicCatalog: false,
  descriptionStatus: 'awaiting-confirmation' as const,
  description: null,
  category: 'Needs Classification' as const,
}

export const internalProducts: PortfolioProduct[] = [
  { ...base, id: 'fenix', slug: 'fenix', name: 'Fenix', displayName: 'Fenix',
    inventoryLinks: [{ entryId: 'inv-15', relation: 'primary' }] },
  { ...base, id: 'winter-park', slug: 'winter-park', name: 'Winter Park', displayName: 'Winter Park',
    inventoryLinks: [{ entryId: 'inv-20', relation: 'primary' }] },
]

/** Links attached to public products that point at withheld entries. */
export const internalLinks: Record<string, InventoryLink[]> = {
  ballotda: [{ entryId: 'inv-24', relation: 'backend-service' }],
  edukadu: [{ entryId: 'inv-26', relation: 'related-environment' }],
  votersms: [{ entryId: 'inv-30', relation: 'same-name-unconfirmed' }],
  'sonline-ai': [{ entryId: 'inv-31', relation: 'backend-service' }],
}
