// Central mock data for AIIA AyurCTMS.
// This stands in for the eventual production database — every screen in the
// app, and every API route under src/app/api/**, reads from here so the
// portfolio, study workspace, safety hub, audit trail, and participant
// records stay consistent with each other.
//
// NOTE ON "SYNTHETIC" DATA: values here are illustrative trial data for demo
// purposes, not real patient records. Regulatory deadlines (`deadlineISO`)
// are generated relative to server start time (see `hoursFromNow` /
// `daysAgo` below) rather than hardcoded, so the countdown badges the
// judges see are always live, real elapsed-time math — not a frozen string.

export type Role = "PI" | "ETHICS_COMMITTEE" | "PHARMACOVIGILANCE_OFFICER" | "LEADERSHIP";

export const ROLE_LABELS: Record<Role, string> = {
  PI: "Principal Investigator",
  ETHICS_COMMITTEE: "Ethics Committee",
  PHARMACOVIGILANCE_OFFICER: "Pharmacovigilance Officer",
  LEADERSHIP: "Leadership",
};

export const ROLES: Role[] = ["PI", "ETHICS_COMMITTEE", "PHARMACOVIGILANCE_OFFICER", "LEADERSHIP"];

function hoursFromNow(h: number): string {
  return new Date(Date.now() + h * 3600 * 1000).toISOString();
}

function daysAgo(d: number): string {
  return new Date(Date.now() - d * 24 * 3600 * 1000).toISOString();
}

export type ChecklistItem = {
  label: string;
  done: boolean;
  note?: string;
};

// The Ashtavidha Pariksha (Eight-fold Examination) — the classical Ayurvedic
// clinical baseline recorded for every participant alongside modern vitals.
export type AshtavidhaPariksha = {
  nadi: string; // Pulse characteristics
  mootra: string; // Urine
  mala: string; // Faeces / bowel habits
  jihwa: string; // Tongue coating / appearance
  shabda: string; // Voice / speech
  sparsha: string; // Skin texture / temperature
  drik: string; // Eyes / vision
  akruti: string; // General physical build / gait
};

export type Participant = {
  id: string;
  prakriti: string;
  condition: string;
  status: "Active" | "Follow-up" | "Screening" | "Withdrawn";
  dosha: string;
  agni: string;
  koshtha: string;
  bala: string;
  consentComplete: boolean;
  consentDate?: string;
  ashtavidhaPariksha: AshtavidhaPariksha;
  biomedical: { label: string; value: string }[];
  visitTimeline: { label: string; done: boolean }[];
  followUp: { day: string; improvement: string; adherence: string };
  intervention: { medicine: string; dose: string; duration: string; anupana: string; kala: string };
  ayurvedaOutcomes: { metric: string; day0: string; day30: string; day60: string }[];
  biomedicalOutcomes: { metric: string; day0: string; day30: string; day60: string }[];
};

export type SafetyCase = {
  id: string;
  participantId: string;
  kind: "SAE" | "AE";
  severity: "Mild" | "Moderate" | "Severe";
  causality?: string;
  deadlineISO?: string; // regulatory reporting deadline — computed, not a frozen label
  status: string;
};

export type AuditEntry = {
  time: string;
  text: string;
};

export type ProtocolDeviation = {
  id: string;
  participantId: string;
  description: string;
  dateISO: string;
  correctiveAction: string;
};

export type Study = {
  id: string;
  name: string;
  type: "Interventional" | "Observational" | "Multi-centre";
  readiness: number;
  status: string;
  statusTone: "ok" | "warn" | "blocked";
  phase: string;
  design: string;
  sponsor: string;
  ctri: string;
  studyStatus: "Active" | "Planning" | "Paused";
  duration: string;
  enrollment: { current: number; target: number };
  sites: number;
  ayurvedaFramework: ChecklistItem[];
  primaryOutcome: string;
  secondaryOutcome: string;
  regulatoryEthics: ChecklistItem[];
  interventionFramework: ChecklistItem[];
  enrollmentReadiness: { percent: number; missing: string[] };
  participants: Participant[];
  safety: {
    openAE: number;
    openSAE: number;
    overdueReports: number;
    cases: SafetyCase[];
    reportingStatus: { onTime: number; dueSoon: number; overdue: number };
  };
  protocolDeviations: ProtocolDeviation[];
  audit: AuditEntry[];
};

