-- ==========================================================
-- KAUSHAL SETU — ACADEMIA-INDUSTRY COLLABORATION PORTAL
-- MASTER POSTGRESQL RELATIONAL DATABASE SCHEMA & MIGRATIONS
-- Aligned with Skill India Mission, MeitY & DPDP Act Standards
-- ==========================================================

-- Create Logical Domain Schemas
CREATE SCHEMA IF NOT EXISTS common;
CREATE SCHEMA IF NOT EXISTS students;
CREATE SCHEMA IF NOT EXISTS institutions;
CREATE SCHEMA IF NOT EXISTS industry;

-- ----------------------------------------------------------
-- 1. COMMON / AUTHENTICATION DOMAIN
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS common.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    role VARCHAR(50) NOT NULL CHECK(role IN ('student', 'institution', 'industry', 'admin')),
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    organization VARCHAR(255),
    identifier VARCHAR(100),
    avatar_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    auth_provider VARCHAR(50) DEFAULT 'local',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS common.otp_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    target VARCHAR(255) NOT NULL,
    otp_code VARCHAR(10) NOT NULL,
    purpose VARCHAR(50) NOT NULL,
    attempts INTEGER DEFAULT 0,
    is_used BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS common.sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES common.users(id) ON DELETE CASCADE,
    token VARCHAR(500) UNIQUE NOT NULL,
    ip_address VARCHAR(100),
    user_agent TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS common.skills (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(150) UNIQUE NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    in_demand BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS common.courses (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    provider VARCHAR(255) NOT NULL,
    description TEXT,
    target_skill_id VARCHAR(100) REFERENCES common.skills(id),
    target_skill_name VARCHAR(150) NOT NULL,
    duration_hours INTEGER DEFAULT 20,
    total_lessons INTEGER DEFAULT 10,
    difficulty VARCHAR(50) DEFAULT 'Intermediate',
    thumbnail_url TEXT,
    rating NUMERIC(3,2) DEFAULT 4.80,
    enrolled_count INTEGER DEFAULT 100,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS common.course_lectures (
    id VARCHAR(100) PRIMARY KEY,
    course_id VARCHAR(100) NOT NULL REFERENCES common.courses(id) ON DELETE CASCADE,
    lesson_number INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    resource_url TEXT NOT NULL,
    duration_mins INTEGER DEFAULT 25,
    is_free_preview BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS common.faqs (
    id VARCHAR(100) PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    icon VARCHAR(50) DEFAULT 'help_outline',
    keywords TEXT,
    display_order INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS common.support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES common.users(id),
    user_email VARCHAR(255) NOT NULL,
    user_role VARCHAR(50) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(50) DEFAULT 'Medium',
    status VARCHAR(50) DEFAULT 'Open' CHECK(status IN ('Open', 'In Progress', 'Waiting', 'Resolved', 'Closed')),
    admin_reply TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS common.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    user_email VARCHAR(255),
    role VARCHAR(50),
    action VARCHAR(100) NOT NULL,
    details TEXT,
    ip_address VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS common.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES common.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info',
    link TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------
-- 2. STUDENT DOMAIN
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS students.profiles (
    user_id UUID PRIMARY KEY REFERENCES common.users(id) ON DELETE CASCADE,
    bio TEXT,
    apaar_id VARCHAR(100),
    roll_number VARCHAR(100),
    institution_name VARCHAR(255),
    degree_program VARCHAR(255),
    graduation_year INTEGER,
    current_cgpa NUMERIC(4,2),
    state VARCHAR(100),
    digilocker_status VARCHAR(50) DEFAULT 'unlinked' CHECK(digilocker_status IN ('unlinked', 'pending', 'verified')),
    digilocker_id VARCHAR(100),
    digilocker_verified_at TIMESTAMP WITH TIME ZONE,
    academic_qualification_verified VARCHAR(50),
    academic_verification_status VARCHAR(50) DEFAULT 'pending' CHECK(academic_verification_status IN ('pending', 'verified', 'rejected')),
    profile_completion_pct INTEGER DEFAULT 45,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Crucial: Skills are NEVER silently deleted. History and status tracked.
CREATE TABLE IF NOT EXISTS students.skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES common.users(id) ON DELETE CASCADE,
    skill_id VARCHAR(100) REFERENCES common.skills(id),
    skill_name VARCHAR(150) NOT NULL,
    proficiency_level INTEGER DEFAULT 75,
    source VARCHAR(50) NOT NULL, -- 'digilocker', 'course', 'assessment', 'institutional', 'manual'
    verification_status VARCHAR(50) DEFAULT 'unverified' CHECK(verification_status IN ('unverified', 'verified', 'certified')),
    confidence NUMERIC(3,2) DEFAULT 0.85,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS students.skill_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES common.users(id) ON DELETE CASCADE,
    skill_name VARCHAR(150) NOT NULL,
    action VARCHAR(50) NOT NULL,
    source VARCHAR(50) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS students.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES common.users(id) ON DELETE CASCADE,
    document_type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    issuing_authority VARCHAR(255),
    document_number VARCHAR(100),
    verification_source VARCHAR(50),
    verification_status VARCHAR(50) DEFAULT 'verified',
    file_url TEXT,
    extracted_metadata JSONB,
    verified_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS students.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES common.users(id) ON DELETE CASCADE,
    course_id VARCHAR(100) NOT NULL REFERENCES common.courses(id) ON DELETE CASCADE,
    progress_pct INTEGER DEFAULT 0,
    lessons_completed INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'enrolled' CHECK(status IN ('enrolled', 'in_progress', 'completed')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS students.applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES common.users(id) ON DELETE CASCADE,
    job_id VARCHAR(100) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    job_title VARCHAR(255) NOT NULL,
    match_score INTEGER DEFAULT 0,
    matched_skills TEXT,
    missing_skills TEXT,
    status VARCHAR(50) DEFAULT 'Submitted' CHECK(status IN ('Submitted', 'Under Review', 'Shortlisted', 'Interview', 'Selected', 'Rejected', 'Withdrawn')),
    applied_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    next_action VARCHAR(255) DEFAULT 'Application under preliminary review'
);

-- ----------------------------------------------------------
-- 3. INSTITUTION DOMAIN
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS institutions.profiles (
    user_id UUID PRIMARY KEY REFERENCES common.users(id) ON DELETE CASCADE,
    institution_name VARCHAR(255) NOT NULL,
    aishe_code VARCHAR(50),
    institution_type VARCHAR(100) DEFAULT 'Central University',
    state VARCHAR(100),
    city VARCHAR(100),
    naac_grade VARCHAR(20) DEFAULT 'A++',
    aicte_approved BOOLEAN DEFAULT TRUE,
    nep_aligned BOOLEAN DEFAULT TRUE,
    total_students INTEGER DEFAULT 2400,
    verified_students INTEGER DEFAULT 1850,
    departments_count INTEGER DEFAULT 8,
    active_fdps INTEGER DEFAULT 4,
    website TEXT,
    contact_person VARCHAR(255),
    contact_email VARCHAR(255),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS institutions.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_user_id UUID NOT NULL REFERENCES common.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    head_of_department VARCHAR(255),
    student_count INTEGER DEFAULT 250,
    average_skill_score INTEGER DEFAULT 78,
    placement_rate_pct INTEGER DEFAULT 82
);

CREATE TABLE IF NOT EXISTS institutions.programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_user_id UUID NOT NULL REFERENCES common.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    department VARCHAR(255) NOT NULL,
    description TEXT,
    partner_industry VARCHAR(255),
    status VARCHAR(50) DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------
-- 4. INDUSTRY DOMAIN
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS industry.profiles (
    user_id UUID PRIMARY KEY REFERENCES common.users(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    cin_number VARCHAR(100),
    industry_sector VARCHAR(150) NOT NULL,
    company_size VARCHAR(100) DEFAULT 'Enterprise (1000+)',
    headquarters VARCHAR(255),
    website TEXT,
    verification_status VARCHAR(50) DEFAULT 'verified',
    active_postings INTEGER DEFAULT 5,
    total_hires INTEGER DEFAULT 48,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS industry.jobs (
    id VARCHAR(100) PRIMARY KEY,
    industry_user_id UUID NOT NULL REFERENCES common.users(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    job_type VARCHAR(100) NOT NULL,
    experience VARCHAR(100) DEFAULT 'Fresher / 0-1 years',
    location VARCHAR(255) NOT NULL,
    workplace_type VARCHAR(50) DEFAULT 'Hybrid' CHECK(workplace_type IN ('Remote', 'Hybrid', 'On-site')),
    stipend_salary VARCHAR(100),
    description TEXT NOT NULL,
    required_skills TEXT NOT NULL,
    preferred_skills TEXT,
    openings INTEGER DEFAULT 5,
    deadline DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Essential Performance Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON common.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON common.users(role);
CREATE INDEX IF NOT EXISTS idx_students_skills_user ON students.skills(user_id);
CREATE INDEX IF NOT EXISTS idx_students_apps_user ON students.applications(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON industry.jobs(created_at);
