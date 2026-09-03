import { toFhirAdverseEvent } from "@/fhir/adverse-event";
import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: adverseEvent, error } = await supabase
    .from("adverse_events")
    .select(
      "id, study_id, severity, is_serious, event_term, meddra_code, namaste_portal_code, causality_type, outcome, workflow_status, reporting_deadline_type, reported_at, regulatory_deadline, submitted_to_regulator_at",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Failed to retrieve adverse event for FHIR export", error);
    return Response.json(
      { error: "Unable to retrieve the adverse event." },
      { status: 500 },
    );
  }

  if (!adverseEvent) {
    return Response.json(
      { error: "Adverse event not found." },
      { status: 404 },
    );
  }

  try {
    return Response.json(toFhirAdverseEvent(adverseEvent), { status: 200 });
  } catch (transformError) {
    console.error("Failed to transform adverse event for FHIR export", transformError);
    return Response.json(
      { error: "Unable to transform the adverse event." },
      { status: 500 },
    );
  }
}
