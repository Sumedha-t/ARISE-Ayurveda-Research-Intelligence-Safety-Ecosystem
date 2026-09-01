-- ============================================================
-- ARISE - AIIA Clinical Trials Dashboard
-- Migration 001: Initial Database Schema
-- Dev 1 - Frozen Schema
-- ============================================================

-- ============================================================
-- 1. EXTENSION
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ============================================================
-- 2. ENUMS
-- ============================================================

CREATE TYPE user_role AS ENUM (
    'PI',
    'COORDINATOR',
    'NPVCC_OFFICER',
    'ADMIN',
    'ETHICS_COMMITTEE',
    'MONITOR'
);

CREATE TYPE study_phase AS ENUM (
    'PHASE_1',
    'PHASE_2',
    'PHASE_3',
    'PHASE_4',
    'OBSERVATIONAL'
);

CREATE TYPE prakriti_type AS ENUM (
    'VATA',
    'PITTA',
    'KAPHA',
    'VATA_PITTA',
    'PITTA_KAPHA',
    'VATA_KAPHA',
    'SAMADOSHA'
);

CREATE TYPE agni_type AS ENUM (
    'SAMAGNI',
    'TIKSHNAGNI',
    'MANDAGNI',
    'VISHAMAGNI'
);

CREATE TYPE ae_severity AS ENUM (
    'MILD',
    'MODERATE',
    'SEVERE'
);

CREATE TYPE ae_causality AS ENUM (
    'AUSHADHA_JANYA',
    'ANUPANA_DOSHA',
    'PATHYA_ULLANGHANA',
    'ASHODHITA_DRAVYA',
    'UNRELATED',
    'UNASSESSED'
);

CREATE TYPE ae_outcome AS ENUM (
    'RECOVERED',
    'RECOVERING',
    'NOT_RECOVERED',
    'FATAL',
    'UNKNOWN'
);

CREATE TYPE ae_workflow_status AS ENUM (
    'DRAFT',
    'SUBMITTED',
    'UNDER_REVIEW',
    'CAUSALITY_ASSESSED',
    'REGULATORY_REPORT_PENDING',
    'REGULATORY_REPORT_SUBMITTED',
    'CLOSED'
);

CREATE TYPE deadline_type AS ENUM (
    'SAE_INITIAL_24H',
    'SAE_FOLLOWUP_7D',
    'ROUTINE_ANNUAL',
    'IEC_RENEWAL'
);


-- ============================================================
-- 3. CORE TABLES
-- ============================================================

-- ------------------------------------------------------------
-- Profiles
-- ------------------------------------------------------------

CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'COORDINATOR',
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- ------------------------------------------------------------
-- Studies
-- ------------------------------------------------------------

CREATE TABLE studies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ctri_number VARCHAR(50) UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    study_type VARCHAR(50) NOT NULL DEFAULT 'INTERVENTIONAL',
    phase study_phase NOT NULL,
    pi_id UUID REFERENCES auth.users(id),
    iec_approval_date DATE,
    iec_status VARCHAR(50) DEFAULT 'Approved',
    target_enrolment INT NOT NULL,
    current_enrolment INT DEFAULT 0,

    monitoring_frequency VARCHAR(30) NOT NULL DEFAULT 'WEEKLY',
    monitoring_start_date DATE,
    monitoring_end_date DATE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT chk_study_type
        CHECK (
            study_type IN (
                'INTERVENTIONAL',
                'OBSERVATIONAL'
            )
        ),

    CONSTRAINT chk_monitoring_frequency
        CHECK (
            monitoring_frequency IN (
                'DAILY',
                'WEEKLY',
                'FORTNIGHTLY',
                'MONTHLY',
                'CUSTOM'
            )
        ),

    CONSTRAINT chk_target_enrolment
        CHECK (target_enrolment > 0),

    CONSTRAINT chk_current_enrolment
        CHECK (current_enrolment >= 0)
);


-- ------------------------------------------------------------
-- Trial Subjects / Baseline eCRF
-- ------------------------------------------------------------

CREATE TABLE trial_subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    study_id UUID NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
    subject_code VARCHAR(50) UNIQUE NOT NULL,
    screening_date DATE NOT NULL,
    enrolment_status VARCHAR(50) DEFAULT 'Enrolled',

    consent_obtained BOOLEAN DEFAULT FALSE,
    consent_version VARCHAR(20) DEFAULT 'ICF v1.0',
    consent_date DATE,
    consent_method VARCHAR(50) DEFAULT 'Digital Signature',

    prakriti prakriti_type NOT NULL,
    agni agni_type NOT NULL,

    ashtavidha_pariksha JSONB DEFAULT '{
        "nadi": "Vata-Pitta",
        "mutra": "Prakruta",
        "mala": "Sama",
        "jihva": "Nirlipta",
        "shabda": "Prakruta",
        "sparsha": "Anushnasheeta",
        "drik": "Prakruta",
        "akriti": "Madhyama"
    }'::jsonb,

    anupana_prescribed TEXT,
    pathya_guidelines TEXT,

    eligibility_status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    eligibility_notes TEXT,
    eligibility_assessed_at TIMESTAMP WITH TIME ZONE,
    eligibility_assessed_by UUID REFERENCES auth.users(id),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT uq_study_subject UNIQUE (id, study_id),

    CONSTRAINT chk_eligibility_status
        CHECK (
            eligibility_status IN (
                'PENDING',
                'ELIGIBLE',
                'INELIGIBLE'
            )
        )
);


