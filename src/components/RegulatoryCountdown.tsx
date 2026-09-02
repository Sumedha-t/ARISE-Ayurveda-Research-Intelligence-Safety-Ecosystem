"use client";

import { useEffect, useState } from "react";

type CountdownResponse = {
  hasDeadline: boolean;
  remainingMs?: number;
  isOverdue?: boolean;
  regulatoryBasis?: string;
};

function formatDuration(ms: number): string {
  const abs = Math.abs(ms);
  const totalMinutes = Math.floor(abs / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  return `${hours}h ${minutes}m`;
}

// Polls the real server-side countdown API (src/app/api/studies/[studyId]/safety/[caseId]/countdown)
// every 30s and ticks the displayed value every second locally in between —
// the deadline math itself always comes from the server, never hardcoded here.
export function RegulatoryCountdown({ studyId, caseId }: { studyId: string; caseId: string }) {
  const [data, setData] = useState<CountdownResponse | null>(null);
  const [error, setError] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function fetchCountdown() {
      try {
        const res = await fetch(`/api/studies/${studyId}/safety/${caseId}/countdown`);
        if (!res.ok) throw new Error("countdown fetch failed");
        const json = (await res.json()) as CountdownResponse;
        if (!cancelled) {
          setData(json);
          setError(false);
        }
      } catch {
        if (!cancelled) setError(true);
      }
    }

    fetchCountdown();
    const poll = setInterval(fetchCountdown, 30_000);
    const localTick = setInterval(() => setTick((t: number) => t + 1), 1000);

    return () => {
      cancelled = true;
      clearInterval(poll);
      clearInterval(localTick);
    };
  }, [studyId, caseId]);

  if (error) {
    return <span className="text-[11px] font-semibold text-slate-400">Countdown unavailable</span>;
  }

  if (!data || !data.hasDeadline || data.remainingMs === undefined) {
    return null;
  }

  // Adjust the last-fetched remainingMs by elapsed local ticks so the
  // display counts down smoothly between 30s server polls.
  const adjustedMs = data.remainingMs - tick * 1000;
  const overdue = adjustedMs < 0;

  return (
    <span
      className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
        overdue
          ? "bg-red-50 text-red-700 border-red-200"
          : adjustedMs < 24 * 3600 * 1000
          ? "bg-amber-50 text-amber-800 border-amber-200"
          : "bg-slate-50 text-slate-600 border-slate-200"
      }`}
      title={data.regulatoryBasis}
    >
      {overdue ? "🔴 " : "⏱ "}
      {overdue ? `Overdue by ${formatDuration(adjustedMs)}` : `Due in ${formatDuration(adjustedMs)}`}
    </span>
  );
}
