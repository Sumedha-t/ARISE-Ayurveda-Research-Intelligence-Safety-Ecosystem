// Append-only audit ledger.
//
// This is an in-memory stand-in for what would be a Postgres table guarded
// by a real BEFORE UPDATE / BEFORE DELETE trigger (the kind ALCOA+ /
// Part 11-style audit trails require). The point of this module isn't the
// storage backend — it's that UPDATE and DELETE are structurally refused
// here, in server code, rather than the UI simply not offering an edit
// button. Swapping this for a real Postgres trigger later doesn't change
// the API route or the UI at all.

export type LedgerEntry = {
  id: string;
  studyId: string;
  actorRole: string;
  action: string;
  recordedAtISO: string;
  hash: string;
};

const ledger: LedgerEntry[] = [];
let seq = 0;

function fakeHash(input: string): string {
  // Not cryptographically meaningful — just enough to show each entry is
  // content-addressed, the way a real tamper-evident log would chain hashes.
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (Math.imul(31, h) + input.charCodeAt(i)) | 0;
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

export function appendAuditEntry(studyId: string, actorRole: string, action: string): LedgerEntry {
  seq += 1;
  const entry: LedgerEntry = {
    id: `LEDGER-${String(seq).padStart(4, "0")}`,
    studyId,
    actorRole,
    action,
    recordedAtISO: new Date().toISOString(),
    hash: fakeHash(`${studyId}:${actorRole}:${action}:${seq}`),
  };
  ledger.push(entry);
  return entry;
}

export function listAuditEntries(): LedgerEntry[] {
  return [...ledger];
}

// Deliberately refuses. Any caller — API route, admin tool, or a compromised
// client — hits this same rejection, because there is no code path in this
// module that mutates an existing entry.
export function attemptMutate(entryId: string): { ok: false; reason: string } {
  return {
    ok: false,
    reason: `Rejected: ledger entry ${entryId} is append-only. UPDATE is not a supported operation on audit records (ALCOA+ / 21 CFR Part 11 requires the original entry to remain intact).`,
  };
}

export function attemptDelete(entryId: string): { ok: false; reason: string } {
  return {
    ok: false,
    reason: `Rejected: ledger entry ${entryId} cannot be deleted. Audit records may only be appended to or superseded by a new, separately-logged correction entry.`,
  };
}
