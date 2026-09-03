import { ASHTAVIDHA_LABELS, type AshtavidhaPariksha } from "@/types/subject";

const ORDER: (keyof AshtavidhaPariksha)[] = [
  "nadi",
  "mutra",
  "mala",
  "jihva",
  "shabda",
  "sparsha",
  "drik",
  "akriti",
];

export function AshtavidhaGrid({ data }: { data: AshtavidhaPariksha }) {
  return (
    <div>
      <h3 className="text-sm font-bold text-slate-900 mb-1">Ashtavidha Pariksha</h3>
      <p className="text-xs text-slate-500 mb-4">The eight-fold classical Ayurvedic clinical baseline.</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {ORDER.map((key) => (
          <div
            key={key}
            className="rounded-lg border border-slate-200 bg-white p-3 hover:border-emerald-300 hover:shadow-sm transition-colors"
          >
            <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
              {ASHTAVIDHA_LABELS[key]}
            </p>
            <p className="mt-1.5 text-sm text-slate-800">{data[key]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
