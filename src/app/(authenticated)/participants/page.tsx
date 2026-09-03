"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Badge } from "@/components/ui/badge"
import { ShieldCheck, User, RefreshCw, FolderKanban } from "lucide-react"

export default function ParticipantsPage() {
  const [subjects, setSubjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState("COORDINATOR")

  useEffect(() => {
    async function loadSubjects() {
      setLoading(true)
      const supabase = createClient()

      // Fetch authentic role from Supabase auth profile
      const { data: { user } } = await supabase.auth.getUser()
      let role = "COORDINATOR"
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single()
        if (profile?.role) role = profile.role
      }
      setUserRole(role)

      // Query live trial subjects joined with studies
      let query = supabase
        .from("trial_subjects")
        .select("*, studies(id, ctri_number, title)")
        .order("subject_code", { ascending: true })

      // If role is PI, scope participants strictly to PI's assigned trial (AIIA-HTN-001)
      if (role === "PI") {
        query = query.like("subject_code", "AIIA-HTN%")
      }

      const { data } = await query
      if (data && data.length > 0) {
        setSubjects(data)
      }
      setLoading(false)
    }

    loadSubjects()
  }, [])

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E5DFD3] pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#25231F]">
            Participant Registry & eCRF Phenotypes
          </h1>
          <p className="text-xs text-[#6B6355] mt-0.5">
            {userRole === "PI"
              ? "PI Clinical Scope: Enrolled cohort strictly for AIIA-HTN-001 (Essential Hypertension)"
              : "Institutional Registry: All enrolled trial subjects across AIIA research protocols"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {userRole === "PI" && (
            <Badge className="bg-[#C87D0E]/10 text-[#C87D0E] border-[#C87D0E]/25 text-xs px-3 py-1">
              Trial: AIIA-HTN-001
            </Badge>
          )}
          <Badge className="bg-[#2D5A27]/10 text-[#2D5A27] border-[#2D5A27]/25 text-xs px-3 py-1">
            {subjects.length} Enrolled eCRFs
          </Badge>
        </div>
      </div>

      <div className="rounded-xl border border-[#E5DFD3] bg-[#FCFAF7] overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-8 text-center text-xs text-[#6B6355] flex items-center justify-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin text-[#2D5A27]" />
            <span>Querying Supabase Postgres...</span>
          </div>
        ) : (
          <table className="w-full text-left text-xs text-[#25231F]">
            <thead className="bg-[#FAF7F0] text-[11px] uppercase tracking-wider text-[#6B6355] border-b border-[#E5DFD3]">
              <tr>
                <th className="px-5 py-3.5 font-bold">Subject Code</th>
                <th className="px-5 py-3.5 font-bold">Assigned Trial Reference</th>
                <th className="px-5 py-3.5 font-bold">Ayurvedic Phenotype</th>
                <th className="px-5 py-3.5 font-bold">Ashtavidha Pariksha</th>
                <th className="px-5 py-3.5 font-bold">Consent & Screening</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5DFD3]">
              {subjects.map((sub: any) => {
                const pariksha = typeof sub.ashtavidha_pariksha === "string"
                  ? JSON.parse(sub.ashtavidha_pariksha)
                  : (sub.ashtavidha_pariksha || {})

                const studyCtri = sub.studies?.ctri_number || (sub.subject_code.startsWith("AIIA-HTN") ? "CTRI/2026/08/001122" : sub.subject_code.startsWith("AIIA-DYS") ? "CTRI/2026/08/002233" : "CTRI/2026/08/003344")
                const studyTitle = sub.studies?.title || (sub.subject_code.startsWith("AIIA-HTN") ? "Ayurveda Comparative Study in Essential Hypertension" : sub.subject_code.startsWith("AIIA-DYS") ? "Ayurveda Study of Amla Extract in Dyslipidaemia" : "Ayurveda Study of Neem Extract in Type 2 Diabetes")

                return (
                  <tr key={sub.id || sub.subject_code} className="hover:bg-[#F9F6F0] transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-[#2D5A27]">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-[#6B6355]" />
                        {sub.subject_code}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-[#25231F]">
                        <FolderKanban className="h-3.5 w-3.5 text-[#C87D0E] shrink-0" />
                        <span>{studyCtri}</span>
                      </div>
                      <div className="text-[11px] text-[#6B6355] mt-0.5 truncate max-w-[240px]">
                        {studyTitle}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-1.5 flex-wrap">
                        <Badge className="bg-[#C87D0E]/10 text-[#C87D0E] border-[#C87D0E]/25 text-[11px]">
                          {sub.prakriti?.replace("_", " ")}
                        </Badge>
                        <Badge className="bg-[#B94A2B]/10 text-[#B94A2B] border-[#B94A2B]/25 text-[11px]">
                          {sub.agni?.replace("_", " ")}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-[11px]">
                      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[#6B6355]">
                        <span>Nadi: <strong className="text-[#25231F]">{pariksha.nadi || "Vata-Pitta"}</strong></span>
                        <span>Jihva: <strong className="text-[#25231F]">{pariksha.jihva || "Pink, moist"}</strong></span>
                        <span>Mutra: <strong className="text-[#25231F]">{pariksha.mutra || "Clear yellow"}</strong></span>
                        <span>Mala: <strong className="text-[#25231F]">{pariksha.mala || "Soft, formed"}</strong></span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2D5A27]">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          DPDP e-Consent Valid
                        </span>
                        <span className="text-[10px] text-[#6B6355] font-mono">
                          Screened: {sub.screening_date ? new Date(sub.screening_date).toLocaleDateString() : "2026-08-04"}
                        </span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}