import { clsx } from 'clsx'
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'

type Verdict = 'COMPLIANT' | 'CONDITIONALLY_COMPLIANT' | 'NON_COMPLIANT' | string

interface Props {
  verdict: Verdict
  size?: 'sm' | 'md' | 'lg'
}

const CONFIG: Record<string, { label: string; icon: React.ElementType; classes: string }> = {
  COMPLIANT: {
    label: 'Compliant',
    icon: CheckCircle2,
    classes: 'bg-green-900/50 text-green-400 border-green-700',
  },
  CONDITIONALLY_COMPLIANT: {
    label: 'Conditionally Compliant',
    icon: AlertTriangle,
    classes: 'bg-amber-900/50 text-amber-400 border-amber-700',
  },
  NON_COMPLIANT: {
    label: 'Non-Compliant',
    icon: XCircle,
    classes: 'bg-red-900/50 text-red-400 border-red-700',
  },
}

export default function VerdictBadge({ verdict, size = 'md' }: Props) {
  const cfg = CONFIG[verdict] ?? {
    label: verdict,
    icon: AlertTriangle,
    classes: 'bg-slate-800 text-slate-400 border-slate-600',
  }
  const Icon = cfg.icon

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 font-semibold border rounded-full',
        cfg.classes,
        size === 'sm' && 'px-2.5 py-0.5 text-xs',
        size === 'md' && 'px-3 py-1 text-sm',
        size === 'lg' && 'px-4 py-1.5 text-base'
      )}
    >
      <Icon size={size === 'lg' ? 18 : 14} />
      {cfg.label}
    </span>
  )
}
