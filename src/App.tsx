/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { SignupPage } from './pages/SignupPage';
import { AboutUsPage } from './pages/AboutUsPage';
import { FaqPage } from './pages/FaqPage';
import { StudentPortal } from './pages/StudentPortal';
import { InstitutionPortal } from './pages/InstitutionPortal';
import { IndustryPortal } from './pages/IndustryPortal';
import { AdminPortal } from './pages/AdminPortal';

function AppContent() {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const { toast } = useAuth();

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage setCurrentPage={setCurrentPage} />;
      case 'signup':
        return <SignupPage setCurrentPage={setCurrentPage} />;
      case 'about':
        return <AboutUsPage setCurrentPage={setCurrentPage} />;
      case 'faq':
        return <FaqPage />;
      case 'student':
        return <StudentPortal />;
      case 'institution':
        return <InstitutionPortal />;
      case 'industry':
        return <IndustryPortal />;
      case 'admin':
        return <AdminPortal />;
      default:
        return <HomePage setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased selection:bg-blue-600 selection:text-white">
      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      
      <main className="flex-grow flex flex-col">
        {renderPage()}
      </main>

      <Footer setCurrentPage={setCurrentPage} />

      {/* Floating Global Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-bounce transition-all">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-2xl text-xs sm:text-sm font-semibold text-white border ${
              toast.type === 'error'
                ? 'bg-rose-700 border-rose-600 shadow-rose-900/40'
                : toast.type === 'success'
                ? 'bg-emerald-700 border-emerald-600 shadow-emerald-900/40'
                : 'bg-blue-800 border-blue-700 shadow-blue-900/40'
            }`}
          >
            <span className="material-symbols-outlined text-base">
              {toast.type === 'error' ? 'error' : toast.type === 'success' ? 'check_circle' : 'info'}
            </span>
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
