// Dev 2-owned types for the Create Study Wizard's form state. These sit
// alongside src/types/trial.ts rather than inside it — trial.ts is Dev 1's
// frozen shared file, and none of these shapes were listed in that packet,
// so extending it here avoids a merge collision. If Dev 1 wants some of
// these promoted into trial.ts later (e.g. ClinicalParameterCode), that's a
// one-line move once the team agrees.
//
// IMPORTANT: verified against the real dev1-foundation branch (commit
// eda6e71) on 2026-09-03 — src/types/trial.ts on that branch only exports
// UserRole, StudyPhase, PrakritiType, AgniType, and the AE/safety types
// (AeSeverity, AeCausality, AeOutcome, AeWorkflowStatus, DeadlineType).
// StudyType, MonitoringFrequency, InterventionType, CriterionType, and
// CriteriaResult are NOT in that file, despite being listed in Dev 1's
// reference-packet message. So those five are defined locally below,
// sourced directly from the CHECK constraints in
// supabase/migrations/003_study_lifecycle_upgrade.sql (the actual frozen
// schema), not from the trial.ts import. Only AgniType, PrakritiType, and
// StudyPhase are genuinely present in trial.ts and are still imported from
// there. If/when Dev 1 adds the missing five to trial.ts, delete the local
// definitions below and switch these back to a trial.ts import — everything
// that consumes them (CreateStudyWizard.tsx, InterventionBuilder.tsx) will
// keep working unchanged.

import type { AgniType, PrakritiType, StudyPhase } from "@/types/trial";

// Derived from supabase/migrations/003_study_lifecycle_upgrade.sql —
// chk_study_type, chk_monitoring_frequency / chk_assessment_frequency,
// chk_intervention_component_type, chk_criterion_type.
export type StudyType = "INTERVENTIONAL" | "OBSERVATIONAL";
export type MonitoringFrequency = "DAILY" | "WEEKLY" | "FORTNIGHTLY" | "MONTHLY" | "CUSTOM";
export type InterventionType = "DRUG" | "PATHYA" | "ANUPANA" | "LIFESTYLE";
export type CriterionType = "INCLUSION" | "EXCLUSION";
// subject_criteria_results.result — DB-enforced via chk_criteria_result in
// migration 003 (confirmed, corrected from earlier note).
export type CriteriaResult = "PASS" | "FAIL" | "NOT_ASSESSED";

// From Dev 1's Section 7A — study_clinical_parameters
export type ClinicalParameterCategory = "AYURVEDA" | "CLINICAL";

export type ClinicalParameterCode =
  | "PRAKRITI"
  | "AGNI"
  | "SBP"
  | "DBP"
  | "PULSE"
  | "WEIGHT"
  | "SPO2"
  | "FPG"
  | "HBA1C"
  | "TCHOL"
  | "TG";

export type ClinicalParameterOption = {
  code: ClinicalParameterCode;
  label: string;
  category: ClinicalParameterCategory;
  unit: string | null; // null for PRAKRITI / AGNI (no unit)
};

// Fixed catalogue of selectable parameters — matches the seeded
// study_clinical_parameters rows exactly (see Study_clinical_parameters
// sheet / Dev 1's Section 7A).
export const CLINICAL_PARAMETER_CATALOGUE: ClinicalParameterOption[] = [
  { code: "PRAKRITI", label: "Prakriti Assessment", category: "AYURVEDA", unit: null },
  { code: "AGNI", label: "Agni Assessment", category: "AYURVEDA", unit: null },
  { code: "SBP", label: "Systolic Blood Pressure", category: "CLINICAL", unit: "mmHg" },
  { code: "DBP", label: "Diastolic Blood Pressure", category: "CLINICAL", unit: "mmHg" },
  { code: "PULSE", label: "Pulse", category: "CLINICAL", unit: "bpm" },
  { code: "WEIGHT", label: "Weight", category: "CLINICAL", unit: "kg" },
  { code: "SPO2", label: "SpO\u2082", category: "CLINICAL", unit: "%" },
  { code: "FPG", label: "Fasting Plasma Glucose", category: "CLINICAL", unit: "mg/dL" },
  { code: "HBA1C", label: "HbA1c", category: "CLINICAL", unit: "%" },
  { code: "TCHOL", label: "Total Cholesterol", category: "CLINICAL", unit: "mg/dL" },
  { code: "TG", label: "Triglycerides", category: "CLINICAL", unit: "mg/dL" },
];

// From Dev 1's Section 7B — study_interventions
export type InterventionFrequency = "ONCE_DAILY" | "TWICE_DAILY" | "DAILY" | "WITH_DOSE" | "WEEKLY";
export type InterventionRoute = "ORAL" | "TOPICAL" | "NA";

export type InterventionDraft = {
  key: string; // client-side row key only, not persisted
  componentType: InterventionType;
  name: string;
  description: string;
  dose: string;
  route: InterventionRoute;
  frequency: InterventionFrequency;
  duration: string; // free text, e.g. "12 WEEKS"
};

// From Dev 1's Section 7C — study_assessments
export type VisitLabel = "BASELINE" | "WEEK_4" | "WEEK_8" | "WEEK_12";

export const VISIT_SCHEDULE: { label: VisitLabel; dayOffset: number }[] = [
  { label: "BASELINE", dayOffset: 0 },
  { label: "WEEK_4", dayOffset: 28 },
  { label: "WEEK_8", dayOffset: 56 },
  { label: "WEEK_12", dayOffset: 84 },
];

// From Dev 1's Section 7A dataset — study_criteria
export type CriterionDraft = {
  key: string; // client-side row key only, not persisted
  criterionType: CriterionType;
  text: string;
};

// Full wizard form state — everything Milestone 1 collects, ready to be
// mapped 1:1 onto `studies` + the 4 relational tables once Dev 1's insert
// wiring lands (Thursday 1:00–6:30 PM slot).
export type CreateStudyFormState = {
  // Step 1 — Basic Details
  title: string;
  ctriNumber: string;
  phase: StudyPhase;
  studyType: StudyType;
  targetEnrolment: number | "";

  // Step 2 — Clinical Parameters (selected subset of the catalogue)
  selectedParameterCodes: ClinicalParameterCode[];

  // Step 3 — Interventions
  interventions: InterventionDraft[];

  // Step 4 — Monitoring Schedule
  monitoringFrequency: MonitoringFrequency;
  selectedVisits: VisitLabel[];

  // Step 5 — Inclusion / Exclusion Criteria
  criteria: CriterionDraft[];
};

export const EMPTY_FORM_STATE: CreateStudyFormState = {
  title: "",
  ctriNumber: "",
  phase: "PHASE_3",
  studyType: "INTERVENTIONAL",
  targetEnrolment: "",
  selectedParameterCodes: [],
  interventions: [],
  monitoringFrequency: "WEEKLY",
  selectedVisits: ["BASELINE"],
  criteria: [],
};

export const PRAKRITI_OPTIONS: PrakritiType[] = [
  "VATA",
  "PITTA",
  "KAPHA",
  "VATA_PITTA",
  "PITTA_KAPHA",
  "VATA_KAPHA",
  "SAMADOSHA",
];

export const AGNI_OPTIONS: AgniType[] = ["SAMAGNI", "TIKSHNAGNI", "MANDAGNI", "VISHAMAGNI"];
