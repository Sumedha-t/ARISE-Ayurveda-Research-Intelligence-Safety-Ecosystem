import { NextResponse } from "next/server";
import { getStudy } from "@/lib/data";

// GET /api/studies/:studyId
// Server-side read of a single study record. Every other route under
// /api/studies/:studyId/** builds on top of this same data access function —
// nothing in this file is client-side mock state.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ studyId: string }> }
) {
  const { studyId } = await params;
  const study = getStudy(studyId);

  if (!study) {
    return NextResponse.json({ error: `Study ${studyId} not found` }, { status: 404 });
  }

  return NextResponse.json(study);
}
