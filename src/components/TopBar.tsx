"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ROLE_LABELS, type Role } from "@/lib/data";
import { clearSession } from "@/lib/session";

export function TopBar({ role }: { role: Role }) {
  const router = useRouter();

  return (
    <header className="border-b border-slate-200 bg-white px-6 py-3.5 flex items-center justify-between sticky top-0 z-50 shadow-sm">
      <Link href="/" className="flex items-center gap-3">
        <Image
          src="/logo.png"
          alt="ARISE logo"
          width={36}
          height={36}
          className="rounded-md shrink-0"
          priority
        />
        <div>
          <h1 className="font-bold text-base leading-none text-slate-900">AyurCTMS</h1>
          <p className="text-xs text-slate-500 mt-1">
            Ayurveda Clinical Trial Management System
          </p>
        </div>
      </Link>

      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full text-emerald-800 border border-emerald-300 bg-emerald-50">
          Role: {ROLE_LABELS[role]}
        </span>
        <button
          type="button"
          onClick={() => {
            clearSession();
            router.push("/login");
          }}
          className="text-xs font-medium text-slate-500 hover:text-slate-800 transition"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
