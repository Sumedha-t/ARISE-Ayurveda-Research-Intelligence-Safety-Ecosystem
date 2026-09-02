"use client";

import { notFound, useParams } from "next/navigation";
import { useRequireSession } from "@/lib/useRequireSession";
import { TopBar } from "@/components/TopBar";
import { StudyTabs } from "@/components/StudyTabs";
import { getStudy } from "@/lib/data";
import { AuditImmutabilityTest } from "@/components/AuditImmutabilityTest";

export default function AuditTrailPage() {
  const session = useRequireSession();
  const params = useParams<{ studyId: string }>();
  const study = getStudy(params.studyId);

  if (!session) return null;
  if (!study) return notFound();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <TopBar role={session.role} />
      <StudyTabs studyId={study.id} studyName={study.name} />

      <main className="flex-1 max-w-6xl mx-auto w-full p-6 space-y-4">
        <h2 className="text-base font-bold text-slate-900">Audit Trail</h2>

        <div className="bg-white border border-slate-200 rounded-xl p-6">
          {study.audit.length === 0 ? (
            <p className="text-sm text-slate-500">No activity has been logged for this study yet.</p>
          ) : (
            <ol className="relative border-l border-slate-200 pl-5 space-y-5">
              {study.audit.map((entry, i) => (
                <li key={i}>
                  <span className="absolute -left-[5px] mt-1.5 w-2.5 h-2.5 rounded-full bg-emerald-600 border-2 border-white" />
                  <p className="text-xs font-mono font-bold text-slate-500">{entry.time}</p>
                  <p className="text-sm text-slate-800 mt-0.5">{entry.text}</p>
                </li>
              ))}
            </ol>
          )}
        </div>

        <AuditImmutabilityTest studyId={study.id} />
      </main>
    </div>
  );
}
