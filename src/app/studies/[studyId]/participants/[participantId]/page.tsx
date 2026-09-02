"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useRequireSession } from "@/lib/useRequireSession";
import { TopBar } from "@/components/TopBar";
import { getParticipant, getStudy } from "@/lib/data";
import { AshtavidhaCard } from "@/components/AshtavidhaCard";

export default function ParticipantDetailPage() {
  const session = useRequireSession();
  const params = useParams<{ studyId: string; participantId: string }>();
  const study = getStudy(params.studyId);
  const participant = getParticipant(params.studyId, params.participantId);

  if (!session) return null;
  if (!study || !participant) return notFound();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <TopBar role={session.role} />

      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <Link
              href={`/studies/${study.id}/participants`}
              className="text-xs font-semibold text-slate-500 hover:text-emerald-700 transition"
            >
              ← Participants
            </Link>
            <div className="h-4 w-px bg-slate-200" />
            <div>
              <h1 className="text-base font-bold text-slate-900 leading-none">
                Participant {participant.id}
              </h1>
              <p className="text-xs text-slate-500 mt-1">{study.id} · {study.name}</p>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-6xl mx-auto w-full p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card title="Consent">
            <p className={`text-sm font-bold ${participant.consentComplete ? "text-emerald-700" : "text-amber-700"}`}>
              {participant.consentComplete ? "✓ Complete" : "Pending"}
            </p>
          </Card>

          <Card title="Biomedical Assessment">
            <div className="space-y-1">
              {participant.biomedical.map((b) => (
                <div key={b.label} className="flex justify-between text-xs">
                  <span className="text-slate-500">{b.label}</span>
                  <span className="font-semibold text-slate-800">{b.value}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Visit Timeline">
            <ul className="space-y-1">
              {participant.visitTimeline.map((v) => (
                <li key={v.label} className="text-xs flex items-center gap-1.5">
                  <span className={v.done ? "text-emerald-600" : "text-slate-300"}>
                    {v.done ? "✓" : "○"}
                  </span>
                  <span className={v.done ? "text-slate-700" : "text-slate-400"}>{v.label}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card title="Follow-Up Outcomes">
            <p className="text-xs text-slate-500">{participant.followUp.day}</p>
            <div className="flex justify-between text-xs mt-1.5">
              <span className="text-slate-500">Improvement</span>
              <span className="font-semibold text-slate-800">{participant.followUp.improvement}</span>
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span className="text-slate-500">Adherence</span>
              <span className="font-semibold text-slate-800">{participant.followUp.adherence}</span>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card title="Ayurveda Assessment">
            <Row label="Prakriti" value={participant.prakriti} />
            <Row label="Dosha" value={participant.dosha} />
            <Row label="Agni" value={participant.agni} />
            <Row label="Koshtha" value={participant.koshtha} />
            <Row label="Bala" value={participant.bala} />
          </Card>

          <Card title="Intervention">
            <Row label="Medicine" value={participant.intervention.medicine} />
            <Row label="Dose" value={participant.intervention.dose} />
            <Row label="Duration" value={participant.intervention.duration} />
            <Row label="Anupana" value={participant.intervention.anupana} />
            <Row label="Kala" value={participant.intervention.kala} />
          </Card>
        </div>

        <AshtavidhaCard data={participant.ashtavidhaPariksha} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <OutcomeTable title="Ayurveda Outcomes" rows={participant.ayurvedaOutcomes} />
          <OutcomeTable title="Biomedical Outcomes" rows={participant.biomedicalOutcomes} />
        </div>
      </main>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <p className="text-[11px] font-semibold text-slate-500 uppercase mb-2">{title}</p>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-xs py-0.5">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold text-slate-800">{value}</span>
    </div>
  );
}

function OutcomeTable({
  title,
  rows,
}: {
  title: string;
  rows: { metric: string; day0: string; day30: string; day60: string }[];
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <h3 className="text-sm font-bold text-slate-900 mb-3">{title}</h3>
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="text-slate-500 uppercase text-[10px] border-b border-slate-200">
            <th className="pb-2 font-semibold">Metric</th>
            <th className="pb-2 font-semibold">Day 0</th>
            <th className="pb-2 font-semibold">Day 30</th>
            <th className="pb-2 font-semibold">Day 60</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((r) => (
            <tr key={r.metric}>
              <td className="py-2 font-semibold text-slate-700">{r.metric}</td>
              <td className="py-2 text-slate-600">{r.day0}</td>
              <td className="py-2 text-slate-600">{r.day30}</td>
              <td className="py-2 text-slate-600">{r.day60}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
