import {
  evaluateComplianceAlerts,
  type ComplianceAlert,
} from "@/lib/compliance/alerts";
import {
  getAssessmentStatus,
  type AssessmentStatus,
} from "@/lib/compliance/assessment-status";

export type ComplianceEvaluationInput = {
  assessment?: {
    scheduled_date: string | Date | null;
    status: "DUE" | "COMPLETED" | "OVERDUE" | "NOT_APPLICABLE";
  };
  adverseEvent?: {
    isSerious: boolean;
    regulatoryDeadline?: string | Date | null;
  };
  protocolDeviation?: {
    severity: "MILD" | "MODERATE" | "SEVERE";
  };
};

export type ComplianceEvaluation = {
  assessmentStatus: AssessmentStatus | null;
  alerts: ComplianceAlert[];
};

export function evaluateCompliance(
  input: ComplianceEvaluationInput,
  now: Date = new Date(),
): ComplianceEvaluation {
  const assessmentStatus = input.assessment
    ? getAssessmentStatus(input.assessment, now)
    : null;

  const alerts = evaluateComplianceAlerts(
    {
      assessmentStatus: assessmentStatus ?? undefined,
      isSeriousAdverseEvent: input.adverseEvent?.isSerious,
      regulatoryDeadline: input.adverseEvent?.regulatoryDeadline,
      protocolDeviationSeverity: input.protocolDeviation?.severity,
    },
    now,
  );

  return {
    assessmentStatus,
    alerts,
  };
}