import { useState } from 'react'
import { Eye, ChevronDown, ChevronRight } from 'lucide-react'
import EvidencePanel from './EvidencePanel'
import type { ReviewItem } from '../types'

interface Props {
  items: ReviewItem[]
}

function ReviewRow({ item }: { item: ReviewItem }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border border-amber-800/60 rounded-xl overflow-hidden">
      <button
        className="w-full flex items-start gap-3 p-4 text-left hover:bg-amber-900/10 transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        <Eye size={16} className="text-amber-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-xs font-mono text-amber-400">{item.sub_id}</span>
            <span className="text-xs text-slate-500">Parent: {item.parent_point_id}</span>
            {item.is_mandatory && (
              <span className="text-xs bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded">Mandatory</span>
            )}
            {item.relevant_source_pages && item.relevant_source_pages.length > 0 && (
              <span className="text-xs text-slate-600">
                Pages: {item.relevant_source_pages.join(', ')}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-200 font-medium line-clamp-2">{item.claim_text}</p>
          <p className="text-xs text-amber-300/70 mt-1">{item.rationale}</p>
        </div>
        <span className="text-slate-600 mt-0.5">
          {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </span>
      </button>

      {open && (
        <div className="border-t border-amber-900/40 px-4 py-3 space-y-3 bg-slate-950/40">
          {item.positive_evidence && (
            <div>
              <p className="text-xs font-semibold text-green-500 mb-2">✓ Positive Evidence</p>
              <EvidencePanel ev={item.positive_evidence} highlighted />
            </div>
          )}
          {item.conflicting_evidence && (
            <div>
              <p className="text-xs font-semibold text-red-400 mb-2">⚡ Conflicting Evidence</p>
              <EvidencePanel ev={item.conflicting_evidence} />
            </div>
          )}
          {!item.positive_evidence && !item.conflicting_evidence && item.all_evaluated_candidates && item.all_evaluated_candidates.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-2">All Candidates</p>
              <div className="space-y-2">
                {item.all_evaluated_candidates.map((ev, i) => (
                  <EvidencePanel key={i} ev={ev} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function ReviewQueue({ items }: Props) {
  if (!items || items.length === 0) {
    return (
      <div className="bg-green-900/20 border border-green-800 rounded-xl p-4 text-sm text-green-300">
        ✅ No human review required. All items resolved deterministically.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-amber-400 bg-amber-900/20 border border-amber-800 rounded-lg px-3 py-2">
        <Eye size={16} />
        <span className="text-sm font-medium">
          {items.length} item{items.length !== 1 ? 's' : ''} require human auditor review before a final verdict can be issued.
        </span>
      </div>
      {items.map(item => (
        <ReviewRow key={item.sub_id} item={item} />
      ))}
    </div>
  )
}
