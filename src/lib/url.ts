/**
 * Project-level URL convention: inventory records hostnames only, so public links
 * are built as https://<host>. This is a documented assumption (see README), not a
 * verified fact for every host. Hostnames are lower-cased for the href only.
 */
export const PUBLIC_URL_SCHEME = 'https'

const HOST_RE = /^(?=.{1,253}$)([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i

export function hostToUrl(host: string): string | null {
  const trimmed = host.trim()
  if (!HOST_RE.test(trimmed)) return null
  return `${PUBLIC_URL_SCHEME}://${trimmed.toLowerCase()}`
}

/** Returns the URL only if it is a well-formed http(s) URL. */
export function safeHttpUrl(value: string | null | undefined): string | null {
  if (!value) return null
  try {
    const u = new URL(value)
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.toString() : null
  } catch {
    return null
  }
}
