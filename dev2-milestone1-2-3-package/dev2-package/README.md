# Dev 2 — Milestone 1: Create Study Wizard (fixed against real dev1-foundation)

## What changed since the last handoff

Verified this package directly against the actual `dev1-foundation` branch
(commit `eda6e71`, uploaded zip) and the real frozen schema
(`supabase/migrations/003_study_lifecycle_upgrade.sql`) — not against Dev 1's
chat description. Found and fixed two real breakages:

1. **`src/types/trial.ts` on the real branch does NOT contain
   `StudyType`, `MonitoringFrequency`, `InterventionType`,
   `CriterionType`, or `CriteriaResult`** — despite Dev 1's message
   listing them as available there. The real file only has `UserRole`,
   `StudyPhase`, `PrakritiType`, `AgniType`, and the AE/safety types
   (`AeSeverity`, `AeCausality`, `AeOutcome`, `AeWorkflowStatus`,
   `DeadlineType`). Fix: those five types are now defined locally in
   `src/types/study-wizard.ts`, sourced from the actual CHECK constraints
   in migration 003 (confirmed correct values). Only `AgniType`,
   `PrakritiType`, `StudyPhase` are still imported from `trial.ts`, since
   those genuinely exist there. If Dev 1 later adds the missing five to
   `trial.ts`, delete the local defs in `study-wizard.ts` and re-point the
   import — nothing else needs to change.

2. **`src/lib/profile.ts` on the real branch exports
   `getCurrentUserProfile()`** (no-arg, calls `createClient()`
   internally, returns `{id, full_name, role, email}`) — not
   `getMyProfile(supabase)` as described. Fixed `studies/new/page.tsx`
   accordingly. Route protection (redirect to `/login` when unauthenticated)
   is already handled by `src/proxy.ts` middleware, so the page doesn't
   need its own redirect.

## What's in the package

- `src/types/trial.ts` — Dev 1's real types, copied verbatim for
  standalone type-checking. Do not let this overwrite the real file on
  merge.
- `src/types/study-wizard.ts` — Dev 2-owned types: the five schema-derived
  types above, plus the clinical parameter catalogue, intervention/visit
  shapes, and form-state types.
- `src/components/studies/CreateStudyWizard.tsx` — 6-step tabbed form
  (Basic Details → Clinical Parameters → Interventions → Monitoring
  Schedule → Criteria → Review), mock-state submit, TODO for Supabase
  wiring.
- `src/components/studies/InterventionBuilder.tsx` — dynamic
  DRUG/PATHYA/ANUPANA/LIFESTYLE rows.
- `src/app/(authenticated)/studies/new/page.tsx` — server component using
  the real `getCurrentUserProfile()` pattern.

## Milestone 2 & 3: Subject eCRF Profile + Monitoring (new in this package)

Built against the real schema (`trial_subjects`, `subject_criteria_results`,
`subject_assessments` in `001_initial_schema.sql` / `003_study_lifecycle_upgrade.sql`),
not just Dev 1's message — confirmed the `ashtavidha_pariksha` JSONB key
names (`nadi`, `mutra`, `mala`, `jihva`, `shabda`, `sparsha`, `drik`,
`akriti`) and consent fields (`consent_obtained`, `consent_version`,
`consent_date`, `consent_method`) match exactly.

- `src/types/subject.ts` — Dev 2-owned types (`TrialSubject`,
  `AshtavidhaPariksha`, `ScreeningCriterionRow`, `SubjectAssessmentRow`),
  same pattern as `study-wizard.ts` — not in `trial.ts`, no collision risk.
- `src/components/subjects/AshtavidhaGrid.tsx` — 8-card grid.
- `src/components/subjects/SubjectBadges.tsx` — DPDP consent badge +
  Prakriti/Agni badges.
- `src/components/subjects/ScreeningChecklist.tsx` — inclusion/exclusion
  criteria with PASS/FAIL/NOT_ASSESSED (Milestone 3).
- `src/components/subjects/ResultEntryModal.tsx` — assessments timeline
  (DUE/COMPLETED/OVERDUE/NOT_APPLICABLE badges) + the "Enter Clinical
  Result" modal, updates local state to COMPLETED on submit (Milestone 3).
- `src/components/subjects/ParticipantView.tsx` — client component tying
  the above together; hides result-entry actions when `role ===
  "ETHICS_COMMITTEE"` (read-only, consistent with the earlier dashboard
  work's Ethics Committee handling).
- `src/lib/mock/subject-mock.ts` — mock data shaped exactly like the real
  tables, TODO-flagged for the Thursday 1–6:30 PM Supabase wiring window.
- `src/app/(authenticated)/participants/[id]/page.tsx` — server component,
  uses the real `getCurrentUserProfile()`.

## Still true from before

- Standalone TS syntax/type check run in-sandbox (no `@types/react`
  installed here, so `react`/`next` module-not-found and JSX `key`-prop
  errors are environment noise, not real bugs — verified by inspection).
  You still need to run the real `npm run build` / `tsc` locally before
  pushing.
- Drop these files into your local `dev1-foundation` checkout, run the
  real build, then push to your `dev2-frontend` branch.
