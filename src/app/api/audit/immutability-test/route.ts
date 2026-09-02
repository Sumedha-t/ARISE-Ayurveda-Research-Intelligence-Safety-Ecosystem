import { NextResponse } from "next/server";
import { appendAuditEntry, attemptDelete, attemptMutate, listAuditEntries } from "@/lib/auditLedger";

// POST /api/audit/immutability-test
// Body: { studyId: string, action: "update" | "delete" }
//
// This is the "Test Audit Immutability" button's backend. It:
//   1. Appends a real entry to the in-memory ledger (so there's something
//      to attack).
//   2. Actually attempts the requested UPDATE or DELETE against it.
//   3. Returns the ledger's real rejection — the same rejection any caller
//      would get, not a canned string chosen by the UI.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const studyId = typeof body.studyId === "string" ? body.studyId : "UNKNOWN";
  const action = body.action === "delete" ? "delete" : "update";

  const entry = appendAuditEntry(studyId, "PHARMACOVIGILANCE_OFFICER", "Simulated tamper-test write");

  const result = action === "delete" ? attemptDelete(entry.id) : attemptMutate(entry.id);

  return NextResponse.json(
    {
      attempted: action,
      targetEntryId: entry.id,
      targetEntryHash: entry.hash,
      result,
      ledgerSize: listAuditEntries().length,
    },
    { status: 409 }
  );
}

export async function GET() {
  return NextResponse.json({ entries: listAuditEntries() });
}
