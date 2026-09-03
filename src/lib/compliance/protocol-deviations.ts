import { createClient } from "@/lib/supabase/server";

export type AeSeverity = "MILD" | "MODERATE" | "SEVERE";

export type CreateProtocolDeviationInput = {
  study_id: string;
  subject_id?: string | null;
  deviation_type: string;
  description: string;
  severity: AeSeverity;
  corrective_action?: string | null;
  status?: string | null;
};

export async function createProtocolDeviation(
  input: CreateProtocolDeviationInput,
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("protocol_deviations")
    .insert({
      study_id: input.study_id,
      subject_id: input.subject_id ?? null,
      deviation_type: input.deviation_type,
      description: input.description,
      severity: input.severity,
      corrective_action: input.corrective_action ?? null,
      status: input.status ?? "Logged",
    })
    .select()
    .single();

  if (error) {
    throw new Error(
      `Unable to create protocol deviation: ${error.message}`,
    );
  }

  return data;
}