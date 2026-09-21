import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';

// Ensure data directory exists
const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'kaushal_setu.db');
export const db = new DatabaseSync(DB_PATH);

// Enable WAL mode and foreign keys
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

export function initDatabase() {
  console.log('Initializing Kaushal Setu Relational Database Schema...');

  // 1. Common / Authentication Tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS common_users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT,
      role TEXT NOT NULL CHECK(role IN ('student', 'institution', 'industry', 'admin')),
      full_name TEXT NOT NULL,
      phone TEXT,
      organization TEXT,
      identifier TEXT,
      avatar_url TEXT,
      is_verified INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      auth_provider TEXT DEFAULT 'local',
      github_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS common_otp_verifications (
      id TEXT PRIMARY KEY,
      target TEXT NOT NULL,
      otp_code TEXT NOT NULL,
      purpose TEXT NOT NULL,
      attempts INTEGER DEFAULT 0,
      is_used INTEGER DEFAULT 0,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_otp_target_used ON common_otp_verifications (target, is_used);
    CREATE INDEX IF NOT EXISTS idx_users_github_id ON common_users (github_id);

    CREATE TABLE IF NOT EXISTS common_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES common_users(id) ON DELETE CASCADE,
      token TEXT UNIQUE NOT NULL,
      ip_address TEXT,
      user_agent TEXT,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS common_skills (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      in_demand INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS common_courses (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      provider TEXT NOT NULL,
      description TEXT,
      category TEXT DEFAULT 'Software Engineering',
      skills_covered TEXT,
      target_skill_id TEXT REFERENCES common_skills(id),
      target_skill_name TEXT NOT NULL,
      duration_hours INTEGER DEFAULT 20,
      total_lessons INTEGER DEFAULT 10,
      difficulty TEXT DEFAULT 'Intermediate',
      thumbnail_url TEXT,
      rating REAL DEFAULT 4.8,
      enrolled_count INTEGER DEFAULT 120,
      course_url TEXT,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS common_course_lectures (
      id TEXT PRIMARY KEY,
      course_id TEXT NOT NULL REFERENCES common_courses(id) ON DELETE CASCADE,
      lesson_number INTEGER NOT NULL,
      title TEXT NOT NULL,
      resource_url TEXT NOT NULL,
      duration_mins INTEGER DEFAULT 25,
      is_free_preview INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS common_faqs (
      id TEXT PRIMARY KEY,
      category TEXT NOT NULL,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      icon TEXT DEFAULT 'help_outline',
      keywords TEXT,
      display_order INTEGER DEFAULT 1,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS common_support_tickets (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      user_email TEXT NOT NULL,
      user_role TEXT NOT NULL,
      subject TEXT NOT NULL,
      category TEXT NOT NULL,
      message TEXT NOT NULL,
      priority TEXT DEFAULT 'Medium',
      status TEXT DEFAULT 'Open' CHECK(status IN ('Open', 'In Progress', 'Waiting', 'Resolved', 'Closed')),
      admin_reply TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS common_audit_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      user_email TEXT,
      role TEXT,
      action TEXT NOT NULL,
      details TEXT,
      ip_address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS common_notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES common_users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT DEFAULT 'info',
      link TEXT,
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 2. Student Domain Tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS students_profiles (
      user_id TEXT PRIMARY KEY REFERENCES common_users(id) ON DELETE CASCADE,
      bio TEXT,
      apaar_id TEXT,
      roll_number TEXT,
      institution_name TEXT,
      degree_program TEXT,
      graduation_year INTEGER,
      current_cgpa REAL,
      state TEXT,
      digilocker_status TEXT DEFAULT 'unlinked' CHECK(digilocker_status IN ('unlinked', 'pending', 'verified')),
      digilocker_id TEXT,
      digilocker_verified_at DATETIME,
      academic_qualification_verified TEXT, -- 'Class 10', 'Class 12', 'Both', 'None'
      academic_verification_status TEXT DEFAULT 'pending' CHECK(academic_verification_status IN ('pending', 'verified', 'rejected')),
      profile_completion_pct INTEGER DEFAULT 45,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS students_skills (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES common_users(id) ON DELETE CASCADE,
      skill_id TEXT REFERENCES common_skills(id),
      skill_name TEXT NOT NULL,
      proficiency_level INTEGER DEFAULT 75, -- 0-100
      source TEXT NOT NULL, -- 'digilocker', 'course', 'assessment', 'institutional', 'manual'
      verification_status TEXT DEFAULT 'unverified' CHECK(verification_status IN ('unverified', 'verified', 'certified')),
      confidence REAL DEFAULT 0.85,
      is_active INTEGER DEFAULT 1, -- Never deleted silently
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS students_skill_history (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES common_users(id) ON DELETE CASCADE,
      skill_name TEXT NOT NULL,
      action TEXT NOT NULL, -- 'added', 'updated', 'verified', 'course_completed'
      source TEXT NOT NULL,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS students_documents (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES common_users(id) ON DELETE CASCADE,
      document_type TEXT NOT NULL, -- 'class_10_marksheet', 'class_12_marksheet', 'degree_certificate', 'resume'
      title TEXT NOT NULL,
      issuing_authority TEXT,
      document_number TEXT,
      verification_source TEXT, -- 'digilocker', 'manual_upload', 'nad'
      verification_status TEXT DEFAULT 'verified',
      file_url TEXT,
      extracted_metadata TEXT,
      verified_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS students_courses (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES common_users(id) ON DELETE CASCADE,
      course_id TEXT NOT NULL REFERENCES common_courses(id) ON DELETE CASCADE,
      progress_pct INTEGER DEFAULT 0,
      lessons_completed INTEGER DEFAULT 0,
      status TEXT DEFAULT 'enrolled' CHECK(status IN ('enrolled', 'in_progress', 'completed')),
      started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS students_applications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES common_users(id) ON DELETE CASCADE,
      job_id TEXT NOT NULL,
      company_name TEXT NOT NULL,
      job_title TEXT NOT NULL,
      match_score INTEGER DEFAULT 0,
      matched_skills TEXT,
      missing_skills TEXT,
      status TEXT DEFAULT 'Submitted' CHECK(status IN ('Submitted', 'Under Review', 'Shortlisted', 'Interview', 'Selected', 'Rejected', 'Withdrawn')),
      applied_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
      next_action TEXT DEFAULT 'Application under preliminary review'
    );

    CREATE TABLE IF NOT EXISTS students_application_history (
      id TEXT PRIMARY KEY,
      application_id TEXT NOT NULL REFERENCES students_applications(id) ON DELETE CASCADE,
      from_status TEXT,
      to_status TEXT NOT NULL,
      changed_by TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS students_projects (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES common_users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      technologies TEXT NOT NULL,
      skills_demonstrated TEXT,
      category TEXT DEFAULT 'Web Development',
      github_url TEXT,
      live_url TEXT,
      image_url TEXT,
      project_type TEXT DEFAULT 'Individual',
      duration TEXT,
      status TEXT DEFAULT 'Completed' CHECK(status IN ('In Progress', 'Completed', 'Maintained')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS students_rapid_fire (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL REFERENCES common_users(id) ON DELETE CASCADE,
      worked_skills TEXT,
      learn_skills TEXT,
      has_real_world_projects TEXT,
      has_hackathons TEXT,
      primary_interest TEXT,
      completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Safe schema migrations for existing SQLite databases
  try { db.exec("ALTER TABLE students_profiles ADD COLUMN is_profile_public INTEGER DEFAULT 1"); } catch (e) {}
  try { db.exec("ALTER TABLE common_courses ADD COLUMN category TEXT DEFAULT 'Software Engineering'"); } catch (e) {}
  try { db.exec("ALTER TABLE common_courses ADD COLUMN skills_covered TEXT"); } catch (e) {}
  try { db.exec("ALTER TABLE common_courses ADD COLUMN course_url TEXT"); } catch (e) {}
  try { db.exec("ALTER TABLE common_courses ADD COLUMN institution_user_id TEXT"); } catch (e) {}
  try { db.exec("ALTER TABLE common_users ADD COLUMN avatar_url TEXT"); } catch (e) {}
  try { db.exec("ALTER TABLE common_users ADD COLUMN github_id TEXT"); } catch (e) {}
  try { db.exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_common_users_github_id ON common_users(github_id) WHERE github_id IS NOT NULL"); } catch (e) {}
  try { db.exec("ALTER TABLE students_github ADD COLUMN username TEXT"); } catch (e) {}
  try { db.exec("ALTER TABLE students_github ADD COLUMN total_stars INTEGER DEFAULT 0"); } catch (e) {}
  try { db.exec("ALTER TABLE students_github ADD COLUMN total_contributions INTEGER DEFAULT 0"); } catch (e) {}
  try { db.exec("ALTER TABLE students_github ADD COLUMN top_languages TEXT"); } catch (e) {}
  try { db.exec("ALTER TABLE students_github ADD COLUMN profile_url TEXT"); } catch (e) {}
  try { db.exec("ALTER TABLE students_github ADD COLUMN last_synced_at DATETIME"); } catch (e) {}
  try { db.exec("ALTER TABLE students_leetcode ADD COLUMN username TEXT"); } catch (e) {}
  try { db.exec("ALTER TABLE students_leetcode ADD COLUMN acceptance_rate REAL DEFAULT 0"); } catch (e) {}
  try { db.exec("ALTER TABLE students_leetcode ADD COLUMN profile_url TEXT"); } catch (e) {}
  try { db.exec("ALTER TABLE students_leetcode ADD COLUMN last_synced_at DATETIME"); } catch (e) {}

  // 2b. Student Extended Integrations (Resume PDF, GitHub, LeetCode)
  db.exec(`
    CREATE TABLE IF NOT EXISTS students_resumes (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL REFERENCES common_users(id) ON DELETE CASCADE,
      file_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      mime_type TEXT NOT NULL,
      uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS students_github (
      user_id TEXT PRIMARY KEY REFERENCES common_users(id) ON DELETE CASCADE,
      github_username TEXT,
      username TEXT,
      avatar_url TEXT,
      public_repos INTEGER DEFAULT 0,
      followers INTEGER DEFAULT 0,
      languages TEXT,
      stars INTEGER DEFAULT 0,
      total_stars INTEGER DEFAULT 0,
      total_contributions INTEGER DEFAULT 0,
      top_languages TEXT,
      forks INTEGER DEFAULT 0,
      recent_activity TEXT,
      profile_url TEXT,
      last_synced_at DATETIME,
      connected_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS students_leetcode (
      user_id TEXT PRIMARY KEY REFERENCES common_users(id) ON DELETE CASCADE,
      leetcode_username TEXT,
      username TEXT,
      total_solved INTEGER DEFAULT 0,
      easy_solved INTEGER DEFAULT 0,
      medium_solved INTEGER DEFAULT 0,
      hard_solved INTEGER DEFAULT 0,
      ranking INTEGER DEFAULT 0,
      contest_rating REAL DEFAULT 0,
      acceptance_rate REAL DEFAULT 0,
      category_distribution TEXT,
      profile_url TEXT,
      last_synced_at DATETIME,
      connected_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 3. Institution Domain Tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS institutions_profiles (
      user_id TEXT PRIMARY KEY REFERENCES common_users(id) ON DELETE CASCADE,
      institution_name TEXT NOT NULL,
      aishe_code TEXT,
      institution_type TEXT DEFAULT 'Central University',
      state TEXT,
      city TEXT,
      naac_grade TEXT DEFAULT 'A++',
      aicte_approved INTEGER DEFAULT 1,
      nep_aligned INTEGER DEFAULT 1,
      total_students INTEGER DEFAULT 2400,
      verified_students INTEGER DEFAULT 1850,
      departments_count INTEGER DEFAULT 8,
      active_fdps INTEGER DEFAULT 4,
      website TEXT,
      contact_person TEXT,
      contact_email TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS institutions_faculty_nominations (
      id TEXT PRIMARY KEY,
      institution_user_id TEXT NOT NULL REFERENCES common_users(id) ON DELETE CASCADE,
      faculty_name TEXT NOT NULL,
      department TEXT NOT NULL,
      designation TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      specialization TEXT,
      program_title TEXT NOT NULL,
      nomination_type TEXT DEFAULT 'FDP',
      status TEXT DEFAULT 'Nominated' CHECK(status IN ('Nominated', 'Under Review', 'Approved', 'Active', 'Withdrawn')),
      remarks TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS institutions_departments (
      id TEXT PRIMARY KEY,
      institution_user_id TEXT NOT NULL REFERENCES common_users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      head_of_department TEXT,
      student_count INTEGER DEFAULT 250,
      average_skill_score INTEGER DEFAULT 78,
      placement_rate_pct INTEGER DEFAULT 82
    );

    CREATE TABLE IF NOT EXISTS institutions_programs (
      id TEXT PRIMARY KEY,
      institution_user_id TEXT NOT NULL REFERENCES common_users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      type TEXT NOT NULL, -- 'FDP', 'Curriculum Collaboration', 'Hackathon', 'Workshop'
      department TEXT NOT NULL,
      description TEXT,
      partner_industry TEXT,
      status TEXT DEFAULT 'Active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 4. Industry Domain Tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS industry_profiles (
      user_id TEXT PRIMARY KEY REFERENCES common_users(id) ON DELETE CASCADE,
      company_name TEXT NOT NULL,
      cin_number TEXT,
      industry_sector TEXT NOT NULL,
      company_size TEXT DEFAULT 'Enterprise (1000+)',
      headquarters TEXT,
      website TEXT,
      verification_status TEXT DEFAULT 'verified',
      active_postings INTEGER DEFAULT 5,
      total_hires INTEGER DEFAULT 48,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS industry_jobs (
      id TEXT PRIMARY KEY,
      industry_user_id TEXT NOT NULL REFERENCES common_users(id) ON DELETE CASCADE,
      company_name TEXT NOT NULL,
      title TEXT NOT NULL,
      job_type TEXT NOT NULL, -- 'Internship', 'Full-time Job', 'Apprenticeship', 'Live Project'
      experience TEXT DEFAULT 'Fresher / 0-1 years',
      location TEXT NOT NULL,
      workplace_type TEXT DEFAULT 'Hybrid' CHECK(workplace_type IN ('Remote', 'Hybrid', 'On-site')),
      stipend_salary TEXT,
      description TEXT NOT NULL,
      required_skills TEXT NOT NULL, -- Comma-separated or JSON string
      preferred_skills TEXT,
      openings INTEGER DEFAULT 5,
      deadline DATE,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS industry_interviews (
      id TEXT PRIMARY KEY,
      application_id TEXT NOT NULL REFERENCES students_applications(id) ON DELETE CASCADE,
      industry_user_id TEXT NOT NULL REFERENCES common_users(id) ON DELETE CASCADE,
      student_user_id TEXT NOT NULL REFERENCES common_users(id) ON DELETE CASCADE,
      job_id TEXT NOT NULL,
      position TEXT NOT NULL,
      company_name TEXT NOT NULL,
      interview_date DATETIME NOT NULL,
      interview_mode TEXT DEFAULT 'Virtual' CHECK(interview_mode IN ('Virtual', 'On-site', 'Campus')),
      instructions TEXT,
      status TEXT DEFAULT 'Scheduled' CHECK(status IN ('Scheduled', 'Completed', 'Rescheduled', 'Cancelled')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS admin_audit_logs (
      id TEXT PRIMARY KEY,
      admin_id TEXT NOT NULL REFERENCES common_users(id) ON DELETE CASCADE,
      admin_name TEXT NOT NULL,
      action TEXT NOT NULL,
      target_type TEXT NOT NULL,
      target_id TEXT,
      details TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create Indexes for high-performance querying
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_email ON common_users(email);
    CREATE INDEX IF NOT EXISTS idx_users_role ON common_users(role);
    CREATE INDEX IF NOT EXISTS idx_students_skills_user ON students_skills(user_id);
    CREATE INDEX IF NOT EXISTS idx_students_apps_user ON students_applications(user_id);
    CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON industry_jobs(created_at);
    CREATE INDEX IF NOT EXISTS idx_jobs_user ON industry_jobs(industry_user_id);
  `);

  // Migrate common_support_tickets to allow guest and unauthenticated inquiries without foreign key constraint failure
  try {
    const ticketsSql = (db.prepare("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'common_support_tickets'").get() as any)?.sql || '';
    if (ticketsSql.includes('REFERENCES common_users(id)')) {
      db.exec(`
        PRAGMA foreign_keys = OFF;
        CREATE TABLE common_support_tickets_migrated (
          id TEXT PRIMARY KEY,
          user_id TEXT,
          user_email TEXT NOT NULL,
          user_role TEXT NOT NULL,
          subject TEXT NOT NULL,
          category TEXT NOT NULL,
          message TEXT NOT NULL,
          priority TEXT DEFAULT 'Medium',
          status TEXT DEFAULT 'Open' CHECK(status IN ('Open', 'In Progress', 'Waiting', 'Resolved', 'Closed')),
          admin_reply TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        INSERT INTO common_support_tickets_migrated SELECT * FROM common_support_tickets;
        DROP TABLE common_support_tickets;
        ALTER TABLE common_support_tickets_migrated RENAME TO common_support_tickets;
        PRAGMA foreign_keys = ON;
      `);
      console.log('[Database Migration] common_support_tickets successfully migrated.');
    }
  } catch (err: any) {
    console.warn('[Database Migration] common_support_tickets migration skipped:', err.message);
  }

  // Migrate admin_audit_logs to cascade on user deletion
  try {
    const adminSql = (db.prepare("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'admin_audit_logs'").get() as any)?.sql || '';
    if (adminSql.includes('REFERENCES common_users(id)') && !adminSql.includes('ON DELETE CASCADE')) {
      db.exec(`
        PRAGMA foreign_keys = OFF;
        CREATE TABLE admin_audit_logs_migrated (
          id TEXT PRIMARY KEY,
          admin_id TEXT NOT NULL REFERENCES common_users(id) ON DELETE CASCADE,
          admin_name TEXT NOT NULL,
          action TEXT NOT NULL,
          target_type TEXT NOT NULL,
          target_id TEXT,
          details TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        INSERT INTO admin_audit_logs_migrated SELECT * FROM admin_audit_logs;
        DROP TABLE admin_audit_logs;
        ALTER TABLE admin_audit_logs_migrated RENAME TO admin_audit_logs;
        PRAGMA foreign_keys = ON;
      `);
      console.log('[Database Migration] admin_audit_logs successfully migrated.');
    }
  } catch (err: any) {
    console.warn('[Database Migration] admin_audit_logs migration skipped:', err.message);
  }

  seedInitialData();
  seedOrUpdateCourses();
  ensureAdminUser();
}

export function ensureAdminUser() {
  const adminEmail = (process.env.ADMIN_EMAIL || 'support@kaushalsetu.in').toLowerCase().trim();
  const rawAdminPassword = process.env.ADMIN_PASSWORD || 'SIH2026@kaushalsetu';
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(rawAdminPassword, salt);

  const existing = db.prepare('SELECT id, role, is_active FROM common_users WHERE email = ?').get(adminEmail) as any;
  if (!existing) {
    db.prepare(`
      INSERT INTO common_users (id, email, password_hash, role, full_name, phone, organization, identifier, is_verified, is_active)
      VALUES (?, ?, ?, 'admin', 'National Platform Administrator', '+91 11-2397-8046', 'Ministry of Education & Kaushal Setu Directorate', 'ADMIN-NAT-SEC-01', 1, 1)
    `).run('usr_admin_support', adminEmail, hash);
    console.log(`[Security] Dedicated Admin account initialized: ${adminEmail}`);
  } else {
    db.prepare(`
      UPDATE common_users
      SET role = 'admin', password_hash = ?, is_active = 1, is_verified = 1
      WHERE email = ?
    `).run(hash, adminEmail);
    console.log(`[Security] Dedicated Admin account verified: ${adminEmail}`);
  }
}

export function seedOrUpdateCourses() {
  console.log('[Courses] Synchronizing accredited course catalog...');

  const prerequisiteSkills = [
    { id: 'sk_python', name: 'Python', category: 'Programming', description: 'Data structures, algorithms, automation and backend frameworks' },
    { id: 'sk_java', name: 'Java Programming', category: 'Programming', description: 'Enterprise object-oriented software engineering and microservices' },
    { id: 'sk_cpp', name: 'C / C++', category: 'Programming', description: 'Systems programming, memory management, pointer arithmetic and algorithmic optimization' },
    { id: 'sk_coa', name: 'Computer Organization & Architecture', category: 'Computer Science Core', description: 'Von Neumann architecture, instruction cycle, pipelining, cache memory and CPU principles' },
    { id: 'sk_dsa', name: 'Data Structures & Algorithms', category: 'Computer Science Core', description: 'Arrays, linked lists, trees, graphs, sorting, searching and asymptotic complexity' },
    { id: 'sk_sql', name: 'SQL & Database Design', category: 'Databases', description: 'Relational database querying, normalization, transactions and indexing' },
    { id: 'sk_react', name: 'React.js', category: 'Web Development', description: 'Modern declarative frontend web UI engineering and state management' },
    { id: 'sk_node', name: 'Node.js & Express', category: 'Web Development', description: 'RESTful API architecture, event-driven I/O and server-side JS' },
    { id: 'sk_os', name: 'Operating Systems', category: 'Computer Science Core', description: 'Processes, threads, CPU scheduling, synchronization, memory and file systems' },
    { id: 'sk_networks', name: 'Computer Networks', category: 'Computer Science Core', description: 'OSI/TCP-IP stacks, routing protocols, sockets, DNS and network security' },
    { id: 'sk_dbms', name: 'Database Management Systems', category: 'Computer Science Core', description: 'ER modeling, relational algebra, SQL, normalization and transactions' },
    { id: 'sk_ml', name: 'Machine Learning', category: 'AI & Machine Learning', description: 'Supervised & unsupervised learning, scikit-learn and model evaluation' },
    { id: 'sk_genai', name: 'Generative AI', category: 'AI & Machine Learning', description: 'Large language models, prompt engineering, transformer architectures and ethics' },
    { id: 'sk_git', name: 'Git & GitHub', category: 'Development & Tools', description: 'Version control workflows, collaborative branching and pull requests' },
    { id: 'sk_linux', name: 'Linux & Shell Scripting', category: 'Development & Tools', description: 'Linux command line, shell scripts, permissions and system administration' },
    { id: 'sk_docker', name: 'Docker & Containers', category: 'Cloud & DevOps', description: 'Containerization, Dockerfiles and multi-stage microservices' },
    { id: 'sk_interview', name: 'Technical Interview Preparation', category: 'Career Development', description: 'Data structures, algorithmic problem solving and behavioral interview readiness' }
  ];

  const insertSkill = db.prepare(`
    INSERT OR IGNORE INTO common_skills (id, name, category, description, in_demand)
    VALUES (?, ?, ?, ?, 1)
  `);
  for (const s of prerequisiteSkills) {
    try {
      insertSkill.run(s.id, s.name, s.category, s.description);
    } catch (e) {}
  }

  const catalogCourses = [
    {
      id: 'crs_python_fcc',
      title: 'Scientific Computing with Python',
      provider: 'freeCodeCamp',
      description: 'Comprehensive curriculum covering Python fundamentals, data structures, algorithm design, and computational problem solving with real project certifications.',
      category: 'Programming',
      skills_covered: 'Python, Algorithms, Problem Solving, Data Structures',
      target_skill_id: 'sk_python',
      target_skill_name: 'Python',
      duration_hours: 30,
      total_lessons: 10,
      difficulty: 'Beginner',
      thumbnail_url: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=600&auto=format&fit=crop&q=80',
      rating: 4.9,
      enrolled_count: 5800,
      course_url: 'https://www.freecodecamp.org/learn/scientific-computing-with-python/'
    },
    {
      id: 'crs_java_nptel',
      title: 'Programming in Java',
      provider: 'NPTEL & IIT Kharagpur',
      description: 'Thorough academic treatment of Java syntax, object-oriented concepts, exception handling, multithreading, and standard library collections.',
      category: 'Programming',
      skills_covered: 'Java, OOP, Multithreading, Data Collections',
      target_skill_id: 'sk_java',
      target_skill_name: 'Java Programming',
      duration_hours: 40,
      total_lessons: 12,
      difficulty: 'Intermediate',
      thumbnail_url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80',
      rating: 4.85,
      enrolled_count: 4920,
      course_url: 'https://nptel.ac.in/courses/106105192'
    },
    {
      id: 'crs_cs50_c',
      title: "CS50's Introduction to Computer Science",
      provider: 'Harvard University (edX)',
      description: 'An introduction to the intellectual enterprises of computer science and the art of programming using C, memory management, and data structures.',
      category: 'Programming',
      skills_covered: 'C, Memory Management, Pointers, Algorithms',
      target_skill_id: 'sk_cpp',
      target_skill_name: 'C / C++',
      duration_hours: 60,
      total_lessons: 11,
      difficulty: 'Beginner',
      thumbnail_url: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=600&auto=format&fit=crop&q=80',
      rating: 4.95,
      enrolled_count: 8700,
      course_url: 'https://cs50.harvard.edu/x/'
    },
    {
      id: 'crs_dsa_nptel',
      title: 'Data Structures and Algorithms',
      provider: 'NPTEL & IIT Madras',
      description: 'Systematic analysis of arrays, linked lists, trees, graphs, sorting, searching algorithms, and asymptotic complexity analysis.',
      category: 'Data Structures & Algorithms',
      skills_covered: 'DSA, Graph Algorithms, Sorting & Searching, Complexity Analysis',
      target_skill_id: 'sk_dsa',
      target_skill_name: 'Data Structures & Algorithms',
      duration_hours: 40,
      total_lessons: 12,
      difficulty: 'Intermediate',
      thumbnail_url: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&auto=format&fit=crop&q=80',
      rating: 4.9,
      enrolled_count: 6200,
      course_url: 'https://nptel.ac.in/courses/106106127'
    },
    {
      id: 'crs_sql_fcc',
      title: 'Relational Database Certification & SQL',
      provider: 'freeCodeCamp',
      description: 'Master SQL, PostgreSQL database modeling, relational schemas, indexing, transactions, and command line administration.',
      category: 'Databases',
      skills_covered: 'SQL, PostgreSQL, Relational Modeling, Database Administration',
      target_skill_id: 'sk_sql',
      target_skill_name: 'SQL & Database Design',
      duration_hours: 25,
      total_lessons: 8,
      difficulty: 'Intermediate',
      thumbnail_url: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=600&auto=format&fit=crop&q=80',
      rating: 4.88,
      enrolled_count: 3850,
      course_url: 'https://www.freecodecamp.org/learn/relational-database/'
    },
    {
      id: 'crs_react',
      title: 'React.js Fundamentals & Modern Frontend Engineering',
      provider: 'React Official Documentation & Meta',
      description: 'Master component architecture, hooks, state machines, and build production web applications aligned with enterprise demand.',
      category: 'Web Development',
      skills_covered: 'React.js, JavaScript, Component Design, State Management',
      target_skill_id: 'sk_react',
      target_skill_name: 'React.js',
      duration_hours: 24,
      total_lessons: 8,
      difficulty: 'Intermediate',
      thumbnail_url: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&auto=format&fit=crop&q=80',
      rating: 4.9,
      enrolled_count: 4320,
      course_url: 'https://react.dev/learn'
    },
    {
      id: 'crs_fullstack_odin',
      title: 'Full Stack JavaScript Development',
      provider: 'The Odin Project',
      description: 'Comprehensive open-source curriculum covering modern JavaScript, Node.js, Express, REST APIs, authentication, and full-stack deployment.',
      category: 'Web Development',
      skills_covered: 'Node.js, Express, Full-Stack Architecture, REST APIs',
      target_skill_id: 'sk_node',
      target_skill_name: 'Node.js & Express',
      duration_hours: 48,
      total_lessons: 14,
      difficulty: 'Intermediate',
      thumbnail_url: 'https://images.unsplash.com/photo-1593720213428-28a5b9e94613?w=600&auto=format&fit=crop&q=80',
      rating: 4.92,
      enrolled_count: 5400,
      course_url: 'https://www.theodinproject.com/paths/full-stack-javascript'
    },
    {
      id: 'crs_os_nptel',
      title: 'Operating Systems & System Architecture',
      provider: 'NPTEL & IIT Madras',
      description: 'In-depth study of process management, threads, CPU scheduling, synchronization primitives, deadlocks, and virtual memory management.',
      category: 'Computer Science Core',
      skills_covered: 'Operating Systems, Process Management, Concurrency, Virtual Memory',
      target_skill_id: 'sk_os',
      target_skill_name: 'Operating Systems',
      duration_hours: 40,
      total_lessons: 12,
      difficulty: 'Intermediate',
      thumbnail_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80',
      rating: 4.87,
      enrolled_count: 4100,
      course_url: 'https://nptel.ac.in/courses/106106144'
    },
    {
      id: 'crs_networks_nptel',
      title: 'Computer Networks & Internet Protocol Architecture',
      provider: 'NPTEL & IIT Kharagpur',
      description: 'Rigorous coverage of the OSI and TCP/IP protocol stacks, routing algorithms, socket programming, flow control, and network security.',
      category: 'Computer Science Core',
      skills_covered: 'Computer Networks, TCP/IP, DNS, Routing Protocols',
      target_skill_id: 'sk_networks',
      target_skill_name: 'Computer Networks',
      duration_hours: 36,
      total_lessons: 10,
      difficulty: 'Intermediate',
      thumbnail_url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&auto=format&fit=crop&q=80',
      rating: 4.82,
      enrolled_count: 3600,
      course_url: 'https://nptel.ac.in/courses/106105183'
    },
    {
      id: 'crs_dbms_nptel',
      title: 'Database Management Systems Principles',
      provider: 'NPTEL & IIT Kharagpur',
      description: 'Concepts of database systems, ER modeling, relational algebra, SQL, normalization (BCNF/3NF), concurrency control, and transaction recovery.',
      category: 'Computer Science Core',
      skills_covered: 'DBMS, Normalization, ACID Transactions, Concurrency Control',
      target_skill_id: 'sk_dbms',
      target_skill_name: 'Database Management Systems',
      duration_hours: 32,
      total_lessons: 10,
      difficulty: 'Intermediate',
      thumbnail_url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80',
      rating: 4.86,
      enrolled_count: 4400,
      course_url: 'https://nptel.ac.in/courses/106105175'
    },
    {
      id: 'crs_ml',
      title: 'Machine Learning Specialization & Foundations',
      provider: 'DeepLearning.AI & Stanford Online',
      description: 'Fundamental concepts of machine learning including supervised learning, logistic regression, neural networks, decision trees, and unsupervised techniques.',
      category: 'AI & Machine Learning',
      skills_covered: 'Python, Machine Learning, Neural Networks, Model Evaluation',
      target_skill_id: 'sk_ml',
      target_skill_name: 'Machine Learning',
      duration_hours: 36,
      total_lessons: 10,
      difficulty: 'Intermediate',
      thumbnail_url: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=600&auto=format&fit=crop&q=80',
      rating: 4.93,
      enrolled_count: 7200,
      course_url: 'https://www.deeplearning.ai/courses/machine-learning-specialization/'
    },
    {
      id: 'crs_genai_google',
      title: 'Introduction to Generative AI & Large Language Models',
      provider: 'Google Cloud Skills Boost',
      description: 'Introductory curriculum explaining what Generative AI is, how LLMs are used, prompt engineering, and responsible AI principles.',
      category: 'AI & Machine Learning',
      skills_covered: 'Generative AI, LLMs, Prompt Engineering, Responsible AI',
      target_skill_id: 'sk_genai',
      target_skill_name: 'Generative AI',
      duration_hours: 16,
      total_lessons: 6,
      difficulty: 'Beginner',
      thumbnail_url: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&auto=format&fit=crop&q=80',
      rating: 4.89,
      enrolled_count: 6100,
      course_url: 'https://www.cloudskillsboost.google/course_templates/536'
    },
    {
      id: 'crs_git_github',
      title: 'Version Control with Git & GitHub',
      provider: 'GitHub Skills & Microsoft Learn',
      description: 'Official interactive training on branching strategies, pull requests, merge conflict resolution, Git workflows, and collaborative software engineering.',
      category: 'Development & Tools',
      skills_covered: 'Git, GitHub, Version Control, Code Review',
      target_skill_id: 'sk_git',
      target_skill_name: 'Git & GitHub',
      duration_hours: 14,
      total_lessons: 6,
      difficulty: 'Beginner',
      thumbnail_url: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=600&auto=format&fit=crop&q=80',
      rating: 4.91,
      enrolled_count: 5300,
      course_url: 'https://skills.github.com/'
    },
    {
      id: 'crs_linux_edx',
      title: 'Introduction to Linux & Shell Scripting',
      provider: 'The Linux Foundation (edX)',
      description: 'Official curriculum by the Linux Foundation covering Linux command line navigation, bash scripting, permissions, process management, and system utilities.',
      category: 'Development & Tools',
      skills_covered: 'Linux, Bash Scripting, CLI Navigation, System Administration',
      target_skill_id: 'sk_linux',
      target_skill_name: 'Linux & Shell Scripting',
      duration_hours: 20,
      total_lessons: 8,
      difficulty: 'Beginner',
      thumbnail_url: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=600&auto=format&fit=crop&q=80',
      rating: 4.88,
      enrolled_count: 4200,
      course_url: 'https://www.edx.org/learn/linux/the-linux-foundation-introduction-to-linux'
    },
    {
      id: 'crs_docker',
      title: 'Docker & Containerization for Cloud Native Systems',
      provider: 'Docker Official Documentation & CNCF',
      description: 'Package microservices into clean, repeatable containers, manage multi-container systems, and configure CI/CD delivery pipelines.',
      category: 'Cloud & DevOps',
      skills_covered: 'Docker, Microservices, CI/CD, Container Security',
      target_skill_id: 'sk_docker',
      target_skill_name: 'Docker & Containers',
      duration_hours: 18,
      total_lessons: 6,
      difficulty: 'Intermediate',
      thumbnail_url: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=600&auto=format&fit=crop&q=80',
      rating: 4.84,
      enrolled_count: 3900,
      course_url: 'https://docs.docker.com/get-started/'
    },
    {
      id: 'crs_interview_fcc',
      title: 'Coding Interview Preparation & Problem Solving',
      provider: 'freeCodeCamp',
      description: 'Comprehensive hands-on problem sets covering technical interviews, data structures, Project Euler algorithms, and competitive problem-solving.',
      category: 'Career-Oriented Learning',
      skills_covered: 'Interview Preparation, Problem Solving, Code Optimization, Algorithms',
      target_skill_id: 'sk_interview',
      target_skill_name: 'Technical Interview Preparation',
      duration_hours: 30,
      total_lessons: 10,
      difficulty: 'Intermediate',
      thumbnail_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80',
      rating: 4.94,
      enrolled_count: 6700,
      course_url: 'https://www.freecodecamp.org/learn/coding-interview-prep/'
    },
    {
      id: 'crs_coa_nptel',
      title: 'Computer Organization and Architecture',
      provider: 'NPTEL & IIT Guwahati',
      description: 'Von Neumann architecture, instruction cycle, pipelining, cache memory hierarchies, interrupt handling, and RISC/CISC microprocessor principles.',
      category: 'Computer Science Core',
      skills_covered: 'Computer Architecture, Instruction Sets, CPU Pipelining, Cache Hierarchy',
      target_skill_id: 'sk_coa',
      target_skill_name: 'Computer Organization & Architecture',
      duration_hours: 36,
      total_lessons: 12,
      difficulty: 'Intermediate',
      thumbnail_url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&auto=format&fit=crop&q=80',
      rating: 4.86,
      enrolled_count: 3200,
      course_url: 'https://nptel.ac.in/courses/106103068'
    },
    {
      id: 'crs_cpp_nptel',
      title: 'An Introduction to Programming Through C++',
      provider: 'NPTEL & IIT Bombay',
      description: 'Foundational and modern C++ programming covering algorithmic control flow, object-oriented concepts, templates, STL containers, and memory management.',
      category: 'Programming',
      skills_covered: 'C++, Object-Oriented Programming, Standard Template Library (STL), Memory Management',
      target_skill_id: 'sk_cpp',
      target_skill_name: 'C / C++',
      duration_hours: 40,
      total_lessons: 12,
      difficulty: 'Intermediate',
      thumbnail_url: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=600&auto=format&fit=crop&q=80',
      rating: 4.88,
      enrolled_count: 4500,
      course_url: 'https://nptel.ac.in/courses/106101208'
    }
  ];

  const upsertCourse = db.prepare(`
    INSERT INTO common_courses (
      id, title, provider, description, category, skills_covered,
      target_skill_id, target_skill_name, duration_hours, total_lessons,
      difficulty, thumbnail_url, rating, enrolled_count, course_url
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      provider = excluded.provider,
      description = excluded.description,
      category = excluded.category,
      skills_covered = excluded.skills_covered,
      target_skill_id = excluded.target_skill_id,
      target_skill_name = excluded.target_skill_name,
      duration_hours = excluded.duration_hours,
      total_lessons = excluded.total_lessons,
      difficulty = excluded.difficulty,
      thumbnail_url = excluded.thumbnail_url,
      rating = excluded.rating,
      enrolled_count = excluded.enrolled_count,
      course_url = excluded.course_url
  `);

  for (const c of catalogCourses) {
    let skillId = c.target_skill_id;
    const existingSkill = db.prepare('SELECT id FROM common_skills WHERE id = ?').get(skillId);
    if (!existingSkill) {
      try {
        db.prepare(`
          INSERT OR IGNORE INTO common_skills (id, name, category, description, in_demand)
          VALUES (?, ?, ?, ?, 1)
        `).run(skillId, c.target_skill_name, c.category, c.description);
      } catch (e) {}
    }
    upsertCourse.run(
      c.id, c.title, c.provider, c.description, c.category, c.skills_covered,
      skillId, c.target_skill_name, c.duration_hours, c.total_lessons,
      c.difficulty, c.thumbnail_url, c.rating, c.enrolled_count, c.course_url
    );
  }

  console.log('[Courses] Successfully synchronized 16 accredited curriculum courses.');
}

function seedInitialData() {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM common_users').get() as { count: number };
  if (userCount.count > 0) {
    console.log('Database already contains records. Skipping seed.');
    return;
  }

  console.log('Seeding Kaushal Setu database with comprehensive demo records...');
  const salt = bcrypt.genSaltSync(10);
  const defaultPasswordHash = bcrypt.hashSync('Kaushal@2025', salt);
  const adminPasswordHash = bcrypt.hashSync('Admin@Setu2025', salt);

  // 1. Seed Skills
  const skills = [
    { id: 'sk_python', name: 'Python', category: 'Programming', description: 'Data structures, algorithms, automation and backend frameworks' },
    { id: 'sk_sql', name: 'SQL & Database Design', category: 'Data & Cloud', description: 'Relational database querying, normalization and indexing' },
    { id: 'sk_react', name: 'React.js', category: 'Frontend', description: 'Modern declarative frontend web UI engineering and state management' },
    { id: 'sk_git', name: 'Git & GitHub', category: 'DevOps', description: 'Version control workflows, collaborative branching and PRs' },
    { id: 'sk_node', name: 'Node.js & Express', category: 'Backend', description: 'RESTful API architecture, event-driven I/O and server-side JS' },
    { id: 'sk_ml', name: 'Machine Learning', category: 'AI/ML', description: 'Supervised & unsupervised learning, scikit-learn and model evaluation' },
    { id: 'sk_cloud', name: 'Cloud Computing (GCP/AWS)', category: 'Data & Cloud', description: 'Serverless deployment, container orchestration and networking' },
    { id: 'sk_comm', name: 'Technical Communication', category: 'Soft Skills', description: 'Engineering documentation, sprint reviews and client presentations' },
    { id: 'sk_java', name: 'Java & Spring Boot', category: 'Backend', description: 'Enterprise object-oriented software engineering and microservices' },
    { id: 'sk_cyber', name: 'Cybersecurity Fundamentals', category: 'Security', description: 'Network security protocols, OWASP top 10 and threat modeling' },
    { id: 'sk_docker', name: 'Docker & Containers', category: 'DevOps', description: 'Containerization, Dockerfiles and multi-stage microservices' },
    { id: 'sk_cpp', name: 'C++', category: 'Programming', description: 'Systems programming, memory management, pointer arithmetic and algorithmic optimization' },
    { id: 'sk_embedded', name: 'Embedded Systems', category: 'Hardware & IoT', description: 'Microcontroller architecture, peripheral interfacing and real-time computing' },
    { id: 'sk_iot', name: 'IoT & Sensors', category: 'Hardware & IoT', description: 'Sensor networks, wireless telemetry protocols, MQTT and edge computation' },
    { id: 'sk_dsp', name: 'Digital Signal Processing', category: 'Hardware & IoT', description: 'Sampling theorems, digital filter design, FIR/IIR and transform mathematics' }
  ];

  const insertSkill = db.prepare(`
    INSERT OR IGNORE INTO common_skills (id, name, category, description, in_demand)
    VALUES (?, ?, ?, ?, 1)
  `);
  for (const s of skills) {
    insertSkill.run(s.id, s.name, s.category, s.description);
  }

  // 2. Seed Courses
  const courses = [
    {
      id: 'crs_react',
      title: 'React.js Fundamentals & Modern Frontend Engineering',
      provider: 'National Skill Development Hub & Industry Guild',
      description: 'Master component architecture, hooks, state machines, and build production web applications aligned with enterprise demand.',
      category: 'Web Development',
      skills_covered: 'React.js, JavaScript, Component Design, State Management',
      target_skill_id: 'sk_react',
      target_skill_name: 'React.js',
      duration_hours: 24,
      total_lessons: 8,
      difficulty: 'Intermediate',
      thumbnail_url: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&auto=format&fit=crop&q=80',
      rating: 4.9,
      enrolled_count: 4320
    },
    {
      id: 'crs_ml',
      title: 'Machine Learning Foundations & Predictive Analytics',
      provider: 'IIT Delhi & AICTE Tech Consortium',
      description: 'Understand linear regression, neural architectures, scikit-learn pipelines and model deployment for industrial automation.',
      category: 'Data Science & AI',
      skills_covered: 'Python, Machine Learning, scikit-learn, Data Modeling',
      target_skill_id: 'sk_ml',
      target_skill_name: 'Machine Learning',
      duration_hours: 36,
      total_lessons: 10,
      difficulty: 'Advanced',
      thumbnail_url: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=600&auto=format&fit=crop&q=80',
      rating: 4.8,
      enrolled_count: 3100
    },
    {
      id: 'crs_docker',
      title: 'Docker & Containerization for Cloud Native Systems',
      provider: 'Cloud Native Computing Foundation (India Chapter)',
      description: 'Package microservices into clean, repeatable containers, manage multi-container systems, and configure CI/CD delivery pipelines.',
      category: 'Cloud & DevOps',
      skills_covered: 'Docker, Microservices, CI/CD, Container Security',
      target_skill_id: 'sk_docker',
      target_skill_name: 'Docker & Containers',
      duration_hours: 18,
      total_lessons: 6,
      difficulty: 'Intermediate',
      thumbnail_url: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=600&auto=format&fit=crop&q=80',
      rating: 4.7,
      enrolled_count: 2890
    },
    {
      id: 'crs_cloud',
      title: 'Cloud Infrastructure Architecture & Microservices',
      provider: 'MeitY National Cloud Center & Google Cloud',
      description: 'Learn enterprise cloud deployment patterns, serverless scaling, API gateway routing, and high-availability operations.',
      category: 'Cloud & DevOps',
      skills_covered: 'GCP/AWS, Serverless, API Gateway, Distributed Architecture',
      target_skill_id: 'sk_cloud',
      target_skill_name: 'Cloud Computing (GCP/AWS)',
      duration_hours: 30,
      total_lessons: 9,
      difficulty: 'Intermediate',
      thumbnail_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80',
      rating: 4.9,
      enrolled_count: 5120
    },
    {
      id: 'crs_cyber',
      title: 'Cybersecurity Practices, DPDP Act & Data Protection',
      provider: 'CERT-In & National Institute of Electronics',
      description: 'Implement encryption standards, protect against OWASP vulnerabilities, and adhere to India DPDP Act and ISO 27001 mandates.',
      category: 'Cybersecurity',
      skills_covered: 'Network Security, Encryption, OWASP, Compliance',
      target_skill_id: 'sk_cyber',
      target_skill_name: 'Cybersecurity Fundamentals',
      duration_hours: 22,
      total_lessons: 7,
      difficulty: 'Beginner',
      thumbnail_url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=80',
      rating: 4.8,
      enrolled_count: 1980
    },
    {
      id: 'crs_embedded',
      title: 'Embedded Systems & Real-Time IoT Firmware in C++',
      provider: 'IIT Madras & Semiconductor Guild',
      description: 'Program microcontrollers, configure peripheral interfaces (I2C, SPI, UART), and develop deterministic RTOS tasks.',
      category: 'Hardware & IoT',
      skills_covered: 'C++, Embedded Systems, RTOS, Microcontrollers',
      target_skill_id: 'sk_cpp',
      target_skill_name: 'C++',
      duration_hours: 28,
      total_lessons: 8,
      difficulty: 'Intermediate',
      thumbnail_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80',
      rating: 4.85,
      enrolled_count: 2150
    }
  ];

  const insertCourse = db.prepare(`
    INSERT OR IGNORE INTO common_courses (id, title, provider, description, category, skills_covered, target_skill_id, target_skill_name, duration_hours, total_lessons, difficulty, thumbnail_url, rating, enrolled_count)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const c of courses) {
    insertCourse.run(c.id, c.title, c.provider, c.description, c.category, c.skills_covered, c.target_skill_id, c.target_skill_name, c.duration_hours, c.total_lessons, c.difficulty, c.thumbnail_url, c.rating, c.enrolled_count);
  }

  // Seed course lectures with safe, verified educational resources
  const lectures = [
    { id: 'lec_react_1', course_id: 'crs_react', lesson_number: 1, title: 'Modern React Component Architecture', url: 'https://react.dev/learn', duration: 25 },
    { id: 'lec_react_2', course_id: 'crs_react', lesson_number: 2, title: 'State & Effect Lifecycle Management', url: 'https://react.dev/learn/state-a-components-memory', duration: 30 },
    { id: 'lec_react_3', course_id: 'crs_react', lesson_number: 3, title: 'Custom Hooks and Context API', url: 'https://react.dev/learn/reusing-logic-with-custom-hooks', duration: 35 },
    { id: 'lec_react_4', course_id: 'crs_react', lesson_number: 4, title: 'Server State & Real-Time Data Sync', url: 'https://developer.mozilla.org/en-US/docs/Learn/Tools_and_testing/Client-side_JavaScript_frameworks/React_getting_started', duration: 40 },
    { id: 'lec_ml_1', course_id: 'crs_ml', lesson_number: 1, title: 'Introduction to Machine Learning Paradigms', url: 'https://developers.google.com/machine-learning/crash-course', duration: 30 },
    { id: 'lec_ml_2', course_id: 'crs_ml', lesson_number: 2, title: 'Data Preprocessing and Feature Engineering', url: 'https://scikit-learn.org/stable/modules/preprocessing.html', duration: 45 },
    { id: 'lec_doc_1', course_id: 'crs_docker', lesson_number: 1, title: 'Containerization Concepts and Docker Architecture', url: 'https://docs.docker.com/get-started/', duration: 25 },
    { id: 'lec_doc_2', course_id: 'crs_docker', lesson_number: 2, title: 'Building Production-Grade Dockerfiles', url: 'https://docs.docker.com/develop/develop-images/dockerfile_best-practices/', duration: 30 }
  ];
  const insertLec = db.prepare(`
    INSERT OR IGNORE INTO common_course_lectures (id, course_id, lesson_number, title, resource_url, duration_mins)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  for (const l of lectures) {
    insertLec.run(l.id, l.course_id, l.lesson_number, l.title, l.url, l.duration);
  }

  // 3. Seed Users
  // Admin User
  const insertUser = db.prepare(`
    INSERT OR IGNORE INTO common_users (id, email, password_hash, role, full_name, phone, organization, identifier, is_verified, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 1)
  `);

  insertUser.run('usr_admin_1', 'admin@kaushalsetu.gov.in', adminPasswordHash, 'admin', 'National Portal Administrator', '+91 11-2090-7388', 'Ministry of Education / Kaushal Setu Directorate', 'ADMIN-DIRECTOR-01');

  // Student User (Aarav Sharma)
  insertUser.run('usr_std_1', 'student@kaushalsetu.in', defaultPasswordHash, 'student', 'Aarav Sharma', '9876543210', 'Indian Institute of Technology Delhi', 'IITD-2023-CS042');

  // Student 2 (Priya Verma)
  insertUser.run('usr_std_2', 'priya.verma@nitk.ac.in', defaultPasswordHash, 'student', 'Priya Verma', '9811223344', 'National Institute of Technology Karnataka', 'NITK-ECE-2022');

  // Institution User (Prof. Ramanathan)
  insertUser.run('usr_inst_1', 'institution@kaushalsetu.in', defaultPasswordHash, 'institution', 'Prof. K. Ramanathan', '9443210987', 'Delhi Technological University (DTU)', 'DTU-REG-8821');

  // Industry User (Tata Consultancy Services & Tech Mahindra Lead)
  insertUser.run('usr_ind_1', 'industry@kaushalsetu.in', defaultPasswordHash, 'industry', 'Vikramaditya Singhania', '9988776655', 'TCS Digital Talent Solutions', 'TCS-HR-IND-90');

  // Second Industry User (Infosys Innovation Hub)
  insertUser.run('usr_ind_2', 'recruiter@infosys.com', defaultPasswordHash, 'industry', 'Ananya Deshmukh', '9765432100', 'Infosys Engineering Services', 'INFY-RECRUIT-44');

  // 4. Seed Student Profile
  const insertStdProf = db.prepare(`
    INSERT OR IGNORE INTO students_profiles (user_id, bio, apaar_id, roll_number, institution_name, degree_program, graduation_year, current_cgpa, state, digilocker_status, digilocker_id, digilocker_verified_at, academic_qualification_verified, academic_verification_status, profile_completion_pct)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertStdProf.run(
    'usr_std_1',
    'Pre-final year Computer Science undergraduate focused on Full-stack systems, algorithmic optimization, and cloud-native software engineering.',
    'APAAR-8829-1092-4431',
    'IITD-2023-CS042',
    'Indian Institute of Technology Delhi',
    'B.Tech in Computer Science and Engineering',
    2026,
    8.92,
    'Delhi NCR',
    'verified',
    'DL-IND-9923847291',
    new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    'Both',
    'verified',
    85
  );

  // Seed Student Verified Skills
  // Aarav has Python, SQL & Database Design, Git & GitHub, Node.js & Express
  // Missing: React.js (for Full-stack job) or Machine Learning (for AI job)
  const insertStdSkill = db.prepare(`
    INSERT OR IGNORE INTO students_skills (id, user_id, skill_id, skill_name, proficiency_level, source, verification_status, confidence)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertStdSkill.run('sk_aarav_1', 'usr_std_1', 'sk_python', 'Python', 90, 'digilocker', 'verified', 0.95);
  insertStdSkill.run('sk_aarav_2', 'usr_std_1', 'sk_sql', 'SQL & Database Design', 85, 'digilocker', 'verified', 0.92);
  insertStdSkill.run('sk_aarav_3', 'usr_std_1', 'sk_git', 'Git & GitHub', 80, 'assessment', 'certified', 0.90);
  insertStdSkill.run('sk_aarav_4', 'usr_std_1', 'sk_node', 'Node.js & Express', 78, 'course', 'certified', 0.88);
  insertStdSkill.run('sk_aarav_5', 'usr_std_1', 'sk_comm', 'Technical Communication', 85, 'institutional', 'verified', 0.90);

  // Student skill history records (Never silently deleted)
  const insertSkillHist = db.prepare(`
    INSERT OR IGNORE INTO students_skill_history (id, user_id, skill_name, action, source, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  insertSkillHist.run('h1', 'usr_std_1', 'Python', 'verified', 'digilocker', 'Derived from CBSE Senior Secondary Computer Science Grade A1');
  insertSkillHist.run('h2', 'usr_std_1', 'SQL & Database Design', 'verified', 'digilocker', 'Derived from NPTEL Database Systems Silver Elite Certificate');
  insertSkillHist.run('h3', 'usr_std_1', 'Git & GitHub', 'certified', 'assessment', 'Validated through Kaushal Setu Diagnostic Code Sandbox');

  // Seed Student Documents
  const insertDoc = db.prepare(`
    INSERT OR IGNORE INTO students_documents (id, user_id, document_type, title, issuing_authority, document_number, verification_source, verification_status, extracted_metadata)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertDoc.run('doc_1', 'usr_std_1', 'class_10_marksheet', 'Secondary School Examination (Class X) Certificate', 'Central Board of Secondary Education (CBSE)', 'CBSE-X-9948291', 'digilocker', 'verified', JSON.stringify({ score: '94.6%', pass_year: 2020 }));
  insertDoc.run('doc_2', 'usr_std_1', 'class_12_marksheet', 'Senior School Certificate Examination (Class XII) Certificate', 'Central Board of Secondary Education (CBSE)', 'CBSE-XII-772918', 'digilocker', 'verified', JSON.stringify({ stream: 'Science with Computer Science', score: '96.2%', pass_year: 2022 }));
  insertDoc.run('doc_3', 'usr_std_1', 'degree_certificate', 'Undergraduate Semester Transcript (Sem 1-5)', 'Indian Institute of Technology Delhi', 'IITD-TR-2023-42', 'nad', 'verified', JSON.stringify({ cgpa: '8.92', credits_completed: 110 }));

  // Seed Student Enrolled Course
  const insertStdCourse = db.prepare(`
    INSERT OR IGNORE INTO students_courses (id, user_id, course_id, progress_pct, lessons_completed, status, started_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  insertStdCourse.run('sc_1', 'usr_std_1', 'crs_react', 50, 4, 'in_progress', new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString());

  // 4b. Seed Student 2 (Priya Verma - NITK Surathkal) Profile & Domain Data
  insertStdProf.run(
    'usr_std_2',
    'Third-year Electronics & Communication engineering student specializing in Embedded Systems, IoT networks, and real-time sensor firmware.',
    'APAAR-4491-7721-0023',
    'NITK-2022-EC019',
    'National Institute of Technology Karnataka, Surathkal',
    'B.Tech in Electronics and Communication Engineering',
    2026,
    9.15,
    'Karnataka',
    'verified',
    'DL-IND-7788192031',
    new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    'Both',
    'verified',
    90
  );

  // Seed Priya Verma's verified skills
  insertStdSkill.run('sk_priya_1', 'usr_std_2', 'sk_cpp', 'C++', 92, 'institutional', 'verified', 0.94);
  insertStdSkill.run('sk_priya_2', 'usr_std_2', 'sk_embedded', 'Embedded Systems', 88, 'assessment', 'certified', 0.92);
  insertStdSkill.run('sk_priya_3', 'usr_std_2', 'sk_iot', 'IoT & Sensors', 86, 'course', 'certified', 0.89);
  insertStdSkill.run('sk_priya_4', 'usr_std_2', 'sk_python', 'Python', 82, 'digilocker', 'verified', 0.88);
  insertStdSkill.run('sk_priya_5', 'usr_std_2', 'sk_dsp', 'Digital Signal Processing', 79, 'institutional', 'verified', 0.85);

  insertSkillHist.run('h_p1', 'usr_std_2', 'C++', 'verified', 'institutional', 'Verified through NITK Microcontroller & Embedded Computing Lab (Grade A+)');
  insertSkillHist.run('h_p2', 'usr_std_2', 'Embedded Systems', 'certified', 'assessment', 'Benchmarked in National Embedded Systems Challenge');
  insertSkillHist.run('h_p3', 'usr_std_2', 'IoT & Sensors', 'certified', 'course', 'Completed NPTEL IoT Architecture and Protocol certification');

  // Seed Priya's Documents
  insertDoc.run('doc_p1', 'usr_std_2', 'class_10_marksheet', 'Secondary School Examination (Class X) Certificate', 'Karnataka State Secondary Education Examination Board', 'KSEEB-X-882109', 'digilocker', 'verified', JSON.stringify({ score: '96.4%', pass_year: 2020 }));
  insertDoc.run('doc_p2', 'usr_std_2', 'class_12_marksheet', 'Department of Pre-University Education Certificate', 'Karnataka PUE Board', 'PUE-XII-551982', 'digilocker', 'verified', JSON.stringify({ stream: 'Science (PCMB)', score: '97.1%', pass_year: 2022 }));
  insertDoc.run('doc_p3', 'usr_std_2', 'degree_certificate', 'Undergraduate Engineering Grade Transcript (Sem 1-5)', 'National Institute of Technology Karnataka, Surathkal', 'NITK-TR-2022-19', 'nad', 'verified', JSON.stringify({ cgpa: '9.15', credits_completed: 114 }));

  // Seed Priya's Enrolled Course
  insertStdCourse.run('sc_2', 'usr_std_2', 'crs_docker', 75, 6, 'in_progress', new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString());

  // 4c. Seed Projects for Both Students (Complete Isolation)
  const insertProject = db.prepare(`
    INSERT OR IGNORE INTO students_projects (id, user_id, title, description, technologies, skills_demonstrated, category, github_url, live_url, project_type, duration, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Aarav Sharma's Projects (usr_std_1)
  insertProject.run(
    'proj_aarav_1',
    'usr_std_1',
    'Automated Micro-Services Telemetry Pipeline',
    'Constructed a resilient event streaming engine utilizing Kafka, Node.js, Express, and Redis for distributed transaction monitoring and high-concurrency event ingestion.',
    'Node.js, TypeScript, Kafka, Redis, Docker, Express',
    'Distributed Systems, Real-time Data Streaming, In-Memory Caching',
    'Backend & Distributed Systems',
    'https://github.com/aarav-sharma/telemetry-pipeline',
    'https://telemetry-demo.kaushalsetu.in',
    'Team',
    '3 Months',
    'Completed'
  );

  insertProject.run(
    'proj_aarav_2',
    'usr_std_1',
    'Kaushal Setu Skill Verifier & Sandbox',
    'Engineered an interactive code evaluation runner that tests candidate submissions against NSQF skill standards and auto-generates cryptographically verifiable audit trails.',
    'Python, FastAPI, SQLite, React 19, Tailwind CSS',
    'API Design, Algorithm Verification, Full-Stack Architecture',
    'Full-Stack Web Development',
    'https://github.com/aarav-sharma/skill-verifier-sandbox',
    'https://sandbox-preview.kaushalsetu.in',
    'Individual',
    '2 Months',
    'Completed'
  );

  // Priya Verma's Projects (usr_std_2)
  insertProject.run(
    'proj_priya_1',
    'usr_std_2',
    'Smart Agricultural IoT Mesh Network',
    'Engineered an autonomous low-power sensor mesh transmitting real-time soil moisture and environmental metrics across farm acreage via LoRaWAN to an edge Python gateway.',
    'ESP32, C++, LoRa, MQTT, Python, SQLite',
    'Embedded Firmware, Wireless Mesh Protocol, Low-Power Design',
    'IoT & Embedded Systems',
    'https://github.com/priya-verma/iot-agri-mesh',
    'https://smart-agri-demo.nitk.ac.in',
    'Team',
    '4 Months',
    'Completed'
  );

  insertProject.run(
    'proj_priya_2',
    'usr_std_2',
    'FPGA High-Speed Digital Filter Architecture',
    'Synthesized a pipelined 32-tap FIR filter on Xilinx Artix-7 FPGA achieving 250 MHz sample throughput with optimized multiplier-accumulator utilization.',
    'Verilog, C++, DSP Algorithms, MATLAB, Xilinx Vivado',
    'Hardware Description, DSP Optimization, Timing Constraints',
    'Hardware & DSP',
    'https://github.com/priya-verma/fpga-dsp-filter',
    null,
    'Individual',
    '3 Months',
    'Completed'
  );

  // 4d. Seed Rapid-Fire Assessments for Both Students
  const insertRapidFire = db.prepare(`
    INSERT OR IGNORE INTO students_rapid_fire (id, user_id, worked_skills, learn_skills, has_real_world_projects, has_hackathons, primary_interest)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertRapidFire.run(
    'rf_std_1',
    'usr_std_1',
    JSON.stringify(['Python', 'SQL/MySQL', 'Git/GitHub', 'Node.js', 'React', 'JavaScript']),
    JSON.stringify(['Machine Learning', 'Cybersecurity', 'Cloud']),
    'Yes',
    'Yes',
    'Software Development'
  );

  insertRapidFire.run(
    'rf_std_2',
    'usr_std_2',
    JSON.stringify(['C++', 'Python', 'IoT', 'Git/GitHub', 'Data Structures & Algorithms']),
    JSON.stringify(['Machine Learning', 'Cloud', 'Cybersecurity']),
    'Yes',
    'Yes',
    'Hardware/IoT'
  );

  // 5. Seed Institution Profile
  const insertInstProf = db.prepare(`
    INSERT OR IGNORE INTO institutions_profiles (user_id, institution_name, aishe_code, institution_type, state, city, naac_grade, aicte_approved, nep_aligned, total_students, verified_students, departments_count, active_fdps, website, contact_person, contact_email)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1, 1, 3850, 2940, 12, 6, 'https://dtu.ac.in', 'Prof. K. Ramanathan', 'registrar@dtu.ac.in')
  `);
  insertInstProf.run('usr_inst_1', 'Delhi Technological University (DTU)', 'U-0097', 'State Technological University', 'Delhi NCR', 'New Delhi', 'A++');

  const insertDept = db.prepare(`
    INSERT OR IGNORE INTO institutions_departments (id, institution_user_id, name, head_of_department, student_count, average_skill_score, placement_rate_pct)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  insertDept.run('dept_1', 'usr_inst_1', 'Computer Science & Engineering', 'Dr. Alok Srivastava', 420, 84, 94);
  insertDept.run('dept_2', 'usr_inst_1', 'Information Technology', 'Dr. Meenakshi Sundaram', 360, 81, 91);
  insertDept.run('dept_3', 'usr_inst_1', 'Electronics & Communication', 'Dr. R. K. Mathur', 380, 77, 85);
  insertDept.run('dept_4', 'usr_inst_1', 'Mechanical & Automation Engineering', 'Dr. Satish Chander', 310, 72, 76);

  const insertProg = db.prepare(`
    INSERT OR IGNORE INTO institutions_programs (id, institution_user_id, title, type, department, description, partner_industry, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertProg.run('prog_1', 'usr_inst_1', 'Microservices & Enterprise Cloud Systems FDP', 'FDP', 'Computer Science & Engineering', 'Two-week hands-on industrial training on Kubernetes, CI/CD and secure APIs for computer science faculty members.', 'TCS Digital & Microsoft India', 'Active');
  insertProg.run('prog_2', 'usr_inst_1', 'Syllabus Harmonization with Industry 4.0 IoT Standards', 'Curriculum Collaboration', 'Electronics & Communication', 'Aligning 6th semester embedded systems curriculum with direct industry micro-internships.', 'Tata Motors & Intel India', 'Active');

  // 6. Seed Industry Profile & Jobs
  const insertIndProf = db.prepare(`
    INSERT OR IGNORE INTO industry_profiles (user_id, company_name, cin_number, industry_sector, company_size, headquarters, website, verification_status, active_postings, total_hires)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'verified', 6, 84)
  `);
  insertIndProf.run('usr_ind_1', 'TCS Digital Talent Solutions', 'L72200MH1995PLC095651', 'Information Technology & Consulting', 'Enterprise (10,000+)', 'Mumbai / New Delhi', 'https://tcs.com');
  insertIndProf.run('usr_ind_2', 'Infosys Engineering Services', 'L85110KA1981PLC013115', 'Software & Cloud Engineering', 'Enterprise (10,000+)', 'Bengaluru / Pune', 'https://infosys.com');

  // Prominently support: Last 1 hour, Last 2 hours, Last 3 hours, Last 24 hours!
  const now = Date.now();
  const insertJob = db.prepare(`
    INSERT OR IGNORE INTO industry_jobs (id, industry_user_id, company_name, title, job_type, experience, location, workplace_type, stipend_salary, description, required_skills, preferred_skills, openings, deadline, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Job 1: Created 35 minutes ago (< 1 hour)
  insertJob.run(
    'job_1hr_tcs',
    'usr_ind_1',
    'TCS Digital Talent Solutions',
    'Full-Stack Developer Intern (Cloud Native Platforms)',
    'Internship',
    'Fresher / Final Year Students',
    'Bengaluru / Hyderabad (Hybrid)',
    'Hybrid',
    '₹35,000 / month + Pre-Placement Offer',
    'Collaborate with agile engineering squads to build resilient APIs and modern web applications. Work directly on production pipelines handling millions of requests.',
    'Python, SQL & Database Design, Git & GitHub, React.js',
    'Docker & Containers, Cloud Computing',
    12,
    '2026-10-31',
    new Date(now - 35 * 60 * 1000).toISOString()
  );

  // Job 2: Created 1 hour 40 minutes ago (< 2 hours)
  insertJob.run(
    'job_2hr_infy',
    'usr_ind_2',
    'Infosys Engineering Services',
    'Backend Systems & API Associate Engineer',
    'Full-time Job',
    'Fresher / 0-1 Years Experience',
    'Pune / Noida / Chennai',
    'On-site',
    '₹8.5 LPA - ₹11.2 LPA CTC',
    'Design and maintain scalable microservices, optimize SQL queries, and implement secure data transfer protocols adhering to enterprise SLAs.',
    'Python, SQL & Database Design, Node.js & Express, Git & GitHub',
    'Technical Communication, Cybersecurity Fundamentals',
    20,
    '2026-11-15',
    new Date(now - 100 * 60 * 1000).toISOString()
  );

  // Job 3: Created 2 hours 30 minutes ago (< 3 hours)
  insertJob.run(
    'job_3hr_tcs',
    'usr_ind_1',
    'TCS Digital Talent Solutions',
    'AI/ML Predictive Diagnostics Apprenticeship',
    'Apprenticeship',
    'B.Tech / M.Tech Pre-final / Final Year',
    'New Delhi / Gurugram',
    'Hybrid',
    '₹40,000 / month + National Credit Transfer',
    'Work alongside senior research scientists developing algorithmic prediction models for supply chain and aerospace telemetry datasets.',
    'Python, SQL & Database Design, Machine Learning',
    'Cloud Computing (GCP/AWS)',
    6,
    '2026-10-15',
    new Date(now - 150 * 60 * 1000).toISOString()
  );

  // Job 4: Created 14 hours ago (< 24 hours)
  insertJob.run(
    'job_24hr_tcs',
    'usr_ind_1',
    'TCS Digital Talent Solutions',
    'Cloud DevOps & Container Orchestration Intern',
    'Internship',
    'Fresher / Computer Science / IT',
    'Remote / Pan-India',
    'Remote',
    '₹30,000 / month Stipend',
    'Manage containerized microservices, build CI/CD deployment pipelines, monitor application telemetry and ensure uptime metrics.',
    'Git & GitHub, Docker & Containers, Cloud Computing (GCP/AWS)',
    'Python, Linux',
    8,
    '2026-11-01',
    new Date(now - 14 * 3600 * 1000).toISOString()
  );

  // Job 5: Created 3 days ago (Last 7 days)
  insertJob.run(
    'job_7d_infy',
    'usr_ind_2',
    'Infosys Engineering Services',
    'Cybersecurity & Network Defense Trainee',
    'Full-time Job',
    '0-1 Year Experience / B.Tech',
    'Bengaluru, Karnataka',
    'On-site',
    '₹7.8 LPA CTC',
    'Audit web applications for OWASP security vulnerabilities, configure encryption certificates, and assist in ISO 27001 compliance reviews.',
    'Cybersecurity Fundamentals, Git & GitHub, Technical Communication',
    'Python, Network protocols',
    10,
    '2026-10-20',
    new Date(now - 3 * 24 * 3600 * 1000).toISOString()
  );

  // 7. Seed Student Application
  const insertApp = db.prepare(`
    INSERT OR IGNORE INTO students_applications (id, user_id, job_id, company_name, job_title, match_score, matched_skills, missing_skills, status, applied_date, next_action)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertApp.run(
    'app_1',
    'usr_std_1',
    'job_2hr_infy',
    'Infosys Engineering Services',
    'Backend Systems & API Associate Engineer',
    100,
    'Python, SQL & Database Design, Node.js & Express, Git & GitHub',
    'None',
    'Shortlisted',
    new Date(now - 24 * 3600 * 1000).toISOString(),
    'Technical Round 1 scheduled for next Tuesday, 11:00 AM'
  );

  insertApp.run(
    'app_2',
    'usr_std_1',
    'job_1hr_tcs',
    'TCS Digital Talent Solutions',
    'Full-Stack Developer Intern (Cloud Native Platforms)',
    75,
    'Python, SQL & Database Design, Git & GitHub',
    'React.js',
    'Submitted',
    new Date(now - 2 * 3600 * 1000).toISOString(),
    'Application received and queued for recruitment squad review'
  );

  // 8. Seed FAQs verbatim from uploaded faq(1).html
  const faqs = [
    {
      id: 'faq_1',
      category: 'general',
      question: 'What is Kaushal Setu and who is it designed for?',
      answer: 'Kaushal Setu is a unified national digital bridge connecting higher educational institutions, students, and industry leaders to eliminate skill mismatches, enable verified internships, and drive seamless campus placement. Designed under national education priorities, it serves polytechnics, state universities, autonomous institutions, premier technological institutes, students nationwide, and verified industrial employers seeking validated talent.',
      icon: 'hub',
      keywords: 'what is kaushal setu purpose bridge academia industry mission',
      order: 1
    },
    {
      id: 'faq_2',
      category: 'general',
      question: 'Is Kaushal Setu free for government universities and students?',
      answer: 'Yes, foundational student profiling, diagnostic skill assessments, and institutional dashboards are offered with zero license costs in alignment with national education directives and AICTE guidelines. State universities and public institutions receive complimentary administrative onboarding and training for placement cell leads.',
      icon: 'account_balance',
      keywords: 'free cost fee universities colleges government public institutions aicte nep',
      order: 2
    },
    {
      id: 'faq_3',
      category: 'students',
      question: 'How does skill mapping evaluate my industry readiness?',
      answer: 'Through standardized diagnostic questionnaires, coding sandbox assessments, and project evaluations benchmarked directly against active corporate hiring criteria. Your skill readiness index is visualized via an interactive spider chart showing real-time gaps and direct personalized course modules to bridge those deficiencies.',
      icon: 'insights',
      keywords: 'skill mapping evaluate industry readiness diagnostic test assessment benchmark corporate',
      order: 3
    },
    {
      id: 'faq_4',
      category: 'students',
      question: 'Can I link my academic credits and APAAR ID with my digital portfolio?',
      answer: 'Yes, Kaushal Setu integrates securely with the National Academic Depository (NAD), DigiLocker, and APAAR (Automated Permanent Academic Account Registry). Once authenticated, your verified semester marks, course transcripts, and national skill credentials are embedded in a tamper-proof digital profile accessible to verified recruiters.',
      icon: 'badge',
      keywords: 'apaar id academic credits nad digilocker portfolio credential validation transfer',
      order: 4
    },
    {
      id: 'faq_5',
      category: 'students',
      question: 'How do I apply for verified industry internships?',
      answer: 'Once your profile reaches verified status (verified student email or institutional roll ID), you can browse authentic, stipend-backed openings posted directly by corporate leaders. Candidates can apply with a single click using their verified portfolio without repeatedly creating redundant resumes.',
      icon: 'work',
      keywords: 'apply internships corporate listings verified one-click placement jobs stipends',
      order: 5
    },
    {
      id: 'faq_6',
      category: 'institutions',
      question: 'How do college placement cells monitor student progress?',
      answer: 'Institutional administrators receive dedicated telemetry dashboards detailing batch-wise skill readiness, internship participation rates, and real-time employer engagement metrics. TPOs (Training & Placement Officers) can export compliance-ready accreditation reports aligned with NAAC and NBA criteria.',
      icon: 'monitoring',
      keywords: 'placement cell tpo monitoring analytics dashboard batch progress employers statistics',
      order: 6
    },
    {
      id: 'faq_7',
      category: 'institutions',
      question: 'Can universities syndicate Faculty Development Programs (FDPs)?',
      answer: 'Yes, academic department chairs can post collaborative FDP requirements and partner directly with industry technology specialists. Industry leaders provide curriculum advisory, lab instrumentation sponsorship, and real-world project scenarios directly into university classrooms.',
      icon: 'co_present',
      keywords: 'faculty development fdp programs syllabus curriculum engineering professors updates',
      order: 7
    },
    {
      id: 'faq_8',
      category: 'industry',
      question: 'How are candidates pre-evaluated before interview shortlisting?',
      answer: 'Employers specify exact benchmark requirements; our recommendation engine matches candidates with verified project competencies, national coding scores, and validated academic transcripts. This structured pre-evaluation cuts enterprise recruitment cycles by up to 60%.',
      icon: 'fact_check',
      keywords: 'pre-evaluated shortlisting candidates recruitment hiring filtering assessment 60 percent',
      order: 8
    },
    {
      id: 'faq_9',
      category: 'industry',
      question: 'What types of engagements can companies publish on the platform?',
      answer: 'Corporate entities can deploy live hackathons, structured capstone problem statements, micro-credentials, credit-bearing semester apprenticeships, and direct graduate placement openings across multiple technical disciplines.',
      icon: 'business_center',
      keywords: 'problem statements live projects internships apprenticeships post jobs engagement types',
      order: 9
    },
    {
      id: 'faq_10',
      category: 'security',
      question: 'How is candidate personal information and university data secured?',
      answer: 'All infrastructure adheres strictly to the Digital Personal Data Protection (DPDP) Act, ISO/IEC 27001 standard frameworks, and MeitY cloud hosting guidelines. Personal identifiable information (PII) is encrypted both in-transit and at rest using AES-256 encryption, and institutional databases remain strictly partitioned.',
      icon: 'lock',
      keywords: 'security privacy data protection iso 27001 encryption gdpr dpdp act cloud compliance',
      order: 10
    }
  ];

  const insertFaq = db.prepare(`
    INSERT OR IGNORE INTO common_faqs (id, category, question, answer, icon, keywords, display_order)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  for (const f of faqs) {
    insertFaq.run(f.id, f.category, f.question, f.answer, f.icon, f.keywords, f.order);
  }

  // 9. Seed Audit Logs
  const insertAudit = db.prepare(`
    INSERT OR IGNORE INTO common_audit_logs (id, user_id, user_email, role, action, details)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  insertAudit.run('aud_1', 'usr_admin_1', 'admin@kaushalsetu.gov.in', 'admin', 'SYSTEM_INITIALIZATION', 'Kaushal Setu National Gateway database successfully provisioned with AES-256 encryption & ISO 27001 compliance standards.');
  insertAudit.run('aud_2', 'usr_std_1', 'student@kaushalsetu.in', 'student', 'DIGILOCKER_SYNC', 'Authenticated via DigiLocker Gateway; retrieved Class X, XII and NAD transcripts.');
  insertAudit.run('aud_3', 'usr_ind_1', 'industry@kaushalsetu.in', 'industry', 'JOB_POSTED', 'Published Full-Stack Developer Internship with skill benchmark requirements.');

  console.log('Database initialization and seeding completed successfully.');
}
