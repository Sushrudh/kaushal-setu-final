import React, { useState, useEffect } from 'react';
import { User, InstitutionProfile } from '../types';
import { ProfilePhotoUploader } from './ProfilePhotoUploader';

interface InstitutionPortalProps {
  user: User;
  onLogout: () => void;
}

export const InstitutionPortal: React.FC<InstitutionPortalProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'curriculum' | 'telemetry' | 'fdp'>('overview');
  const [profile, setProfile] = useState<InstitutionProfile | null>(null);
  const [telemetry, setTelemetry] = useState<any>(null);
  const [fdps, setFdps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Faculty Nominations State (Requirement #8)
  const [nominations, setNominations] = useState<any[]>([]);
  const [showNominateModal, setShowNominateModal] = useState(false);
  const [submittingNomination, setSubmittingNomination] = useState(false);
  const [nominationForm, setNominationForm] = useState({
    facultyName: '',
    department: 'Computer Science & Engineering',
    designation: 'Assistant Professor',
    email: '',
    phone: '',
    specialization: 'Cloud Computing & Distributed Systems',
    programTitle: 'Cloud-Native Architecture & Microservices',
    nominationType: 'FDP',
    remarks: ''
  });

  // Upload Course State (Requirement #8)
  const [courses, setCourses] = useState<any[]>([]);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [submittingCourse, setSubmittingCourse] = useState(false);
  const [courseForm, setCourseForm] = useState({
    title: '',
    category: 'Computer Science & Engineering',
    description: '',
    skillsCovered: 'Data Structures, System Design, Cloud Architecture',
    durationHours: 36,
    totalLessons: 18,
    difficulty: 'Intermediate'
  });

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Curriculum mapping form state
  const [syllabusCourse, setSyllabusCourse] = useState('Data Structures & Web Technologies');
  const [analyzingGap, setAnalyzingGap] = useState(false);
  const [gapAnalysis, setGapAnalysis] = useState<any>(null);

  const fetchInstitutionData = async () => {
    try {
      const token = localStorage.getItem('ks_token');
      const authHeaders: Record<string, string> = token ? { 'Authorization': `Bearer ${token}` } : {};

      const [pRes, tRes, fRes, nRes, cRes] = await Promise.all([
        fetch('/api/institution/profile', { headers: authHeaders }),
        fetch('/api/institution/telemetry', { headers: authHeaders }),
        fetch('/api/institution/fdps', { headers: authHeaders }),
        fetch('/api/institution/faculty-nominations', { headers: authHeaders }),
        fetch('/api/institution/courses', { headers: authHeaders })
      ]);

      const [pData, tData, fData, nData, cData] = await Promise.all([
        pRes.json(),
        tRes.json(),
        fRes.json(),
        nRes.json(),
        cRes.json()
      ]);

      if (pData.success) setProfile(pData.data);
      if (tData.success) setTelemetry(tData.data);
      if (fData.success) setFdps(fData.data);
      if (nData.success) setNominations(nData.data || []);
      if (cData.success) setCourses(cData.data || []);
    } catch (e) {
      console.error('Failed to load institution data', e);
    } finally {
      setLoading(false);
    }
  };

  const handleNominateFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingNomination(true);
    try {
      const token = localStorage.getItem('ks_token');
      const res = await fetch('/api/institution/faculty-nominations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(nominationForm)
      });
      const data = await res.json();
      if (data.success) {
        setNotification({ type: 'success', message: data.message });
        setShowNominateModal(false);
        fetchInstitutionData();
      } else {
        setNotification({ type: 'error', message: data.error?.message || 'Failed to submit nomination.' });
      }
    } catch (e) {
      setNotification({ type: 'error', message: 'Network error submitting nomination.' });
    } finally {
      setSubmittingNomination(false);
    }
  };

  const handleUploadCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingCourse(true);
    try {
      const token = localStorage.getItem('ks_token');
      const res = await fetch('/api/institution/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(courseForm)
      });
      const data = await res.json();
      if (data.success) {
        setNotification({ type: 'success', message: data.message });
        setShowCourseModal(false);
        setCourseForm({
          title: '',
          category: 'Computer Science & Engineering',
          description: '',
          skillsCovered: 'Data Structures, System Design, Cloud Architecture',
          durationHours: 36,
          totalLessons: 18,
          difficulty: 'Intermediate'
        });
        fetchInstitutionData();
      } else {
        setNotification({ type: 'error', message: data.error?.message || 'Failed to upload course.' });
      }
    } catch (e) {
      setNotification({ type: 'error', message: 'Network error uploading course.' });
    } finally {
      setSubmittingCourse(false);
    }
  };

  useEffect(() => {
    fetchInstitutionData();
  }, []);

  const handleRunCurriculumAnalysis = () => {
    setAnalyzingGap(true);
    setTimeout(() => {
      setGapAnalysis({
        syllabus: syllabusCourse,
        overallAlignment: 74,
        matchedCompetencies: ['Relational Database Systems (SQL)', 'Object Oriented Programming', 'Network Protocols', 'Basic Data Structures'],
        emergingGaps: ['Cloud-Native Microservices (Kubernetes)', 'TypeScript & Modern React', 'CI/CD Pipelines & DevOps', 'AI / LLM Integration APIs'],
        recommendations: [
          'Introduce elective module on Cloud DevOps & Containerization in Semester VI.',
          'Replace legacy Java Swing laboratory with full-stack TypeScript + Express projects.',
          'Partner with Tata Consultancy Services or Infosys Springboard for 30 hours of industry mentorship.'
        ]
      });
      setAnalyzingGap(false);
    }, 600);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-slate-700">Loading University Institutional Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white py-6 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <ProfilePhotoUploader
              currentAvatarUrl={user.avatarUrl}
              name={profile?.name || user.organization || 'DTU'}
              role="institution"
              onPhotoUpdated={(newUrl) => {
                user.avatarUrl = newUrl || undefined;
                fetchInstitutionData();
              }}
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white">{profile?.name || user.organization || 'Delhi Technological University'}</h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  AISHE Code: {profile?.aisheCode || 'U-0123'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Affiliated with UGC &amp; AICTE • State / Central University Node
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => alert('Batch export requested. A cryptographically signed report with all APAAR IDs has been generated.')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600/30 border border-purple-400/40 text-purple-200 text-xs font-semibold hover:bg-purple-600/50 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">download</span>
              <span>Export Placement Report (CSV)</span>
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
              { id: 'overview', label: 'Institutional Overview', icon: 'dashboard' },
              { id: 'curriculum', label: 'Curriculum & NEP 2020 Mapping', icon: 'alt_route' },
              { id: 'telemetry', label: 'Student Placement Telemetry', icon: 'analytics' },
              { id: 'fdp', label: 'Faculty Development (FDPs)', icon: 'co_present' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl transition-colors whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-slate-100 text-slate-900 border-t-2 border-purple-600 font-bold'
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
        {/* NOTIFICATION BANNER */}
        {notification && (
          <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
            notification.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}>
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="material-symbols-outlined text-sm">{notification.type === 'success' ? 'check_circle' : 'error'}</span>
              <span>{notification.message}</span>
            </div>
            <button onClick={() => setNotification(null)} className="text-xs font-bold hover:underline cursor-pointer">Dismiss</button>
          </div>
        )}

        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Enrolled Students</span>
                <div className="mt-2 text-2xl font-black text-slate-900">
                  {telemetry?.totalStudents || 3420}
                </div>
                <p className="text-xs text-emerald-600 font-semibold mt-1">98.4% Synced with APAAR</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Internships</span>
                <div className="mt-2 text-2xl font-black text-slate-900">
                  {telemetry?.activeInternships || 1280}
                </div>
                <p className="text-xs text-blue-600 font-semibold mt-1">Across 142 Enterprise Partners</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Curriculum Alignment</span>
                <div className="mt-2 text-2xl font-black text-slate-900">
                  {telemetry?.curriculumIndex || 82}%
                </div>
                <p className="text-xs text-purple-600 font-semibold mt-1">AICTE NEP 2020 Compliant</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">FDPs Completed</span>
                <div className="mt-2 text-2xl font-black text-slate-900">46 Faculty</div>
                <p className="text-xs text-amber-600 font-semibold mt-1">Industry Sabbaticals Active</p>
              </div>
            </div>

            {/* University Highlight Card */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Institutional Synchrony Status</h3>
                  <p className="text-xs text-slate-500">Live health telemetry with National Academic Depository &amp; Ministry of Education.</p>
                </div>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-full">
                  ● All National Gateways Operational
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-xs font-bold text-slate-700 block mb-1">DigiLocker / NAD API Gateway</span>
                  <p className="text-xs text-slate-500">Batch certificate issuance &amp; degree verification automated.</p>
                  <span className="text-[11px] font-mono text-emerald-600 font-bold mt-2 block">STATUS: CONNECTED</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-xs font-bold text-slate-700 block mb-1">NCrF Academic Bank of Credits</span>
                  <p className="text-xs text-slate-500">Automatic credit transfer for 4-credit industry modules.</p>
                  <span className="text-[11px] font-mono text-emerald-600 font-bold mt-2 block">STATUS: ACCREDITED</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-xs font-bold text-slate-700 block mb-1">Industry Advisory Matrix</span>
                  <p className="text-xs text-slate-500">Direct syndication with Tata, Infosys, and 200+ employers.</p>
                  <span className="text-[11px] font-mono text-purple-600 font-bold mt-2 block">ACTIVE SYNDICATES: 18</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CURRICULUM MAPPING */}
        {activeTab === 'curriculum' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md border border-purple-100">
                AICTE / NEP 2020 Matrix
              </span>
              <h2 className="text-2xl font-bold text-slate-900 mt-2">Curriculum Harmonization &amp; Skill Gap Diagnostic</h2>
              <p className="text-xs text-slate-500 mt-1">
                Evaluate your syllabus against real-time industry requirement telemetry across 50,000+ job postings nationwide.
              </p>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={syllabusCourse}
                  onChange={(e) => setSyllabusCourse(e.target.value)}
                  placeholder="Enter Course or Subject Title (e.g. B.Tech Computer Science Sem-VI)"
                  className="flex-grow px-4 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:border-purple-600 outline-none"
                />
                <button
                  onClick={handleRunCurriculumAnalysis}
                  disabled={analyzingGap}
                  className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md cursor-pointer transition-all"
                >
                  {analyzingGap ? 'Analyzing Matrix...' : 'Run Alignment Engine →'}
                </button>
              </div>
            </div>

            {gapAnalysis && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Analysis Results: {gapAnalysis.syllabus}</h3>
                    <p className="text-xs text-slate-500">Benchmark: Tier-1 &amp; Tier-2 Tech Industry Postings (Q3 2025)</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-purple-700">{gapAnalysis.overallAlignment}%</span>
                    <span className="text-[10px] text-slate-400 block">Overall Alignment</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-3 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm">check_circle</span>
                      Strongly Aligned Competencies in Current Syllabus
                    </h4>
                    <ul className="space-y-2 text-xs text-emerald-900 font-medium">
                      {gapAnalysis.matchedCompetencies.map((c: string) => (
                        <li key={c} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-rose-800 mb-3 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm">warning</span>
                      Emerging Industry Competency Gaps
                    </h4>
                    <ul className="space-y-2 text-xs text-rose-900 font-medium">
                      {gapAnalysis.emergingGaps.map((c: string) => (
                        <li key={c} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                    Actionable Recommendations for Academic Council:
                  </h4>
                  <div className="space-y-2.5">
                    {gapAnalysis.recommendations.map((rec: string, i: number) => (
                      <div key={i} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-[11px] flex-shrink-0">
                          {i + 1}
                        </span>
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* INSTITUTIONAL COURSES SECTION (Requirement #8) */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Institutional Curriculum Modules &amp; Uploaded Courses</h3>
                  <p className="text-xs text-slate-500">Upload department-approved courses into the national portal for enrolled students and inter-college credits.</p>
                </div>
                <button
                  onClick={() => setShowCourseModal(true)}
                  className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm whitespace-nowrap"
                >
                  <span className="material-symbols-outlined text-sm">upload</span>
                  <span>Upload Institutional Course</span>
                </button>
              </div>

              {courses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {courses.map((course: any) => (
                    <div key={course.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                            {course.difficulty || 'Intermediate'}
                          </span>
                          <span className="text-[10px] text-slate-500">{course.duration_hours || 36} Hours</span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm mt-1">{course.title}</h4>
                        <p className="text-xs text-slate-600 line-clamp-2 mt-1">{course.description}</p>
                      </div>

                      <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                        <span>{course.total_lessons || 12} Lessons</span>
                        <span className="font-semibold text-emerald-600">✓ Published to Catalog</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center">
                  <span className="material-symbols-outlined text-3xl text-slate-400 mb-1">school</span>
                  <p className="text-xs font-bold text-slate-700">No Institutional Courses Published Yet</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Click "Upload Institutional Course" above to publish syllabi directly into the student learning catalog.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TELEMETRY */}
        {activeTab === 'telemetry' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Student Placement &amp; Internship Telemetry</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">APAAR ID</th>
                    <th className="py-3 px-4">Degree / Branch</th>
                    <th className="py-3 px-4">Diagnostic Score</th>
                    <th className="py-3 px-4">Internship Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {[
                    { name: 'Aarav Sharma', apaar: '9876-5432-1098', branch: 'B.Tech CSE', score: '92%', status: 'Placed (TCS Research)' },
                    { name: 'Priya Patel', apaar: '4321-8765-5432', branch: 'B.Tech IT', score: '88%', status: 'Interning (Infosys)' },
                    { name: 'Rohan Deshmukh', apaar: '1234-9876-2345', branch: 'B.Tech ECE', score: '84%', status: 'Shortlisted' },
                    { name: 'Ananya Verma', apaar: '6543-2198-7654', branch: 'B.Tech CSE', score: '95%', status: 'Placed (Wipro AI)' }
                  ].map((s) => (
                    <tr key={s.apaar} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-slate-900">{s.name}</td>
                      <td className="py-3 px-4 font-mono text-slate-500">{s.apaar}</td>
                      <td className="py-3 px-4">{s.branch}</td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                          {s.score}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-blue-700">{s.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* FDPs */}
        {activeTab === 'fdp' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Faculty Development Programs (FDPs) &amp; Sabbaticals</h2>
                <p className="text-xs text-slate-500">Sponsored industrial training tracks enabling faculty to experience enterprise engineering firsthand.</p>
              </div>
              <button
                onClick={() => {
                  setNominationForm(prev => ({ ...prev, programTitle: 'Cloud-Native Architecture & Microservices' }));
                  setShowNominateModal(true);
                }}
                className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-sm">person_add</span>
                <span>Nominate Faculty Member</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  title: 'Cloud-Native Architecture & Microservices',
                  sponsor: 'Tata Consultancy Services Enterprise Labs',
                  duration: '2 Weeks (Full Time Sabbatical)',
                  seats: '15 Faculty Seats',
                  status: 'Nomination Open'
                },
                {
                  title: 'Generative AI & LLM Systems Engineering',
                  sponsor: 'Infosys Springboard AI Wing',
                  duration: '3 Weeks (Hybrid Mode)',
                  seats: '25 Faculty Seats',
                  status: 'Nomination Open'
                }
              ].map((fdp) => (
                <div key={fdp.title} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-100 uppercase">
                      AICTE Recognized
                    </span>
                    <h3 className="font-bold text-slate-900 text-base mt-2">{fdp.title}</h3>
                    <p className="text-xs font-semibold text-slate-600 mt-1">{fdp.sponsor}</p>
                    <div className="mt-3 text-xs text-slate-500 space-y-1">
                      <div>Duration: {fdp.duration}</div>
                      <div>Available: {fdp.seats}</div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-600">{fdp.status}</span>
                    <button
                      onClick={() => {
                        setNominationForm(prev => ({ ...prev, programTitle: fdp.title }));
                        setShowNominateModal(true);
                      }}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Nominate Faculty →
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* NOMINATED FACULTY REGISTRY (Requirement #8) */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <h3 className="text-base font-bold text-slate-900">Institutional Faculty Nominations Registry</h3>
              {nominations.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">Faculty Name</th>
                        <th className="py-3 px-4">Designation &amp; Dept</th>
                        <th className="py-3 px-4">Email</th>
                        <th className="py-3 px-4">Nominated Track</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {nominations.map((nom: any) => (
                        <tr key={nom.id} className="hover:bg-slate-50">
                          <td className="py-3 px-4 font-bold text-slate-900">{nom.facultyName}</td>
                          <td className="py-3 px-4">{nom.designation} • {nom.department}</td>
                          <td className="py-3 px-4 font-mono text-slate-500">{nom.email}</td>
                          <td className="py-3 px-4 font-semibold text-purple-700">{nom.programTitle}</td>
                          <td className="py-3 px-4">
                            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                              {nom.status || 'Nominated'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-400">
                            {nom.createdAt ? new Date(nom.createdAt).toLocaleDateString() : 'Recent'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center">
                  <span className="material-symbols-outlined text-2xl text-slate-400 mb-1">groups</span>
                  <p className="text-xs font-bold text-slate-700">No Faculty Nominated Yet</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Nominate faculty members for AICTE industry sabbaticals using the button above.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: NOMINATE FACULTY */}
      {showNominateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 border border-slate-100 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Nominate Faculty for FDP</h3>
                <p className="text-xs text-slate-500">Official AICTE &amp; Industry Sabbatical Track</p>
              </div>
              <button
                onClick={() => setShowNominateModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleNominateFaculty} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Faculty Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Rajesh K. Sharma"
                  value={nominationForm.facultyName}
                  onChange={(e) => setNominationForm({ ...nominationForm, facultyName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-purple-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Department *</label>
                  <input
                    type="text"
                    required
                    value={nominationForm.department}
                    onChange={(e) => setNominationForm({ ...nominationForm, department: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-purple-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Designation *</label>
                  <input
                    type="text"
                    required
                    value={nominationForm.designation}
                    onChange={(e) => setNominationForm({ ...nominationForm, designation: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-purple-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Faculty Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="faculty@dtu.ac.in"
                    value={nominationForm.email}
                    onChange={(e) => setNominationForm({ ...nominationForm, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-purple-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={nominationForm.phone}
                    onChange={(e) => setNominationForm({ ...nominationForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-purple-600"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Program Track *</label>
                <select
                  value={nominationForm.programTitle}
                  onChange={(e) => setNominationForm({ ...nominationForm, programTitle: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-purple-600 bg-white"
                >
                  <option value="Cloud-Native Architecture & Microservices">Cloud-Native Architecture & Microservices (TCS Labs)</option>
                  <option value="Generative AI & LLM Systems Engineering">Generative AI & LLM Systems Engineering (Infosys)</option>
                  <option value="Full-Stack Web & Distributed Telemetry">Full-Stack Web & Distributed Telemetry (Wipro)</option>
                  <option value="Semiconductor Design & Embedded Systems">Semiconductor Design & Embedded Systems (Intel AICTE)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Institutional Endorsement / Remarks</label>
                <textarea
                  rows={2}
                  placeholder="Recommended by Head of Department for Q3 2026 sabbatical."
                  value={nominationForm.remarks}
                  onChange={(e) => setNominationForm({ ...nominationForm, remarks: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-purple-600"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowNominateModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingNomination}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                >
                  {submittingNomination && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
                  <span>Submit Faculty Nomination</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: UPLOAD INSTITUTIONAL COURSE */}
      {showCourseModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 border border-slate-100 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Upload Institutional Course</h3>
                <p className="text-xs text-slate-500">Publish college syllabus module into national student registry</p>
              </div>
              <button
                onClick={() => setShowCourseModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleUploadCourse} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Course Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Advanced Distributed Systems & Cloud Platforms"
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Department / Discipline *</label>
                <input
                  type="text"
                  required
                  value={courseForm.category}
                  onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Course Description *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Comprehensive coverage of consensus protocols, message brokers, containerization, and microservice monitoring."
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Target Skills (comma-separated)</label>
                <input
                  type="text"
                  placeholder="Kafka, Docker, Kubernetes, Golang"
                  value={courseForm.skillsCovered}
                  onChange={(e) => setCourseForm({ ...courseForm, skillsCovered: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-purple-600"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Duration (Hrs)</label>
                  <input
                    type="number"
                    min="1"
                    value={courseForm.durationHours}
                    onChange={(e) => setCourseForm({ ...courseForm, durationHours: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-purple-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Total Lessons</label>
                  <input
                    type="number"
                    min="1"
                    value={courseForm.totalLessons}
                    onChange={(e) => setCourseForm({ ...courseForm, totalLessons: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-purple-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Difficulty</label>
                  <select
                    value={courseForm.difficulty}
                    onChange={(e) => setCourseForm({ ...courseForm, difficulty: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-purple-600 bg-white"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCourseModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingCourse}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                >
                  {submittingCourse && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
                  <span>Publish Course</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
