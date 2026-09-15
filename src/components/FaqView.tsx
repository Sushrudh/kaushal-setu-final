import React, { useState } from 'react';

interface FaqItemData {
  id: string;
  category: 'general' | 'students' | 'institutions' | 'industry' | 'security';
  keywords: string;
  icon: string;
  question: string;
  answer: string;
}

const FAQ_DATA: FaqItemData[] = [
  {
    id: 'gen-1',
    category: 'general',
    keywords: 'what is kaushal setu purpose bridge academia industry mission',
    icon: 'hub',
    question: 'What is Kaushal Setu and who is it designed for?',
    answer:
      'Kaushal Setu is a unified national digital bridge connecting higher educational institutions, students, and industry leaders to eliminate skill mismatches, enable verified internships, and drive seamless campus placement. Designed under national education priorities, it serves polytechnics, state universities, autonomous institutions, premier technological institutes, students nationwide, and verified industrial employers seeking validated talent.'
  },
  {
    id: 'gen-2',
    category: 'general',
    keywords: 'free cost fee universities colleges government public institutions aicte nep',
    icon: 'account_balance',
    question: 'Is Kaushal Setu free for government universities and students?',
    answer:
      'Yes, foundational student profiling, diagnostic skill assessments, and institutional dashboards are offered with zero license costs in alignment with national education directives and AICTE guidelines. State universities and public institutions receive complimentary administrative onboarding and training for placement cell leads.'
  },
  {
    id: 'stu-1',
    category: 'students',
    keywords: 'skill mapping evaluate industry readiness diagnostic test assessment benchmark corporate',
    icon: 'insights',
    question: 'How does skill mapping evaluate my industry readiness?',
    answer:
      'Through standardized diagnostic questionnaires, coding sandbox assessments, and project evaluations benchmarked directly against active corporate hiring criteria. Your skill readiness index is visualized via an interactive spider chart showing real-time gaps and direct personalized course modules to bridge those deficiencies.'
  },
  {
    id: 'stu-2',
    category: 'security',
    keywords: 'apaar id academic credits nad digilocker portfolio credential validation transfer students',
    icon: 'badge',
    question: 'Can I link my academic credits and APAAR ID with my digital portfolio?',
    answer:
      'Yes, Kaushal Setu integrates securely with the National Academic Depository (NAD), DigiLocker, and APAAR (Automated Permanent Academic Account Registry). Once authenticated, your verified semester marks, course transcripts, and national skill credentials are embedded in a tamper-proof digital profile accessible to verified recruiters.'
  },
  {
    id: 'stu-3',
    category: 'students',
    keywords: 'apply internships corporate listings verified one-click placement jobs stipends',
    icon: 'work',
    question: 'How do I apply for verified industry internships?',
    answer:
      'Once your profile reaches verified status (verified student email or institutional roll ID), you can browse authentic, stipend-backed openings posted directly by corporate leaders. Candidates can apply with a single click using their verified portfolio without repeatedly creating redundant resumes.'
  },
  {
    id: 'inst-1',
    category: 'institutions',
    keywords: 'placement cell tpo monitoring analytics dashboard batch progress employers statistics',
    icon: 'monitoring',
    question: 'How do college placement cells monitor student progress?',
    answer:
      'Institutional administrators receive dedicated telemetry dashboards detailing batch-wise skill readiness, internship participation rates, and real-time employer engagement metrics. TPOs (Training & Placement Officers) can export compliance-ready accreditation reports aligned with NAAC and NBA criteria.'
  },
  {
    id: 'inst-2',
    category: 'institutions',
    keywords: 'faculty development fdp programs syllabus curriculum engineering professors updates',
    icon: 'co_present',
    question: 'Can universities syndicate Faculty Development Programs (FDPs)?',
    answer:
      'Yes, academic department chairs can post collaborative FDP requirements and partner directly with industry technology specialists. Industry leaders provide curriculum advisory, lab instrumentation sponsorship, and real-world project scenarios directly into university classrooms.'
  },
  {
    id: 'ind-1',
    category: 'industry',
    keywords: 'pre-evaluated shortlisting candidates recruitment hiring filtering assessment 60 percent',
    icon: 'fact_check',
    question: 'How are candidates pre-evaluated before interview shortlisting?',
    answer:
      'Employers specify exact benchmark requirements; our recommendation engine matches candidates with verified project competencies, national coding scores, and validated academic transcripts. This structured pre-evaluation cuts enterprise recruitment cycles by up to 60%.'
  },
  {
    id: 'ind-2',
    category: 'industry',
    keywords: 'problem statements live projects internships apprenticeships post jobs engagement types',
    icon: 'business_center',
    question: 'What types of engagements can companies publish on the platform?',
    answer:
      'Corporate entities can deploy live hackathons, structured capstone problem statements, micro-credentials, credit-bearing semester apprenticeships, and direct graduate placement openings across multiple technical disciplines.'
  },
  {
    id: 'sec-1',
    category: 'security',
    keywords: 'security privacy data protection iso 27001 encryption gdpr dpdp act cloud compliance',
    icon: 'lock',
    question: 'How is candidate personal information and university data secured?',
    answer:
      'All infrastructure adheres strictly to the Digital Personal Data Protection (DPDP) Act, ISO/IEC 27001 standard frameworks, and MeitY cloud hosting guidelines. Personal identifiable information (PII) is encrypted both in-transit and at rest using AES-256 encryption, and institutional databases remain strictly partitioned.'
  }
];

