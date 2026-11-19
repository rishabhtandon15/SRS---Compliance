import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Loader2, History, ChevronDown, ChevronRight } from 'lucide-react'
import FileDropzone from '../components/FileDropzone'
import StatusBadge from '../components/StatusBadge'
import { runLegacyAnalysis } from '../api/client'

interface FormValues {
  threshold: number
}

const JSON_ACCEPT = { 'application/json': ['.json'] }
const SRS_ACCEPT = {
  'application/pdf': ['.pdf'],
  'text/plain': ['.txt'],
  'text/markdown': ['.md'],
}

export default function LegacyPage() {
  const { register, handleSubmit } = useForm<FormValues>({
    defaultValues: { threshold: 0.55 },
  })

  const [standardFile, setStandardFile] = useState<File | null>(null)
  const [srsFile, setSrsFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Record<string, unknown> | null>(null)

  const onSubmit = async (values: FormValues) => {
    if (!standardFile) { toast.error('Please upload a reference standard (JSON)'); return }
    if (!srsFile) { toast.error('Please upload an SRS document'); return }

    setLoading(true)
    setResult(null)
    try {
      const data = await runLegacyAnalysis({
        standard: standardFile,
        srs: srsFile,
        threshold: values.threshold,
      })
      setResult(data)
      toast.success('Legacy audit complete')
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } }
      toast.error(axiosErr?.response?.data?.detail ?? 'Legacy audit failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-slate-700 rounded-xl flex items-center justify-center">
            <History size={20} className="text-slate-300" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100">Legacy Audit (R1–R4)</h1>
            <p className="text-xs text-slate-500 mt-0.5">v0.1–v0.4 deterministic quality rules + section alignment</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Documents</h2>
            <FileDropzone
              label="Reference Standard"
              hint="JSON standard file (reference_standard.json)"
              accept={JSON_ACCEPT}
              value={standardFile}
              onChange={setStandardFile}
            />
            <FileDropzone
              label="SRS Document"
              hint="TXT, PDF, or MD"
              accept={SRS_ACCEPT}
              value={srsFile}
              onChange={setSrsFile}
            />
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-2">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">Options</h2>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Section Similarity Threshold
            </label>
            <input
              type="number"
              step="0.01"
              min={0}
              max={1}
              {...register('threshold', { valueAsNumber: true })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            />
            <p className="text-xs text-slate-600">Cosine similarity cutoff for section matching (default: 0.55)</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-slate-700 hover:bg-slate-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-colors"
          >
            {loading ? <><Loader2 size={18} className="animate-spin" /> Running Legacy Audit…</> : <><History size={18} /> Run R1–R4 Audit</>}
          </button>
        </form>

        {/* Results */}
        {result && <LegacyResults data={result} />}
      </div>
    </div>
  )
}

function LegacyResults({ data }: { data: Record<string, unknown> }) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const toggle = (id: string) => setExpanded(e => ({ ...e, [id]: !e[id] }))

  const summary = data.summary as Record<string, unknown> | undefined
  const requirements = (data.requirements as Record<string, unknown>[]) ?? []

  const compliancePct = summary?.compliance_percentage
  const compliantCount = summary?.compliant_count
  const totalCount = summary?.total_requirements

  return (
    <div className="space-y-5">
      {/* Summary */}
      {summary && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Summary</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-slate-800 rounded-xl p-4">
              <p className="text-3xl font-bold text-indigo-400">{String(compliancePct ?? '—')}%</p>
              <p className="text-xs text-slate-500 mt-1">Compliance</p>
            </div>
            <div className="bg-slate-800 rounded-xl p-4">
              <p className="text-3xl font-bold text-green-400">{String(compliantCount ?? '—')}</p>
              <p className="text-xs text-slate-500 mt-1">Compliant</p>
            </div>
            <div className="bg-slate-800 rounded-xl p-4">
              <p className="text-3xl font-bold text-slate-200">{String(totalCount ?? '—')}</p>
              <p className="text-xs text-slate-500 mt-1">Total</p>
            </div>
          </div>
        </div>
      )}

      {/* Requirement list */}
      {requirements.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Requirements</h2>
          <div className="space-y-2">
            {requirements.map((req, i) => {
              const id = String(req.req_id ?? i)
              const isOpen = expanded[id]
              const isCompliant = req.is_compliant

              return (
                <div key={id} className={`border rounded-xl overflow-hidden ${isCompliant ? 'border-green-800' : 'border-red-800'}`}>
                  <button
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-800/40 transition-colors"
                    onClick={() => toggle(id)}
                  >
                    <span className="text-slate-600">{isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}</span>
                    <span className="font-mono text-xs text-slate-400">{id}</span>
                    <span className="flex-1 text-sm text-slate-200 truncate">{String(req.text ?? '')}</span>
                    <StatusBadge status={isCompliant ? 'FULFILLED' : 'NON_COMPLIANT'} size="xs" />
                  </button>
                  {isOpen && (
                    <div className="border-t border-slate-800 px-4 py-3 space-y-2 bg-slate-950/40">
                      {/* Rule violations */}
                      {(req.violations as string[] | undefined)?.map((v, vi) => (
                        <div key={vi} className="text-xs text-red-300 flex gap-2">
                          <span className="text-red-600">✗</span>
                          <span>{v}</span>
                        </div>
                      ))}
                      {/* Rule passes */}
                      {(req.passes as string[] | undefined)?.map((p, pi) => (
                        <div key={pi} className="text-xs text-green-400 flex gap-2">
                          <span>✓</span>
                          <span>{p}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
