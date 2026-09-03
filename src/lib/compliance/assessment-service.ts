import { createClient } from "@/lib/supabase/server";
import {
  getAssessmentStatus,
  type AssessmentStatus,
} from "@/lib/compliance/assessment-status";

export type SubjectAssessment = {
  id: string;
  study_id: string;
  subject_id: string;
  assessment_id: string;
  scheduled_date: string | null;
  status: "DUE" | "COMPLETED" | "OVERDUE" | "NOT_APPLICABLE";
  result_value: string | null;
  result_unit: string | null;
  notes: string | null;
};

export type AssessmentWithComplianceStatus = SubjectAssessment & {
  compliance_status: AssessmentStatus;
};

export async function getSubjectAssessments(
  studyId: string,
  subjectId: string,
  now: Date = new Date(),
): Promise<AssessmentWithComplianceStatus[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("subject_assessments")
    .select("*")
    .eq("study_id", studyId)
    .eq("subject_id", subjectId)
    .order("scheduled_date", { ascending: true });

  if (error) {
    throw new Error(
      `Unable to fetch subject assessments: ${error.message}`,
    );
  }

  return ((data ?? []) as SubjectAssessment[]).map((assessment) => ({
    ...assessment,
    compliance_status: getAssessmentStatus(assessment, now),
  }));
}