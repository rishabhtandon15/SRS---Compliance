import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Loader2, FlaskConical } from 'lucide-react'
import FileDropzone from '../components/FileDropzone'
import { runV2Analysis } from '../api/client'

interface FormValues {
  topK: number
  page: string
}

const PDF_ACCEPT = { 'application/pdf': ['.pdf'] }
const TARGET_ACCEPT = {
  'application/pdf': ['.pdf'],
  'text/plain': ['.txt'],
  'text/markdown': ['.md'],
}

const STAGE_LABELS = [
  'Extracting template…',
  'Parsing target document…',
  'Indexing with BM25 + Dense…',
  'Running NLI verification…',
  'Aggregating compliance scores…',
]

export default function HomePage() {
  const navigate = useNavigate()
  const { register, handleSubmit } = useForm<FormValues>({
    defaultValues: { topK: 5, page: '' },
  })

  const [referenceFile, setReferenceFile] = useState<File | null>(null)
  const [targetFile, setTargetFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [stageIdx, setStageIdx] = useState(0)

  const onSubmit = async (values: FormValues) => {
    if (!referenceFile) { toast.error('Please upload a reference template PDF'); return }
    if (!targetFile) { toast.error('Please upload a target document'); return }

    setLoading(true)
    setStageIdx(0)

    // Simulate stage progression (real pipeline doesn't expose progress)
    const interval = setInterval(() => {
      setStageIdx(i => Math.min(i + 1, STAGE_LABELS.length - 1))
    }, 4000)

    try {
      const pageNum = values.page ? parseInt(values.page, 10) : null
      const result = await runV2Analysis({
        reference: referenceFile,
        target: targetFile,
        page: pageNum,
        topK: values.topK,
      })
      clearInterval(interval)
      // Store result in sessionStorage for ResultsPage
      sessionStorage.setItem('complianceResult', JSON.stringify(result))
      navigate('/results')
    } catch (err: unknown) {
      clearInterval(interval)
      const axiosErr = err as { response?: { data?: { detail?: { error?: string; message?: string } | string } } }
      const detail = axiosErr?.response?.data?.detail
      if (typeof detail === 'object' && detail?.error === 'SCANNED_PDF') {
        toast.error(`Scanned / image-only PDF detected. OCR required.\n${detail.message}`, { duration: 8000 })
      } else if (typeof detail === 'string') {
        toast.error(detail)
      } else {
        toast.error('Analysis failed. Please check the API server is running.')
      }
    } finally {
      setLoading(false)
      setStageIdx(0)
    }
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <FlaskConical size={22} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-100">V2 Compliance Analysis</h1>
          </div>
          <p className="text-slate-400 text-sm ml-13">
            Hybrid BM25 + Dense retrieval with NLI cross-encoder verification. Upload a reference template and target document to begin.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* File uploads */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Documents</h2>
            <FileDropzone
              label="Reference Template"
              hint="PDF — the standard or template to verify against"
              accept={PDF_ACCEPT}
              value={referenceFile}
              onChange={setReferenceFile}
            />
            <FileDropzone
              label="Target Document"
              hint="PDF, TXT, or MD — the document to audit"
              accept={TARGET_ACCEPT}
              value={targetFile}
              onChange={setTargetFile}
            />
          </div>

          {/* Options */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Options</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Top-K Evidence Candidates
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  {...register('topK', { valueAsNumber: true })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
                <p className="text-xs text-slate-600">Candidates retrieved per requirement (default: 5)</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Target Page (Optional)
                </label>
                <input
                  type="number"
                  min={1}
                  placeholder="All pages"
                  {...register('page')}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 placeholder:text-slate-600"
                />
                <p className="text-xs text-slate-600">Leave blank to audit entire document</p>
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-colors"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>{STAGE_LABELS[stageIdx]}</span>
              </>
            ) : (
              <>
                <FlaskConical size={18} />
                Run Compliance Audit
              </>
            )}
          </button>

          {loading && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="flex justify-between text-xs text-slate-500 mb-2">
                <span>Analysis in progress…</span>
                <span>Stage {stageIdx + 1} / {STAGE_LABELS.length}</span>
              </div>
              <div className="bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
                  style={{ width: `${((stageIdx + 1) / STAGE_LABELS.length) * 100}%` }}
                />
              </div>
              <p className="text-xs text-slate-400 mt-2 text-center">
                First run downloads ~200 MB of model weights. Subsequent runs are faster.
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
