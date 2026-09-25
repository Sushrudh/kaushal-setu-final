import React, { useState, useEffect } from 'react';
import { User, IndustryProfile, Job } from '../types';
import { ProfilePhotoUploader } from './ProfilePhotoUploader';

interface IndustryPortalProps {
  user: User;
  onLogout: () => void;
}

export const IndustryPortal: React.FC<IndustryPortalProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'post-job' | 'my-jobs' | 'candidates' | 'interviews' | 'hackathons'>('overview');
  const [profile, setProfile] = useState<IndustryProfile | null>(null);
  const [myJobs, setMyJobs] = useState<Job[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [shortlistedMap, setShortlistedMap] = useState<Record<string, boolean>>({
    'usr_std_1': true
  });
  const [loading, setLoading] = useState(true);

  // Interview Call Modal State
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [selectedCandidateForInterview, setSelectedCandidateForInterview] = useState<any>(null);
  const [submittingInterview, setSubmittingInterview] = useState(false);
  const [interviewForm, setInterviewForm] = useState({
    position: 'Graduate Software Engineer Intern',
    interviewDate: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 16),
    interviewMode: 'Virtual',
    instructions: 'Google Meet link will be generated automatically. Candidate should be prepared to discuss capstone architectures.'
  });

  // Candidate Submissions Modal State
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
  const [submissionFilterCandidate, setSubmissionFilterCandidate] = useState<any | null>(null);

  // New Job Form State
  const [jobTitle, setJobTitle] = useState('');
  const [jobType, setJobType] = useState<'internship' | 'job' | 'apprenticeship'>('internship');
  const [jobLocation, setJobLocation] = useState('Bengaluru / Remote');
  const [jobStipend, setJobStipend] = useState('₹35,000 / month');
  const [jobSkills, setJobSkills] = useState('React, TypeScript, Node.js, REST APIs');
  const [jobDesc, setJobDesc] = useState('');
  const [submittingJob, setSubmittingJob] = useState(false);
  const [jobFeedback, setJobFeedback] = useState('');

  const fetchIndustryData = async () => {
    try {
      const token = localStorage.getItem('ks_token');
      const authHeaders: Record<string, string> = token ? { 'Authorization': `Bearer ${token}` } : {};

      const [pRes, jRes, cRes, iRes, sRes] = await Promise.all([
        fetch('/api/industry/profile', { headers: authHeaders }),
        fetch('/api/industry/jobs', { headers: authHeaders }),
        fetch('/api/industry/candidates', { headers: authHeaders }),
        fetch('/api/industry/interviews', { headers: authHeaders }),
        fetch('/api/industry/submissions', { headers: authHeaders })
      ]);

      const [pData, jData, cData, iData, sData] = await Promise.all([
        pRes.json(),
        jRes.json(),
        cRes.json(),
        iRes.json(),
        sRes.json()
      ]);

      if (pData.success) setProfile(pData.data);
      if (jData.success) setMyJobs(jData.data);
      if (cData.success) setCandidates(cData.data);
      if (iData.success) setInterviews(iData.data || []);
      if (sData.success) setSubmissions(sData.data || []);
    } catch (e) {
      console.error('Failed to load industry portal data', e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleShortlist = (candidate: any) => {
    const isCurrentlyShortlisted = !!shortlistedMap[candidate.id];
    setShortlistedMap(prev => ({
      ...prev,
      [candidate.id]: !isCurrentlyShortlisted
    }));
    setJobFeedback(
      !isCurrentlyShortlisted
        ? `Candidate ${candidate.name} has been added to your Shortlisted talent pipeline.`
        : `Candidate ${candidate.name} removed from shortlist.`
    );
  };

  const handleOpenInterviewModal = (candidate: any) => {
    setSelectedCandidateForInterview(candidate);
    setShowInterviewModal(true);
  };

  const handleScheduleInterviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidateForInterview) return;
    setSubmittingInterview(true);

    try {
      const token = localStorage.getItem('ks_token');
      const res = await fetch('/api/industry/interviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          applicationId: 'app_' + selectedCandidateForInterview.id,
          candidateId: selectedCandidateForInterview.id,
          position: interviewForm.position,
          companyName: profile?.companyName || 'Enterprise Partner',
          interviewDate: interviewForm.interviewDate,
          interviewMode: interviewForm.interviewMode,
          instructions: interviewForm.instructions
        })
      });

      const data = await res.json();
      if (data.success) {
        setJobFeedback(`Interview scheduled with ${selectedCandidateForInterview.name} for ${new Date(interviewForm.interviewDate).toLocaleString()}!`);
        setShowInterviewModal(false);
        fetchIndustryData();
      } else {
        setJobFeedback(data.error?.message || 'Failed to schedule interview.');
      }
    } catch (e) {
      setJobFeedback('Network error scheduling interview.');
    } finally {
      setSubmittingInterview(false);
    }
  };

  const handleOpenSubmissions = (candidate?: any) => {
    setSubmissionFilterCandidate(candidate || null);
    setShowSubmissionsModal(true);
  };

  useEffect(() => {
    fetchIndustryData();
  }, []);

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingJob(true);
    setJobFeedback('');

    try {
      const token = localStorage.getItem('ks_token');
      const authHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      };

      const res = await fetch('/api/industry/jobs', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          title: jobTitle,
          type: jobType,
          location: jobLocation,
          stipend: jobStipend,
          skillsRequired: jobSkills.split(',').map((s) => s.trim()),
          description: jobDesc
        })
      });

      const json = await res.json();
      if (json.success) {
        setJobFeedback('Opportunity published successfully across the National Digital Skills Gateway!');
        setJobTitle('');
        setJobDesc('');
        fetchIndustryData();
        setActiveTab('my-jobs');
      } else {
        setJobFeedback(json.error?.message || 'Failed to publish opportunity.');
      }
    } catch (err) {
      setJobFeedback('Network error publishing listing.');
    } finally {
      setSubmittingJob(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-slate-700">Loading Enterprise Gateway...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Header Banner */}
      <div className="bg-slate-900 text-white py-6 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <ProfilePhotoUploader
              currentAvatarUrl={user.avatarUrl}
              name={profile?.name || user.organization || 'TCS'}
              role="industry"
              onPhotoUpdated={(newUrl) => {
                user.avatarUrl = newUrl || undefined;
                fetchIndustryData();
              }}
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white">{profile?.name || user.organization || 'Tata Consultancy Services'}</h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <span className="material-symbols-outlined text-xs">verified</span>
                  CIN Verified Enterprise
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Corporate ID: <span className="font-mono text-emerald-300">{profile?.cin || 'L72200MH1995PLC095058'}</span> • National Talent Partner
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('post-job')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">add_circle</span>
              <span>Post New Opportunity</span>
            </button>
            <button
              onClick={onLogout}
              className="px-3 py-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-colors"
            >
              Log Out
            </button>
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="flex overflow-x-auto space-x-2 text-xs font-semibold scrollbar-none">
            {[
              { id: 'overview', label: 'Hiring Overview', icon: 'dashboard' },
              { id: 'post-job', label: 'Post Opportunity', icon: 'add_box' },
              { id: 'my-jobs', label: `Active Listings (${myJobs.length})`, icon: 'list_alt' },
              { id: 'candidates', label: `Matched Candidates (${candidates.length})`, icon: 'people' },
              { id: 'interviews', label: `Scheduled Interviews (${interviews.length})`, icon: 'video_call' },
              { id: 'hackathons', label: 'Syllabus Challenges & FDPs', icon: 'military_tech' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl transition-colors whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-slate-100 text-slate-900 border-t-2 border-emerald-600 font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <span className="material-symbols-outlined text-base">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full">
        {jobFeedback && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
            <span>{jobFeedback}</span>
            <button onClick={() => setJobFeedback('')} className="text-emerald-500 hover:text-emerald-700">✕</button>
          </div>
        )}

        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Listings</span>
                <div className="mt-2 text-2xl font-black text-slate-900">{myJobs.length || 4}</div>
                <p className="text-xs text-emerald-600 font-semibold mt-1">Internships &amp; Placements</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Applicant Pool</span>
                <div className="mt-2 text-2xl font-black text-slate-900">{candidates.length || 18} Verified</div>
                <p className="text-xs text-blue-600 font-semibold mt-1">100% DigiLocker Verified</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Avg. Match Score</span>
                <div className="mt-2 text-2xl font-black text-slate-900">89.4%</div>
                <p className="text-xs text-purple-600 font-semibold mt-1">Zero Retraining Needed</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Partner Universities</span>
                <div className="mt-2 text-2xl font-black text-slate-900">64 Campuses</div>
                <p className="text-xs text-amber-600 font-semibold mt-1">Direct API Syndication</p>
              </div>
            </div>

            {/* Candidate Previews */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Top Matched Pre-Evaluated Candidates</h3>
                  <p className="text-xs text-slate-500">Candidates with verified APAAR marksheets and high diagnostic test results.</p>
                </div>
                <button onClick={() => setActiveTab('candidates')} className="text-xs font-bold text-emerald-700 hover:underline">
                  View All Candidates →
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {(candidates.slice(0, 3)).map((cand) => (
                  <div key={cand.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{cand.name}</span>
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold border border-emerald-200">
                          DigiLocker Verified
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {cand.college} • APAAR ID: <span className="font-mono text-slate-700">{cand.apaarId}</span>
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {(cand.skills || []).map((s: string) => (
                          <span key={s} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px]">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right">
                        <span className="text-sm font-black text-emerald-700">{cand.matchScore || 92}% Match</span>
                        <span className="text-[10px] text-slate-400 block">Assessment: {cand.score || '94/100'}</span>
                      </div>
                      <button
                        onClick={() => alert(`Interview call invite dispatched to ${cand.name} via National Gateway.`)}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                      >
                        Interview Call
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* POST JOB TAB */}
        {activeTab === 'post-job' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 max-w-3xl mx-auto">
            <div className="mb-6 pb-4 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                National Portal Listing
              </span>
              <h2 className="text-2xl font-bold text-slate-900 mt-2">Publish Internship or Placement Drive</h2>
              <p className="text-xs text-slate-500 mt-1">
                Directly matches student profiles across 3,000+ colleges based on verified skills and diagnostic scores.
              </p>
            </div>

            <form onSubmit={handlePostJob} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Opportunity Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Cloud Native DevOps Intern"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:border-emerald-600 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Engagement Type
                  </label>
                  <select
                    value={jobType}
                    onChange={(e: any) => setJobType(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:border-emerald-600 outline-none"
                  >
                    <option value="internship">Internship</option>
                    <option value="job">Entry-Level Job</option>
                    <option value="apprenticeship">NAPS/NATS Apprenticeship</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    required
                    value={jobLocation}
                    onChange={(e) => setJobLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:border-emerald-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Stipend / CTC
                  </label>
                  <input
                    type="text"
                    required
                    value={jobStipend}
                    onChange={(e) => setJobStipend(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:border-emerald-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Required Competencies (Comma-separated) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={jobSkills}
                  onChange={(e) => setJobSkills(e.target.value)}
                  placeholder="e.g. React, TypeScript, Docker, Kubernetes, SQL"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:border-emerald-600 outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Used by the Skill Matching Engine to match qualified candidates automatically.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Job Description &amp; Responsibilities <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={jobDesc}
                  onChange={(e) => setJobDesc(e.target.value)}
                  placeholder="Describe day-to-day responsibilities, learning outcomes, and conversion opportunities..."
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:border-emerald-600 outline-none"
                ></textarea>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={submittingJob}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer"
                >
                  {submittingJob ? 'Broadcasting Opportunity...' : 'Publish to National Talent Pool →'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* MY JOBS TAB */}
        {activeTab === 'my-jobs' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Your Active Opportunity Postings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myJobs.map((job) => (
                <div key={job.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {job.type}
                      </span>
                      <span className="text-xs text-slate-400">Location: {job.location}</span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-base mt-2">{job.title}</h3>
                    <p className="text-xs text-slate-600 mt-2 line-clamp-2">{job.description}</p>
                    <div className="flex flex-wrap gap-1 mt-3">
                      {(job.skillsRequired || []).map((s) => (
                        <span key={s} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px]">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">{job.stipend}</span>
                    <button
                      onClick={() => setActiveTab('candidates')}
                      className="text-emerald-700 font-bold hover:underline"
                    >
                      View Applications →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CANDIDATES TAB */}
        {activeTab === 'candidates' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Verified Candidate Talent Pool</h2>
                <p className="text-xs text-slate-500">
                  Pre-screened engineering students with DigiLocker verified academic credentials and hands-on capstone projects.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                  ● {candidates.length} Discoverable Candidates
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Candidate &amp; University</th>
                    <th className="py-3 px-4">APAAR Verification</th>
                    <th className="py-3 px-4">Match Score</th>
                    <th className="py-3 px-4">Key Verified Skills</th>
                    <th className="py-3 px-4">Projects</th>
                    <th className="py-3 px-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {candidates.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500">
                        No public candidate profiles currently found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    candidates.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-bold text-slate-900">
                          <div>{c.name}</div>
                          <div className="text-[11px] font-normal text-slate-500">{c.college}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <span className="material-symbols-outlined text-xs">verified</span>
                            {c.apaarId}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                            {c.matchScore || 90}% Match
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {(c.skills || []).slice(0, 4).map((s: string) => (
                              <span key={s} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px]">
                                {s}
                              </span>
                            ))}
                            {(c.skills || []).length > 4 && (
                              <span className="text-[10px] text-slate-400 font-semibold">
                                +{(c.skills || []).length - 4} more
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-xs font-semibold text-slate-700">
                            {c.projectCount || 0} Repos
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <button
                              onClick={() => handleToggleShortlist(c)}
                              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                                shortlistedMap[c.id]
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                                  : 'bg-white border border-slate-300 text-slate-700 hover:border-emerald-500'
                              }`}
                            >
                              <span className="material-symbols-outlined text-xs">
                                {shortlistedMap[c.id] ? 'check_circle' : 'bookmark_border'}
                              </span>
                              <span>{shortlistedMap[c.id] ? 'Shortlisted' : 'Shortlist'}</span>
                            </button>

                            <button
                              onClick={() => handleOpenInterviewModal(c)}
                              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                            >
                              <span className="material-symbols-outlined text-xs">video_call</span>
                              <span>Interview Call</span>
                            </button>

                            <button
                              onClick={() => handleOpenSubmissions(c)}
                              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <span className="material-symbols-outlined text-xs">folder_open</span>
                              <span>View Work</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SCHEDULED INTERVIEWS TAB (Requirement #9) */}
        {activeTab === 'interviews' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Scheduled Interviews &amp; Technical Assessments</h2>
                <p className="text-xs text-slate-500">Virtual interview calls and live candidate technical rounds synchronized with student dashboards.</p>
              </div>
              <button
                onClick={() => {
                  if (candidates.length > 0) {
                    setSelectedCandidateForInterview(candidates[0]);
                    setShowInterviewModal(true);
                  }
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                <span>Schedule New Interview</span>
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              {interviews.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">Candidate</th>
                        <th className="py-3 px-4">Role / Position</th>
                        <th className="py-3 px-4">Date &amp; Time</th>
                        <th className="py-3 px-4">Mode</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Instructions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {interviews.map((int: any) => (
                        <tr key={int.id} className="hover:bg-slate-50">
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900">{int.candidate_name || 'Candidate'}</div>
                            <div className="text-[11px] text-slate-500 font-mono">{int.candidate_email}</div>
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-800">{int.position}</td>
                          <td className="py-3 px-4 font-mono text-emerald-700 font-semibold">
                            {new Date(int.interview_date).toLocaleString()}
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold border border-blue-200 text-[11px]">
                              {int.interview_mode || 'Virtual'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                              {int.status || 'Scheduled'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-500 max-w-xs truncate">{int.instructions || 'Standard assessment'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center">
                  <span className="material-symbols-outlined text-3xl text-slate-400 mb-1">video_call</span>
                  <p className="text-xs font-bold text-slate-700">No Upcoming Interviews Scheduled</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Go to Matched Candidates and click "Interview Call" on any candidate to set up a virtual or campus interview.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* HACKATHONS TAB */}
        {activeTab === 'hackathons' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Syllabus Challenges &amp; Capstones</h2>
              <p className="text-xs text-slate-500">Engage university students with live industry problem statements.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded uppercase">
                    National Hackathon
                  </span>
                  <h3 className="font-bold text-slate-900 text-base mt-2">Distributed Microservices Chaos Resiliency</h3>
                  <p className="text-xs text-slate-600 mt-2">
                    Design automated chaos testing scenarios for high-throughput financial message queues.
                  </p>
                  <div className="mt-4 text-xs text-slate-500">
                    <div>Sponsor: TCS Enterprise Labs</div>
                    <div>Prize Pool &amp; Direct PPIs: ₹2,50,000 + 10 Pre-Placement Offers</div>
                  </div>
                </div>
                <div className="mt-6 pt-3 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-xs text-emerald-600 font-bold">142 College Teams Enrolled</span>
                  <button
                    onClick={() => handleOpenSubmissions()}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                  >
                    View Submissions ({submissions.length})
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: SCHEDULE INTERVIEW CALL */}
      {showInterviewModal && selectedCandidateForInterview && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 border border-slate-100 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Schedule Candidate Interview Call</h3>
                <p className="text-xs text-slate-500">Candidate: <span className="font-semibold text-slate-800">{selectedCandidateForInterview.name}</span> ({selectedCandidateForInterview.college})</p>
              </div>
              <button
                onClick={() => setShowInterviewModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleScheduleInterviewSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Target Position / Opportunity *</label>
                <input
                  type="text"
                  required
                  value={interviewForm.position}
                  onChange={(e) => setInterviewForm({ ...interviewForm, position: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Interview Date &amp; Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={interviewForm.interviewDate}
                    onChange={(e) => setInterviewForm({ ...interviewForm, interviewDate: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Assessment Mode *</label>
                  <select
                    value={interviewForm.interviewMode}
                    onChange={(e) => setInterviewForm({ ...interviewForm, interviewMode: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600 bg-white"
                  >
                    <option value="Virtual">Virtual (Google Meet / Video)</option>
                    <option value="On-site">On-site (Corporate HQ)</option>
                    <option value="Campus">Campus Placement Center</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Interview Instructions &amp; Setup Notes</label>
                <textarea
                  rows={3}
                  value={interviewForm.instructions}
                  onChange={(e) => setInterviewForm({ ...interviewForm, instructions: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-emerald-600">info</span>
                <span>An automated invitation with interview details will be synchronized to the student's portal and email notification center.</span>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowInterviewModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingInterview}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {submittingInterview && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
                  <span>Confirm Interview Call</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CANDIDATE SUBMISSIONS & WORK */}
      {showSubmissionsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 border border-slate-100 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {submissionFilterCandidate ? `${submissionFilterCandidate.name}'s Project Submissions` : 'Student Project & Capstone Submissions'}
                </h3>
                <p className="text-xs text-slate-500">Verified GitHub repositories, live demo URLs, and technical architectures</p>
              </div>
              <button
                onClick={() => setShowSubmissionsModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              {(submissionFilterCandidate
                ? submissions.filter((s: any) => s.studentName === submissionFilterCandidate.name || s.studentEmail === submissionFilterCandidate.email)
                : submissions
              ).length > 0 ? (
                (submissionFilterCandidate
                  ? submissions.filter((s: any) => s.studentName === submissionFilterCandidate.name || s.studentEmail === submissionFilterCandidate.email)
                  : submissions
                ).map((sub: any) => (
                  <div key={sub.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                          {sub.category || 'Capstone Project'}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 mt-1">{sub.title}</h4>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Submitted by <span className="font-semibold text-slate-700">{sub.studentName}</span> ({sub.college}) • CGPA: {sub.cgpa}
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">
                        {sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString() : 'Recent'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600">{sub.description}</p>

                    <div className="flex flex-wrap gap-1">
                      {(sub.technologies || '').split(',').map((tech: string) => (
                        <span key={tech} className="px-2 py-0.5 bg-white border border-slate-200 text-slate-600 rounded text-[10px]">
                          {tech.trim()}
                        </span>
                      ))}
                    </div>

                    <div className="pt-3 border-t border-slate-200 flex items-center gap-3 text-xs">
                      {sub.githubUrl && (
                        <a
                          href={sub.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="font-bold text-slate-800 hover:text-emerald-700 flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-sm">code</span>
                          <span>GitHub Repo</span>
                        </a>
                      )}
                      {sub.liveUrl && (
                        <a
                          href={sub.liveUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="font-bold text-emerald-700 hover:underline flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-sm">open_in_new</span>
                          <span>Live Deployment</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center">
                  <span className="material-symbols-outlined text-3xl text-slate-400 mb-1">folder_off</span>
                  <p className="text-xs font-bold text-slate-700">No Capstone Submissions Found for Candidate</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Student has not yet attached public repository submissions to their portal profile.</p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShowSubmissionsModal(false)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