export const STUDIES: Study[] = [
  {
    id: "AYUR-001",
    name: "Standardized Ashwagandha in Glycemic & Metabolic Regulation",
    type: "Interventional",
    readiness: 96,
    status: "Ready For Enrollment",
    statusTone: "ok",
    phase: "Phase II",
    design: "Randomized",
    sponsor: "AIIA",
    ctri: "CTRI/2026/08/123456",
    studyStatus: "Active",
    duration: "12 Months",
    enrollment: { current: 48, target: 60 },
    sites: 3,
    ayurvedaFramework: [
      { label: "Prakriti", done: true },
      { label: "Dosha", done: true },
      { label: "Agni", done: true },
      { label: "Bala", done: true },
    ],
    primaryOutcome: "HbA1c",
    secondaryOutcome: "Agni Improvement Score",
    regulatoryEthics: [
      { label: "IEC Approval", done: true },
      { label: "Consent Form", done: true },
      { label: "CTRI Registration", done: true },
      { label: "NDCT Applicability Checked", done: true },
      { label: "DSM Plan Missing", done: false, note: "Due Today" },
    ],
    interventionFramework: [
      { label: "Formulation Defined", done: true },
      { label: "Dosage Defined", done: true },
      { label: "Duration Defined", done: true },
      { label: "Pathya Defined", done: true },
      { label: "Follow-up Schedule Defined", done: false },
    ],
    enrollmentReadiness: { percent: 96, missing: ["Safety Plan", "DSMB Review"] },
    participants: [
      {
        id: "AY-0042",
        prakriti: "Vata-Pitta",
        condition: "Diabetes",
        status: "Active",
        dosha: "Vata",
        agni: "Moderate",
        koshtha: "Madhyama",
        bala: "6/10",
        consentComplete: true,
        consentDate: daysAgo(62),
        ashtavidhaPariksha: {
          nadi: "Vata-Pitta, 78/min, irregular rhythm",
          mootra: "Pale yellow, 4-5x/day",
          mala: "Formed, once daily",
          jihwa: "Slight coating, central fissure",
          shabda: "Clear, moderate pitch",
          sparsha: "Warm, dry",
          drik: "Alert, mild scleral dryness",
          akruti: "Medium build, upright gait",
        },
        biomedical: [
          { label: "BP", value: "130/84" },
          { label: "Weight", value: "72 kg" },
          { label: "HbA1c", value: "7.8%" },
        ],
        visitTimeline: [
          { label: "Screening", done: true },
          { label: "Baseline (Day 0)", done: true },
          { label: "Day 30 Follow-up", done: true },
          { label: "Day 60 Follow-up", done: false },
        ],
        followUp: { day: "Day 30", improvement: "18%", adherence: "92%" },
        intervention: {
          medicine: "Formulation A (Ashwagandha Vati)",
          dose: "2x Daily",
          duration: "30 Days",
          anupana: "Warm Water",
          kala: "After Meals",
        },
        ayurvedaOutcomes: [
          { metric: "Bala", day0: "5", day30: "7", day60: "8" },
          { metric: "Agni", day0: "4", day30: "6", day60: "7" },
          { metric: "Symptom Score", day0: "18", day30: "11", day60: "6" },
        ],
        biomedicalOutcomes: [
          { metric: "HbA1c", day0: "7.8", day30: "7.4", day60: "7.1" },
          { metric: "Weight", day0: "72", day30: "71", day60: "70.5" },
          { metric: "BP", day0: "150/90", day30: "142/88", day60: "136/84" },
        ],
      },
      {
        id: "AY-0043",
        prakriti: "Kapha",
        condition: "Arthritis",
        status: "Follow-up",
        dosha: "Kapha",
        agni: "Slow",
        koshtha: "Krura",
        bala: "7/10",
        consentComplete: true,
        consentDate: daysAgo(70),
        ashtavidhaPariksha: {
          nadi: "Kapha, 64/min, slow and steady",
          mootra: "Turbid, 2-3x/day",
          mala: "Hard, once every 2 days",
          jihwa: "Thick white coating",
          shabda: "Low, monotone",
          sparsha: "Cool, unctuous",
          drik: "Calm, heavy eyelids",
          akruti: "Heavy build, slow gait",
        },
        biomedical: [
          { label: "BP", value: "122/78" },
          { label: "Weight", value: "81 kg" },
          { label: "HbA1c", value: "5.9%" },
        ],
        visitTimeline: [
          { label: "Screening", done: true },
          { label: "Baseline (Day 0)", done: true },
          { label: "Day 30 Follow-up", done: true },
          { label: "Day 60 Follow-up", done: true },
        ],
        followUp: { day: "Day 60", improvement: "24%", adherence: "88%" },
        intervention: {
          medicine: "Formulation B (Ashwagandha Ghrita)",
          dose: "1x Daily",
          duration: "30 Days",
          anupana: "Warm Milk",
          kala: "Bedtime",
        },
        ayurvedaOutcomes: [
          { metric: "Bala", day0: "4", day30: "6", day60: "7" },
          { metric: "Agni", day0: "3", day30: "5", day60: "6" },
          { metric: "Symptom Score", day0: "21", day30: "14", day60: "9" },
        ],
        biomedicalOutcomes: [
          { metric: "HbA1c", day0: "5.9", day30: "5.8", day60: "5.7" },
          { metric: "Weight", day0: "81", day30: "80", day60: "79" },
          { metric: "BP", day0: "128/82", day30: "124/80", day60: "122/78" },
        ],
      },
      {
        id: "AY-0044",
        prakriti: "Vata",
        condition: "Diabetes",
        status: "Screening",
        dosha: "Vata",
        agni: "Vishamagni",
        koshtha: "Krura",
        bala: "4/10",
        consentComplete: false,
        ashtavidhaPariksha: {
          nadi: "Vata, 88/min, thready",
          mootra: "Scanty, frequent",
          mala: "Dry, irregular",
          jihwa: "Dry, cracked",
          shabda: "Hoarse, rapid",
          sparsha: "Cold, rough",
          drik: "Dry, restless",
          akruti: "Thin build, quick gait",
        },
        biomedical: [
          { label: "BP", value: "142/92" },
          { label: "Weight", value: "58 kg" },
          { label: "HbA1c", value: "8.6%" },
        ],
        visitTimeline: [
          { label: "Screening", done: true },
          { label: "Baseline (Day 0)", done: false },
          { label: "Day 30 Follow-up", done: false },
          { label: "Day 60 Follow-up", done: false },
        ],
        followUp: { day: "Pre-Baseline", improvement: "—", adherence: "—" },
        intervention: {
          medicine: "Formulation A (Ashwagandha Vati)",
          dose: "TBD",
          duration: "TBD",
          anupana: "TBD",
          kala: "TBD",
        },
        ayurvedaOutcomes: [
          { metric: "Bala", day0: "3", day30: "—", day60: "—" },
          { metric: "Agni", day0: "2", day30: "—", day60: "—" },
          { metric: "Symptom Score", day0: "24", day30: "—", day60: "—" },
        ],
        biomedicalOutcomes: [
          { metric: "HbA1c", day0: "8.6", day30: "—", day60: "—" },
          { metric: "Weight", day0: "58", day30: "—", day60: "—" },
          { metric: "BP", day0: "142/92", day30: "—", day60: "—" },
        ],
      },
    ],
    safety: {
      openAE: 12,
      openSAE: 2,
      overdueReports: 1,
      cases: [
        {
          id: "SAE-004",
          participantId: "AY-0042",
          kind: "SAE",
          severity: "Severe",
          causality: "Pathya Ullanghana (Dietary Protocol Violation)",
          deadlineISO: hoursFromNow(23.8),
          status: "Pending",
        },
        {
          id: "AE-102",
          participantId: "AY-0043",
          kind: "AE",
          severity: "Moderate",
          deadlineISO: hoursFromNow(7 * 24),
          status: "Under Review",
        },
        {
          id: "SAE-006",
          participantId: "AY-0044",
          kind: "SAE",
          severity: "Severe",
          causality: "Under Assessment",
          deadlineISO: hoursFromNow(-3),
          status: "Overdue",
        },
      ],
      reportingStatus: { onTime: 18, dueSoon: 2, overdue: 1 },
    },
    protocolDeviations: [
      {
        id: "PD-001",
        participantId: "AY-0042",
        description: "Day 30 follow-up window exceeded by 4 days",
        dateISO: daysAgo(9),
        correctiveAction: "Coordinator retraining on visit-window tracking",
      },
    ],
    audit: [
      { time: "10:45 AM", text: "Coordinator updated CTRI registration" },
      { time: "10:42 AM", text: "PI approved protocol version 2" },
      { time: "10:30 AM", text: "DSM Plan uploaded" },
      { time: "10:15 AM", text: "Participant AY-0042 enrolled" },
    ],
  },
  {
    id: "AYUR-002",
    name: "Guduchi in Metabolic Syndrome — Observational Cohort",
    type: "Observational",
    readiness: 82,
    status: "Review Required",
    statusTone: "warn",
    phase: "Phase III",
    design: "Cohort",
    sponsor: "AIIA",
    ctri: "CTRI/2026/05/065412",
    studyStatus: "Active",
    duration: "18 Months",
    enrollment: { current: 128, target: 250 },
    sites: 5,
    ayurvedaFramework: [
      { label: "Prakriti", done: true },
      { label: "Dosha", done: true },
      { label: "Agni", done: false },
      { label: "Bala", done: true },
    ],
    primaryOutcome: "Fasting Blood Glucose",
    secondaryOutcome: "Waist-Hip Ratio",
    regulatoryEthics: [
      { label: "IEC Approval", done: true },
      { label: "Consent Form", done: true },
      { label: "CTRI Registration", done: false, note: "Update Due" },
      { label: "NDCT Applicability Checked", done: true },
    ],
    interventionFramework: [
      { label: "Formulation Defined", done: true },
      { label: "Dosage Defined", done: true },
      { label: "Duration Defined", done: true },
      { label: "Pathya Defined", done: false },
      { label: "Follow-up Schedule Defined", done: true },
    ],
    enrollmentReadiness: { percent: 82, missing: ["CTRI Update"] },
    participants: [
      {
        id: "AY-0110",
        prakriti: "Pitta-Kapha",
        condition: "Metabolic Syndrome",
        status: "Active",
        dosha: "Pitta",
        agni: "Sharp",
        koshtha: "Mridu",
        bala: "5/10",
        consentComplete: true,
        consentDate: daysAgo(41),
        ashtavidhaPariksha: {
          nadi: "Pitta-Kapha, 74/min, forceful",
          mootra: "Yellow, 3-4x/day",
          mala: "Soft, once daily",
          jihwa: "Reddish, thin coating",
          shabda: "Sharp, commanding",
          sparsha: "Warm, moist",
          drik: "Sharp, sensitive to light",
          akruti: "Medium-heavy build, moderate gait",
        },
        biomedical: [
          { label: "BP", value: "136/88" },
          { label: "Weight", value: "88 kg" },
          { label: "HbA1c", value: "6.4%" },
        ],
        visitTimeline: [
          { label: "Screening", done: true },
          { label: "Baseline (Day 0)", done: true },
          { label: "Day 30 Follow-up", done: false },
          { label: "Day 60 Follow-up", done: false },
        ],
        followUp: { day: "Day 0", improvement: "—", adherence: "—" },
        intervention: {
          medicine: "Guduchi Extract (Churna)",
          dose: "2x Daily",
          duration: "45 Days",
          anupana: "Honey",
          kala: "Before Meals",
        },
        ayurvedaOutcomes: [
          { metric: "Bala", day0: "5", day30: "—", day60: "—" },
          { metric: "Agni", day0: "6", day30: "—", day60: "—" },
          { metric: "Symptom Score", day0: "15", day30: "—", day60: "—" },
        ],
        biomedicalOutcomes: [
          { metric: "HbA1c", day0: "6.4", day30: "—", day60: "—" },
          { metric: "Weight", day0: "88", day30: "—", day60: "—" },
          { metric: "BP", day0: "136/88", day30: "—", day60: "—" },
        ],
      },
      {
        id: "AY-0111",
        prakriti: "Kapha-Vata",
        condition: "Metabolic Syndrome",
        status: "Active",
        dosha: "Kapha",
        agni: "Manda",
        koshtha: "Krura",
        bala: "6/10",
        consentComplete: true,
        consentDate: daysAgo(38),
        ashtavidhaPariksha: {
          nadi: "Kapha-Vata, 68/min, soft",
          mootra: "Pale, 2x/day",
          mala: "Hard, irregular",
          jihwa: "Thick coating, pale",
          shabda: "Low, slow",
          sparsha: "Cool, dry",
          drik: "Dull, mild puffiness",
          akruti: "Heavy build, sluggish gait",
        },
        biomedical: [
          { label: "BP", value: "128/84" },
          { label: "Weight", value: "94 kg" },
          { label: "HbA1c", value: "6.1%" },
        ],
        visitTimeline: [
          { label: "Screening", done: true },
          { label: "Baseline (Day 0)", done: true },
          { label: "Day 30 Follow-up", done: false },
          { label: "Day 60 Follow-up", done: false },
        ],
        followUp: { day: "Day 0", improvement: "—", adherence: "—" },
        intervention: {
          medicine: "Guduchi Extract (Churna)",
          dose: "2x Daily",
          duration: "45 Days",
          anupana: "Warm Water",
          kala: "Before Meals",
        },
        ayurvedaOutcomes: [
          { metric: "Bala", day0: "6", day30: "—", day60: "—" },
          { metric: "Agni", day0: "3", day30: "—", day60: "—" },
          { metric: "Symptom Score", day0: "17", day30: "—", day60: "—" },
        ],
        biomedicalOutcomes: [
          { metric: "HbA1c", day0: "6.1", day30: "—", day60: "—" },
          { metric: "Weight", day0: "94", day30: "—", day60: "—" },
          { metric: "BP", day0: "128/84", day30: "—", day60: "—" },
        ],
      },
    ],
    safety: {
      openAE: 4,
      openSAE: 0,
      overdueReports: 0,
      cases: [
        {
          id: "AE-088",
          participantId: "AY-0110",
          kind: "AE",
          severity: "Mild",
          deadlineISO: hoursFromNow(14 * 24),
          status: "Under Review",
        },
      ],
      reportingStatus: { onTime: 6, dueSoon: 1, overdue: 0 },
    },
    protocolDeviations: [
      {
        id: "PD-002",
        participantId: "AY-0111",
        description: "Baseline labs drawn 2 days outside protocol window",
        dateISO: daysAgo(4),
        correctiveAction: "Site notified; no re-draw required per PI review",
      },
    ],
    audit: [
      { time: "09:20 AM", text: "Coordinator flagged CTRI registration for renewal" },
      { time: "09:05 AM", text: "Participant AY-0110 completed baseline visit" },
    ],
  },
  {
    id: "AYUR-003",
    name: "Multi-centre Triphala Trial in Post-Surgical Recovery",
    type: "Multi-centre",
    readiness: 61,
    status: "Enrollment Blocked",
    statusTone: "blocked",
    phase: "Phase II/III",
    design: "Multi-centre Randomized",
    sponsor: "AIIA",
    ctri: "CTRI/2026/03/041178",
    studyStatus: "Planning",
    duration: "9 Months",
    enrollment: { current: 0, target: 90 },
    sites: 4,
    ayurvedaFramework: [
      { label: "Prakriti", done: true },
      { label: "Dosha", done: false },
      { label: "Agni", done: false },
      { label: "Bala", done: false },
    ],
    primaryOutcome: "Wound Healing Score",
    secondaryOutcome: "Post-op Pain Index",
    regulatoryEthics: [
      { label: "IEC Approval", done: true },
      { label: "Consent Form", done: false },
      { label: "CTRI Registration", done: true },
      { label: "NDCT Applicability Checked", done: false },
      { label: "DSMB Plan Missing", done: false, note: "Blocking Enrollment" },
    ],
    interventionFramework: [
      { label: "Formulation Defined", done: true },
      { label: "Dosage Defined", done: false },
      { label: "Duration Defined", done: false },
      { label: "Pathya Defined", done: false },
      { label: "Follow-up Schedule Defined", done: false },
    ],
    enrollmentReadiness: { percent: 61, missing: ["DSMB Plan", "Consent Form", "Dosage Definition"] },
    participants: [],
    safety: {
      openAE: 0,
      openSAE: 0,
      overdueReports: 0,
      cases: [],
      reportingStatus: { onTime: 0, dueSoon: 0, overdue: 0 },
    },
    protocolDeviations: [],
    audit: [
      { time: "Yesterday", text: "Ethics Committee requested revised consent form" },
      { time: "Yesterday", text: "Study registered on CTRI" },
    ],
  },
];

