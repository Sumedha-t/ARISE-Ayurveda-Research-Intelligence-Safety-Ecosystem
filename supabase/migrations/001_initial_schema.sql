-- ============================================================
-- ARISE - AIIA Clinical Trials Dashboard
-- Migration 001: Initial Database Schema
-- Dev 1 Frozen Specification
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
    phase study_phase NOT NULL,
    pi_id UUID REFERENCES auth.users(id),
    iec_approval_date DATE,
    iec_status VARCHAR(50) DEFAULT 'Approved',
    target_enrolment INT NOT NULL,
    current_enrolment INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT uq_study_subject UNIQUE (id, study_id)
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
);


-- ------------------------------------------------------------
-- Immutable ALCOA+ Audit Logs
-- ------------------------------------------------------------

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(50) NOT NULL,
    action VARCHAR(20) NOT NULL,
    record_id UUID NOT NULL,
    performed_by UUID REFERENCES auth.users(id),
    previous_data JSONB,
    new_data JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- ============================================================
-- 4. AUDIT LOG IMMUTABILITY
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
-- 5. AUTOMATIC CLINICAL AUDIT LOGGING
-- ============================================================

CREATE OR REPLACE FUNCTION log_clinical_audit_event()
RETURNS trigger AS $$
DECLARE
    current_uid UUID;
BEGIN
    current_uid := auth.uid();

    IF (TG_OP = 'INSERT') THEN

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

    ELSIF (TG_OP = 'UPDATE') THEN

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

    ELSIF (TG_OP = 'DELETE') THEN

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
-- 6. AUDIT TRIGGERS ON CORE CLINICAL TABLES
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