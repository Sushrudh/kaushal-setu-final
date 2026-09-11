import React from 'react';
import { StudentProfile } from '../types';

interface StudentAnalyticsViewProps {
  profile: StudentProfile | null;
  onNavigateTab: (tab: string) => void;
}

export const StudentAnalyticsView: React.FC<StudentAnalyticsViewProps> = ({ profile, onNavigateTab }) => {
  const readiness = profile?.readinessScore || 86;
  const skills = profile?.skills || ['React', 'TypeScript', 'Node.js', 'SQL', 'Git', 'Cloud Architecture'];

  // Domain breakdown calculation
  const domains = [
    { name: 'Web & UI Engineering', score: 92, benchmark: 74, color: 'bg-blue-600', text: 'text-blue-700' },
    { name: 'Backend & APIs', score: 88, benchmark: 68, color: 'bg-indigo-600', text: 'text-indigo-700' },
    { name: 'Databases & Query Tuning', score: 80, benchmark: 62, color: 'bg-emerald-600', text: 'text-emerald-700' },
    { name: 'Cloud & Infrastructure', score: 75, benchmark: 54, color: 'bg-purple-600', text: 'text-purple-700' },
    { name: 'System Design & Algorithms', score: 84, benchmark: 70, color: 'bg-amber-600', text: 'text-amber-700' }
  ];

  const monthlyActivity = [
    { month: 'Nov', hours: 18, benchmark: 12 },
    { month: 'Dec', hours: 26, benchmark: 14 },
    { month: 'Jan', hours: 38, benchmark: 18 },
    { month: 'Feb', hours: 44, benchmark: 20 },
    { month: 'Mar', hours: 52, benchmark: 22 }
  ];

  return (
    <div id="student-analytics-insights" className="space-y-6">
      {/* Top Banner: Employability Readiness Index */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
              National Employability Benchmark
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-1">Student Competency &amp; Placement Analytics</h2>
            <p className="text-xs text-slate-500 max-w-xl">
              Real-time algorithmic scoring calculated from verified DigiLocker transcripts, GitHub capstones, diagnostic assessments, and NCrF course credits.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-200"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-blue-600"
                  strokeDasharray={`${readiness}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-sm font-black text-slate-900">{readiness}%</span>
              </div>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Readiness Tier</span>
              <span className="text-xs font-black text-emerald-700">Tier-1 (Industry Ready)</span>
              <p className="text-[10px] text-slate-500 mt-0.5">Top 8% nationwide among CS graduates</p>
            </div>
          </div>
        </div>

        {/* 4 Index Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-bold text-blue-900">Academic Verification</span>
              <span className="font-bold text-blue-700">25/25</span>
            </div>
            <p className="text-[11px] text-slate-500">DigiLocker NAD cryptographic seal active</p>
            <div className="mt-2 w-full bg-blue-200/60 h-1.5 rounded-full overflow-hidden">
              <div className="bg-blue-600 h-full rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-bold text-indigo-900">Capstone Portfolio</span>
              <span className="font-bold text-indigo-700">22/25</span>
            </div>
            <p className="text-[11px] text-slate-500">Live projects &amp; GitHub source verified</p>
            <div className="mt-2 w-full bg-indigo-200/60 h-1.5 rounded-full overflow-hidden">
              <div className="bg-indigo-600 h-full rounded-full" style={{ width: '88%' }}></div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-bold text-purple-900">Course Milestones</span>
              <span className="font-bold text-purple-700">20/25</span>
            </div>
            <p className="text-[11px] text-slate-500">Accredited modules completed</p>
            <div className="mt-2 w-full bg-purple-200/60 h-1.5 rounded-full overflow-hidden">
              <div className="bg-purple-600 h-full rounded-full" style={{ width: '80%' }}></div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-bold text-emerald-900">Diagnostic Blitz</span>
              <span className="font-bold text-emerald-700">19/25</span>
            </div>
            <p className="text-[11px] text-slate-500">Algorithmic &amp; technical assessment</p>
            <div className="mt-2 w-full bg-emerald-200/60 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-600 h-full rounded-full" style={{ width: '76%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Domain Comparison Chart */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Technical Domain Proficiency vs. National Cohort</h3>
                <p className="text-xs text-slate-500">Benchmarked against 45,000+ registered engineering candidates.</p>
              </div>
            </div>

            <div className="space-y-4 mt-6">
              {domains.map((dom) => (
                <div key={dom.name} className="space-y-1.5">
                  <div className="flex justify-between items-baseline text-xs">
                    <span className="font-bold text-slate-800">{dom.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-slate-400">Natl Avg: {dom.benchmark}%</span>
                      <span className={`font-bold ${dom.text}`}>{dom.score}%</span>
                    </div>
                  </div>

                  {/* Relative comparative bar chart */}
                  <div className="relative w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                    {/* National average marker */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-slate-400 z-10"
                      style={{ left: `${dom.benchmark}%` }}
                      title={`National Average: ${dom.benchmark}%`}
                    ></div>
                    {/* Student bar */}
                    <div
                      className={`${dom.color} h-full rounded-full transition-all duration-500`}
                      style={{ width: `${dom.score}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-end gap-4 text-[11px] text-slate-500">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-2 rounded bg-blue-600"></span>
                <span>Your Score</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                <span>National Average Marker</span>
              </div>
            </div>
          </div>
        </div>

        {/* Growth Velocity & Study Trajectory Chart */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Monthly Learning Hours Trajectory</h3>
                <p className="text-xs text-slate-500">Hours invested across project coding and accredited coursework.</p>
              </div>
            </div>

            {/* Vertical Bar Chart */}
            <div className="h-52 flex items-end justify-between gap-4 pt-6 px-4 pb-2 border-b border-slate-200">
              {monthlyActivity.map((item) => (
                <div key={item.month} className="flex-grow flex flex-col items-center gap-2 group">
                  <span className="text-[10px] font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.hours} hrs
                  </span>
                  <div className="w-full max-w-[40px] flex items-end justify-center gap-1 h-36">
                    {/* Benchmark bar */}
                    <div
                      className="w-1/2 bg-slate-200 rounded-t-md transition-all"
                      style={{ height: `${(item.benchmark / 60) * 100}%` }}
                      title={`Peer Average: ${item.benchmark} hrs`}
                    ></div>
                    {/* Student bar */}
                    <div
                      className="w-1/2 bg-gradient-to-t from-blue-700 to-indigo-600 rounded-t-md transition-all group-hover:brightness-110"
                      style={{ height: `${(item.hours / 60) * 100}%` }}
                      title={`Your Hours: ${item.hours} hrs`}
                    ></div>
                  </div>
                  <span className="text-xs font-semibold text-slate-600">{item.month}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between text-[11px] text-slate-500">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-blue-600"></span>
                <span>Your Hours Logged</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-slate-300"></span>
                <span>Cohort Baseline</span>
              </div>
              <span className="text-emerald-600 font-bold">+36% Growth MoM</span>
            </div>
          </div>
        </div>
      </div>

      {/* Strategic Gap Closure Recommendation */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300 bg-blue-800/40 px-2.5 py-1 rounded border border-blue-400/30">
              AI Placement Optimizer
            </span>
            <h3 className="text-lg font-bold text-white mt-1">
              Boost Your Placement Match Rate by +18%
            </h3>
            <p className="text-xs text-slate-300 max-w-xl">
              Employers posting Full Stack &amp; Cloud roles frequently filter by <strong>Docker &amp; Containerization</strong>.
              Completing the AICTE Cloud micro-course will automatically unlock 5 new high-stipend opportunities.
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('courses')}
            className="px-5 py-3 bg-white text-slate-900 hover:bg-slate-100 rounded-xl text-xs font-bold shadow-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            Enroll in Cloud Track →
          </button>
        </div>
      </div>
    </div>
  );
};
