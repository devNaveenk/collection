import type { Hosting, InfraDetail, InventoryLink, Listing, PortfolioProduct, PublicEntry } from '../types'

/**
 * SENSITIVE DATA. Loaded as a separate chunk only after sign-in (see src/lib/dataset.ts).
 * Holds VM identifiers, ports, notes and entries withheld from the public catalog.
 * Sign-in is not access control; the chunk is still served to anyone who requests its URL.
 *
 * Source: sonlineai-db_Application_URLs.xlsx ("Application Inventory (URLs)"),
 * SSH-verified snapshot dated 6 Oct 2026. Types and notes are copied as recorded.
 * VoterSMS (nginx default server, sonlineaiui) was deliberately removed at the team's request.
 */

const SNAPSHOT = '2026-10-06'
const DOC = 'sonlineai-db_Application_URLs.xlsx'

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

const d = (
  seq: number,
  vm: string,
  port: number | null,
  note: string | null = null,
  listing: Listing = 'public-catalog',
): InfraDetail => ({
  entryId: `inv-${String(seq).padStart(2, '0')}`,
  vmId: vm,
  port,
  note,
  source: { document: DOC, snapshotDate: SNAPSHOT, sequence: seq },
  lastVerifiedAt: SNAPSHOT,
  listing,
})

export const infraDetails: InfraDetail[] = [
  d(1, 'sos-ballotda', 8010),
  d(2, 'sos-ballotda', 8011),
  d(3, 'sos-ballotda', 8091),
  d(4, 'sos-ballotda', 8000),
  d(5, 'sos-ballotda', 3000),
  d(6, 'sos-ballotda', 8001),
  d(7, 'sos-ballotda', 8002),
  d(8, 'supportiq', 443),
  d(9, 'supportiq', 80),
  d(10, 'supportiq', 8003),
  d(11, 'supportiq', 8000),
  d(12, 'supportiq', 8002),
  d(13, 'supportiq', 8001),
  d(14, 'supportiq', 8004),
  d(15, 'supportiq', 8005, 'No public vhost', 'internal-only'),
  d(16, 'dvkumarnadiaai', 8080),
  d(17, 'dvkumarnadiaai', 8081),
  d(18, 'dvkumarnadiaai', 9091),
  d(19, 'dvkumarnadiaai', 9090),
  d(20, 'dvkumarnadiaai', null, 'No public vhost', 'internal-only'),
  d(21, 'ballotda-website', 443),
  d(22, 'ballotda-website', 443),
  d(23, 'ballotda-website', 443),
  d(24, 'ballotda-website', 8000, 'Nothing listening — vhost dead', 'internal-only'),
  d(25, 'edukaduwebsite', 8000),
  d(26, 'edukaduwebsite', 8000),
  d(27, 'edukaduwebsite', 9001),
  d(28, 'sonlineaiui', 443),
  d(29, 'sonlineaiui', 9001),
  d(31, 'sonlineaiui', 8000, 'Service DISABLED — reboot risk', 'internal-only'),
  d(32, 'nadiaui', 443),
  d(33, 'nadiadb', 8000),
]

const i = (
  id: string,
  applicationName: string,
  domains: string[],
  classification: PublicEntry['classification'],
  urlState: PublicEntry['urlState'],
): PublicEntry => ({ id, applicationName, domains, classification, urlState })

/** Entries withheld from the public catalog. */
export const internalEntries: PublicEntry[] = [
  i('inv-15', 'Fenix', [], 'Demo', 'internal-only'),
  i('inv-20', 'Winter Park', [], 'Demo', 'internal-only'),
  i('inv-24', 'BallotDA backend API', ['backendapi.ballotda.com'], 'DEAD', 'url'),
  i('inv-31', 'Sonline AI backend API', [], 'Product', 'not-provided'),
]

const base = {
  repositoryIds: [],
  productFamily: null,
  displayInPublicCatalog: false,
  description: null,
  category: 'Needs Classification' as const,
}

export const internalProducts: PortfolioProduct[] = [
  { ...base, id: 'fenix', slug: 'fenix', name: 'Fenix', displayName: 'Fenix',
    inventoryLinks: [{ entryId: 'inv-15', relation: 'primary' }] },
  { ...base, id: 'winter-park', slug: 'winter-park', name: 'Winter Park', displayName: 'Winter Park',
    inventoryLinks: [{ entryId: 'inv-20', relation: 'primary' }] },
]

/** Hosting supplied by the team for products that are not in the VM workbook. */
export const productHosting: Record<string, Hosting> = {
  'cf-track': { provider: 'AWS EC2', ip: '3.22.17.206' },
}

/** Links attached to public products that point at withheld entries. */
export const internalLinks: Record<string, InventoryLink[]> = {
  ballotda: [{ entryId: 'inv-24', relation: 'backend-service' }],
  'sonline-ai': [{ entryId: 'inv-31', relation: 'backend-service' }],
}
