import type { ScreeningCriterionRow } from "@/types/subject";

const RESULT_STYLES: Record<string, string> = {
  PASS: "bg-emerald-50 text-emerald-800 border-emerald-200",
  FAIL: "bg-red-50 text-red-700 border-red-200",
  NOT_ASSESSED: "bg-slate-50 text-slate-500 border-slate-200",
};

export function ScreeningChecklist({ criteria }: { criteria: ScreeningCriterionRow[] }) {
  const inclusion = criteria.filter((c) => c.criterionType === "INCLUSION").sort((a, b) => a.criterionOrder - b.criterionOrder);
  const exclusion = criteria.filter((c) => c.criterionType === "EXCLUSION").sort((a, b) => a.criterionOrder - b.criterionOrder);

  return (
    <div>
      <h3 className="text-sm font-bold text-slate-900 mb-1">Screening Eligibility Checklist</h3>
      <p className="text-xs text-slate-500 mb-4">Inclusion and exclusion criteria evaluated against this subject.</p>

      <ChecklistGroup title="Inclusion Criteria" rows={inclusion} />
      <div className="mt-4">
        <ChecklistGroup title="Exclusion Criteria" rows={exclusion} />
      </div>
    </div>
  );
}

function ChecklistGroup({ title, rows }: { title: string; rows: ScreeningCriterionRow[] }) {
  return (
    <div>
      <p className="text-[11px] font-semibold text-slate-500 uppercase mb-2">{title}</p>
      <div className="space-y-1.5">
        {rows.map((c) => (
          <div key={c.criterionId} className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 text-sm">
            <span className="text-slate-700">
              {c.criterionText}
              {c.required && <span className="text-red-500 ml-1">*</span>}
            </span>
            <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${RESULT_STYLES[c.result]}`}>
              {c.result.replace("_", " ")}
            </span>
          </div>
        ))}
        {rows.length === 0 && <p className="text-xs text-slate-400 italic">None defined.</p>}
      </div>
    </div>
  );
}
