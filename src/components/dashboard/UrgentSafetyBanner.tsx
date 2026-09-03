"use client";

import { useEffect, useState } from "react";
import { AlertOctagon, ShieldCheck } from "lucide-react";
import {
  evaluateComplianceAlerts,
  type ComplianceAlert,
} from "@/lib/compliance/alerts";

/**
 * Shaped exactly like a row from the real `adverse_events` table (see
 * supabase/migrations/001_initial_schema.sql). Pass this prop straight from
 * a Supabase query once Dev 3's "list active SAEs" GET endpoint exists —
 * no reshaping needed.
 */
export type AdverseEventRow = {
  id: string;
  study_id: string;
  subject_id: string;
  event_term: string;
  severity: "MILD" | "MODERATE" | "SEVERE";
  is_serious: boolean;
  causality_type: string;
  workflow_status: string;
  reporting_deadline_type: "SAE_INITIAL_24H" | "SAE_FOLLOWUP_7D" | "ROUTINE_ANNUAL" | "IEC_RENEWAL" | null;
  regulatory_deadline: string | null;
};

export type UrgentSafetyBannerProps = {
  /**
   * The single most urgent active SAE to surface, or null when there is
   * none. TODO(wiring window): once Dev 3's GET /api/adverse-events (or
   * equivalent list query) exists, pass the row with the soonest
   * regulatory_deadline among is_serious = true AND workflow_status not in
   * ('CLOSED', 'REGULATORY_REPORT_SUBMITTED').
   */
  adverseEvent: AdverseEventRow | null;
};

function getRemaining(deadline: string | null) {
  if (!deadline) return null;
  const t = new Date(deadline).getTime();
  if (Number.isNaN(t)) return null;

  const ms = t - Date.now();
  const overdue = ms <= 0;
  const totalSeconds = Math.max(0, Math.floor(Math.abs(ms) / 1000));

  return {
    overdue,
    hours: Math.floor(totalSeconds / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function alertToneClasses(alerts: ComplianceAlert[]) {
  const hasCritical = alerts.some((a) => a.severity === "CRITICAL");
  return hasCritical
    ? "border-red-500/40 bg-red-950/40"
    : "border-amber-500/40 bg-amber-950/30";
}

export function UrgentSafetyBanner({ adverseEvent }: UrgentSafetyBannerProps) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!adverseEvent) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <ShieldCheck className="h-5 w-5 text-emerald-400" />
        <p className="text-sm text-slate-300">
          No active serious adverse events requiring regulatory action.
        </p>
      </div>
    );
  }

  // Reusing Dev 3's alert evaluator rather than reimplementing the
  // deadline/severity logic here — see the Milestone 4 handoff notes.
  const alerts = evaluateComplianceAlerts(
    {
      isSeriousAdverseEvent: adverseEvent.is_serious,
      regulatoryDeadline: adverseEvent.regulatory_deadline,
    },
    now,
  );

  // Nothing urgent enough to surface (e.g. a non-serious AE, or a serious
  // one already well outside its deadline window) — stay quiet.
  if (alerts.length === 0) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <ShieldCheck className="h-5 w-5 text-emerald-400" />
        <p className="text-sm text-slate-300">
          No active serious adverse events requiring regulatory action.
        </p>
      </div>
    );
  }

  const remaining = getRemaining(adverseEvent.regulatory_deadline);

  return (
    <div className={`rounded-xl border p-4 ${alertToneClasses(alerts)}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <AlertOctagon className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-red-300">
              Serious Adverse Event · NDCT 2019, Rule 67
            </p>
            <p className="mt-1 text-sm font-medium text-slate-100">
              {adverseEvent.event_term} — {adverseEvent.severity.toLowerCase()}, subject{" "}
              <span className="font-mono">{adverseEvent.subject_id}</span>
            </p>
            <ul className="mt-2 space-y-0.5">
              {alerts.map((alert) => (
                <li key={alert.code} className="text-xs text-slate-300">
                  {alert.message}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {remaining && (
          <div className="shrink-0 text-right">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              {remaining.overdue ? "Overdue by" : "Initial report due in"}
            </p>
            <p
              className={`font-mono text-2xl font-bold ${
                remaining.overdue ? "text-red-400" : "text-slate-100"
              }`}
            >
              {pad(remaining.hours)}:{pad(remaining.minutes)}:{pad(remaining.seconds)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default UrgentSafetyBanner;
