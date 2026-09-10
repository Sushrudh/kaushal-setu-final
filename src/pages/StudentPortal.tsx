import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Job, Course, StudentProfile, Application } from '../types';

export const StudentPortal: React.FC = () => {
  const { user, token, showToast, quickLoginAs } = useAuth();

  const [activeTab, setActiveTab] = useState<'jobs' | 'assessment' | 'digilocker' | 'github' | 'courses' | 'applications'>('jobs');
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [skills, setSkills] = useState<any[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States for Jobs (including specific time filters: 1h, 2h, 3h, 24h, 7d)
  const [searchQuery, setSearchQuery] = useState('');
  const [jobTypeFilter, setJobTypeFilter] = useState('all');
  const [workTypeFilter, setWorkTypeFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState<string>('all'); // '1h' | '2h' | '3h' | '24h' | '7d' | 'all'

  // Selected Job for Match Breakdown Modal
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [matchData, setMatchData] = useState<any>(null);
  const [applyingJobId, setApplyingJobId] = useState<number | null>(null);

  // DigiLocker Upload States (strictly enforcing 50 KB limit)
  const [docType, setDocType] = useState('degree');
  const [docTitle, setDocTitle] = useState('');
  const [docFile, setDocFile] = useState<File | null>(null);
  const [fileSizeError, setFileSizeError] = useState<string | null>(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  // GitHub Analysis States
  const [githubHandle, setGithubHandle] = useState('aarav-dev');
  const [analyzingGithub, setAnalyzingGithub] = useState(false);
  const [githubResults, setGithubResults] = useState<any>(null);

  // Assessment States
  const [assessmentStep, setAssessmentStep] = useState(0);
  const [assessmentAnswers, setAssessmentAnswers] = useState<Record<string, number>>({});
  const [submittingAssessment, setSubmittingAssessment] = useState(false);
  const [assessmentCompleted, setAssessmentCompleted] = useState(false);

  // Assessment Questions
  const assessmentQuestions = [
    {
      id: 'dsa',
      category: 'Data Structures & Algorithms',
      question: 'How proficient are you in implementing trees, graphs, and dynamic programming in code?',
      options: [
        { label: 'Beginner (Basic loops and arrays only)', score: 1 },
        { label: 'Intermediate (Stacks, queues, binary search)', score: 2 },
        { label: 'Proficient (Graphs, recursion, DP, amortized analysis)', score: 3 },
        { label: 'Advanced (Competitive programmer, complex graph optimizations)', score: 4 }
      ]
    },
    {
      id: 'web',
      category: 'Full-Stack Web Development',
      question: 'What is your familiarity with building REST APIs, React state management, and SQL databases?',
      options: [
        { label: 'Novice (HTML/CSS static sites)', score: 1 },
        { label: 'Familiar (Basic React apps, Express route handlers)', score: 2 },
        { label: 'Competent (JWT auth, relational DB schema, responsive UI)', score: 3 },
        { label: 'Expert (Microservices, SSR, Docker, performance profiling)', score: 4 }
      ]
    },
    {
      id: 'cloud',
      category: 'Cloud, DevOps & Git',
      question: 'How comfortable are you with Git collaboration, CI/CD pipelines, and cloud hosting?',
      options: [
        { label: 'Basic Git commit/push only', score: 1 },
        { label: 'Branching, PRs, and basic Cloud Run/Vercel deployment', score: 2 },
        { label: 'Docker containers, GitHub Actions, environment secrets', score: 3 },
        { label: 'Kubernetes orchestration, Terraform IaC, multi-region routing', score: 4 }
      ]
    },
    {
      id: 'softskills',
      category: 'Communication & Problem Solving',
      question: 'How do you approach ambiguous project briefs and technical design discussions in a team?',
      options: [
        { label: 'Need step-by-step guidance from seniors', score: 1 },
        { label: 'Can break down tasks with some mentoring', score: 2 },
        { label: 'Independent documentation, proactive updates, cross-functional collab', score: 3 },
        { label: 'Lead technical RFCs, sprint planning, and junior code reviews', score: 4 }
      ]
    }
  ];

  // Fetch initial profile, skills, jobs, courses
  const fetchData = async () => {
    setLoading(true);
    try {
      const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

      // 1. Fetch user's student profile
      const profRes = await fetch('/api/students/profile', { headers: authHeader });
      const profData = await profRes.json();
      if (profData.success) {
        setProfile(profData.data.profile);
        setSkills(profData.data.skills || []);
      }

      // 2. Fetch jobs with query params
      const queryParams = new URLSearchParams();
      if (jobTypeFilter !== 'all') queryParams.append('type', jobTypeFilter);
      if (workTypeFilter !== 'all') queryParams.append('work_type', workTypeFilter);
      if (timeFilter !== 'all') queryParams.append('time', timeFilter);
      if (searchQuery) queryParams.append('q', searchQuery);

      const jobsRes = await fetch(`/api/jobs?${queryParams.toString()}`);
      const jobsData = await jobsRes.json();
      if (jobsData.success) {
        setJobs(jobsData.data);
      }

      // 3. Fetch courses
      const coursesRes = await fetch('/api/courses');
      const coursesData = await coursesRes.json();
      if (coursesData.success) {
        setCourses(coursesData.data);
      }

      // 4. Fetch student applications
      if (token) {
        const appsRes = await fetch('/api/students/applications', { headers: authHeader });
        const appsData = await appsRes.json();
        if (appsData.success) {
          setApplications(appsData.data);
        }
      }
    } catch {
      // offline fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token, jobTypeFilter, workTypeFilter, timeFilter]);

  // Handle Match inspection
  const inspectJobMatch = async (job: Job) => {
    setSelectedJob(job);
    try {
      const res = await fetch(`/api/match/job/${job.id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (data.success) {
        setMatchData(data.data);
      }
    } catch {
      // fallback
    }
  };

  // Handle Job Application
  const handleApplyJob = async (jobId: number) => {
    if (!token) {
      showToast('Please log in as a student to apply.', 'info');
      await quickLoginAs('student');
      return;
    }
    setApplyingJobId(jobId);
    try {
      const res = await fetch(`/api/jobs/${jobId}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          coverLetter: 'I am excited to apply for this position through the Kaushal Setu collaborative talent portal.'
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Application submitted successfully! Track it under "My Applications".', 'success');
        fetchData();
        if (selectedJob) setSelectedJob(null);
      } else {
        showToast(data.error?.message || 'Could not submit application.', 'error');
      }
    } catch {
      showToast('Error applying for position.', 'error');
    } finally {
      setApplyingJobId(null);
    }
  };

  // Handle Course Enrollment
  const handleEnrollCourse = async (courseId: number) => {
    if (!token) {
      showToast('Please log in to enroll.', 'info');
      await quickLoginAs('student');
      return;
    }
    try {
      const res = await fetch(`/api/courses/${courseId}/enroll`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        showToast('Successfully enrolled! Certification track unlocked.', 'success');
        fetchData();
      } else {
        showToast(data.error?.message || 'Enrollment error.', 'error');
      }
    } catch {
      showToast('Enrollment error.', 'error');
    }
  };

  // DigiLocker File Selection Handler (STRICT 50 KB LIMIT CHECK)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSizeBytes = 50 * 1024; // strictly 50 KB
    if (file.size > maxSizeBytes) {
      const kbSize = (file.size / 1024).toFixed(1);
      setFileSizeError(`File exceeds the strict limit of 50 KB (Selected: ${kbSize} KB). Please upload a compressed document ≤ 50 KB.`);
      setDocFile(null);
    } else {
      setFileSizeError(null);
      setDocFile(file);
    }
  };

  // DigiLocker Upload Submission
  const handleDocUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docFile) {
      showToast('Please select a valid document under 50 KB.', 'error');
      return;
    }

    setUploadingDoc(true);
    try {
      const formData = new FormData();
      formData.append('document', docFile);
      formData.append('document_type', docType);
      formData.append('title', docTitle || `${docType} certificate`);

      const res = await fetch('/api/digilocker/verify-doc', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        showToast('Document verified via DigiLocker! Skills synchronized to profile.', 'success');
        setDocFile(null);
        setDocTitle('');
        fetchData();
      } else {
        showToast(data.error?.message || 'Verification failed.', 'error');
      }
    } catch {
      showToast('Upload error. Please try again.', 'error');
    } finally {
      setUploadingDoc(false);
    }
  };

  // GitHub Analysis Submission
  const handleGithubAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubHandle) return;

    setAnalyzingGithub(true);
    try {
      const res = await fetch('/api/github/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ username: githubHandle })
      });
      const data = await res.json();
      if (data.success) {
        setGithubResults(data.data);
        showToast(`GitHub profile @${githubHandle} evaluated! Skills verified.`, 'success');
        fetchData();
      } else {
        showToast(data.error?.message || 'GitHub analysis failed.', 'error');
      }
    } catch {
      showToast('Analysis error.', 'error');
    } finally {
      setAnalyzingGithub(false);
    }
  };

  // Assessment Submit Handler
  const handleAssessmentSubmit = async () => {
    setSubmittingAssessment(true);
    try {
      const res = await fetch('/api/skills/assess', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ answers: assessmentAnswers })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Assessment evaluated! Skill profile updated with benchmark score.', 'success');
        setAssessmentCompleted(true);
        fetchData();
      } else {
        showToast('Assessment evaluation failed.', 'error');
      }
    } catch {
      showToast('Assessment error.', 'error');
    } finally {
      setSubmittingAssessment(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Student Profile Top Hero Banner */}
      <section className="bg-slate-900 text-white border-b border-slate-800 pt-8 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Active Demo Login Banner if not logged in */}
          {!token && (
            <div className="mb-6 p-3 bg-blue-900/60 border border-blue-700/80 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-400">info</span>
                <span>You are currently viewing student preview mode. Click to load the verified demo profile:</span>
              </div>
              <button
                onClick={() => quickLoginAs('student')}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg cursor-pointer"
              >
                Log In as Aarav Sharma (Student)
              </button>
            </div>
          )}

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            {/* Student Identity */}
            <div className="flex items-start sm:items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 p-0.5 shadow-xl">
                  <div className="w-full h-full bg-slate-800 rounded-[14px] flex items-center justify-center text-white text-2xl font-bold">
                    {profile?.fullName ? profile.fullName.charAt(0) : 'A'}
                  </div>
                </div>
                <span className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 rounded-full text-white" title="Verified Credential">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                  </svg>
                </span>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                    {profile?.fullName || 'Aarav Sharma'}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                    B.Tech Computer Science (Final Year)
                  </span>
                  {profile?.digilocker_verified ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> DigiLocker Verified
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      Pending Document Verification
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  {profile?.institution_name || 'Indian Institute of Technology Delhi'} • Roll No: {profile?.roll_no || '2022CSB1042'}
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm text-blue-400">badge</span>
                    APAAR ID: <span className="text-slate-200 font-mono">{profile?.apaar_id || '9874-1234-5678'}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm text-emerald-400">grade</span>
                    CGPA: <span className="text-slate-200 font-bold">{profile?.cgpa || '8.85'}</span>
                  </span>
                  {profile?.github_username && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-slate-300">
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                        </svg>
                        <span>github.com/{profile.github_username}</span>
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Readiness Score Card */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-blue-600/20 border border-blue-500/30 flex flex-col items-center justify-center text-blue-400">
                <span className="text-lg font-black">{profile?.skills_score || 82}%</span>
                <span className="text-[9px] uppercase font-semibold text-slate-300">Readiness</span>
              </div>
              <div>
                <div className="text-xs font-bold text-white">Employability Benchmark</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Top 12% across affiliated universities</div>
                <div className="mt-1.5 flex gap-1">
                  {skills.slice(0, 3).map((s, idx) => (
                    <span key={idx} className="text-[10px] px-1.5 py-0.5 bg-slate-700 text-slate-200 rounded">
                      {s.skill_name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sub-Navigation Tabs */}
          <div className="mt-8 flex items-center space-x-2 border-b border-slate-800 overflow-x-auto text-xs font-semibold">
            <button
              onClick={() => setActiveTab('jobs')}
              className={`pb-3 px-3 border-b-2 transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'jobs' ? 'border-blue-500 text-blue-400 font-bold' : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-base">work</span>
              <span>Internships &amp; Jobs ({jobs.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('assessment')}
              className={`pb-3 px-3 border-b-2 transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'assessment' ? 'border-blue-500 text-blue-400 font-bold' : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-base">quiz</span>
              <span>Skill Assessment</span>
            </button>
            <button
              onClick={() => setActiveTab('digilocker')}
              className={`pb-3 px-3 border-b-2 transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'digilocker' ? 'border-blue-500 text-blue-400 font-bold' : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-base">verified_user</span>
              <span>DigiLocker Verification (50 KB)</span>
            </button>
            <button
              onClick={() => setActiveTab('github')}
              className={`pb-3 px-3 border-b-2 transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'github' ? 'border-blue-500 text-blue-400 font-bold' : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-base">code</span>
              <span>GitHub Skill Analyzer</span>
            </button>
            <button
              onClick={() => setActiveTab('courses')}
              className={`pb-3 px-3 border-b-2 transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'courses' ? 'border-blue-500 text-blue-400 font-bold' : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-base">menu_book</span>
              <span>Upskilling Courses ({courses.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('applications')}
              className={`pb-3 px-3 border-b-2 transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'applications' ? 'border-blue-500 text-blue-400 font-bold' : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-base">history_edu</span>
              <span>My Applications ({applications.length})</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Tab Views */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-grow">
        {/* TAB 1: INTERNSHIPS & JOBS WITH STRICT TIME FILTERS (1h, 2h, 3h, 24h, 7d) */}
        {activeTab === 'jobs' && (
          <div className="space-y-6">
            {/* Search & Filter Header */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex flex-col lg:flex-row gap-3">
                {/* Search query */}
                <div className="flex-grow relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-3 text-slate-400 text-lg">search</span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchData()}
                    placeholder="Search by role, company, or tech stack (e.g. React, Python, Cloud)..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                {/* Filters Row */}
                <div className="flex flex-wrap gap-2 items-center">
                  {/* Job Type Filter */}
                  <select
                    value={jobTypeFilter}
                    onChange={(e) => setJobTypeFilter(e.target.value)}
                    className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Opportunities</option>
                    <option value="internship">Internships Only</option>
                    <option value="full_time">Full-Time Jobs</option>
                    <option value="apprenticeship">Apprenticeships</option>
                  </select>

                  {/* Work Type Filter */}
                  <select
                    value={workTypeFilter}
                    onChange={(e) => setWorkTypeFilter(e.target.value)}
                    className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Work Locations</option>
                    <option value="remote">Remote Only</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="onsite">On-Site</option>
                  </select>

                  {/* Search CTA */}
                  <button
                    onClick={fetchData}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow cursor-pointer"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>

              {/* Requirement: Strict Time Filter Buttons: 1h, 2h, 3h, 24h, 7d */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-500 flex items-center gap-1 mr-1">
                  <span className="material-symbols-outlined text-sm text-blue-600">schedule</span>
                  Posted Within:
                </span>
                {[
                  { id: 'all', label: 'Any Time' },
                  { id: '1h', label: 'Past 1 Hour' },
                  { id: '2h', label: 'Past 2 Hours' },
                  { id: '3h', label: 'Past 3 Hours' },
                  { id: '24h', label: 'Past 24 Hours' },
                  { id: '7d', label: 'Past 7 Days' }
                ].map((tf) => (
                  <button
                    key={tf.id}
                    onClick={() => setTimeFilter(tf.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      timeFilter === tf.id
                        ? 'bg-blue-700 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tf.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Jobs List Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="h-44 bg-white rounded-2xl border border-slate-200 animate-pulse p-6"></div>
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <span className="material-symbols-outlined text-5xl text-slate-300">work_off</span>
                <h3 className="text-base font-bold text-slate-800 mt-2">No matching opportunities found</h3>
                <p className="text-xs text-slate-500 mt-1">Try relaxing the filters or time duration.</p>
                <button
                  onClick={() => { setJobTypeFilter('all'); setWorkTypeFilter('all'); setTimeFilter('all'); setSearchQuery(''); }}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md hover:border-blue-400 transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Meta */}
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 uppercase tracking-wider">
                            {job.job_type.replace('_', ' ')}
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 uppercase ml-1.5">
                            {job.work_type}
                          </span>
                        </div>
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                          {job.stipend_range}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 mt-1 hover:text-blue-600 transition">
                        {job.title}
                      </h3>
                      <p className="text-xs text-slate-600 font-medium">
                        {job.company_name} • <span className="text-slate-500">{job.location}</span>
                      </p>

                      <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                        {job.description}
                      </p>

                      {/* Required Skills Badges */}
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {job.skills?.slice(0, 4).map((skill, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200"
                          >
                            {skill}
                          </span>
                        ))}
                        {job.skills && job.skills.length > 4 && (
                          <span className="text-[10px] text-slate-400 px-1 py-0.5">
                            +{job.skills.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => inspectJobMatch(job)}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm">troubleshoot</span>
                        <span>Analyze Skill Match</span>
                      </button>

                      <button
                        onClick={() => handleApplyJob(job.id)}
                        disabled={applyingJobId === job.id}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition active:scale-95 cursor-pointer"
                      >
                        {applyingJobId === job.id ? 'Submitting...' : 'Apply Now'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SKILL ASSESSMENT QUESTIONNAIRE */}
        {activeTab === 'assessment' && (
          <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded">
                  AICTE / Industry Benchmark Engine
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-1">Diagnostic Skill Profiler</h2>
                <p className="text-xs text-slate-500">
                  Assess your technical and soft competencies against standard industry hiring requirements.
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-slate-400">Step</span>
                <div className="text-lg font-black text-blue-600">
                  {assessmentStep + 1} / {assessmentQuestions.length}
                </div>
              </div>
            </div>

            {assessmentCompleted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="material-symbols-outlined text-3xl">check_circle</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">Diagnostic Evaluation Completed!</h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto mt-1">
                  Your skill matrix has been benchmarked. Your updated competency score is <strong>88%</strong>. Recommendations have been calibrated.
                </p>
                <div className="mt-6 flex justify-center gap-3">
                  <button
                    onClick={() => setActiveTab('jobs')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    View Recommended Jobs
                  </button>
                  <button
                    onClick={() => { setAssessmentCompleted(false); setAssessmentStep(0); setAssessmentAnswers({}); }}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Retake Assessment
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {/* Current Question */}
                <div className="mb-6">
                  <span className="text-xs font-bold text-blue-700 uppercase">
                    {assessmentQuestions[assessmentStep].category}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
                    {assessmentQuestions[assessmentStep].question}
                  </h3>
                </div>

                {/* Options */}
                <div className="space-y-3 mb-8">
                  {assessmentQuestions[assessmentStep].options.map((opt, idx) => {
                    const qId = assessmentQuestions[assessmentStep].id;
                    const isSelected = assessmentAnswers[qId] === opt.score;
                    return (
                      <div
                        key={idx}
                        onClick={() => setAssessmentAnswers({ ...assessmentAnswers, [qId]: opt.score })}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition flex items-center justify-between ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/70 text-blue-950 font-semibold'
                            : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-700'
                        }`}
                      >
                        <span className="text-xs sm:text-sm">{opt.label}</span>
                        <span
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected ? 'border-blue-600 bg-blue-600 text-white text-[10px]' : 'border-slate-300'
                          }`}
                        >
                          {isSelected && '✓'}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    disabled={assessmentStep === 0}
                    onClick={() => setAssessmentStep((s) => s - 1)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 disabled:opacity-30 cursor-pointer"
                  >
                    ← Previous
                  </button>

                  {assessmentStep < assessmentQuestions.length - 1 ? (
                    <button
                      type="button"
                      disabled={!assessmentAnswers[assessmentQuestions[assessmentStep].id]}
                      onClick={() => setAssessmentStep((s) => s + 1)}
                      className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold shadow disabled:opacity-40 cursor-pointer"
                    >
                      Next Question →
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={submittingAssessment || !assessmentAnswers[assessmentQuestions[assessmentStep].id]}
                      onClick={handleAssessmentSubmit}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow cursor-pointer"
                    >
                      {submittingAssessment ? 'Evaluating...' : 'Submit & Benchmark Skills'}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: DIGILOCKER VERIFICATION (STRICT 50 KB LIMIT ENFORCED) */}
        {activeTab === 'digilocker' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Upload Box with 50 KB Limit */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  DL
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">DigiLocker Document Verification Gateway</h2>
                  <p className="text-xs text-slate-500">
                    Direct cryptographic verification with National Academic Depository (NAD).
                  </p>
                </div>
              </div>

              {/* Requirement Highlight: 50 KB constraint */}
              <div className="my-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
                <span className="material-symbols-outlined text-amber-600 text-base flex-shrink-0 mt-0.5">warning</span>
                <div>
                  <span className="font-bold">Strict File Size Constraint:</span> Document uploads must be strictly limited to{' '}
                  <span className="underline font-bold">maximum 50 KB</span> (PDF, PNG, or JPG) in compliance with national micro-storage standards.
                </div>
              </div>

              <form onSubmit={handleDocUpload} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Document Category</label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-slate-50"
                  >
                    <option value="degree">Provisional / Final Degree Certificate</option>
                    <option value="marksheet">Consolidated Semester Mark Sheet</option>
                    <option value="internship_certificate">Previous Internship / Apprenticeship Certificate</option>
                    <option value="skill_certification">Industry Recognized Certification (AWS, Oracle, NPTEL)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Document Title</label>
                  <input
                    type="text"
                    required
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    placeholder="e.g., IIT Delhi B.Tech CS 8th Sem Degree"
                    className="w-full px-3 py-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Upload Document (<span className="text-red-600 font-bold">Maximum 50 KB</span>)
                  </label>
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-blue-400 bg-slate-50 transition cursor-pointer">
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={handleFileChange}
                      className="hidden"
                      id="doc-upload-input"
                    />
                    <label htmlFor="doc-upload-input" className="cursor-pointer">
                      <span className="material-symbols-outlined text-3xl text-blue-600 mb-1">cloud_upload</span>
                      <p className="text-xs font-semibold text-slate-700">
                        {docFile ? docFile.name : 'Click or Drag document here to upload'}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Supported: PDF, JPG, PNG • <strong>Max: 50 KB strictly</strong>
                      </p>
                      {docFile && (
                        <p className="text-[11px] text-emerald-600 font-bold mt-1">
                          File size: {(docFile.size / 1024).toFixed(1)} KB (Valid ✓)
                        </p>
                      )}
                    </label>
                  </div>
                  {fileSizeError && (
                    <p className="text-xs text-red-600 font-semibold mt-2 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">error</span>
                      {fileSizeError}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={uploadingDoc || !docFile}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition disabled:opacity-40 cursor-pointer"
                >
                  {uploadingDoc ? 'Verifying with DigiLocker API...' : 'Verify Document & Extract Skills'}
                </button>
              </form>
            </div>

            {/* Verified Credentials Summary */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-emerald-600 text-base">verified</span>
                <span>Verified Credentials Vault</span>
              </h3>

              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span>B.Tech Provisional Degree</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">Verified</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Issuer: IIT Delhi / NAD Gateway</div>
                  <div className="text-[10px] text-slate-400 mt-1">Verified on: 02 Sep 2026 • 42.4 KB</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span>AWS Solutions Architect</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">Verified</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Issuer: Amazon Web Services</div>
                  <div className="text-[10px] text-slate-400 mt-1">Verified on: 15 Aug 2026 • 38.1 KB</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: GITHUB SKILL ANALYZER */}
        {activeTab === 'github' && (
          <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">GitHub Codebase Competency Evaluator</h2>
                <p className="text-xs text-slate-500">
                  Automated repository analysis verifying commits, language distributions, and practical project depth.
                </p>
              </div>
            </div>

            <form onSubmit={handleGithubAnalyze} className="flex gap-2 mb-6">
              <input
                type="text"
                required
                value={githubHandle}
                onChange={(e) => setGithubHandle(e.target.value)}
                placeholder="Enter your GitHub username (e.g. torvalds, aarav-dev)"
                className="flex-grow px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-slate-50 outline-none"
              />
              <button
                type="submit"
                disabled={analyzingGithub}
                className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow cursor-pointer"
              >
                {analyzingGithub ? 'Evaluating repos...' : 'Analyze GitHub'}
              </button>
            </form>

            {/* Results Display */}
            {githubResults && (
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 text-sm">@{githubResults.username}</span>
                    <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-semibold">
                      Analyzed
                    </span>
                  </div>
                  <span className="text-slate-500">Total Repos: {githubResults.public_repos || 18}</span>
                </div>

                <div>
                  <span className="font-bold text-slate-700 block mb-1">Top Languages &amp; Frameworks</span>
                  <div className="flex flex-wrap gap-2">
                    {githubResults.languages?.map((lang: string, i: number) => (
                      <span key={i} className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-700 font-semibold">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="font-bold text-slate-700 block mb-1">Extracted Proficiency Badges</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {githubResults.skills?.map((sk: any, i: number) => (
                      <div key={i} className="p-2.5 bg-white border border-slate-200 rounded-lg flex items-center justify-between">
                        <span className="font-medium text-slate-800">{sk.name}</span>
                        <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                          {sk.proficiency}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: UPSKILLING COURSES */}
        {activeTab === 'courses' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Recommended Upskilling Tracks</h2>
              <p className="text-xs text-slate-500">
                Industry-certified learning programs designed to bridge missing skill gaps before corporate placement drives.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 uppercase">
                        {course.duration}
                      </span>
                      <span className="text-xs font-bold text-emerald-600">{course.cost}</span>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900">{course.title}</h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">By {course.provider}</p>
                    <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                      {course.description}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-1">
                      {course.skills?.map((sk, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">Industry Recognized</span>
                    <button
                      onClick={() => handleEnrollCourse(course.id)}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                    >
                      Enroll Track
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: MY APPLICATIONS */}
        {activeTab === 'applications' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Track Active Applications</h2>
            {applications.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <span className="material-symbols-outlined text-4xl mb-2">inbox</span>
                <p className="text-xs">No applications submitted yet. Browse jobs to submit your first application!</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {applications.map((app) => (
                  <div key={app.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{app.job_title}</h4>
                      <p className="text-xs text-slate-500">{app.company_name} • Applied on: {new Date(app.applied_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full capitalize bg-blue-50 text-blue-700 border border-blue-200">
                        Status: {app.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Match Breakdown Inspection Modal */}
      {selectedJob && matchData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  Skill Match Diagnostic
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">{selectedJob.title}</h3>
                <p className="text-xs text-slate-500">{selectedJob.company_name}</p>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-xl">
                <div>
                  <span className="font-bold text-slate-800">Calculated Compatibility</span>
                  <p className="text-[11px] text-slate-500">Based on verified DigiLocker &amp; GitHub skills</p>
                </div>
                <span className="text-2xl font-black text-blue-700">{matchData.matchScore}%</span>
              </div>

              <div>
                <span className="font-bold text-slate-700 block mb-1">Matched Competencies (✓)</span>
                <div className="flex flex-wrap gap-1.5">
                  {matchData.matchedSkills?.length > 0 ? (
                    matchData.matchedSkills.map((sk: string, i: number) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                        ✓ {sk}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400">None detected yet</span>
                  )}
                </div>
              </div>

              {matchData.missingSkills?.length > 0 && (
                <div>
                  <span className="font-bold text-amber-700 block mb-1">Skills to Bridge (Gaps)</span>
                  <div className="flex flex-wrap gap-1.5">
                    {matchData.missingSkills.map((sk: string, i: number) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
                        ! {sk}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedJob(null)}
                className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => handleApplyJob(selectedJob.id)}
                className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow cursor-pointer"
              >
                Apply for Opportunity
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
