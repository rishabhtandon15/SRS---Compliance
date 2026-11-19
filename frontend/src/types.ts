/**
 * Shared TypeScript types mirroring the backend data models.
 * Keep in sync with src/models/ Python dataclasses.
 */

export interface EvidenceEval {
  block_id: string
  page_number: number | null
  section_heading: string | null
  block_type: string
  exact_source_text: string
  rrf_rank: number
  rrf_score: number
  bm25_score: number
  dense_score: number
  nli_predicted_label: string
  entailment_prob: number
  contradiction_prob: number
  neutral_prob: number
  is_explicit_omission: boolean
  has_numeric_content: boolean
  numeric_tokens: string[]
  hypothesis_text?: string
}

export interface SubResult {
  sub_id: string
  parent_id: string
  original_reference_text: string
  claim_text: string
  expected_evidence_type: string
  is_mandatory: boolean
  verification_status: string
  confidence: number
  rationale: string
  needs_review: boolean
  source_page: number | null
  section_name: string | null
  topic_label: string | null
  best_evidence: EvidenceEval | null
  all_evaluated_candidates: EvidenceEval[]
}

export interface ParentPoint {
  point_id: string
  section_name: string
  topic: string | null
  description: string
  raw_text: string
  parent_compliance_status: string
  mandatory_fulfilled: number
  mandatory_total: number
  optional_fulfilled: number
  optional_total: number
  findings: string[]
  source_page: number | null
  sub_requirement_ids: string[]
}

export interface ReviewItem {
  sub_id: string
  parent_point_id: string
  claim_text: string
  is_mandatory: boolean
  rationale: string
  relevant_source_pages: number[]
  positive_evidence: EvidenceEval | null
  conflicting_evidence: EvidenceEval | null
  all_evaluated_candidates: EvidenceEval[]
}
