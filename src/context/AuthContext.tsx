import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (data: any) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  quickLoginAs: (role: 'student' | 'institution' | 'industry' | 'admin') => Promise<void>;
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('ks_token'));
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const refreshUser = async () => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.data.user) {
        setUser({
          id: data.data.user.id,
          email: data.data.user.email,
          role: data.data.user.role,
          fullName: data.data.user.full_name,
          phone: data.data.user.phone,
          avatar_url: data.data.user.avatar_url,
          studentId: data.data.profile?.id,
          institutionId: data.data.profile?.id,
          industryId: data.data.profile?.id
        });
      } else {
        // Stale token
        localStorage.removeItem('ks_token');
        setToken(null);
        setUser(null);
      }
    } catch {
      // offline / network error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, [token]);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('ks_token', data.data.token);
        setToken(data.data.token);
        setUser(data.data.user);
        showToast(`Welcome back, ${data.data.user.fullName}!`, 'success');
        return { success: true };
      } else {
        const msg = data.error?.message || 'Login failed. Please check your credentials.';
        showToast(msg, 'error');
        return { success: false, error: msg };
      }
    } catch (err: any) {
      const msg = 'Network error. Please try again.';
      showToast(msg, 'error');
      return { success: false, error: msg };
    }
  };

  const signup = async (formData: any): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('ks_token', data.data.token);
        setToken(data.data.token);
        setUser(data.data.user);
        showToast('Account created successfully! Welcome to Kaushal Setu.', 'success');
        return { success: true };
      } else {
        const msg = data.error?.message || 'Registration failed.';
        showToast(msg, 'error');
        return { success: false, error: msg };
      }
    } catch {
      const msg = 'Registration error. Please check inputs.';
      showToast(msg, 'error');
      return { success: false, error: msg };
    }
  };

  const logout = () => {
    localStorage.removeItem('ks_token');
    setToken(null);
    setUser(null);
    showToast('You have been signed out safely.', 'info');
  };

  const quickLoginAs = async (role: 'student' | 'institution' | 'industry' | 'admin') => {
    const creds: Record<string, { email: string; pass: string }> = {
      student: { email: 'aarav.sharma@institution.ac.in', pass: 'Student@12345' },
      institution: { email: 'placement@iitd.ac.in', pass: 'Inst@12345' },
      industry: { email: 'careers@tatainnovations.in', pass: 'Industry@12345' },
      admin: { email: 'admin@kaushalsetu.gov.in', pass: 'Admin@12345' }
    };

    const target = creds[role];
    if (target) {
      await login(target.email, target.pass);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        signup,
        logout,
        quickLoginAs,
        toast,
        showToast,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
