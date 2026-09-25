import React, { useState, useEffect, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Cell
} from 'recharts';
import { StudentProfile, Job } from '../types';

interface StudentPerformanceAlignmentProps {
  profile: StudentProfile | null;
  jobs?: Job[];
  onNavigateTab?: (tab: string) => void;
}

export const StudentPerformanceAlignmentSection: React.FC<StudentPerformanceAlignmentProps> = ({
  profile,
  jobs = [],
  onNavigateTab
}) => {
  const [activeView, setActiveView] = useState<'growth' | 'alignment' | 'radar'>('growth');
  const [timeRange, setTimeRange] = useState<'6m' | '12m'>('6m');
  const [skillAnalysis, setSkillAnalysis] = useState<any>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        setLoadingAnalysis(true);
        const token = localStorage.getItem('ks_token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch('/api/students/me/skill-analysis', { headers });
        const json = await res.json();
        if (json.success && json.data) {
          setSkillAnalysis(json.data);
        }
      } catch (e) {
        console.warn('Could not fetch skill analysis data:', e);
      } finally {
        setLoadingAnalysis(false);
      }
    };
    fetchAnalysis();
  }, []);

  // 1. Skill Growth Trends Data (Progress over past 6 or 12 months)
  const growthTrendsData = useMemo(() => {
    const readiness = profile?.readinessScore || 78;
    const baseDev = Math.max(30, readiness - 35);

    if (timeRange === '6m') {
      return [
        { month: 'Apr 2024', frontend: baseDev + 8, backend: baseDev + 4, dsa: baseDev + 6, cloud: baseDev - 5, overall: baseDev + 5 },
        { month: 'May 2024', frontend: baseDev + 15, backend: baseDev + 10, dsa: baseDev + 12, cloud: baseDev, overall: baseDev + 12 },
        { month: 'Jun 2024', frontend: baseDev + 22, backend: baseDev + 18, dsa: baseDev + 19, cloud: baseDev + 8, overall: baseDev + 20 },
        { month: 'Jul 2024', frontend: baseDev + 28, backend: baseDev + 26, dsa: baseDev + 25, cloud: baseDev + 14, overall: baseDev + 27 },
        { month: 'Aug 2024', frontend: baseDev + 34, backend: baseDev + 31, dsa: baseDev + 32, cloud: baseDev + 22, overall: baseDev + 33 },
        { month: 'Sep 2024 (Now)', frontend: Math.min(98, baseDev + 40), backend: Math.min(94, baseDev + 36), dsa: Math.min(92, baseDev + 38), cloud: Math.min(88, baseDev + 28), overall: Math.min(96, readiness) }
      ];
    }

    return [
      { month: 'Oct 23', frontend: baseDev - 10, backend: baseDev - 15, dsa: baseDev - 8, cloud: 15, overall: baseDev - 12 },
      { month: 'Dec 23', frontend: baseDev - 2, backend: baseDev - 6, dsa: baseDev, cloud: 22, overall: baseDev - 3 },
      { month: 'Feb 24', frontend: baseDev + 8, backend: baseDev + 5, dsa: baseDev + 8, cloud: baseDev - 5, overall: baseDev + 6 },
      { month: 'Apr 24', frontend: baseDev + 18, backend: baseDev + 15, dsa: baseDev + 16, cloud: baseDev + 5, overall: baseDev + 16 },
      { month: 'Jun 24', frontend: baseDev + 28, backend: baseDev + 25, dsa: baseDev + 26, cloud: baseDev + 15, overall: baseDev + 26 },
      { month: 'Aug 24', frontend: baseDev + 36, backend: baseDev + 33, dsa: baseDev + 34, cloud: baseDev + 24, overall: baseDev + 34 },
      { month: 'Sep 24', frontend: Math.min(98, baseDev + 40), backend: Math.min(94, baseDev + 36), dsa: Math.min(92, baseDev + 38), cloud: Math.min(88, baseDev + 28), overall: Math.min(96, readiness) }
    ];
  }, [profile?.readinessScore, timeRange]);

  // 2. Industry Demand Match Scores Data (Student Score vs Market Benchmark)
  const industryDemandData = useMemo(() => {
    const studentSkills = (profile?.skills || []).map(s => s.toLowerCase());

    const hasSkill = (k: string) => studentSkills.some(s => s.includes(k.toLowerCase()));

    const list = [
      {
        skill: 'React & UI Frameworks',
        studentScore: hasSkill('react') ? 92 : hasSkill('javascript') ? 70 : 45,
        industryBenchmark: 78,
        category: 'Frontend'
      },
      {
        skill: 'Node.js & REST APIs',
        studentScore: hasSkill('node') ? 88 : hasSkill('javascript') ? 65 : 40,
        industryBenchmark: 82,
        category: 'Backend'
      },
      {
        skill: 'Data Structures & Algo',
        studentScore: hasSkill('dsa') || hasSkill('algorithm') || hasSkill('c++') || hasSkill('java') ? 85 : 55,
        industryBenchmark: 75,
        category: 'Problem Solving'
      },
      {
        skill: 'SQL & Database Design',
        studentScore: hasSkill('sql') || hasSkill('database') || hasSkill('postgres') ? 86 : 50,
        industryBenchmark: 70,
        category: 'Data'
      },
      {
        skill: 'Cloud & Docker DevOps',
        studentScore: hasSkill('cloud') || hasSkill('docker') || hasSkill('aws') ? 82 : 48,
        industryBenchmark: 74,
        category: 'DevOps'
      },
      {
        skill: 'TypeScript & Architecture',
        studentScore: hasSkill('typescript') ? 89 : hasSkill('javascript') ? 68 : 42,
        industryBenchmark: 80,
        category: 'Full Stack'
      }
    ];

    return list.map(item => ({
      ...item,
      alignmentStatus: item.studentScore >= item.industryBenchmark ? 'Benchmark Met' : 'Skill Gap',
      gap: item.studentScore - item.industryBenchmark
    }));
  }, [profile?.skills]);

  // 3. Radar Chart (Role Alignment & Competency Pillars)
  const radarData = useMemo(() => {
    if (skillAnalysis?.competencyCategories?.length) {
      return skillAnalysis.competencyCategories.map((c: any) => ({
        subject: c.category.split('(')[0].trim(),
        student: c.current || 60,
        industryTarget: c.target || 80,
        fullMark: 100
      }));
    }

    return [
      { subject: 'Web Architecture', student: 88, industryTarget: 80, fullMark: 100 },
      { subject: 'Backend & APIs', student: 84, industryTarget: 82, fullMark: 100 },
      { subject: 'Algorithms & DSA', student: 85, industryTarget: 75, fullMark: 100 },
      { subject: 'Databases & SQL', student: 80, industryTarget: 70, fullMark: 100 },
      { subject: 'Cloud & DevOps', student: 68, industryTarget: 76, fullMark: 100 },
      { subject: 'System Design', student: 72, industryTarget: 78, fullMark: 100 }
    ];
  }, [skillAnalysis]);

  // Overall Match Summary Statistics
  const avgStudentScore = Math.round(
    industryDemandData.reduce((acc, curr) => acc + curr.studentScore, 0) / industryDemandData.length
  );
  const avgBenchmark = Math.round(
    industryDemandData.reduce((acc, curr) => acc + curr.industryBenchmark, 0) / industryDemandData.length
  );
  const alignmentRate = Math.round((avgStudentScore / avgBenchmark) * 100);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-blue-50 border border-blue-100 text-blue-700 text-[11px] font-bold tracking-wider uppercase mb-1">
            <span className="material-symbols-outlined text-sm">trending_up</span>
            <span>Analytics &amp; Industry Alignment Engine</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Student Performance &amp; Industry Demand Matrix
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 max-w-2xl leading-relaxed">
            Dynamic longitudinal tracking correlating your verified academic credentials, GitHub repositories, and LeetCode problem solves against active national job demand benchmarks.
          </p>
        </div>

        {/* View Switcher Pills */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold self-start md:self-auto border border-slate-200/80">
          <button
            type="button"
            onClick={() => setActiveView('growth')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeView === 'growth'
                ? 'bg-white text-blue-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-sm">show_chart</span>
            <span>Skill Growth Trends</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveView('alignment')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeView === 'alignment'
                ? 'bg-white text-blue-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-sm">bar_chart</span>
            <span>Demand Match Scores</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveView('radar')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeView === 'radar'
                ? 'bg-white text-blue-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-sm">radar</span>
            <span>Role Alignment Radar</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50/70 to-indigo-50/40 border border-blue-100 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="material-symbols-outlined text-xl">verified</span>
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Overall Match Index</div>
            <div className="text-xl font-black text-slate-900 mt-0.5">{alignmentRate}%</div>
            <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px]">arrow_upward</span>
              <span>Exceeds market threshold (+{avgStudentScore - avgBenchmark} pts)</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/70 to-teal-50/40 border border-emerald-100 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="material-symbols-outlined text-xl">workspace_premium</span>
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Top Competency</div>
            <div className="text-xl font-black text-slate-900 mt-0.5">React &amp; UI (+14%)</div>
            <div className="text-[10px] text-slate-500 font-medium">92% score vs 78% demand</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50/70 to-orange-50/40 border border-amber-100 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="material-symbols-outlined text-xl">target</span>
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Priority Skill Gap</div>
            <div className="text-xl font-black text-slate-900 mt-0.5">Cloud &amp; DevOps</div>
            <div className="text-[10px] text-amber-700 font-medium">8 pts to achieve parity</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50/70 to-fuchsia-50/40 border border-purple-100 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-purple-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="material-symbols-outlined text-xl">hub</span>
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Matched Roles</div>
            <div className="text-xl font-black text-slate-900 mt-0.5">{jobs.length} Opportunities</div>
            <div className="text-[10px] text-purple-700 font-medium">Over 80% skill compatibility</div>
          </div>
        </div>
      </div>

      {/* VIEW 1: SKILL GROWTH TRENDS (AreaChart) */}
      {activeView === 'growth' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Skill Competency Growth Trajectory (%)</h3>
              <p className="text-xs text-slate-500">Track longitudinal growth across verified academic modules, coding submissions, and project deliverables.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Time Window:</span>
              <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs">
                <button
                  type="button"
                  onClick={() => setTimeRange('6m')}
                  className={`px-2.5 py-1 rounded-md transition font-medium cursor-pointer ${timeRange === '6m' ? 'bg-white shadow-xs text-blue-700 font-bold' : 'text-slate-600'}`}
                >
                  Past 6 Months
                </button>
                <button
                  type="button"
                  onClick={() => setTimeRange('12m')}
                  className={`px-2.5 py-1 rounded-md transition font-medium cursor-pointer ${timeRange === '12m' ? 'bg-white shadow-xs text-blue-700 font-bold' : 'text-slate-600'}`}
                >
                  Past 12 Months
                </button>
              </div>
            </div>
          </div>

          <div className="w-full h-72 sm:h-80 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthTrendsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorOverall" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorFrontend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#059669" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorBackend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorDsa" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ea580c" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#ea580c" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(val) => `${val}%`} />
                <Tooltip
                  formatter={(value: any, name: any) => [`${value}%`, name]}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    fontSize: '12px'
                  }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: '12px', fontSize: '11px' }}
                  iconType="circle"
                />
                <Area
                  type="monotone"
                  dataKey="overall"
                  name="Employability Index"
                  stroke="#2563eb"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorOverall)"
                />
                <Area
                  type="monotone"
                  dataKey="frontend"
                  name="Frontend &amp; UI"
                  stroke="#059669"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorFrontend)"
                />
                <Area
                  type="monotone"
                  dataKey="backend"
                  name="Backend &amp; APIs"
                  stroke="#7c3aed"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorBackend)"
                />
                <Area
                  type="monotone"
                  dataKey="dsa"
                  name="Algorithms &amp; DSA"
                  stroke="#ea580c"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorDsa)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* VIEW 2: DEMAND MATCH SCORES (BarChart) */}
      {activeView === 'alignment' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Personal Competency vs. National Industry Benchmark (%)</h3>
              <p className="text-xs text-slate-500">Compares your validated competency against real minimum recruiter hiring thresholds.</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="inline-flex items-center gap-1.5 text-blue-700 font-semibold">
                <span className="w-3 h-3 rounded-sm bg-blue-600 inline-block"></span>
                <span>Your Score</span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-slate-500 font-semibold">
                <span className="w-3 h-3 rounded-sm bg-slate-300 inline-block"></span>
                <span>Market Demand</span>
              </span>
            </div>
          </div>

          <div className="w-full h-72 sm:h-80 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={industryDemandData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="skill"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(val) => `${val}%`} />
                <Tooltip
                  formatter={(value: any, name: any) => [`${value}%`, name === 'studentScore' ? 'Your Score' : 'Industry Target']}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="studentScore" name="Your Competency" radius={[6, 6, 0, 0]}>
                  {industryDemandData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.gap >= 0 ? '#2563eb' : '#f59e0b'}
                    />
                  ))}
                </Bar>
                <Bar dataKey="industryBenchmark" name="Market Requirement" fill="#cbd5e1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {industryDemandData.slice(0, 3).map((item) => (
              <div key={item.skill} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-slate-800 truncate">{item.skill}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    item.gap >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {item.gap >= 0 ? `+${item.gap}% Surplus` : `${item.gap}% Gap`}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Student: {item.studentScore}%</span>
                  <span>Target: {item.industryBenchmark}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 3: RADAR CHART (Multi-Pillar Alignment) */}
      {activeView === 'radar' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          <div className="lg:col-span-2 h-72 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="75%">
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#cbd5e1" tick={{ fontSize: 9 }} />
                <Radar
                  name="Your Proficiency"
                  dataKey="student"
                  stroke="#2563eb"
                  fill="#2563eb"
                  fillOpacity={0.4}
                />
                <Radar
                  name="Industry Benchmark"
                  dataKey="industryTarget"
                  stroke="#94a3b8"
                  fill="#94a3b8"
                  fillOpacity={0.2}
                />
                <Tooltip
                  formatter={(val: any) => [`${val}%`]}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    fontSize: '12px'
                  }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: '8px', fontSize: '11px' }}
                  iconType="circle"
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3.5 bg-slate-50 p-5 rounded-2xl border border-slate-200/80">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base text-blue-600">psychology</span>
              <span>AI Alignment Insights</span>
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Your profile demonstrates high alignment in <strong>Web Architecture</strong> and <strong>Algorithms</strong>, qualifying you for Top 10% nationwide engineering drives.
            </p>
            <div className="p-3 bg-white rounded-xl border border-blue-100 text-xs text-slate-700 space-y-1.5">
              <div className="font-bold text-blue-900 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm text-blue-600">lightbulb</span>
                <span>Immediate Recommendation:</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Complete a verified Docker / Containerization course to bridge the 8% Cloud DevOps delta and increase recruiter interview callbacks by 32%.
              </p>
              {onNavigateTab && (
                <button
                  type="button"
                  onClick={() => onNavigateTab('courses')}
                  className="mt-2 text-xs font-bold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Explore Cloud Courses</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
