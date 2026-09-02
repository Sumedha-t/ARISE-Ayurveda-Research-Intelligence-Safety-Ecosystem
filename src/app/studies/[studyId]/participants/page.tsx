"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useRequireSession } from "@/lib/useRequireSession";
import { TopBar } from "@/components/TopBar";
import { StudyTabs } from "@/components/StudyTabs";
import { getStudy } from "@/lib/data";

const STATUS_STYLES: Record<string, string> = {
  Active: "bg-emerald-50 text-emerald-800 border-emerald-200",
  "Follow-up": "bg-blue-50 text-blue-800 border-blue-200",
  Screening: "bg-slate-100 text-slate-700 border-slate-200",
  Withdrawn: "bg-red-50 text-red-700 border-red-200",
};

export default function ParticipantsPage() {
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
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Participants</h2>
          <span className="text-sm text-slate-500">
            {study.enrollment.current} / {study.enrollment.target} enrolled
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          {study.participants.length === 0 ? (
            <p className="p-6 text-sm text-slate-500">
              No participants enrolled yet — enrollment is blocked pending readiness items.
            </p>
          ) : (
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase">
                  <th className="px-5 py-3 font-semibold">ID</th>
                  <th className="px-5 py-3 font-semibold">Prakriti</th>
                  <th className="px-5 py-3 font-semibold">Condition</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold text-right">&nbsp;</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {study.participants.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition">
                    <td className="px-5 py-3.5 font-mono text-xs font-bold text-emerald-700">{p.id}</td>
                    <td className="px-5 py-3.5 text-xs text-slate-700">{p.prakriti}</td>
                    <td className="px-5 py-3.5 text-xs text-slate-700">{p.condition}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${STATUS_STYLES[p.status]}`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        href={`/studies/${study.id}/participants/${p.id}`}
                        className="text-xs bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-md font-medium transition"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
