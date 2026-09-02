import { NextResponse } from "next/server";
import { getStudy } from "@/lib/data";

// GET /api/studies/:studyId/fhir
//
// Builds real HL7 FHIR R4 resources (ResearchStudy + AdverseEvent, one per
// open safety case) FROM the current study record — this is a live mapper,
// not a stored/hardcoded JSON blob. Change a safety case in src/lib/data.ts
// and the payload below changes with it.
//
// Resources implemented: ResearchStudy, AdverseEvent
// Reference: https://hl7.org/fhir/R4/researchstudy.html
//            https://hl7.org/fhir/R4/adverseevent.html
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ studyId: string }> }
) {
  const { studyId } = await params;
  const study = getStudy(studyId);

  if (!study) {
    return NextResponse.json({ error: `Study ${studyId} not found` }, { status: 404 });
  }

  const researchStudy = {
    resourceType: "ResearchStudy",
    id: study.id,
    identifier: [{ system: "https://ctri.nic.in", value: study.ctri }],
    title: study.name,
    status: study.studyStatus === "Active" ? "active" : study.studyStatus === "Planning" ? "in-review" : "closed-to-accrual",
    category: [{ text: study.type }],
    phase: {
      coding: [{ system: "https://research-study-phase", code: study.phase, display: study.phase }],
    },
    sponsor: { display: study.sponsor },
    enrollment: {
      current: study.enrollment.current,
      target: study.enrollment.target,
    },
    period: { start: undefined },
  };

  const adverseEvents = study.safety.cases.map((c) => ({
    resourceType: "AdverseEvent",
    id: c.id,
    actuality: "actual",
    category: [{ coding: [{ code: c.kind === "SAE" ? "serious" : "non-serious" }] }],
    event: { text: `${c.kind} — ${c.severity}${c.causality ? ` (${c.causality})` : ""}` },
    subject: { reference: `Patient/${c.participantId}` },
    study: [{ reference: `ResearchStudy/${study.id}` }],
    severity: { text: c.severity },
    outcome: { text: c.status },
    ...(c.deadlineISO ? { recordedDate: c.deadlineISO } : {}),
  }));

  return NextResponse.json({
    resourceType: "Bundle",
    type: "collection",
    generatedAt: new Date().toISOString(),
    entry: [{ resource: researchStudy }, ...adverseEvents.map((r) => ({ resource: r }))],
  });
}