-- ------------------------------------------------------------
-- Protocol Deviations
-- ------------------------------------------------------------

CREATE TABLE protocol_deviations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    study_id UUID NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES trial_subjects(id),
    deviation_type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    severity ae_severity NOT NULL,
    identified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    identified_by UUID REFERENCES auth.users(id),
    corrective_action TEXT,
    status VARCHAR(50) DEFAULT 'Logged'
);


-- ------------------------------------------------------------
-- Adverse Events / NPvCC Pharmacovigilance
-- ------------------------------------------------------------

CREATE TABLE adverse_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    study_id UUID NOT NULL,
    subject_id UUID NOT NULL,
    severity ae_severity NOT NULL,
    is_serious BOOLEAN NOT NULL DEFAULT FALSE,
    event_term TEXT NOT NULL,
    meddra_code VARCHAR(50),
    namaste_portal_code VARCHAR(50),
    causality_type ae_causality DEFAULT 'UNASSESSED',
    outcome ae_outcome DEFAULT 'UNKNOWN',
    workflow_status ae_workflow_status DEFAULT 'DRAFT',
    reporting_deadline_type deadline_type,
    reported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    regulatory_deadline TIMESTAMP WITH TIME ZONE,
    submitted_to_regulator_at TIMESTAMP WITH TIME ZONE,

    CONSTRAINT fk_study_subject_pair
        FOREIGN KEY (subject_id, study_id)
        REFERENCES trial_subjects(id, study_id)
        ON DELETE CASCADE
);


-- ============================================================
-- 4. STUDY CONFIGURATION TABLES
-- ============================================================

-- ------------------------------------------------------------
-- Study Clinical Parameters
-- ------------------------------------------------------------
-- One row represents one clinical/Ayurveda parameter applicable
-- to one study.

