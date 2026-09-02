import { NextResponse } from "next/server";
import { getStudy } from "@/lib/data";

// GET /api/studies/:studyId/sdtm?domain=dm|ae
//
// Generates CDISC SDTM-style domain CSVs directly from the current study
// record — DM (Demographics) from participants, AE (Adverse Events) from
// safety cases. This is computed on every request, so it always reflects
// whatever is currently in src/lib/data.ts (or, once wired to a real
// database, whatever is currently in the DB) rather than a static export
// file checked into the repo.
function toCsv(rows: string[][]): string {
  return rows
    .map((row) =>
      row
        .map((cell) => (cell.includes(",") || cell.includes('"') ? `"${cell.replace(/"/g, '""')}"` : cell))
        .join(",")
    )
    .join("\n");
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ studyId: string }> }
) {
  const { studyId } = await params;
  const study = getStudy(studyId);

  if (!study) {
    return NextResponse.json({ error: `Study ${studyId} not found` }, { status: 404 });
  }

  const domain = (new URL(req.url).searchParams.get("domain") || "dm").toLowerCase();

  let csv: string;
  let filename: string;

  if (domain === "ae") {
    const rows: string[][] = [
      ["STUDYID", "DOMAIN", "AETERM", "AESEV", "AESER", "USUBJID", "AECAUSALITY", "AESTAT"],
      ...study.safety.cases.map((c) => [
        study.id,
        "AE",
        c.kind === "SAE" ? "Serious Adverse Event" : "Adverse Event",
        c.severity.toUpperCase(),
        c.kind === "SAE" ? "Y" : "N",
        c.participantId,
        c.causality ?? "",
        c.status,
      ]),
    ];
    csv = toCsv(rows);
    filename = `${study.id}_AE.csv`;
  } else {
    const rows: string[][] = [
      ["STUDYID", "DOMAIN", "USUBJID", "PRAKRITI", "DOSHA", "AGNI", "KOSHTHA", "ARMCD", "CONSENT"],
      ...study.participants.map((p) => [
        study.id,
        "DM",
        p.id,
        p.prakriti,
        p.dosha,
        p.agni,
        p.koshtha,
        p.intervention.medicine,
        p.consentComplete ? "Y" : "N",
      ]),
    ];
    csv = toCsv(rows);
    filename = `${study.id}_DM.csv`;
  }

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
