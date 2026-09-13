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
import { StudentCoursesView } from './components/StudentCoursesView';

export default function App() {
  const [currentView, setCurrentView] = useState<string>('home');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Restore authenticated session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
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
    checkAuth();
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

  // Quick Persona Impersonation for review
  const switchRole = async (targetRole: 'student' | 'institution' | 'industry' | 'admin') => {
    const creds = {
      student: { email: 'student@kaushalsetu.in', password: 'Kaushal@2025' },
      institution: { email: 'institution@kaushalsetu.in', password: 'Kaushal@2025' },
      industry: { email: 'industry@kaushalsetu.in', password: 'Kaushal@2025' },
      admin: { email: 'admin@kaushalsetu.gov.in', password: 'Admin@Setu2025' }
    }[targetRole];

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(creds)
      });
      const json = await res.json();
      if (json.success) {
        if (json.data?.token) {
          localStorage.setItem('ks_token', json.data.token);
        }
        setCurrentUser(json.data.user);
        handleNavigate(targetRole);
      }
    } catch (e) {
      console.error('Failed to switch persona', e);
    }
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
        ) : currentView === 'admin' ? (
          currentUser ? (
            <AdminPortal user={currentUser} onLogout={handleLogout} />
          ) : (
            <HomeLoginView onLoginSuccess={handleLoginSuccess} onNavigate={handleNavigate} />
          )
        ) : (
          <HomeLoginView onLoginSuccess={handleLoginSuccess} onNavigate={handleNavigate} />
        )}
      </div>

      {/* Floating Reviewer Role Switcher Toolbar */}
      <div className="fixed bottom-4 right-4 z-50 bg-slate-950/90 text-white backdrop-blur-md px-3.5 py-2.5 rounded-2xl shadow-2xl border border-slate-800 flex items-center gap-2">
        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider hidden sm:inline">
          Persona Switch:
        </span>
        <button
          onClick={() => switchRole('student')}
          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
            currentUser?.role === 'student' && currentView === 'student'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
          }`}
          title="Switch to Student Persona (Aarav Sharma)"
        >
          Student
        </button>
        <button
          onClick={() => switchRole('institution')}
          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
            currentUser?.role === 'institution' && currentView === 'institution'
              ? 'bg-purple-600 text-white'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
          }`}
          title="Switch to Institution Persona (Delhi Tech Univ)"
        >
          University
        </button>
        <button
          onClick={() => switchRole('industry')}
          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
            currentUser?.role === 'industry' && currentView === 'industry'
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
          }`}
          title="Switch to Industry Persona (Tata Consultancy Services)"
        >
          Industry
        </button>
        <button
          onClick={() => switchRole('admin')}
          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
            currentUser?.role === 'admin' && currentView === 'admin'
              ? 'bg-amber-600 text-white'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
          }`}
          title="Switch to Admin Nodal Persona"
        >
          Admin
        </button>
      </div>

      {/* Primary Footer */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}
