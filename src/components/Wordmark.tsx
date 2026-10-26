import { Link } from 'react-router-dom'

/** Official Sonline logo. The artwork has dark text, so it sits on a light chip in dark contexts. */
export default function Wordmark({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link to="/" className={`wordmark${inverse ? ' wordmark--inverse' : ''}`} aria-label="Sonline home">
      <img src="/sonline-logo.png" alt="Sonline" width={125} height={44} className="wordmark__img" />
    </Link>
  )
}
