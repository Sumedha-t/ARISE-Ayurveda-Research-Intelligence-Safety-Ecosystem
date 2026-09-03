export type RegulatoryDeadline = {
  reporting_deadline_type: "SAE_INITIAL_24H" | null;
  regulatory_deadline: Date | null;
};

/**
 * Calculates the regulatory reporting deadline for an adverse event.
 *
 * For a serious adverse event (SAE):
 *   reporting_deadline_type = SAE_INITIAL_24H
 *   regulatory_deadline = current time + 24 hours
 *
 * For a non-serious adverse event:
 *   no regulatory deadline is assigned by this function.
 */
export function calculateRegulatoryDeadline(
  isSerious: boolean,
  now: Date = new Date(),
): RegulatoryDeadline {
  if (!isSerious) {
    return {
      reporting_deadline_type: null,
      regulatory_deadline: null,
    };
  }

  const deadline = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  return {
    reporting_deadline_type: "SAE_INITIAL_24H",
    regulatory_deadline: deadline,
  };
}