import { createClient } from "@/lib/supabase/server";
import { calculateRegulatoryDeadline } from "@/lib/safety/deadline";

export type CreateAdverseEventInput = {
  study_id: string;
  subject_id: string;
  severity: "MILD" | "MODERATE" | "SEVERE";
  is_serious: boolean;
  event_term: string;
  meddra_code?: string | null;
  namaste_portal_code?: string | null;
  causality_type?:
    | "AUSHADHA_JANYA"
    | "ANUPANA_DOSHA"
    | "PATHYA_ULLANGHANA"
    | "ASHODHITA_DRAVYA"
    | "UNRELATED"
    | "UNASSESSED"
    | null;
  outcome?:
    | "RECOVERED"
    | "RECOVERING"
    | "NOT_RECOVERED"
    | "FATAL"
    | "UNKNOWN"
    | null;
};

export async function createAdverseEvent(input: CreateAdverseEventInput) {
  const supabase = await createClient();

  const deadline = calculateRegulatoryDeadline(input.is_serious);

  const { data, error } = await supabase
    .from("adverse_events")
    .insert({
      study_id: input.study_id,
      subject_id: input.subject_id,
      severity: input.severity,
      is_serious: input.is_serious,
      event_term: input.event_term,
      meddra_code: input.meddra_code ?? null,
      namaste_portal_code: input.namaste_portal_code ?? null,
      causality_type: input.causality_type ?? "UNASSESSED",
      outcome: input.outcome ?? "UNKNOWN",
      workflow_status: "DRAFT",
      reporting_deadline_type: deadline.reporting_deadline_type,
      regulatory_deadline: deadline.regulatory_deadline?.toISOString() ?? null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Unable to create adverse event: ${error.message}`);
  }

  return data;
}