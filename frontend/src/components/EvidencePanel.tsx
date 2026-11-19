import { clsx } from 'clsx'
import type { EvidenceEval } from '../types'

interface ScoreBarProps {
  label: string
  value: number
  color: string
}

function ScoreBar({ label, value, color }: ScoreBarProps) {
  const pct = Math.min(100, Math.max(0, value * 100))
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-500 w-20 flex-shrink-0">{label}</span>
      <div className="flex-1 bg-slate-800 rounded-full h-1.5 overflow-hidden">
        <div className={clsx('h-full rounded-full', color)} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-mono text-slate-400 w-10 text-right">{value.toFixed(3)}</span>
    </div>
  )
}

interface Props {
  ev: EvidenceEval
  highlighted?: boolean
}

const NLI_LABEL_COLOR: Record<string, string> = {
  entailment: 'text-green-400',
  contradiction: 'text-red-400',
  neutral: 'text-slate-400',
}

export default function EvidencePanel({ ev, highlighted }: Props) {
  return (
    <div
      className={clsx(
        'rounded-lg border p-3 space-y-2 text-xs',
        highlighted ? 'border-indigo-700 bg-indigo-950/30' : 'border-slate-800 bg-slate-900/50'
      )}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-indigo-300">{ev.block_id}</span>
        {ev.page_number && (
          <span className="text-slate-500">p.{ev.page_number}</span>
        )}
        <span className={clsx('font-semibold', NLI_LABEL_COLOR[ev.nli_predicted_label] ?? 'text-slate-400')}>
          {ev.nli_predicted_label?.toUpperCase()}
        </span>
        {ev.is_explicit_omission && (
          <span className="bg-orange-900/60 text-orange-300 border border-orange-700 px-1.5 py-0.5 rounded text-[10px]">
            EXPLICIT OMISSION
          </span>
        )}
        {ev.has_numeric_content && ev.numeric_tokens && (
          <span className="bg-blue-900/60 text-blue-300 border border-blue-700 px-1.5 py-0.5 rounded text-[10px]">
            NUMERIC: {ev.numeric_tokens.join(', ')}
          </span>
        )}
        {ev.section_heading && (
          <span className="text-slate-600">§ {ev.section_heading}</span>
        )}
      </div>

      {/* Evidence text */}
      <blockquote className="border-l-2 border-slate-700 pl-2 text-slate-400 italic leading-relaxed">
        {ev.exact_source_text}
      </blockquote>

      {/* NLI scores */}
      <div className="space-y-1">
        <ScoreBar label="Entailment" value={ev.entailment_prob} color="bg-green-500" />
        <ScoreBar label="Contradiction" value={ev.contradiction_prob} color="bg-red-500" />
        <ScoreBar label="Neutral" value={ev.neutral_prob} color="bg-slate-500" />
      </div>

      {/* Retrieval scores */}
      <div className="flex flex-wrap gap-3 text-slate-600 pt-1 border-t border-slate-800">
        <span>RRF #{ev.rrf_rank} ({ev.rrf_score.toFixed(4)})</span>
        <span>BM25: {ev.bm25_score.toFixed(4)}</span>
        <span>Dense: {ev.dense_score.toFixed(4)}</span>
        <span>Type: {ev.block_type}</span>
      </div>
    </div>
  )
}
