'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  BookOpenCheck,
  Users,
  AlertTriangle,
  ShieldCheck,
  History,
  Activity,
} from 'lucide-react'

const navigationItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Studies', href: '/studies', icon: BookOpenCheck },
  { name: 'Participants', href: '/participants', icon: Users },
  { name: 'Adverse Events', href: '/adverse-events', icon: AlertTriangle },
  { name: 'Compliance', href: '/compliance', icon: ShieldCheck },
  { name: 'Audit Trail', href: '/audit', icon: History },
]

export const AppSidebar = () => {
  const pathname = usePathname()

  return (
    <aside className="w-60 bg-slate-950 border-r border-slate-800 flex flex-col h-screen sticky top-0 shrink-0">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-5 gap-3 border-b border-slate-800">
        <div className="h-8 w-8 rounded-md bg-emerald-600 flex items-center justify-center text-white font-bold shrink-0">
          <Activity className="h-5 w-5" />
        </div>
        <div>
          <span className="font-bold text-slate-100 text-sm tracking-wide block">
            ARISE CTMS
          </span>
          <span className="text-[10px] text-emerald-400 font-mono font-medium block">
            AIIA AYUSH PLATFORM
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navigationItems.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href)

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <item.icon
                className={`h-4 w-4 shrink-0 ${
                  isActive ? 'text-emerald-400' : 'text-slate-500'
                }`}
              />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Compliance Indicator Footer */}
      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-900 rounded p-2.5 border border-slate-800 text-[11px] text-slate-400 space-y-1 font-mono">
          <div className="flex justify-between">
            <span>GCP-ASU</span>
            <span className="text-emerald-400 font-medium">Compliant</span>
          </div>
          <div className="flex justify-between">
            <span>NDCT 2019</span>
            <span className="text-emerald-400 font-medium">Rule 67</span>
          </div>
        </div>
      </div>
    </aside>
  )
}