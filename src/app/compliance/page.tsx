"use client";

import { useEffect, useState } from "react";
import RegulatoryCountdown from "@/components/compliance/regulatory-countdown";

type AdverseEvent = {
  id: string;
  event_term: string;
  severity: "MILD" | "MODERATE" | "SEVERE";
  is_serious: boolean;
  causality_type: string;
  workflow_status: string;
  regulatory_deadline: string | null;
};

export default function CompliancePage() {
  const [adverseEvent, setAdverseEvent] = useState<AdverseEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAdverseEvent() {
      try {
       const response = await fetch(
  "/api/adverse-events?studyId=bd80cffa-ec26-5592-a626-63acdd761bf0",
);

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to load adverse event");
        }

        const events = result.data ?? [];

        const seriousEvent = events.find(
          (event: AdverseEvent) => event.is_serious === true,
        );

        setAdverseEvent(seriousEvent ?? null);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load adverse event",
        );
      } finally {
        setLoading(false);
      }
    }

    loadAdverseEvent();
  }, []);

  if (loading) {
    return (
      <main style={{ maxWidth: "900px", margin: "40px auto", padding: "20px" }}>
        <h1>Compliance & Safety</h1>
        <p>Loading safety data...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main style={{ maxWidth: "900px", margin: "40px auto", padding: "20px" }}>
        <h1>Compliance & Safety</h1>
        <p>{error}</p>
      </main>
    );
  }

  if (!adverseEvent) {
    return (
      <main style={{ maxWidth: "900px", margin: "40px auto", padding: "20px" }}>
        <h1>Compliance & Safety</h1>
        <p>No serious adverse event is currently available.</p>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: "900px", margin: "40px auto", padding: "20px" }}>
      <h1>Compliance & Safety</h1>

      <div
        style={{
          marginTop: "24px",
          padding: "24px",
          border: "1px solid #ddd",
          borderRadius: "12px",
        }}
      >
        <h2>Serious Adverse Event</h2>

        <p>
          <strong>Event:</strong> {adverseEvent.event_term}
        </p>

        <p>
          <strong>Severity:</strong> {adverseEvent.severity}
        </p>

        <p>
          <strong>Causality:</strong> {adverseEvent.causality_type}
        </p>

        <p>
          <strong>Status:</strong> {adverseEvent.workflow_status}
        </p>

        <div style={{ marginTop: "24px" }}>
          <RegulatoryCountdown
            deadline={adverseEvent.regulatory_deadline}
          />
        </div>
      </div>
    </main>
  );
}