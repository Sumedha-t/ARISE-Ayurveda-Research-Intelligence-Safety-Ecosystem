import { toFhirProtocolDeviation } from "@/fhir/protocol-deviation";
import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: deviation, error } = await supabase
    .from("protocol_deviations")
    .select(
      "id, study_id, deviation_type, description, severity, identified_at, corrective_action, status",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Failed to retrieve protocol deviation for FHIR export", error);
    return Response.json(
      { error: "Unable to retrieve the protocol deviation." },
      { status: 500 },
    );
  }

  if (!deviation) {
    return Response.json(
      { error: "Protocol deviation not found." },
      { status: 404 },
    );
  }

  try {
    return Response.json(toFhirProtocolDeviation(deviation), { status: 200 });
  } catch (transformError) {
    console.error(
      "Failed to transform protocol deviation for FHIR export",
      transformError,
    );
    return Response.json(
      { error: "Unable to transform the protocol deviation." },
      { status: 500 },
    );
  }
}
