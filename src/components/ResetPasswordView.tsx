import React, { useState, useEffect } from 'react';

interface ResetPasswordViewProps {
  onNavigate: (view: string) => void;
}

export const ResetPasswordView: React.FC<ResetPasswordViewProps> = ({ onNavigate }) => {
  const [token, setToken] = useState<string>('');
  const [verifying, setVerifying] = useState<boolean>(true);
  const [tokenValid, setTokenValid] = useState<boolean>(false);
  const [tokenError, setTokenError] = useState<string>('');
  const [targetEmail, setTargetEmail] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');

  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>('');
  const [resetSuccess, setResetSuccess] = useState<boolean>(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const urlToken = searchParams.get('token') || searchParams.get('reset_token') || '';

    if (!urlToken) {
      setVerifying(false);
      setTokenValid(false);
      setTokenError('No recovery token was found in the link. Please request a new recovery link.');
      return;
    }

    setToken(urlToken);

    // Verify token with backend
    const checkToken = async () => {
      try {
        const res = await fetch(`/api/auth/verify-reset-token?token=${encodeURIComponent(urlToken)}`);
        const json = await res.json();

        if (res.ok && json.success && json.valid) {
          setTokenValid(true);
          setTargetEmail(json.data?.email || '');
          setFullName(json.data?.fullName || '');
        } else {
          setTokenValid(false);
          setTokenError(json.error?.message || 'This recovery link is invalid, expired, or has already been used.');
        }
      } catch (err) {
        setTokenValid(false);
        setTokenError('Unable to connect to verification server. Please verify your connection and try again.');
      } finally {
        setVerifying(false);
      }
    };

    checkToken();
  }, []);

  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { width: '0%', text: '', color: 'bg-slate-200' };
    if (pwd.length < 6) return { width: '25%', text: 'Weak', color: 'bg-rose-500' };
    if (pwd.length < 8) return { width: '50%', text: 'Fair', color: 'bg-amber-500' };
    if (pwd.length >= 8 && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) {
      return { width: '100%', text: 'Strong (AES-256)', color: 'bg-emerald-500' };
    }
    return { width: '75%', text: 'Good', color: 'bg-blue-500' };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (password.length < 8) {
      setFormError('Password must contain at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match. Please verify both fields.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          password
        })
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setFormError(json.error?.message || 'Failed to reset password. Please try requesting a new link.');
        setSubmitting(false);
        return;
      }

      setResetSuccess(true);
    } catch (err: any) {
      setFormError('Network communication error during password update. Please retry.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Top Tricolour Accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-orange-500 via-white to-emerald-600"></div>

        <div className="p-8 sm:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 text-blue-700 flex items-center justify-center mx-auto mb-4 shadow-inner">
              <span className="material-symbols-outlined text-3xl">lock_reset</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Create New Password
            </h1>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Unified National Skilling & Placement Gateway • Secure Recovery
            </p>
          </div>

          {/* 1. Loading Verification State */}
          {verifying && (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-semibold text-slate-600">Validating secure recovery token...</p>
            </div>
          )}

          {/* 2. Invalid Token State */}
          {!verifying && !tokenValid && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                <div className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-rose-600 text-xl flex-shrink-0">warning</span>
                  <div>
                    <h4 className="font-bold text-rose-900 mb-1">Recovery Link Expired or Invalid</h4>
                    <p className="leading-relaxed">{tokenError}</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs text-slate-600 space-y-2">
                <div className="font-semibold text-slate-900">Why did this happen?</div>
                <ul className="list-disc list-inside space-y-1 text-slate-500">
                  <li>Security recovery links expire automatically after 60 minutes.</li>
                  <li>Each recovery link is single-use and invalidates once consumed.</li>
                  <li>A newer recovery request may have superseded this link.</li>
                </ul>
              </div>

              <button
                type="button"
                onClick={() => onNavigate('home')}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-base">arrow_back</span>
                <span>Return to Login &amp; Request New Link</span>
              </button>
            </div>
          )}

          {/* 3. Success State */}
          {!verifying && tokenValid && resetSuccess && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
                  <span className="material-symbols-outlined text-2xl">check_circle</span>
                </div>
                <h4 className="font-bold text-emerald-950 text-sm mb-1.5">Password Successfully Reset!</h4>
                <p className="leading-relaxed text-emerald-800">
                  Your Kaushal Setu account password has been updated and encrypted. All previous sessions have been closed for security.
                </p>
              </div>

              <button
                type="button"
                onClick={() => onNavigate('home')}
                className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/25 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Sign In with New Password</span>
                <span className="material-symbols-outlined text-lg">login</span>
              </button>
            </div>
          )}

          {/* 4. Password Input Form */}
          {!verifying && tokenValid && !resetSuccess && (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Account Banner */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                  {fullName ? fullName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-800 truncate">{fullName || 'Kaushal Setu Member'}</p>
                  <p className="text-[11px] text-slate-500 truncate">{targetEmail}</p>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                  Verified
                </span>
              </div>

              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium">
                  <span className="material-symbols-outlined text-rose-600 text-base">error</span>
                  <span>{formError}</span>
                </div>
              )}

              {/* New Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="new-password">
                  New Password
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <span className="material-symbols-outlined text-lg">key</span>
                  </div>
                  <input
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="block w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
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

                {/* Password Strength Meter */}
                {password && (
                  <div className="mt-2 space-y-1">
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${strength.color} transition-all duration-300`}
                        style={{ width: strength.width }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-slate-500">
                      <span>Security Strength</span>
                      <span className="font-semibold text-slate-700">{strength.text}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="confirm-password">
                  Confirm New Password
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <span className="material-symbols-outlined text-lg">lock</span>
                  </div>
                  <input
                    id="confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="block w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                  />
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-[11px] text-rose-600 mt-1 font-medium">Passwords do not match.</p>
                )}
              </div>

              {/* Criteria list */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-500 space-y-1">
                <p className="font-semibold text-slate-700">Password Requirements:</p>
                <div className="flex items-center gap-1.5">
                  <span className={`material-symbols-outlined text-sm ${password.length >= 8 ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {password.length >= 8 ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                  <span>Minimum 8 characters</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`material-symbols-outlined text-sm ${/[A-Z]/.test(password) && /[0-9]/.test(password) ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {/[A-Z]/.test(password) && /[0-9]/.test(password) ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                  <span>Includes numbers and capital letters (recommended)</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting || password.length < 8 || password !== confirmPassword}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <span>Update Password</span>
                    <span className="material-symbols-outlined text-base">check</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => onNavigate('home')}
                className="w-full py-2.5 text-center text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer transition"
              >
                Cancel and return to login
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
