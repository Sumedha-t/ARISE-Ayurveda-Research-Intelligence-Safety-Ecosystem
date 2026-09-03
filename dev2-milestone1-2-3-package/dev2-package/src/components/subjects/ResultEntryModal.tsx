"use client";

import { useState } from "react";
import type { SubjectAssessmentRow } from "@/types/subject";

const STATUS_STYLES: Record<string, string> = {
  DUE: "bg-slate-100 text-slate-700 border-slate-200",
  COMPLETED: "bg-emerald-50 text-emerald-800 border-emerald-200",
  OVERDUE: "bg-red-50 text-red-700 border-red-200",
  NOT_APPLICABLE: "bg-slate-50 text-slate-400 border-slate-200",
};

export function AssessmentsTimeline({
  assessments,
  onEnterResult,
}: {
  assessments: SubjectAssessmentRow[];
  onEnterResult: (assessment: SubjectAssessmentRow) => void;
}) {
  return (
    <div>
      <h3 className="text-sm font-bold text-slate-900 mb-1">Scheduled Assessments</h3>
      <p className="text-xs text-slate-500 mb-4">Protocol visit timepoints and completion status.</p>

      <div className="space-y-2">
        {assessments.map((a) => (
          <div
            key={a.id}
            className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-sm"
          >
            <div>
              <p className="font-medium text-slate-800">{a.assessmentName}</p>
              <p className="text-xs text-slate-500">
                {a.visitLabel.replace("_", " ")} (Day {a.dayOffset}) — scheduled {a.scheduledDate}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className={`text-[10px] font-semibold uppercase px-2 py-1 rounded-full border ${STATUS_STYLES[a.status]}`}>
                {a.status}
              </span>
              {a.status !== "COMPLETED" && a.status !== "NOT_APPLICABLE" && (
                <button
                  onClick={() => onEnterResult(a)}
                  className="text-xs font-medium text-emerald-700 hover:text-emerald-800 border border-emerald-200 rounded-md px-2.5 py-1 hover:bg-emerald-50"
                >
                  Enter Result
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ResultEntryModal({
  assessment,
  onClose,
  onSubmit,
}: {
  assessment: SubjectAssessmentRow;
  onClose: () => void;
  onSubmit: (result: { value: string; unit: string; notes: string }) => void;
}) {
  const [value, setValue] = useState(assessment.resultValue ?? "");
  const [unit, setUnit] = useState(assessment.resultUnit ?? "");
  const [notes, setNotes] = useState(assessment.resultNotes ?? "");

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
        <h3 className="text-base font-bold text-slate-900 mb-1">Enter Clinical Result</h3>
        <p className="text-xs text-slate-500 mb-4">
          {assessment.assessmentName} — {assessment.visitLabel.replace("_", " ")}
        </p>

        <div className="space-y-3">
          <div>
            <label className="text-[11px] font-semibold text-slate-500 uppercase block mb-1">Value</label>
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
              placeholder="e.g. 128"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-slate-500 uppercase block mb-1">Unit</label>
            <input
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
              placeholder="e.g. mmHg"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-slate-500 uppercase block mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="text-sm px-3 py-1.5 rounded-md border border-slate-300 text-slate-600 hover:bg-slate-50">
            Cancel
          </button>
          <button
            onClick={() => onSubmit({ value, unit, notes })}
            className="text-sm px-3 py-1.5 rounded-md bg-emerald-700 text-white hover:bg-emerald-800"
          >
            Save Result
          </button>
        </div>
      </div>
    </div>
  );
}
