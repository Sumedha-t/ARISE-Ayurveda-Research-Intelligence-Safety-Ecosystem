"use client";

import { useState } from "react";

type ResourceType =
  | "ResearchStudy"
  | "ResearchSubject"
  | "AdverseEvent"
  | "ProtocolDeviation";

const resources: {
  label: string;
  value: ResourceType;
  endpoint: string;
}[] = [
  {
    label: "ResearchStudy",
    value: "ResearchStudy",
    endpoint: "/api/fhir/study",
  },
  {
    label: "ResearchSubject",
    value: "ResearchSubject",
    endpoint: "/api/fhir/research-subject",
  },
  {
    label: "AdverseEvent",
    value: "AdverseEvent",
    endpoint: "/api/fhir/adverse-event",
  },
  {
    label: "Protocol Deviation",
    value: "ProtocolDeviation",
    endpoint: "/api/fhir/protocol-deviation",
  },
];

const DEFAULT_STUDY_ID = "bd80cffa-ec26-5592-a626-63acdd761bf0";
const DEMO_RESOURCE_IDS: Partial<Record<ResourceType, string>> = {
  ResearchStudy: "bd80cffa-ec26-5592-a626-63acdd761bf0",
  ResearchSubject: "cbe8f30d-5c10-47d1-91ff-7408578c83ce",
  AdverseEvent: "5067f478-3ba4-4c51-a12b-14a6affc7cc2",
  ProtocolDeviation: "0bf86ddb-a10c-4792-a4b0-1c81667bef9d",
};

