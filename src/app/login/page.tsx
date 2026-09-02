"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ROLE_LABELS, ROLES, type Role } from "@/lib/data";
import { saveSession } from "@/lib/session";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("PI");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveSession({ role, email: email || `${role.toLowerCase()}@aiia.gov.in` });
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="text-center mb-8">
        <Image
          src="/logo.png"
          alt="ARISE logo"
          width={88}
          height={88}
          className="mx-auto mb-4"
          priority
        />
        <div className="inline-flex items-center gap-2 mb-3">
          <span className="text-lg font-bold text-slate-900">AyurCTMS</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">
          Ayurveda Clinical Trial Management System
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          National Pharmacovigilance Hub &amp; Clinical Trials
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm w-full max-w-sm p-7">
        <h2 className="text-base font-bold text-slate-900 mb-5">Log in</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-600">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@aiia.gov.in"
              className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
            />
          </div>

          <button
            type="submit"
            className="mt-2 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold py-2.5 rounded-md transition"
          >
            Log in
          </button>
        </form>
      </div>

      <div className="w-full max-w-sm mt-6">
        <p className="text-xs font-semibold text-slate-500 mb-2 text-center">Demo Roles</p>
        <div className="grid grid-cols-2 gap-2">
          {ROLES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`text-xs font-medium px-3 py-2 rounded-md border transition text-left ${
                role === r
                  ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              {ROLE_LABELS[r]}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-slate-400 mt-3 text-center">
          Select a role, then log in — no credentials required in this demo.
        </p>
      </div>
    </div>
  );
}
