// ARISE - Shared Domain Types
// Derived directly from the frozen Supabase schema.
// Do not add values here that are not defined by the database schema.

export type UserRole =
  | 'PI'
  | 'COORDINATOR'
  | 'NPVCC_OFFICER'
  | 'ADMIN'
  | 'ETHICS_COMMITTEE'
  | 'MONITOR'

export type StudyPhase =
  | 'PHASE_1'
  | 'PHASE_2'
  | 'PHASE_3'
  | 'PHASE_4'
  | 'OBSERVATIONAL'

export type PrakritiType =
  | 'VATA'
  | 'PITTA'
  | 'KAPHA'
  | 'VATA_PITTA'
  | 'PITTA_KAPHA'
  | 'VATA_KAPHA'
  | 'SAMADOSHA'

export type AgniType =
  | 'SAMAGNI'
  | 'TIKSHNAGNI'
  | 'MANDAGNI'
  | 'VISHAMAGNI'

export type AeSeverity =
  | 'MILD'
  | 'MODERATE'
  | 'SEVERE'

export type AeCausality =
  | 'AUSHADHA_JANYA'
  | 'ANUPANA_DOSHA'
  | 'PATHYA_ULLANGHANA'
  | 'ASHODHITA_DRAVYA'
  | 'UNRELATED'
  | 'UNASSESSED'

export type AeOutcome =
  | 'RECOVERED'
  | 'RECOVERING'
  | 'NOT_RECOVERED'
  | 'FATAL'
  | 'UNKNOWN'

export type AeWorkflowStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'CAUSALITY_ASSESSED'
  | 'REGULATORY_REPORT_PENDING'
  | 'REGULATORY_REPORT_SUBMITTED'
  | 'CLOSED'

export type DeadlineType =
  | 'SAE_INITIAL_24H'
  | 'SAE_FOLLOWUP_7D'
  | 'ROUTINE_ANNUAL'
  | 'IEC_RENEWAL'