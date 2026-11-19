import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, FileJson, FileText } from 'lucide-react'
import VerdictBadge from '../components/VerdictBadge'
import CoverageGauge from '../components/CoverageGauge'
import SummaryCards from '../components/SummaryCards'
import ParentPointList from '../components/ParentPointList'
import ReviewQueue from '../components/ReviewQueue'
import { getReportDownloadUrl } from '../api/client'
import type { ParentPoint, SubResult, ReviewItem } from '../types'

export default function ResultsPage() {
  const navigate = useNavigate()
  const [report, setReport] = useState<Record<string, unknown> | null>(null)
  const [activeTab, setActiveTab] = useState<'summary' | 'review' | 'findings'>('summary')

  useEffect(() => {
    const stored = sessionStorage.getItem('complianceResult')
    if (!stored) { navigate('/'); return }
    try {
      setReport(JSON.parse(stored))
    } catch {
      navigate('/')
    }
  }, [navigate])

  if (!report) return null

  const meta = report.metadata as Record<string, unknown> | undefined
  const exec = report.executive_summary as Record<string, unknown> | undefined
  const parentResults = (report.parent_results as unknown as ParentPoint[]) ?? []
  const atomicResults = (report.atomic_results as unknown as SubResult[]) ?? []
  const reviewQueue = (report.human_review_queue as unknown as ReviewItem[]) ?? []
  const reportFiles = report._report_files as { json: string; markdown: string } | undefined

  const targetDoc = meta?.target_document as Record<string, unknown> | undefined
  const refTemplate = meta?.reference_template as Record<string, unknown> | undefined
  const atomicCounts = exec?.atomic_status_counts as Record<string, number> | undefined

  const targetPage = targetDoc?.target_page as number | null | undefined
  const totalPages = targetDoc?.total_pages as number | null | undefined
  const auditScope = targetPage
    ? `Page ${targetPage} of ${totalPages ?? '?'}`
    : `All ${totalPages ?? '?'} pages`

  const tabs = [
    { id: 'summary', label: 'Summary & Coverage' },
    { id: 'review', label: `Review Queue (${reviewQueue.length})` },
    { id: 'findings', label: `Requirements (${parentResults.length})` },
  ] as const

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Back + header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors mb-3"
            >
              <ArrowLeft size={14} /> New Analysis
            </button>
            <h1 className="text-xl font-bold text-slate-100">
              {String(targetDoc?.filename ?? 'Target Document')}
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              vs <span className="text-slate-400">{String(refTemplate?.title ?? 'Reference Template')}</span>
              {' · '}
              <span>{auditScope}</span>
            </p>
          </div>
          <div className="flex items-center gap-3 mt-6">
            <VerdictBadge verdict={String(exec?.verdict ?? '')} size="lg" />
          </div>
        </div>

        {/* Download buttons */}
        {reportFiles && (
          <div className="flex gap-2">
            <a
              href={getReportDownloadUrl(reportFiles.json)}
              download
              className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition-colors border border-slate-700"
            >
              <FileJson size={14} /> Download JSON Report
            </a>
            <a
              href={getReportDownloadUrl(reportFiles.markdown)}
              download
              className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition-colors border border-slate-700"
            >
              <FileText size={14} /> Download Markdown Report
            </a>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-slate-800">
          <div className="flex gap-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Summary Tab */}
        {activeTab === 'summary' && (
          <div className="space-y-6">
            {/* Coverage gauges */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-6">Coverage</h2>
              <div className="flex flex-wrap justify-center gap-10">
                <CoverageGauge
                  pct={Number(exec?.mandatory_coverage_pct ?? 0)}
                  fulfilled={Number(exec?.mandatory_fulfilled ?? 0)}
                  total={Number(exec?.total_mandatory ?? 0)}
                  label="Mandatory"
                  color="#6366f1"
                />
                <CoverageGauge
                  pct={Number(exec?.optional_coverage_pct ?? 0)}
                  fulfilled={Number(exec?.optional_fulfilled ?? 0)}
                  total={Number(exec?.total_optional ?? 0)}
                  label="Optional"
                  color="#22c55e"
                />
              </div>
            </div>

            {/* Atomic status counts */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Atomic Sub-Requirement Status</h2>
              <SummaryCards
                fulfilled={atomicCounts?.fulfilled ?? 0}
                missing={atomicCounts?.missing ?? 0}
                contradicted={atomicCounts?.contradicted ?? 0}
                omission={atomicCounts?.explicit_omission ?? 0}
                needsReview={atomicCounts?.needs_review ?? 0}
              />
            </div>

            {/* Executive summary text */}
            {Boolean(exec?.summary_text) && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">Executive Summary</h2>
                <p className="text-sm text-slate-400 leading-relaxed">{String(exec?.summary_text)}</p>
              </div>
            )}

            {/* Stats table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">Audit Statistics</h2>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                {[
                  ['Total Parent Points', exec?.total_parent_points],
                  ['Total Sub-Requirements', exec?.total_sub_requirements],
                  ['Total Mandatory', exec?.total_mandatory],
                  ['Total Optional', exec?.total_optional],
                  ['Unresolved Review Items', exec?.unresolved_review_count],
                ].map(([label, val]) => (
                  <div key={String(label)} className="flex justify-between border-b border-slate-800 pb-2">
                    <dt className="text-slate-500">{String(label)}</dt>
                    <dd className="font-semibold text-slate-200">{val !== undefined && val !== null ? String(val) : '—'}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        )}

        {/* Review Queue Tab */}
        {activeTab === 'review' && (
          <ReviewQueue items={reviewQueue} />
        )}

        {/* Findings Tab */}
        {activeTab === 'findings' && (
          <ParentPointList
            points={parentResults}
            atomicResults={atomicResults}
          />
        )}
      </div>
    </div>
  )
}
