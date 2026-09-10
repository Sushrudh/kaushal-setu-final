import React from 'react';

interface AboutUsPageProps {
  setCurrentPage: (page: string) => void;
}

export const AboutUsPage: React.FC<AboutUsPageProps> = ({ setCurrentPage }) => {
  return (
    <main className="w-full bg-[#f8fafc]">
      {/* 1. Atmospheric Hero Section with Innovation Hub / Modern Campus Imagery & Problem Statement */}
      <section className="relative w-full overflow-hidden bg-slate-950 py-20 lg:py-28 text-white min-h-[660px] flex items-center justify-center">
        {/* Background Campus & Collaborative Hub Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            alt="Campus and Industry Innovation Center"
            className="w-full h-full object-cover object-center transform scale-105 filter brightness-75"
            src="https://lh3.googleusercontent.com/aida/AEtjO1XG4HA2iiYejM6RYOvxDPSamHhgPDWS6VfokqWmyDeZnOimLAbDRlX8EplFOp83eOYlb9PXbRPU2AQzpuAx4ehAnVSoCJbanm0hILq0cX8pcurPkzaFz2zDCUFkljbpgrFgqnsTiKaB0HHvekJ_Nawn_SdfGHX_ckyGlMeM-uE2oYXPbTMe4ar7FCPTo_9o8L5k3KWMxDfvahc5DreJtdIWkbWFTVMzQxWTgp0Np8jEA6hvDJKQACzmCAI"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/85 to-slate-900/60"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-950/80 via-slate-900/70 to-indigo-950/80"></div>
        </div>

        {/* Ambient Glowing Orbs */}
        <div className="absolute top-12 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          {/* Central Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold uppercase tracking-wider text-blue-200 mb-6 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>National Digital Skills Gateway • Skill India Aligned</span>
          </div>

          {/* Official Centered Seal with Kaushal Setu Logo */}
          <div className="mb-5 bg-white p-3 rounded-2xl shadow-2xl border border-white/30 inline-block">
            <img
              alt="Kaushal Setu Emblem"
              className="h-16 w-auto object-contain mx-auto"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDmqstBTOHTg2xxjf98qi4VNuE6PzHCWb7yo6Ug_sOATwQXBSW49EEKhXmakYSfoOPnR4btT23KxKeTeYmuuZyc323V87be8-VpQluBRSaipFp09C2wkLZQsltzrMTcVTHUuoj2ogjrCOHKzq8oS2JdthD41B3ZN3ZtIYQZ_qHqznmeBBZWY8y6AmhZSLb9kBrjG95e7X2dYaZsi7tzyKWF98d9-0TwaD0TH2PIRlY-HxUQGEBx95MINT-2-C3mbCtIjw"
            />
          </div>

          <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.15] max-w-4xl">
            Bridging <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300">Talent, Academia</span> &amp; Industry
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-200 max-w-2xl leading-relaxed font-normal">
            Unifying Potential, Empowering India. A unified national gateway engineered to harmonize higher educational curricula with real-time enterprise competencies.
          </p>

          {/* Prominent Glassmorphic Background Card Container: Verbatim Problem Statement */}
          <div className="mt-10 w-full max-w-4xl p-6 sm:p-8 rounded-2xl bg-white/[0.08] backdrop-blur-xl border border-white/20 shadow-2xl text-left">
            <div className="flex items-center gap-3 pb-4 border-b border-white/10">
              <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-300">
                <span className="material-symbols-outlined text-[24px]">crisis_alert</span>
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-300">National Context &amp; Challenge</span>
                <h2 className="text-lg font-bold text-white">The Problem Statement &amp; Background</h2>
              </div>
            </div>
            <p className="mt-5 text-sm sm:text-base text-slate-200 leading-relaxed font-normal">
              A significant gap exists between the skills acquired in academic institutions and the competencies expected by industries. Students often struggle to identify the skills required for their desired career paths, while industries face challenges in finding candidates with the right skill sets. Similarly, academicians have limited visibility into industry internship opportunities that could help them gain practical exposure and align teaching with current industry practices. There is a need for a unified platform that connects students, industries, and academicians, enabling seamless collaboration and skill development.
            </p>

            {/* Key Stakeholder Indicators */}
            <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3 border border-white/10">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-300 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">school</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">Students</p>
                  <p className="text-[11px] text-slate-300">Targeted skill clarity &amp; jobs</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3 border border-white/10">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">domain</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">Industries</p>
                  <p className="text-[11px] text-slate-300">Verified competent candidates</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3 border border-white/10">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">psychology</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">Academicians</p>
                  <p className="text-[11px] text-slate-300">Practical exposure &amp; FDPs</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tricolour Glow Line */}
          <div className="mt-8 flex items-center gap-2">
            <span className="h-1 w-12 rounded-full bg-[#FF9933]"></span>
            <span className="h-1 w-12 rounded-full bg-white"></span>
            <span className="h-1 w-12 rounded-full bg-[#138808]"></span>
          </div>
        </div>
      </section>

      {/* 2. Description Section: The Proposed Solution & Key Features (9 Complete Features) */}
      <section className="py-20 bg-white border-b border-slate-200" id="description">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 mb-3">
              Description &amp; Key Architecture
            </span>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight">
              Centralized Academia–Industry Collaboration Portal
            </h2>
            <p className="mt-3 text-slate-600 text-base leading-relaxed">
              The proposed solution is a centralized Academia–Industry Collaboration Portal that serves as a one-stop platform for students, industries, and academicians.
            </p>
          </div>

          {/* Key Features Grid (9 Complete Features verbatim) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[26px]">quiz</span>
                </div>
                <h3 className="font-display font-bold text-lg text-slate-900 group-hover:text-blue-700 transition-colors">
                  Skill Assessment
                </h3>
                <p className="mt-2.5 text-sm text-slate-600 leading-relaxed">
                  Students complete a questionnaire to evaluate their technical and soft skills shared by industry. The system generates a skill profile and identifies strengths and skill gaps based on current industry requirements.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-slate-200 text-xs font-semibold text-blue-600 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">bar_chart</span>
                <span>Diagnostic Profiling</span>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[26px]">alt_route</span>
                </div>
                <h3 className="font-display font-bold text-lg text-slate-900 group-hover:text-blue-700 transition-colors">
                  Skill Mapping
                </h3>
                <p className="mt-2.5 text-sm text-slate-600 leading-relaxed">
                  Based on the assessment, the platform recommends relevant industries, job roles, and skill development programs aligned with industry requirements.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-slate-200 text-xs font-semibold text-indigo-600 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">tune</span>
                <span>Smart Career Alignment</span>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[26px]">work</span>
                </div>
                <h3 className="font-display font-bold text-lg text-slate-900 group-hover:text-blue-700 transition-colors">
                  Industry Internship &amp; Job Opportunities
                </h3>
                <p className="mt-2.5 text-sm text-slate-600 leading-relaxed">
                  Industries can post internships, projects, apprenticeships, and entry-level job openings with required skills. Students receive recommendations based on their skill profiles and can apply directly.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-slate-200 text-xs font-semibold text-sky-600 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">send</span>
                <span>Direct Application Gateway</span>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[26px]">menu_book</span>
                </div>
                <h3 className="font-display font-bold text-lg text-slate-900 group-hover:text-blue-700 transition-colors">
                  Industry Learning Programs
                </h3>
                <p className="mt-2.5 text-sm text-slate-600 leading-relaxed">
                  Companies can publish training programs, certification courses, workshops, and mentorship initiatives to help students acquire in-demand skills before applying.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-slate-200 text-xs font-semibold text-amber-600 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">verified</span>
                <span>Certified Training Tracks</span>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[26px]">search</span>
                </div>
                <h3 className="font-display font-bold text-lg text-slate-900 group-hover:text-blue-700 transition-colors">
                  Opportunity Search &amp; Tracking
                </h3>
                <p className="mt-2.5 text-sm text-slate-600 leading-relaxed">
                  Allow students to search, apply, and track internship and placement opportunities through a single platform.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-slate-200 text-xs font-semibold text-teal-600 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">timeline</span>
                <span>Single-Window Tracking</span>
              </div>
            </div>

            {/* Feature 6 */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[26px]">account_circle</span>
                </div>
                <h3 className="font-display font-bold text-lg text-slate-900 group-hover:text-blue-700 transition-colors">
                  Academician Dedicated Portal
                </h3>
                <p className="mt-2.5 text-sm text-slate-600 leading-relaxed">
                  Provide a dedicated portal for academicians to explore faculty internships, industrial training, Faculty Development Programs (FDPs), consultancy opportunities, and collaborative research projects.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-slate-200 text-xs font-semibold text-purple-600 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">co_present</span>
                <span>Faculty Exposure &amp; FDPs</span>
              </div>
            </div>

            {/* Feature 7 */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[26px]">handshake</span>
                </div>
                <h3 className="font-display font-bold text-lg text-slate-900 group-hover:text-blue-700 transition-colors">
                  Industry–Academia Collaboration
                </h3>
                <p className="mt-2.5 text-sm text-slate-600 leading-relaxed">
                  Facilitate industry–academia collaboration through mentorship programs, workshops, guest lectures, innovation challenges, and live industry projects.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-slate-200 text-xs font-semibold text-emerald-600 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">hub</span>
                <span>Active Syndication</span>
              </div>
            </div>

            {/* Feature 8 */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[26px]">dashboard</span>
                </div>
                <h3 className="font-display font-bold text-lg text-slate-900 group-hover:text-blue-700 transition-colors">
                  Institutional Dashboards
                </h3>
                <p className="mt-2.5 text-sm text-slate-600 leading-relaxed">
                  Enable institutions to monitor student skill development, internship participation, and placement progress through dashboards and analytics.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-slate-200 text-xs font-semibold text-blue-600 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">analytics</span>
                <span>Placement Telemetry</span>
              </div>
            </div>

            {/* Feature 9 */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[26px]">badge</span>
                </div>
                <h3 className="font-display font-bold text-lg text-slate-900 group-hover:text-blue-700 transition-colors">
                  Digital Portfolio
                </h3>
                <p className="mt-2.5 text-sm text-slate-600 leading-relaxed">
                  Maintain a digital portfolio for students containing verified skills, certifications, projects, internships, and achievements to improve employability.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-slate-200 text-xs font-semibold text-rose-600 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">verified_user</span>
                <span>Verifiable Proof of Work</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Expected Solution Section: Complete Lifecycle Pillars */}
      <section className="py-20 bg-slate-50 border-b border-slate-200" id="expected-solution">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-14">
            <span className="inline-block px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-100/70 border border-blue-200 mb-2">
              The Expected Solution Framework
            </span>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight">
              Secure, Scalable &amp; Intelligent Platform
            </h2>
            <p className="mt-3 text-slate-600 text-base leading-relaxed">
              The solution should provide a secure, scalable, and intelligent platform that supports the complete lifecycle of skill development, internships, and placements.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Lifecycle 1: Skill Development */}
            <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-5 border-b border-slate-100 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[24px]">school</span>
                    </div>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">Pillar 01</span>
                      <h3 className="font-display font-bold text-xl text-slate-900">Skill Development</h3>
                    </div>
                  </div>
                </div>
                <ul className="space-y-4 text-sm text-slate-600 leading-relaxed">
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-[20px] text-blue-600 flex-shrink-0 mt-0.5">check_circle</span>
                    <span>Skill assessment through questionnaires and aptitude tests.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-[20px] text-blue-600 flex-shrink-0 mt-0.5">check_circle</span>
                    <span>Skill profiling and identification of technical and soft skill gaps.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-[20px] text-blue-600 flex-shrink-0 mt-0.5">check_circle</span>
                    <span>Personalized learning recommendations, certification programs, and industry-relevant training.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-[20px] text-blue-600 flex-shrink-0 mt-0.5">check_circle</span>
                    <span>Career guidance based on individual skills, interests, and industry demand.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-[20px] text-blue-600 flex-shrink-0 mt-0.5">check_circle</span>
                    <span>Student digital portfolios showcasing verified skills, certifications, projects, and achievements.</span>
                  </li>
                </ul>
              </div>
              <div className="mt-8 pt-4 border-t border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Phase: Assessment to Capability
              </div>
            </div>

            {/* Lifecycle 2: Internship */}
            <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-5 border-b border-slate-100 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[24px]">assignment</span>
                    </div>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">Pillar 02</span>
                      <h3 className="font-display font-bold text-xl text-slate-900">Internship</h3>
                    </div>
                  </div>
                </div>
                <ul className="space-y-4 text-sm text-slate-600 leading-relaxed">
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-[20px] text-indigo-600 flex-shrink-0 mt-0.5">check_circle</span>
                    <span>Centralized internship portal where industries can post internship opportunities with required skills.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-[20px] text-indigo-600 flex-shrink-0 mt-0.5">check_circle</span>
                    <span>Matching of students to internships based on their skill profiles and career interests.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-[20px] text-indigo-600 flex-shrink-0 mt-0.5">check_circle</span>
                    <span>Internship application and tracking system for students.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-[20px] text-indigo-600 flex-shrink-0 mt-0.5">check_circle</span>
                    <span>Internship opportunities for academicians, industrial training, and Faculty Development Programs (FDPs).</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-[20px] text-indigo-600 flex-shrink-0 mt-0.5">check_circle</span>
                    <span>Progress tracking, mentor feedback, and internship completion records.</span>
                  </li>
                </ul>
              </div>
              <div className="mt-8 pt-4 border-t border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Phase: Practical Exposure &amp; Sprints
              </div>
            </div>

            {/* Lifecycle 3: Placement */}
            <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-5 border-b border-slate-100 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[24px]">verified</span>
                    </div>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Pillar 03</span>
                      <h3 className="font-display font-bold text-xl text-slate-900">Placement</h3>
                    </div>
                  </div>
                </div>
                <ul className="space-y-4 text-sm text-slate-600 leading-relaxed">
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-[20px] text-emerald-600 flex-shrink-0 mt-0.5">check_circle</span>
                    <span>Industry portal for posting job opportunities with required qualifications and skill sets.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-[20px] text-emerald-600 flex-shrink-0 mt-0.5">check_circle</span>
                    <span>Recommendation engine to match students with relevant placement opportunities.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-[20px] text-emerald-600 flex-shrink-0 mt-0.5">check_circle</span>
                    <span>Candidate shortlisting based on skill compatibility and eligibility.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-[20px] text-emerald-600 flex-shrink-0 mt-0.5">check_circle</span>
                    <span>Application tracking and recruitment management for students and recruiters.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-[20px] text-emerald-600 flex-shrink-0 mt-0.5">check_circle</span>
                    <span>Analytics and reporting dashboards for institutions and industries to monitor placement readiness.</span>
                  </li>
                </ul>
              </div>
              <div className="mt-8 pt-4 border-t border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Phase: Enterprise Recruitment &amp; Analytics
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Role-Based CTA: Choose Your Bridge Lane */}
      <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-500/20 border border-blue-400/30 text-xs font-bold uppercase tracking-wider text-blue-300 mb-3">
              Unified Platform Gateway
            </div>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
              Ready to Cross the Bridge?
            </h2>
            <p className="mt-2 text-slate-300 text-base">
              Select your dedicated portal lane to access verified credentials, recruitment pipelines, or academic curricula mapping.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Student Lane */}
            <button
              onClick={() => setCurrentPage('student')}
              className="group p-6 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-blue-500 hover:bg-slate-800 transition-all flex flex-col justify-between text-left cursor-pointer"
            >
              <div>
                <div className="w-12 h-12 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-[28px]">school</span>
                </div>
                <h3 className="font-display font-bold text-lg text-white group-hover:text-blue-400 transition-colors">I am a Student</h3>
                <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                  Build your verified skill portfolio, participate in live company problem statements, and get hired without redundant retraining.
                </p>
              </div>
              <div className="mt-6 flex items-center justify-between text-xs font-bold text-blue-400 pt-4 border-t border-slate-700/60">
                <span>Enter Student Portal</span>
                <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </div>
            </button>

            {/* Institution Lane */}
            <button
              onClick={() => setCurrentPage('institution')}
              className="group p-6 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-blue-500 hover:bg-slate-800 transition-all flex flex-col justify-between text-left cursor-pointer"
            >
              <div>
                <div className="w-12 h-12 rounded-lg bg-sky-600/20 text-sky-400 border border-sky-500/30 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-[28px]">apartment</span>
                </div>
                <h3 className="font-display font-bold text-lg text-white group-hover:text-sky-400 transition-colors">I am an Institution</h3>
                <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                  Harmonize your department's course syllabus with live job markets, manage placement metrics, and integrate with APAAR.
                </p>
              </div>
              <div className="mt-6 flex items-center justify-between text-xs font-bold text-sky-400 pt-4 border-t border-slate-700/60">
                <span>Enter Institute Portal</span>
                <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </div>
            </button>

            {/* Industry Lane */}
            <button
              onClick={() => setCurrentPage('industry')}
              className="group p-6 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-blue-500 hover:bg-slate-800 transition-all flex flex-col justify-between text-left cursor-pointer"
            >
              <div>
                <div className="w-12 h-12 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-[28px]">factory</span>
                </div>
                <h3 className="font-display font-bold text-lg text-white group-hover:text-indigo-400 transition-colors">I am an Industry Leader</h3>
                <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                  Syndicate real-world technical problems, sponsor apprenticeships, and hire pre-evaluated, project-ready graduates.
                </p>
              </div>
              <div className="mt-6 flex items-center justify-between text-xs font-bold text-indigo-400 pt-4 border-t border-slate-700/60">
                <span>Enter Enterprise Portal</span>
                <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </div>
            </button>
          </div>
        </div>
      </section>
    </main>
  );
};
