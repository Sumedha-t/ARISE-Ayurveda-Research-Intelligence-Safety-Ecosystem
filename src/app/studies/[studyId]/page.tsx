"use client";

import { notFound, useParams } from "next/navigation";
import { useRequireSession } from "@/lib/useRequireSession";
import { TopBar } from "@/components/TopBar";
import { StudyTabs } from "@/components/StudyTabs";
import { getStudy, type ChecklistItem } from "@/lib/data";
import { InteroperabilityPanel } from "@/components/InteroperabilityPanel";

export default function StudyOverviewPage() {
  const session = useRequireSession();
  const params = useParams<{ studyId: string }>();
  const study = getStudy(params.studyId);

  if (!session) return null;
  if (!study) return notFound();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <TopBar role={session.role} />
      <StudyTabs studyId={study.id} studyName={study.name} />

      <main className="flex-1 max-w-6xl mx-auto w-full p-6 space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <SummaryStat label="Status" value={study.studyStatus} />
          <SummaryStat label="Duration" value={study.duration} />
          <SummaryStat label="Enrollment" value={`${study.enrollment.current} / ${study.enrollment.target}`} />
          <SummaryStat label="Sites" value={String(study.sites)} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Panel title="Study Information">
            <Row label="Phase" value={study.phase} />
            <Row label="Design" value={study.design} />
            <Row label="Sponsor" value={study.sponsor} />
            <Row label="CTRI" value={study.ctri} mono />
          </Panel>

          <Panel title="Ayurveda Framework">
            <Checklist items={study.ayurvedaFramework} />
          </Panel>

          <Panel title="Outcomes">
            <Row label="Primary" value={study.primaryOutcome} />
            <Row label="Secondary" value={study.secondaryOutcome} />
          </Panel>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Panel title="Regulatory & Ethics">
            <Checklist items={study.regulatoryEthics} />
          </Panel>

          <Panel title="Intervention Framework">
            <Checklist items={study.interventionFramework} />
          </Panel>

          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Enrollment Readiness</h3>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-emerald-600 h-2.5 rounded-full"
                style={{ width: `${study.enrollmentReadiness.percent}%` }}
              />
            </div>
            <p className="text-xs font-semibold text-slate-700 mt-2">
              {study.enrollmentReadiness.percent}%{" "}
              {study.enrollmentReadiness.percent >= 90 ? (
                <span className="text-emerald-700">READY FOR ENROLLMENT</span>
              ) : (
                <span className="text-amber-700">NOT YET READY</span>
              )}
            </p>

            {study.enrollmentReadiness.missing.length > 0 && (
              <div className="mt-3">
                <p className="text-[11px] font-semibold text-slate-500 uppercase mb-1.5">Missing</p>
                <ul className="space-y-1">
                  {study.enrollmentReadiness.missing.map((item) => (
                    <li key={item} className="text-xs text-amber-700 font-medium flex items-center gap-1.5">
                      <span>⚠</span> {item}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  className="mt-3 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-md transition"
                  onClick={() => alert("Resolve workflow is not wired up in this demo yet.")}
                >
                  Resolve
                </button>
              </div>
            )}
          </div>
        </div>

        <InteroperabilityPanel studyId={study.id} />
      </main>
    </div>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <p className="text-[11px] font-semibold text-slate-500 uppercase">{label}</p>
      <p className="text-base font-bold text-slate-900 mt-1">{value}</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <h3 className="text-sm font-bold text-slate-900 mb-3">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-slate-500">{label}</span>
      <span className={`font-semibold text-slate-800 ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}

function Checklist({ items }: { items: ChecklistItem[] }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item) => (
        <li key={item.label} className="flex items-start gap-2 text-xs">
          <span className={item.done ? "text-emerald-600" : "text-amber-500"}>
            {item.done ? "✓" : "⚠"}
          </span>
          <span className={item.done ? "text-slate-700" : "text-amber-700 font-medium"}>
            {item.label}
            {item.note ? ` — ${item.note}` : ""}
          </span>
        </li>
      ))}
    </ul>
  );
}
