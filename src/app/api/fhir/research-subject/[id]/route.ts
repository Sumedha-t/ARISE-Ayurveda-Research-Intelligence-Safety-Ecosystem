import { toFhirResearchSubject } from "@/fhir/research-subject";
import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: subject, error } = await supabase
    .from("trial_subjects")
    .select(
      "id, study_id, subject_code, enrolment_status, consent_obtained, consent_version, consent_date, eligibility_status, eligibility_notes, eligibility_assessed_at",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Failed to retrieve trial subject for FHIR export", error);
    return Response.json(
      { error: "Unable to retrieve the trial subject." },
      { status: 500 },
    );
  }

  if (!subject) {
    return Response.json(
      { error: "Trial subject not found." },
      { status: 404 },
    );
  }

  try {
    return Response.json(toFhirResearchSubject(subject), { status: 200 });
  } catch (transformError) {
    console.error("Failed to transform trial subject for FHIR export", transformError);
    return Response.json(
      { error: "Unable to transform the trial subject." },
      { status: 500 },
    );
  }
}
