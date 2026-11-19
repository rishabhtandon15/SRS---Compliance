import { clsx } from 'clsx'

interface Props {
  status: string
  size?: 'xs' | 'sm' | 'md'
}

const STATUS_STYLES: Record<string, string> = {
  FULFILLED: 'bg-green-900/60 text-green-300 border-green-700',
  CONTRADICTED: 'bg-red-900/60 text-red-300 border-red-700',
  EXPLICIT_OMISSION: 'bg-orange-900/60 text-orange-300 border-orange-700',
  MISSING: 'bg-slate-800 text-slate-400 border-slate-600',
  NEEDS_REVIEW: 'bg-amber-900/60 text-amber-300 border-amber-700',
  FULLY_COMPLIANT: 'bg-green-900/60 text-green-300 border-green-700',
  PARTIALLY_COMPLIANT: 'bg-amber-900/60 text-amber-300 border-amber-700',
  NON_COMPLIANT: 'bg-red-900/60 text-red-300 border-red-700',
}

const STATUS_LABEL: Record<string, string> = {
  FULFILLED: 'Fulfilled',
  CONTRADICTED: 'Contradicted',
  EXPLICIT_OMISSION: 'Explicit Omission',
  MISSING: 'Missing',
  NEEDS_REVIEW: 'Needs Review',
  FULLY_COMPLIANT: 'Fully Compliant',
  PARTIALLY_COMPLIANT: 'Partially Compliant',
  NON_COMPLIANT: 'Non-Compliant',
}

export default function StatusBadge({ status, size = 'sm' }: Props) {
  const style = STATUS_STYLES[status] ?? 'bg-slate-800 text-slate-400 border-slate-600'
  const label = STATUS_LABEL[status] ?? status

  return (
    <span
      className={clsx(
        'inline-flex items-center font-mono font-semibold border rounded',
        style,
        size === 'xs' && 'px-1.5 py-0.5 text-[10px]',
        size === 'sm' && 'px-2 py-0.5 text-xs',
        size === 'md' && 'px-2.5 py-1 text-sm',
      )}
    >
      {label}
    </span>
  )
}
