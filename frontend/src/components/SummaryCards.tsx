import { clsx } from 'clsx'
import { CheckCircle2, XCircle, AlertTriangle, MinusCircle, Eye } from 'lucide-react'

interface StatCardProps {
  label: string
  value: number
  icon: React.ElementType
  colorClass: string
}

function StatCard({ label, value, icon: Icon, colorClass }: StatCardProps) {
  return (
    <div className={clsx('bg-slate-900 border rounded-xl p-4 flex items-center gap-4', colorClass)}>
      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-current/10">
        <Icon size={22} className="opacity-80" />
      </div>
      <div>
        <p className="text-2xl font-bold leading-none">{value}</p>
        <p className="text-xs text-slate-400 mt-1 uppercase tracking-wide">{label}</p>
      </div>
    </div>
  )
}

interface Props {
  fulfilled: number
  missing: number
  contradicted: number
  omission: number
  needsReview: number
}

export default function SummaryCards({ fulfilled, missing, contradicted, omission, needsReview }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      <StatCard
        label="Fulfilled"
        value={fulfilled}
        icon={CheckCircle2}
        colorClass="border-green-800 text-green-400"
      />
      <StatCard
        label="Missing"
        value={missing}
        icon={MinusCircle}
        colorClass="border-slate-700 text-slate-400"
      />
      <StatCard
        label="Contradicted"
        value={contradicted}
        icon={XCircle}
        colorClass="border-red-800 text-red-400"
      />
      <StatCard
        label="Explicit Omission"
        value={omission}
        icon={AlertTriangle}
        colorClass="border-orange-800 text-orange-400"
      />
      <StatCard
        label="Needs Review"
        value={needsReview}
        icon={Eye}
        colorClass="border-amber-800 text-amber-400"
      />
    </div>
  )
}
