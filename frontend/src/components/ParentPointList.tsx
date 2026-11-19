import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { clsx } from 'clsx'
import StatusBadge from './StatusBadge'
import SubReqDetail from './SubReqDetail'
import type { ParentPoint, SubResult } from '../types'

interface Props {
  points: ParentPoint[]
  atomicResults: SubResult[]
}

function ParentPointRow({ point, subResults }: { point: ParentPoint; subResults: SubResult[] }) {
  const [open, setOpen] = useState(false)

  const statusBg: Record<string, string> = {
    FULLY_COMPLIANT: 'border-green-800',
    PARTIALLY_COMPLIANT: 'border-amber-800',
    NON_COMPLIANT: 'border-red-800',
    NEEDS_REVIEW: 'border-amber-800',
  }

  return (
    <div className={clsx('border rounded-xl overflow-hidden', statusBg[point.parent_compliance_status] ?? 'border-slate-700')}>
      <button
        className="w-full flex items-start gap-3 p-4 text-left hover:bg-slate-800/50 transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        <span className="mt-0.5 text-slate-500 flex-shrink-0">
          {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-xs font-mono text-slate-500">{point.point_id}</span>
            <StatusBadge status={point.parent_compliance_status} size="xs" />
            {point.source_page && (
              <span className="text-xs text-slate-600">p.{point.source_page}</span>
            )}
          </div>
          <p className="text-sm font-semibold text-slate-200">
            {point.section_name}
            {point.topic && <span className="text-slate-400 font-normal"> — {point.topic}</span>}
          </p>
          {point.description && (
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{point.description}</p>
          )}
        </div>
        <div className="text-right flex-shrink-0 text-xs text-slate-400 ml-2">
          <span className="font-semibold text-slate-200">{point.mandatory_fulfilled}</span>
          <span>/{point.mandatory_total}</span>
          <div>mandatory</div>
        </div>
      </button>

      {open && (
        <div className="border-t border-slate-800 bg-slate-950/50">
          {/* Findings */}
          {point.findings.length > 0 && (
            <div className="px-4 py-3 border-b border-slate-800">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Findings</p>
              <ul className="space-y-1">
                {point.findings.map((f, i) => (
                  <li key={i} className="text-xs text-slate-400 flex gap-2">
                    <span className="text-slate-600 mt-0.5">•</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Raw text */}
          {point.raw_text && (
            <div className="px-4 py-3 border-b border-slate-800">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Requirement Text</p>
              <blockquote className="text-xs text-slate-400 border-l-2 border-slate-700 pl-3 italic">
                {point.raw_text}
              </blockquote>
            </div>
          )}

          {/* Sub-requirements */}
          <div className="divide-y divide-slate-800">
            {subResults.map(sr => (
              <SubReqDetail key={sr.sub_id} result={sr} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function ParentPointList({ points, atomicResults }: Props) {
  const byParent = atomicResults.reduce<Record<string, SubResult[]>>((acc, sr) => {
    const parentId = sr.parent_id
    if (!acc[parentId]) acc[parentId] = []
    acc[parentId].push(sr)
    return acc
  }, {})

  return (
    <div className="space-y-3">
      {points.map(point => (
        <ParentPointRow
          key={point.point_id}
          point={point}
          subResults={byParent[point.point_id] ?? []}
        />
      ))}
    </div>
  )
}