export const FaqView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [openItemIds, setOpenItemIds] = useState<Record<string, boolean>>({ 'gen-1': true });

  // Ticket submission state
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketName, setTicketName] = useState('');
  const [ticketEmail, setTicketEmail] = useState('');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketLoading, setTicketLoading] = useState(false);
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

  const toggleItem = (id: string) => {
    setOpenItemIds((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setActiveCategory('all');
  };

  const filteredFaqs = FAQ_DATA.filter((item) => {
    const matchesCategory =
      activeCategory === 'all' ||
      item.category === activeCategory ||
      (activeCategory === 'students' && item.keywords.includes('students')) ||
      (activeCategory === 'security' && (item.category === 'security' || item.keywords.includes('apaar') || item.keywords.includes('digilocker')));

    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesCategory;

    const matchesSearch =
      item.question.toLowerCase().includes(q) ||
      item.answer.toLowerCase().includes(q) ||
      item.keywords.toLowerCase().includes(q);

    return matchesCategory && matchesSearch;
  });

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTicketLoading(true);
    try {
      const res = await fetch('/api/support/ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: ticketName,
          email: ticketEmail,
          subject: ticketSubject,
          message: ticketMessage
        })
      });
      const json = await res.json();
      if (json.success) {
        setTicketSubmitted(true);
      }
    } catch (err) {
      setTicketSubmitted(true);
    } finally {
      setTicketLoading(false);
    }
  };

  return (
    <div className="w-full bg-[#fcf8ff] text-[#1b1b24] min-h-screen flex flex-col font-sans">
      {/* Tricolor Accent Ribbon */}
      <div className="w-full flex h-1.5 shadow-sm">
        <div className="w-1/3 bg-[#a44100]"></div>
        <div className="w-1/3 bg-white"></div>
        <div className="w-1/3 bg-[#7e3000]"></div>
      </div>

      {/* Hero & Command Search Section */}
      <section className="relative w-full bg-[#302f39] text-white overflow-hidden py-16 md:py-24">
        {/* Atmospheric Ambient Glowing Backdrops */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#a44100]/20 blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] rounded-full bg-[#4f46e5]/25 blur-[120px] pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-[420px] h-[420px] rounded-full bg-[#7e3000]/20 blur-3xl pointer-events-none"></div>

        <div className="relative max-w-6xl mx-auto px-6 flex flex-col items-center text-center z-10">
          {/* Institutional Gateway Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-slate-200 text-xs font-semibold shadow-sm mb-4">
            <span className="w-2 h-2 rounded-full bg-[#ffb695] animate-pulse"></span>
            <span className="tracking-wide">National Digital Skills Gateway</span>
            <span className="text-slate-400">•</span>
            <span className="text-[#ffdbcc]">24/7 Help &amp; Resolution Center</span>
          </div>

          {/* Centered Emblem Motif Container */}
          <div className="my-3 p-3 rounded-2xl bg-white/5 backdrop-blur-xl shadow-2xl flex items-center justify-center border border-white/10">
            <img
              alt="Kaushal Setu Official Emblem"
              className="w-24 h-24 object-contain drop-shadow-md"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBNLRYHVCbNHBK06MOFkP0Iaa67qKlaLHx1-uPHWX1wIu5E-r8C7p1Uu0MjSfciWsrPOKekdSM1Cuah4M9RhTHy0TxUT3YSEhhHPROGhamdwAXDQepTn8T3oCuKpdu-XendIpSRe_mOZ90HF1ocQ1ZWnKnTgQCVML6wxZNdr_CHCDEcHTLCQpCqAwEamkPdfd1DyeRYk-f9AUW3y5-l12zCELML3xqOfLRXmSJlgdBnUw7pokW4-X8_T9M65XcvV6u-zg"
            />
          </div>

          {/* Headline Block */}
          <h1 className="text-3xl md:text-5xl font-black text-white max-w-4xl tracking-tight mb-3">
            Frequently Asked Questions
            <span className="block bg-gradient-to-r from-[#ffb695] via-[#e2dfff] to-[#dbdff4] bg-clip-text text-transparent">
              Help, Clarity &amp; Guidance
            </span>
          </h1>
          <p className="text-sm md:text-base text-slate-300 max-w-2xl mx-auto mb-8 font-normal leading-relaxed">
            Find clear answers about student skill mapping, institutional integration, industry internship postings, placement workflows, and platform verification.
          </p>

          {/* Prominent Search Bar */}
          <div className="w-full max-w-3xl relative">
            <div className="relative flex items-center rounded-2xl bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl transition-all duration-300 focus-within:bg-white/15">
              <span className="material-symbols-outlined text-slate-300 pl-4 pr-2 text-[24px]">search</span>
              <input
                className="w-full py-3.5 pr-4 bg-transparent text-sm md:text-base text-white placeholder:text-slate-300/70 focus:outline-none"
                id="faq-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search questions by keyword (e.g. internships, verification, APAAR ID, credits)..."
                type="text"
              />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="pr-4 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="Clear Search"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              )}
            </div>

            {/* Quick Keyword Filter Pills */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 mt-4">
              <span className="text-[11px] font-semibold text-slate-300 mr-1 uppercase tracking-wider">Quick Filters:</span>
              {[
                { id: 'all', label: 'All' },
                { id: 'students', label: 'Students' },
                { id: 'institutions', label: 'Institutions' },
                { id: 'industry', label: 'Industry Partners' },
                { id: 'security', label: 'Verification & APAAR' }
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setActiveCategory(pill.id)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    activeCategory === pill.id
                      ? 'bg-[#4f46e5] text-white shadow-md'
                      : 'bg-white/10 text-slate-200 hover:text-white hover:bg-white/20'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Layout Section */}
      <section className="w-full bg-[#fcf8ff] py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-6">
          {/* Category Segmented Navigation */}
          <div className="flex flex-wrap items-center justify-center pb-3 mb-8 gap-2 max-w-4xl mx-auto">
            {[
              { id: 'all', label: 'All Questions' },
              { id: 'general', label: 'General & Platform Overview' },
              { id: 'students', label: 'For Students & Jobseekers' },
              { id: 'institutions', label: 'For Academic Institutions' },
              { id: 'industry', label: 'For Industry & Recruiters' },
              { id: 'security', label: 'Security, Verification & APAAR' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  activeCategory === tab.id
                    ? 'bg-[#3525cd] text-white shadow-md'
                    : 'bg-[#f0ecf9] text-[#1b1b24] hover:bg-[#eae6f4]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* FAQ Container */}
          <div className="max-w-4xl mx-auto flex flex-col gap-3" id="faq-list">
            {filteredFaqs.map((faq) => {
              const isOpen = Boolean(openItemIds[faq.id]);
              return (
                <div
                  key={faq.id}
                  className="rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                >
                  <button
                    onClick={() => toggleItem(faq.id)}
                    className="w-full flex items-center justify-between p-5 text-left select-none group cursor-pointer"
                    type="button"
                  >
                    <div className="flex items-center gap-3 pr-4">
                      <span className="w-9 h-9 rounded-xl bg-[#f0ecf9] flex items-center justify-center text-[#3525cd] group-hover:bg-[#3525cd] group-hover:text-white transition-colors flex-shrink-0">
                        <span className="material-symbols-outlined text-[20px]">{faq.icon}</span>
                      </span>
                      <span className="text-sm md:text-base font-bold text-[#1b1b24] group-hover:text-[#3525cd] transition-colors">
                        {faq.question}
                      </span>
                    </div>
                    <span
                      className={`material-symbols-outlined text-slate-400 text-[24px] transform transition-transform duration-300 flex-shrink-0 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    >
                      expand_more
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-0 text-slate-600 text-xs md:text-sm leading-relaxed">
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 leading-relaxed text-[#464555]">
                        {faq.answer}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* No Results State */}
          {filteredFaqs.length === 0 && (
            <div className="max-w-md mx-auto text-center py-12">
              <div className="w-16 h-16 rounded-full bg-[#eae6f4] mx-auto flex items-center justify-center text-slate-500 mb-4">
                <span className="material-symbols-outlined text-[32px]">manage_search</span>
              </div>
              <h3 className="text-lg font-bold text-[#1b1b24] mb-1">No matching questions found</h3>
              <p className="text-xs text-slate-500 mb-5">Try adjusting your search terms or browse using the category filters above.</p>
              <button
                onClick={handleClearSearch}
                className="px-5 py-2.5 rounded-xl bg-[#3525cd] text-white font-semibold text-xs hover:bg-[#4f46e5] transition-colors cursor-pointer"
              >
                Clear Search Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Contact & Resolution Escalation Banner */}
      <section className="w-full bg-[#f5f2ff] py-14 border-t border-slate-200/60">
        <div className="max-w-5xl mx-auto px-6">
          <div className="rounded-3xl bg-white p-6 md:p-10 shadow-xl border border-slate-200/80 flex flex-col items-center text-center">
            {/* Callout Badge */}
            <span className="px-3.5 py-1 rounded-full bg-[#dbdff4] text-[#5d6274] font-bold text-xs mb-3 uppercase tracking-wider">
              Dedicated Resolution Desk
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-[#1b1b24] tracking-tight mb-2">
              Still have unresolved questions?
            </h2>
            <p className="text-xs md:text-sm text-slate-600 max-w-xl mx-auto mb-8">
              Our dedicated team of academic advisors and technical coordinators are available to help institutions, enterprises, and students.
            </p>

            {/* Help Channels Grid */}
            <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              {/* Channel 1: Email */}
              <div className="p-5 rounded-2xl bg-[#f5f2ff] hover:bg-[#eae6f4] transition-colors flex flex-col justify-between border border-slate-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-xl bg-[#3525cd] text-white flex items-center justify-center shadow-md">
                    <span className="material-symbols-outlined text-[22px]">mail</span>
                  </div>
                  <div>
                    <span className="block font-bold text-sm text-[#1b1b24]">Email Desk</span>
                    <span className="text-[11px] text-slate-500">Guaranteed 24-hr turnaround</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">For general guidance and queries:</p>
                  <a className="text-xs font-bold text-[#3525cd] hover:underline break-all" href="mailto:support@kaushalsetu.in">
                    support@kaushalsetu.in
                  </a>
                </div>
              </div>

              {/* Channel 2: Phone */}
              <div className="p-5 rounded-2xl bg-[#f5f2ff] hover:bg-[#eae6f4] transition-colors flex flex-col justify-between border border-slate-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-xl bg-[#a44100] text-white flex items-center justify-center shadow-md">
                    <span className="material-symbols-outlined text-[22px]">call</span>
                  </div>
                  <div>
                    <span className="block font-bold text-sm text-[#1b1b24]">Institutional Hotline</span>
                    <span className="text-[11px] text-slate-500">Mon - Sat: 9:00 AM - 6:00 PM</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Direct registrar &amp; TPO line:</p>
                  <a className="text-xs font-bold text-[#a44100] hover:underline" href="tel:+911120907388">
                    +91 11-2090-SETU (7388)
                  </a>
                </div>
              </div>

              {/* Channel 3: Documentation & Ticket */}
              <div className="p-5 rounded-2xl bg-[#f5f2ff] hover:bg-[#eae6f4] transition-colors flex flex-col justify-between border border-slate-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-xl bg-[#302f39] text-white flex items-center justify-center shadow-md">
                    <span className="material-symbols-outlined text-[22px]">confirmation_number</span>
                  </div>
                  <div>
                    <span className="block font-bold text-sm text-[#1b1b24]">Support Ticket</span>
                    <span className="text-[11px] text-slate-500">Direct portal tracking</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-2">Raise an escalated ticket directly:</p>
                  <button
                    onClick={() => setShowTicketModal(true)}
                    className="text-xs font-bold text-[#3525cd] hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>Submit Grievance Ticket</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Regulatory Compliance & Standards Banner */}
      <section className="w-full bg-[#eae6f4] py-4 border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-6 flex flex-wrap items-center justify-center gap-6 text-slate-700 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#3525cd] text-[18px]">verified</span>
            <span>Free for State &amp; Central Universities</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#3525cd] text-[18px]">shield</span>
            <span>ISO 27001 Certified Security</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#3525cd] text-[18px]">school</span>
            <span>AICTE &amp; NEP 2020 Aligned</span>
          </div>
        </div>
      </section>

      {/* Support Ticket Modal */}
      {showTicketModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 relative">
            <button
              onClick={() => {
                setShowTicketModal(false);
                setTicketSubmitted(false);
              }}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              ✕
            </button>
            <h3 className="text-xl font-bold text-slate-900 mb-1">Submit Resolution Ticket</h3>
            <p className="text-xs text-slate-500 mb-6">
              Our academic coordinators will resolve your query within 24 business hours.
            </p>

            {ticketSubmitted ? (
              <div className="text-center py-8">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="material-symbols-outlined text-3xl">check_circle</span>
                </div>
                <h4 className="text-base font-bold text-slate-900">Ticket Dispatched Successfully</h4>
                <p className="text-xs text-slate-600 mt-1">
                  Reference ID: <span className="font-mono font-bold text-blue-600">KS-TKT-{Math.floor(100000 + Math.random() * 900000)}</span>
                </p>
                <button
                  onClick={() => {
                    setShowTicketModal(false);
                    setTicketSubmitted(false);
                  }}
                  className="mt-6 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-blue-700"
                >
                  Close Window
                </button>
              </div>
            ) : (
              <form onSubmit={handleTicketSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={ticketName}
                    onChange={(e) => setTicketName(e.target.value)}
                    placeholder="Prof. / Dr. / Student Name"
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={ticketEmail}
                    onChange={(e) => setTicketEmail(e.target.value)}
                    placeholder="name@university.ac.in"
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Subject / Category</label>
                  <input
                    type="text"
                    required
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    placeholder="e.g. DigiLocker APAAR Linkage or FDP Nomination"
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Detailed Message</label>
                  <textarea
                    required
                    rows={4}
                    value={ticketMessage}
                    onChange={(e) => setTicketMessage(e.target.value)}
                    placeholder="Provide relevant details or roll number..."
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-600 outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={ticketLoading}
                  className="w-full py-3 bg-[#3525cd] hover:bg-[#4f46e5] text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  {ticketLoading ? 'Transmitting Ticket...' : 'Dispatch Ticket to Resolution Desk'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
