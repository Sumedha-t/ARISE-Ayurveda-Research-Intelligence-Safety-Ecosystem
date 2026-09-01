-- ============================================================
-- ARISE - AIIA Clinical Trials Dashboard
-- Migration 002: Row-Level Security
-- Dev 1 Frozen Specification + Protocol Deviation Admin Fix
-- ============================================================


-- ============================================================
-- 1. ENABLE RLS
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE trial_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE adverse_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE protocol_deviations ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- 2. ROLE HELPER FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION get_my_role()
RETURNS user_role AS $$
    SELECT role
    FROM profiles
    WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;


-- ============================================================
-- 3. PROFILES POLICIES
-- ============================================================

CREATE POLICY "Allow public read of profiles"
ON profiles
FOR SELECT
USING (true);

CREATE POLICY "Allow individual update of own profile"
ON profiles
FOR UPDATE
USING (auth.uid() = id);


-- ============================================================
-- 4. STUDIES POLICIES
-- ============================================================

CREATE POLICY "Admin full access on studies"
ON studies
FOR ALL
USING (get_my_role() = 'ADMIN');

CREATE POLICY "PI view assigned studies"
ON studies
FOR SELECT
USING (
    get_my_role() = 'PI'
    AND pi_id = auth.uid()
);

CREATE POLICY "PI update assigned studies"
ON studies
FOR UPDATE
USING (
    get_my_role() = 'PI'
    AND pi_id = auth.uid()
);

CREATE POLICY "Coordinator view all studies"
ON studies
FOR SELECT
USING (
    get_my_role() IN (
        'COORDINATOR',
        'NPVCC_OFFICER',
        'ETHICS_COMMITTEE',
        'MONITOR'
    )
);


-- ============================================================
-- 5. TRIAL SUBJECTS POLICIES
-- ============================================================

CREATE POLICY "Admin full access on subjects"
ON trial_subjects
FOR ALL
USING (get_my_role() = 'ADMIN');

CREATE POLICY "Coordinator manage subjects"
ON trial_subjects
FOR ALL
USING (get_my_role() = 'COORDINATOR');

CREATE POLICY "PI view and edit study subjects"
ON trial_subjects
FOR ALL
USING (
    get_my_role() = 'PI'
    AND study_id IN (
        SELECT id
        FROM studies
        WHERE pi_id = auth.uid()
    )
);

CREATE POLICY "Safety Officer & Monitor view subjects"
ON trial_subjects
FOR SELECT
USING (
    get_my_role() IN (
        'NPVCC_OFFICER',
        'MONITOR',
        'ETHICS_COMMITTEE'
    )
);


-- ============================================================
-- 6. ADVERSE EVENT POLICIES
-- ============================================================

CREATE POLICY "Admin full access on AE"
ON adverse_events
FOR ALL
USING (get_my_role() = 'ADMIN');

CREATE POLICY "NPvCC Officer full review on AE"
ON adverse_events
FOR ALL
USING (get_my_role() = 'NPVCC_OFFICER');

CREATE POLICY "Coordinator insert and view AEs"
ON adverse_events
FOR INSERT
WITH CHECK (get_my_role() = 'COORDINATOR');

CREATE POLICY "Coordinator read AEs"
ON adverse_events
FOR SELECT
USING (get_my_role() = 'COORDINATOR');

CREATE POLICY "PI view and log study AEs"
ON adverse_events
FOR ALL
USING (
    get_my_role() = 'PI'
    AND study_id IN (
        SELECT id
        FROM studies
        WHERE pi_id = auth.uid()
    )
);


-- ============================================================
-- 7. PROTOCOL DEVIATION POLICIES
-- ============================================================

-- The frozen role model specifies ADMIN full CRUD across
-- clinical tables. The original RLS specification enabled RLS
-- on protocol_deviations but omitted its ADMIN policy.
-- This policy closes that access-control gap.

CREATE POLICY "Admin full access on protocol deviations"
ON protocol_deviations
FOR ALL
USING (get_my_role() = 'ADMIN');


-- ============================================================
-- 8. AUDIT LOG POLICIES
-- ============================================================

CREATE POLICY "Allow authenticated read audit logs"
ON audit_logs
FOR SELECT
USING (auth.role() = 'authenticated');