import { ArrowUpRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { safeHttpUrl } from '../lib/url'

interface Props {
  href: string
  children: ReactNode
  className?: string
  /** Accessible name when the visible label is not descriptive enough. */
  label?: string
  icon?: ReactNode
}

/** The only way external links are rendered. Malformed URLs render nothing. */
export default function ExternalLink({ href, children, className = 'link', label, icon }: Props) {
  const safe = safeHttpUrl(href)
  if (!safe) return null
  return (
    <a
      href={safe}
      className={className}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label ? `${label} (opens in a new tab)` : undefined}
    >
      {children}
      {icon ?? <ArrowUpRight size={15} aria-hidden="true" />}
    </a>
  )
}
