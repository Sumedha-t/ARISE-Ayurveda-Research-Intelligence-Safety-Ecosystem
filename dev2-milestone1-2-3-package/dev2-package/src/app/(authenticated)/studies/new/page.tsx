import { getCurrentUserProfile } from "@/lib/profile";
import { CreateStudyWizard } from "@/components/studies/CreateStudyWizard";

// Verified against the real src/lib/profile.ts on dev1-foundation
// (commit eda6e71): it exports getCurrentUserProfile() — no-arg,
// self-contained (calls createClient() internally) — not getMyProfile(supabase)
// as Dev 1's reference-packet message described.
export default async function NewStudyPage() {
  const profile = await getCurrentUserProfile();
  const role = profile?.role;

  const canWrite = role === "PI" || role === "ADMIN";

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Create Study</h1>
        <p className="text-sm text-slate-500">
          Basic details, clinical parameters, interventions, monitoring schedule, and eligibility criteria.
        </p>
      </div>

      {!canWrite && (
        <div className="max-w-3xl mx-auto w-full bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-xs text-amber-800">
          You&apos;re viewing this form as <strong>{role ?? "an unrecognized role"}</strong>. Study creation is
          scoped to PI and ADMIN by RLS — you can fill this out, but submission may be rejected by the database.
        </div>
      )}

      <CreateStudyWizard />
    </div>
  );
}
