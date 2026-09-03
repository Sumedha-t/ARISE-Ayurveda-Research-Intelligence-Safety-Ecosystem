/**
 * Plain-object representation of the protocol_deviations fields used for FHIR export.
 * This deliberately has no Supabase dependency so it can be used in tests.
 */
export type ProtocolDeviation = {
  id: string;
  study_id: string;
  deviation_type: string;
  description: string;
  severity: string;
  identified_at?: string | null;
  corrective_action?: string | null;
  status?: string | null;
};

type FhirCoding = {
  system: string;
  code: string;
  display: string;
};

type FhirCodeableConcept = {
  coding?: FhirCoding[];
  text?: string;
};

type FhirExtension = {
  url: string;
  valueCodeableConcept?: FhirCodeableConcept;
  valueDateTime?: string;
  valueString?: string;
};

/**
 * FHIR R4 has no ProtocolDeviation resource, so this uses Basic, the standard
 * R4 resource for concepts that do not otherwise have a defined resource.
 */
export type FhirProtocolDeviation = {
  resourceType: "Basic";
  id: string;
  code: FhirCodeableConcept;
  subject: { reference: string };
  extension?: FhirExtension[];
  // Basic.subject identifies the focus of this resource. It references the
  // ResearchStudy, not protocol_deviations.subject_id, which has no Patient ID.
};

const ARISE_EXTENSION_URL =
  "https://arise.aiia.gov.in/fhir/StructureDefinition/";
const ADVERSE_EVENT_SEVERITY_SYSTEM =
  "http://terminology.hl7.org/CodeSystem/adverse-event-severity";

const severityMap: Record<string, FhirCoding> = {
  MILD: { system: ADVERSE_EVENT_SEVERITY_SYSTEM, code: "mild", display: "Mild" },
  MODERATE: {
    system: ADVERSE_EVENT_SEVERITY_SYSTEM,
    code: "moderate",
    display: "Moderate",
  },
  SEVERE: {
    system: ADVERSE_EVENT_SEVERITY_SYSTEM,
    code: "severe",
    display: "Severe",
  },
};

/**
 * Converts one ARISE protocol deviation into a FHIR R4 Basic resource.
 * Protocol-deviation fields without direct Basic elements are ARISE extensions.
 */
export function toFhirProtocolDeviation(
  deviation: ProtocolDeviation,
): FhirProtocolDeviation {
  const severity = severityMap[deviation.severity];

  if (!severity) {
    throw new Error("Unsupported protocol deviation severity.");
  }

  const extensions: FhirExtension[] = [
    {
      url: `${ARISE_EXTENSION_URL}deviation-type`,
      valueString: deviation.deviation_type,
    },
    {
      url: `${ARISE_EXTENSION_URL}description`,
      valueString: deviation.description,
    },
    {
      url: `${ARISE_EXTENSION_URL}severity`,
      valueCodeableConcept: { coding: [severity] },
    },
  ];

  addDateTimeExtension(
    extensions,
    "identified-at",
    deviation.identified_at,
  );
  addStringExtension(
    extensions,
    "corrective-action",
    deviation.corrective_action,
  );
  addStringExtension(extensions, "workflow-status", deviation.status);

  return {
    resourceType: "Basic",
    id: deviation.id,
    code: { text: "Protocol Deviation" },
    subject: { reference: `ResearchStudy/${deviation.study_id}` },
    extension: extensions,
  };
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
