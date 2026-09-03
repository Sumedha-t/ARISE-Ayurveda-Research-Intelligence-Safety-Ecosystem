"use client"

import { FolderKanban, Users, AlertTriangle, ShieldCheck } from "lucide-react"

interface KpiCardsProps {
  activeStudies: number
  enrolledCurrent: number
  enrolledTarget: number
  openAdverseEvents: number
  regulatoryActionsDue: number
}

export function KpiCards({
  activeStudies,
  enrolledCurrent,
  enrolledTarget,
  openAdverseEvents,
  regulatoryActionsDue,
}: KpiCardsProps) {
  const percent = enrolledTarget > 0 ? Math.round((enrolledCurrent / enrolledTarget) * 100) : 0

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Active Studies */}
      <div className="rounded-xl border border-[#E5DFD3] bg-[#FCFAF7] p-5 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#6B6355]">
            Active Studies
          </span>
          <FolderKanban className="h-4 w-4 text-[#2D5A27]" />
        </div>
        <div className="mt-3 text-3xl font-bold text-[#25231F]">{activeStudies}</div>
        <p className="mt-1 text-[11px] text-[#6B6355]">All India Institute of Ayurveda</p>
      </div>

      {/* Participants Enrolled */}
      <div className="rounded-xl border border-[#E5DFD3] bg-[#FCFAF7] p-5 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#6B6355]">
            Participants Enrolled
          </span>
          <Users className="h-4 w-4 text-[#2D5A27]" />
        </div>
        <div className="mt-3 text-3xl font-bold text-[#25231F]">
          {enrolledCurrent} <span className="text-sm font-normal text-[#6B6355]">/ {enrolledTarget}</span>
        </div>
        <p className="mt-1 text-[11px] text-[#2D5A27] font-medium">{percent}% of target capacity</p>
      </div>

      {/* Open Adverse Events */}
      <div className="rounded-xl border border-[#E5DFD3] bg-[#FCFAF7] p-5 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#6B6355]">
            Open Adverse Events
          </span>
          <AlertTriangle className="h-4 w-4 text-[#C87D0E]" />
        </div>
        <div className="mt-3 text-3xl font-bold text-[#C87D0E]">{openAdverseEvents}</div>
        <p className="mt-1 text-[11px] text-[#6B6355]">Active pharmacovigilance</p>
      </div>

      {/* Regulatory Actions Due */}
      <div className="rounded-xl border border-[#E5DFD3] bg-[#FCFAF7] p-5 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#6B6355]">
            Regulatory Actions Due
          </span>
          <ShieldCheck className="h-4 w-4 text-[#2D5A27]" />
        </div>
        <div className="mt-3 text-3xl font-bold text-[#25231F]">{regulatoryActionsDue}</div>
        <p className="mt-1 text-[11px] text-[#2D5A27] font-medium">NDCT Rule 67 compliant</p>
      </div>
    </div>
  )
}

export default KpiCards