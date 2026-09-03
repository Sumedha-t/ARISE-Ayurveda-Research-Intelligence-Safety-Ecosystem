import { toCsv } from "@/sdtm/csv";
import { SDTM_AE_COLUMNS, toSdtmAeRow } from "@/sdtm/ae";
import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ studyId: string }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  const { studyId } = await params;
  const supabase = await createClient();

  const { data: study, error: studyError } = await supabase
    .from("studies")
    .select("ctri_number")
    .eq("id", studyId)
    .maybeSingle();

  if (studyError) {
    console.error("Failed to retrieve study for SDTM AE export", studyError);
    return Response.json(
      { error: "Unable to retrieve the study." },
      { status: 500 },
    );
  }

  if (!study) {
    return Response.json({ error: "Study not found." }, { status: 404 });
  }

  const { data: subjects, error: subjectsError } = await supabase
    .from("trial_subjects")
    .select("id, subject_code")
    .eq("study_id", studyId);

  if (subjectsError) {
    console.error("Failed to retrieve subjects for SDTM AE export", subjectsError);
    return Response.json(
      { error: "Unable to retrieve the study subjects." },
      { status: 500 },
    );
  }

  const { data: events, error: eventsError } = await supabase
    .from("adverse_events")
    .select(
      "id, subject_id, event_term, severity, is_serious, outcome, causality_type",
    )
    .eq("study_id", studyId)
    .order("subject_id")
    .order("id");

  if (eventsError) {
    console.error("Failed to retrieve adverse events for SDTM AE export", eventsError);
    return Response.json(
      { error: "Unable to retrieve the study adverse events." },
      { status: 500 },
    );
  }

  const subjectCodes = new Map(
    (subjects ?? []).map((subject) => [subject.id, subject.subject_code]),
  );
  const sequences = new Map<string, number>();
  const rows = [];

  for (const event of events ?? []) {
    const subjectCode = subjectCodes.get(event.subject_id);

    if (!subjectCode) {
      console.error("Unable to identify subject for SDTM AE export");
      return Response.json(
        { error: "Unable to retrieve the study adverse events." },
        { status: 500 },
      );
    }

    const sequence = (sequences.get(event.subject_id) ?? 0) + 1;
    sequences.set(event.subject_id, sequence);
    rows.push(toSdtmAeRow(study, { subject_code: subjectCode }, event, sequence));
  }

  return new Response(toCsv(SDTM_AE_COLUMNS, rows), {
    headers: {
      "Content-Disposition": 'attachment; filename="sdtm-ae.csv"',
      "Content-Type": "text/csv; charset=utf-8",
    },
  });
}
