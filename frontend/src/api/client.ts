import axios from 'axios'

export const apiClient = axios.create({
  baseURL: '/api',
  timeout: 300_000, // 5 min — pipeline can be slow on first run (model loading)
})

export interface V2AnalysisParams {
  reference: File
  target: File
  page?: number | null
  topK?: number
}

export interface LegacyAnalysisParams {
  standard: File
  srs: File
  threshold?: number
}

export async function runV2Analysis(params: V2AnalysisParams) {
  const form = new FormData()
  form.append('reference', params.reference)
  form.append('target', params.target)
  if (params.page) form.append('page', String(params.page))
  form.append('top_k', String(params.topK ?? 5))

  const { data } = await apiClient.post('/analyze/v2', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function runLegacyAnalysis(params: LegacyAnalysisParams) {
  const form = new FormData()
  form.append('standard', params.standard)
  form.append('srs', params.srs)
  form.append('threshold', String(params.threshold ?? 0.55))

  const { data } = await apiClient.post('/analyze/legacy', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export function getReportDownloadUrl(filename: string) {
  return `/api/reports/${encodeURIComponent(filename)}`
}
