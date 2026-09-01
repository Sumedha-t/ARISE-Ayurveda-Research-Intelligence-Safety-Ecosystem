-- ============================================================
-- ARISE - AIIA Clinical Trials Dashboard
-- Migration 002: Row-Level Security
-- Dev 1 - Final Role & Ownership Model
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

ALTER TABLE study_clinical_parameters ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_interventions ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE subject_criteria_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE subject_assessments ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- 2. ROLE HELPER
-- ============================================================

CREATE OR REPLACE FUNCTION get_my_role()
RETURNS user_role AS $$
    SELECT role
    FROM profiles
    WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;


-- ============================================================
-- 3. PROFILES
-- ============================================================

CREATE POLICY "Allow public read of profiles"
ON profiles
FOR SELECT
USING (true);

CREATE POLICY "Allow individual update of own profile"
ON profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);


-- ============================================================
-- 4. STUDIES
-- ============================================================

CREATE POLICY "Admin full access on studies"
ON studies
FOR ALL
USING (get_my_role() = 'ADMIN')
WITH CHECK (get_my_role() = 'ADMIN');


CREATE POLICY "PI view own studies"
ON studies
FOR SELECT
USING (
    get_my_role() = 'PI'
    AND pi_id = auth.uid()
);


CREATE POLICY "PI create own studies"
ON studies
FOR INSERT
WITH CHECK (
    get_my_role() = 'PI'
    AND pi_id = auth.uid()
);


CREATE POLICY "PI update own studies"
ON studies
FOR UPDATE
USING (
    get_my_role() = 'PI'
    AND pi_id = auth.uid()
)
WITH CHECK (
    get_my_role() = 'PI'
    AND pi_id = auth.uid()
);


CREATE POLICY "Coordinator view studies"
ON studies
FOR SELECT
USING (
    get_my_role() = 'COORDINATOR'
);


CREATE POLICY "NPvCC view studies"
ON studies
FOR SELECT
USING (
    get_my_role() = 'NPVCC_OFFICER'
);


CREATE POLICY "Ethics Committee view studies"
ON studies
FOR SELECT
USING (
    get_my_role() = 'ETHICS_COMMITTEE'
);


CREATE POLICY "Monitor view studies"
ON studies
FOR SELECT
USING (
    get_my_role() = 'MONITOR'
);


-- ============================================================
-- 5. TRIAL SUBJECTS
-- ============================================================

CREATE POLICY "Admin full access on subjects"
ON trial_subjects
FOR ALL
USING (get_my_role() = 'ADMIN')
WITH CHECK (get_my_role() = 'ADMIN');


CREATE POLICY "Coordinator manage subjects"
ON trial_subjects
FOR ALL
USING (get_my_role() = 'COORDINATOR')
WITH CHECK (get_my_role() = 'COORDINATOR');


CREATE POLICY "PI manage own study subjects"
ON trial_subjects
FOR ALL
USING (
    get_my_role() = 'PI'
    AND study_id IN (
        SELECT id
        FROM studies
        WHERE pi_id = auth.uid()
    )
)
WITH CHECK (
    get_my_role() = 'PI'
    AND study_id IN (
        SELECT id
        FROM studies
        WHERE pi_id = auth.uid()
    )
);


CREATE POLICY "Review roles view subjects"
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
-- 6. STUDY CLINICAL PARAMETERS
-- ============================================================

CREATE POLICY "Admin full access on study clinical parameters"
ON study_clinical_parameters
FOR ALL
USING (get_my_role() = 'ADMIN')
WITH CHECK (get_my_role() = 'ADMIN');


CREATE POLICY "PI manage own study clinical parameters"
ON study_clinical_parameters
FOR ALL
USING (
    get_my_role() = 'PI'
    AND study_id IN (
        SELECT id
        FROM studies
        WHERE pi_id = auth.uid()
    )
)
WITH CHECK (
    get_my_role() = 'PI'
    AND study_id IN (
        SELECT id
        FROM studies
        WHERE pi_id = auth.uid()
    )
);


CREATE POLICY "Review roles view study clinical parameters"
ON study_clinical_parameters
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
-- 7. STUDY INTERVENTIONS
-- ============================================================

CREATE POLICY "Admin full access on study interventions"
ON study_interventions
FOR ALL
USING (get_my_role() = 'ADMIN')
WITH CHECK (get_my_role() = 'ADMIN');


CREATE POLICY "PI manage own study interventions"
ON study_interventions
FOR ALL
USING (
    get_my_role() = 'PI'
    AND study_id IN (
        SELECT id
        FROM studies
        WHERE pi_id = auth.uid()
    )
)
WITH CHECK (
    get_my_role() = 'PI'
    AND study_id IN (
        SELECT id
        FROM studies
        WHERE pi_id = auth.uid()
    )
);


CREATE POLICY "Review roles view study interventions"
ON study_interventions
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
-- 8. STUDY ASSESSMENTS
-- ============================================================

CREATE POLICY "Admin full access on study assessments"
ON study_assessments
FOR ALL
USING (get_my_role() = 'ADMIN')
WITH CHECK (get_my_role() = 'ADMIN');


CREATE POLICY "PI manage own study assessments"
ON study_assessments
FOR ALL
USING (
    get_my_role() = 'PI'
    AND study_id IN (
        SELECT id
        FROM studies
        WHERE pi_id = auth.uid()
    )
)
WITH CHECK (
    get_my_role() = 'PI'
    AND study_id IN (
        SELECT id
        FROM studies
        WHERE pi_id = auth.uid()
    )
);


CREATE POLICY "Review roles view study assessments"
ON study_assessments
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
-- 9. STUDY CRITERIA
-- ============================================================

