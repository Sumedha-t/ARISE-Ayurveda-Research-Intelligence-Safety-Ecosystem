/** Plain-object representations of the fields used for SDTM AE export. */
export type AeStudy = {
  ctri_number: string;
};

export type AeSubject = {
  subject_code: string;
};

export type AeEvent = {
  event_term: string;
  severity: string;
  is_serious: boolean;
  outcome?: string | null;
  causality_type?: string | null;
};

/** The supported SDTM Adverse Events fields available in the ARISE schema. */
export type SdtmAeRow = {
  STUDYID: string;
  DOMAIN: "AE";
  USUBJID: string;
  AESEQ: number;
  AETERM: string;
  AESEV: "MILD" | "MODERATE" | "SEVERE";
  AESER: "Y" | "N";
  AEOUT: string;
  AEREL: string;
};

export const SDTM_AE_COLUMNS: Array<keyof SdtmAeRow> = [
  "STUDYID",
  "DOMAIN",
  "USUBJID",
  "AESEQ",
  "AETERM",
  "AESEV",
  "AESER",
  "AEOUT",
  "AEREL",
];

const severityMap: Record<string, SdtmAeRow["AESEV"]> = {
  MILD: "MILD",
  MODERATE: "MODERATE",
  SEVERE: "SEVERE",
};

const outcomeMap: Record<string, string> = {
  RECOVERED: "RECOVERED/RESOLVED",
  RECOVERING: "RECOVERING/RESOLVING",
  NOT_RECOVERED: "NOT RECOVERED/NOT RESOLVED",
  FATAL: "FATAL",
  UNKNOWN: "UNKNOWN",
};

/** Converts one ARISE adverse event into a minimal SDTM AE row. */
export function toSdtmAeRow(
  study: AeStudy,
  subject: AeSubject,
  event: AeEvent,
  sequence: number,
): SdtmAeRow {
  const severity = severityMap[event.severity];

  if (!severity) {
    throw new Error("Unsupported adverse event severity.");
  }

  const outcome = event.outcome ? outcomeMap[event.outcome] : "";

  if (event.outcome && !outcome) {
    throw new Error("Unsupported adverse event outcome.");
  }

  return {
    STUDYID: study.ctri_number,
    DOMAIN: "AE",
    USUBJID: `${study.ctri_number}-${subject.subject_code}`,
    AESEQ: sequence,
    AETERM: event.event_term,
    AESEV: severity,
    AESER: event.is_serious ? "Y" : "N",
    AEOUT: outcome,
    // Only the direct UNRELATED value has a defensible AEREL mapping. The
    // remaining local causality categories are not treatment-relationship codes.
    AEREL: event.causality_type === "UNRELATED" ? "NOT RELATED" : "",
  };
}
