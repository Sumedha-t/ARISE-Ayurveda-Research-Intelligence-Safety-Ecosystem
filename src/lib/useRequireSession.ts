"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadSession, type Session } from "./session";

// Redirects to /login if no session exists yet. Returns the session once
// resolved so pages can render nothing (avoiding a flash) until then.
export function useRequireSession(): Session | null {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const existing = loadSession();
    if (!existing) {
      router.replace("/login");
      return;
    }
    setSession(existing);
  }, [router]);

  return session;
}
