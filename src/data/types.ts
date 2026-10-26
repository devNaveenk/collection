/** Classification exactly as recorded in the source inventory. */
export type InventoryClassification = 'Product' | 'UAT' | 'Demo' | 'DEAD'

/** Provisional UI categories. Not official company classifications. */
export type ProductCategory =
  | 'Election Technology'
  | 'Campaign Finance'
  | 'Voter Outreach'
  | 'Education'
  | 'AI & Automation'
  | 'Customer Support'
  | 'Legal Technology'
  | 'Web Platforms'
  | 'Needs Classification'

export interface Repository {
  id: string
  label: string
  url: string
  host: 'GitHub' | 'Bitbucket'
  /** Name under which the link was originally supplied, when it differs. */
  suppliedAs: string | null
  /** Whether the repository-to-deployment mapping was independently verified. */
  mappingVerified: boolean
  mappingNote: string | null
}

/** Whether a public address exists for an inventory entry. */
export type UrlState = 'url' | 'internal-only' | 'not-provided'

/** Public-safe facet of an inventory entry. Contains no VM, port or operational notes. */
export interface PublicEntry {
  id: string
  applicationName: string
  /** Hostnames exactly as recorded in the inventory (case preserved). */
  domains: string[]
  classification: InventoryClassification
  urlState: UrlState
}

export type EntryRelation =
  | 'primary'
  | 'related-environment'
  | 'backend-service'
  | 'same-name-unconfirmed'

export interface InventoryLink {
  entryId: string
  relation: EntryRelation
}

export interface PortfolioProduct {
  id: string
  slug: string
  name: string
  displayName: string
  /** null when the purpose cannot be established from available material. */
  description: string | null
  category: ProductCategory
  productFamily: string | null
  repositoryIds: string[]
  inventoryLinks: InventoryLink[]
  displayInPublicCatalog: boolean
}

export type Listing = 'public-catalog' | 'internal-only'

export interface SourceRef {
  document: string
  snapshotDate: string
  /** 1-based position in the supplied inventory. */
  sequence: number
}

/** Infrastructure facet. Lives in the sign-in-only data module. */
export interface InfraDetail {
  entryId: string
  vmId: string
  port: number | null
  /** Note exactly as recorded in the workbook, or null. */
  note: string | null
  source: SourceRef
  lastVerifiedAt: string
  listing: Listing
}

export interface JoinedEntry extends PublicEntry {
  infra: InfraDetail | null
}

/** Hosting recorded for a product outside the VM inventory workbook. */
export interface Hosting {
  provider: string
  ip: string
}

export interface Dataset {
  reviewMode: boolean
  products: PortfolioProduct[]
  entries: Map<string, JoinedEntry>
  repositories: Map<string, Repository>
  /** Extra links that only exist in the review dataset. */
  extraLinks: Record<string, InventoryLink[]>
  vmOrder: string[]
  /** Sign-in-only hosting records keyed by product id. */
  hosting: Record<string, Hosting>
}
