"use client";

import { useState } from "react";
import { AshtavidhaGrid } from "./AshtavidhaGrid";
import { ConsentBadge, PrakritiAgniBadges } from "./SubjectBadges";
import { ScreeningChecklist } from "./ScreeningChecklist";
import { AssessmentsTimeline, ResultEntryModal } from "./ResultEntryModal";
import type { ScreeningCriterionRow, SubjectAssessmentRow, TrialSubject } from "@/types/subject";

export function ParticipantView({
  subject,
  criteria,
  initialAssessments,
  readOnly,
}: {
  subject: TrialSubject;
  criteria: ScreeningCriterionRow[];
  initialAssessments: SubjectAssessmentRow[];
  readOnly: boolean;
}) {
  const [assessments, setAssessments] = useState(initialAssessments);
  const [activeAssessment, setActiveAssessment] = useState<SubjectAssessmentRow | null>(null);

  function handleSubmit(result: { value: string; unit: string; notes: string }) {
    if (!activeAssessment) return;
    setAssessments((prev) =>
      prev.map((a) =>
        a.id === activeAssessment.id
          ? {
              ...a,
              status: "COMPLETED",
              completedAt: new Date().toISOString(),
              resultValue: result.value,
              resultUnit: result.unit,
              resultNotes: result.notes,
            }
          : a
      )
    );
    setActiveAssessment(null);
    // TODO(Thursday wiring): PATCH subject_assessments row in Supabase here.
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">{subject.subjectCode}</h1>
          <p className="text-sm text-slate-500">
            Screened {subject.screeningDate} · {subject.enrolmentStatus} · Eligibility: {subject.eligibilityStatus}
          </p>
        </div>
        <PrakritiAgniBadges prakriti={subject.prakriti} agni={subject.agni} />
      </div>

      {readOnly && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-800">
          🔒 Read-only view for Ethics Committee — no result entry or edits available.
        </div>
      )}

      <ConsentBadge
        obtained={subject.consentObtained}
        version={subject.consentVersion}
        date={subject.consentDate}
        method={subject.consentMethod}
      />

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <AshtavidhaGrid data={subject.ashtavidhaPariksha} />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <ScreeningChecklist criteria={criteria} />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <AssessmentsTimeline
          assessments={assessments}
          onEnterResult={readOnly ? () => {} : setActiveAssessment}
        />
      </div>

      {activeAssessment && !readOnly && (
        <ResultEntryModal assessment={activeAssessment} onClose={() => setActiveAssessment(null)} onSubmit={handleSubmit} />
      )}
    </div>
  );
}
