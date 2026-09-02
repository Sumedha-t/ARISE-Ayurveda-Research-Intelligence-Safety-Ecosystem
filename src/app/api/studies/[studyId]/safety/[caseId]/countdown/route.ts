import { NextResponse } from "next/server";
import { getSafetyCase } from "@/lib/data";

// GET /api/studies/:studyId/safety/:caseId/countdown
//
// Computes remaining (or overdue) time against a safety case's regulatory
// reporting deadline, server-side, on every request. NDCT 2019 Rule 67
// requires SAE initial reports within 24h and follow-up within 7 days —
// the client polls this instead of formatting a static "23h 48m" string.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ studyId: string; caseId: string }> }
) {
  const { studyId, caseId } = await params;
  const safetyCase = getSafetyCase(studyId, caseId);

  if (!safetyCase) {
    return NextResponse.json({ error: `Case ${caseId} not found in ${studyId}` }, { status: 404 });
  }

  if (!safetyCase.deadlineISO) {
    return NextResponse.json({ caseId, hasDeadline: false });
  }

  const deadlineMs = new Date(safetyCase.deadlineISO).getTime();
  const nowMs = Date.now();
  const remainingMs = deadlineMs - nowMs;

  return NextResponse.json({
    caseId,
    hasDeadline: true,
    deadlineISO: safetyCase.deadlineISO,
    nowISO: new Date(nowMs).toISOString(),
    remainingMs,
    isOverdue: remainingMs < 0,
    regulatoryBasis: safetyCase.kind === "SAE" ? "NDCT 2019, Rule 67" : "GCP-ASU AE Reporting Guidance",
  });
}
