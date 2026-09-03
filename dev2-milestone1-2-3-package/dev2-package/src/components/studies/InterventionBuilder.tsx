"use client";

import type { InterventionDraft, InterventionFrequency, InterventionRoute, InterventionType } from "@/types/study-wizard";

const COMPONENT_TYPES: InterventionType[] = ["DRUG", "PATHYA", "ANUPANA", "LIFESTYLE"];
const FREQUENCIES: InterventionFrequency[] = ["ONCE_DAILY", "TWICE_DAILY", "DAILY", "WITH_DOSE", "WEEKLY"];
const ROUTES: InterventionRoute[] = ["ORAL", "TOPICAL", "NA"];

function newRow(): InterventionDraft {
  return {
    key: `int-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    componentType: "DRUG",
    name: "",
    description: "",
    dose: "",
    route: "ORAL",
    frequency: "ONCE_DAILY",
    duration: "",
  };
}

// Multi-component intervention builder (DRUG / PATHYA / ANUPANA / LIFESTYLE
// rows) — maps 1:1 onto the seeded `study_interventions` table shape (see
// Study_Interventions sheet: component_type, name, description, dose,
// route, frequency, duration).
export function InterventionBuilder({
  interventions,
  onChange,
}: {
  interventions: InterventionDraft[];
  onChange: (next: InterventionDraft[]) => void;
}) {
  function updateRow(key: string, patch: Partial<InterventionDraft>) {
    onChange(interventions.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  }

  function removeRow(key: string) {
    onChange(interventions.filter((row) => row.key !== key));
  }

  function addRow() {
    onChange([...interventions, newRow()]);
  }

  return (
    <div className="space-y-3">
      {interventions.length === 0 && (
        <p className="text-sm text-slate-500">
          No intervention components added yet. Add at least one DRUG, PATHYA, ANUPANA, or LIFESTYLE row.
        </p>
      )}

      {interventions.map((row) => (
        <div key={row.key} className="border border-slate-200 rounded-lg p-4 relative">
          <button
            type="button"
            onClick={() => removeRow(row.key)}
            className="absolute top-3 right-3 text-xs text-slate-400 hover:text-red-600 font-semibold"
            aria-label="Remove intervention"
          >
            ✕
          </button>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Field label="Component Type">
              <select
                value={row.componentType}
                onChange={(e) => updateRow(row.key, { componentType: e.target.value as InterventionType })}
                className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm"
              >
                {COMPONENT_TYPES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Name">
              <input
                type="text"
                value={row.name}
                onChange={(e) => updateRow(row.key, { name: e.target.value })}
                placeholder="e.g. Arjuna Ksheerapaka"
                className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm"
              />
            </Field>

            <Field label="Dose">
              <input
                type="text"
                value={row.dose}
                onChange={(e) => updateRow(row.key, { dose: e.target.value })}
                placeholder="e.g. 50 mL"
                className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm"
              />
            </Field>

            <Field label="Route">
              <select
                value={row.route}
                onChange={(e) => updateRow(row.key, { route: e.target.value as InterventionRoute })}
                className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm"
              >
                {ROUTES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Frequency">
              <select
                value={row.frequency}
                onChange={(e) => updateRow(row.key, { frequency: e.target.value as InterventionFrequency })}
                className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm"
              >
                {FREQUENCIES.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Duration">
              <input
                type="text"
                value={row.duration}
                onChange={(e) => updateRow(row.key, { duration: e.target.value })}
                placeholder="e.g. 12 WEEKS"
                className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm"
              />
            </Field>

            <Field label="Description" full>
              <input
                type="text"
                value={row.description}
                onChange={(e) => updateRow(row.key, { description: e.target.value })}
                placeholder="Short description of this component"
                className="w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm"
              />
            </Field>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addRow}
        className="text-xs font-semibold border border-slate-300 hover:border-slate-400 text-slate-700 px-3 py-1.5 rounded-md transition"
      >
        + Add Intervention Component
      </button>
    </div>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={full ? "col-span-2 sm:col-span-4" : ""}>
      <label className="text-[11px] font-semibold text-slate-500 uppercase block mb-1">{label}</label>
      {children}
    </div>
  );
}
