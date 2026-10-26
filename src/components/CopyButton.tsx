import { Check, Copy } from 'lucide-react'
import { useState } from 'react'

export default function CopyButton({ value, label }: { value: string; label: string }) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle')
  async function copy() {
    try {
      await navigator.clipboard.writeText(value)
      setState('copied')
    } catch {
      setState('failed')
    }
    window.setTimeout(() => setState('idle'), 1600)
  }
  return (
    <button type="button" className="icon-btn" onClick={copy} aria-label={`Copy ${label}`}>
      {state === 'copied' ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
      <span className="sr-only" role="status">
        {state === 'copied' ? 'Copied' : state === 'failed' ? 'Copy failed' : ''}
      </span>
    </button>
  )
}
