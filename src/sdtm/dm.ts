/** Plain-object representations of the fields used for SDTM DM export. */
export type DmStudy = {
  ctri_number: string;
};

export type DmSubject = {
  subject_code: string;
  screening_date: string;
};

/** The supported SDTM Demographics fields available in the ARISE schema. */
export type SdtmDmRow = {
  STUDYID: string;
  DOMAIN: "DM";
  USUBJID: string;
  SUBJID: string;
  RFSTDTC: string;
};

export const SDTM_DM_COLUMNS: Array<keyof SdtmDmRow> = [
  "STUDYID",
  "DOMAIN",
  "USUBJID",
  "SUBJID",
  "RFSTDTC",
];

/** Converts one ARISE trial subject into a minimal SDTM DM row. */
export function toSdtmDmRow(study: DmStudy, subject: DmSubject): SdtmDmRow {
  return {
    STUDYID: study.ctri_number,
    DOMAIN: "DM",
    USUBJID: `${study.ctri_number}-${subject.subject_code}`,
    SUBJID: subject.subject_code,
    RFSTDTC: subject.screening_date,
  };
}
