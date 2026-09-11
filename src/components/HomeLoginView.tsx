import React, { useState } from 'react';
import { User } from '../types';

interface HomeLoginViewProps {
  onLoginSuccess: (user: User, token: string) => void;
  onNavigate: (view: string) => void;
}

export const HomeLoginView: React.FC<HomeLoginViewProps> = ({ onLoginSuccess, onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [carouselIndex, setCarouselIndex] = useState(0);

  const carouselItems = [
    {
      title: 'Bridging Skills',
      desc: 'Closing the gap between academic learning and industry requirements through targeted skill development programs.'
    },
    {
      title: 'Verified Industry Internships',
      desc: 'Direct placement gateway backed by DigiLocker and National Academic Depository credential validation.'
    },
    {
      title: 'Curriculum & FDP Alignment',
      desc: 'Enabling universities and polytechnics to harmonize syllabus with real-world enterprise technology standards.'
    }
  ];

  const handleNextSlide = () => {
    setCarouselIndex((prev) => (prev + 1) % carouselItems.length);
  };

  const handlePrevSlide = () => {
    setCarouselIndex((prev) => (prev - 1 + carouselItems.length) % carouselItems.length);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password, rememberMe })
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setErrorMessage(json.error?.message || 'Login failed. Please check your credentials.');
        setLoading(false);
        return;
      }

      onLoginSuccess(json.data.user, json.data.token);
    } catch (err: any) {
      setErrorMessage('Network error connecting to national authentication service. Please retry.');
      setLoading(false);
    }
  };

  const fillDemoCredentials = (role: 'student' | 'institution' | 'industry' | 'admin') => {
    setErrorMessage('');
    if (role === 'student') {
      setEmail('student@kaushalsetu.in');
      setPassword('Kaushal@2025');
    } else if (role === 'institution') {
      setEmail('institution@kaushalsetu.in');
      setPassword('Kaushal@2025');
    } else if (role === 'industry') {
      setEmail('industry@kaushalsetu.in');
      setPassword('Kaushal@2025');
    } else if (role === 'admin') {
      setEmail('admin@kaushalsetu.gov.in');
      setPassword('Admin@Setu2025');
    }
  };

  const handleGoogleSSO = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'student@kaushalsetu.in', fullName: 'Aarav Sharma', role: 'student' })
      });
      const json = await res.json();
      if (json.success) {
        onLoginSuccess(json.data.user, json.data.token);
      } else {
        setErrorMessage(json.error?.message || 'Google SSO authorization failed.');
      }
    } catch (err) {
      setErrorMessage('Google SSO service failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col">
      {/* 1. HERO / INTRO SECTION - Pixel-accurate to login(1).html */}
      <section className="relative flex flex-col items-center justify-center py-20 md:py-28 px-6 md:px-16 border-b border-slate-200 overflow-hidden">
        {/* Background Canvas */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://lh3.googleusercontent.com/aida/AEtjO1VILgTRw5BnwxFhdJG3VjRrqKg3JGDytnVn3nlJYauF-ifVWqdDwU_eb-hbelVQfQoetMb7DFywf9xTCTQAKvf_e5fhMe1MJHmqwQmM9K8oUvN-I-e3Vx8T96dkYTS76dwUzIBQy01ehHIe7LNcXi96cbI7-OVf4OzHNSkKxkxLmlBO5WaqVx413aH6Jo0HQVOKEAtw1gN5iMOAmJ4Xs2mAH4usY96rXqIS4wAO0ca6q5u_luTHnxcCcFs')`
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/80 to-slate-950/95 backdrop-blur-[2px]"></div>
        </div>

        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] md:w-[900px] h-[400px] bg-gradient-to-tr from-amber-500/20 via-blue-500/15 to-emerald-500/20 blur-3xl pointer-events-none rounded-full z-0"></div>

        <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center text-center">
          {/* National Skill Gateway Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-xs font-medium mb-8 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>National Digital Skills Gateway • Skill India Aligned</span>
          </div>

          {/* Logo Card */}
          <div className="mb-8 flex justify-center transform hover:scale-105 transition-transform duration-300">
            <div className="p-3 rounded-2xl bg-white/95 backdrop-blur-md shadow-2xl border border-white/40 ring-4 ring-white/10">
              <img
                alt="Kaushal Setu Logo"
                className="h-24 md:h-28 w-auto object-contain"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDv5bUAk5gyvFe2EvMHgmZ_YoM6xSVA85XYnbC381gMV915b8OuFxsaZWRNebdbrdBxPX5eveqvx0EJPOAYIUmUcARp--xbsWh8qGY1NXS84701Q4PyBARphn804rY-QMe3tKXVhKHBY15EJoODxP6hlGCISwGhtSrEj-IWOifOa2TNvFpXeJESxGwfak4DzNmOqnFyP9WdeNU_3H3l6VM1Xo-hmejSJjnjCHix5oIX_b09VAqc5RN9-ELAEwJ1HLJfDw"
              />
            </div>
          </div>

          {/* Interactive Carousel Card */}
          <div className="w-full max-w-2xl mb-10 relative group">
            <div className="overflow-hidden rounded-2xl border border-white/20 shadow-2xl bg-slate-900/60 backdrop-blur-xl transition-all duration-300 hover:border-white/30">
              <div className="relative h-64 md:h-72 flex items-center justify-center p-6">
                <div className="w-full h-full flex flex-col items-center justify-center text-center">
                  <div className="flex items-center gap-1.5 mb-3">
                    <div className="w-8 h-1 rounded-full bg-[#FF9933]"></div>
                    <div className="w-8 h-1 rounded-full bg-white"></div>
                    <div className="w-8 h-1 rounded-full bg-[#138808]"></div>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 tracking-tight">
                    {carouselItems[carouselIndex].title}
                  </h3>
                  <p className="text-white/85 text-base md:text-lg max-w-lg leading-relaxed font-normal">
                    {carouselItems[carouselIndex].desc}
                  </p>
                </div>

                {/* Left Arrow */}
                <button
                  type="button"
                  onClick={handlePrevSlide}
                  className="absolute left-4 p-2 rounded-full bg-white/10 hover:bg-white/25 text-white transition-all backdrop-blur-md border border-white/10 shadow-md cursor-pointer"
                  aria-label="Previous Slide"
                >
                  <span className="material-symbols-outlined text-xl leading-none">chevron_left</span>
                </button>

                {/* Right Arrow */}
                <button
                  type="button"
                  onClick={handleNextSlide}
                  className="absolute right-4 p-2 rounded-full bg-white/10 hover:bg-white/25 text-white transition-all backdrop-blur-md border border-white/10 shadow-md cursor-pointer"
                  aria-label="Next Slide"
                >
                  <span className="material-symbols-outlined text-xl leading-none">chevron_right</span>
                </button>

                {/* Dot Indicators */}
                <div className="absolute bottom-4 flex gap-2 items-center">
                  {carouselItems.map((_, i) => (
                    <div
                      key={i}
                      onClick={() => setCarouselIndex(i)}
                      className={`cursor-pointer transition-all ${
                        carouselIndex === i
                          ? 'w-6 h-2 rounded-full bg-[#FF9933]'
                          : 'w-2 h-2 rounded-full bg-white/40 hover:bg-white/70'
                      }`}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
            {/* Tricolour Accent Line */}
            <div className="absolute -bottom-1 left-4 right-4 h-1 flex rounded-full overflow-hidden shadow-sm">
              <div className="w-1/3 h-full bg-[#FF9933]"></div>
              <div className="w-1/3 h-full bg-white"></div>
              <div className="w-1/3 h-full bg-[#138808]"></div>
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl text-white font-extrabold tracking-tight leading-tight mb-6 text-center max-w-3xl drop-shadow-md">
            Bridging Potential to Excellence.
          </h1>

          <p className="text-base md:text-xl text-white/90 leading-relaxed font-normal mb-10 text-center max-w-2xl mx-auto drop-shadow-sm">
            Kaushal Setu is the premier digital bridge connecting ambitious academia with industry leaders. We streamline collaboration, accelerate innovation, and align educational outcomes with real-world technological demands.
          </p>

          {/* Problem Statement Card */}
          <div className="w-full max-w-3xl rounded-2xl border border-white/15 bg-slate-950/70 backdrop-blur-xl shadow-2xl p-8 md:p-10 relative overflow-hidden text-center mt-2">
            <div className="absolute top-0 inset-x-0 h-1.5 flex">
              <div className="w-1/3 h-full bg-[#FF9933]"></div>
              <div className="w-1/3 h-full bg-white"></div>
              <div className="w-1/3 h-full bg-[#138808]"></div>
            </div>
            <div className="mb-6">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-600/20 text-blue-300 border border-blue-400/30 uppercase tracking-widest mb-2">
                Problem Statement
              </span>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-2">Description</h2>
              <p className="text-sky-300 font-semibold text-xs md:text-sm uppercase tracking-wider">
                Portal for Academia - Industry Collaboration
              </p>
            </div>
            <div className="space-y-5 text-white/90 font-normal leading-relaxed text-center">
              <p className="text-sm md:text-base text-white/80 max-w-2xl mx-auto">
                A significant gap exists between the skills acquired in academic institutions and the competencies expected by industries.{' '}
                <span className="text-white font-medium">Students</span> often struggle to identify the skills required for their desired career paths, while{' '}
                <span className="text-white font-medium">industries</span> face challenges in finding candidates with the right skill sets.
              </p>
              <div className="pt-5 border-t border-white/10">
                <p className="text-sm md:text-base font-semibold text-amber-200/95 max-w-2xl mx-auto leading-snug">
                  There is a need for a unified platform that connects{' '}
                  <span className="text-white underline decoration-[#FF9933] underline-offset-4">students</span>,{' '}
                  <span className="text-white underline decoration-white underline-offset-4">industries</span>, and{' '}
                  <span className="text-white underline decoration-[#138808] underline-offset-4">academicians</span>, enabling seamless collaboration and skill development.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. LOGIN / PORTAL ACCESS SECTION */}
      <section
        className="flex-grow flex flex-col justify-center py-20 px-6 md:px-16 bg-gradient-to-b from-slate-50 via-slate-100 to-slate-200 z-10 relative items-center border-t border-slate-300"
        id="sign-in-section"
      >
        <div className="w-full max-w-lg mx-auto relative z-10">
          <div className="relative rounded-2xl p-[1.5px] bg-gradient-to-b from-white via-slate-200 to-slate-300 shadow-2xl">
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-8 sm:p-10 relative overflow-hidden">
              {/* Tricolour Ribbon Top */}
              <div className="absolute top-0 inset-x-0 h-1.5 flex">
                <div className="w-1/3 h-full bg-[#FF9933] shadow-sm"></div>
                <div className="w-1/3 h-full bg-white"></div>
                <div className="w-1/3 h-full bg-[#138808] shadow-sm"></div>
              </div>

              {/* Title & Icon Header */}
              <div className="mb-8 text-center relative">
                <div className="inline-flex relative mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-700 to-blue-600 p-0.5 shadow-lg shadow-blue-600/30 flex items-center justify-center">
                    <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-blue-700 group">
                      <span className="material-symbols-outlined text-3xl transition-transform group-hover:scale-110">
                        lock_open_right
                      </span>
                    </div>
                  </div>
                  <div className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
                    <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 items-center justify-center text-white text-[9px] font-bold">
                      ✓
                    </span>
                  </div>
                </div>

                <div className="inline-block px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-bold uppercase tracking-wider mb-2">
                  Secure Portal Access
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
                  Sign in to your account
                </h2>
                <p className="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed">
                  Connect directly with premier industry programs, verified credentials, and institutional resources.
                </p>
              </div>

              {/* Federated Social SSO Buttons */}
              <div className="grid grid-cols-3 gap-2.5 mb-6">
                <button
                  type="button"
                  onClick={handleGoogleSSO}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-blue-400 hover:shadow-md transition-all text-xs font-semibold text-slate-700 cursor-pointer"
                  title="Continue with Google"
                >
                  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"></path>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"></path>
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"></path>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"></path>
                  </svg>
                  <span className="truncate">Google</span>
                </button>

                <button
                  type="button"
                  onClick={() => fillDemoCredentials('institution')}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-blue-400 hover:shadow-md transition-all text-xs font-semibold text-slate-700 cursor-pointer"
                  title="Apple SSO / Campus"
                >
                  <svg className="w-4 h-4 fill-current text-slate-900 flex-shrink-0" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 1.01-2.87-.96.04-2.07.65-2.73 1.42-.56.64-.99 1.7-1.02 2.76 1.08.08 2.15-.55 2.74-1.31z"></path>
                  </svg>
                  <span className="truncate">Apple</span>
                </button>

                <button
                  type="button"
                  onClick={() => fillDemoCredentials('industry')}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-blue-400 hover:shadow-md transition-all text-xs font-semibold text-slate-700 cursor-pointer"
                  title="Microsoft SSO"
                >
                  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 21 21">
                    <path fill="#f25022" d="M1 1h9v9H1z"></path>
                    <path fill="#00a4ef" d="M1 11h9v9H1z"></path>
                    <path fill="#7fba00" d="M11 1h9v9h-9z"></path>
                    <path fill="#ffb900" d="M11 11h9v9h-9z"></path>
                  </svg>
                  <span className="truncate">Microsoft</span>
                </button>
              </div>

              {/* Section Divider */}
              <div className="relative flex items-center justify-center mb-6">
                <div className="w-full border-t border-slate-200"></div>
                <span className="absolute px-3 bg-white text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Or continue with credentials
                </span>
              </div>

              {/* Error Announcement */}
              {errorMessage && (
                <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium">
                  <span className="material-symbols-outlined text-rose-600 text-base">error</span>
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Credential Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between" htmlFor="email">
                    <span>Email address</span>
                    <span className="text-[10px] text-slate-400 font-normal">Institutional or Personal</span>
                  </label>
                  <div className="relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <span className="material-symbols-outlined text-lg">mail</span>
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="name@institution.ac.in"
                      className="block w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-700" htmlFor="password">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setErrorMessage('For password recovery, an OTP link can be dispatched to your registered address.')}
                      className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <span className="material-symbols-outlined text-lg">key</span>
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••••••"
                      className="block w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      <span className="material-symbols-outlined text-lg">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 pb-1">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-xs font-medium text-slate-600">Remember credentials</span>
                  </label>
                  <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                    <span className="material-symbols-outlined text-xs">verified_user</span> 256-bit SSL
                  </span>
                </div>

                {/* Primary Sign In Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full relative group overflow-hidden rounded-xl p-[1px] shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/35 transition-all duration-300 transform active:scale-[0.99] cursor-pointer"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#FF9933] via-blue-600 to-[#138808] transition-all duration-500 opacity-90 group-hover:opacity-100"></div>
                  <div className="relative flex items-center justify-center gap-2 py-3.5 px-6 rounded-[11px] bg-gradient-to-r from-blue-700 to-indigo-700 text-white font-semibold text-sm transition-colors group-hover:bg-opacity-95">
                    <span>{loading ? 'Authenticating with Gateway...' : 'Sign in to Kaushal Setu'}</span>
                    <span className="material-symbols-outlined text-base font-bold transition-transform group-hover:translate-x-1">
                      arrow_forward
                    </span>
                  </div>
                </button>

                <div className="text-center pt-2">
                  <span className="text-xs text-slate-500">New learner or organization? </span>
                  <button
                    type="button"
                    onClick={() => onNavigate('signup')}
                    className="text-xs font-bold text-blue-600 hover:underline ml-1 cursor-pointer"
                  >
                    Sign up now →
                  </button>
                </div>
              </form>

              {/* Institutional Request Access CTA */}
              <div className="mt-6 pt-5 border-t border-slate-100">
                <div className="text-center mb-3">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Institutional &amp; Enterprise Access
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => fillDemoCredentials('institution')}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-200 hover:border-blue-400 text-xs font-semibold text-slate-700 hover:text-blue-700 transition-all bg-slate-50 hover:bg-white hover:shadow-md cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base text-blue-600">domain_add</span>
                  <span>Request Institutional &amp; Industry Access</span>
                </button>
              </div>

              {/* Quick 1-Click Role Testing Drawer */}
              <div className="mt-6 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-2 flex items-center justify-between">
                  <span>Quick Test Personas (1-Click Fill):</span>
                  <span className="text-emerald-600 font-semibold">Active Database Seeded</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  <button
                    type="button"
                    onClick={() => fillDemoCredentials('student')}
                    className="px-2 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium border border-blue-200 hover:bg-blue-100 transition-colors text-center cursor-pointer"
                  >
                    Student
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemoCredentials('institution')}
                    className="px-2 py-1.5 rounded-lg bg-purple-50 text-purple-700 text-xs font-medium border border-purple-200 hover:bg-purple-100 transition-colors text-center cursor-pointer"
                  >
                    University
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemoCredentials('industry')}
                    className="px-2 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200 hover:bg-emerald-100 transition-colors text-center cursor-pointer"
                  >
                    Industry
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemoCredentials('admin')}
                    className="px-2 py-1.5 rounded-lg bg-amber-50 text-amber-800 text-xs font-medium border border-amber-200 hover:bg-amber-100 transition-colors text-center cursor-pointer"
                  >
                    Admin
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
