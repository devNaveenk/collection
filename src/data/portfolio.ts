import type { PortfolioProduct, PublicEntry, Repository } from './types'

/**
 * Public-safe portfolio data. To add a product: add its entries to `publicEntries`
 * (if it has any), then a record to `products`. Repositories go in `repositories`.
 * Do not put VM names, ports or operational notes here; see ./internal/infrastructure.ts.
 */

export const company = {
  name: 'Sonline',
  wordmark: 'Sonline',
  /** Add only officially supplied values. null means "not provided". */
  contactUrl: null as string | null,
  foundedYear: null as number | null,
  headquarters: null as string | null,
}

export const repositories: Repository[] = [
  {
    id: 'repo-cftrack',
    label: 'CF-Track',
    url: 'https://bitbucket.org/sonline21/cftrack.ballotda/src/main/',
    host: 'Bitbucket',
    suppliedAs: null,
    mappingVerified: false,
    mappingNote: null,
  },
  {
    id: 'repo-absentee',
    label: 'Absentee Ballot',
    url: 'https://github.com/shrinivasan2003/absentee',
    host: 'GitHub',
    suppliedAs: 'uatabsentee ballot',
    mappingVerified: false,
    mappingNote:
      'A source repository is not proof of production deployment. Access has not been tested.',
  },
  {
    id: 'repo-votersms',
    label: 'VoterSMS',
    url: 'https://github.com/shrinivasan2003/votersms',
    host: 'GitHub',
    suppliedAs: null,
    mappingVerified: false,
    mappingNote:
      'Associated with the VoterSMS product family. The mapping to a specific deployment has not been independently verified.',
  },
]

const e = (
  id: string,
  applicationName: string,
  domains: string[],
  classification: PublicEntry['classification'],
  urlState: PublicEntry['urlState'] = 'url',
): PublicEntry => ({ id, applicationName, domains, classification, urlState })

/** Entries approved for the public catalog. Withheld entries live in the review-only module. */
export const publicEntries: PublicEntry[] = [
  e('inv-01', 'Absentee Ballot', ['uatabs.ballotda.com'], 'UAT'),
  e('inv-02', 'BallotDA SOS / NASS', ['sos.ballotda.com'], 'Product'),
  e('inv-03', 'PulsarAI', ['pulsarai.resourz.net'], 'Demo'),
  e('inv-04', 'QR360', ['qr.resourz.net'], 'Demo'),
  e('inv-05', 'Shoby', ['shoby.resourz.net'], 'Demo'),
  e('inv-06', 'Sonline Legal AI', ['viclegal.resourz.net'], 'Demo'),
  e('inv-07', 'VoterSMS Outreach', ['outreach.ballotda.com'], 'Product'),
  e('inv-08', 'SupportIQ (production)', ['cs.supportiq.app'], 'Product'),
  e('inv-09', 'SupportIQ (UAT)', ['uat.supportiq.app'], 'UAT'),
  e('inv-10', 'Astra', ['astra.resourz.net'], 'Demo'),
  e('inv-11', 'CM Gurukul', ['cmgurukul.resourz.net'], 'Demo'),
  e('inv-12', 'Gonzalez', ['gonzalez.resourz.net'], 'Demo'),
  e('inv-13', 'Indiana 529', ['indiana529.resourz.net'], 'Demo'),
  e('inv-14', 'Kentucky SOS', ['kysos.resourz.net'], 'Demo'),
  e('inv-16', 'Demo Agency WP Site', ['demoagencywpsite.resourz.net'], 'Demo'),
  e('inv-17', 'Demo PHP WP Site', ['demophpwpsite.resourz.net'], 'Demo'),
  e('inv-18', 'Georgia SOS demo', ['gasos.resourz.net'], 'Demo'),
  e('inv-19', 'Idaho Admin Rules', ['IDAdminrules.resourz.net'], 'Demo'),
  e('inv-21', 'BallotDA', ['ballotda.com', 'www.ballotda.com'], 'Product'),
  e('inv-22', 'BallotDA (new)', ['new.ballotda.com'], 'Product'),
  e('inv-23', 'Election Automation Software', ['electionautomationsoftware.com', 'www.electionautomationsoftware.com'], 'Product'),
  e('inv-25', 'Edukadu', ['edukadu.com', 'www.edukadu.com'], 'Product'),
  e('inv-27', 'Idaho SOS', ['idsos.resourz.net'], 'Demo'),
  e('inv-28', 'Sonline.ai', ['sonline.ai', 'www.sonline.ai'], 'Product'),
  e('inv-29', 'MyFlorida', ['flsos.resourz.net'], 'Demo'),
  e('inv-32', 'Nadia', ['nadia.bot', 'www.nadia.bot'], 'Product'),
  e('inv-33', 'Indiana CF', ['indianacf.resourz.net', 'www.indianacf.resourz.net'], 'Demo'),
]

