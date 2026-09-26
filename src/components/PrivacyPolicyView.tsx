import React, { useState, useEffect } from 'react';

interface PrivacyPolicyViewProps {
  onNavigate?: (view: string) => void;
}

export const PrivacyPolicyView: React.FC<PrivacyPolicyViewProps> = ({ onNavigate }) => {
  const [activeSection, setActiveSection] = useState('sec-1');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const handlePillClick = (e: React.MouseEvent<HTMLAnchorElement>, secId: string) => {
    e.preventDefault();
    setActiveSection(secId);
    const target = document.getElementById(secId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleBack = () => {
    if (onNavigate) {
      onNavigate('home');
    } else {
      window.history.back();
    }
  };

  return (
    <div className="bg-[#f8f9ff] font-sans text-slate-800 flex flex-col min-h-screen">
      {/* Fixed Header */}
      <header className="fixed top-0 w-full z-50 pt-safe bg-white/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-slate-200">
        <div className="w-full h-1 bg-gradient-to-r from-[#ea580c] via-white to-[#16a34a]"></div>
        <div className="h-16 px-4 sm:px-8 max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={handleBack}
              className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
              aria-label="Go back"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back_ios_new</span>
            </button>
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src="https://lh3.googleusercontent.com/aida/AEtjO1VIaBvfJLYD4KZs626frH2achYUpXlLeD4vZG0r8q2-vpHQ-CKRCY8-a-RPYHK_oMQ4EteuRmALnbxkCmWryNmAgLUGgr-ieq1wbD1rzrD1gtVKwz3Y-S_pj6i_eyLEhXIsqAI40IbXJ7GVCwne96qc8t2Z1ieOMqLmwDtuTAlbRl59r6LwtJDClBEz2Paqlf9DV_c2aeMC-4KN64RA3Bx-GdbL7RCwsfKMzI51zul7qLILcc2MXI3gl0Vc"
                alt="Kaushal Setu Logo"
                className="h-9 w-auto object-contain shrink-0"
              />
              <div className="flex flex-col min-w-0">
                <span className="text-xs text-[#00236f] font-bold uppercase tracking-wider truncate">Kaushal Setu</span>
                <span className="text-[11px] text-slate-500 truncate">National Academia-Industry Collaborative Platform</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold flex items-center gap-1 border border-emerald-200">
              <span className="material-symbols-outlined text-[13px]">verified</span>Verified
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex flex-col relative w-full pt-20 pb-safe px-4 sm:px-8 max-w-5xl mx-auto bg-[#f8f9ff]">
        <div className="flex flex-col w-full pb-10">
          {/* Breadcrumb and Quick Back Bar */}
          <div className="py-3 flex items-center justify-between flex-wrap gap-2">
            <button
              onClick={() => onNavigate ? onNavigate('login') : handleBack()}
              className="inline-flex items-center gap-1 text-[#00236f] hover:text-blue-800 transition-colors text-sm font-semibold cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              <span>Back to Login / Register</span>
            </button>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
              <span className="material-symbols-outlined text-[14px]">verified_user</span>
              AICTE Compliant
            </span>
          </div>

          {/* Document Header Hero Card */}
          <div className="relative overflow-hidden rounded-xl bg-white p-6 shadow-sm border border-slate-200 mb-6">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#00236f] via-[#ea580c] to-[#16a34a]"></div>
            <div className="flex items-start justify-between gap-3 mt-1">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-[#00236f] shrink-0 shadow-sm border border-blue-100">
                  <span className="material-symbols-outlined text-[26px]">policy</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs uppercase tracking-wider text-[#ea580c] font-bold">Official Governance Document</span>
                  <h2 className="text-2xl text-slate-900 tracking-tight font-bold">PRIVACY POLICY</h2>
                  <span className="text-xs text-slate-500 mt-0.5">Academic &amp; Student Data Protection Framework</span>
                </div>
              </div>
              <span className="shrink-0 px-2.5 py-1 rounded bg-blue-50 text-[#00236f] text-xs font-semibold border border-blue-100">
                UGC • AICTE
              </span>
            </div>

            <div className="mt-4 pt-2 flex flex-wrap items-center gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="flex items-center gap-1.5 text-slate-600 text-xs font-medium">
                <span className="material-symbols-outlined text-[16px] text-[#00236f]">calendar_today</span>
                <span>Last Updated: <strong className="text-slate-900">September 17, 2026</strong></span>
              </div>
              <span className="text-slate-300">•</span>
              <div className="flex items-center gap-1 text-slate-600 text-xs font-medium">
                <span className="material-symbols-outlined text-[16px] text-emerald-600">security</span>
                <span>Standard Version 3.4</span>
              </div>
              <span className="text-slate-300">•</span>
              <div className="flex items-center gap-1 text-slate-600 text-xs">
                <span className="material-symbols-outlined text-[14px] text-[#00236f]">fingerprint</span>
                <span>Ref: KS-PRIVACY-DIR-2026/V2</span>
              </div>
            </div>

            <div className="mt-3 p-2.5 rounded-lg bg-emerald-50 text-slate-800 text-xs flex items-center gap-2 border border-emerald-200">
              <span className="material-symbols-outlined text-[16px] text-emerald-600 shrink-0">gavel</span>
              <span>In accordance with National Data Protection Standards &amp; University UGC/AICTE Digital Guidelines.</span>
            </div>

            <div className="mt-4 space-y-2 text-slate-600 text-sm leading-relaxed">
              <p>Kaushal Setu (“Kaushal Setu,” “we,” “our,” or “us”) respects your privacy and is committed to protecting the personal information of users who access or use our website and services.</p>
              <p>This Privacy Policy explains how we collect, use, store, disclose, and protect information when you use the Kaushal Setu platform.</p>
              <p className="font-semibold text-slate-900">By accessing or using Kaushal Setu, you acknowledge the practices described in this Privacy Policy.</p>
            </div>
          </div>

          {/* Interactive Quick Jump Pill Selector */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-[#00236f]">list_alt</span>
                Quick Section Jump
              </span>
              <span className="text-xs text-slate-500">14 Sections</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 scroll-smooth" id="section-nav">
              {[
                { id: 'sec-1', label: '1. Data We Collect' },
                { id: 'sec-2', label: '2. Purpose & Use' },
                { id: 'sec-3', label: '3. Institutional Profile & Public Data' },
                { id: 'sec-4', label: '4. Sharing & Disclosure' },
                { id: 'sec-5', label: '5. Third-Party' },
                { id: 'sec-6', label: '6. Data Security & Encryption' },
                { id: 'sec-7', label: '7. Retention' },
                { id: 'sec-8', label: '8. Children' },
                { id: 'sec-9', label: '9. Student Privacy Rights' },
                { id: 'sec-10', label: '10. Account Updates' },
                { id: 'sec-11', label: '11. Communications' },
                { id: 'sec-12', label: '12. International' },
                { id: 'sec-13', label: '13. Breach Protocol' },
                { id: 'sec-14', label: '14. Policy Updates' }
              ].map(sec => (
                <a
                  key={sec.id}
                  href={`#${sec.id}`}
                  onClick={(e) => handlePillClick(e, sec.id)}
                  className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer border ${
                    activeSection === sec.id
                      ? 'bg-[#00236f] text-white border-[#00236f]'
                      : 'bg-white text-[#00236f] border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {sec.label}
                </a>
              ))}
            </div>
          </div>

          {/* Main Legal Document Content Stack */}
          <div className="flex flex-col gap-6">
            {/* Section 1 */}
            <article className="rounded-xl bg-white p-6 shadow-sm border border-slate-200 scroll-mt-24" id="sec-1">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-[#00236f]">
                  <span className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-xs">1</span>
                  <h2 className="text-base text-slate-900 font-bold">Information We Collect</h2>
                </div>
                <span className="px-2 py-0.5 rounded bg-blue-50 border border-blue-100 text-xs text-[#00236f] font-medium">Student &amp; Faculty Data</span>
              </div>
              <p className="text-sm text-slate-600 mb-4">Depending on how you use the platform, we may collect the following categories of information.</p>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-2.5 py-1 rounded-full bg-slate-100 text-[#00236f] text-xs font-medium flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">school</span>Academic Records
                </span>
                <span className="px-2.5 py-1 rounded-full bg-slate-100 text-[#00236f] text-xs font-medium flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">badge</span>Student Verification
                </span>
                <span className="px-2.5 py-1 rounded-full bg-slate-100 text-[#00236f] text-xs font-medium flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">history_edu</span>Degree &amp; Course Credentials
                </span>
                <span className="px-2.5 py-1 rounded-full bg-slate-100 text-[#00236f] text-xs font-medium flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">folder_special</span>Portfolio Assets
                </span>
              </div>

              <div className="bg-slate-50 rounded-xl p-5 mb-4 border border-slate-200">
                <div className="flex items-center gap-2 mb-2 text-[#00236f]">
                  <span className="material-symbols-outlined text-[20px]">person_pin</span>
                  <h3 className="text-sm font-bold text-slate-900">A. Information You Provide</h3>
                </div>
                <p className="text-sm text-slate-600 mb-3">When you register, create a profile, contact us, or use our services, you may provide information such as:</p>
                <ul className="space-y-1.5 pl-1 text-slate-700 text-sm">
                  {[
                    'Full name.',
                    'Email address.',
                    'Phone number.',
                    'Username and account credentials.',
                    'Date of birth or age, where required.',
                    'Profile photograph.',
                    'Educational qualifications.',
                    'Institution, college, or university information.',
                    'Skills and areas of interest.',
                    'Professional experience.',
                    'Resume or CV information.',
                    'Employment information.',
                    'Projects, certifications, achievements, and portfolios.',
                    'Information submitted when applying for jobs, internships, projects, training, or other opportunities.',
                    'Messages or other communications sent through the platform.',
                    'Any other information you voluntarily provide.'
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-[16px] text-[#ea580c] mt-0.5 shrink-0">check_circle</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2">
                  <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5 text-rose-600">warning</span>
                  <div>
                    <span className="font-bold block">Notice regarding Student Sensitive Data &amp; Examination Information:</span>
                    <span>Please do not submit sensitive personal information unless it is specifically requested and necessary for a particular service.</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-5 mb-4 border border-slate-200">
                <div className="flex items-center gap-2 mb-2 text-[#00236f]">
                  <span className="material-symbols-outlined text-[20px]">devices</span>
                  <h3 className="text-sm font-bold text-slate-900">B. Information Collected Automatically</h3>
                </div>
                <p className="text-sm text-slate-600 mb-3">When you access our website, certain technical information may be collected automatically, which may include:</p>
                <ul className="space-y-1.5 pl-1 text-slate-700 text-sm mb-3">
                  {[
                    'IP address.',
                    'Browser type and version.',
                    'Device type.',
                    'Operating system.',
                    'Pages visited.',
                    'Date and time of access.',
                    'Referring website or page.',
                    'General usage and interaction information.',
                    'Technical information necessary to maintain website security and functionality.'
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-[16px] text-[#00236f] mt-0.5 shrink-0">subdirectory_arrow_right</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-slate-500 italic">The actual information collected may depend on the technologies and services used by the platform.</p>
              </div>

              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                <div className="flex items-center gap-2 mb-2 text-[#00236f]">
                  <span className="material-symbols-outlined text-[20px]">cookie</span>
                  <h3 className="text-sm font-bold text-slate-900">C. Cookies and Similar Technologies</h3>
                </div>
                <p className="text-sm text-slate-600 mb-3">Kaushal Setu may use cookies or similar technologies to:</p>
                <ul className="space-y-1.5 pl-1 text-slate-700 text-sm mb-3">
                  {[
                    'Maintain login sessions.',
                    'Remember user preferences.',
                    'Improve website functionality.',
                    'Understand how users interact with the platform.',
                    'Improve security.',
                    'Analyze website performance.'
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-[16px] text-[#00236f] mt-0.5 shrink-0">radio_button_checked</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-slate-600">You may be able to control cookies through your browser settings. Disabling certain cookies may affect the functionality of the website.</p>
              </div>
            </article>

            {/* Section 2 */}
            <article className="rounded-xl bg-white p-6 shadow-sm border border-slate-200 scroll-mt-24" id="sec-2">
              <div className="flex items-center gap-2 mb-3 text-[#00236f]">
                <span className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-xs">2</span>
                <h2 className="text-base text-slate-900 font-bold">How We Use Your Information</h2>
              </div>
              <p className="text-sm text-slate-600 mb-3">We may use collected information to:</p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700 text-sm">
                {[
                  { icon: 'manage_accounts', color: 'text-[#00236f]', text: 'Create and manage user accounts.' },
                  { icon: 'construction', color: 'text-[#00236f]', text: 'Provide and operate Kaushal Setu services.' },
                  { icon: 'badge', color: 'text-[#00236f]', text: 'Create and maintain user profiles.' },
                  { icon: 'hub', color: 'text-[#ea580c]', text: 'Facilitate connections between students, professionals, educational institutions, and industry organizations.' },
                  { icon: 'work', color: 'text-[#ea580c]', text: 'Process applications for jobs, internships, projects, training, or other opportunities.' },
                  { icon: 'chat', color: 'text-[#00236f]', text: 'Communicate with users regarding their accounts and activities.' },
                  { icon: 'notifications', color: 'text-[#00236f]', text: 'Send important service-related notifications.' },
                  { icon: 'support_agent', color: 'text-[#00236f]', text: 'Provide customer support.' },
                  { icon: 'upgrade', color: 'text-[#00236f]', text: 'Improve the website and its features.' },
                  { icon: 'qr_code_2', color: 'text-rose-600', text: 'Detect, prevent, and investigate fraud, abuse, unauthorized access, and security incidents.' },
                  { icon: 'verified', color: 'text-emerald-600', text: 'Maintain the security and integrity of the platform.' },
                  { icon: 'gavel', color: 'text-[#00236f]', text: 'Comply with applicable laws and legal obligations.' },
                  { icon: 'rule', color: 'text-[#00236f]', text: 'Enforce our Terms of Service.' },
                  { icon: 'task_alt', color: 'text-[#00236f]', text: 'Carry out other purposes disclosed to you at the time information is collected or otherwise permitted by applicable law.' }
                ].map((item, idx) => (
                  <li key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-2">
                    <span className={`material-symbols-outlined text-[18px] ${item.color} mt-0.5 shrink-0`}>{item.icon}</span>
                    <span className="text-xs leading-relaxed">{item.text}</span>
                  </li>
                ))}
              </ul>
            </article>

            {/* Section 3 */}
            <article className="rounded-xl bg-white p-6 shadow-sm border border-slate-200 scroll-mt-24" id="sec-3">
              <div className="flex items-center gap-2 mb-3 text-[#00236f]">
                <span className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-xs">3</span>
                <h2 className="text-base text-slate-900 font-bold">Profile and Public Information</h2>
              </div>
              <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
                <p>Depending on the features you use and your privacy settings, certain information in your Kaushal Setu profile may be visible to other users, educational institutions, employers, industry organizations, or other authorized platform participants.</p>
                <p>You should carefully consider the information you choose to make publicly or broadly available.</p>
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-950">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#ea580c] mb-1">
                    <span className="material-symbols-outlined text-[20px]">lock_clock</span>
                    <span>Security Reminder</span>
                  </div>
                  <p className="text-xs leading-relaxed">
                    Do not publish passwords, financial information, government identification numbers, or other highly sensitive information in publicly accessible areas of your profile.
                  </p>
                </div>
              </div>
            </article>

            {/* Section 4 */}
            <article className="rounded-xl bg-white p-6 shadow-sm border border-slate-200 scroll-mt-24" id="sec-4">
              <div className="flex items-center gap-2 mb-2 text-[#00236f]">
                <span className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-xs">4</span>
                <h2 className="text-base text-slate-900 font-bold">Information Sharing and Disclosure</h2>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-semibold mb-4 flex items-center gap-2 border border-emerald-200">
                <span className="material-symbols-outlined text-[18px]">no_sim</span>
                <span>We do not sell your personal information merely because you use Kaushal Setu.</span>
              </div>
              <p className="text-sm text-slate-600 mb-4">We may share information in the following circumstances:</p>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2 mb-1 text-[#00236f]">
                    <span className="material-symbols-outlined text-[18px]">group</span>
                    <h3 className="text-sm font-bold text-slate-900">A. With Other Platform Users</h3>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">Information that you choose to include in a profile, application, post, or other publicly or broadly accessible area may be visible to other authorized users.</p>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2 mb-1 text-[#ea580c]">
                    <span className="material-symbols-outlined text-[18px]">account_balance</span>
                    <h3 className="text-sm font-bold text-slate-900">B. With Educational Institutions and Organizations</h3>
                  </div>
                  <span className="inline-block px-2 py-0.5 rounded bg-amber-100 text-[#ea580c] text-[11px] mb-2 font-semibold">
                    Universities, Colleges &amp; Industry Recruiters
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed">Where necessary to provide a requested service or opportunity, relevant information may be shared with educational institutions, employers, industry partners, recruiters, mentors, or other organizations.</p>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2 mb-1 text-[#00236f]">
                    <span className="material-symbols-outlined text-[18px]">cloud_sync</span>
                    <h3 className="text-sm font-bold text-slate-900">C. With Service Providers</h3>
                  </div>
                  <p className="text-xs text-slate-600 mb-2">We may use third-party service providers to help operate the platform, such as providers of:</p>
                  <ul className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-700 text-xs mb-2">
                    {['Website hosting', 'Cloud infrastructure', 'Database services', 'Authentication', 'Email & comms', 'Analytics', 'Security services', 'Payment processing'].map((srv, idx) => (
                      <li key={idx} className="flex items-center gap-1.5 p-1.5 rounded bg-white border border-slate-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00236f]"></span>
                        <span>{srv}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-[11px] text-slate-500">Such providers may process information only as necessary to provide their services, subject to applicable contractual or legal requirements.</p>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2 mb-1 text-[#00236f]">
                    <span className="material-symbols-outlined text-[18px]">shield</span>
                    <h3 className="text-sm font-bold text-slate-900">D. For Legal and Security Reasons</h3>
                  </div>
                  <p className="text-xs text-slate-600 mb-2">We may disclose information when reasonably necessary to:</p>
                  <ul className="space-y-1 text-slate-700 text-xs">
                    {['Comply with applicable law.', 'Respond to lawful requests from authorities.', 'Protect our legal rights.', 'Investigate suspected fraud or abuse.', 'Protect users, the public, or the security of the platform.', 'Enforce our Terms of Service.'].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-[16px] text-[#00236f]">check</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2 mb-1 text-[#00236f]">
                    <span className="material-symbols-outlined text-[18px]">sync_alt</span>
                    <h3 className="text-sm font-bold text-slate-900">E. Business Transfers</h3>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">If Kaushal Setu or substantially all of its assets are involved in a merger, acquisition, restructuring, financing, sale, or similar transaction, personal information may be transferred as part of that transaction, subject to applicable law.</p>
                </div>
              </div>
            </article>

            {/* Section 5 */}
            <article className="rounded-xl bg-white p-6 shadow-sm border border-slate-200 scroll-mt-24" id="sec-5">
              <div className="flex items-center gap-2 mb-2 text-[#00236f]">
                <span className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-xs">5</span>
                <h2 className="text-base text-slate-900 font-bold">Third-Party Services</h2>
              </div>
              <div className="space-y-2 text-sm text-slate-600 leading-relaxed">
                <p>Kaushal Setu may integrate with or provide links to third-party websites, applications, or services.</p>
                <p>Those third parties may have their own privacy policies and terms. We are not responsible for the privacy practices of third-party services that we do not control.</p>
                <p>We encourage users to review the privacy policies of third-party services before providing them with personal information.</p>
              </div>
            </article>

            {/* Section 6 */}
            <article className="rounded-xl bg-white p-6 shadow-sm border border-slate-200 scroll-mt-24" id="sec-6">
              <div className="flex items-center gap-2 mb-2 text-[#00236f]">
                <span className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-xs">6</span>
                <h2 className="text-base text-slate-900 font-bold">Data Security</h2>
              </div>
              <div className="space-y-2 text-sm text-slate-600 leading-relaxed">
                <p>We take reasonable technical and organizational measures designed to protect personal information against unauthorized access, alteration, disclosure, loss, or misuse.</p>
                <p className="p-3 rounded-lg bg-slate-50 border border-slate-200 font-medium text-slate-800 text-xs">
                  However, no internet-based service can guarantee absolute security.
                </p>
                <p>You are also responsible for maintaining the security of your account credentials and should notify us promptly if you believe your account has been compromised.</p>
              </div>
            </article>

            {/* Section 7 */}
            <article className="rounded-xl bg-white p-6 shadow-sm border border-slate-200 scroll-mt-24" id="sec-7">
              <div className="flex items-center gap-2 mb-2 text-[#00236f]">
                <span className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-xs">7</span>
                <h2 className="text-base text-slate-900 font-bold">Data Retention</h2>
              </div>
              <p className="text-sm text-slate-600 mb-3">We retain personal information for as long as reasonably necessary to:</p>
              <ul className="space-y-1.5 pl-1 text-slate-700 text-sm mb-3">
                {[
                  'Provide our services.',
                  'Maintain user accounts.',
                  'Fulfill the purposes described in this Privacy Policy.',
                  'Comply with legal and regulatory obligations.',
                  'Resolve disputes.',
                  'Prevent fraud and abuse.',
                  'Enforce agreements.'
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-[16px] text-emerald-600 mt-0.5">timer</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
                <p>Retention periods may vary depending on the type of information and the purpose for which it was collected.</p>
                <p>When information is no longer reasonably required, we may delete, anonymize, or securely dispose of it, subject to applicable legal requirements.</p>
              </div>
            </article>

            {/* Section 8 */}
            <article className="rounded-xl bg-white p-6 shadow-sm border border-slate-200 scroll-mt-24" id="sec-8">
              <div className="flex items-center gap-2 mb-2 text-[#00236f]">
                <span className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-xs">8</span>
                <h2 className="text-base text-slate-900 font-bold">Children's Privacy</h2>
              </div>
              <div className="space-y-2 text-sm text-slate-600 leading-relaxed">
                <p>Kaushal Setu is not intended to knowingly collect personal information from children in violation of applicable law.</p>
                <p>Where applicable, users under the relevant legal age should use the platform with appropriate parental, guardian, educational-institution, or other authorized supervision and consent.</p>
                <p>If you believe that a child has provided personal information to us in circumstances where such collection is not permitted, please contact us so that we can review and take appropriate action.</p>
              </div>
            </article>

            {/* Section 9 */}
            <article className="rounded-xl bg-white p-6 shadow-sm border border-slate-200 scroll-mt-24" id="sec-9">
              <div className="flex items-center gap-2 mb-2 text-[#00236f]">
                <span className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-xs">9</span>
                <h2 className="text-base text-slate-900 font-bold">Your Privacy Rights</h2>
              </div>
              <p className="text-sm text-slate-600 mb-3">Depending on your location and applicable law, you may have rights regarding your personal information, which may include:</p>
              <div className="space-y-2 mb-3">
                {[
                  { icon: 'key', text: 'Requesting access to personal information we hold about you.' },
                  { icon: 'edit_document', text: 'Requesting correction of inaccurate information.' },
                  { icon: 'delete_forever', text: 'Requesting deletion of information, where legally permitted.' },
                  { icon: 'block', text: 'Requesting restriction of certain processing.' },
                  { icon: 'front_hand', text: 'Objecting to certain processing activities.' },
                  { icon: 'file_copy', text: 'Requesting a copy of certain information.' },
                  { icon: 'undo', text: 'Withdrawing consent where processing is based on consent.' },
                  { icon: 'report', text: 'Filing a complaint with an applicable data-protection authority.' }
                ].map((item, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-2 text-xs text-slate-700">
                    <span className="material-symbols-outlined text-[18px] text-[#00236f] mt-0.5">{item.icon}</span>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-1 text-xs text-slate-600 leading-relaxed">
                <p>These rights may be subject to legal limitations and exceptions.</p>
                <p>To exercise applicable rights, contact us using the details provided at the end of this Privacy Policy.</p>
              </div>
            </article>

            {/* Section 10 */}
            <article className="rounded-xl bg-white p-6 shadow-sm border border-slate-200 scroll-mt-24" id="sec-10">
              <div className="flex items-center gap-2 mb-2 text-[#00236f]">
                <span className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-xs">10</span>
                <h2 className="text-base text-slate-900 font-bold">Account and Profile Changes</h2>
              </div>
              <div className="space-y-2 text-sm text-slate-600 leading-relaxed">
                <p>You may be able to update certain account and profile information directly through the platform.</p>
                <p>If you cannot update or delete particular information through your account, you may contact us and request assistance.</p>
                <p>We may retain certain information where necessary to comply with legal obligations, resolve disputes, prevent fraud, maintain security, or fulfill another legitimate legal purpose.</p>
              </div>
            </article>

            {/* Section 11 */}
            <article className="rounded-xl bg-white p-6 shadow-sm border border-slate-200 scroll-mt-24" id="sec-11">
              <div className="flex items-center gap-2 mb-2 text-[#00236f]">
                <span className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-xs">11</span>
                <h2 className="text-base text-slate-900 font-bold">Communications</h2>
              </div>
              <div className="space-y-2 text-sm text-slate-600 leading-relaxed">
                <p>We may send you communications relating to your account, security, transactions, applications, opportunities, platform updates, or other services.</p>
                <p>Where required by applicable law, promotional communications will be sent only with the appropriate consent or legal basis.</p>
                <p>You may unsubscribe from promotional communications using the unsubscribe mechanism provided in the communication, where available.</p>
                <p className="font-semibold text-slate-900">You may continue to receive essential service-related communications even after opting out of marketing communications.</p>
              </div>
            </article>

            {/* Section 12 */}
            <article className="rounded-xl bg-white p-6 shadow-sm border border-slate-200 scroll-mt-24" id="sec-12">
              <div className="flex items-center gap-2 mb-2 text-[#00236f]">
                <span className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-xs">12</span>
                <h2 className="text-base text-slate-900 font-bold">International Data Processing</h2>
              </div>
              <div className="space-y-2 text-sm text-slate-600 leading-relaxed">
                <p>Depending on the hosting providers and services used by Kaushal Setu, your information may be stored or processed in countries other than the country in which you live.</p>
                <p>Where required by applicable law, we will take appropriate measures for international transfers and processing of personal information.</p>
              </div>
            </article>

            {/* Section 13 */}
            <article className="rounded-xl bg-white p-6 shadow-sm border border-slate-200 scroll-mt-24" id="sec-13">
              <div className="flex items-center gap-2 mb-2 text-[#00236f]">
                <span className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-xs">13</span>
                <h2 className="text-base text-slate-900 font-bold">Data Breaches and Security Incidents</h2>
              </div>
              <div className="space-y-2 text-sm text-slate-600 leading-relaxed">
                <p>If we become aware of a security incident involving personal information, we will assess and respond to the incident in accordance with applicable law.</p>
                <p>Where notification is legally required, we will provide notice to affected users and/or relevant authorities within the timeframe required by applicable law.</p>
              </div>
            </article>

            {/* Section 14 */}
            <article className="rounded-xl bg-white p-6 shadow-sm border border-slate-200 scroll-mt-24" id="sec-14">
              <div className="flex items-center gap-2 mb-2 text-[#00236f]">
                <span className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-xs">14</span>
                <h2 className="text-base text-slate-900 font-bold">Changes to This Privacy Policy</h2>
              </div>
              <div className="text-sm text-slate-600 leading-relaxed">
                <p>We may update this Privacy Policy periodically. When updates occur, the updated policy will be posted on this page with an updated "Last Updated" timestamp.</p>
              </div>
            </article>
          </div>

          {/* Related Document Link & Navigation Footer */}
          <div className="mt-8 pt-6 bg-white rounded-xl p-6 shadow-sm border border-slate-200 space-y-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Governance &amp; Academic Compliance</span>
              <h3 className="text-base text-slate-900 font-bold">Related Documentation &amp; Governance Portal</h3>
            </div>
            <button
              onClick={() => onNavigate ? onNavigate('terms') : null}
              className="w-full text-left group flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-[#00236f] group-hover:bg-[#00236f] group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-[20px]">description</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-900">Review Terms of Service</span>
                  <span className="text-xs text-slate-500">/terms-of-service • Student &amp; Institutional Governance</span>
                </div>
              </div>
              <span className="material-symbols-outlined text-[20px] text-[#00236f] group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>
            <div className="pt-2">
              <button
                onClick={() => onNavigate ? onNavigate('login') : handleBack()}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#00236f] hover:bg-blue-900 text-white text-sm font-bold shadow-sm transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">login</span>
                <span>Return to Registration / Login</span>
              </button>
            </div>
            <div className="pt-3 text-center border-t border-slate-200 space-y-1">
              <p className="text-xs text-[#00236f] font-bold">Kaushal Setu Student &amp; Institutional Data Governance</p>
              <p className="text-[11px] text-slate-500">
                Designed for Universities, Technical Colleges, and Industry Skill Councils<br />
                Ministry of Education &amp; AICTE Digital Architecture Initiative
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
