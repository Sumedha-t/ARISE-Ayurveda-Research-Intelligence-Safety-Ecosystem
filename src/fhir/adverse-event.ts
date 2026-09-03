/**
 * Plain-object representation of the adverse_events fields used for FHIR export.
 * This deliberately has no Supabase dependency so it can be used in tests.
 */
export type AdverseEvent = {
  id: string;
  study_id: string;
  severity: string;
  is_serious: boolean;
  event_term: string;
  meddra_code?: string | null;
  namaste_portal_code?: string | null;
  causality_type?: string | null;
  outcome?: string | null;
  workflow_status?: string | null;
  reporting_deadline_type?: string | null;
  reported_at?: string | null;
  regulatory_deadline?: string | null;
  submitted_to_regulator_at?: string | null;
};

type FhirCoding = {
  system: string;
  code: string;
  display: string;
};

type FhirCodeableConcept = {
  coding: FhirCoding[];
};

type FhirExtension = {
  url: string;
  valueDateTime?: string;
  valueString?: string;
};

/** A minimal FHIR R4 AdverseEvent resource shape returned by this transformer. */
export type FhirAdverseEvent = {
  resourceType: "AdverseEvent";
  id: string;
  actuality: "actual";
  event: { text: string };
  seriousness: FhirCodeableConcept;
  severity: FhirCodeableConcept;
  outcome?: FhirCodeableConcept;
  study: Array<{ reference: string }>;
  extension?: FhirExtension[];
  // AdverseEvent.subject is required by FHIR R4, but is intentionally omitted
  // because adverse_events has no Patient identifier or entity.
  // FHIR R4 has no AdverseEvent.status field; workflow_status is an extension.
};

const ARISE_EXTENSION_URL =
  "https://arise.aiia.gov.in/fhir/StructureDefinition/";
const ADVERSE_EVENT_SEVERITY_SYSTEM =
  "http://terminology.hl7.org/CodeSystem/adverse-event-severity";
const ADVERSE_EVENT_SERIOUSNESS_SYSTEM =
  "http://terminology.hl7.org/CodeSystem/adverse-event-seriousness";
const ADVERSE_EVENT_OUTCOME_SYSTEM =
  "http://terminology.hl7.org/CodeSystem/adverse-event-outcome";

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

const outcomeMap: Record<string, FhirCoding> = {
  RECOVERED: {
    system: ADVERSE_EVENT_OUTCOME_SYSTEM,
    code: "resolved",
    display: "Resolved",
  },
  RECOVERING: {
    system: ADVERSE_EVENT_OUTCOME_SYSTEM,
    code: "recovering",
    display: "Recovering",
  },
  NOT_RECOVERED: {
    system: ADVERSE_EVENT_OUTCOME_SYSTEM,
    code: "ongoing",
    display: "Ongoing",
  },
  FATAL: { system: ADVERSE_EVENT_OUTCOME_SYSTEM, code: "fatal", display: "Fatal" },
  UNKNOWN: {
    system: ADVERSE_EVENT_OUTCOME_SYSTEM,
    code: "unknown",
    display: "Unknown",
  },
};

/**
 * Converts one ARISE adverse event into a FHIR R4 AdverseEvent resource.
 * The table models actual adverse events only; it has no potential-event flag.
 */
export function toFhirAdverseEvent(event: AdverseEvent): FhirAdverseEvent {
  const severity = severityMap[event.severity];

  if (!severity) {
    throw new Error("Unsupported adverse event severity.");
  }

  const extensions: FhirExtension[] = [];

  addStringExtension(extensions, "meddra-code", event.meddra_code);
  addStringExtension(
    extensions,
    "namaste-portal-code",
    event.namaste_portal_code,
  );
  addStringExtension(extensions, "causality-type", event.causality_type);
  addStringExtension(extensions, "workflow-status", event.workflow_status);
  addStringExtension(
    extensions,
    "reporting-deadline-type",
    event.reporting_deadline_type,
  );
  addDateTimeExtension(extensions, "reported-at", event.reported_at);
  addDateTimeExtension(
    extensions,
    "regulatory-deadline",
    event.regulatory_deadline,
  );
  addDateTimeExtension(
    extensions,
    "submitted-to-regulator-at",
    event.submitted_to_regulator_at,
  );

  if (event.outcome === "NOT_RECOVERED") {
    addStringExtension(extensions, "local-outcome", event.outcome);
  }

  const resource: FhirAdverseEvent = {
    resourceType: "AdverseEvent",
    id: event.id,
    actuality: "actual",
    event: { text: event.event_term },
    seriousness: {
      coding: [
        event.is_serious
          ? {
              system: ADVERSE_EVENT_SERIOUSNESS_SYSTEM,
              code: "Serious",
              display: "Serious",
            }
          : {
              system: ADVERSE_EVENT_SERIOUSNESS_SYSTEM,
              code: "Non-serious",
              display: "Non-serious",
            },
      ],
    },
    severity: { coding: [severity] },
    study: [{ reference: `ResearchStudy/${event.study_id}` }],
  };

  if (event.outcome) {
    const outcome = outcomeMap[event.outcome];

    if (!outcome) {
      throw new Error("Unsupported adverse event outcome.");
    }

    resource.outcome = { coding: [outcome] };
  }

  if (extensions.length > 0) {
    resource.extension = extensions;
  }

  return resource;
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
