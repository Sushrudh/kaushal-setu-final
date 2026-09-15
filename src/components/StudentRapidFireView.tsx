import React, { useState, useEffect } from 'react';
import { RapidFireAssessment } from '../types';

interface StudentRapidFireViewProps {
  onAssessmentCompleted?: () => void;
}

const AVAILABLE_TECH_SKILLS = [
  'React', 'TypeScript', 'Node.js', 'Python', 'Java', 'C++', 'SQL & Databases',
  'Docker & Containers', 'Cloud Computing (AWS/GCP)', 'REST APIs', 'Git & CI/CD',
  'Data Structures & Algorithms', 'Machine Learning & AI', 'Next.js', 'TailwindCSS'
];

const TARGET_LEARNING_SKILLS = [
  'Kubernetes & Microservices', 'Distributed Systems', 'System Design', 'Generative AI / LLMs',
  'GraphQL', 'Cybersecurity & OAuth', 'Rust', 'Cloud Native DevOps', 'Apache Kafka'
];

export const StudentRapidFireView: React.FC<StudentRapidFireViewProps> = ({ onAssessmentCompleted }) => {
  const [existingData, setExistingData] = useState<RapidFireAssessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [mode, setMode] = useState<'view' | 'quiz'>('quiz');
  const [successNotice, setSuccessNotice] = useState('');

  // Form State
  const [workedSkills, setWorkedSkills] = useState<string[]>(['React', 'TypeScript', 'Node.js']);
  const [learnSkills, setLearnSkills] = useState<string[]>(['Kubernetes & Microservices', 'System Design']);
  const [hasRealWorldProjects, setHasRealWorldProjects] = useState<'Yes' | 'No'>('Yes');
  const [hasHackathons, setHasHackathons] = useState<'Yes' | 'No'>('Yes');
  const [primaryInterest, setPrimaryInterest] = useState('Full Stack & Cloud Architecture');

  // Interactive 4-Question Diagnostic Blitz
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [diagnosticScore, setDiagnosticScore] = useState<number | null>(null);

  const diagnosticQuestions = [
    {
      id: 1,
      domain: 'Data Structures & Algorithms',
      question: 'Which algorithmic pattern is best suited for solving the Longest Common Subsequence problem efficiently?',
      options: ['Greedy Approach', 'Dynamic Programming', 'Simple Linear Scan', 'Backtracking with O(2^N) recursion'],
      correct: 'Dynamic Programming'
    },
    {
      id: 2,
      domain: 'Systems & Backend',
      question: 'How does an HTTP/2 protocol multiplex several requests over a single TCP connection?',
      options: ['Using Binary Framing Layers into independent streams', 'Opening 6 separate sockets in parallel', 'Long polling the socket repeatedly', 'Base64 encoding headers'],
      correct: 'Using Binary Framing Layers into independent streams'
    },
    {
      id: 3,
      domain: 'Database Engineering',
      question: 'What is the primary benefit of a B-Tree index structure over an unindexed heap scan?',
      options: ['O(log N) lookup complexity for range and equality queries', 'Compresses data into zero bytes', 'Eliminates all foreign key constraints', 'Forces table locks'],
      correct: 'O(log N) lookup complexity for range and equality queries'
    },
    {
      id: 4,
      domain: 'Modern Cloud Architecture',
      question: 'In containerized microservices, which concept ensures automated discovery, health probing, and ingress load distribution?',
      options: ['Service Mesh / Kubernetes Ingress Controller', 'Hardcoding IP addresses in environment variables', 'Manual SSH restart scripts', 'DNS cache pinning'],
      correct: 'Service Mesh / Kubernetes Ingress Controller'
    }
  ];

  const fetchAssessment = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('ks_token');
      const headers: Record<string, string> = token ? { 'Authorization': `Bearer ${token}` } : {};
      const res = await fetch('/api/students/me/rapid-fire', { headers });
      const json = await res.json();
      if (json.success && json.data) {
        setExistingData(json.data);
        if (json.data.worked_skills) setWorkedSkills(json.data.worked_skills);
        if (json.data.learn_skills) setLearnSkills(json.data.learn_skills);
        if (json.data.has_real_world_projects) setHasRealWorldProjects(json.data.has_real_world_projects);
        if (json.data.has_hackathons) setHasHackathons(json.data.has_hackathons);
        if (json.data.primary_interest) setPrimaryInterest(json.data.primary_interest);
        setMode('view');
      } else {
        setMode('quiz');
      }
    } catch (e) {
      console.error('Failed to fetch assessment data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessment();
  }, []);

  const toggleWorkedSkill = (skill: string) => {
    setWorkedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const toggleLearnSkill = (skill: string) => {
    setLearnSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (workedSkills.length === 0) {
      alert('Please select at least one skill you have worked with.');
      return;
    }

    // Calculate score
    let score = 0;
    diagnosticQuestions.forEach((q) => {
      if (quizAnswers[q.id] === q.correct) score += 25;
    });
    setDiagnosticScore(score);
    setQuizSubmitted(true);
    setSubmitting(true);

    try {
      const token = localStorage.getItem('ks_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      };

      const payload = {
        workedSkills,
        learnSkills,
        hasRealWorldProjects,
        hasHackathons,
        primaryInterest,
        score
      };

      const res = await fetch('/api/students/me/rapid-fire', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (json.success) {
        setSuccessNotice('Skill assessment synced! Your verified competencies and readiness score have been upgraded in the National Talent Pool.');
        setExistingData({
          worked_skills: workedSkills,
          learn_skills: learnSkills,
          has_real_world_projects: hasRealWorldProjects,
          has_hackathons: hasHackathons,
          primary_interest: primaryInterest,
          completed_at: new Date().toISOString()
        });
        if (onAssessmentCompleted) onAssessmentCompleted();
      }
    } catch (e) {
      console.error('Failed to submit rapid fire assessment', e);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-xs text-slate-500">Checking assessment records...</p>
      </div>
    );
  }

  return (
    <div id="student-rapid-fire-assessment" className="space-y-6 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30">
              <span className="material-symbols-outlined text-xs">bolt</span>
              NASSCOM FutureSkills Aligned
            </span>
            <h2 className="text-2xl font-black text-white mt-2">Rapid-Fire Diagnostic Assessment</h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Complete this 3-minute diagnostic to instantly verify your hands-on coding skills, benchmark against industry requirements, and boost your internship matching algorithm.
            </p>
          </div>

          {existingData && mode === 'view' && (
            <button
              onClick={() => {
                setMode('quiz');
                setQuizSubmitted(false);
                setSuccessNotice('');
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer whitespace-nowrap"
            >
              ↻ Retake Assessment
            </button>
          )}
        </div>
      </div>

      {/* Success Notice */}
      {successNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-600">verified</span>
            <span>{successNotice}</span>
          </div>
          <button onClick={() => setSuccessNotice('')} className="text-emerald-700 hover:text-emerald-900">✕</button>
        </div>
      )}

      {/* View Mode: Previously Submitted Overview */}
      {mode === 'view' && existingData && !quizSubmitted && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                Verified Diagnostic Dossier
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-2">Active Student Skill Validation</h3>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400">Validated On:</span>
              <p className="text-xs font-semibold text-slate-700">
                {existingData.completed_at ? new Date(existingData.completed_at).toLocaleDateString() : 'Recently'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Verified Hands-on Skills ({existingData.worked_skills?.length || 0})
              </h4>
              <div className="flex flex-wrap gap-2">
                {(existingData.worked_skills || []).map((sk) => (
                  <span
                    key={sk}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold"
                  >
                    <span className="material-symbols-outlined text-xs text-blue-600">check</span>
                    {sk}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Target Upskilling Pipeline ({existingData.learn_skills?.length || 0})
              </h4>
              <div className="flex flex-wrap gap-2">
                {(existingData.learn_skills || []).map((sk) => (
                  <span
                    key={sk}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-50 border border-purple-200 text-purple-800 text-xs font-semibold"
                  >
                    <span className="material-symbols-outlined text-xs text-purple-600">north_east</span>
                    {sk}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Primary Track</span>
              <p className="text-sm font-bold text-slate-900 mt-1">{existingData.primary_interest || 'Full Stack Engineering'}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Real-world Projects</span>
              <p className="text-sm font-bold text-emerald-700 mt-1">
                {existingData.has_real_world_projects === 'Yes' ? '✓ Verified in Repository' : 'In Progress'}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hackathons &amp; Sprints</span>
              <p className="text-sm font-bold text-blue-700 mt-1">
                {existingData.has_hackathons === 'Yes' ? '✓ Participant / Contributor' : 'Not yet'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quiz / Form Mode */}
      {(mode === 'quiz' || !existingData) && (
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-8">
          {/* Step 1: Technical Experience */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">1</span>
              <h3 className="text-base font-bold text-slate-900">What technical skills have you actively coded with?</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Select all technologies you have implemented in coursework, internships, or personal projects. These will be added to your verified profile.
            </p>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_TECH_SKILLS.map((sk) => {
                const active = workedSkills.includes(sk);
                return (
                  <button
                    key={sk}
                    type="button"
                    onClick={() => toggleWorkedSkill(sk)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      active
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {active ? '✓ ' : '+ '} {sk}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Learning Ambitions */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">2</span>
              <h3 className="text-base font-bold text-slate-900">What technologies are you looking to master next?</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Our AI engine matches you with courses that fill the gap between your current skills and target dream roles.
            </p>
            <div className="flex flex-wrap gap-2">
              {TARGET_LEARNING_SKILLS.map((sk) => {
                const active = learnSkills.includes(sk);
                return (
                  <button
                    key={sk}
                    type="button"
                    onClick={() => toggleLearnSkill(sk)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      active
                        ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {active ? '✓ ' : '+ '} {sk}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Experience Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Built Real-World Projects?</label>
              <select
                value={hasRealWorldProjects}
                onChange={(e) => setHasRealWorldProjects(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-900 focus:outline-none focus:border-blue-600"
              >
                <option value="Yes">Yes, deployed apps</option>
                <option value="No">Not yet, still learning</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Participated in Hackathons?</label>
              <select
                value={hasHackathons}
                onChange={(e) => setHasHackathons(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-900 focus:outline-none focus:border-blue-600"
              >
                <option value="Yes">Yes, at least 1</option>
                <option value="No">No, haven't yet</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Primary Domain Interest</label>
              <select
                value={primaryInterest}
                onChange={(e) => setPrimaryInterest(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-900 focus:outline-none focus:border-blue-600"
              >
                <option value="Full Stack & Cloud Architecture">Full Stack &amp; Cloud</option>
                <option value="AI / Machine Learning & Data">AI / ML &amp; Data Science</option>
                <option value="DevOps & Site Reliability">DevOps &amp; Infrastructure</option>
                <option value="Mobile Development (Flutter/React Native)">Mobile Engineering</option>
                <option value="Cybersecurity & Network Systems">Cybersecurity</option>
              </select>
            </div>
          </div>

          {/* Step 4: Rapid Diagnostic Quiz */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">4</span>
              <h3 className="text-base font-bold text-slate-900">4-Question Technical Diagnostic Blitz</h3>
            </div>
            <p className="text-xs text-slate-500">
              Answer these fundamental conceptual questions to validate your tier rating.
            </p>

            <div className="space-y-4">
              {diagnosticQuestions.map((q, qIndex) => (
                <div key={q.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                      {q.domain}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">Q{qIndex + 1} of 4</span>
                  </div>
                  <p className="text-xs font-bold text-slate-900 mb-3">{q.question}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options.map((opt) => (
                      <label
                        key={opt}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                          quizAnswers[q.id] === opt
                            ? 'border-blue-600 bg-blue-50/90 font-bold text-blue-950'
                            : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`rapid-q-${q.id}`}
                          value={opt}
                          checked={quizAnswers[q.id] === opt}
                          onChange={() => setQuizAnswers({ ...quizAnswers, [q.id]: opt })}
                          required
                          className="text-blue-600"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Selected: <strong className="text-slate-800">{workedSkills.length} Verified Skills</strong>
            </span>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              {submitting && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
              <span>Submit Assessment &amp; Sync Skill Matrix →</span>
            </button>
          </div>
        </form>
      )}

      {/* Result Modal / Feedback if just submitted */}
      {quizSubmitted && diagnosticScore !== null && (
        <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-200 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto text-2xl font-black">
            ✓
          </div>
          <h3 className="text-lg font-bold text-emerald-950">Diagnostic Blitz Completed Successfully!</h3>
          <div className="text-3xl font-black text-emerald-700">{diagnosticScore}% Accuracy</div>
          <p className="text-xs text-slate-600 max-w-lg mx-auto">
            Your {workedSkills.length} selected technical competencies have been registered directly into your national verified record.
            Recruiters will now see your diagnostic endorsement when evaluating your internship applications.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setMode('view')}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              View Updated Competency Matrix →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
