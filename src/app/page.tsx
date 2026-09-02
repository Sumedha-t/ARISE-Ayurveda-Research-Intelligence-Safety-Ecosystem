"use client";

import Link from "next/link";
import { useRequireSession } from "@/lib/useRequireSession";
import { TopBar } from "@/components/TopBar";
import { PORTFOLIO_KPIS, PRIORITY_ACTIONS, STUDIES } from "@/lib/data";

const STATUS_STYLES: Record<string, string> = {
  ok: "bg-emerald-50 text-emerald-800 border-emerald-200",
  warn: "bg-amber-50 text-amber-800 border-amber-200",
  blocked: "bg-red-50 text-red-700 border-red-200",
};

export default function PortfolioPage() {
  const session = useRequireSession();
  if (!session) return null;

  const { activeStudies, safetyAlerts, regulatoryActionsDue, portfolioReadiness, participantsEnrolled, protocolDeviations } =
    PORTFOLIO_KPIS;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <TopBar role={session.role} />

      <main className="flex-1 p-6 max-w-6xl mx-auto w-full space-y-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            AIIA Research Command Center
          </h2>
          <p className="text-sm text-slate-500">Portfolio view across all active studies</p>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <Kpi label="Active Studies" value={activeStudies} />
          <Kpi label="Safety Alerts" value={safetyAlerts} tone="warn" />
          <Kpi label="Regulatory Actions Due" value={regulatoryActionsDue} tone="warn" />
          <Kpi label="Portfolio Readiness" value={`${portfolioReadiness}%`} />
          <Kpi
            label="Participants Enrolled"
            value={`${participantsEnrolled.current} / ${participantsEnrolled.target}`}
          />
          <Kpi label="Protocol Deviations" value={protocolDeviations} tone="warn" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Studies table */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-base font-bold text-slate-900 mb-4">Studies</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase">
                    <th className="pb-3 font-semibold">Study</th>
                    <th className="pb-3 font-semibold">Type</th>
                    <th className="pb-3 font-semibold">Readiness</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold text-right">&nbsp;</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {STUDIES.map((study) => (
                    <tr key={study.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 pr-3">
                        <div className="font-mono text-xs font-bold text-emerald-700">{study.id}</div>
                        <div className="text-xs text-slate-500 max-w-[220px] truncate">{study.name}</div>
                      </td>
                      <td className="py-3.5 text-xs text-slate-600">{study.type}</td>
                      <td className="py-3.5 text-xs text-slate-700 font-semibold">{study.readiness}%</td>
                      <td className="py-3.5">
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${STATUS_STYLES[study.statusTone]}`}
                        >
                          {study.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <Link
                          href={`/studies/${study.id}`}
                          className="text-xs bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-md font-medium transition"
                        >
                          Open
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Priority actions */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col gap-3">
            <h3 className="text-base font-bold text-slate-900">Priority Actions</h3>
            {PRIORITY_ACTIONS.map((action, i) => (
              <Link
                key={i}
                href={`/studies/${action.studyId}`}
                className="p-3.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition flex items-start gap-3"
              >
                <span
                  className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                    action.tone === "critical" ? "bg-red-600" : "bg-amber-500"
                  }`}
                />
                <div>
                  <p className="text-xs font-mono font-bold text-slate-500">{action.studyId}</p>
                  <p className="text-sm font-semibold text-slate-900">{action.title}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

function Kpi({
  label,
  value,
  tone,
}: {
  label: string;
  value: string | number;
  tone?: "warn";
}) {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">{label}</span>
      <div className={`text-2xl font-extrabold mt-1 ${tone === "warn" ? "text-amber-600" : "text-slate-900"}`}>
        {value}
      </div>
    </div>
  );
}
