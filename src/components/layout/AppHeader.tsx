"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { ShieldCheck, User, LogOut } from "lucide-react"

export function AppHeader({
  userRole = "ADMIN",
  userName = "ARISE Demo Administrator",
}: {
  userRole?: string
  userName?: string
}) {
  const router = useRouter()
  const [signingOut, setSigningOut] = useState(false)

  const handleSignOut = async () => {
    try {
      setSigningOut(true)
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push("/login")
      router.refresh()
    } catch (err) {
      console.error("Sign out error:", err)
      router.push("/login")
    } finally {
      setSigningOut(false)
    }
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-[#E7E2D8] bg-[#FAF8F5]/90 px-6 backdrop-blur-md shadow-xs">
      {/* Current Role Badge */}
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-[#2D5A27]" />
        <span className="text-xs font-semibold uppercase tracking-wider text-[#5C5549]">
          Current Role:
        </span>
        <span className="rounded-md bg-[#2D5A27]/10 border border-[#2D5A27]/25 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-[#2D5A27]">
          {userRole}
        </span>
      </div>

      {/* User Info & Working Sign Out Button */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-xs font-medium text-[#443E35]">
          <User className="h-3.5 w-3.5 text-[#7A7164]" />
          <span>{userName}</span>
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          disabled={signingOut}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#D5CEBF] bg-[#EDE8DF] hover:bg-[#E2DBCF] px-3 py-1.5 text-xs font-semibold text-[#2D2A24] transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
        >
          <LogOut className="h-3.5 w-3.5 text-[#5C5549]" />
          <span>{signingOut ? "Signing out..." : "Sign out"}</span>
        </button>
      </div>
    </header>
  )
}