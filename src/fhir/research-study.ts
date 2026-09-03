/**
 * Plain-object representation of the fields read from the studies table.
 * This deliberately has no Supabase dependency so it can be used in tests.
 */
export type Study = {
  id: string;
  ctri_number: string;
  title: string;
  description?: string | null;
  study_type?: string | null;
  phase?: string | null;
  pi_id?: string | null;
  iec_approval_date?: string | null;
  iec_status?: string | null;
  target_enrolment?: number | null;
  current_enrolment?: number | null;
  monitoring_frequency?: string | null;
  monitoring_start_date?: string | null;
  monitoring_end_date?: string | null;
};

type FhirExtension = {
  url: string;
  valueDate?: string;
  valueInteger?: number;
  valueString?: string;
};

/** A minimal FHIR R4 ResearchStudy resource shape returned by this transformer. */
export type FhirResearchStudy = {
  resourceType: "ResearchStudy";
  id: string;
  identifier: Array<{ system: string; value: string }>;
  title: string;
  status: "active";
  description?: string;
  category?: Array<{ text: string }>;
  phase?: { coding: Array<{ system: string; code: string; display: string }> };
  principalInvestigator?: { reference: string };
  period?: { start?: string; end?: string };
  extension?: FhirExtension[];
};

const ARISE_EXTENSION_URL =
  "https://arise.aiia.gov.in/fhir/StructureDefinition/";
const RESEARCH_STUDY_PHASE_SYSTEM =
  "http://terminology.hl7.org/CodeSystem/research-study-phase";

const phaseMap: Record<string, { code: string; display: string }> = {
  PHASE_1: { code: "phase-1", display: "Phase 1" },
  PHASE_2: { code: "phase-2", display: "Phase 2" },
  PHASE_3: { code: "phase-3", display: "Phase 3" },
  PHASE_4: { code: "phase-4", display: "Phase 4" },
  OBSERVATIONAL: { code: "n-a", display: "Not Applicable" },
};

/**
 * Converts one ARISE study into a FHIR R4 ResearchStudy resource.
 * Fields without a direct R4 equivalent are retained as ARISE extensions.
 */
export function toFhirResearchStudy(study: Study): FhirResearchStudy {
  const extensions: FhirExtension[] = [];

  addStringExtension(extensions, "iec-approval-status", study.iec_status);
  addDateExtension(extensions, "iec-approval-date", study.iec_approval_date);
  addIntegerExtension(extensions, "target-enrolment", study.target_enrolment);
  addIntegerExtension(extensions, "current-enrolment", study.current_enrolment);
  addStringExtension(
    extensions,
    "monitoring-frequency",
    study.monitoring_frequency,
  );

  const resource: FhirResearchStudy = {
    resourceType: "ResearchStudy",
    id: study.id,
    identifier: [
      {
        system: "https://ctri.nic.in",
        value: study.ctri_number,
      },
    ],
    title: study.title,
    // The studies table has no lifecycle-status column, so active is the safe default.
    status: "active",
  };

  if (study.description) {
    resource.description = study.description;
  }

  if (study.study_type) {
    resource.category = [{ text: study.study_type }];
  }

  const phase = study.phase ? phaseMap[study.phase] : undefined;
  if (phase) {
    resource.phase = {
      coding: [{ system: RESEARCH_STUDY_PHASE_SYSTEM, ...phase }],
    };
  }

  if (study.pi_id) {
    resource.principalInvestigator = {
      reference: `Practitioner/${study.pi_id}`,
    };
  }

  if (study.monitoring_start_date || study.monitoring_end_date) {
    resource.period = {
      ...(study.monitoring_start_date && { start: study.monitoring_start_date }),
      ...(study.monitoring_end_date && { end: study.monitoring_end_date }),
    };
  }

  if (extensions.length > 0) {
    resource.extension = extensions;
  }

  return resource;
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

function addIntegerExtension(
  extensions: FhirExtension[],
  name: string,
  value: number | null | undefined,
) {
  if (value !== null && value !== undefined) {
    extensions.push({
      url: `${ARISE_EXTENSION_URL}${name}`,
      valueInteger: value,
    });
  }
}
