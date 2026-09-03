import { BookOpenCheck, Users, AlertTriangle, ShieldAlert } from "lucide-react";

export type KpiCardsProps = {
  /** COUNT(studies) WHERE status = 'ACTIVE' (or equivalent). */
  activeStudies: number;
  /** SUM(trial_subjects.*) currently enrolled across active studies. */
  enrolledCurrent: number;
  /** SUM(studies.target_enrolment) across active studies. */
  enrolledTarget: number;
  /** COUNT(adverse_events) WHERE workflow_status <> 'CLOSED'. */
  openAdverseEvents: number;
  /**
   * COUNT(adverse_events) with a regulatory_deadline that is not yet
   * REGULATORY_REPORT_SUBMITTED / CLOSED — i.e. still needs regulator
   * action before its deadline.
   */
  regulatoryActionsDue: number;
};

type KpiCardDef = {
  label: string;
  value: string;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: "default" | "warn";
};

export function KpiCards(props: KpiCardsProps) {
  const {
    activeStudies,
    enrolledCurrent,
    enrolledTarget,
    openAdverseEvents,
    regulatoryActionsDue,
  } = props;

  const cards: KpiCardDef[] = [
    {
      label: "Active Studies",
      value: String(activeStudies),
      icon: BookOpenCheck,
      tone: "default",
    },
    {
      label: "Participants Enrolled",
      value: `${enrolledCurrent} / ${enrolledTarget}`,
      hint:
        enrolledTarget > 0
          ? `${Math.round((enrolledCurrent / enrolledTarget) * 100)}% of target`
          : undefined,
      icon: Users,
      tone: "default",
    },
    {
      label: "Open Adverse Events",
      value: String(openAdverseEvents),
      icon: AlertTriangle,
      tone: openAdverseEvents > 0 ? "warn" : "default",
    },
    {
      label: "Regulatory Actions Due",
      value: String(regulatoryActionsDue),
      icon: ShieldAlert,
      tone: regulatoryActionsDue > 0 ? "warn" : "default",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-xl border border-slate-800 bg-slate-900/60 p-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {card.label}
            </span>
            <card.icon
              className={`h-4 w-4 ${
                card.tone === "warn" ? "text-amber-400" : "text-emerald-400"
              }`}
            />
          </div>
          <p
            className={`mt-2 text-2xl font-bold ${
              card.tone === "warn" ? "text-amber-400" : "text-slate-100"
            }`}
          >
            {card.value}
          </p>
          {card.hint && (
            <p className="mt-1 text-xs text-slate-500">{card.hint}</p>
          )}
        </div>
      ))}
    </div>
  );
}

export default KpiCards;
