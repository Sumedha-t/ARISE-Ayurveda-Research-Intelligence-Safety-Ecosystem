"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { ShieldCheck, UserCheck, Stethoscope, AlertTriangle, ClipboardList, Leaf, ArrowRight } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("admin@aiia.gov.in")
  const [password, setPassword] = useState("Arise@2026")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [logoError, setLogoError] = useState(false)

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

      if (authError) {
        setError(authError.message)
        setLoading(false)
      } else {
        router.push("/")
        router.refresh()
      }
    } catch (err: any) {
      setError(err?.message || "Authentication failed")
      setLoading(false)
    }
  }

  const setRolePreset = (presetEmail: string) => {
    setEmail(presetEmail)
    setPassword("Arise@2026")
  }

  return (
    <div className="min-h-screen w-full bg-[#F6F3EC] text-[#25231F] flex items-center justify-center p-4 sm:p-6 antialiased">
      <div className="w-full max-w-4xl rounded-2xl border border-[#E5DFD3] bg-[#FCFAF7] shadow-lg overflow-hidden grid grid-cols-1 md:grid-cols-2">
        
        {/* Left Editorial Panel (Ayurvedic Clinical Context) */}
        <div className="p-8 bg-[#FAF7F0] border-b md:border-b-0 md:border-r border-[#E5DFD3] flex flex-col justify-between">
          <div className="space-y-6">
            {/* Real Logo Container */}
            <div className="flex items-center gap-3">
              <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#2D5A27]/10 border border-[#2D5A27]/25 p-1">
                {!logoError ? (
                  <Image
                    src="/logo.png"
                    alt="ARISE Logo"
                    width={40}
                    height={40}
                    className="object-contain"
                    onError={() => setLogoError(true)}
                  />
                ) : (
                  <Leaf className="h-6 w-6 text-[#2D5A27]" />
                )}
              </div>
              <div>
                <div className="text-base font-bold tracking-tight text-[#25231F]">ARISE CTMS</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-[#2D5A27]">
                  All India Institute of Ayurveda
                </div>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#2D5A27]/10 border border-[#2D5A27]/25 px-3 py-1 text-[11px] font-bold text-[#2D5A27]">
              <ShieldCheck className="h-3.5 w-3.5" />
              SECURE CLINICAL ENVIRONMENT
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight text-[#25231F]">
                Ayurveda Research Intelligence & Safety Ecosystem
              </h2>
              <p className="text-xs text-[#6B6355] leading-relaxed">
                Institutional clinical trial lifecycle management, classical phenotype capture (Prakriti, Agni, Ashtavidha Pariksha), and statutory pharmacovigilance under GCP-ASU and NDCT 2019 Rule 67.
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-[#E5DFD3] space-y-2 text-[11px] font-medium text-[#6B6355]">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#2D5A27]" />
              <span>GCP-ASU aligned clinical protocols</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#C87D0E]" />
              <span>NDCT 2019 Rule 67 automated 24h SAE countdown</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#2D5A27]" />
              <span>HL7 FHIR Release 4 & CDISC SDTM v3.3 export</span>
            </div>
          </div>
        </div>

        {/* Right Authentication Panel */}
        <div className="p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            <div>
              <h3 className="text-xl font-bold tracking-tight text-[#25231F]">Research Portal</h3>
              <p className="text-xs text-[#6B6355] mt-0.5">Sign in to access authorized trial command workflows</p>
            </div>

            {/* 1-Click Persona Selectors */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B6355]">
                  Select Demo Persona
                </span>
                <span className="text-[10px] font-mono text-[#2D5A27]">AIIA Research Network</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRolePreset("admin@aiia.gov.in")}
                  className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                    email === "admin@aiia.gov.in"
                      ? "border-[#2D5A27] bg-[#2D5A27]/10 text-[#2D5A27] shadow-xs"
                      : "border-[#E5DFD3] bg-[#FAF8F5] text-[#25231F] hover:bg-[#F2ECE1]"
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <UserCheck className="h-3.5 w-3.5 text-[#2D5A27]" />
                    <span>Admin</span>
                  </div>
                  <div className="text-[10px] text-[#6B6355] mt-0.5">System Controller</div>
                </button>

                <button
                  type="button"
                  onClick={() => setRolePreset("pi@aiia.gov.in")}
                  className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                    email === "pi@aiia.gov.in"
                      ? "border-[#2D5A27] bg-[#2D5A27]/10 text-[#2D5A27] shadow-xs"
                      : "border-[#E5DFD3] bg-[#FAF8F5] text-[#25231F] hover:bg-[#F2ECE1]"
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <Stethoscope className="h-3.5 w-3.5 text-[#2D5A27]" />
                    <span>PI</span>
                  </div>
                  <div className="text-[10px] text-[#6B6355] mt-0.5">Principal Investigator</div>
                </button>

                <button
                  type="button"
                  onClick={() => setRolePreset("npvcc@aiia.gov.in")}
                  className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                    email === "npvcc@aiia.gov.in"
                      ? "border-[#2D5A27] bg-[#2D5A27]/10 text-[#2D5A27] shadow-xs"
                      : "border-[#E5DFD3] bg-[#FAF8F5] text-[#25231F] hover:bg-[#F2ECE1]"
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <AlertTriangle className="h-3.5 w-3.5 text-[#C87D0E]" />
                    <span>NPvCC Officer</span>
                  </div>
                  <div className="text-[10px] text-[#6B6355] mt-0.5">Pharmacovigilance Lead</div>
                </button>

                <button
                  type="button"
                  onClick={() => setRolePreset("coordinator@aiia.gov.in")}
                  className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                    email === "coordinator@aiia.gov.in"
                      ? "border-[#2D5A27] bg-[#2D5A27]/10 text-[#2D5A27] shadow-xs"
                      : "border-[#E5DFD3] bg-[#FAF8F5] text-[#25231F] hover:bg-[#F2ECE1]"
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <ClipboardList className="h-3.5 w-3.5 text-[#2D5A27]" />
                    <span>Coordinator</span>
                  </div>
                  <div className="text-[10px] text-[#6B6355] mt-0.5">Clinical Operations</div>
                </button>
              </div>
            </div>

            {/* Credentials Input Form */}
            <form onSubmit={handleLogin} className="space-y-3.5">
              {error && (
                <div className="rounded-lg bg-[#B94A2B]/10 border border-[#B94A2B]/30 p-2.5 text-xs text-[#B94A2B] font-medium">
                  {error}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#6B6355]">Institutional Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-lg border border-[#E5DFD3] bg-[#FAF8F5] px-3 py-2 text-xs font-medium text-[#25231F] focus:border-[#2D5A27] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#6B6355]">Security Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-lg border border-[#E5DFD3] bg-[#FAF8F5] px-3 py-2 text-xs font-medium text-[#25231F] focus:border-[#2D5A27] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#2D5A27] hover:bg-[#23491E] py-2.5 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50 mt-1"
              >
                <span>{loading ? "Authenticating Persona..." : "Sign In to ARISE"}</span>
                {!loading && <ArrowRight className="h-3.5 w-3.5" />}
              </button>
            </form>
          </div>

          <div className="pt-4 border-t border-[#E5DFD3] flex justify-between text-[10px] text-[#6B6355]">
            <span>AIIA Clinical Research Platform</span>
            <span className="font-mono">ARISE v0.1 • Production</span>
          </div>
        </div>

      </div>
    </div>
  )
}