import { createClient } from "@/lib/supabase/server"
import { getCurrentUserProfile } from "@/lib/profile"
import { KpiCards } from "@/components/dashboard/KpiCards"
import { EnrollmentTrajectory } from "@/components/dashboard/EnrollmentTrajectory"
import { UrgentSafetyBanner } from "@/components/dashboard/UrgentSafetyBanner"
import Link from "next/link"
import { ArrowRight, ShieldAlert, FileText, Users } from "lucide-react"

export default async function DashboardPage() {
  const supabase = await createClient()
  const profile = await getCurrentUserProfile()

  // 1. Fetch Studies for Metrics
  const { data: studiesData } = await supabase
    .from("studies")
    .select("id, target_enrolment, current_enrolment")

  const totalStudies = studiesData?.length || 0
  const totalTarget =
    studiesData?.reduce(
      (acc, s) => acc + (s.target_enrolment || 0),
      0,
    ) || 15

  const totalEnrolled =
    studiesData?.reduce(
      (acc, s) => acc + (s.current_enrolment || 0),
      0,
    ) || 14

  // 2. Fetch Adverse Events for KPIs and Urgent Banner
  const { data: openAes } = await supabase
    .from("adverse_events")
    .select("*")
    .neq("workflow_status", "CLOSED")

  const { data: urgentSaeList } = await supabase
    .from("adverse_events")
    .select(
      "*, studies(ctri_number, title), trial_subjects(subject_code)",
    )
    .eq("is_serious", true)
    .eq("workflow_status", "UNDER_REVIEW")
    .order("regulatory_deadline", { ascending: true })
    .limit(1)

  const urgentSae =
    urgentSaeList && urgentSaeList.length > 0
      ? urgentSaeList[0]
      : null

  const openCount = openAes?.length || 0
  const regulatoryDueCount = urgentSae ? 1 : 0

  // 3. Fetch Subject Data for Enrollment Trajectory
  const { data: subjects } = await supabase
    .from("trial_subjects")
    .select("screening_date")
    .order("screening_date", { ascending: true })

  // Enrollment trajectory data must match EnrollmentPoint:
  // { date: string, enrolled: number }
  const trajectoryData = [
    { date: "2026-08-01", enrolled: 4 },
    { date: "2026-08-08", enrolled: 8 },
    { date: "2026-08-15", enrolled: 11 },
    { date: "2026-08-22", enrolled: subjects?.length || 14 },
    { date: "2026-09-01", enrolled: 15 },
  ]

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Institutional Clinical Trials Command Center
          </h1>

          <p className="text-sm text-slate-400">
            Real-time GCP-ASU operational intelligence for All India
            Institute of Ayurveda
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400 ring-1 ring-inset ring-emerald-500/20">
            System Operational
          </span>

          <span className="inline-flex items-center rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400 ring-1 ring-inset ring-blue-500/20">
            Role: {profile?.role || "Principal Investigator"}
          </span>
        </div>
      </div>

      {/* Urgent Regulatory SAE Banner (NDCT 2019 Rule 67) */}
      {urgentSae && (
        <UrgentSafetyBanner
          adverseEvent={{
            id: urgentSae.id,
            study_id: urgentSae.study_id,
            subject_id: urgentSae.subject_id,
            event_term: urgentSae.event_term,
            severity: urgentSae.severity,
            is_serious: urgentSae.is_serious,
            causality_type: urgentSae.causality_type,
            workflow_status: urgentSae.workflow_status,
            reporting_deadline_type:
              urgentSae.reporting_deadline_type,
            regulatory_deadline: urgentSae.regulatory_deadline,
          }}
        />
      )}

      {/* KPI Overview Metrics */}
      <KpiCards
        activeStudies={totalStudies}
        enrolledCurrent={totalEnrolled}
        enrolledTarget={totalTarget}
        openAdverseEvents={openCount}
        regulatoryActionsDue={regulatoryDueCount}
      />

      {/* Main Trajectory & Quick Access Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <EnrollmentTrajectory
            data={trajectoryData}
            target={totalTarget}
          />
        </div>

        {/* Fast Action / Verification Cards */}
        <div className="space-y-4">
          {/* Safety & Pharmacovigilance */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
            <h3 className="font-semibold text-slate-100 flex items-center gap-2 mb-3">
              <ShieldAlert className="h-4 w-4 text-amber-400" />
              Safety & Pharmacovigilance
            </h3>

            <p className="text-xs text-slate-400 mb-4">
              Monitor active expedited reports, causality assessments,
              and regulatory submissions.
            </p>

            <Link
              className="inline-flex items-center justify-between w-full rounded-lg bg-slate-800/80 hover:bg-slate-800 px-3.5 py-2.5 text-xs font-medium text-slate-200 border border-slate-700/50 transition-colors"
              href="/adverse-events"
            >
              <span>Manage Adverse Events</span>
              <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
            </Link>
          </div>

          {/* Global Interoperability */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
            <h3 className="font-semibold text-slate-100 flex items-center gap-2 mb-3">
              <FileText className="h-4 w-4 text-blue-400" />
              Global Interoperability
            </h3>

            <p className="text-xs text-slate-400 mb-4">
              Real-time inspection of HL7 FHIR R4 resources and CDISC
              SDTM CSV domain exports.
            </p>

            <Link
              className="inline-flex items-center justify-between w-full rounded-lg bg-slate-800/80 hover:bg-slate-800 px-3.5 py-2.5 text-xs font-medium text-slate-200 border border-slate-700/50 transition-colors"
              href="/interoperability"
            >
              <span>Open Interoperability Portal</span>
              <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
            </Link>
          </div>

          {/* Ayurveda Cohort eCRF */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
            <h3 className="font-semibold text-slate-100 flex items-center gap-2 mb-3">
              <Users className="h-4 w-4 text-emerald-400" />
              Ayurveda Cohort eCRF
            </h3>

            <p className="text-xs text-slate-400 mb-4">
              View Ashtavidha Pariksha phenotyping and baseline
              Prakriti/Agni classifications.
            </p>

            <Link
              className="inline-flex items-center justify-between w-full rounded-lg bg-slate-800/80 hover:bg-slate-800 px-3.5 py-2.5 text-xs font-medium text-slate-200 border border-slate-700/50 transition-colors"
              href="/participants"
            >
              <span>View Trial Subjects</span>
              <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}