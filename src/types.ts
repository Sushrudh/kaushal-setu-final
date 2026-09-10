export type UserRole = 'student' | 'institution' | 'industry' | 'admin';

export interface User {
  id: number;
  email: string;
  role: UserRole;
  fullName: string;
  phone?: string;
  account_status?: string;
  avatar_url?: string;
  studentId?: number;
  institutionId?: number;
  industryId?: number;
}

export interface StudentProfile {
  id: number;
  user_id: number;
  full_name: string;
  email: string;
  phone?: string;
  apaar_id?: string;
  roll_number?: string;
  college_name: string;
  course_degree?: string;
  department?: string;
  graduation_year?: number;
  current_semester?: number;
  cgpa?: number;
  date_of_birth?: string;
  address?: string;
  city?: string;
  state?: string;
  digilocker_connected: number;
  academic_verification_status: 'pending' | 'verified' | 'rejected';
  profile_completion_pct: number;
}

export interface EducationItem {
  id: number;
  student_id: number;
  qualification_type: string;
  institution_name: string;
  board_university?: string;
  year_of_passing: number;
  score_type: string;
  score_value: string;
  verified: number;
  verification_source?: string;
}

export interface SkillItem {
  id: number;
  skill_id?: number;
  name: string;
  category: string;
  proficiency_pct: number;
  source: 'self_reported' | 'course_completion' | 'digilocker_credential' | 'github_analysis' | 'assessment';
  verification_status: 'unverified' | 'verified' | 'in_review';
  confidence_score?: number;
  evidence_notes?: string;
}

export interface DocumentItem {
  id: number;
  student_id: number;
  document_type: string;
  file_name: string;
  file_size_bytes: number;
  file_mime_type: string;
  storage_path: string;
  verification_status: 'pending' | 'verified' | 'failed';
  verification_source: string;
  digilocker_uri?: string;
  uploaded_at: string;
}

export interface GitHubInfo {
  github_username: string;
  profile_url?: string;
  last_sync_at?: string;
  public_repos_count: number;
  total_contributions: number;
  detectedLanguages: Record<string, number>;
  topTechnologies: string[];
  analysis?: {
    overall_score: number;
    factors: {
      technology_usage: number;
      project_relevance: number;
      project_complexity: number;
      recent_activity: number;
      documentation: number;
      open_source: number;
    };
    why_this_score?: string[];
    summary: string;
  };
}

export interface JobItem {
  id: number;
  industry_id: number;
  company_name: string;
  industry_sector?: string;
  headquarters?: string;
  title: string;
  job_type: 'internship' | 'full_time' | 'apprenticeship' | 'capstone_project';
  location: string;
  work_mode: 'on_site' | 'remote' | 'hybrid';
  stipend_salary: string;
  experience_level?: string;
  description: string;
  application_deadline?: string;
  created_at: string;
  requiredSkills: { id: number; name: string; category?: string }[];
  matchScore?: number;
  applicantCount?: number;
}

export interface CourseItem {
  id: number;
  title: string;
  provider: string;
  category: string;
  description: string;
  duration_weeks: number;
  difficulty_level: string;
  primary_skill_name?: string;
  progress_pct?: number;
  status?: 'not_started' | 'in_progress' | 'completed';
  lectures?: {
    id: number;
    title: string;
    lecture_order: number;
    duration_minutes: number;
    resource_url: string;
  }[];
}

export interface ApplicationItem {
  id: number;
  job_id: number;
  job_title: string;
  company_name: string;
  location: string;
  stipend_salary: string;
  job_type: string;
  status: 'Submitted' | 'Under Review' | 'Shortlisted' | 'Interview' | 'Selected' | 'Rejected' | 'Withdrawn';
  match_score: number;
  applied_at: string;
  notes?: string;
}

export type Job = any;
export type Course = any;
export type Application = any;


export interface SupportTicket {
  id: number;
  ticket_code: string;
  user_id: number;
  user_role: string;
  submitter_name?: string;
  submitter_email?: string;
  category: string;
  subject: string;
  description: string;
  priority: 'Low' | 'Normal' | 'High' | 'Urgent';
  status: 'Open' | 'In Progress' | 'Waiting for Student' | 'Resolved' | 'Closed';
  created_at: string;
  updated_at: string;
  replies?: {
    id: number;
    sender_name: string;
    sender_role: string;
    message: string;
    created_at: string;
  }[];
}

export interface FaqItem {
  id: number;
  category: string;
  question: string;
  answer: string;
  keywords?: string;
  sort_order: number;
}
