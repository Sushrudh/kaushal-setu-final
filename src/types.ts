export type UserRole = 'student' | 'institution' | 'industry' | 'admin';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
  phone?: string;
  organization?: string;
  identifier?: string;
  avatarUrl?: string;
  isVerified: boolean;
  createdAt?: string;
}

export interface StudentProfile {
  user_id?: string;
  name?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  bio?: string;
  apaar_id?: string;
  apaarId?: string;
  roll_number?: string;
  rollNumber?: string;
  institution_name?: string;
  college?: string;
  degree_program?: string;
  degreeProgram?: string;
  graduation_year?: number;
  graduationYear?: number;
  current_cgpa?: number;
  currentCgpa?: number;
  state?: string;
  digilocker_status?: 'unlinked' | 'pending' | 'verified';
  digilockerVerified?: boolean;
  digilocker_id?: string;
  academic_qualification_verified?: string;
  academic_verification_status?: 'pending' | 'verified' | 'rejected';
  profile_completion_pct?: number;
  is_profile_public?: boolean;
  isProfilePublic?: boolean;
  skills?: string[];
  skillsDetailed?: StudentSkill[];
  readinessScore?: number;
  projects?: StudentProject[];
  rapidFire?: RapidFireAssessment | null;
  github?: GitHubStats | null;
  leetcode?: LeetCodeStats | null;
  resume?: ResumeMetadata | null;
}

export interface GitHubStats {
  username: string;
  avatarUrl?: string;
  publicRepos: number;
  followers: number;
  languages: Record<string, number>;
  stars: number;
  forks: number;
  recentActivity?: string[];
  connectedAt?: string;
}

export interface LeetCodeStats {
  username: string;
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  ranking: number;
  contestRating: number;
  categoryDistribution?: Record<string, number>;
  connectedAt?: string;
}

export interface ResumeMetadata {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  downloadUrl: string;
}

export interface FacultyNomination {
  id: string;
  institution_user_id?: string;
  faculty_name: string;
  department: string;
  designation: string;
  email: string;
  phone?: string;
  specialization?: string;
  program_title: string;
  nomination_type: string;
  status: 'Nominated' | 'Under Review' | 'Approved' | 'Active' | 'Withdrawn';
  remarks?: string;
  created_at: string;
}

export interface InterviewEvent {
  id: string;
  application_id: string;
  company_name: string;
  position: string;
  interview_date: string;
  interview_mode: 'Virtual' | 'On-site' | 'Campus';
  instructions?: string;
  status: 'Scheduled' | 'Completed' | 'Rescheduled' | 'Cancelled';
  created_at: string;
}

export interface StudentProject {
  id: string;
  user_id?: string;
  title: string;
  description: string;
  technologies: string;
  skills_demonstrated?: string;
  category: string;
  github_url?: string;
  live_url?: string;
  image_url?: string;
  project_type: 'Individual' | 'Team';
  duration?: string;
  status: 'In Progress' | 'Completed' | 'Maintained';
  created_at?: string;
  updated_at?: string;
}

export interface RapidFireAssessment {
  id?: string;
  user_id?: string;
  worked_skills: string[];
  learn_skills: string[];
  has_real_world_projects: 'Yes' | 'No';
  has_hackathons: 'Yes' | 'No';
  primary_interest: string;
  completed_at?: string;
}

export interface InstitutionProfile {
  id?: string;
  name: string;
  aisheCode?: string;
  aishe_code?: string;
  type?: string;
  state?: string;
  curriculumIndex?: number;
}

export interface IndustryProfile {
  id?: string;
  name: string;
  cin?: string;
  sector?: string;
  verified?: boolean;
}

export interface StudentSkill {
  id: string;
  skill_name: string;
  proficiency_level: number;
  source: 'digilocker' | 'course' | 'assessment' | 'institutional' | 'manual';
  verification_status: 'unverified' | 'verified' | 'certified';
  confidence: number;
  created_at?: string;
  updated_at?: string;
}

export interface SkillHistory {
  id: string;
  skill_name: string;
  action: string;
  source: string;
  notes?: string;
  created_at: string;
}

export interface JobOpportunity {
  id: string;
  industry_user_id?: string;
  company_name?: string;
  company?: string;
  title: string;
  job_type?: 'Internship' | 'Full-time Job' | 'Apprenticeship' | 'Live Project';
  type?: any;
  experience?: string;
  location: string;
  workplace_type?: 'Remote' | 'Hybrid' | 'On-site';
  stipend_salary?: string;
  stipend?: string;
  description: string;
  required_skills?: string;
  skillsRequired?: string[];
  preferred_skills?: string;
  openings?: number;
  deadline?: string;
  created_at?: string;
  is_active?: number;
  matchScore?: number;
  matchedSkills?: string[];
  missingSkills?: string[];
}

export type Job = JobOpportunity;

export interface Course {
  id: string;
  title: string;
  provider: string;
  description: string;
  category?: string;
  skills_covered?: string;
  credits?: number;
  target_skill_id?: string;
  target_skill_name: string;
  duration_hours: number;
  duration?: string;
  total_lessons: number;
  difficulty: string;
  thumbnail_url?: string;
  rating: number;
  enrolled_count: number;
  progress_pct?: number;
  lessons_completed?: number;
  is_enrolled?: boolean;
  status?: 'not_enrolled' | 'enrolled' | 'in_progress' | 'completed';
  lectures?: CourseLecture[];
  course_url?: string;
  courseUrl?: string;
}

export interface CourseLecture {
  id: string;
  course_id: string;
  lesson_number: number;
  title: string;
  resource_url: string;
  duration_mins: number;
  is_free_preview: number;
}

export interface Application {
  id: string;
  user_id: string;
  job_id: string;
  company_name: string;
  job_title: string;
  match_score: number;
  matched_skills?: string;
  missing_skills?: string;
  status: 'Submitted' | 'Under Review' | 'Shortlisted' | 'Interview' | 'Selected' | 'Rejected' | 'Withdrawn';
  applied_date: string;
  last_updated: string;
  next_action: string;
  candidate_name?: string;
  candidate_email?: string;
  institution_name?: string;
}

export interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  icon?: string;
  keywords?: string;
  display_order: number;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  user_email?: string;
  role?: string;
  action: string;
  details?: string;
  created_at: string;
}

export interface SupportTicket {
  id: string;
  user_id: string;
  user_email: string;
  user_role: string;
  subject: string;
  category: string;
  message: string;
  priority: string;
  status: string;
  admin_reply?: string;
  created_at: string;
}

export interface ResumeMetadata {
  id: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
}

export interface GitHubStats {
  username: string;
  publicRepos: number;
  totalStars: number;
  totalContributions: number;
  topLanguages: string[];
  profileUrl: string;
  lastSyncedAt?: string;
}

export interface LeetCodeStats {
  username: string;
  ranking: number;
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  acceptanceRate: number;
  profileUrl: string;
  lastSyncedAt?: string;
}