const link = (entryId: string, relation: 'primary' | 'related-environment' = 'primary') => ({
  entryId,
  relation,
})

const p = (
  id: string,
  name: string,
  category: PortfolioProduct['category'],
  description: string | null,
  descriptionStatus: PortfolioProduct['descriptionStatus'],
  links: PortfolioProduct['inventoryLinks'],
  extra: Partial<PortfolioProduct> = {},
): PortfolioProduct => ({
  id,
  slug: id,
  name,
  displayName: name,
  description,
  descriptionStatus,
  category,
  productFamily: null,
  repositoryIds: [],
  inventoryLinks: links,
  displayInPublicCatalog: true,
  ...extra,
})

const AWAIT = 'awaiting-confirmation' as const

/** Products listed in the public catalog. Descriptions are cautious; none are official yet. */
export const products: PortfolioProduct[] = [
  p('cf-track', 'CF-Track', 'Campaign Finance',
    'Campaign Finance Track (CF-Track) is a campaign-finance tracking product.',
    'cautious', [], { displayName: 'CF-Track', repositoryIds: ['repo-cftrack'] }),
  p('absentee-ballot', 'Absentee Ballot', 'Election Technology',
    'Absentee ballot application. Provisional name; recorded in the inventory as a UAT environment.',
    'cautious', [link('inv-01')], { repositoryIds: ['repo-absentee'] }),
  p('votersms', 'VoterSMS', 'Voter Outreach',
    'Voter outreach product. The name indicates SMS-based outreach; detailed capabilities are awaiting confirmation.',
    'cautious', [link('inv-07')], { productFamily: 'VoterSMS', repositoryIds: ['repo-votersms'] }),
  p('ballotda', 'BallotDA', 'Election Technology', null, AWAIT,
    [link('inv-21'), link('inv-22', 'related-environment')]),
  p('ballotda-sos-nass', 'BallotDA SOS / NASS', 'Election Technology', null, AWAIT, [link('inv-02')]),
  p('election-automation-software', 'Election Automation Software', 'Election Technology',
    'Election automation software. Detailed description awaiting confirmation.',
    'cautious', [link('inv-23')]),
  p('supportiq', 'SupportIQ', 'Customer Support',
    'Customer support product, recorded with separate production and UAT environments.',
    'cautious', [link('inv-08'), link('inv-09', 'related-environment')]),
  p('sonline-ai', 'Sonline.ai', 'AI & Automation',
    'The Sonline.ai website. Detailed product description awaiting confirmation.',
    'cautious', [link('inv-28')]),
  p('sonline-legal-ai', 'Sonline Legal AI', 'Legal Technology',
    'Legal-focused AI demonstration. Detailed description awaiting confirmation.',
    'cautious', [link('inv-06')]),
  p('edukadu', 'Edukadu', 'Education',
    'Edukadu website. Detailed description awaiting confirmation.',
    'cautious', [link('inv-25')]),
  p('nadia', 'Nadia', 'Needs Classification', null, AWAIT, [link('inv-32')]),
  p('pulsarai', 'PulsarAI', 'AI & Automation', null, AWAIT, [link('inv-03')]),
  p('qr360', 'QR360', 'Needs Classification', null, AWAIT, [link('inv-04')]),
  p('shoby', 'Shoby', 'Needs Classification', null, AWAIT, [link('inv-05')]),
  p('astra', 'Astra', 'Needs Classification', null, AWAIT, [link('inv-10')]),
  p('cm-gurukul', 'CM Gurukul', 'Needs Classification', null, AWAIT, [link('inv-11')]),
  p('gonzalez', 'Gonzalez', 'Needs Classification', null, AWAIT, [link('inv-12')]),
  p('indiana-529', 'Indiana 529', 'Needs Classification', null, AWAIT, [link('inv-13')]),
  p('indiana-cf', 'Indiana CF', 'Needs Classification', null, AWAIT, [link('inv-33')]),
  p('kentucky-sos', 'Kentucky SOS', 'Needs Classification', null, AWAIT, [link('inv-14')]),
  p('georgia-sos-demo', 'Georgia SOS demo', 'Needs Classification', null, AWAIT, [link('inv-18')]),
  p('idaho-sos', 'Idaho SOS', 'Needs Classification', null, AWAIT, [link('inv-27')]),
  p('idaho-admin-rules', 'Idaho Admin Rules', 'Needs Classification', null, AWAIT, [link('inv-19')]),
  p('myflorida', 'MyFlorida', 'Needs Classification', null, AWAIT, [link('inv-29')]),
  p('demo-agency-wp-site', 'Demo Agency WP Site', 'Web Platforms',
    'Demonstration website, recorded in the inventory as "Demo Agency WP Site".',
    'cautious', [link('inv-16')]),
  p('demo-php-wp-site', 'Demo PHP WP Site', 'Web Platforms',
    'Demonstration website, recorded in the inventory as "Demo PHP WP Site".',
    'cautious', [link('inv-17')]),
]
