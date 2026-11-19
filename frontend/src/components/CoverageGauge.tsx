import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

interface Props {
  pct: number
  fulfilled: number
  total: number
  label: string
  color: string
}

export default function CoverageGauge({ pct, fulfilled, total, label, color }: Props) {
  const safeValue = isNaN(pct) ? 0 : Math.round(pct * 10) / 10
  const data = [
    { name: 'Covered', value: safeValue },
    { name: 'Remaining', value: Math.max(0, 100 - safeValue) },
  ]

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-32 h-32">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={42}
              outerRadius={56}
              startAngle={90}
              endAngle={-270}
              dataKey="value"
              strokeWidth={0}
            >
              <Cell fill={color} />
              <Cell fill="#1e293b" />
            </Pie>
            <Tooltip
              contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
              formatter={(v: number) => [`${v.toFixed(1)}%`, '']}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Centre label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xl font-bold text-white">{safeValue.toFixed(1)}%</span>
        </div>
      </div>
      <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</p>
      <p className="text-xs text-slate-500">{fulfilled} / {total}</p>
    </div>
  )
}