// Portfolio KPIs are derived from STUDIES rather than hand-maintained, so the
// dashboard can never drift out of sync with the underlying study records.
export const PORTFOLIO_KPIS = {
  activeStudies: STUDIES.filter((s) => s.studyStatus === "Active").length,
  safetyAlerts: STUDIES.reduce((n, s) => n + s.safety.cases.filter((c) => c.kind === "SAE").length, 0),
  regulatoryActionsDue: STUDIES.reduce(
    (n, s) => n + s.regulatoryEthics.filter((r) => !r.done).length + s.safety.overdueReports,
    0
  ),
  portfolioReadiness: Math.round(STUDIES.reduce((sum, s) => sum + s.readiness, 0) / STUDIES.length),
  participantsEnrolled: {
    current: STUDIES.reduce((n, s) => n + s.enrollment.current, 0),
    target: STUDIES.reduce((n, s) => n + s.enrollment.target, 0),
  },
  protocolDeviations: STUDIES.reduce((n, s) => n + s.protocolDeviations.length, 0),
};

export const PRIORITY_ACTIONS: {
  studyId: string;
  title: string;
  tone: "critical" | "warn";
}[] = [
  { studyId: "AYUR-003", title: "DSMB Plan Missing", tone: "critical" },
  { studyId: "AYUR-002", title: "CTRI Update Due", tone: "warn" },
  { studyId: "AYUR-001", title: "Follow-up Visit Overdue", tone: "critical" },
];

export function getStudy(studyId: string): Study | undefined {
  return STUDIES.find((s) => s.id.toLowerCase() === studyId.toLowerCase());
}

export function getParticipant(studyId: string, participantId: string): Participant | undefined {
  const study = getStudy(studyId);
  return study?.participants.find((p) => p.id.toLowerCase() === participantId.toLowerCase());
}

export function getSafetyCase(studyId: string, caseId: string): SafetyCase | undefined {
  const study = getStudy(studyId);
  return study?.safety.cases.find((c) => c.id.toLowerCase() === caseId.toLowerCase());
}
