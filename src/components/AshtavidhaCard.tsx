import type { AshtavidhaPariksha } from "@/lib/data";

const FIELDS: { key: keyof AshtavidhaPariksha; label: string; sanskrit: string }[] = [
  { key: "nadi", label: "Pulse", sanskrit: "Nadi" },
  { key: "mootra", label: "Urine", sanskrit: "Mootra" },
  { key: "mala", label: "Bowel", sanskrit: "Mala" },
  { key: "jihwa", label: "Tongue", sanskrit: "Jihwa" },
  { key: "shabda", label: "Voice", sanskrit: "Shabda" },
  { key: "sparsha", label: "Skin", sanskrit: "Sparsha" },
  { key: "drik", label: "Eyes", sanskrit: "Drik" },
  { key: "akruti", label: "Build/Gait", sanskrit: "Akruti" },
];

// Renders whatever is on the participant record — every field is read from
// `data`, nothing here is a fixed example value.
export function AshtavidhaCard({ data }: { data: AshtavidhaPariksha }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-slate-900">Ashtavidha Pariksha</h3>
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
          Eight-fold Examination
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {FIELDS.map((f) => (
          <div key={f.key} className="border border-slate-100 rounded-lg p-2.5">
            <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide">
              {f.sanskrit} <span className="text-slate-400 font-medium normal-case">· {f.label}</span>
            </p>
            <p className="text-xs text-slate-700 mt-1">{data[f.key]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