CREATE TABLE study_clinical_parameters (
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


-- ------------------------------------------------------------
-- Study Interventions
-- ------------------------------------------------------------
-- A study may contain multiple intervention components:
-- DRUG, PATHYA, ANUPANA, LIFESTYLE.

CREATE TABLE study_interventions (
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


-- ------------------------------------------------------------
-- Study Assessments / Monitoring Schedule
-- ------------------------------------------------------------
-- Defines what assessment is expected at which visit/timepoint.

CREATE TABLE study_assessments (
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

    CONSTRAINT fk_assessment_parameter
        FOREIGN KEY (parameter_id, study_id)
        REFERENCES study_clinical_parameters(id, study_id)
        ON DELETE CASCADE,

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


-- ------------------------------------------------------------
-- Study Inclusion / Exclusion Criteria
-- ------------------------------------------------------------

CREATE TABLE study_criteria (
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
-- 5. SUBJECT EXECUTION TABLES
-- ============================================================

-- ------------------------------------------------------------
-- Subject Criteria Results
-- ------------------------------------------------------------
-- Stores the actual inclusion/exclusion checklist outcome
-- for a recruited/screened subject.

CREATE TABLE subject_criteria_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    study_id UUID NOT NULL,
    subject_id UUID NOT NULL,
    criterion_id UUID NOT NULL,

    result VARCHAR(20) NOT NULL,
    notes TEXT,

    assessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assessed_by UUID REFERENCES auth.users(id),

    CONSTRAINT fk_subject_criteria_subject
        FOREIGN KEY (subject_id, study_id)
        REFERENCES trial_subjects(id, study_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_subject_criteria_definition
        FOREIGN KEY (criterion_id, study_id)
        REFERENCES study_criteria(id, study_id)
        ON DELETE CASCADE,

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
        UNIQUE (id, study_id)
);


-- ------------------------------------------------------------
-- Subject Assessments
-- ------------------------------------------------------------
-- Stores scheduled subject-level assessments and their results.

CREATE TABLE subject_assessments (
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

    CONSTRAINT fk_subject_assessment_subject
        FOREIGN KEY (subject_id, study_id)
        REFERENCES trial_subjects(id, study_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_subject_assessment_definition
        FOREIGN KEY (study_assessment_id, study_id)
        REFERENCES study_assessments(id, study_id)
        ON DELETE CASCADE,

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
        UNIQUE (id, study_id)
);


-- ============================================================
-- 6. AUDIT LOGS
-- ============================================================

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    table_name VARCHAR(100) NOT NULL,
    action VARCHAR(20) NOT NULL,
    record_id UUID NOT NULL,

    -- Nullable intentionally:
    -- SQL Editor / service-level operations do not have auth.uid().
    performed_by UUID REFERENCES auth.users(id),

    previous_data JSONB,
    new_data JSONB,

    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- ============================================================
-- 7. AUDIT LOG IMMUTABILITY
-- ============================================================

CREATE OR REPLACE FUNCTION prevent_audit_modification()
RETURNS trigger AS $$
BEGIN
    RAISE EXCEPTION
        'ALCOA+ Violation: Audit logs are immutable and cannot be updated or deleted.';
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER trg_audit_logs_immutable
BEFORE UPDATE OR DELETE ON audit_logs
FOR EACH ROW
EXECUTE FUNCTION prevent_audit_modification();


-- ============================================================
-- 8. AUTOMATIC CLINICAL AUDIT LOGGING
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


-- ============================================================
-- 9. AUDIT TRIGGERS - CORE TABLES
-- ============================================================

CREATE TRIGGER trg_audit_studies
AFTER INSERT OR UPDATE OR DELETE ON studies
FOR EACH ROW
EXECUTE FUNCTION log_clinical_audit_event();

CREATE TRIGGER trg_audit_trial_subjects
AFTER INSERT OR UPDATE OR DELETE ON trial_subjects
FOR EACH ROW
EXECUTE FUNCTION log_clinical_audit_event();

CREATE TRIGGER trg_audit_adverse_events
AFTER INSERT OR UPDATE OR DELETE ON adverse_events
FOR EACH ROW
EXECUTE FUNCTION log_clinical_audit_event();

CREATE TRIGGER trg_audit_protocol_deviations
AFTER INSERT OR UPDATE OR DELETE ON protocol_deviations
FOR EACH ROW
EXECUTE FUNCTION log_clinical_audit_event();


-- ============================================================
-- 10. AUDIT TRIGGERS - NEW STUDY CONFIGURATION TABLES
-- ============================================================

CREATE TRIGGER trg_audit_study_clinical_parameters
AFTER INSERT OR UPDATE OR DELETE ON study_clinical_parameters
FOR EACH ROW
EXECUTE FUNCTION log_clinical_audit_event();

CREATE TRIGGER trg_audit_study_interventions
AFTER INSERT OR UPDATE OR DELETE ON study_interventions
FOR EACH ROW
EXECUTE FUNCTION log_clinical_audit_event();

CREATE TRIGGER trg_audit_study_assessments
AFTER INSERT OR UPDATE OR DELETE ON study_assessments
FOR EACH ROW
EXECUTE FUNCTION log_clinical_audit_event();

CREATE TRIGGER trg_audit_study_criteria
AFTER INSERT OR UPDATE OR DELETE ON study_criteria
FOR EACH ROW
EXECUTE FUNCTION log_clinical_audit_event();

CREATE TRIGGER trg_audit_subject_criteria_results
AFTER INSERT OR UPDATE OR DELETE ON subject_criteria_results
FOR EACH ROW
EXECUTE FUNCTION log_clinical_audit_event();

CREATE TRIGGER trg_audit_subject_assessments
AFTER INSERT OR UPDATE OR DELETE ON subject_assessments
FOR EACH ROW
EXECUTE FUNCTION log_clinical_audit_event();


-- ============================================================
-- 11. INDEXES
-- ============================================================

CREATE INDEX idx_studies_pi_id
    ON studies(pi_id);

CREATE INDEX idx_trial_subjects_study_id
    ON trial_subjects(study_id);

CREATE INDEX idx_protocol_deviations_study_id
    ON protocol_deviations(study_id);

CREATE INDEX idx_adverse_events_study_id
    ON adverse_events(study_id);

CREATE INDEX idx_adverse_events_subject_id
    ON adverse_events(subject_id);

CREATE INDEX idx_study_clinical_parameters_study_id
    ON study_clinical_parameters(study_id);

CREATE INDEX idx_study_interventions_study_id
    ON study_interventions(study_id);

CREATE INDEX idx_study_assessments_study_id
    ON study_assessments(study_id);

CREATE INDEX idx_study_criteria_study_id
    ON study_criteria(study_id);

CREATE INDEX idx_subject_criteria_results_study_id
    ON subject_criteria_results(study_id);

CREATE INDEX idx_subject_criteria_results_subject_id
    ON subject_criteria_results(subject_id);

CREATE INDEX idx_subject_assessments_study_id
    ON subject_assessments(study_id);

CREATE INDEX idx_subject_assessments_subject_id
    ON subject_assessments(subject_id);

CREATE INDEX idx_subject_assessments_scheduled_date
    ON subject_assessments(scheduled_date);

CREATE INDEX idx_subject_assessments_status
    ON subject_assessments(status);

CREATE INDEX idx_audit_logs_table_record
    ON audit_logs(table_name, record_id);

CREATE INDEX idx_audit_logs_timestamp
    ON audit_logs(timestamp);