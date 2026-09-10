import React from 'react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, setCurrentPage }) => {
  const { user, logout, quickLoginAs } = useAuth();

  return (
    <>
      {/* Tricolour Indian National Flag Accent Strip */}
      <div aria-label="Tricolour Accent" className="w-full h-1 flex sticky top-0 z-50 shadow-sm">
        <div className="h-full w-1/3 bg-[#FF9933]" title="Saffron"></div>
        <div className="h-full w-1/3 bg-white" title="White"></div>
        <div className="h-full w-1/3 bg-[#138808]" title="Green"></div>
      </div>

      {/* Primary Navigation Bar */}
      <header className="w-full bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-1 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo and Identity */}
          <button
            onClick={() => setCurrentPage('home')}
            className="flex items-center space-x-3 group text-left cursor-pointer focus:outline-none"
            title="Kaushal Setu Homepage"
          >
            <div className="relative flex items-center justify-center p-1 rounded-lg bg-white border border-slate-100 shadow-sm transition-transform group-hover:scale-105">
              <img
                alt="Kaushal Setu Official Emblem - Academia Industry Collaboration Platform"
                className="h-10 w-auto object-contain"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBCbNkbpn6uAIE47h2phUJPLevyw9nrUeowNz6WkfSrz7NH3MqwPAjLwfPwG62kXPjTNfCoWtu0f1c-GQ-X3AH1joGEHJa8D6ZXkLCzArHJAZXXC-xu-xp4n5Iy7RDz7YabxgzjLHr2ci4M0CM-8B4X-S9WQdG2rulOKxpeefKWu8EEnOavSjDi7oG6lhiiAZvQf6pX_5N_u09qpQk7camD-y0YNQE3cfkzqwNaRnkhej9zKf6xYeSiI2H6-SrTyMr58Q"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-slate-900 leading-tight flex items-center gap-1.5">
                Kaushal Setu
              </span>
              <span className="text-[10px] font-bold tracking-wider text-blue-700 uppercase">
                Academia-Industry Portal
              </span>
            </div>
          </button>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-7 text-sm font-medium text-slate-600">
            <button
              onClick={() => setCurrentPage('home')}
              className={`transition-colors py-2 cursor-pointer ${
                currentPage === 'home' ? 'text-blue-700 font-bold border-b-2 border-blue-700' : 'hover:text-blue-600'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => setCurrentPage('about')}
              className={`transition-colors py-2 cursor-pointer ${
                currentPage === 'about' ? 'text-blue-700 font-bold border-b-2 border-blue-700' : 'hover:text-blue-600'
              }`}
            >
              About Us
            </button>
            <button
              onClick={() => setCurrentPage('faq')}
              className={`transition-colors py-2 cursor-pointer ${
                currentPage === 'faq' ? 'text-blue-700 font-bold border-b-2 border-blue-700' : 'hover:text-blue-600'
              }`}
            >
              FAQs
            </button>
            <button
              onClick={() => setCurrentPage('signup')}
              className={`transition-colors py-2 cursor-pointer ${
                currentPage === 'signup' ? 'text-blue-700 font-bold border-b-2 border-blue-700' : 'hover:text-blue-600'
              }`}
            >
              New Registration
            </button>

            {/* Quick Demo Role Selector Dropdown for Fast Evaluation */}
            <div className="relative group">
              <span className="text-xs px-2.5 py-1 rounded bg-slate-100 text-slate-600 font-semibold cursor-pointer flex items-center gap-1 hover:bg-slate-200">
                <span>Demo Portals</span>
                <span className="text-[10px]">▼</span>
              </span>
              <div className="absolute right-0 mt-1 w-48 bg-white border border-slate-200 shadow-xl rounded-xl py-2 hidden group-hover:block z-50">
                <button
                  onClick={() => { quickLoginAs('student'); setCurrentPage('student'); }}
                  className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center justify-between"
                >
                  <span>Student Portal</span>
                  <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 rounded">Aarav</span>
                </button>
                <button
                  onClick={() => { quickLoginAs('institution'); setCurrentPage('institution'); }}
                  className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center justify-between"
                >
                  <span>Institution Portal</span>
                  <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 rounded">IIT Delhi</span>
                </button>
                <button
                  onClick={() => { quickLoginAs('industry'); setCurrentPage('industry'); }}
                  className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center justify-between"
                >
                  <span>Industry Portal</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 rounded">Tata</span>
                </button>
                <button
                  onClick={() => { quickLoginAs('admin'); setCurrentPage('admin'); }}
                  className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center justify-between"
                >
                  <span>Admin Portal</span>
                  <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 rounded">National</span>
                </button>
              </div>
            </div>
          </nav>

          {/* User Auth Buttons / Portal Access */}
          <div className="flex items-center space-x-3">
            {user ? (
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setCurrentPage(user.role)}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition shadow-sm cursor-pointer"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="capitalize">{user.role} Dashboard</span>
                </button>
                <button
                  onClick={logout}
                  className="text-xs font-semibold px-3 py-1.5 rounded-full border border-slate-300 text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                  title="Sign Out"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  const signInSec = document.getElementById('sign-in-section');
                  if (signInSec) {
                    signInSec.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    setCurrentPage('home');
                  }
                }}
                className="inline-flex items-center justify-center px-4 py-2 text-xs sm:text-sm font-semibold text-blue-700 bg-blue-50/80 hover:bg-blue-100/80 border border-blue-200/80 rounded-full transition-all duration-200 shadow-sm cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 mr-1.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
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
