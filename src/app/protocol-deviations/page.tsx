import { createClient } from "@/lib/supabase/server";
import ProtocolDeviationForm from "@/components/compliance/protocol-deviation-form";

export default async function ProtocolDeviationsPage() {
  const supabase = await createClient();

  const studyCode = "AIIA-HTN-001";
  const subjectCode = "AIIA-HTN-002";

  const { data: study, error: studyError } = await supabase
    .from("studies")
    .select("id")
    .eq("ctri_number", studyCode)
    .single();

  if (studyError || !study) {
    return (
      <main style={{ maxWidth: "800px", margin: "40px auto", padding: "20px" }}>
        <h1>Compliance & Safety</h1>
        <p>Study {studyCode} is not available yet.</p>
        <p>Please verify that the shared seed has been loaded into Supabase.</p>
      </main>
    );
  }

  const { data: subject, error: subjectError } = await supabase
    .from("trial_subjects")
    .select("id")
    .eq("study_id", study.id)
    .eq("subject_code", subjectCode)
    .single();

  if (subjectError || !subject) {
    return (
      <main style={{ maxWidth: "800px", margin: "40px auto", padding: "20px" }}>
        <h1>Compliance & Safety</h1>
        <p>Subject {subjectCode} is not available yet.</p>
        <p>Please verify that the shared seed has been loaded into Supabase.</p>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: "800px", margin: "40px auto", padding: "20px" }}>
      <h1>Compliance & Safety</h1>

      <p>
        Study: <strong>{studyCode}</strong>
      </p>

      <p>
        Subject: <strong>{subjectCode}</strong>
      </p>

      <div
        style={{
          marginTop: "24px",
          padding: "24px",
          border: "1px solid #ddd",
          borderRadius: "12px",
        }}
      >
        <ProtocolDeviationForm
          studyId={study.id}
          subjectId={subject.id}
        />
      </div>
    </main>
  );
}