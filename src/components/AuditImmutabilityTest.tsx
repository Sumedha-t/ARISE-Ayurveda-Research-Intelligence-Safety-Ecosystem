"use client";

import { useState } from "react";

type Result = {
  attempted: string;
  targetEntryId: string;
  targetEntryHash: string;
  result: { ok: false; reason: string };
};

// Hits POST /api/audit/immutability-test, which actually appends a ledger
// entry server-side and then actually attempts to mutate/delete it — the
// rejection shown below is the real response from that guard, not a
// canned UI string.
export function AuditImmutabilityTest({ studyId }: { studyId: string }) {
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);

  async function run(action: "update" | "delete") {
    setLoading(true);
    try {
      const res = await fetch("/api/audit/immutability-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studyId, action }),
      });
      const json = (await res.json()) as Result;
      setResult(json);
    } catch {
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <h3 className="text-sm font-bold text-slate-900 mb-1">Tamper-Proof Verification</h3>
      <p className="text-xs text-slate-500 mb-3">
        Attempts a real UPDATE or DELETE against the append-only audit ledger and shows the server&apos;s rejection.
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={loading}
          onClick={() => run("update")}
          className="text-xs font-semibold border border-slate-300 hover:border-slate-400 text-slate-700 px-3 py-1.5 rounded-md transition disabled:opacity-60"
        >
          Test UPDATE
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => run("delete")}
          className="text-xs font-semibold border border-red-300 hover:border-red-400 text-red-700 px-3 py-1.5 rounded-md transition disabled:opacity-60"
        >
          Test DELETE
        </button>
      </div>

      {result && (
        <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-xs font-bold text-red-700">
            {result.attempted.toUpperCase()} rejected on {result.targetEntryId} (hash {result.targetEntryHash})
          </p>
          <p className="text-xs text-red-700 mt-1">{result.result.reason}</p>
        </div>
      )}
    </div>
  );
}
