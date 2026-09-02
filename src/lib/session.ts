"use client";

import type { Role } from "./data";

const KEY = "aiia_ayurctms_session";

export type Session = { role: Role; email: string };

export function saveSession(session: Session) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(KEY, JSON.stringify(session));
}

export function loadSession(): Session | null {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export function clearSession() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(KEY);
}
