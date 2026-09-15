import React, { useState, useEffect } from 'react';
import { User } from './types';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomeLoginView } from './components/HomeLoginView';
import { SignupView } from './components/SignupView';
import { AboutUsView } from './components/AboutUsView';
import { FaqView } from './components/FaqView';
import { StudentPortal } from './components/StudentPortal';
import { InstitutionPortal } from './components/InstitutionPortal';
import { IndustryPortal } from './components/IndustryPortal';
import { AdminPortal } from './components/AdminPortal';
import { AdminLoginView } from './components/AdminLoginView';
import { StudentCoursesView } from './components/StudentCoursesView';

export default function App() {
  const [currentView, setCurrentView] = useState<string>('home');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Restore authenticated session on mount and support direct route access
  useEffect(() => {
    const checkAuthAndRoute = async () => {
      try {
        const path = window.location.pathname.toLowerCase();
        const hash = window.location.hash.toLowerCase();
        if (path === '/admin' || hash === '#admin') {
          setCurrentView('admin');
        } else if (path === '/admin-login' || hash === '#admin-login') {
          setCurrentView('admin-login');
        }

        const token = localStorage.getItem('ks_token');
        const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};
        const res = await fetch('/api/auth/me', { headers });
        const json = await res.json();
        if (json.success && json.data?.user) {
          setCurrentUser(json.data.user);
        }
      } catch (err) {
        console.warn('No active session found.');
      } finally {
        setLoadingInitial(false);
      }
    };
    checkAuthAndRoute();
  }, []);

  // Scroll to top on navigation
  const handleNavigate = (view: string) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = (user: User, token: string) => {
    if (token) localStorage.setItem('ks_token', token);
    setCurrentUser(user);
    // Direct user to their role-specific portal
    handleNavigate(user.role);
  };

  const handleSignupSuccess = (user: User, token: string) => {
    if (token) localStorage.setItem('ks_token', token);
    setCurrentUser(user);
    handleNavigate(user.role);
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('ks_token');
      const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};
      await fetch('/api/auth/logout', { method: 'POST', headers });
    } catch (e) {
      console.warn('Logout request completed');
    }
    localStorage.removeItem('ks_token');
    setCurrentUser(null);
    handleNavigate('home');
  };

  if (loadingInitial) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Initializing Kaushal Setu National Skills Gateway...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navbar with Tricolour Accent */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main View Switcher */}
      <div className="flex-grow flex flex-col">
        {currentView === 'home' || currentView === 'login' ? (
          <HomeLoginView onLoginSuccess={handleLoginSuccess} onNavigate={handleNavigate} />
        ) : currentView === 'signup' ? (
          <SignupView onSignupSuccess={handleSignupSuccess} onNavigate={handleNavigate} />
        ) : currentView === 'about' ? (
          <AboutUsView onNavigate={handleNavigate} />
        ) : currentView === 'faq' ? (
          <FaqView />
        ) : currentView === 'courses' ? (
          currentUser?.role === 'student' ? (
            <StudentPortal user={currentUser} onLogout={handleLogout} initialTab="courses" />
          ) : (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
              <div className="mb-6 p-6 rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-900 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold mb-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                    <span>National Skills &amp; Academic Curriculum Directory</span>
                  </div>
                  <h1 className="text-2xl font-black text-white">Verified Skill Courses &amp; Micro-Credentials</h1>
                  <p className="text-xs text-blue-200 mt-1 max-w-2xl">
                    Browse accredited courses from leading universities and industry partners. Sign in to your Student Portal to enroll, track lesson progress, and sync verified credits with APAAR &amp; DigiLocker.
                  </p>
                </div>
                {!currentUser && (
                  <button
                    onClick={() => handleNavigate('home')}
                    className="px-5 py-2.5 rounded-xl bg-white text-blue-900 font-bold text-xs hover:bg-blue-50 shadow-md transition-all whitespace-nowrap cursor-pointer"
                  >
                    Sign In to Enroll
                  </button>
                )}
              </div>
              <StudentCoursesView />
            </div>
          )
        ) : currentView === 'student' ? (
          currentUser ? (
            <StudentPortal user={currentUser} onLogout={handleLogout} />
          ) : (
            <HomeLoginView onLoginSuccess={handleLoginSuccess} onNavigate={handleNavigate} />
          )
        ) : currentView === 'institution' ? (
          currentUser ? (
            <InstitutionPortal user={currentUser} onLogout={handleLogout} />
          ) : (
            <HomeLoginView onLoginSuccess={handleLoginSuccess} onNavigate={handleNavigate} />
          )
        ) : currentView === 'industry' ? (
          currentUser ? (
            <IndustryPortal user={currentUser} onLogout={handleLogout} />
          ) : (
            <HomeLoginView onLoginSuccess={handleLoginSuccess} onNavigate={handleNavigate} />
          )
        ) : currentView === 'admin-login' ? (
          <AdminLoginView onLoginSuccess={handleLoginSuccess} onNavigate={handleNavigate} />
        ) : currentView === 'admin' ? (
          !currentUser ? (
            <AdminLoginView onLoginSuccess={handleLoginSuccess} onNavigate={handleNavigate} />
          ) : currentUser.role !== 'admin' ? (
            <div className="flex-grow flex items-center justify-center p-6 bg-slate-50 min-h-[60vh]">
              <div className="bg-white p-8 sm:p-10 rounded-2xl border border-slate-200 shadow-xl max-w-md w-full text-center">
                <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-3xl">gpp_bad</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 text-[10px] font-bold mb-3 border border-rose-200 uppercase">
                  <span>HTTP 403 • Authorization Denied</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Restricted Directorate Portal</h2>
                <p className="text-xs text-slate-600 mb-6 leading-relaxed">
                  Your authenticated session is active as <strong className="text-slate-800 uppercase">{currentUser.role}</strong> ({currentUser.email}). Access to the National Directorate Administrative Console requires verified Administrator credentials.
                </p>
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <button
                    onClick={() => handleNavigate(currentUser.role)}
                    className="w-full sm:w-1/2 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer"
                  >
                    Go to My Portal ({currentUser.role.toUpperCase()})
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full sm:w-1/2 py-2.5 px-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer"
                  >
                    Sign Out &amp; Admin Login
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <AdminPortal user={currentUser} onLogout={handleLogout} />
          )
        ) : (
          <HomeLoginView onLoginSuccess={handleLoginSuccess} onNavigate={handleNavigate} />
        )}
      </div>

      {/* Primary Footer */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}
