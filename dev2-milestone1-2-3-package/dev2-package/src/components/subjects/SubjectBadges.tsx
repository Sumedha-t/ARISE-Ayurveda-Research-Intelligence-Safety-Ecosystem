import type { AgniType, PrakritiType } from "@/types/trial";

export function ConsentBadge({
  obtained,
  version,
  date,
  method,
}: {
  obtained: boolean;
  version: string;
  date: string | null;
  method: string;
}) {
  return (
    <div
      className={`rounded-lg border px-4 py-3 text-xs ${
        obtained ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-700"
      }`}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wide mb-1">
        DPDP Consent {obtained ? "— Obtained" : "— Not Obtained"}
      </p>
      <div className="flex flex-wrap gap-x-4 gap-y-0.5">
        <span>ICF version: {version}</span>
        <span>Date: {date ?? "—"}</span>
        <span>Method: {method}</span>
      </div>
    </div>
  );
}

const PRAKRITI_LABELS: Record<PrakritiType, string> = {
  VATA: "Vata",
  PITTA: "Pitta",
  KAPHA: "Kapha",
  VATA_PITTA: "Vata-Pitta",
  PITTA_KAPHA: "Pitta-Kapha",
  VATA_KAPHA: "Vata-Kapha",
  SAMADOSHA: "Samadosha",
};

const AGNI_LABELS: Record<AgniType, string> = {
  SAMAGNI: "Samagni",
  TIKSHNAGNI: "Tikshnagni",
  MANDAGNI: "Mandagni",
  VISHAMAGNI: "Vishamagni",
};

export function PrakritiAgniBadges({ prakriti, agni }: { prakriti: PrakritiType; agni: AgniType }) {
  return (
    <div className="flex gap-2">
      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
        Prakriti: {PRAKRITI_LABELS[prakriti]}
      </span>
      <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800">
        Agni: {AGNI_LABELS[agni]}
      </span>
    </div>
  );
}
