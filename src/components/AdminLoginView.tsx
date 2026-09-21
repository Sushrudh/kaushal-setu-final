import React, { useState } from 'react';
import { User } from '../types.js';

interface AdminLoginViewProps {
  onLoginSuccess: (user: User, token: string) => void;
  onNavigate: (view: string) => void;
}

export const AdminLoginView: React.FC<AdminLoginViewProps> = ({
  onLoginSuccess,
  onNavigate
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password,
          rememberMe
        })
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setErrorMessage(
          json.error?.message || 'Invalid administrator credentials. Access restricted to authorized portal administrators.'
        );
        setLoading(false);
        return;
      }

      setSuccessMessage('Administrator authentication verified. Directing to National Gateway Console...');

      setTimeout(() => {
        onLoginSuccess(json.data.user, json.data.token);
      }, 600);
    } catch (err: any) {
      setErrorMessage('Network error connecting to national administrative service. Please retry.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col bg-[#F8FAFC]">
      {/* Sovereign Hero Header Section */}
      <section className="relative bg-[#070d19] text-white pt-14 pb-40 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Ambient Amber & Slate Glows */}
        <div className="absolute top-0 left-1/3 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-10 right-1/4 translate-x-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative max-w-4xl mx-auto flex flex-col items-center text-center z-10">
          {/* Security Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/90 border border-amber-500/30 text-xs font-semibold text-amber-300 shadow-inner mb-6 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            <span>RESTRICTED ACCESS • NATIONAL PLATFORM ADMINISTRATION</span>
          </div>

          {/* Emblem */}
          <div className="mb-6 p-3 rounded-2xl bg-white/95 border border-white/30 shadow-2xl shadow-amber-900/20 backdrop-blur-md">
            <img
              alt="Kaushal Setu Official Emblem"
              className="h-16 md:h-20 w-auto object-contain"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDv5bUAk5gyvFe2EvMHgmZ_YoM6xSVA85XYnbC381gMV915b8OuFxsaZWRNebdbrdBxPX5eveqvx0EJPOAYIUmUcARp--xbsWh8qGY1NXS84701Q4PyBARphn804rY-QMe3tKXVhKHBY15EJoODxP6hlGCISwGhtSrEj-IWOifOa2TNvFpXeJESxGwfak4DzNmOqnFyP9WdeNU_3H3l6VM1Xo-hmejSJjnjCHix5oIX_b09VAqc5RN9-ELAEwJ1HLJfDw"
            />
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-3">
            Admin <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-amber-200">Directorate Portal</span>
          </h1>
          <p className="text-slate-400 max-w-xl text-sm sm:text-base leading-relaxed">
            Centralized National Directorate Access for ecosystem telemetry, curriculum accreditations, and platform-wide user management.
          </p>
        </div>
      </section>

      {/* Main Login Card Section */}
      <main className="relative -mt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-lg mx-auto w-full z-20">
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
          {/* Top National Accent Bar */}
          <div className="w-full h-1.5 flex">
            <div className="h-full w-1/3 bg-[#FF9933]"></div>
            <div className="h-full w-1/3 bg-slate-200"></div>
            <div className="h-full w-1/3 bg-[#138808]"></div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-xl">admin_panel_settings</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 leading-tight">Admin Authentication</h2>
                  <p className="text-[11px] text-slate-500 font-medium">Restricted to Directorate Personnel</p>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                Level-1 Node
              </span>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 font-medium">
                <span className="material-symbols-outlined text-rose-600 text-lg flex-shrink-0 mt-0.5">warning</span>
                <span className="leading-snug">{errorMessage}</span>
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2.5 font-medium">
                <span className="material-symbols-outlined text-emerald-600 text-lg flex-shrink-0">verified_user</span>
                <span>{successMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Administrator Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <span className="material-symbols-outlined text-lg">mail</span>
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="support@kaushalsetu.in"
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Administrative Access Key / Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <span className="material-symbols-outlined text-lg">lock</span>
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter official admin password"
                    className="block w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-lg">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
                  />
                  <span className="text-slate-600 font-medium">Keep session active (30 days)</span>
                </label>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={loading || !email || !password}
                  className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border border-amber-500/20"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
                      <span>Verifying Administrative Authority...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-lg text-amber-400">lock_open</span>
                      <span>Authenticate as Administrator</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Statutory Advisory */}
            <div className="mt-6 p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-900 leading-relaxed">
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-amber-700 text-sm flex-shrink-0 mt-0.5">security</span>
                <span>
                  <strong>Statutory Notice:</strong> This terminal is strictly for designated Directorate administrators. All IP access points, timestamps, and database operations are immutably audited under the Information Technology Act, 2000.
                </span>
              </div>
            </div>

            {/* Return to Public Portal */}
            <div className="mt-6 pt-5 border-t border-slate-100 text-center">
              <button
                type="button"
                onClick={() => onNavigate('home')}
                className="inline-flex items-center gap-1.5 text-xs text-blue-700 hover:text-blue-800 font-semibold hover:underline cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                <span>Return to Student, Institution &amp; Industry Portal</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
