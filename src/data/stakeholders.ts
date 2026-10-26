/**
 * Accounts allowed past the login screen. This is a convenience gate, NOT security:
 * the list and all site data are delivered to every visitor's browser.
 *
 * Add an account:  node scripts/hash-password.mjs someone@sonline.us "their password"
 * then paste the printed line below.
 */
export interface Stakeholder {
  email: string
  passwordHash: string
}

export const stakeholders: Stakeholder[] = [
  { email: 'suria@ballotda.com', passwordHash: '587d3834465badb4a1afbf2919f6a35de6eb998ac66dabf3a417722dd3ff2aea' },
  { email: 'shri@sonline.us', passwordHash: 'c22453eae862a95d6907cdf92cf93c4b173f70962fa315087834a528e9538004' },
  { email: 'naveenk@ballotda.com', passwordHash: '0fbbf4baa42954f2047090049beec7f05ab5328de943bc1e4fc51b8cb51d0091' },
]