CREATE POLICY "Admin full access on study criteria"
ON study_criteria
FOR ALL
USING (get_my_role() = 'ADMIN')
WITH CHECK (get_my_role() = 'ADMIN');


CREATE POLICY "PI manage own study criteria"
ON study_criteria
FOR ALL
USING (
    get_my_role() = 'PI'
    AND study_id IN (
        SELECT id
        FROM studies
        WHERE pi_id = auth.uid()
    )
)
WITH CHECK (
    get_my_role() = 'PI'
    AND study_id IN (
        SELECT id
        FROM studies
        WHERE pi_id = auth.uid()
    )
);


CREATE POLICY "Review roles view study criteria"
ON study_criteria
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
-- 10. SUBJECT CRITERIA RESULTS
-- ============================================================

CREATE POLICY "Admin full access on subject criteria results"
ON subject_criteria_results
FOR ALL
USING (get_my_role() = 'ADMIN')
WITH CHECK (get_my_role() = 'ADMIN');


CREATE POLICY "PI manage own subject criteria results"
ON subject_criteria_results
FOR ALL
USING (
    get_my_role() = 'PI'
    AND study_id IN (
        SELECT id
        FROM studies
        WHERE pi_id = auth.uid()
    )
)
WITH CHECK (
    get_my_role() = 'PI'
    AND study_id IN (
        SELECT id
        FROM studies
        WHERE pi_id = auth.uid()
    )
);


CREATE POLICY "Coordinator manage subject criteria results"
ON subject_criteria_results
FOR ALL
USING (get_my_role() = 'COORDINATOR')
WITH CHECK (get_my_role() = 'COORDINATOR');


CREATE POLICY "Review roles view subject criteria results"
ON subject_criteria_results
FOR SELECT
USING (
    get_my_role() IN (
        'NPVCC_OFFICER',
        'ETHICS_COMMITTEE',
        'MONITOR'
    )
);


-- ============================================================
-- 11. SUBJECT ASSESSMENTS
-- ============================================================

CREATE POLICY "Admin full access on subject assessments"
ON subject_assessments
FOR ALL
USING (get_my_role() = 'ADMIN')
WITH CHECK (get_my_role() = 'ADMIN');


CREATE POLICY "PI manage own subject assessments"
ON subject_assessments
FOR ALL
USING (
    get_my_role() = 'PI'
    AND study_id IN (
        SELECT id
        FROM studies
        WHERE pi_id = auth.uid()
    )
)
WITH CHECK (
    get_my_role() = 'PI'
    AND study_id IN (
        SELECT id
        FROM studies
        WHERE pi_id = auth.uid()
    )
);


CREATE POLICY "Coordinator manage subject assessments"
ON subject_assessments
FOR ALL
USING (get_my_role() = 'COORDINATOR')
WITH CHECK (get_my_role() = 'COORDINATOR');


CREATE POLICY "Review roles view subject assessments"
ON subject_assessments
FOR SELECT
USING (
    get_my_role() IN (
        'NPVCC_OFFICER',
        'ETHICS_COMMITTEE',
        'MONITOR'
    )
);


-- ============================================================
-- 12. ADVERSE EVENTS
-- ============================================================

CREATE POLICY "Admin full access on AE"
ON adverse_events
FOR ALL
USING (get_my_role() = 'ADMIN')
WITH CHECK (get_my_role() = 'ADMIN');


CREATE POLICY "NPvCC Officer full review on AE"
ON adverse_events
FOR ALL
USING (get_my_role() = 'NPVCC_OFFICER')
WITH CHECK (get_my_role() = 'NPVCC_OFFICER');


CREATE POLICY "Coordinator insert AEs"
ON adverse_events
FOR INSERT
WITH CHECK (
    get_my_role() = 'COORDINATOR'
);


CREATE POLICY "Coordinator read AEs"
ON adverse_events
FOR SELECT
USING (
    get_my_role() = 'COORDINATOR'
);


CREATE POLICY "PI manage own study AEs"
ON adverse_events
FOR ALL
USING (
    get_my_role() = 'PI'
    AND study_id IN (
        SELECT id
        FROM studies
        WHERE pi_id = auth.uid()
    )
)
WITH CHECK (
    get_my_role() = 'PI'
    AND study_id IN (
        SELECT id
        FROM studies
        WHERE pi_id = auth.uid()
    )
);


-- ============================================================
-- 13. PROTOCOL DEVIATIONS
-- ============================================================

CREATE POLICY "Admin full access on protocol deviations"
ON protocol_deviations
FOR ALL
USING (get_my_role() = 'ADMIN')
WITH CHECK (get_my_role() = 'ADMIN');


CREATE POLICY "PI manage own study protocol deviations"
ON protocol_deviations
FOR ALL
USING (
    get_my_role() = 'PI'
    AND study_id IN (
        SELECT id
        FROM studies
        WHERE pi_id = auth.uid()
    )
)
WITH CHECK (
    get_my_role() = 'PI'
    AND study_id IN (
        SELECT id
        FROM studies
        WHERE pi_id = auth.uid()
    )
);


CREATE POLICY "Coordinator manage protocol deviations"
ON protocol_deviations
FOR ALL
USING (get_my_role() = 'COORDINATOR')
WITH CHECK (get_my_role() = 'COORDINATOR');


CREATE POLICY "Review roles view protocol deviations"
ON protocol_deviations
FOR SELECT
USING (
    get_my_role() IN (
        'NPVCC_OFFICER',
        'ETHICS_COMMITTEE',
        'MONITOR'
    )
);


-- ============================================================
-- 14. AUDIT LOGS
-- ============================================================

CREATE POLICY "Authenticated users read audit logs"
ON audit_logs
FOR SELECT
USING (
    auth.role() = 'authenticated'
);