-- ============================================================
-- ARISE
-- Migration 003: Study Lifecycle & PI Configuration Upgrade
-- Apply ONCE to the existing Supabase database.
-- ============================================================

BEGIN;


-- ============================================================
-- 1. EXTEND STUDIES
-- ============================================================

ALTER TABLE studies
ADD COLUMN IF NOT EXISTS description TEXT;

ALTER TABLE studies
ADD COLUMN IF NOT EXISTS study_type VARCHAR(50)
    NOT NULL DEFAULT 'INTERVENTIONAL';

ALTER TABLE studies
ADD COLUMN IF NOT EXISTS monitoring_frequency VARCHAR(30)
    NOT NULL DEFAULT 'WEEKLY';

ALTER TABLE studies
ADD COLUMN IF NOT EXISTS monitoring_start_date DATE;

ALTER TABLE studies
ADD COLUMN IF NOT EXISTS monitoring_end_date DATE;


ALTER TABLE studies
DROP CONSTRAINT IF EXISTS chk_study_type;

ALTER TABLE studies
ADD CONSTRAINT chk_study_type
CHECK (
    study_type IN (
        'INTERVENTIONAL',
        'OBSERVATIONAL'
    )
);


ALTER TABLE studies
DROP CONSTRAINT IF EXISTS chk_monitoring_frequency;

ALTER TABLE studies
ADD CONSTRAINT chk_monitoring_frequency
CHECK (
    monitoring_frequency IN (
        'DAILY',
        'WEEKLY',
        'FORTNIGHTLY',
        'MONTHLY',
        'CUSTOM'
    )
);


ALTER TABLE studies
DROP CONSTRAINT IF EXISTS chk_target_enrolment;

ALTER TABLE studies
ADD CONSTRAINT chk_target_enrolment
CHECK (target_enrolment > 0);


ALTER TABLE studies
DROP CONSTRAINT IF EXISTS chk_current_enrolment;

ALTER TABLE studies
ADD CONSTRAINT chk_current_enrolment
CHECK (current_enrolment >= 0);


-- ============================================================
-- 2. EXTEND TRIAL SUBJECTS
-- ============================================================

ALTER TABLE trial_subjects
ADD COLUMN IF NOT EXISTS eligibility_status VARCHAR(30)
    NOT NULL DEFAULT 'PENDING';

ALTER TABLE trial_subjects
ADD COLUMN IF NOT EXISTS eligibility_notes TEXT;

ALTER TABLE trial_subjects
ADD COLUMN IF NOT EXISTS eligibility_assessed_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE trial_subjects
ADD COLUMN IF NOT EXISTS eligibility_assessed_by UUID
    REFERENCES auth.users(id);


ALTER TABLE trial_subjects
DROP CONSTRAINT IF EXISTS chk_eligibility_status;

ALTER TABLE trial_subjects
ADD CONSTRAINT chk_eligibility_status
CHECK (
    eligibility_status IN (
        'PENDING',
        'ELIGIBLE',
        'INELIGIBLE'
    )
);
ALTER TABLE trial_subjects
DROP CONSTRAINT IF EXISTS uq_trial_subjects_id_study_id;

ALTER TABLE trial_subjects
ADD CONSTRAINT uq_trial_subjects_id_study_id
UNIQUE (id, study_id);


-- ============================================================
-- 3. NEW STUDY CONFIGURATION TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS study_clinical_parameters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    study_id UUID NOT NULL REFERENCES studies(id) ON DELETE CASCADE,

    parameter_code VARCHAR(50) NOT NULL,
    parameter_name VARCHAR(150) NOT NULL,

    parameter_category VARCHAR(30) NOT NULL,
    unit VARCHAR(50),
    is_required BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT uq_study_parameter
        UNIQUE (study_id, parameter_code),

    CONSTRAINT chk_parameter_category
        CHECK (
            parameter_category IN (
                'AYURVEDA',
                'CLINICAL'
            )
        ),

    CONSTRAINT uq_study_clinical_parameter_pair
        UNIQUE (id, study_id)
);


CREATE TABLE IF NOT EXISTS study_interventions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    study_id UUID NOT NULL REFERENCES studies(id) ON DELETE CASCADE,

    component_type VARCHAR(30) NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,

    dose VARCHAR(100),
    route VARCHAR(100),
    frequency VARCHAR(100),
    duration VARCHAR(100),
    duration_unit VARCHAR(30),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT chk_intervention_component_type
        CHECK (
            component_type IN (
                'DRUG',
                'PATHYA',
                'ANUPANA',
                'LIFESTYLE'
            )
        ),

    CONSTRAINT uq_study_intervention_pair
        UNIQUE (id, study_id)
);


