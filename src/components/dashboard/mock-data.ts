// TEMPORARY mock data for Milestone 4, standing in for the real Supabase
// queries against `studies`, `trial_subjects`, and `adverse_events`.
//
// TODO(wiring window): replace these three exports with real queries:
//   - getMockKpis()          -> aggregate COUNT/SUM over `studies` +
//                               `trial_subjects` + `adverse_events`
//   - getMockEnrollmentSeries() -> cumulative COUNT(trial_subjects) grouped
//                               by screening_date, per study or portfolio-wide
//   - getMockActiveSae()     -> SELECT * FROM adverse_events WHERE is_serious
//                               = true AND workflow_status <> 'CLOSED' ORDER
//                               BY regulatory_deadline ASC LIMIT 1 (the query
//                               Dev 3 hasn't built a GET endpoint for yet)
//
// Field values mirror the seed conventions in the team's Synthetic_Data
// workbook (SAE-004-style hypoglycaemia case, AIIA-DM-002 subject code, NDCT
// Rule 67 / SAE_INITIAL_24H deadline type) so swapping to live data doesn't
// change any component prop shapes.

import type { KpiCardsProps } from "@/components/dashboard/KpiCards";
import type { EnrollmentPoint } from "@/components/dashboard/EnrollmentTrajectory";
import type { AdverseEventRow } from "@/components/dashboard/UrgentSafetyBanner";

export function getMockKpis(): KpiCardsProps {
  return {
    activeStudies: 3,
    enrolledCurrent: 15,
    enrolledTarget: 15,
    openAdverseEvents: 3,
    regulatoryActionsDue: 1,
  };
}

export function getMockEnrollmentSeries(): {
  data: EnrollmentPoint[];
  target: number;
} {
  return {
    target: 15,
    data: [
      { date: "2026-08-04", enrolled: 2 },
      { date: "2026-08-06", enrolled: 5 },
      { date: "2026-08-08", enrolled: 8 },
      { date: "2026-08-10", enrolled: 11 },
      { date: "2026-08-12", enrolled: 15 },
    ],
  };
}

export function getMockActiveSae(): AdverseEventRow {
  // Shaped exactly like a row from `adverse_events`. This mirrors the real
  // seeded SAE (severe hypoglycaemia, AIIA-DM-002) referenced in the
  // Milestone 4 handoff notes — a 24-hour NDCT Rule 67 initial report window.
  return {
    id: "AE-004",
    study_id: "SYN-DM-003",
    subject_id: "AIIA-DM-002",
    event_term: "Hypoglycaemia",
    severity: "SEVERE",
    is_serious: true,
    causality_type: "AUSHADHA_JANYA",
    workflow_status: "SUBMITTED",
    reporting_deadline_type: "SAE_INITIAL_24H",
    regulatory_deadline: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
  };
}
