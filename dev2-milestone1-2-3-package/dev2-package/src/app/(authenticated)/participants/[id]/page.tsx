import { getCurrentUserProfile } from "@/lib/profile";
import { ParticipantView } from "@/components/subjects/ParticipantView";
import { getMockAssessments, getMockScreeningCriteria, getMockSubject } from "@/lib/mock/subject-mock";

// Verified against real dev1-foundation (commit eda6e71): route protection
// (redirect to /login if unauthenticated) is handled by src/proxy.ts
// middleware, so this page doesn't need its own redirect — profile should
// never be null here in practice.
//
// TODO(Thursday wiring window): replace the three getMock*() calls with
// real Supabase queries scoped to params.id / the subject's study_id.
export default async function ParticipantPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await getCurrentUserProfile();

  const subject = getMockSubject(id);
  const criteria = getMockScreeningCriteria();
  const assessments = getMockAssessments();

  const readOnly = profile?.role === "ETHICS_COMMITTEE";

  return (
    <div className="p-6 max-w-4xl mx-auto w-full">
      <ParticipantView subject={subject} criteria={criteria} initialAssessments={assessments} readOnly={readOnly} />
    </div>
  );
}