CREATE TABLE IF NOT EXISTS study_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    study_id UUID NOT NULL REFERENCES studies(id) ON DELETE CASCADE,

    assessment_name VARCHAR(200) NOT NULL,
    assessment_type VARCHAR(50) NOT NULL DEFAULT 'CLINICAL',

    parameter_id UUID,

    visit_label VARCHAR(100) NOT NULL,
    day_offset INT NOT NULL DEFAULT 0,

    frequency VARCHAR(30),
    required BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT chk_assessment_day_offset
        CHECK (day_offset >= 0),

    CONSTRAINT chk_assessment_frequency
        CHECK (
            frequency IS NULL OR
            frequency IN (
                'DAILY',
                'WEEKLY',
                'FORTNIGHTLY',
                'MONTHLY',
                'CUSTOM'
            )
        ),

    CONSTRAINT uq_study_assessment_pair
        UNIQUE (id, study_id)
);


ALTER TABLE study_assessments
DROP CONSTRAINT IF EXISTS fk_assessment_parameter;

ALTER TABLE study_assessments
ADD CONSTRAINT fk_assessment_parameter
FOREIGN KEY (parameter_id, study_id)
REFERENCES study_clinical_parameters(id, study_id)
ON DELETE CASCADE;


CREATE TABLE IF NOT EXISTS study_criteria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    study_id UUID NOT NULL REFERENCES studies(id) ON DELETE CASCADE,

    criterion_type VARCHAR(20) NOT NULL,
    criterion_text TEXT NOT NULL,
    criterion_order INT NOT NULL DEFAULT 1,
    required BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT chk_criterion_type
        CHECK (
            criterion_type IN (
                'INCLUSION',
                'EXCLUSION'
            )
        ),

    CONSTRAINT chk_criterion_order
        CHECK (criterion_order > 0),

    CONSTRAINT uq_study_criterion_pair
        UNIQUE (id, study_id)
);


