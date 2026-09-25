import React from 'react';
import { User } from '../types';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  currentUser: User | null;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  currentUser,
  onLogout
}) => {
  return (
    <>
      {/* Top Tricolour Indian National Flag Accent Strip */}
      <div aria-label="Tricolour Accent" className="w-full h-1.5 flex sticky top-0 z-50 shadow-sm">
        <div className="h-full w-1/3 bg-[#FF9933]" title="Saffron"></div>
        <div className="h-full w-1/3 bg-white border-y border-slate-200" title="White"></div>
        <div className="h-full w-1/3 bg-[#138808]" title="Green"></div>
      </div>

      {/* Primary Navigation Bar Matching Uploaded Design Exactly */}
      <header className="w-full bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-1.5 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo and Identity */}
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center space-x-3 group text-left cursor-pointer focus:outline-none"
            title="Kaushal Setu Homepage"
          >
            <div className="relative flex items-center justify-center p-1 rounded-xl bg-white border border-slate-200 shadow-sm transition-transform group-hover:scale-105">
              <img
                alt="Kaushal Setu Official Emblem - Academia Industry Collaboration Platform"
                className="h-10 w-auto object-contain"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDv5bUAk5gyvFe2EvMHgmZ_YoM6xSVA85XYnbC381gMV915b8OuFxsaZWRNebdbrdBxPX5eveqvx0EJPOAYIUmUcARp--xbsWh8qGY1NXS84701Q4PyBARphn804rY-QMe3tKXVhKHBY15EJoODxP6hlGCISwGhtSrEj-IWOifOa2TNvFpXeJESxGwfak4DzNmOqnFyP9WdeNU_3H3l6VM1Xo-hmejSJjnjCHix5oIX_b09VAqc5RN9-ELAEwJ1HLJfDw"
              />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xl font-black tracking-tight text-slate-900 leading-tight group-hover:text-blue-700 transition-colors">
                Kaushal Setu
              </span>
              <span className="text-[10px] font-bold tracking-wider text-blue-700 uppercase">
                Academia-Industry Portal
              </span>
            </div>
          </button>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-slate-600">
            {currentView === 'student' || currentView === 'courses' && currentUser?.role === 'student' ? (
              // Clean navigation strictly relevant to the Student Portal
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => onNavigate('student')}
                  className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    currentView === 'student'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => onNavigate('courses')}
                  className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    currentView === 'courses'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100'
                  }`}
                >
                  Courses
                </button>
                <span className="text-xs text-slate-400 font-medium pl-2 border-l border-slate-200">
                  National Skills Gateway
                </span>
              </div>
            ) : (
              <>
                <button
                  onClick={() => onNavigate('home')}
                  className={`py-2 transition-colors cursor-pointer ${
                    currentView === 'home' || currentView === 'login'
                      ? 'text-blue-700 font-bold relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-700 after:rounded-full'
                      : 'hover:text-blue-600'
                  }`}
                >
                  Home
                </button>
                <button
                  onClick={() => onNavigate('courses')}
                  className={`py-2 transition-colors cursor-pointer ${
                    currentView === 'courses'
                      ? 'text-blue-700 font-bold relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-700 after:rounded-full'
                      : 'hover:text-blue-600'
                  }`}
                >
                  Courses
                </button>
                <button
                  onClick={() => onNavigate('about')}
                  className={`py-2 transition-colors cursor-pointer ${
                    currentView === 'about'
                      ? 'text-blue-700 font-bold relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-700 after:rounded-full'
                      : 'hover:text-blue-600'
                  }`}
                >
                  About Us
                </button>
                <button
                  onClick={() => onNavigate('faq')}
                  className={`py-2 transition-colors cursor-pointer ${
                    currentView === 'faq'
                      ? 'text-blue-700 font-bold relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-700 after:rounded-full'
                      : 'hover:text-blue-600'
                  }`}
                >
                  FAQs &amp; Help
                </button>
                <button
                  onClick={() => onNavigate('signup')}
                  className={`py-2 transition-colors cursor-pointer ${
                    currentView === 'signup'
                      ? 'text-blue-700 font-bold relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-700 after:rounded-full'
                      : 'hover:text-blue-600'
                  }`}
                >
                  Sign Up
                </button>

                {/* Portal Direct Shortcuts if authenticated */}
                {currentUser && (
                  <button
                    onClick={() => onNavigate(currentUser.role)}
                    className="py-1.5 px-3 rounded-lg bg-blue-50 text-blue-700 font-semibold text-xs border border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer"
                  >
                    My Portal ({currentUser.role.toUpperCase()})
                  </button>
                )}
              </>
            )}
          </nav>

          {/* Portal Actions / User Session */}
          <div className="flex items-center space-x-3">
            {currentUser ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onNavigate(currentUser.role)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors cursor-pointer"
                  title="Open Portal"
                >
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold uppercase">
                    {currentUser.fullName ? currentUser.fullName[0] : 'U'}
                  </div>
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="text-xs font-bold text-slate-800 leading-tight">
                      {currentUser.fullName.split(' ')[0]}
                    </span>
                    <span className="text-[9px] uppercase tracking-wider font-semibold text-blue-700">
                      {currentUser.role}
                    </span>
                  </div>
                </button>

                <button
                  onClick={onLogout}
                  className="inline-flex items-center justify-center p-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-full transition-all"
                  title="Sign Out"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  onNavigate('home');
                  const el = document.getElementById('sign-in-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center justify-center px-4 py-2 text-xs sm:text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-full transition-all duration-200 shadow-sm cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 mr-1.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
                Portal Access
              </button>
            )}
          </div>
        </div>
      </header>
    </>
  );
};
