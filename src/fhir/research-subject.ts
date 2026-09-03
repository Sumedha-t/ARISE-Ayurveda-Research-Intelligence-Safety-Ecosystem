/**
 * Plain-object representation of the trial_subjects fields used for FHIR export.
 * This deliberately has no Supabase dependency so it can be used in tests.
 */
export type TrialSubject = {
  id: string;
  study_id: string;
  subject_code: string;
  enrolment_status?: string | null;
  consent_obtained?: boolean | null;
  consent_version?: string | null;
  consent_date?: string | null;
  eligibility_status?: string | null;
  eligibility_notes?: string | null;
  eligibility_assessed_at?: string | null;
};

type FhirExtension = {
  url: string;
  valueBoolean?: boolean;
  valueDate?: string;
  valueDateTime?: string;
  valueString?: string;
};

type FhirResearchSubjectStatus = "on-study";

/** A minimal FHIR R4 ResearchSubject resource shape returned by this transformer. */
export type FhirResearchSubject = {
  resourceType: "ResearchSubject";
  id: string;
  identifier: Array<{ system: string; value: string }>;
  status: FhirResearchSubjectStatus;
  study: { reference: string };
  extension?: FhirExtension[];
  // ResearchSubject.individual is required by FHIR R4, but is intentionally
  // omitted because trial_subjects has no Patient identifier or entity.
};

const ARISE_EXTENSION_URL =
  "https://arise.aiia.gov.in/fhir/StructureDefinition/";
const TRIAL_SUBJECT_IDENTIFIER_SYSTEM =
  "https://arise.aiia.gov.in/identifier/trial-subject";

const enrolmentStatusMap: Record<string, FhirResearchSubjectStatus> = {
  Enrolled: "on-study",
};

/**
 * Converts one ARISE trial subject into a FHIR R4 ResearchSubject resource.
 * Eligibility and consent details are retained as ARISE extensions because
 * this database does not contain the referenced FHIR Consent resource.
 */
export function toFhirResearchSubject(
  subject: TrialSubject,
): FhirResearchSubject {
  const status = enrolmentStatusMap[subject.enrolment_status ?? ""];

  if (!status) {
    throw new Error("Unsupported trial subject enrolment status.");
  }

  const extensions: FhirExtension[] = [];

  addStringExtension(extensions, "eligibility-status", subject.eligibility_status);
  addStringExtension(extensions, "eligibility-notes", subject.eligibility_notes);
  addDateTimeExtension(
    extensions,
    "eligibility-assessed-at",
    subject.eligibility_assessed_at,
  );
  addBooleanExtension(
    extensions,
    "consent-obtained",
    subject.consent_obtained,
  );
  addStringExtension(extensions, "consent-version", subject.consent_version);
  addDateExtension(extensions, "consent-date", subject.consent_date);

  const resource: FhirResearchSubject = {
    resourceType: "ResearchSubject",
    id: subject.id,
    identifier: [
      {
        system: TRIAL_SUBJECT_IDENTIFIER_SYSTEM,
        value: subject.subject_code,
      },
    ],
    status,
    study: { reference: `ResearchStudy/${subject.study_id}` },
  };

  if (extensions.length > 0) {
    resource.extension = extensions;
  }

  return resource;
}

function addBooleanExtension(
  extensions: FhirExtension[],
  name: string,
  value: boolean | null | undefined,
) {
  if (value !== null && value !== undefined) {
    extensions.push({
      url: `${ARISE_EXTENSION_URL}${name}`,
      valueBoolean: value,
    });
  }
}

function addDateExtension(
  extensions: FhirExtension[],
  name: string,
  value: string | null | undefined,
) {
  if (value) {
    extensions.push({
      url: `${ARISE_EXTENSION_URL}${name}`,
      valueDate: value,
    });
  }
}

function addDateTimeExtension(
  extensions: FhirExtension[],
  name: string,
  value: string | null | undefined,
) {
  if (value) {
    extensions.push({
      url: `${ARISE_EXTENSION_URL}${name}`,
      valueDateTime: value,
    });
  }
}

function addStringExtension(
  extensions: FhirExtension[],
  name: string,
  value: string | null | undefined,
) {
  if (value) {
    extensions.push({
      url: `${ARISE_EXTENSION_URL}${name}`,
      valueString: value,
    });
  }
}
