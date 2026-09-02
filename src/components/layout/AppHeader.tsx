'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LogoutButton } from '@/components/auth/logout-button'
import { User, ShieldCheck } from 'lucide-react'

interface UserProfile {
  email: string
  role: string
  full_name: string
}

export const AppHeader = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadProfile() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          const { data } = await supabase
            .from('profiles')
            .select('email, role, full_name')
            .eq('id', user.id)
            .single()

          if (data) {
            setProfile(data)
          }
        }
      } catch (e) {
        console.error('Profile fetch failed:', e)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [supabase])

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur px-6 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-slate-300">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Current Role:
          </span>
        </div>

        <span className="px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono font-medium">
          {loading ? 'SYNCING...' : profile?.role || 'AUTHENTICATED'}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-800/80 px-3 py-1.5 rounded border border-slate-700">
          <User className="h-3.5 w-3.5 text-slate-400" />
          <span className="font-medium text-slate-200">
            {profile?.full_name || profile?.email || 'Authenticated User'}
          </span>
        </div>

        <LogoutButton />
      </div>
    </header>
  )
}