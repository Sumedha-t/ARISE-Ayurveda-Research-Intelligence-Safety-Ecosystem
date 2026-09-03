// TEMPORARY mock data for Milestone 2/3, standing in for the real
// Supabase queries against trial_subjects / study_criteria /
// subject_criteria_results / study_assessments / subject_assessments.
//
// TODO(Thursday 1:00-6:30 PM wiring window): replace getMockSubject()
// with a real query joining these tables, scoped by (subjectId, studyId).
//
// Field values here deliberately mirror the seed conventions in
// DATASET_SIH.xlsx / the team's Synthetic_Data workbook (subject code
// format, ICF version, etc.) so swapping to live data doesn't change any
// UI-facing shapes.

import type { ScreeningCriterionRow, SubjectAssessmentRow, TrialSubject } from "@/types/subject";

export function getMockSubject(id: string): TrialSubject {
  return {
    id,
    studyId: "study-htn-001",
    subjectCode: "AIIA-HTN-002",
    screeningDate: "2026-08-10",
    enrolmentStatus: "Enrolled",

    consentObtained: true,
    consentVersion: "ICF v1.0",
    consentDate: "2026-08-10",
    consentMethod: "Digital Signature",

    prakriti: "VATA_PITTA",
    agni: "TIKSHNAGNI",
    ashtavidhaPariksha: {
      nadi: "Vata-Pitta pulse",
      mutra: "Clear yellow",
      mala: "Soft, formed",
      jihva: "Pink, moist",
      shabda: "Clear",
      sparsha: "Warm",
      drik: "Normal visual acuity",
      akriti: "Medium",
    },

    anupanaPrescribed: "Warm water",
    pathyaGuidelines: "Low-salt diet, avoid heavy/fried foods",

    eligibilityStatus: "ELIGIBLE",
    eligibilityNotes: null,
  };
}

export function getMockScreeningCriteria(): ScreeningCriterionRow[] {
  return [
    {
      criterionId: "c1",
      criterionType: "INCLUSION",
      criterionText: "Age 18-65 years",
      criterionOrder: 1,
      required: true,
      result: "PASS",
      notes: null,
    },
    {
      criterionId: "c2",
      criterionType: "INCLUSION",
      criterionText: "Diagnosed essential hypertension (SBP 140-159 mmHg)",
      criterionOrder: 2,
      required: true,
      result: "PASS",
      notes: null,
    },
    {
      criterionId: "c3",
      criterionType: "EXCLUSION",
      criterionText: "Pregnant or lactating",
      criterionOrder: 1,
      required: true,
      result: "NOT_ASSESSED",
      notes: null,
    },
    {
      criterionId: "c4",
      criterionType: "EXCLUSION",
      criterionText: "Secondary hypertension of known cause",
      criterionOrder: 2,
      required: true,
      result: "FAIL",
      notes: "Excluded — renal cause suspected pending review",
    },
  ];
}

export function getMockAssessments(): SubjectAssessmentRow[] {
  return [
    {
      id: "a1",
      assessmentName: "Blood Pressure & Pulse",
      visitLabel: "BASELINE",
      dayOffset: 0,
      scheduledDate: "2026-08-10",
      status: "COMPLETED",
      completedAt: "2026-08-10T09:12:00Z",
      resultValue: "148/92",
      resultUnit: "mmHg",
      resultNotes: null,
    },
    {
      id: "a2",
      assessmentName: "Fasting Plasma Glucose",
      visitLabel: "WEEK_4",
      dayOffset: 28,
      scheduledDate: "2026-09-07",
      status: "DUE",
      completedAt: null,
      resultValue: null,
      resultUnit: null,
      resultNotes: null,
    },
    {
      id: "a3",
      assessmentName: "Weight & BP",
      visitLabel: "WEEK_8",
      dayOffset: 56,
      scheduledDate: "2026-08-20",
      status: "OVERDUE",
      completedAt: null,
      resultValue: null,
      resultUnit: null,
      resultNotes: null,
    },
  ];
}