export default function InteroperabilityPage() {
  const [resourceType, setResourceType] =
    useState<ResourceType>("ResearchStudy");

  const [resourceId, setResourceId] = useState(DEFAULT_STUDY_ID);
  const [response, setResponse] = useState<unknown>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [statusCode, setStatusCode] = useState<number | null>(null);

  const selectedResource = resources.find(
    (resource) => resource.value === resourceType
  );

  function handleResourceChange(value: ResourceType) {
  setResourceType(value);
  setResponse(null);
  setError("");
  setStatusCode(null);

  setResourceId(DEMO_RESOURCE_IDS[value] ?? "");
}

  async function inspectResource() {
    if (!selectedResource) return;

    if (!resourceId.trim()) {
      setError("Enter a resource ID first.");
      setResponse(null);
      return;
    }

    setLoading(true);
    setError("");
    setResponse(null);
    setStatusCode(null);

    try {
      const url = `${selectedResource.endpoint}/${encodeURIComponent(
        resourceId.trim()
      )}`;

      const result = await fetch(url, {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/fhir+json, application/json",
        },
      });

      setStatusCode(result.status);

      const contentType = result.headers.get("content-type") ?? "";

      let body: unknown;

      if (contentType.includes("json")) {
        body = await result.json();
      } else {
        body = await result.text();
      }

      if (!result.ok) {
        if (result.status === 401) {
          setError(
            "Unauthorized (401). Your authenticated session is required for this API."
          );
        } else if (result.status === 404) {
          setError("Resource not found (404). Check the resource ID.");
        } else {
          setError(`API request failed with HTTP ${result.status}.`);
        }

        setResponse(body);
        return;
      }

      setResponse(body);
    } catch (err) {
      console.error(err);
      setError(
        "Could not reach the API. Check that the development server is running."
      );
    } finally {
      setLoading(false);
    }
  }

  async function downloadSdtm(type: "dm" | "ae") {
    setLoading(true);
    setError("");

    try {
      const url = `/api/sdtm/${type}/${encodeURIComponent(
        DEFAULT_STUDY_ID
      )}`;

      const result = await fetch(url, {
        method: "GET",
        credentials: "include",
      });

      if (!result.ok) {
        if (result.status === 401) {
          setError(
            "Unauthorized (401). Your authenticated session is required for the SDTM download."
          );
        } else {
          setError(`SDTM download failed with HTTP ${result.status}.`);
        }

        return;
      }

      const blob = await result.blob();

      const downloadUrl = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");

      anchor.href = downloadUrl;
      anchor.download = `AIIA-HTN-001-${type.toUpperCase()}.csv`;

      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error(err);
      setError("Could not download the SDTM dataset.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-emerald-400">
          Interoperability
        </p>

        <h1 className="mt-2 text-3xl font-semibold text-slate-100">
          FHIR Inspector
        </h1>

        <p className="mt-2 text-sm text-slate-400">
          Inspect the live FHIR R4 resources generated from the authenticated
          API.
        </p>
      </div>

      <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
        <div className="flex flex-wrap gap-2">
          {resources.map((resource) => {
            const active = resource.value === resourceType;

            return (
              <button
                key={resource.value}
                type="button"
                onClick={() => handleResourceChange(resource.value)}
                className={[
                  "rounded-lg border px-4 py-2 text-sm font-medium transition",
                  active
                    ? "border-emerald-400 bg-emerald-400/10 text-emerald-300"
                    : "border-slate-700 bg-slate-950 text-slate-300 hover:border-slate-500 hover:text-white",
                ].join(" ")}
              >
                {resource.label}
              </button>
            );
          })}
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-[1fr_auto]">
          <div>
            <label
              htmlFor="resource-id"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              Resource ID
            </label>

            <input
              id="resource-id"
              value={resourceId}
              onChange={(event) => setResourceId(event.target.value)}
              placeholder="Enter FHIR resource ID"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-emerald-400"
            />
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={inspectResource}
              disabled={loading}
              className="w-full rounded-lg bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50 md:w-auto"
            >
              {loading ? "Loading..." : "Inspect FHIR"}
            </button>
          </div>
        </div>

        <div className="mt-3 text-xs text-slate-500">
          Endpoint:{" "}
          <span className="font-mono text-slate-400">
            {selectedResource?.endpoint}/[id]
          </span>
        </div>
      </section>

      {error && (
        <section className="rounded-xl border border-red-900/70 bg-red-950/30 p-4">
          <p className="text-sm font-medium text-red-300">{error}</p>

          {statusCode !== null && (
            <p className="mt-1 text-xs text-red-400">
              HTTP status: {statusCode}
            </p>
          )}
        </section>
      )}

      <section className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">
              API Response
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Live response from the protected FHIR endpoint
            </p>
          </div>

          {statusCode !== null && (
            <span
              className={[
                "rounded-full px-3 py-1 text-xs font-medium",
                statusCode >= 200 && statusCode < 300
                  ? "bg-emerald-400/10 text-emerald-300"
                  : "bg-red-400/10 text-red-300",
              ].join(" ")}
            >
              HTTP {statusCode}
            </span>
          )}
        </div>

        <div className="min-h-[360px] overflow-auto p-5">
          {response === null && !loading ? (
            <div className="flex min-h-[300px] items-center justify-center text-sm text-slate-600">
              Select a resource and inspect it to view the live API response.
            </div>
          ) : loading ? (
            <div className="flex min-h-[300px] items-center justify-center text-sm text-slate-500">
              Requesting protected API...
            </div>
          ) : (
            <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-6 text-emerald-200">
              {typeof response === "string"
                ? response
                : JSON.stringify(response, null, 2)}
            </pre>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-emerald-400">
            SDTM
          </p>

          <h2 className="mt-2 text-xl font-semibold text-slate-100">
            Dataset Downloads
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Download the generated SDTM datasets for the finalized hypertension
            study.
          </p>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => downloadSdtm("dm")}
            disabled={loading}
            className="rounded-lg border border-slate-700 bg-slate-950 px-5 py-3 text-sm font-medium text-slate-200 transition hover:border-emerald-400 hover:text-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Download DM CSV
          </button>

          <button
            type="button"
            onClick={() => downloadSdtm("ae")}
            disabled={loading}
            className="rounded-lg border border-slate-700 bg-slate-950 px-5 py-3 text-sm font-medium text-slate-200 transition hover:border-emerald-400 hover:text-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Download AE CSV
          </button>
        </div>

        <p className="mt-3 text-xs text-slate-600">
          Study: AIIA-HTN-001 · Supabase ID: {DEFAULT_STUDY_ID}
        </p>
      </section>
    </div>
  );
}