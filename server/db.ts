import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import bcrypt from 'bcryptjs';

const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'kaushal_setu.db');
export const db = new DatabaseSync(DB_PATH);

// Enable Foreign Keys and WAL mode for performance and safety
db.exec(`PRAGMA foreign_keys = ON;`);

export function initDatabase() {
  db.exec(`
    -- 1. Users & Auth
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('student', 'institution', 'industry', 'admin')),
      full_name TEXT NOT NULL,
      phone TEXT,
      account_status TEXT NOT NULL DEFAULT 'active' CHECK(account_status IN ('active', 'pending_verification', 'suspended')),
      email_verified INTEGER NOT NULL DEFAULT 0,
      phone_verified INTEGER NOT NULL DEFAULT 0,
      avatar_url TEXT,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at DATETIME NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS otp_verifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      target TEXT NOT NULL, -- email or phone
      otp_code TEXT NOT NULL,
      type TEXT NOT NULL, -- 'signup', 'login_2fa', 'reset_password'
      expires_at DATETIME NOT NULL,
      attempts INTEGER NOT NULL DEFAULT 0,
      verified INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token TEXT UNIQUE NOT NULL,
      expires_at DATETIME NOT NULL,
      used INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    -- 2. Student Domain
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      apaar_id TEXT,
      roll_number TEXT,
      college_name TEXT NOT NULL,
      course_degree TEXT,
      department TEXT,
      graduation_year INTEGER,
      current_semester INTEGER DEFAULT 6,
      cgpa REAL DEFAULT 8.4,
      date_of_birth TEXT,
      address TEXT,
      city TEXT,
      state TEXT,
      digilocker_connected INTEGER NOT NULL DEFAULT 0,
      digilocker_consent_date DATETIME,
      academic_verification_status TEXT DEFAULT 'pending' CHECK(academic_verification_status IN ('pending', 'verified', 'rejected')),
      profile_completion_pct INTEGER DEFAULT 60,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS student_education (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      qualification_type TEXT NOT NULL, -- 'Class 10', 'Class 12', 'Bachelor of Technology', etc.
      institution_name TEXT NOT NULL,
      board_university TEXT,
      year_of_passing INTEGER NOT NULL,
      score_type TEXT DEFAULT 'CGPA',
      score_value TEXT NOT NULL,
      verified INTEGER NOT NULL DEFAULT 0,
      verification_source TEXT DEFAULT 'DigiLocker',
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS skills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      category TEXT NOT NULL, -- 'Programming', 'Web Development', 'Database', 'Tools', 'Cloud', 'Data Science'
      description TEXT
    );

    -- Rule: Student skills must NEVER be silently deleted. Maintain audit trail.
    CREATE TABLE IF NOT EXISTS student_skills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      skill_id INTEGER NOT NULL REFERENCES skills(id) ON DELETE RESTRICT,
      proficiency_pct INTEGER NOT NULL DEFAULT 50, -- 0 - 100
      source TEXT NOT NULL, -- 'self_reported', 'course_completion', 'digilocker_credential', 'github_analysis', 'assessment'
      verification_status TEXT NOT NULL DEFAULT 'unverified' CHECK(verification_status IN ('unverified', 'verified', 'in_review')),
      confidence_score REAL DEFAULT 0.75,
      is_active INTEGER NOT NULL DEFAULT 1,
      evidence_notes TEXT,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(student_id, skill_id)
    );

    CREATE TABLE IF NOT EXISTS student_skill_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      skill_id INTEGER NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
      old_score INTEGER,
      new_score INTEGER,
      change_reason TEXT,
      triggered_by TEXT,
      recorded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    -- GitHub Integration
    CREATE TABLE IF NOT EXISTS student_github (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER UNIQUE NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      github_username TEXT NOT NULL,
      profile_url TEXT,
      connected_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      last_sync_at DATETIME,
      public_repos_count INTEGER DEFAULT 0,
      total_contributions INTEGER DEFAULT 0,
      detected_languages TEXT, -- JSON string
      top_technologies TEXT, -- JSON string
      skill_analysis_json TEXT -- JSON string
    );

    -- Documents with 50 KB default validation rule
    CREATE TABLE IF NOT EXISTS student_documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      document_type TEXT NOT NULL, -- 'Identity Document', '10th Certificate', '12th Certificate', 'Degree Certificate', 'Resume', 'Internship Certificate'
      file_name TEXT NOT NULL,
      file_size_bytes INTEGER NOT NULL,
      file_mime_type TEXT NOT NULL,
      storage_path TEXT NOT NULL,
      verification_status TEXT NOT NULL DEFAULT 'pending' CHECK(verification_status IN ('pending', 'verified', 'failed')),
      verification_source TEXT DEFAULT 'Manual Upload', -- 'DigiLocker', 'AICTE Depository', 'Manual Upload'
      digilocker_uri TEXT,
      uploaded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    -- 3. Institution Domain
    CREATE TABLE IF NOT EXISTS institutions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      institution_name TEXT NOT NULL,
      aishe_code TEXT,
      type TEXT NOT NULL DEFAULT 'University', -- 'Central University', 'State University', 'Autonomous', 'NIT/IIT', 'Affiliated College'
      address TEXT,
      state TEXT,
      website TEXT,
      verification_status TEXT NOT NULL DEFAULT 'verified',
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS institution_departments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      institution_id INTEGER NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      code TEXT NOT NULL,
      head_of_department TEXT,
      total_students INTEGER DEFAULT 0
    );

    -- 4. Industry Domain
    CREATE TABLE IF NOT EXISTS industries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      company_name TEXT NOT NULL,
      industry_sector TEXT NOT NULL, -- 'Information Technology', 'Electronics & Semiconductor', 'Manufacturing', 'Finance/FinTech'
      cin_number TEXT,
      website TEXT,
      headquarters TEXT,
      description TEXT,
      verification_status TEXT NOT NULL DEFAULT 'verified',
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    -- 5. Courses & Learning
    CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      provider TEXT NOT NULL, -- 'Kaushal Setu Academy', 'AICTE SWAYAM', 'NPTEL', 'Industry Partner'
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      duration_weeks INTEGER DEFAULT 4,
      difficulty_level TEXT DEFAULT 'Intermediate',
      primary_skill_id INTEGER REFERENCES skills(id),
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS course_lectures (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      lecture_order INTEGER NOT NULL,
      duration_minutes INTEGER DEFAULT 25,
      resource_url TEXT NOT NULL,
      resource_type TEXT DEFAULT 'external_video' -- 'video', 'documentation', 'interactive_sandbox'
    );

    CREATE TABLE IF NOT EXISTS student_courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,
      progress_pct INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'in_progress' CHECK(status IN ('not_started', 'in_progress', 'completed')),
      enrolled_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME,
      UNIQUE(student_id, course_id)
    );

    -- 6. Jobs & Internships
    CREATE TABLE IF NOT EXISTS jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      industry_id INTEGER NOT NULL REFERENCES industries(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      job_type TEXT NOT NULL CHECK(job_type IN ('internship', 'full_time', 'apprenticeship', 'capstone_project')),
      location TEXT NOT NULL,
      work_mode TEXT NOT NULL DEFAULT 'hybrid' CHECK(work_mode IN ('on_site', 'remote', 'hybrid')),
      stipend_salary TEXT NOT NULL,
      experience_level TEXT DEFAULT 'Fresher / Student',
      description TEXT NOT NULL,
      application_deadline TEXT,
      status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'closed', 'draft')),
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS job_skills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
      skill_id INTEGER NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
      is_mandatory INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
      student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      status TEXT NOT NULL DEFAULT 'Submitted' CHECK(status IN ('Submitted', 'Under Review', 'Shortlisted', 'Interview', 'Selected', 'Rejected', 'Withdrawn')),
      match_score INTEGER NOT NULL DEFAULT 0,
      applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      notes TEXT,
      UNIQUE(job_id, student_id)
    );

    -- 7. Help Desk & Support Tickets
    CREATE TABLE IF NOT EXISTS support_tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticket_code TEXT UNIQUE NOT NULL, -- e.g. HD-2026-001245
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      user_role TEXT NOT NULL,
      category TEXT NOT NULL,
      subject TEXT NOT NULL,
      description TEXT NOT NULL,
      attachment_path TEXT,
      priority TEXT DEFAULT 'Normal' CHECK(priority IN ('Low', 'Normal', 'High', 'Urgent')),
      status TEXT NOT NULL DEFAULT 'Open' CHECK(status IN ('Open', 'In Progress', 'Waiting for Student', 'Resolved', 'Closed')),
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS support_ticket_replies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticket_id INTEGER NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
      sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      sender_role TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    -- 8. FAQs & System Config
    CREATE TABLE IF NOT EXISTS faqs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL, -- 'general', 'students', 'institutions', 'industry', 'security'
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      keywords TEXT,
      sort_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS system_config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT,
      details TEXT,
      ip_address TEXT,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed default configuration
  const insertConfig = db.prepare(`
    INSERT OR IGNORE INTO system_config (key, value, description)
    VALUES (?, ?, ?)
  `);
  insertConfig.run('MAX_FILE_UPLOAD_KB', '50', 'Maximum permitted document upload size in KB');
  insertConfig.run('DIGILOCKER_MODE', 'DEMO', 'DigiLocker integration mode (DEMO or PRODUCTION)');
  insertConfig.run('ENABLE_2FA', 'true', 'Enable OTP verification on signup/critical actions');

  seedInitialData();
}

function seedInitialData() {
  // Check if admin already exists
  const existingUser = db.prepare(`SELECT id FROM users WHERE email = ?`).get('admin@kaushalsetu.gov.in');
  if (existingUser) return;

  const defaultPasswordHash = bcrypt.hashSync('Admin@12345', 10);
  const studentPasswordHash = bcrypt.hashSync('Student@12345', 10);
  const instPasswordHash = bcrypt.hashSync('Inst@12345', 10);
  const industryPasswordHash = bcrypt.hashSync('Industry@12345', 10);

  // 1. Insert Users
  const insertUser = db.prepare(`
    INSERT INTO users (email, password_hash, role, full_name, phone, account_status, email_verified, phone_verified)
    VALUES (?, ?, ?, ?, ?, 'active', 1, 1)
  `);

  const adminUserRes = insertUser.run('admin@kaushalsetu.gov.in', defaultPasswordHash, 'admin', 'National Platform Admin', '+91 11-2090-7388');
  const studentUserRes = insertUser.run('aarav.sharma@institution.ac.in', studentPasswordHash, 'student', 'Aarav Sharma', '+91 98765 43210');
  const instUserRes = insertUser.run('placement@iitd.ac.in', instPasswordHash, 'institution', 'Prof. Sunita Deshmukh (IIT Delhi)', '+91 11-2659-1000');
  const indUserRes = insertUser.run('careers@tatainnovations.in', industryPasswordHash, 'industry', 'Vikramaditya Sengupta (Tata Innovations)', '+91 22-6665-8282');

  const studentUserId = Number(studentUserRes.lastInsertRowid);
  const instUserId = Number(instUserRes.lastInsertRowid);
  const indUserId = Number(indUserRes.lastInsertRowid);

  // 2. Insert Student record
  const insertStudent = db.prepare(`
    INSERT INTO students (
      user_id, apaar_id, roll_number, college_name, course_degree, department,
      graduation_year, current_semester, cgpa, date_of_birth, address, city, state,
      digilocker_connected, academic_verification_status, profile_completion_pct
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const studentRes = insertStudent.run(
    studentUserId,
    'APAAR-2024-987214',
    '2022CSB1042',
    'Indian Institute of Technology Delhi',
    'Bachelor of Technology',
    'Computer Science & Engineering',
    2026,
    6,
    8.85,
    '2004-05-14',
    'Hostel Nilgiri, IIT Campus, Hauz Khas',
    'New Delhi',
    'Delhi NCR',
    1,
    'verified',
    88
  );
  const studentId = Number(studentRes.lastInsertRowid);

  // 3. Insert Student Education
  const insertEdu = db.prepare(`
    INSERT INTO student_education (student_id, qualification_type, institution_name, board_university, year_of_passing, score_type, score_value, verified, verification_source)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertEdu.run(studentId, 'Class 10 (Secondary)', 'Delhi Public School, R.K. Puram', 'CBSE', 2020, 'Percentage', '96.4%', 1, 'DigiLocker');
  insertEdu.run(studentId, 'Class 12 (Higher Secondary)', 'Delhi Public School, R.K. Puram', 'CBSE', 2022, 'Percentage', '95.8%', 1, 'DigiLocker');
  insertEdu.run(studentId, 'B.Tech in Computer Science', 'Indian Institute of Technology Delhi', 'Autonomous / Institute of National Importance', 2026, 'CGPA', '8.85 / 10.0', 1, 'National Academic Depository (NAD)');

  // 4. Insert Skills Catalog
  const skillList = [
    ['Python', 'Programming', 'Core language for scripting, data pipelines, and algorithms.'],
    ['SQL', 'Database', 'Relational database querying, optimization, and table schemas.'],
    ['React', 'Web Development', 'Modern UI component architecture, state management, and hooks.'],
    ['Git / GitHub', 'Tools', 'Version control, branch management, pull requests, and CI/CD.'],
    ['Node.js', 'Web Development', 'Server-side JavaScript runtime and RESTful APIs.'],
    ['TypeScript', 'Programming', 'Typed superset of JavaScript for scalable applications.'],
    ['Machine Learning', 'Data Science', 'Supervised and unsupervised learning, scikit-learn models.'],
    ['Docker', 'Cloud', 'Containerization of full-stack services.'],
    ['Data Structures & Algorithms', 'Programming', 'Foundational computational efficiency and problem solving.'],
    ['MongoDB', 'Database', 'Document-based NoSQL storage and aggregation.'],
    ['Cyber Security', 'Tools', 'Network security, authentication hardening, and OWASP.'],
    ['Flutter', 'Mobile', 'Cross-platform native mobile application engineering.']
  ];

  const insertSkill = db.prepare(`INSERT OR IGNORE INTO skills (name, category, description) VALUES (?, ?, ?)`);
  for (const s of skillList) {
    insertSkill.run(s[0], s[1], s[2]);
  }

  // Map IDs
  const allSkills = db.prepare(`SELECT id, name FROM skills`).all() as { id: number; name: string }[];
  const skillMap = new Map<string, number>();
  allSkills.forEach(s => skillMap.set(s.name, s.id));

  // 5. Insert Student Verified Skills
  const insertStudentSkill = db.prepare(`
    INSERT INTO student_skills (student_id, skill_id, proficiency_pct, source, verification_status, confidence_score, evidence_notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  if (skillMap.has('Python')) insertStudentSkill.run(studentId, skillMap.get('Python'), 90, 'github_analysis', 'verified', 0.92, 'Verified across 14 public repos with high commit density.');
  if (skillMap.has('SQL')) insertStudentSkill.run(studentId, skillMap.get('SQL'), 72, 'course_completion', 'verified', 0.85, 'Certified by NPTEL Database Systems (Grade A).');
  if (skillMap.has('Git / GitHub')) insertStudentSkill.run(studentId, skillMap.get('Git / GitHub'), 91, 'github_analysis', 'verified', 0.95, 'High consistency score across 220+ contribution commits.');
  if (skillMap.has('Data Structures & Algorithms')) insertStudentSkill.run(studentId, skillMap.get('Data Structures & Algorithms'), 86, 'assessment', 'verified', 0.88, 'National diagnostic benchmark 94th percentile.');
  if (skillMap.has('TypeScript')) insertStudentSkill.run(studentId, skillMap.get('TypeScript'), 78, 'self_reported', 'unverified', 0.70, 'Building capstone portals in React and TypeScript.');

  // 6. Insert Student GitHub Integration
  const insertGithub = db.prepare(`
    INSERT INTO student_github (
      student_id, github_username, profile_url, last_sync_at,
      public_repos_count, total_contributions, detected_languages,
      top_technologies, skill_analysis_json
    ) VALUES (?, ?, ?, CURRENT_TIMESTAMP, ?, ?, ?, ?, ?)
  `);
  insertGithub.run(
    studentId,
    'aaravsharma-dev',
    'https://github.com/aaravsharma-dev',
    18,
    342,
    JSON.stringify({ Python: 45, TypeScript: 25, JavaScript: 15, SQL: 10, Shell: 5 }),
    JSON.stringify(['Python', 'Git', 'TypeScript', 'FastAPI', 'PostgreSQL', 'Docker']),
    JSON.stringify({
      overall_score: 85,
      factors: {
        technology_usage: 90,
        project_relevance: 85,
        project_complexity: 82,
        recent_activity: 88,
        documentation: 80,
        open_source: 75
      },
      summary: 'Demonstrated consistent development velocity in Python and web development. Multiple documented capstone repos.'
    })
  );

  // 7. Insert Student Documents (Under 50 KB Limit)
  const insertDoc = db.prepare(`
    INSERT INTO student_documents (student_id, document_type, file_name, file_size_bytes, file_mime_type, storage_path, verification_status, verification_source)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertDoc.run(studentId, '10th Certificate', 'CBSE_Class10_Marksheet_Aarav.pdf', 38400, 'application/pdf', '/uploads/docs/10th_cert_sample.pdf', 'verified', 'DigiLocker');
  insertDoc.run(studentId, '12th Certificate', 'CBSE_Class12_Marksheet_Aarav.pdf', 41200, 'application/pdf', '/uploads/docs/12th_cert_sample.pdf', 'verified', 'DigiLocker');
  insertDoc.run(studentId, 'Degree Marksheet', 'IITD_Sem5_Transcript.pdf', 46500, 'application/pdf', '/uploads/docs/sem5_transcript.pdf', 'verified', 'National Academic Depository (NAD)');
  insertDoc.run(studentId, 'Resume', 'Aarav_Sharma_Engineering_CV.pdf', 48900, 'application/pdf', '/uploads/docs/aarav_resume.pdf', 'pending', 'Manual Upload');

  // 8. Insert Institution details
  const insertInst = db.prepare(`
    INSERT INTO institutions (user_id, institution_name, aishe_code, type, address, state, website)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const instRes = insertInst.run(instUserId, 'Indian Institute of Technology Delhi', 'U-0092', 'NIT/IIT', 'Hauz Khas, New Delhi 110016', 'Delhi', 'https://home.iitd.ac.in');
  const instId = Number(instRes.lastInsertRowid);

  const insertDept = db.prepare(`INSERT INTO institution_departments (institution_id, name, code, head_of_department, total_students) VALUES (?, ?, ?, ?, ?)`);
  insertDept.run(instId, 'Computer Science & Engineering', 'CSE', 'Dr. Rajiv Tripathi', 420);
  insertDept.run(instId, 'Electrical Engineering', 'EE', 'Dr. Meenakshi Sundaram', 380);
  insertDept.run(instId, 'Mechanical Engineering', 'ME', 'Dr. Harish Chandra', 350);

  // 9. Insert Industry details
  const insertInd = db.prepare(`
    INSERT INTO industries (user_id, company_name, industry_sector, cin_number, website, headquarters, description)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const indRes = insertInd.run(
    indUserId,
    'Tata Consultancy Innovations',
    'Information Technology',
    'U72200MH1995PLC095000',
    'https://www.tatainnovations.com',
    'Mumbai, Maharashtra',
    'Leading enterprise technology partner building AI-native cloud platforms and IoT systems.'
  );
  const indId = Number(indRes.lastInsertRowid);

  // 10. Insert Courses with lectures
  const insertCourse = db.prepare(`
    INSERT INTO courses (title, provider, category, description, duration_weeks, difficulty_level, primary_skill_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const c1 = insertCourse.run('React 19 & Modern Web Fundamentals', 'Kaushal Setu Academy', 'Web Development', 'Comprehensive deep dive into React architecture, hooks, state machines, and component design patterns.', 4, 'Intermediate', skillMap.get('React'));
  const c2 = insertCourse.run('Full-Stack Node.js & API Engineering', 'Industry Partner (TCS)', 'Web Development', 'Production Express.js, TypeScript server engineering, database connection pooling, and security.', 6, 'Intermediate', skillMap.get('Node.js'));
  const c3 = insertCourse.run('Modern Database Systems & SQL Mastery', 'AICTE SWAYAM', 'Database', 'Query optimization, indexing strategies, normalization, and ACID transaction guarantees.', 4, 'Beginner to Intermediate', skillMap.get('SQL'));

  const course1Id = Number(c1.lastInsertRowid);
  const course2Id = Number(c2.lastInsertRowid);

  const insertLecture = db.prepare(`INSERT INTO course_lectures (course_id, title, lecture_order, duration_minutes, resource_url) VALUES (?, ?, ?, ?, ?)`);
  insertLecture.run(course1Id, '1. Introduction to Modern Component Trees', 1, 20, 'https://react.dev/learn');
  insertLecture.run(course1Id, '2. Mastering Hooks & Lifecycle in React 19', 2, 35, 'https://react.dev/reference/react');
  insertLecture.run(course1Id, '3. State Management & Asynchronous Data Fetching', 3, 40, 'https://react.dev/learn/managing-state');
  insertLecture.run(course1Id, '4. Building a Full Capstone Project', 4, 60, 'https://github.com/facebook/react');

  insertLecture.run(course2Id, '1. Express Architecture & Middleware Chains', 1, 25, 'https://expressjs.com/en/guide/routing.html');
  insertLecture.run(course2Id, '2. Relational Schema Design & Transactions', 2, 35, 'https://nodejs.org/en/docs');

  // Student Enrollment
  const enroll = db.prepare(`INSERT INTO student_courses (student_id, course_id, progress_pct, status) VALUES (?, ?, ?, ?)`);
  enroll.run(studentId, course1Id, 65, 'in_progress');

  // 11. Insert Jobs with REAL Past Timestamps to test 1-hour, 2-hour, 3-hour filters!
  // Note: SQLite CURRENT_TIMESTAMP or datetime offsets
  const insertJob = db.prepare(`
    INSERT INTO jobs (industry_id, title, job_type, location, work_mode, stipend_salary, experience_level, description, application_deadline, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', ?))
  `);

  // Job 1: Posted 35 minutes ago (< 1 hour)
  const j1 = insertJob.run(
    indId,
    'Full-Stack Cloud Software Engineer Intern',
    'internship',
    'Bengaluru, Karnataka',
    'hybrid',
    '₹35,000 / month',
    'College Student (3rd/4th Year)',
    'Work alongside senior system architects building telemetry bridges and microservices in Python, SQL, and React.',
    '2026-10-15',
    '-35 minutes'
  );

  // Job 2: Posted 85 minutes ago (between 1 and 2 hours)
  const j2 = insertJob.run(
    indId,
    'Data Platform & Analytics Apprenticeship',
    'apprenticeship',
    'Hyderabad, Telangana',
    'on_site',
    '₹40,000 / month',
    'Graduating Batch 2025/2026',
    'Analyze high-volume educational telemetry, build SQL optimization pipelines, and develop automated anomaly detection.',
    '2026-10-30',
    '-85 minutes'
  );

  // Job 3: Posted 160 minutes ago (between 2 and 3 hours)
  const j3 = insertJob.run(
    indId,
    'Junior Backend Systems Developer',
    'full_time',
    'Gurugram / Delhi NCR',
    'hybrid',
    '₹9.5 - 12.0 LPA',
    'Fresher / 0-1 Years',
    'Build high-performance REST APIs in Node.js, Python, and PostgreSQL with robust security headers and RBAC.',
    '2026-11-15',
    '-160 minutes'
  );

  // Job 4: Posted 14 hours ago (< 24 hours)
  const j4 = insertJob.run(
    indId,
    'Machine Learning Engineering Apprentice',
    'apprenticeship',
    'Pune, Maharashtra',
    'remote',
    '₹30,000 / month',
    'Student / Researcher',
    'Implement neural recommendation engines and skill ontology mapping algorithms aligned with Skill India taxonomies.',
    '2026-11-01',
    '-14 hours'
  );

  // Job 5: Posted 3 days ago (< 7 days)
  const j5 = insertJob.run(
    indId,
    'Cyber Security & Infrastructure Analyst',
    'full_time',
    'Mumbai, Maharashtra',
    'on_site',
    '₹8.0 - 10.5 LPA',
    'Fresher / 0-1 Years',
    'Perform penetration testing, ISO 27001 compliance audit, and API authentication review.',
    '2026-10-20',
    '-3 days'
  );

  const j1Id = Number(j1.lastInsertRowid);
  const j2Id = Number(j2.lastInsertRowid);
  const j3Id = Number(j3.lastInsertRowid);
  const j4Id = Number(j4.lastInsertRowid);
  const j5Id = Number(j5.lastInsertRowid);

  // Required skills for jobs
  const insertJobSkill = db.prepare(`INSERT INTO job_skills (job_id, skill_id, is_mandatory) VALUES (?, ?, ?)`);
  // Job 1 requires: Python, SQL, React, Git
  if (skillMap.has('Python')) insertJobSkill.run(j1Id, skillMap.get('Python'), 1);
  if (skillMap.has('SQL')) insertJobSkill.run(j1Id, skillMap.get('SQL'), 1);
  if (skillMap.has('React')) insertJobSkill.run(j1Id, skillMap.get('React'), 1);
  if (skillMap.has('Git / GitHub')) insertJobSkill.run(j1Id, skillMap.get('Git / GitHub'), 1);

  // Job 2 requires: Python, SQL
  if (skillMap.has('Python')) insertJobSkill.run(j2Id, skillMap.get('Python'), 1);
  if (skillMap.has('SQL')) insertJobSkill.run(j2Id, skillMap.get('SQL'), 1);

  // Job 3 requires: Python, Node.js, SQL
  if (skillMap.has('Python')) insertJobSkill.run(j3Id, skillMap.get('Python'), 1);
  if (skillMap.has('Node.js')) insertJobSkill.run(j3Id, skillMap.get('Node.js'), 1);
  if (skillMap.has('SQL')) insertJobSkill.run(j3Id, skillMap.get('SQL'), 1);

  // Job 4 requires: Python, Machine Learning
  if (skillMap.has('Python')) insertJobSkill.run(j4Id, skillMap.get('Python'), 1);
  if (skillMap.has('Machine Learning')) insertJobSkill.run(j4Id, skillMap.get('Machine Learning'), 1);

  // Job 5 requires: Cyber Security, Git / GitHub
  if (skillMap.has('Cyber Security')) insertJobSkill.run(j5Id, skillMap.get('Cyber Security'), 1);
  if (skillMap.has('Git / GitHub')) insertJobSkill.run(j5Id, skillMap.get('Git / GitHub'), 1);

  // 12. Student Application
  const insertApp = db.prepare(`
    INSERT INTO applications (job_id, student_id, status, match_score, notes)
    VALUES (?, ?, ?, ?, ?)
  `);
  insertApp.run(j2Id, studentId, 'Shortlisted', 100, 'Candidate meets 100% of required skills with verified DigiLocker credentials.');

  // 13. Seed FAQs (Matching the 5 exact categories from faq(1).html)
  const insertFaq = db.prepare(`INSERT INTO faqs (category, question, answer, keywords, sort_order) VALUES (?, ?, ?, ?, ?)`);
  insertFaq.run(
    'general',
    'What is Kaushal Setu and who is it designed for?',
    'Kaushal Setu is a unified national digital bridge connecting higher educational institutions, students, and industry leaders to eliminate skill mismatches, enable verified internships, and drive seamless campus placement. Designed under national education priorities, it serves polytechnics, state universities, autonomous institutions, premier technological institutes, students nationwide, and verified industrial employers seeking validated talent.',
    'what is kaushal setu purpose bridge academia industry mission',
    1
  );
  insertFaq.run(
    'general',
    'Is Kaushal Setu free for government universities and students?',
    'Yes, foundational student profiling, diagnostic skill assessments, and institutional dashboards are offered with zero license costs in alignment with national education directives and AICTE guidelines. State universities and public institutions receive complimentary administrative onboarding and training for placement cell leads.',
    'free cost fee universities colleges government public institutions aicte nep',
    2
  );
  insertFaq.run(
    'students',
    'How does skill mapping evaluate my industry readiness?',
    'Through standardized diagnostic questionnaires, coding sandbox assessments, and project evaluations benchmarked directly against active corporate hiring criteria. Your skill readiness index is visualized via an interactive spider chart showing real-time gaps and direct personalized course modules to bridge those deficiencies.',
    'skill mapping evaluate industry readiness diagnostic test assessment benchmark corporate',
    3
  );
  insertFaq.run(
    'students',
    'Can I link my academic credits and APAAR ID with my digital portfolio?',
    'Yes, Kaushal Setu integrates securely with the National Academic Depository (NAD), DigiLocker, and APAAR (Automated Permanent Academic Account Registry). Once authenticated, your verified semester marks, course transcripts, and national skill credentials are embedded in a tamper-proof digital profile accessible to verified recruiters.',
    'apaar id academic credits nad digilocker portfolio credential validation transfer',
    4
  );
  insertFaq.run(
    'students',
    'How do I apply for verified industry internships?',
    'Once your profile reaches verified status (verified student email or institutional roll ID), you can browse authentic, stipend-backed openings posted directly by corporate leaders. Candidates can apply with a single click using their verified portfolio without repeatedly creating redundant resumes.',
    'apply internships corporate listings verified one-click placement jobs stipends',
    5
  );
  insertFaq.run(
    'institutions',
    'How do college placement cells monitor student progress?',
    'Institutional administrators receive dedicated telemetry dashboards detailing batch-wise skill readiness, internship participation rates, and real-time employer engagement metrics. TPOs (Training & Placement Officers) can export compliance-ready accreditation reports aligned with NAAC and NBA criteria.',
    'placement cell tpo monitoring analytics dashboard batch progress employers statistics',
    6
  );
  insertFaq.run(
    'institutions',
    'Can universities syndicate Faculty Development Programs (FDPs)?',
    'Yes, academic department chairs can post collaborative FDP requirements and partner directly with industry technology specialists. Industry leaders provide curriculum advisory, lab instrumentation sponsorship, and real-world project scenarios directly into university classrooms.',
    'faculty development fdp programs syllabus curriculum engineering professors updates',
    7
  );
  insertFaq.run(
    'industry',
    'How are candidates pre-evaluated before interview shortlisting?',
    'Employers specify exact benchmark requirements; our recommendation engine matches candidates with verified project competencies, national coding scores, and validated academic transcripts. This structured pre-evaluation cuts enterprise recruitment cycles by up to 60%.',
    'pre-evaluated shortlisting candidates recruitment hiring filtering assessment 60 percent',
    8
  );
  insertFaq.run(
    'industry',
    'What types of engagements can companies publish on the platform?',
    'Corporate entities can deploy live hackathons, structured capstone problem statements, micro-credentials, credit-bearing semester apprenticeships, and direct graduate placement openings across multiple technical disciplines.',
    'problem statements live projects internships apprenticeships post jobs engagement types',
    9
  );
  insertFaq.run(
    'security',
    'How is candidate personal information and university data secured?',
    'All infrastructure adheres strictly to the Digital Personal Data Protection (DPDP) Act, ISO/IEC 27001 standard frameworks, and MeitY cloud hosting guidelines. Personal identifiable information (PII) is encrypted both in-transit and at rest using AES-256 encryption, and institutional databases remain strictly partitioned.',
    'security privacy data protection iso 27001 encryption gdpr dpdp act cloud compliance',
    10
  );

  // 14. Seed Support Tickets
  const insertTicket = db.prepare(`
    INSERT INTO support_tickets (ticket_code, user_id, user_role, category, subject, description, priority, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const t1 = insertTicket.run(
    'HD-2026-001245',
    studentUserId,
    'student',
    'GitHub Connection',
    'Repository synchronization token validation',
    'I pushed two new repositories yesterday under Python and React. The GitHub sync successfully reflected the commit count, but I would like to know how the skill confidence score was weighted.',
    'Normal',
    'In Progress'
  );
  const ticket1Id = Number(t1.lastInsertRowid);

  const insertReply = db.prepare(`
    INSERT INTO support_ticket_replies (ticket_id, sender_id, sender_role, message)
    VALUES (?, ?, ?, ?)
  `);
  insertReply.run(
    ticket1Id,
    adminUserRes.lastInsertRowid,
    'admin',
    'Greetings Aarav. Our candidate evaluation algorithm analyzes technology usage density, commit recency, and project complexity rather than raw line count. Your score reflects 90% Python usage and 82% project complexity.'
  );

  // 15. Audit Log
  const insertAudit = db.prepare(`
    INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
    VALUES (?, ?, ?, ?, ?)
  `);
  insertAudit.run(Number(adminUserRes.lastInsertRowid), 'SYSTEM_INITIALIZATION', 'DATABASE', 'ALL', 'Database initialized with national catalog schemas and verified institutional seeds.');
}
