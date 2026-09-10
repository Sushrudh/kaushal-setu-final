import React from 'react';

interface FooterProps {
  setCurrentPage?: (page: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentPage }) => {
  return (
    <>
      {/* Compliance Trust Bar */}
      <aside className="w-full bg-slate-900 border-t border-slate-800 py-4 px-4 text-center">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-medium text-slate-400">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
              <path clipRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" fillRule="evenodd"></path>
            </svg>
            <span>Free for State &amp; Central Universities</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
              <path clipRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" fillRule="evenodd"></path>
            </svg>
            <span>ISO 27001 Certified Security</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
              <path clipRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" fillRule="evenodd"></path>
            </svg>
            <span>AICTE &amp; NEP 2020 Aligned</span>
          </div>
        </div>
      </aside>

      {/* Main Footer */}
      <footer className="w-full bg-slate-950 text-slate-400 text-xs border-t border-slate-800/80 pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 pb-10 border-b border-slate-800">
            {/* Col 1 & 2: Platform Description */}
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center space-x-3">
                <img
                  alt="Kaushal Setu Logo Small"
                  className="h-8 w-auto bg-white p-0.5 rounded shadow-sm"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDq-7-QrBwoTufG1oRz9ElrTokuDMPzRZLlXaGictC47qQBsQ6bkQT8z1nIxsHRRZaxS7yTijTLhb-KsHbBPDBxuGG1qGqIw9jTf6RCKL6xRPNwPhEYWp0iOvCWXkmPLKXFtGvQP4_S0w-iihaSRnyW8wQ2hMGFHjQoyeuHFWxVMsTVBmEoRqlaKRsGSgLUotdN2h_qCFlIuM7yK45SEjiWFg2vSs-RENfNyASttUVH-1i3qVw0K9CkUOAAMWMWZpH2sg"
                />
                <span className="text-base font-bold text-white tracking-tight">Kaushal Setu</span>
              </div>
              <p className="text-slate-400 leading-relaxed max-w-sm">
                National digital bridge orchestrating seamless synchronization between university curricula, enterprise internship pipelines, and real-time competency matrices.
              </p>
              <div className="pt-2 flex items-center gap-2 text-slate-400">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Skill India Initiative • Ministry of Education Aligned</span>
              </div>
            </div>

            {/* Col 3: Ecosystem Pathways */}
            <div>
              <h3 className="text-white font-semibold text-sm mb-3">Ecosystem</h3>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => setCurrentPage && setCurrentPage('student')}
                    className="hover:text-blue-400 transition-colors text-left"
                  >
                    For Students
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setCurrentPage && setCurrentPage('institution')}
                    className="hover:text-blue-400 transition-colors text-left"
                  >
                    For Universities
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setCurrentPage && setCurrentPage('industry')}
                    className="hover:text-blue-400 transition-colors text-left"
                  >
                    For Industry Partners
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setCurrentPage && setCurrentPage('faq')}
                    className="hover:text-blue-400 transition-colors text-left"
                  >
                    Apprenticeship Drives
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 4: Framework */}
            <div>
              <h3 className="text-white font-semibold text-sm mb-3">Framework</h3>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => setCurrentPage && setCurrentPage('about')}
                    className="hover:text-blue-400 transition-colors text-left"
                  >
                    Curriculum Mapping
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setCurrentPage && setCurrentPage('about')}
                    className="hover:text-blue-400 transition-colors text-left"
                  >
                    AICTE / NEP 2020 Matrix
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setCurrentPage && setCurrentPage('faq')}
                    className="hover:text-blue-400 transition-colors text-left"
                  >
                    Help &amp; FAQ
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 5: Support Desk */}
            <div>
              <h3 className="text-white font-semibold text-sm mb-3">National Helpdesk</h3>
              <p className="text-slate-400 mb-2">New Delhi Knowledge Park V, National Capital Region</p>
              <p className="text-slate-300 font-medium">Toll Free: 1800-112-234</p>
              <p className="text-blue-400 hover:underline mt-1">support@kaushalsetu.in</p>
              <div className="mt-3">
                <span className="inline-block px-2.5 py-1 rounded bg-slate-800 text-[10px] text-slate-300 border border-slate-700">
                  Mon - Sat (9:00 AM - 6:00 PM IST)
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-slate-400 gap-4">
            <div className="flex items-center space-x-2">
              <span>© 2026 Kaushal Setu Initiative. Government of India Collaboration Portal.</span>
            </div>
            <div className="flex items-center space-x-6 text-xs">
              <span className="hover:text-slate-200 transition-colors cursor-pointer">Privacy Policy</span>
              <span className="hover:text-slate-200 transition-colors cursor-pointer">Terms of Service</span>
              <span className="hover:text-slate-200 transition-colors cursor-pointer">Accessibility</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};
