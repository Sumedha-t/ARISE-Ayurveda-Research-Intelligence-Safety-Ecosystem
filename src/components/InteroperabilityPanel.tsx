"use client";

import { useState } from "react";

// Calls the real backend routes — GET /api/studies/:id/fhir and
// GET /api/studies/:id/sdtm?domain=dm|ae — nothing here is a fixed
// example payload; the JSON/CSV shown is whatever those routes compute
// from the current study record at request time.
export function InteroperabilityPanel({ studyId }: { studyId: string }) {
  const [fhirJson, setFhirJson] = useState<string | null>(null);
  const [loadingFhir, setLoadingFhir] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFhirPreview() {
    setLoadingFhir(true);
    setError(null);
    try {
      const res = await fetch(`/api/studies/${studyId}/fhir`);
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const json = await res.json();
      setFhirJson(JSON.stringify(json, null, 2));
    } catch {
      setError("Could not load FHIR bundle.");
    } finally {
      setLoadingFhir(false);
    }
  }

  async function handleSdtmExport(domain: "dm" | "ae") {
    setError(null);
    try {
      const res = await fetch(`/api/studies/${studyId}/sdtm?domain=${domain}`);
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${studyId}_${domain.toUpperCase()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setError(`Could not export ${domain.toUpperCase()} domain.`);
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <h3 className="text-sm font-bold text-slate-900 mb-1">Interoperability</h3>
      <p className="text-xs text-slate-500 mb-3">
        Live HL7 FHIR R4 mapping and CDISC SDTM export, generated server-side from this study&apos;s current data.
      </p>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleFhirPreview}
          disabled={loadingFhir}
          className="text-xs font-semibold bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white px-3 py-1.5 rounded-md transition"
        >
          {loadingFhir ? "Loading…" : "FHIR Preview"}
        </button>
        <button
          type="button"
          onClick={() => handleSdtmExport("dm")}
          className="text-xs font-semibold border border-slate-300 hover:border-slate-400 text-slate-700 px-3 py-1.5 rounded-md transition"
        >
          SDTM Export — DM.csv
        </button>
        <button
          type="button"
          onClick={() => handleSdtmExport("ae")}
          className="text-xs font-semibold border border-slate-300 hover:border-slate-400 text-slate-700 px-3 py-1.5 rounded-md transition"
        >
          SDTM Export — AE.csv
        </button>
      </div>

      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}

      {fhirJson && (
        <pre className="mt-3 max-h-64 overflow-auto bg-slate-950 text-emerald-300 text-[10px] leading-relaxed rounded-lg p-3">
          {fhirJson}
        </pre>
      )}
    </div>
  );
}
