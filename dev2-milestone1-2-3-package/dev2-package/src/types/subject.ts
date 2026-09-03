// Dev 2-owned types for Milestone 2 (Subject eCRF Baseline Profile) and
// Milestone 3 (Participant Monitoring & Result Entry).
//
// Sourced directly from the real frozen schema — verified against
// supabase/migrations/001_initial_schema.sql (trial_subjects) and
// 003_study_lifecycle_upgrade.sql (subject_criteria_results,
// subject_assessments) on the dev1-foundation branch, commit eda6e71 —
// not from Dev 1's chat description alone, since that description was
// wrong once already for trial.ts. Nothing here is in trial.ts, so there's
// no collision; if Dev 1 wants a shared Subject type promoted into
// trial.ts later, this is the source to copy from.

import type { AgniType, PrakritiType } from "@/types/trial";
import type { CriteriaResult } from "@/types/study-wizard";

// Matches ashtavidha_pariksha JSONB default keys exactly (trial_subjects,
// 001_initial_schema.sql lines ~179-188).
export type AshtavidhaPariksha = {
  nadi: string; // Pulse
  mutra: string; // Urine
  mala: string; // Stool
  jihva: string; // Tongue
  shabda: string; // Voice
  sparsha: string; // Touch/skin
  drik: string; // Eyes
  akriti: string; // Build/appearance
};

export const ASHTAVIDHA_LABELS: Record<keyof AshtavidhaPariksha, string> = {
  nadi: "Nadi (Pulse)",
  mutra: "Mutra (Urine)",
  mala: "Mala (Stool)",
  jihva: "Jihva (Tongue)",
  shabda: "Shabda (Voice)",
  sparsha: "Sparsha (Touch)",
  drik: "Drik (Eyes)",
  akriti: "Akriti (Build)",
};

export type EligibilityStatus = "PENDING" | "ELIGIBLE" | "INELIGIBLE";

// trial_subjects row shape (the fields Milestone 2/3 screens need).
export type TrialSubject = {
  id: string;
  studyId: string;
  subjectCode: string;
  screeningDate: string; // ISO date
  enrolmentStatus: string;

  consentObtained: boolean;
  consentVersion: string;
  consentDate: string | null; // ISO date
  consentMethod: string;

  prakriti: PrakritiType;
  agni: AgniType;
  ashtavidhaPariksha: AshtavidhaPariksha;

  anupanaPrescribed: string | null;
  pathyaGuidelines: string | null;

  eligibilityStatus: EligibilityStatus;
  eligibilityNotes: string | null;
};

// study_criteria + subject_criteria_results, joined for the screening
// checklist (Milestone 3).
export type ScreeningCriterionRow = {
  criterionId: string;
  criterionType: "INCLUSION" | "EXCLUSION";
  criterionText: string;
  criterionOrder: number;
  required: boolean;
  result: CriteriaResult;
  notes: string | null;
};

export type AssessmentStatus = "DUE" | "COMPLETED" | "OVERDUE" | "NOT_APPLICABLE";

// study_assessments + subject_assessments, joined for the timeline
// (Milestone 3).
export type SubjectAssessmentRow = {
  id: string;
  assessmentName: string;
  visitLabel: string;
  dayOffset: number;
  scheduledDate: string; // ISO date
  status: AssessmentStatus;
  completedAt: string | null;
  resultValue: string | null;
  resultUnit: string | null;
  resultNotes: string | null;
};
