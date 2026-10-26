import type { Stakeholder } from '../data/stakeholders'

/** Failed sign-in attempts allowed per browser before the form locks. Stored locally, so it is easy to bypass. */
export const MAX_FAILED_ATTEMPTS = 60

export async function credentialHash(email: string, password: string): Promise<string> {
  const data = new TextEncoder().encode(`sonline|${email.trim().toLowerCase()}|${password}`)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function verifyCredentials(email: string, password: string, list: Stakeholder[]): Promise<boolean> {
  const e = email.trim().toLowerCase()
  const account = list.find((s) => s.email.toLowerCase() === e)
  if (!account) return false
  return (await credentialHash(e, password)) === account.passwordHash
}
