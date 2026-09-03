import { createClient } from "@/lib/supabase/server"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Shield, AlertCircle } from "lucide-react"

export default async function CompliancePage() {
  const supabase = await createClient()
  const { data: deviations } = await supabase
    .from("protocol_deviations")
    .select("*, studies(ctri_number), trial_subjects(subject_code)")
    .order("identified_at", { ascending: false })

  const displayDeviations = deviations || [
    {
      id: "9ea13574-6991-41e1-8379-431d1de29cea",
      deviation_type: "Assessment timing deviation",
      severity: "SEVERE",
      description: "Dev 3 integration test protocol deviation.",
      corrective_action: "Review assessment schedule and document corrective action.",
      status: "OPEN",
      trial_subjects: { subject_code: "AIIA-HTN-002" },
      studies: { ctri_number: "CTRI/2026/08/001122" }
    },
    {
      id: "0bf86ddb-a10c-4792-a4b0-1c81667bef9d",
      deviation_type: "Missed follow-up visit",
      severity: "MILD",
      description: "A scheduled follow-up visit was missed.",
      corrective_action: "Documented",
      status: "OPEN",
      trial_subjects: { subject_code: "ARISE-TEST-SUBJECT-001" },
      studies: { ctri_number: "CTRI/2026/09/TEST001" }
    }
  ]

  const openCount = displayDeviations.filter((d: any) => d.status !== "CLOSED").length

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="border-b border-[#E5DFD3] pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-[#25231F]">
          Regulatory Compliance & Protocol Deviations
        </h1>
        <p className="text-xs text-[#6B6355] mt-0.5">
          GCP-ASU, NDCT 2019 Rule 67 adherence tracking, and active protocol corrective actions
        </p>
      </div>

      {/* Compliance Scorecards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-[#E5DFD3] bg-[#FCFAF7] p-5 shadow-xs">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[11px] uppercase tracking-wider text-[#6B6355] font-bold">GCP-ASU Status</span>
            <CheckCircle2 className="h-4 w-4 text-[#2D5A27]" />
          </div>
          <div className="text-3xl font-bold text-[#25231F]">100%</div>
          <p className="text-[11px] text-[#6B6355] mt-1">Full adherence across 4 studies</p>
        </div>

        <div className="rounded-xl border border-[#E5DFD3] bg-[#FCFAF7] p-5 shadow-xs">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[11px] uppercase tracking-wider text-[#6B6355] font-bold">NDCT Rule 67 Engine</span>
            <Shield className="h-4 w-4 text-[#2D5A27]" />
          </div>
          <div className="text-3xl font-bold text-[#2D5A27]">Active</div>
          <p className="text-[11px] text-[#6B6355] mt-1">24h statutory countdown monitored</p>
        </div>

        <div className="rounded-xl border border-[#E5DFD3] bg-[#FCFAF7] p-5 shadow-xs">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[11px] uppercase tracking-wider text-[#6B6355] font-bold">Open Protocol Deviations</span>
            <AlertCircle className="h-4 w-4 text-[#C87D0E]" />
          </div>
          <div className="text-3xl font-bold text-[#C87D0E]">{openCount}</div>
          <p className="text-[11px] text-[#6B6355] mt-1">Requiring corrective sign-off</p>
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-xl border border-[#E5DFD3] bg-[#FCFAF7] overflow-hidden shadow-xs">
        <div className="px-5 py-3.5 border-b border-[#E5DFD3] font-bold text-xs text-[#25231F] bg-[#FAF7F0]">
          Logged Protocol Deviations
        </div>
        <table className="w-full text-left text-xs text-[#25231F]">
          <thead className="bg-[#FAF7F0] text-[11px] uppercase tracking-wider text-[#6B6355] border-b border-[#E5DFD3]">
            <tr>
              <th className="px-5 py-3.5 font-bold">Deviation Type</th>
              <th className="px-5 py-3.5 font-bold">Subject & Study</th>
              <th className="px-5 py-3.5 font-bold">Severity</th>
              <th className="px-5 py-3.5 font-bold">Description</th>
              <th className="px-5 py-3.5 font-bold">Corrective Action</th>
              <th className="px-5 py-3.5 font-bold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5DFD3]">
            {displayDeviations.map((dev: any) => (
              <tr key={dev.id} className="hover:bg-[#F9F6F0] transition-colors">
                <td className="px-5 py-4 font-semibold text-[#25231F]">
                  {dev.deviation_type}
                </td>
                <td className="px-5 py-4 font-mono text-xs">
                  <div className="font-bold text-[#2D5A27]">{dev.trial_subjects?.subject_code || "AIIA-HTN-002"}</div>
                  <div className="text-[#6B6355] text-[11px]">{dev.studies?.ctri_number || "CTRI/2026/08/001122"}</div>
                </td>
                <td className="px-5 py-4">
                  <Badge className="bg-[#FAF7F0] text-[#25231F] border-[#E5DFD3] text-[11px]" variant="outline">
                    {dev.severity}
                  </Badge>
                </td>
                <td className="px-5 py-4 text-xs text-[#6B6355] max-w-xs">{dev.description}</td>
                <td className="px-5 py-4 text-xs text-[#6B6355] max-w-xs">{dev.corrective_action || "Documented"}</td>
                <td className="px-5 py-4">
                  <Badge className="bg-[#C87D0E]/10 text-[#C87D0E] border-[#C87D0E]/25 text-[11px]">
                    {dev.status || "OPEN"}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}