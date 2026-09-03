"use client";

import { FormEvent, useState } from "react";

type ProtocolDeviationFormProps = {
  studyId: string;
  subjectId?: string | null;
};

export default function ProtocolDeviationForm({
  studyId,
  subjectId = null,
}: ProtocolDeviationFormProps) {
  const [deviationType, setDeviationType] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<"MILD" | "MODERATE" | "SEVERE">(
    "MILD",
  );
  const [correctiveAction, setCorrectiveAction] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/protocol-deviations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          study_id: studyId,
          subject_id: subjectId,
          deviation_type: deviationType,
          description,
          severity,
          corrective_action: correctiveAction || null,
          status: "Logged",
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create protocol deviation");
      }

      setMessage("Protocol deviation recorded successfully.");
      setDeviationType("");
      setDescription("");
      setSeverity("MILD");
      setCorrectiveAction("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create protocol deviation",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Protocol Deviation</h2>

      <div>
        <label htmlFor="deviation-type">Deviation type</label>
        <input
          id="deviation-type"
          type="text"
          value={deviationType}
          onChange={(event) => setDeviationType(event.target.value)}
          placeholder="e.g. Missed assessment"
          required
        />
      </div>

      <div>
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Describe the protocol deviation"
          required
          rows={4}
        />
      </div>

      <div>
        <label htmlFor="severity">Severity</label>
        <select
          id="severity"
          value={severity}
          onChange={(event) =>
            setSeverity(
              event.target.value as "MILD" | "MODERATE" | "SEVERE",
            )
          }
        >
          <option value="MILD">Mild</option>
          <option value="MODERATE">Moderate</option>
          <option value="SEVERE">Severe</option>
        </select>
      </div>

      <div>
        <label htmlFor="corrective-action">Corrective action</label>
        <textarea
          id="corrective-action"
          value={correctiveAction}
          onChange={(event) => setCorrectiveAction(event.target.value)}
          placeholder="Describe corrective action, if applicable"
          rows={3}
        />
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Record Deviation"}
      </button>

      {message && <p>{message}</p>}
      {error && <p>{error}</p>}
    </form>
  );
}