"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  AlertTriangle,
  ShieldCheck,
  History,
  FileCode2,
  Leaf
} from "lucide-react"

const ALL_NAV = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard, roles: ["ADMIN", "PI", "NPVCC_OFFICER", "COORDINATOR"] },
  { name: "Studies", href: "/studies", icon: FolderKanban, roles: ["ADMIN", "PI", "COORDINATOR"] },
  { name: "Participants", href: "/participants", icon: Users, roles: ["ADMIN", "PI", "COORDINATOR"] },
  { name: "Adverse Events", href: "/adverse-events", icon: AlertTriangle, roles: ["ADMIN", "PI", "NPVCC_OFFICER"] },
  { name: "Compliance", href: "/compliance", icon: ShieldCheck, roles: ["ADMIN", "COORDINATOR"] },
  { name: "Audit Trail", href: "/audit", icon: History, roles: ["ADMIN"] },
  { name: "Interoperability", href: "/interoperability", icon: FileCode2, roles: ["ADMIN", "NPVCC_OFFICER"] },
]

export function AppSidebar({ userRole = "ADMIN" }: { userRole?: string }) {
  const pathname = usePathname()
  const [logoError, setLogoError] = useState(false)

  // Real database-backed RBAC filtering
  const visibleNav = ALL_NAV.filter(item => 
    item.roles.includes(userRole.toUpperCase())
  )

  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[#E5DFD3] bg-[#FCFAF7] text-[#25231F] shadow-xs">
      {/* Brand Header */}
      <div className="flex h-16 items-center gap-3 border-b border-[#E5DFD3] px-5 bg-[#FAF7F0]">
        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#2D5A27]/10 border border-[#2D5A27]/20">
          {!logoError ? (
            <Image
              src="/logo.png"
              alt="ARISE Logo"
              width={30}
              height={30}
              className="object-contain"
              onError={() => setLogoError(true)}
            />
          ) : (
            <Leaf className="h-5 w-5 text-[#2D5A27]" />
          )}
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-sm tracking-tight text-[#25231F]">ARISE CTMS</span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#2D5A27]">
            AIIA AYUSH Platform
          </span>
        </div>
      </div>

      {/* Dynamic Nav Items */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {visibleNav.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
                isActive
                  ? "bg-[#2D5A27] text-white shadow-xs"
                  : "text-[#6B6355] hover:bg-[#F2ECE1] hover:text-[#25231F]"
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-[#7A7164]"}`} />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer Regulatory Badge */}
      <div className="border-t border-[#E5DFD3] p-4 bg-[#FAF7F0]">
        <div className="flex items-center justify-between rounded-lg bg-[#F0EBE0] border border-[#E0D7C6] p-2.5">
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-[#2D5A27]">GCP-ASU</span>
            <span className="text-[10px] text-[#6B6355]">NDCT 2019</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold text-[#2D5A27]">Compliant</span>
            <span className="text-[10px] font-mono text-[#C87D0E] font-semibold">Rule 67</span>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default AppSidebar