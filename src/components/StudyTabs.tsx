"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function StudyTabs({ studyId, studyName }: { studyId: string; studyName: string }) {
  const pathname = usePathname();
  const base = `/studies/${studyId}`;

  const tabs = [
    { href: base, label: "Overview" },
    { href: `${base}/participants`, label: "Participants" },
    { href: `${base}/safety`, label: "Safety" },
    { href: `${base}/audit`, label: "Audit Trail" },
  ];

  return (
    <div className="bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-6 pt-4 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-xs font-semibold text-slate-500 hover:text-emerald-700 transition"
          >
            ← All Studies
          </Link>
          <div className="h-4 w-px bg-slate-200" />
          <div>
            <div className="text-sm font-bold text-slate-900 leading-none">{studyId}</div>
            <div className="text-xs text-slate-500 mt-0.5 max-w-md truncate">{studyName}</div>
          </div>
        </div>

        <nav className="flex gap-5 text-sm font-semibold">
          {tabs.map((tab) => {
            const active =
              tab.href === base ? pathname === base : pathname?.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`pb-3 border-b-2 transition ${
                  active
                    ? "border-emerald-700 text-emerald-700"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
