"use client";

import { notFound, useParams } from "next/navigation";
import { useRequireSession } from "@/lib/useRequireSession";
import { TopBar } from "@/components/TopBar";
import { StudyTabs } from "@/components/StudyTabs";
import { getStudy } from "@/lib/data";
import { RegulatoryCountdown } from "@/components/RegulatoryCountdown";

export default function SafetyPage() {
  const session = useRequireSession();
  const params = useParams<{ studyId: string }>();
  const study = getStudy(params.studyId);

  if (!session) return null;
  if (!study) return notFound();

  const { safety } = study;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <TopBar role={session.role} />
      <StudyTabs studyId={study.id} studyName={study.name} />

      <main className="flex-1 max-w-6xl mx-auto w-full p-6 space-y-6">
        <h2 className="text-base font-bold text-slate-900">Safety Center</h2>

        <div className="grid grid-cols-3 gap-4">
          <Stat label="Open AE" value={safety.openAE} />
          <Stat label="Open SAE" value={safety.openSAE} tone="critical" />
          <Stat label="Overdue Reports" value={safety.overdueReports} tone={safety.overdueReports > 0 ? "warn" : undefined} />
        </div>

        {safety.cases.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {safety.cases.map((c) => (
              <div key={c.id} className="bg-white border border-slate-200 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-sm font-bold text-slate-900">{c.id}</span>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded uppercase ${
                      c.kind === "SAE" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {c.kind}
                  </span>
                </div>
                <dl className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Participant</dt>
                    <dd className="font-semibold text-slate-800">{c.participantId}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Severity</dt>
                    <dd className="font-semibold text-slate-800">{c.severity}</dd>
                  </div>
                  {c.causality && (
                    <div className="flex justify-between gap-3">
                      <dt className="text-slate-500 shrink-0">Causality</dt>
                      <dd className="font-semibold text-slate-800 text-right">{c.causality}</dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Status</dt>
                    <dd className="font-semibold text-slate-800">{c.status}</dd>
                  </div>
                </dl>
                {c.deadlineISO && (
                  <div className="mt-3 pt-3 border-t border-slate-100 flex justify-end">
                    <RegulatoryCountdown studyId={study.id} caseId={c.id} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-3">Safety Reporting Status</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xl font-extrabold text-emerald-700">{safety.reportingStatus.onTime}</p>
              <p className="text-[11px] text-slate-500 uppercase font-semibold mt-1">Submitted On Time</p>
            </div>
            <div>
              <p className="text-xl font-extrabold text-amber-600">{safety.reportingStatus.dueSoon}</p>
              <p className="text-[11px] text-slate-500 uppercase font-semibold mt-1">Due Soon</p>
            </div>
            <div>
              <p className="text-xl font-extrabold text-red-600">{safety.reportingStatus.overdue}</p>
              <p className="text-[11px] text-slate-500 uppercase font-semibold mt-1">Overdue</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: "critical" | "warn" }) {
  const color = tone === "critical" ? "text-red-600" : tone === "warn" ? "text-amber-600" : "text-slate-900";
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 text-center">
      <p className={`text-2xl font-extrabold ${color}`}>{value}</p>
      <p className="text-[11px] text-slate-500 uppercase font-semibold mt-1">{label}</p>
    </div>
  );
}
