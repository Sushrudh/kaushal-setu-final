import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface SignupPageProps {
  setCurrentPage: (page: string) => void;
}

export const SignupPage: React.FC<SignupPageProps> = ({ setCurrentPage }) => {
  const { signup, showToast } = useAuth();

  const [role, setRole] = useState<'student' | 'institution' | 'industry'>('student');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [organization, setOrganization] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(true);
  const [apaarConsent, setApaarConsent] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!termsAgreed) {
      showToast('Please agree to the Terms of Service & Data Governance standards.', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showToast('Passwords do not match. Please re-enter.', 'error');
      return;
    }

    if (password.length < 8) {
      showToast('Password must be at least 8 characters long.', 'error');
      return;
    }

    setSubmitting(true);
    const res = await signup({
      role,
      fullName,
      email,
      phone,
      organization,
      identifier,
      password,
      apaarConsent
    });
    setSubmitting(false);

    if (res.success) {
      setCurrentPage(role);
    }
  };

  return (
    <div className="flex flex-col w-full bg-[#F8FAFC]">
      {/* Dark Atmospheric Hero Canvas matching Screen 10 & 11 visual tone */}
      <section className="relative bg-[#070d19] text-white pt-14 pb-44 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Radial Ambient Atmosphere Glows */}
        <div className="absolute top-0 left-1/4 -translate-x-1/2 w-96 h-96 bg-[#FF9933]/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-10 right-1/4 translate-x-1/2 w-96 h-96 bg-[#138808]/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative max-w-4xl mx-auto flex flex-col items-center text-center z-10">
          {/* Skill India Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-medium text-slate-300 shadow-inner mb-6 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>National Digital Skills Gateway • Skill India Aligned</span>
          </div>

          {/* Kaushal Setu Frosted Emblem Card */}
          <div className="mb-6 p-3 rounded-2xl bg-white/95 border border-white/30 shadow-2xl shadow-blue-900/20 backdrop-blur-md transition-transform hover:scale-102">
            <img
              alt="Kaushal Setu Emblem"
              className="h-16 md:h-20 w-auto object-contain"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDJzaf8isaUPE-z2dc51KOieSn9d9Mcal4CLcBHehs01VHfbY_fQzw539Vzn88frZWTpxO-YVeSXF3k0aIPLPil0N7A1AcDVDjH65lhiMLvb_eBFi_N4-EqE0NYHQ8tGTELw9A0aPOO03fLqskLFyOOPEOra_wLrrJdi_v0dqn5JSTh_k-p_PYMJfiZ9GpXtFoX_4t_9F4bNRgceuQzSsvgYL9ZUp_Bjo_xs_FgYVA5aObNJF2QnaHw-Lh-5qtbxV6BMw"
            />
          </div>

          {/* Hero Main Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4 leading-tight">
            Join <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-emerald-400">Kaushal Setu</span>
          </h1>

          {/* Hero Subtitle */}
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Empowering India's Next-Gen Talent &amp; Enterprise Ecosystem. Create your verified account to access national skill mapping, verified industry internships, and direct placement opportunities.
          </p>
        </div>
      </section>

      {/* Overlapping Registration Block */}
      <main className="relative -mt-32 max-w-3xl mx-auto px-4 sm:px-6 w-full pb-20 z-20">
        {/* Stakeholder Interactive Persona Selection */}
        <div className="bg-slate-900/90 border border-slate-700/80 backdrop-blur-xl p-3 sm:p-4 rounded-2xl shadow-2xl mb-6 text-white">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 text-center mb-3">
            Select your ecosystem onboarding role:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Role 1: Student */}
            <label
              onClick={() => setRole('student')}
              className={`relative flex flex-col p-3.5 rounded-xl border-2 cursor-pointer transition-all duration-150 ${
                role === 'student'
                  ? 'border-blue-500 bg-blue-950/40 shadow-md'
                  : 'border-slate-700 bg-slate-800/60 hover:bg-slate-800 hover:border-slate-500'
              }`}
            >
              <input type="radio" name="stakeholder_role" value="student" checked={role === 'student'} onChange={() => {}} className="sr-only" />
              <div className="flex items-center justify-between mb-1.5">
                <span className="p-1.5 bg-blue-500/20 text-blue-400 rounded-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M12 14l9-5-9-5-9 5 9 5z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                    <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                  </svg>
                </span>
                {role === 'student' && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500 text-white">
                    Selected
                  </span>
                )}
              </div>
              <span className="text-sm font-bold text-white">Student / Jobseeker</span>
              <span className="text-[11px] text-slate-300 mt-1 leading-snug">Skill mapping, verified digital portfolios &amp; internships.</span>
            </label>

            {/* Role 2: Educational Institution */}
            <label
              onClick={() => setRole('institution')}
              className={`relative flex flex-col p-3.5 rounded-xl border-2 cursor-pointer transition-all duration-150 ${
                role === 'institution'
                  ? 'border-purple-500 bg-purple-950/40 shadow-md'
                  : 'border-slate-700 bg-slate-800/60 hover:bg-slate-800 hover:border-slate-500'
              }`}
            >
              <input type="radio" name="stakeholder_role" value="institution" checked={role === 'institution'} onChange={() => {}} className="sr-only" />
              <div className="flex items-center justify-between mb-1.5">
                <span className="p-1.5 bg-purple-500/20 text-purple-400 rounded-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                  </svg>
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Academia</span>
              </div>
              <span className="text-sm font-bold text-slate-200">University / College</span>
              <span className="text-[11px] text-slate-400 mt-1 leading-snug">Curriculum alignment, telemetry &amp; placement reporting.</span>
            </label>

            {/* Role 3: Industry Partner */}
            <label
              onClick={() => setRole('industry')}
              className={`relative flex flex-col p-3.5 rounded-xl border-2 cursor-pointer transition-all duration-150 ${
                role === 'industry'
                  ? 'border-emerald-500 bg-emerald-950/40 shadow-md'
                  : 'border-slate-700 bg-slate-800/60 hover:bg-slate-800 hover:border-slate-500'
              }`}
            >
              <input type="radio" name="stakeholder_role" value="industry" checked={role === 'industry'} onChange={() => {}} className="sr-only" />
              <div className="flex items-center justify-between mb-1.5">
                <span className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                  </svg>
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Enterprise</span>
              </div>
              <span className="text-sm font-bold text-slate-200">Industry / Enterprise</span>
              <span className="text-[11px] text-slate-400 mt-1 leading-snug">Post internships, syllabus challenges &amp; direct hiring.</span>
            </label>
          </div>
        </div>

        {/* Crisp White Registration Card with Indian Tricolour Top Strip */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden relative">
          <div className="w-full h-1.5 flex">
            <div className="h-full w-1/3 bg-[#FF9933]"></div>
            <div className="h-full w-1/3 bg-slate-100"></div>
            <div className="h-full w-1/3 bg-[#138808]"></div>
          </div>

          <div className="p-6 sm:p-10">
            {/* Header Badge & Status */}
            <div className="flex flex-col items-center text-center mb-6">
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100 text-xs font-semibold mb-3">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                </span>
                <span>NEW REGISTRATION • SECURE ENROLLMENT</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Create your account</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Connect directly with national skill pipelines and accredited career pathways
              </p>
            </div>

            {/* Federated Quick Social / Government Sign-on Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              <button
                type="button"
                onClick={() => showToast('Google OAuth authorization gateway initialized.', 'info')}
                className="inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"></path>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"></path>
                </svg>
                Google
              </button>
              <button
                type="button"
                onClick={() => showToast('Apple SSO authorization initiated.', 'info')}
                className="inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition cursor-pointer"
              >
                <svg className="w-4 h-4 fill-current text-slate-900" viewBox="0 0 170 170">
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.69-7.85-12.01-14.42-6.19-9.45-11.02-20.2-14.5-32.25-3.48-12.05-5.22-23.49-5.22-34.33 0-14.12 3.57-25.75 10.71-34.89 7.14-9.14 16.03-13.84 26.68-14.11 4.58 0 9.77 1.25 15.58 3.75 5.81 2.5 9.73 3.75 11.75 3.75 1.63 0 5.63-1.33 12.01-4 6.38-2.67 11.66-3.83 15.84-3.5 11.66.75 20.89 5.09 27.69 13.02-10.46 6.31-15.56 15.17-15.3 26.58.26 9.02 3.77 16.59 10.53 22.71 6.76 6.12 14.86 9.53 24.3 10.23-2.12 6.2-4.66 12.28-7.61 18.26zM119.22 32.74c0-7.39 2.65-14.14 7.95-20.25 5.3-6.11 11.79-9.87 19.47-11.28.53 2.01.8 3.96.8 5.85 0 7.39-2.78 14.3-8.34 20.73-5.56 6.43-12.18 10.05-19.88 10.86-.26-1.96-.4-3.92-.4-5.91z"></path>
                </svg>
                Apple
              </button>
              <button
                type="button"
                onClick={() => showToast('Microsoft Education SSO initiated.', 'info')}
                className="inline-flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 21 21">
                  <rect fill="#f25022" height="9" width="9" x="1" y="1"></rect>
                  <rect fill="#00a4ef" height="9" width="9" x="1" y="11"></rect>
                  <rect fill="#7fba00" height="9" width="9" x="11" y="1"></rect>
                  <rect fill="#ffb900" height="9" width="9" x="11" y="11"></rect>
                </svg>
                Microsoft
              </button>
            </div>

            <div className="relative flex py-2 items-center mb-6">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-3 text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                Or register with official credentials
              </span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1" htmlFor="fullName">
                  Full Legal Name <span className="text-red-500">*</span>
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                    </svg>
                  </div>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Aarav Sharma"
                    className="block w-full pl-9 pr-3 py-2.5 text-sm border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder:text-slate-400 bg-slate-50/50"
                  />
                </div>
              </div>

              {/* Email & Mobile 2-Column Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider" htmlFor="email">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[10px] text-slate-400 font-normal">Institutional Preferred</span>
                  </div>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                      </svg>
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@institution.ac.in"
                      className="block w-full pl-9 pr-3 py-2.5 text-sm border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder:text-slate-400 bg-slate-50/50"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider" htmlFor="phone">
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[10px] text-slate-400 font-normal">For OTP Verify</span>
                  </div>
                  <div className="relative rounded-md shadow-sm flex">
                    <span className="inline-flex items-center px-2.5 rounded-l-lg border border-r-0 border-slate-200 bg-slate-100 text-slate-600 text-xs font-semibold">
                      🇮🇳 +91
                    </span>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="98765 43210"
                      className="block w-full px-3 py-2.5 text-sm border-slate-200 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder:text-slate-400 bg-slate-50/50"
                    />
                  </div>
                </div>
              </div>

              {/* Academic Affiliation & APAAR ID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1" htmlFor="organization">
                    University / Institution / Org <span className="text-red-500">*</span>
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                      </svg>
                    </div>
                    <input
                      id="organization"
                      name="organization"
                      type="text"
                      required
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      placeholder="e.g. Indian Institute of Technology / NIT"
                      className="block w-full pl-9 pr-3 py-2.5 text-sm border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder:text-slate-400 bg-slate-50/50"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider" htmlFor="identifier">
                      APAAR ID / Roll No. / Employee ID
                    </label>
                    <span className="text-[10px] text-blue-600 font-medium">Auto-Sync</span>
                  </div>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                      </svg>
                    </div>
                    <input
                      id="identifier"
                      name="identifier"
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="12-Digit APAAR or Enrollment No."
                      className="block w-full pl-9 pr-3 py-2.5 text-sm border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder:text-slate-400 bg-slate-50/50"
                    />
                  </div>
                </div>
              </div>

              {/* Password and Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1" htmlFor="password">
                    Create Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                      </svg>
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 8+ characters"
                      className="block w-full pl-9 pr-9 py-2.5 text-sm border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder:text-slate-400 bg-slate-50/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1" htmlFor="confirmPassword">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                      </svg>
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="block w-full pl-9 pr-3 py-2.5 text-sm border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder:text-slate-400 bg-slate-50/50"
                    />
                  </div>
                </div>
              </div>

              {/* Password Strength Indicator */}
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="text-slate-500">Security strength:</span>
                  <div className="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden flex">
                    <div className={`h-full rounded-full transition-all ${password.length >= 8 ? 'w-4/5 bg-emerald-500' : 'w-1/3 bg-amber-500'}`}></div>
                  </div>
                  <span className="text-emerald-700 font-semibold text-[11px]">
                    {password.length >= 8 ? 'Strong (AES-256)' : 'Minimum 8 chars'}
                  </span>
                </div>
                <span className="text-slate-400 text-[11px]">Use letters, numbers &amp; symbols</span>
              </div>

              {/* Legal & Verification Consent Checkboxes */}
              <div className="pt-2 space-y-2.5">
                <div className="flex items-start">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    checked={termsAgreed}
                    onChange={(e) => setTermsAgreed(e.target.checked)}
                    required
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded mt-0.5 cursor-pointer"
                  />
                  <label htmlFor="terms" className="ml-2.5 block text-xs text-slate-600 leading-normal">
                    I agree to the Kaushal Setu <span className="text-blue-600 font-medium">Terms of Service</span>, <span className="text-blue-600 font-medium">Privacy Policy</span>, and National Data Governance standards.
                  </label>
                </div>
                <div className="flex items-start">
                  <input
                    id="apaar_consent"
                    name="apaar_consent"
                    type="checkbox"
                    checked={apaarConsent}
                    onChange={(e) => setApaarConsent(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded mt-0.5 cursor-pointer"
                  />
                  <label htmlFor="apaar_consent" className="ml-2.5 block text-xs text-slate-600 leading-normal">
                    Authorize automated credential verification via <span className="font-medium text-slate-800">DigiLocker / APAAR / AICTE</span> national database.
                  </label>
                </div>
              </div>

              {/* Primary Submit CTA Button */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full inline-flex items-center justify-center px-6 py-3.5 text-sm sm:text-base font-bold text-white bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-200 transform active:scale-[0.99] cursor-pointer"
                >
                  <span>{submitting ? 'Creating account...' : 'Complete Registration & Get Started'}</span>
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                  </svg>
                </button>
              </div>
            </form>

            {/* Existing Member Login Link */}
            <div className="mt-6 pt-5 border-t border-slate-100 text-center">
              <p className="text-xs sm:text-sm text-slate-600">
                Already registered on Kaushal Setu?{' '}
                <button
                  type="button"
                  onClick={() => setCurrentPage('home')}
                  className="font-bold text-blue-600 hover:text-blue-800 hover:underline ml-1 cursor-pointer"
                >
                  Sign in to your account →
                </button>
              </p>
            </div>

            {/* Institutional Batch Onboarding Access */}
            <div className="mt-4 p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="flex items-center space-x-2 text-left">
                <span className="p-1.5 bg-blue-100 text-blue-700 rounded-lg flex-shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                  </svg>
                </span>
                <div className="text-xs">
                  <span className="font-bold text-slate-800">Institutions &amp; Enterprise Bulk Access:</span>
                  <span className="text-slate-500 ml-1">Need batch onboarding or API federation?</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => showToast('Campus partnership request submitted. Our zonal coordinator will contact you.', 'success')}
                className="text-xs font-semibold text-blue-700 hover:text-blue-800 whitespace-nowrap px-3 py-1 bg-white border border-slate-200 rounded-md shadow-sm hover:bg-slate-50 cursor-pointer"
              >
                Request Campus Demo
              </button>
            </div>
          </div>

          {/* Trust Footer Banner within Card */}
          <div className="bg-slate-50/80 px-6 py-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
            <span className="inline-flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                <path clipRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" fillRule="evenodd"></path>
              </svg>
              256-Bit SSL Secured Session
            </span>
            <span className="inline-flex items-center gap-1">
              <span>Meets ISO/IEC 27001 &amp; NEP 2020 Compliance</span>
            </span>
          </div>
        </div>
      </main>
    </div>
  );
};
