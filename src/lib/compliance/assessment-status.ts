export type AssessmentStatus =
  | "UPCOMING"
  | "DUE"
  | "OVERDUE"
  | "COMPLETED"
  | "NOT_APPLICABLE";

export type AssessmentStatusInput = {
  scheduled_date: string | Date | null;
  status: "DUE" | "COMPLETED" | "OVERDUE" | "NOT_APPLICABLE";
};

export function getAssessmentStatus(
  input: AssessmentStatusInput,
  now: Date = new Date(),
): AssessmentStatus {
  if (input.status === "COMPLETED") {
    return "COMPLETED";
  }

  if (input.status === "NOT_APPLICABLE") {
    return "NOT_APPLICABLE";
  }

  if (!input.scheduled_date) {
    return "DUE";
  }

  const scheduledDate = new Date(input.scheduled_date);

  if (Number.isNaN(scheduledDate.getTime())) {
    return "DUE";
  }

  if (scheduledDate.getTime() < now.getTime()) {
    return "OVERDUE";
  }

  if (scheduledDate.getTime() === now.getTime()) {
    return "DUE";
  }

  return "UPCOMING";
}