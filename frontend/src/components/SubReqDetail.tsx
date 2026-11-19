import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import StatusBadge from './StatusBadge'
import EvidencePanel from './EvidencePanel'
import type { SubResult } from '../types'

interface Props {
  result: SubResult
}

export default function SubReqDetail({ result }: Props) {
  const [open, setOpen] = useState(false)
  const [showAllEvidence, setShowAllEvidence] = useState(false)

  return (
    <div className="bg-slate-900/40">
      <button
        className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-slate-800/40 transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        <span className="mt-0.5 text-slate-600 flex-shrink-0">
          {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-0.5">
            <span className="text-xs font-mono text-slate-500">{result.sub_id}</span>
            <StatusBadge status={result.verification_status} size="xs" />
            <span className={`text-xs px-1.5 py-0.5 rounded ${result.is_mandatory ? 'bg-slate-700 text-slate-300' : 'bg-slate-800 text-slate-500'}`}>
              {result.is_mandatory ? 'Mandatory' : 'Optional'}
            </span>
            <span className="text-xs text-slate-600 font-mono">
              conf: {result.confidence.toFixed(2)}
            </span>
          </div>
          <p className="text-xs text-slate-300 line-clamp-2">{result.claim_text}</p>
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-slate-800/60 pt-3">
          {/* Rationale */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Rationale</p>
            <p className="text-xs text-slate-400">{result.rationale}</p>
          </div>

          {/* Original reference text */}
          {result.original_reference_text && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Reference Text</p>
              <blockquote className="text-xs text-slate-400 border-l-2 border-indigo-700 pl-3 italic">
                {result.original_reference_text}
              </blockquote>
            </div>
          )}

          {/* Evidence type */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Expected evidence:</span>
            <span className="text-xs font-mono bg-slate-800 px-2 py-0.5 rounded text-indigo-300">
              {result.expected_evidence_type}
            </span>
          </div>

          {/* Best evidence */}
          {result.best_evidence && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Best Evidence Block</p>
              <EvidencePanel ev={result.best_evidence} highlighted />
            </div>
          )}

          {/* All candidates toggle */}
          {result.all_evaluated_candidates.length > 1 && (
            <div>
              <button
                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                onClick={() => setShowAllEvidence(v => !v)}
              >
                {showAllEvidence ? '▲ Hide' : '▼ Show'} all {result.all_evaluated_candidates.length} evaluated candidates
              </button>
              {showAllEvidence && (
                <div className="space-y-2 mt-2">
                  {result.all_evaluated_candidates.map((ev, i) => (
                    <EvidencePanel key={i} ev={ev} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
