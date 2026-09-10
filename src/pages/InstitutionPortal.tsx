import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export const InstitutionPortal: React.FC = () => {
  const { user, token, showToast, quickLoginAs } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 1420,
    verifiedPercent: 89,
    placementRate: 78,
    avgReadiness: 81
  });

  const [activeTab, setActiveTab] = useState<'overview' | 'curriculum' | 'students' | 'fdp'>('overview');
  const [students, setStudents] = useState<any[]>([]);

  useEffect(() => {
    // Demo student batch
    setStudents([
      { id: 1, name: 'Aarav Sharma', roll: '2022CSB1042', branch: 'Computer Science', score: 88, status: 'Shortlisted (Tata)', digilocker: true },
      { id: 2, name: 'Priya Patel', roll: '2022CSB1088', branch: 'Computer Science', score: 92, status: 'Interning (Infosys)', digilocker: true },
      { id: 3, name: 'Rohan Verma', roll: '2022ECE1019', branch: 'Electronics', score: 76, status: 'In Assessment', digilocker: true },
      { id: 4, name: 'Ananya Deshmukh', roll: '2022ME1005', branch: 'Mechanical', score: 84, status: 'Placed (Mahindra)', digilocker: true },
      { id: 5, name: 'Kavya Nair', roll: '2022CSB1104', branch: 'Computer Science', score: 90, status: 'Shortlisted (Wipro)', digilocker: true }
    ]);
  }, []);

  const downloadAccreditationReport = () => {
    showToast('NAAC & NBA NEP-2020 Compliance Summary generated successfully.', 'success');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Banner */}
      <section className="bg-slate-900 text-white border-b border-slate-800 pt-8 pb-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {!token && (
            <div className="mb-5 p-3 bg-purple-900/60 border border-purple-700/80 rounded-xl flex items-center justify-between text-xs">
              <span>Previewing Academic Institution Dashboard. Log in as verified nodal officer:</span>
              <button
                onClick={() => quickLoginAs('institution')}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 font-bold rounded-lg cursor-pointer"
              >
                Log In as IIT Delhi Dean
              </button>
            </div>
          )}

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-2xl">
                🏛️
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-white">Indian Institute of Technology Delhi</h1>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-400/30">
                    AISHE Code: U-0092
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Department of Training &amp; Placement • NIRF Rank #2 • NAAC A++ Accredited
                </p>
              </div>
            </div>

            <button
              onClick={downloadAccreditationReport}
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">download</span>
              <span>Export NAAC / NBA Telemetry</span>
            </button>
          </div>

          {/* Sub Tabs */}
          <div className="mt-8 flex items-center space-x-2 border-b border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-3 px-3 border-b-2 cursor-pointer ${
                activeTab === 'overview' ? 'border-purple-500 text-purple-400 font-bold' : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Placement &amp; Skill Telemetry
            </button>
            <button
              onClick={() => setActiveTab('curriculum')}
              className={`pb-3 px-3 border-b-2 cursor-pointer ${
                activeTab === 'curriculum' ? 'border-purple-500 text-purple-400 font-bold' : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Curriculum &amp; Industry Alignment
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`pb-3 px-3 border-b-2 cursor-pointer ${
                activeTab === 'students' ? 'border-purple-500 text-purple-400 font-bold' : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Student Cohort ({students.length})
            </button>
            <button
              onClick={() => setActiveTab('fdp')}
              className={`pb-3 px-3 border-b-2 cursor-pointer ${
                activeTab === 'fdp' ? 'border-purple-500 text-purple-400 font-bold' : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Faculty Industry Training (FDP)
            </button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-grow">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* 4 Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-xs text-slate-500 font-semibold uppercase">Enrolled Candidates</div>
                <div className="text-2xl font-black text-slate-900 mt-1">{stats.totalStudents}</div>
                <div className="text-[11px] text-emerald-600 font-bold mt-1">↑ 14% vs last academic year</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-xs text-slate-500 font-semibold uppercase">DigiLocker Verified</div>
                <div className="text-2xl font-black text-blue-700 mt-1">{stats.verifiedPercent}%</div>
                <div className="text-[11px] text-slate-400 mt-1">1,263 validated via NAD</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-xs text-slate-500 font-semibold uppercase">Average Employability</div>
                <div className="text-2xl font-black text-emerald-600 mt-1">{stats.avgReadiness}%</div>
                <div className="text-[11px] text-slate-400 mt-1">Top quartile nationally</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-xs text-slate-500 font-semibold uppercase">Placement Conversion</div>
                <div className="text-2xl font-black text-purple-700 mt-1">{stats.placementRate}%</div>
                <div className="text-[11px] text-emerald-600 font-bold mt-1">320 corporate offers issued</div>
              </div>
            </div>

            {/* Curriculum Gap vs Real World Demand */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-2">Automated Syllabus Gap Matrix</h3>
              <p className="text-xs text-slate-500 mb-4">
                Comparison of internal course syllabus versus real-time skill criteria from 24 corporate hiring partners:
              </p>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span>Cloud Architecture &amp; Microservices</span>
                    <span className="text-emerald-700 font-bold">92% Alignment</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full w-[92%]"></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span>Generative AI &amp; Vector Databases</span>
                    <span className="text-amber-700 font-bold">64% Alignment (Recommended Course Added)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-amber-500 h-2 rounded-full w-[64%]"></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span>DevOps, Docker &amp; CI/CD</span>
                    <span className="text-blue-700 font-bold">88% Alignment</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full w-[88%]"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'students' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-4">Student Placement &amp; Skill Registry</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Student Name</th>
                    <th className="p-3">Roll No.</th>
                    <th className="p-3">Branch</th>
                    <th className="p-3">Readiness</th>
                    <th className="p-3">DigiLocker</th>
                    <th className="p-3">Placement Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((st) => (
                    <tr key={st.id} className="hover:bg-slate-50">
                      <td className="p-3 font-semibold text-slate-900">{st.name}</td>
                      <td className="p-3 font-mono">{st.roll}</td>
                      <td className="p-3">{st.branch}</td>
                      <td className="p-3 font-bold text-blue-700">{st.score}%</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                          Verified
                        </span>
                      </td>
                      <td className="p-3 font-medium text-purple-700">{st.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {(activeTab === 'curriculum' || activeTab === 'fdp') && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center">
            <div className="w-12 h-12 bg-purple-100 text-purple-700 rounded-xl flex items-center justify-center mx-auto mb-3">
              <span className="material-symbols-outlined text-2xl">menu_book</span>
            </div>
            <h3 className="text-base font-bold text-slate-900">Faculty Development &amp; Curriculum Exchange</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Connect faculty members with corporate immersion programs, industrial training sabbaticals, and NEP 2020 multi-disciplinary modules.
            </p>
            <button
              onClick={() => showToast('Faculty development application initiated with AICTE Industry Cell.', 'success')}
              className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg text-xs font-bold cursor-pointer"
            >
              Apply for Industry Sabbatical
            </button>
          </div>
        )}
      </main>
    </div>
  );
};