-- ============================================================
-- 4. SUBJECT EXECUTION TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS subject_criteria_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    study_id UUID NOT NULL,
    subject_id UUID NOT NULL,
    criterion_id UUID NOT NULL,

    result VARCHAR(20) NOT NULL,
    notes TEXT,

    assessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assessed_by UUID REFERENCES auth.users(id),

    CONSTRAINT chk_criteria_result
        CHECK (
            result IN (
                'PASS',
                'FAIL',
                'NOT_ASSESSED'
            )
        ),

    CONSTRAINT uq_subject_criterion
        UNIQUE (subject_id, criterion_id),

    CONSTRAINT uq_subject_criteria_result_pair
        UNIQUE (id, study_id),

    CONSTRAINT fk_subject_criteria_subject
        FOREIGN KEY (subject_id, study_id)
        REFERENCES trial_subjects(id, study_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_subject_criteria_definition
        FOREIGN KEY (criterion_id, study_id)
        REFERENCES study_criteria(id, study_id)
        ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS subject_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    study_id UUID NOT NULL,
    subject_id UUID NOT NULL,
    study_assessment_id UUID NOT NULL,

    scheduled_date DATE NOT NULL,

    status VARCHAR(30) NOT NULL DEFAULT 'DUE',

    completed_at TIMESTAMP WITH TIME ZONE,
    completed_by UUID REFERENCES auth.users(id),

    result_value TEXT,
    result_unit VARCHAR(50),
    result_notes TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT chk_subject_assessment_status
        CHECK (
            status IN (
                'DUE',
                'COMPLETED',
                'OVERDUE',
                'NOT_APPLICABLE'
            )
        ),

    CONSTRAINT uq_subject_assessment_schedule
        UNIQUE (
            subject_id,
            study_assessment_id,
            scheduled_date
        ),

    CONSTRAINT uq_subject_assessment_pair
        UNIQUE (id, study_id),

    CONSTRAINT fk_subject_assessment_subject
        FOREIGN KEY (subject_id, study_id)
        REFERENCES trial_subjects(id, study_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_subject_assessment_definition
        FOREIGN KEY (study_assessment_id, study_id)
        REFERENCES study_assessments(id, study_id)
        ON DELETE CASCADE
);


-- ============================================================
-- 5. INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_studies_pi_id
    ON studies(pi_id);

CREATE INDEX IF NOT EXISTS idx_trial_subjects_study_id
    ON trial_subjects(study_id);

CREATE INDEX IF NOT EXISTS idx_study_clinical_parameters_study_id
    ON study_clinical_parameters(study_id);

CREATE INDEX IF NOT EXISTS idx_study_interventions_study_id
    ON study_interventions(study_id);

CREATE INDEX IF NOT EXISTS idx_study_assessments_study_id
    ON study_assessments(study_id);

CREATE INDEX IF NOT EXISTS idx_study_criteria_study_id
    ON study_criteria(study_id);

CREATE INDEX IF NOT EXISTS idx_subject_criteria_results_study_id
    ON subject_criteria_results(study_id);

CREATE INDEX IF NOT EXISTS idx_subject_criteria_results_subject_id
    ON subject_criteria_results(subject_id);

CREATE INDEX IF NOT EXISTS idx_subject_assessments_study_id
    ON subject_assessments(study_id);

CREATE INDEX IF NOT EXISTS idx_subject_assessments_subject_id
    ON subject_assessments(subject_id);

CREATE INDEX IF NOT EXISTS idx_subject_assessments_scheduled_date
    ON subject_assessments(scheduled_date);

CREATE INDEX IF NOT EXISTS idx_subject_assessments_status
    ON subject_assessments(status);


-- ============================================================
-- 6. AUDIT TRIGGERS ON NEW TABLES
-- ============================================================

CREATE OR REPLACE FUNCTION log_clinical_audit_event()
RETURNS trigger AS $$
DECLARE
    current_uid UUID;
BEGIN
    current_uid := auth.uid();

    IF TG_OP = 'INSERT' THEN

        INSERT INTO audit_logs (
            table_name,
            action,
            record_id,
            performed_by,
            previous_data,
            new_data
        )
        VALUES (
            TG_TABLE_NAME,
            'INSERT',
            NEW.id,
            current_uid,
            NULL,
            to_jsonb(NEW)
        );

        RETURN NEW;

    ELSIF TG_OP = 'UPDATE' THEN

        INSERT INTO audit_logs (
            table_name,
            action,
            record_id,
            performed_by,
            previous_data,
            new_data
        )
        VALUES (
            TG_TABLE_NAME,
            'UPDATE',
            NEW.id,
            current_uid,
            to_jsonb(OLD),
            to_jsonb(NEW)
        );

        RETURN NEW;

    ELSIF TG_OP = 'DELETE' THEN

        INSERT INTO audit_logs (
            table_name,
            action,
            record_id,
            performed_by,
            previous_data,
            new_data
        )
        VALUES (
            TG_TABLE_NAME,
            'DELETE',
            OLD.id,
            current_uid,
            to_jsonb(OLD),
            NULL
        );

        RETURN OLD;

    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


DROP TRIGGER IF EXISTS trg_audit_study_clinical_parameters
ON study_clinical_parameters;

CREATE TRIGGER trg_audit_study_clinical_parameters
AFTER INSERT OR UPDATE OR DELETE ON study_clinical_parameters
FOR EACH ROW
EXECUTE FUNCTION log_clinical_audit_event();


DROP TRIGGER IF EXISTS trg_audit_study_interventions
ON study_interventions;

CREATE TRIGGER trg_audit_study_interventions
AFTER INSERT OR UPDATE OR DELETE ON study_interventions
FOR EACH ROW
EXECUTE FUNCTION log_clinical_audit_event();


DROP TRIGGER IF EXISTS trg_audit_study_assessments
ON study_assessments;

CREATE TRIGGER trg_audit_study_assessments
AFTER INSERT OR UPDATE OR DELETE ON study_assessments
FOR EACH ROW
EXECUTE FUNCTION log_clinical_audit_event();


DROP TRIGGER IF EXISTS trg_audit_study_criteria
ON study_criteria;

CREATE TRIGGER trg_audit_study_criteria
AFTER INSERT OR UPDATE OR DELETE ON study_criteria
FOR EACH ROW
EXECUTE FUNCTION log_clinical_audit_event();


DROP TRIGGER IF EXISTS trg_audit_subject_criteria_results
ON subject_criteria_results;

CREATE TRIGGER trg_audit_subject_criteria_results
AFTER INSERT OR UPDATE OR DELETE ON subject_criteria_results
FOR EACH ROW
EXECUTE FUNCTION log_clinical_audit_event();


DROP TRIGGER IF EXISTS trg_audit_subject_assessments
ON subject_assessments;

CREATE TRIGGER trg_audit_subject_assessments
AFTER INSERT OR UPDATE OR DELETE ON subject_assessments
FOR EACH ROW
EXECUTE FUNCTION log_clinical_audit_event();


-- ============================================================
-- 7. ENABLE RLS ON NEW TABLES
-- ============================================================

ALTER TABLE study_clinical_parameters ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_interventions ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE subject_criteria_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE subject_assessments ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- 8. REMOVE OLD/CONFLICTING POLICIES
-- ============================================================

DROP POLICY IF EXISTS "PI create own studies" ON studies;
DROP POLICY IF EXISTS "PI view assigned studies" ON studies;
DROP POLICY IF EXISTS "PI update assigned studies" ON studies;
DROP POLICY IF EXISTS "Admin full access on studies" ON studies;
DROP POLICY IF EXISTS "Coordinator view all studies" ON studies;

DROP POLICY IF EXISTS "Admin full access on subjects" ON trial_subjects;
DROP POLICY IF EXISTS "Coordinator manage subjects" ON trial_subjects;
DROP POLICY IF EXISTS "PI view and edit study subjects" ON trial_subjects;
DROP POLICY IF EXISTS "Safety Officer & Monitor view subjects" ON trial_subjects;

DROP POLICY IF EXISTS "Admin full access on AE" ON adverse_events;
DROP POLICY IF EXISTS "NPvCC Officer full review on AE" ON adverse_events;
DROP POLICY IF EXISTS "Coordinator insert and view AEs" ON adverse_events;
DROP POLICY IF EXISTS "Coordinator read AEs" ON adverse_events;
DROP POLICY IF EXISTS "PI view and log study AEs" ON adverse_events;

DROP POLICY IF EXISTS "Admin full access on protocol deviations"
ON protocol_deviations;

DROP POLICY IF EXISTS "Allow authenticated read audit logs"
ON audit_logs;


-- ============================================================
-- 9. RECREATE FINAL RLS POLICIES
-- ============================================================

-- ----------------------------
-- STUDIES
-- ----------------------------

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
USING (get_my_role() = 'COORDINATOR');

CREATE POLICY "NPvCC view studies"
ON studies
FOR SELECT
USING (get_my_role() = 'NPVCC_OFFICER');

CREATE POLICY "Ethics Committee view studies"
ON studies
FOR SELECT
USING (get_my_role() = 'ETHICS_COMMITTEE');

CREATE POLICY "Monitor view studies"
ON studies
FOR SELECT
USING (get_my_role() = 'MONITOR');


-- ----------------------------
-- SUBJECTS
-- ----------------------------

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
        SELECT id FROM studies WHERE pi_id = auth.uid()
    )
)
WITH CHECK (
    get_my_role() = 'PI'
    AND study_id IN (
        SELECT id FROM studies WHERE pi_id = auth.uid()
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


-- ----------------------------
-- NEW CONFIGURATION TABLES
-- ----------------------------

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
        SELECT id FROM studies WHERE pi_id = auth.uid()
    )
)
WITH CHECK (
    get_my_role() = 'PI'
    AND study_id IN (
        SELECT id FROM studies WHERE pi_id = auth.uid()
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
        SELECT id FROM studies WHERE pi_id = auth.uid()
    )
)
WITH CHECK (
    get_my_role() = 'PI'
    AND study_id IN (
        SELECT id FROM studies WHERE pi_id = auth.uid()
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
        SELECT id FROM studies WHERE pi_id = auth.uid()
    )
)
WITH CHECK (
    get_my_role() = 'PI'
    AND study_id IN (
        SELECT id FROM studies WHERE pi_id = auth.uid()
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
        SELECT id FROM studies WHERE pi_id = auth.uid()
    )
)
WITH CHECK (
    get_my_role() = 'PI'
    AND study_id IN (
        SELECT id FROM studies WHERE pi_id = auth.uid()
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


-- ----------------------------
-- SUBJECT EXECUTION
-- ----------------------------

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
        SELECT id FROM studies WHERE pi_id = auth.uid()
    )
)
WITH CHECK (
    get_my_role() = 'PI'
    AND study_id IN (
        SELECT id FROM studies WHERE pi_id = auth.uid()
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
        SELECT id FROM studies WHERE pi_id = auth.uid()
    )
)
WITH CHECK (
    get_my_role() = 'PI'
    AND study_id IN (
        SELECT id FROM studies WHERE pi_id = auth.uid()
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


-- ----------------------------
-- ADVERSE EVENTS
-- ----------------------------

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
WITH CHECK (get_my_role() = 'COORDINATOR');

CREATE POLICY "Coordinator read AEs"
ON adverse_events
FOR SELECT
USING (get_my_role() = 'COORDINATOR');

CREATE POLICY "PI manage own study AEs"
ON adverse_events
FOR ALL
USING (
    get_my_role() = 'PI'
    AND study_id IN (
        SELECT id FROM studies WHERE pi_id = auth.uid()
    )
)
WITH CHECK (
    get_my_role() = 'PI'
    AND study_id IN (
        SELECT id FROM studies WHERE pi_id = auth.uid()
    )
);


-- ----------------------------
-- PROTOCOL DEVIATIONS
-- ----------------------------

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
        SELECT id FROM studies WHERE pi_id = auth.uid()
    )
)
WITH CHECK (
    get_my_role() = 'PI'
    AND study_id IN (
        SELECT id FROM studies WHERE pi_id = auth.uid()
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


-- ----------------------------
-- AUDIT LOGS
-- ----------------------------

CREATE POLICY "Authenticated users read audit logs"
ON audit_logs
FOR SELECT
USING (
    auth.role() = 'authenticated'
);


COMMIT;