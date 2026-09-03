export type ComplianceAlertSeverity = "INFO" | "WARNING" | "CRITICAL";

export type ComplianceAlert = {
  code:
    | "ASSESSMENT_OVERDUE"
    | "SERIOUS_ADVERSE_EVENT"
    | "REGULATORY_DEADLINE_OVERDUE"
    | "REGULATORY_DEADLINE_APPROACHING"
    | "SEVERE_PROTOCOL_DEVIATION";
  severity: ComplianceAlertSeverity;
  message: string;
};

export type ComplianceAlertInput = {
  assessmentStatus?: "UPCOMING" | "DUE" | "OVERDUE" | "COMPLETED" | "NOT_APPLICABLE";
  isSeriousAdverseEvent?: boolean;
  regulatoryDeadline?: string | Date | null;
  protocolDeviationSeverity?: "MILD" | "MODERATE" | "SEVERE" | null;
};

export function evaluateComplianceAlerts(
  input: ComplianceAlertInput,
  now: Date = new Date(),
): ComplianceAlert[] {
  const alerts: ComplianceAlert[] = [];

  if (input.assessmentStatus === "OVERDUE") {
    alerts.push({
      code: "ASSESSMENT_OVERDUE",
      severity: "WARNING",
      message: "Required assessment is overdue.",
    });
  }

  if (input.isSeriousAdverseEvent) {
    alerts.push({
      code: "SERIOUS_ADVERSE_EVENT",
      severity: "CRITICAL",
      message: "Serious adverse event requires safety review.",
    });
  }

  if (input.regulatoryDeadline) {
    const deadline = new Date(input.regulatoryDeadline);

    if (!Number.isNaN(deadline.getTime())) {
      const remainingMs = deadline.getTime() - now.getTime();
      const remainingHours = remainingMs / (1000 * 60 * 60);

      if (remainingMs < 0) {
        alerts.push({
          code: "REGULATORY_DEADLINE_OVERDUE",
          severity: "CRITICAL",
          message: "Regulatory reporting deadline has passed.",
        });
      } else if (remainingHours <= 6) {
        alerts.push({
          code: "REGULATORY_DEADLINE_APPROACHING",
          severity: "CRITICAL",
          message: "Regulatory reporting deadline is approaching.",
        });
      }
    }
  }

  if (input.protocolDeviationSeverity === "SEVERE") {
    alerts.push({
      code: "SEVERE_PROTOCOL_DEVIATION",
      severity: "CRITICAL",
      message: "Severe protocol deviation requires review.",
    });
  }

  return alerts;
}