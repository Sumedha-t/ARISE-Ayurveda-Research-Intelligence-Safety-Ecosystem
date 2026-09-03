import { toCsv } from "@/sdtm/csv";
import { SDTM_DM_COLUMNS, toSdtmDmRow } from "@/sdtm/dm";
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
    console.error("Failed to retrieve study for SDTM DM export", studyError);
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
    .select("subject_code, screening_date")
    .eq("study_id", studyId)
    .order("subject_code");

  if (subjectsError) {
    console.error("Failed to retrieve subjects for SDTM DM export", subjectsError);
    return Response.json(
      { error: "Unable to retrieve the study subjects." },
      { status: 500 },
    );
  }

  const csv = toCsv(
    SDTM_DM_COLUMNS,
    (subjects ?? []).map((subject) => toSdtmDmRow(study, subject)),
  );

  return new Response(csv, {
    headers: {
      "Content-Disposition": 'attachment; filename="sdtm-dm.csv"',
      "Content-Type": "text/csv; charset=utf-8",
    },
  });
}
