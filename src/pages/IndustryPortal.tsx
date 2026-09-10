import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Job } from '../types';

export const IndustryPortal: React.FC = () => {
  const { user, token, showToast, quickLoginAs } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [activeTab, setActiveTab] = useState<'pipeline' | 'post_job' | 'challenges'>('pipeline');

  // New Job Form State
  const [title, setTitle] = useState('');
  const [jobType, setJobType] = useState('internship');
  const [workType, setWorkType] = useState('hybrid');
  const [location, setLocation] = useState('Bengaluru / Hybrid');
  const [stipendRange, setStipendRange] = useState('₹35,000 / month');
  const [skillsInput, setSkillsInput] = useState('React, TypeScript, Node.js, SQLite');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Applicant Pipeline demo
  const [applicants, setApplicants] = useState<any[]>([
    { id: 101, name: 'Aarav Sharma', institute: 'IIT Delhi', role: 'Full Stack Engineering Intern', match: 94, status: 'Applied', apaar: '9874-1234-5678' },
    { id: 102, name: 'Priya Patel', institute: 'NIT Trichy', role: 'Cloud Platform Intern', match: 89, status: 'Shortlisted', apaar: '9874-4321-8765' },
    { id: 103, name: 'Rohan Verma', institute: 'BITS Pilani', role: 'Data Intelligence Trainee', match: 82, status: 'Technical Interview', apaar: '9874-5555-1111' }
  ]);

  const fetchJobs = async () => {
    try {
      const res = await fetch('/api/jobs');
      const data = await res.json();
      if (data.success) {
        setJobs(data.data);
      }
    } catch {
      // fallback
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) {
      showToast('Please provide job title and description.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const skillsArray = skillsInput.split(',').map((s) => s.trim()).filter(Boolean);
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          title,
          job_type: jobType,
          work_type: workType,
          location,
          stipend_range: stipendRange,
          skills: skillsArray,
          description,
          industry_id: 1 // default corporate partner
        })
      });

      const data = await res.json();
      if (data.success) {
        showToast('Internship opportunity published to national talent pool!', 'success');
        setTitle('');
        setDescription('');
        setActiveTab('pipeline');
        fetchJobs();
      } else {
        showToast(data.error?.message || 'Could not publish job.', 'error');
      }
    } catch {
      showToast('Error posting position.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const updateApplicantStatus = (id: number, newStatus: string) => {
    setApplicants(applicants.map((a) => (a.id === id ? { ...a, status: newStatus } : a)));
    showToast(`Applicant status updated to: ${newStatus}`, 'success');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Banner */}
      <section className="bg-slate-900 text-white border-b border-slate-800 pt-8 pb-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {!token && (
            <div className="mb-5 p-3 bg-emerald-900/60 border border-emerald-700/80 rounded-xl flex items-center justify-between text-xs">
              <span>Previewing Enterprise Recruitment Portal. Log in as verified corporate talent partner:</span>
              <button
                onClick={() => quickLoginAs('industry')}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 font-bold rounded-lg cursor-pointer"
              >
                Log In as Tata Innovations HR Lead
              </button>
            </div>
          )}

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-2xl">
                🏢
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-white">Tata Innovations &amp; Digital Solutions</h1>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    Corporate Partner ID: IND-2026-904
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  National Apprenticeship &amp; Engineering Internship Partner • 4 Active Postings
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('post_job')}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">add</span>
              <span>Post New Internship / Job</span>
            </button>
          </div>

          {/* Sub Tabs */}
          <div className="mt-8 flex items-center space-x-2 border-b border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('pipeline')}
              className={`pb-3 px-3 border-b-2 cursor-pointer ${
                activeTab === 'pipeline' ? 'border-emerald-500 text-emerald-400 font-bold' : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Candidate Pipeline ({applicants.length})
            </button>
            <button
              onClick={() => setActiveTab('post_job')}
              className={`pb-3 px-3 border-b-2 cursor-pointer ${
                activeTab === 'post_job' ? 'border-emerald-500 text-emerald-400 font-bold' : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Post Internship Opportunity
            </button>
            <button
              onClick={() => setActiveTab('challenges')}
              className={`pb-3 px-3 border-b-2 cursor-pointer ${
                activeTab === 'challenges' ? 'border-emerald-500 text-emerald-400 font-bold' : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Syllabus &amp; Hackathon Challenges
            </button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-grow">
        {/* PIPELINE TAB */}
        {activeTab === 'pipeline' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Pre-Screened Applicant Candidates</h3>
                  <p className="text-xs text-slate-500">
                    Candidates ranked by verified cryptographic skill compatibility and DigiLocker validation:
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Candidate</th>
                      <th className="p-3">Institution</th>
                      <th className="p-3">Applied Position</th>
                      <th className="p-3">Skill Match</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {applicants.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-50">
                        <td className="p-3 font-semibold text-slate-900">
                          <div>{app.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">APAAR: {app.apaar}</div>
                        </td>
                        <td className="p-3">{app.institute}</td>
                        <td className="p-3">{app.role}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-xs">
                            {app.match}% Match
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold">
                            {app.status}
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-1.5">
                          <button
                            onClick={() => updateApplicantStatus(app.id, 'Shortlisted')}
                            className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded font-bold hover:bg-emerald-100 cursor-pointer"
                          >
                            Shortlist
                          </button>
                          <button
                            onClick={() => updateApplicantStatus(app.id, 'Offered')}
                            className="px-2.5 py-1 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 cursor-pointer"
                          >
                            Offer
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* POST JOB TAB */}
        {activeTab === 'post_job' && (
          <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Publish Enterprise Internship Opportunity</h2>
            <p className="text-xs text-slate-500 mb-6">
              Requirements will automatically cross-reference university student portfolios and syllabus matrices.
            </p>

            <form onSubmit={handleCreateJob} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Opportunity Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Software Engineering Trainee / Data Systems Intern"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={jobType}
                    onChange={(e) => setJobType(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="internship">Internship</option>
                    <option value="full_time">Full Time</option>
                    <option value="apprenticeship">Apprenticeship</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Work Mode</label>
                  <select
                    value={workType}
                    onChange={(e) => setWorkType(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="onsite">On-Site</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g., Bengaluru / Noida / Hyderabad"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Stipend / CTC</label>
                  <input
                    type="text"
                    required
                    value={stipendRange}
                    onChange={(e) => setStipendRange(e.target.value)}
                    placeholder="e.g., ₹30,000 - ₹45,000 / month"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Required Competencies (Comma-separated)
                </label>
                <input
                  type="text"
                  required
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  placeholder="e.g., React, TypeScript, Python, Docker"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Role Description &amp; Deliverables</label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe project responsibilities, team structure, and prerequisites..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow cursor-pointer transition"
              >
                {submitting ? 'Publishing...' : 'Publish to National Talent Pool'}
              </button>
            </form>
          </div>
        )}

        {/* CHALLENGES TAB */}
        {activeTab === 'challenges' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center mx-auto mb-3">
              <span className="material-symbols-outlined text-2xl">trophy</span>
            </div>
            <h3 className="text-base font-bold text-slate-900">Industry Hackathons &amp; Live Problem Statements</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Sponsor live engineering challenges for college students. Top solutions earn direct interview bypass and project grants.
            </p>
            <button
              onClick={() => showToast('Smart India Innovation Problem Statement template opened.', 'success')}
              className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold cursor-pointer"
            >
              Propose New Industry Challenge
            </button>
          </div>
        )}
      </main>
    </div>
  );
};
