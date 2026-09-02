# ARISE — AIIA AyurCTMS

**A**yurveda **R**esearch **I**ntelligence & **S**afety **E**cosystem — a Clinical Trial
Management System for Ayurveda trials, built for SIH 2026, tailored to GCP-ASU
(Good Clinical Practice for ASU Medicine) rather than a generic allopathic
trial dashboard.

Built with Next.js 16 (App Router, Turbopack), React 19, TypeScript, and
Tailwind CSS 4.

---

## What's actually working right now

Everything below is implemented and running — not a mockup screenshot.

### Screens

| Screen | Route | Status |
|---|---|---|
| Login / role picker | `/login` | ✅ |
| Portfolio Command Center | `/` | ✅ |
| Study Overview | `/studies/[studyId]` | ✅ |
| Participants Registry | `/studies/[studyId]/participants` | ✅ |
| Participant eCRF Deep-Dive | `/studies/[studyId]/participants/[participantId]` | ✅ (incl. Ashtavidha Pariksha card) |
| Safety Center (AE/SAE) | `/studies/[studyId]/safety` | ✅ (incl. live regulatory countdown) |
| Audit Trail | `/studies/[studyId]/audit` | ✅ (incl. tamper-proof verification demo) |

### Backend — real server-side routes, not client-side mock state

The UI used to just read a static JS object directly. It now goes through
actual Next.js Route Handlers (`src/app/api/**`) that compute their response
on every request:

| Endpoint | Method | What it does |
|---|---|---|
| `/api/studies/[studyId]` | `GET` | Serves a study record as JSON |
| `/api/studies/[studyId]/fhir` | `GET` | Builds an HL7 **FHIR R4** `Bundle` (`ResearchStudy` + one `AdverseEvent` per open safety case) from the current study data — a live mapper, not a saved JSON file |
| `/api/studies/[studyId]/sdtm?domain=dm\|ae` | `GET` | Generates a **CDISC SDTM**-style CSV (`DM` domain from participants, `AE` domain from safety cases) and returns it as a downloadable file |
| `/api/studies/[studyId]/safety/[caseId]/countdown` | `GET` | Computes real remaining/overdue time against a safety case's regulatory reporting deadline |
| `/api/audit/immutability-test` | `POST` | Appends an entry to an in-memory **append-only audit ledger**, then actually attempts an UPDATE or DELETE against it, and returns the ledger's real rejection |

The frontend calls these with `fetch()` — the "FHIR Preview" button renders
whatever the API just computed, the "SDTM Export" buttons download whatever
CSV the API just generated, and the countdown badges on the Safety Center
poll the countdown endpoint and tick down live.

### Ayurveda-specific data model

Not generic vitals — the participant record captures the classical clinical
baseline GCP-ASU trials require:

- **Prakriti** (constitution), **Dosha**, **Agni**, **Koshtha**, **Bala**
- **Ashtavidha Pariksha** — the eight-fold exam (Nadi, Mootra, Mala, Jihwa,
  Shabda, Sparsha, Drik, Akruti), its own card on the participant page
- **Anupana** (vehicle/adjuvant) and **Kala** (timing of dose) on every
  intervention record
- **Protocol deviations**, tracked per study with a corrective-action note

### Branding

The ARISE logo is wired into the top bar (every page), the login screen, and
the browser tab icon / iOS home-screen icon (`src/app/icon.png` and
`src/app/apple-icon.png` — Next.js App Router picks these up automatically,
no manifest needed).

---

## What's still mocked / not yet built

Being upfront about this for judges and for our own planning:

- **No real database yet.** `src/lib/data.ts` is the single source of truth
  that every page *and* every API route reads from — so the app behaves
  consistently — but it's an in-memory module, not Postgres/Supabase. Swap
  it for a real DB and none of the API route code changes.
- **No auth.** Login just stores a role in `sessionStorage`
  (`src/lib/session.ts`) — there's no password check, no Supabase Auth, no
  Row-Level Security yet.
- **Audit ledger is in-memory**, not a Postgres table with a real
  `BEFORE UPDATE`/`BEFORE DELETE` trigger. The rejection logic in
  `src/lib/auditLedger.ts` is written so that swapping it for a real
  trigger-backed table doesn't change the API route or the UI at all.
- **Ethics Committee (IEC) and Monitor roles** exist in the role picker but
  don't yet have dedicated read-only views.
- **FHIR/SDTM mappers** cover `ResearchStudy`/`AdverseEvent` and `DM`/`AE`
  domains only — not the full resource/domain set.

## Team & data ownership

- Domain seed data (participant profiles, Ashtavidha Pariksha values, AE/SAE
  cases, protocol deviations) lives entirely in `src/lib/data.ts` — edit
  that one file to change what every screen and every API route shows.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). No credentials needed —
the login screen lets you pick a demo role directly.

## Tech stack

- **Framework:** Next.js 16 (App Router, Turbopack, Route Handlers)
- **UI:** React 19, Tailwind CSS 4, shadcn/ui primitives
- **Language:** TypeScript, strict mode
- **Data:** Centralized in `src/lib/data.ts`, served through `src/app/api/**`
