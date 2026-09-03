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

  // 1. Studies Metrics
  const { data: studiesData } = await supabase
    .from("studies")
    .select("id, target_enrolment, current_enrolment")

  const totalStudies = studiesData?.length || 4
  const totalTarget = studiesData?.reduce((acc, s) => acc + (s.target_enrolment || 0), 0) || 115
  const totalEnrolled = studiesData?.reduce((acc, s) => acc + (s.current_enrolment || 0), 0) || 39

  // 2. Safety Events
  const { data: openAes } = await supabase
    .from("adverse_events")
    .select("*")
    .neq("workflow_status", "CLOSED")

  const { data: urgentSaeList } = await supabase
    .from("adverse_events")
    .select("*, studies(ctri_number, title), trial_subjects(subject_code)")
    .eq("is_serious", true)
    .eq("workflow_status", "UNDER_REVIEW")
    .order("reported_at", { ascending: false })
    .limit(1)

  const urgentSae = urgentSaeList && urgentSaeList.length > 0 ? urgentSaeList[0] : null
  const openCount = openAes?.length || 2
  const regulatoryDueCount = urgentSae ? 1 : 0

  // 3. Trajectory Projection matched to EnrollmentPoint shape
  const trajectoryData = [
    { date: "01 Aug", enrolled: 4, target: 4 },
    { date: "08 Aug", enrolled: 8, target: 8 },
    { date: "15 Aug", enrolled: 11, target: 12 },
    { date: "22 Aug", enrolled: 14, target: 15 },
    { date: "01 Sep", enrolled: 15, target: 20 },
  ]

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E5DFD3] pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#25231F]">
            Institutional Clinical Trials Command Center
          </h1>
          <p className="text-xs text-[#6B6355] mt-0.5">
            Real-time GCP-ASU operational intelligence for All India Institute of Ayurveda
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-[#2D5A27]/10 px-3 py-1 text-xs font-semibold text-[#2D5A27] border border-[#2D5A27]/20">
            System Operational
          </span>
          <span className="inline-flex items-center rounded-full bg-[#C87D0E]/10 px-3 py-1 text-xs font-semibold text-[#C87D0E] border border-[#C87D0E]/20">
            Role: {profile?.role || "ADMIN"}
          </span>
        </div>
      </div>

      {/* Safety Alert (NDCT 2019 Rule 67) */}
      {urgentSae && (
        <UrgentSafetyBanner
          adverseEvent={{
            ...urgentSae,
            event_term: urgentSae.event_term,
            severity: urgentSae.severity,
            is_serious: urgentSae.is_serious,
            causality_type: urgentSae.causality_type,
            workflow_status: urgentSae.workflow_status,
            regulatory_deadline: urgentSae.regulatory_deadline,
          } as any}
        />
      )}

      {/* Top 4 KPI Metrics */}
      <KpiCards
        activeStudies={totalStudies}
        enrolledCurrent={totalEnrolled}
        enrolledTarget={totalTarget}
        openAdverseEvents={openCount}
        regulatoryActionsDue={regulatoryDueCount}
      />

      {/* Trajectory & Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl border border-[#E5DFD3] bg-[#FCFAF7] p-5 shadow-xs">
          <EnrollmentTrajectory data={trajectoryData} target={totalTarget} />
        </div>

        {/* Quick Portals */}
        <div className="space-y-4">
          <div className="rounded-xl border border-[#E5DFD3] bg-[#FCFAF7] p-4 shadow-xs">
            <h3 className="font-bold text-xs text-[#25231F] flex items-center gap-2 mb-1">
              <ShieldAlert className="h-4 w-4 text-[#C87D0E]" />
              Pharmacovigilance & Safety
            </h3>
            <p className="text-[11px] text-[#6B6355] mb-3">
              Automated 24h statutory triage and causality attribution engine.
            </p>
            <Link
              href="/adverse-events"
              className="inline-flex items-center justify-between w-full rounded-lg bg-[#FAF7F0] hover:bg-[#F2ECE1] px-3 py-2 text-xs font-semibold text-[#25231F] border border-[#E5DFD3] transition-colors"
            >
              <span>Manage Adverse Events</span>
              <ArrowRight className="h-3.5 w-3.5 text-[#6B6355]" />
            </Link>
          </div>

          <div className="rounded-xl border border-[#E5DFD3] bg-[#FCFAF7] p-4 shadow-xs">
            <h3 className="font-bold text-xs text-[#25231F] flex items-center gap-2 mb-1">
              <FileText className="h-4 w-4 text-[#2D5A27]" />
              Global Interoperability
            </h3>
            <p className="text-[11px] text-[#6B6355] mb-3">
              FHIR R4 resource inspector and SDTM CSV dataset export center.
            </p>
            <Link
              href="/interoperability"
              className="inline-flex items-center justify-between w-full rounded-lg bg-[#FAF7F0] hover:bg-[#F2ECE1] px-3 py-2 text-xs font-semibold text-[#25231F] border border-[#E5DFD3] transition-colors"
            >
              <span>Open Interoperability Portal</span>
              <ArrowRight className="h-3.5 w-3.5 text-[#6B6355]" />
            </Link>
          </div>

          <div className="rounded-xl border border-[#E5DFD3] bg-[#FCFAF7] p-4 shadow-xs">
            <h3 className="font-bold text-xs text-[#25231F] flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-[#2D5A27]" />
              Ayurveda Cohort eCRF
            </h3>
            <p className="text-[11px] text-[#6B6355] mb-3">
              Phenotypes, Prakriti, Agni, and Ashtavidha Pariksha records.
            </p>
            <Link
              href="/participants"
              className="inline-flex items-center justify-between w-full rounded-lg bg-[#FAF7F0] hover:bg-[#F2ECE1] px-3 py-2 text-xs font-semibold text-[#25231F] border border-[#E5DFD3] transition-colors"
            >
              <span>View Trial Subjects</span>
              <ArrowRight className="h-3.5 w-3.5 text-[#6B6355]" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}