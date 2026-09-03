"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { StudyPhase } from "@/types/trial";
import {
  AGNI_OPTIONS,
  CLINICAL_PARAMETER_CATALOGUE,
  EMPTY_FORM_STATE,
  PRAKRITI_OPTIONS,
  VISIT_SCHEDULE,
  type ClinicalParameterCode,
  type CreateStudyFormState,
  type CriterionDraft,
  type MonitoringFrequency,
  type StudyType,
  type VisitLabel,
} from "@/types/study-wizard";
import { InterventionBuilder } from "./InterventionBuilder";

const PHASES: StudyPhase[] = ["PHASE_1", "PHASE_2", "PHASE_3", "PHASE_4", "OBSERVATIONAL"];
const STUDY_TYPES: StudyType[] = ["INTERVENTIONAL", "OBSERVATIONAL"];
const MONITORING_FREQUENCIES: MonitoringFrequency[] = ["DAILY", "WEEKLY", "FORTNIGHTLY", "MONTHLY", "CUSTOM"];

const STEPS = [
  "Basic Details",
  "Clinical Parameters",
  "Interventions",
  "Monitoring Schedule",
  "Criteria",
  "Review",
] as const;

function newCriterionRow(criterionType: CriterionDraft["criterionType"]): CriterionDraft {
  return {
    key: `crit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    criterionType,
    text: "",
  };
}

// Milestone 1 — Create Study Wizard.
//
// Tonight this runs entirely on local component state ("built with mock
// state" per the sprint plan) so it's unblocked from the Supabase wiring
// task scheduled for Thursday 1:00–6:30 PM. `handleSubmit` below is where
// that wiring plugs in — see the TODO block for the exact shape Dev 1's
// insert needs to accept.
//
// Field catalogues (clinical parameters, intervention enums, visit
// schedule) are taken verbatim from Dev 1's Section 7 reference packet /
// the seeded Synthetic_Data_V2 dataset, so this form won't need rework once
// it's pointed at the real tables.
export function CreateStudyWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<CreateStudyFormState>(EMPTY_FORM_STATE);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof CreateStudyFormState>(key: K, value: CreateStudyFormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleParameter(code: ClinicalParameterCode) {
    setForm((f) => ({
      ...f,
      selectedParameterCodes: f.selectedParameterCodes.includes(code)
        ? f.selectedParameterCodes.filter((c) => c !== code)
        : [...f.selectedParameterCodes, code],
    }));
  }

  function toggleVisit(label: VisitLabel) {
    setForm((f) => ({
      ...f,
      selectedVisits: f.selectedVisits.includes(label)
        ? f.selectedVisits.filter((v) => v !== label)
        : [...f.selectedVisits, label],
    }));
  }

  function addCriterion(criterionType: CriterionDraft["criterionType"]) {
    setForm((f) => ({ ...f, criteria: [...f.criteria, newCriterionRow(criterionType)] }));
  }

  function updateCriterion(key: string, text: string) {
    setForm((f) => ({
      ...f,
      criteria: f.criteria.map((c) => (c.key === key ? { ...c, text } : c)),
    }));
  }

  function removeCriterion(key: string) {
    setForm((f) => ({ ...f, criteria: f.criteria.filter((c) => c.key !== key) }));
  }

  const canGoNext = validateStep(step, form);

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      // TODO (Thursday 1:00–6:30 PM DB wiring slot): replace this block with
      // the real Supabase insert, using the server-action / route-handler
      // pattern Dev 1 specified. Expected shape:
      //
      //   const supabase = await createClient()
      //   const { data: study, error } = await supabase
      //     .from('studies')
      //     .insert({
      //       title: form.title,
      //       ctri_number: form.ctriNumber,
      //       phase: form.phase,
      //       study_type: form.studyType,
      //       target_enrolment: form.targetEnrolment,
      //       monitoring_frequency: form.monitoringFrequency,
      //     })
      //     .select()
      //     .single()
      //
      //   then bulk-insert study_clinical_parameters, study_interventions,
      //   study_assessments, study_criteria rows keyed to study.id.
      //
      // Until then, this just logs the payload so the form is demonstrable
      // end-to-end tonight.
      // eslint-disable-next-line no-console
      console.log("CreateStudyWizard submit payload (mock state):", form);
      await new Promise((r) => setTimeout(r, 400));
      router.push("/studies");
    } catch {
      setError("Could not create study. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto w-full">
      {/* Step tabs */}
      <div className="flex items-center gap-1 mb-6 overflow-x-auto">
        {STEPS.map((label, i) => (
          <button
            key={label}
            type="button"
            onClick={() => i <= furthestReachable(step, form) && setStep(i)}
            className={`text-xs font-semibold px-3 py-2 rounded-md whitespace-nowrap transition ${
              i === step
                ? "bg-slate-900 text-white"
                : i < step
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-slate-100 text-slate-400"
            }`}
          >
            {i + 1}. {label}
          </button>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm min-h-[320px]">
        {step === 0 && <BasicDetailsStep form={form} update={update} />}
        {step === 1 && <ClinicalParametersStep form={form} onToggle={toggleParameter} />}
        {step === 2 && (
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Intervention Builder</h3>
            <p className="text-xs text-slate-500 mb-4">
              Define DRUG, PATHYA, ANUPANA, and LIFESTYLE components with dose, route, frequency, and duration.
            </p>
            <InterventionBuilder
              interventions={form.interventions}
              onChange={(next) => update("interventions", next)}
            />
          </div>
        )}
        {step === 3 && <MonitoringScheduleStep form={form} update={update} onToggleVisit={toggleVisit} />}
        {step === 4 && (
          <CriteriaStep
            form={form}
            onAdd={addCriterion}
            onUpdate={updateCriterion}
            onRemove={removeCriterion}
          />
        )}
        {step === 5 && <ReviewStep form={form} />}
      </div>

      {error && <p className="text-xs text-red-600 mt-3">{error}</p>}

      <div className="flex items-center justify-between mt-4">
        <button
          type="button"
          disabled={step === 0}
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          className="text-xs font-semibold border border-slate-300 hover:border-slate-400 text-slate-700 px-4 py-2 rounded-md transition disabled:opacity-40"
        >
          Back
        </button>

        {step < STEPS.length - 1 ? (
          <button
            type="button"
            disabled={!canGoNext}
            onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
            className="text-xs font-semibold bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white px-4 py-2 rounded-md transition"
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            disabled={submitting}
            onClick={handleSubmit}
            className="text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white px-5 py-2 rounded-md transition"
          >
            {submitting ? "Creating…" : "Create Study"}
          </button>
        )}
      </div>
    </div>
  );
}

// A step is only reachable once the ones before it are individually valid —
// keeps the review step honest without a full form-library dependency.
function furthestReachable(currentStep: number, form: CreateStudyFormState): number {
  for (let i = 0; i <= currentStep; i++) {
    if (!validateStep(i, form)) return i;
  }
  return currentStep;
}

function validateStep(step: number, form: CreateStudyFormState): boolean {
  switch (step) {
    case 0:
      return form.title.trim().length > 0 && form.ctriNumber.trim().length > 0 && form.targetEnrolment !== "";
    case 1:
      return form.selectedParameterCodes.length > 0;
    case 2:
      return form.interventions.length > 0 && form.interventions.every((i) => i.name.trim().length > 0);
    case 3:
      return form.selectedVisits.length > 0;
    case 4:
      return form.criteria.length > 0 && form.criteria.every((c) => c.text.trim().length > 0);
    default:
      return true;
  }
}

function BasicDetailsStep({
  form,
  update,
}: {
  form: CreateStudyFormState;
  update: <K extends keyof CreateStudyFormState>(key: K, value: CreateStudyFormState[K]) => void;
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-slate-900">Basic Details</h3>
      <LabeledInput
        label="Study Title"
        value={form.title}
        onChange={(v) => update("title", v)}
        placeholder="e.g. Ayurveda Comparative Study in Essential Hypertension"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <LabeledInput
          label="CTRI Number"
          value={form.ctriNumber}
          onChange={(v) => update("ctriNumber", v)}
          placeholder="CTRI/2026/08/001122"
          mono
        />
        <LabeledInput
          label="Target Enrolment"
          type="number"
          value={form.targetEnrolment === "" ? "" : String(form.targetEnrolment)}
          onChange={(v) => update("targetEnrolment", v === "" ? "" : Number(v))}
          placeholder="e.g. 5"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-[11px] font-semibold text-slate-500 uppercase block mb-1">Phase</label>
          <select
            value={form.phase}
            onChange={(e) => update("phase", e.target.value as StudyPhase)}
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
          >
            {PHASES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[11px] font-semibold text-slate-500 uppercase block mb-1">Study Type</label>
          <select
            value={form.studyType}
            onChange={(e) => update("studyType", e.target.value as StudyType)}
            className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
          >
            {STUDY_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

function ClinicalParametersStep({
  form,
  onToggle,
}: {
  form: CreateStudyFormState;
  onToggle: (code: ClinicalParameterCode) => void;
}) {
  const ayurveda = CLINICAL_PARAMETER_CATALOGUE.filter((p) => p.category === "AYURVEDA");
  const clinical = CLINICAL_PARAMETER_CATALOGUE.filter((p) => p.category === "CLINICAL");

  return (
    <div>
      <h3 className="text-sm font-bold text-slate-900 mb-1">Clinical Parameters Checklist</h3>
      <p className="text-xs text-slate-500 mb-4">
        Select which parameters will be tracked for this study, at Ayurveda and clinical baseline.
      </p>

      <p className="text-[11px] font-semibold text-slate-500 uppercase mb-2">Ayurveda</p>
      <div className="grid grid-cols-2 gap-2 mb-4">
        {ayurveda.map((p) => (
          <ParamCheckbox key={p.code} label={p.label} checked={form.selectedParameterCodes.includes(p.code)} onChange={() => onToggle(p.code)} />
        ))}
      </div>

      <p className="text-[11px] font-semibold text-slate-500 uppercase mb-2">Clinical</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {clinical.map((p) => (
          <ParamCheckbox
            key={p.code}
            label={`${p.label}${p.unit ? ` (${p.unit})` : ""}`}
            checked={form.selectedParameterCodes.includes(p.code)}
            onChange={() => onToggle(p.code)}
          />
        ))}
      </div>
    </div>
  );
}

function ParamCheckbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex items-center gap-2 text-xs border border-slate-200 rounded-md px-2.5 py-2 cursor-pointer hover:border-slate-300">
      <input type="checkbox" checked={checked} onChange={onChange} className="accent-emerald-700" />
      <span className="text-slate-700">{label}</span>
    </label>
  );
}

function MonitoringScheduleStep({
  form,
  update,
  onToggleVisit,
}: {
  form: CreateStudyFormState;
  update: <K extends keyof CreateStudyFormState>(key: K, value: CreateStudyFormState[K]) => void;
  onToggleVisit: (label: VisitLabel) => void;
}) {
  return (
    <div>
      <h3 className="text-sm font-bold text-slate-900 mb-1">Monitoring Schedule</h3>
      <p className="text-xs text-slate-500 mb-4">Choose an overall cadence, and which visit milestones apply.</p>

      <label className="text-[11px] font-semibold text-slate-500 uppercase block mb-1">Frequency</label>
      <select
        value={form.monitoringFrequency}
        onChange={(e) => update("monitoringFrequency", e.target.value as MonitoringFrequency)}
        className="w-full sm:w-64 border border-slate-300 rounded-md px-3 py-2 text-sm mb-5"
      >
        {MONITORING_FREQUENCIES.map((f) => (
          <option key={f} value={f}>
            {f}
          </option>
        ))}
      </select>

      <p className="text-[11px] font-semibold text-slate-500 uppercase mb-2">Visit Milestones</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {VISIT_SCHEDULE.map((v) => (
          <ParamCheckbox
            key={v.label}
            label={`${v.label.replace("_", " ")} (Day ${v.dayOffset})`}
            checked={form.selectedVisits.includes(v.label)}
            onChange={() => onToggleVisit(v.label)}
          />
        ))}
      </div>
    </div>
  );
}

function CriteriaStep({
  form,
  onAdd,
  onUpdate,
  onRemove,
}: {
  form: CreateStudyFormState;
  onAdd: (type: CriterionDraft["criterionType"]) => void;
  onUpdate: (key: string, text: string) => void;
  onRemove: (key: string) => void;
}) {
  const inclusion = form.criteria.filter((c) => c.criterionType === "INCLUSION");
  const exclusion = form.criteria.filter((c) => c.criterionType === "EXCLUSION");

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-slate-900">Inclusion Criteria</h3>
          <button
            type="button"
            onClick={() => onAdd("INCLUSION")}
            className="text-xs font-semibold border border-slate-300 hover:border-slate-400 text-slate-700 px-2.5 py-1 rounded-md transition"
          >
            + Add
          </button>
        </div>
        <CriterionList rows={inclusion} onUpdate={onUpdate} onRemove={onRemove} placeholder="e.g. Adults aged 30–65 years with diagnosed essential hypertension" />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-slate-900">Exclusion Criteria</h3>
          <button
            type="button"
            onClick={() => onAdd("EXCLUSION")}
            className="text-xs font-semibold border border-slate-300 hover:border-slate-400 text-slate-700 px-2.5 py-1 rounded-md transition"
          >
            + Add
          </button>
        </div>
        <CriterionList rows={exclusion} onUpdate={onUpdate} onRemove={onRemove} placeholder="e.g. Pregnancy or breastfeeding" />
      </div>
    </div>
  );
}

function CriterionList({
  rows,
  onUpdate,
  onRemove,
  placeholder,
}: {
  rows: CriterionDraft[];
  onUpdate: (key: string, text: string) => void;
  onRemove: (key: string) => void;
  placeholder: string;
}) {
  if (rows.length === 0) {
    return <p className="text-xs text-slate-400">None added yet.</p>;
  }
  return (
    <div className="space-y-2">
      {rows.map((row) => (
        <div key={row.key} className="flex items-center gap-2">
          <input
            type="text"
            value={row.text}
            onChange={(e) => onUpdate(row.key, e.target.value)}
            placeholder={placeholder}
            className="flex-1 border border-slate-300 rounded-md px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={() => onRemove(row.key)}
            className="text-xs text-slate-400 hover:text-red-600 font-semibold px-2"
            aria-label="Remove criterion"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}

function ReviewStep({ form }: { form: CreateStudyFormState }) {
  return (
    <div className="space-y-4 text-sm">
      <h3 className="text-sm font-bold text-slate-900">Review</h3>
      <ReviewRow label="Title" value={form.title} />
      <ReviewRow label="CTRI Number" value={form.ctriNumber} mono />
      <ReviewRow label="Phase / Type" value={`${form.phase} · ${form.studyType}`} />
      <ReviewRow label="Target Enrolment" value={String(form.targetEnrolment)} />
      <ReviewRow label="Clinical Parameters" value={form.selectedParameterCodes.join(", ") || "—"} />
      <ReviewRow
        label="Interventions"
        value={form.interventions.map((i) => `${i.componentType}: ${i.name || "(unnamed)"}`).join(" · ") || "—"}
      />
      <ReviewRow label="Monitoring" value={`${form.monitoringFrequency} · ${form.selectedVisits.join(", ")}`} />
      <ReviewRow
        label="Criteria"
        value={`${form.criteria.filter((c) => c.criterionType === "INCLUSION").length} inclusion, ${
          form.criteria.filter((c) => c.criterionType === "EXCLUSION").length
        } exclusion`}
      />
      <p className="text-xs text-slate-400 pt-2 border-t border-slate-100">
        Submitting now uses mock state — this will write to Supabase once Thursday&apos;s DB wiring lands.
      </p>
    </div>
  );
}

function ReviewRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-xs text-slate-500 shrink-0">{label}</span>
      <span className={`text-xs font-semibold text-slate-800 text-right ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}

function LabeledInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  mono,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  mono?: boolean;
}) {
  return (
    <div>
      <label className="text-[11px] font-semibold text-slate-500 uppercase block mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full border border-slate-300 rounded-md px-3 py-2 text-sm ${mono ? "font-mono" : ""}`}
      />
    </div>
  );
}
