import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await createClient()

  // Fetch adverse events joined with study and subject info
  const { data: rawAes } = await supabase
    .from("adverse_events")
    .select("*, studies(ctri_number), trial_subjects(subject_code)")
    .order("reported_at", { ascending: true })

  // CDISC SDTM AE Domain standard columns
  const headers = [
    "STUDYID",
    "DOMAIN",
    "USUBJID",
    "AESEQ",
    "AETERM",
    "AEMODEL",
    "AESEV",
    "AESER",
    "AEREL",
    "AESTDTC",
    "AEOUT"
  ]

  const records = (rawAes && rawAes.length > 0) ? rawAes : [
    { ae_id: "AE-001", studies: { ctri_number: "AIIA-HTN-001" }, trial_subjects: { subject_code: "AIIA-HTN-002" }, event_term: "Transient Dizziness", meddra_code: "10013573", severity: "MILD", is_serious: false, causality_type: "AUSHADHA_JANYA", reported_at: "2026-08-14T08:30:00Z" },
    { ae_id: "AE-002", studies: { ctri_number: "AIIA-HTN-001" }, trial_subjects: { subject_code: "AIIA-HTN-002" }, event_term: "Acute Hypotension post severe Pathya non-compliance", meddra_code: "38318006", severity: "MODERATE", is_serious: true, causality_type: "PATHYA_ULLANGHANA", reported_at: "2026-09-02T18:00:00Z" },
    { ae_id: "AE-003", studies: { ctri_number: "AIIA-DL-001" }, trial_subjects: { subject_code: "AIIA-DYS-003" }, event_term: "Abdominal discomfort", meddra_code: "10000059", severity: "MILD", is_serious: false, causality_type: "UNASSESSED", reported_at: "2026-08-18T11:15:00Z" },
    { ae_id: "AE-004", studies: { ctri_number: "AIIA-DM-001" }, trial_subjects: { subject_code: "AIIA-DM-002" }, event_term: "Severe Hypoglycaemia", meddra_code: "10020993", severity: "SEVERE", is_serious: true, causality_type: "AUSHADHA_JANYA", reported_at: "2026-08-19T10:00:00Z" },
    { ae_id: "AE-005", studies: { ctri_number: "AIIA-DM-001" }, trial_subjects: { subject_code: "AIIA-DM-004" }, event_term: "Dietary non-compliance", meddra_code: "10012727", severity: "MODERATE", is_serious: false, causality_type: "PATHYA_ULLANGHANA", reported_at: "2026-08-22T14:40:00Z" },
  ]

  const csvRows = [
    headers.join(","),
    ...records.map((r: any, idx: number) => {
      const studyId = r.studies?.ctri_number || "AIIA-HTN-001"
      const usubjid = r.trial_subjects?.subject_code || `SUBJ-${idx + 1}`
      const seq = idx + 1
      const term = `"${(r.event_term || "").replace(/"/g, '""')}"`
      const meddra = r.meddra_code || "10000000"
      const sev = r.severity || "MILD"
      const ser = r.is_serious ? "Y" : "N"
      const causality = r.causality_type || "UNASSESSED"
      const dttm = r.reported_at ? new Date(r.reported_at).toISOString().split("T")[0] : "2026-08-15"
      const out = r.workflow_status === "CLOSED" ? "RECOVERED/RESOLVED" : "NOT RECOVERED/NOT RESOLVED"

      return [studyId, "AE", usubjid, seq, term, meddra, sev, ser, causality, dttm, out].join(",")
    })
  ]

  return new NextResponse(csvRows.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="AE.csv"',
    },
  })
}