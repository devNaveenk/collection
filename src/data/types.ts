/** Classification exactly as recorded in the source inventory. */
export type InventoryClassification = 'Product' | 'UAT' | 'Demo' | 'DEAD'

/** Operational state is kept apart from classification and is never inferred from it. */
export type OperationalState =
  | 'verified-running' // only with current evidence; unused in the initial import
  | 'disabled' // explicitly documented
  | 'inactive' // explicitly documented
  | 'unknown' // not checked
  | 'requires-review' // records inconsistent or incomplete

export type DataCompleteness = 'complete' | 'partial' | 'awaiting-confirmation'

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

export type DescriptionStatus = 'official' | 'cautious' | 'awaiting-confirmation'

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
  descriptionStatus: DescriptionStatus
  category: ProductCategory
  productFamily: string | null
  repositoryIds: string[]
  inventoryLinks: InventoryLink[]
  displayInPublicCatalog: boolean
}

export type VmResolution = 'explicit' | 'inherited-from-group' | 'inherited-ambiguous'
export type Listing = 'public-catalog' | 'internal-only' | 'hold-for-review'

export interface SourceRef {
  document: string
  snapshotDate: string
  /** 1-based position in the supplied inventory. */
  sequence: number
}

/** Infrastructure facet. Lives in the review-only data module. */
export interface InfraDetail {
  entryId: string
  vmId: string
  vmResolution: VmResolution
  port: number | null
  portNote: string | null
  operationalState: OperationalState
  notes: string[]
  source: SourceRef
  lastVerifiedAt: string
  listing: Listing
  requiresReview: boolean
  reviewReasons: string[]
}

export interface JoinedEntry extends PublicEntry {
  infra: InfraDetail | null
}

export interface Dataset {
  reviewMode: boolean
  products: PortfolioProduct[]
  entries: Map<string, JoinedEntry>
  repositories: Map<string, Repository>
  /** Extra links that only exist in the review dataset. */
  extraLinks: Record<string, InventoryLink[]>
  vmOrder: string[]
}
