import { toFhirResearchStudy } from "@/fhir/research-study";
import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: study, error } = await supabase
    .from("studies")
    .select(
      "id, ctri_number, title, description, study_type, phase, pi_id, iec_approval_date, iec_status, target_enrolment, current_enrolment, monitoring_frequency, monitoring_start_date, monitoring_end_date",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Failed to retrieve study for FHIR export", error);
    return Response.json(
      { error: "Unable to retrieve the study." },
      { status: 500 },
    );
  }

  if (!study) {
    return Response.json({ error: "Study not found." }, { status: 404 });
  }

  return Response.json(toFhirResearchStudy(study), { status: 200 });
}
