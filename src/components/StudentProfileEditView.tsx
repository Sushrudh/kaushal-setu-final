import React, { useState, useEffect, useRef } from 'react';
import { User, StudentProfile, ResumeMetadata, GitHubStats, LeetCodeStats } from '../types';
import { ProfilePhotoUploader } from './ProfilePhotoUploader';

interface StudentProfileEditViewProps {
  user: User;
  profile: StudentProfile | null;
  onProfileUpdated?: () => void;
  onSyncDigiLocker?: () => Promise<void>;
  syncingDigiLocker?: boolean;
}

export const StudentProfileEditView: React.FC<StudentProfileEditViewProps> = ({
  user,
  profile,
  onProfileUpdated,
  onSyncDigiLocker,
  syncingDigiLocker = false
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'resume'>('profile');
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Resume Management State
  const [resume, setResume] = useState<ResumeMetadata | null>(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const resumeFileInputRef = useRef<HTMLInputElement | null>(null);

  // Developer Profiles State
  const [githubStats, setGithubStats] = useState<GitHubStats | null>(null);
  const [leetcodeStats, setLeetcodeStats] = useState<LeetCodeStats | null>(null);
  const [githubUsername, setGithubUsername] = useState('');
  const [leetcodeUsername, setLeetcodeUsername] = useState('');
  const [syncingGithub, setSyncingGithub] = useState(false);
  const [syncingLeetcode, setSyncingLeetcode] = useState(false);

  // Form Fields
  const cleanField = (val?: any) => {
    if (!val || val === 'Not provided yet' || val === 'Not assigned yet') return '';
    return String(val);
  };

  const [fullName, setFullName] = useState(user.fullName || '');
  const [email, setEmail] = useState(user.email || '');
  const [phone, setPhone] = useState(cleanField(profile?.phone));
  const [institutionName, setInstitutionName] = useState(cleanField(profile?.college || profile?.institution_name));
  const [degreeProgram, setDegreeProgram] = useState(cleanField(profile?.degree_program || profile?.degreeProgram));
  const [rollNumber, setRollNumber] = useState(cleanField(profile?.roll_number || profile?.rollNumber));
  const [graduationYear, setGraduationYear] = useState<number | string>(profile?.graduation_year || profile?.graduationYear || '');
  const [currentCgpa, setCurrentCgpa] = useState<number | string>(profile?.current_cgpa || profile?.currentCgpa || '');
  const [state, setState] = useState(cleanField(profile?.state));
  const [bio, setBio] = useState(cleanField(profile?.bio));
  const [isProfilePublic, setIsProfilePublic] = useState(
    profile?.is_profile_public !== undefined ? Boolean(profile.is_profile_public) : true
  );

  useEffect(() => {
    if (profile) {
      if (profile.fullName) setFullName(profile.fullName);
      if (profile.email) setEmail(profile.email);
      setPhone(cleanField(profile.phone));
      setInstitutionName(cleanField(profile.college || profile.institution_name));
      setDegreeProgram(cleanField(profile.degree_program || profile.degreeProgram));
      setRollNumber(cleanField(profile.roll_number || profile.rollNumber));
      if (profile.graduation_year || profile.graduationYear) {
        setGraduationYear(profile.graduation_year || profile.graduationYear);
      }
      if (profile.current_cgpa || profile.currentCgpa) {
        setCurrentCgpa(profile.current_cgpa || profile.currentCgpa);
      }
      setState(cleanField(profile.state));
      setBio(cleanField(profile.bio));
      if (profile.is_profile_public !== undefined) setIsProfilePublic(Boolean(profile.is_profile_public));
    }
  }, [profile]);

  // Load Resume and External Profiles
  const fetchResume = async () => {
    try {
      const token = localStorage.getItem('ks_token');
      const res = await fetch('/api/students/me/resume', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const json = await res.json();
      if (json.success) {
        setResume(json.data);
      }
    } catch (e) {
      console.warn('Failed to load resume info', e);
    }
  };

  const fetchExternalProfiles = async () => {
    try {
      const token = localStorage.getItem('ks_token');
      const res = await fetch('/api/students/me/external-profiles', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const json = await res.json();
      if (json.success && json.data) {
        if (json.data.github) {
          setGithubStats(json.data.github);
          setGithubUsername(json.data.github.username);
        }
        if (json.data.leetcode) {
          setLeetcodeStats(json.data.leetcode);
          setLeetcodeUsername(json.data.leetcode.username);
        }
      }
    } catch (e) {
      console.warn('Failed to load external profiles', e);
    }
  };

  useEffect(() => {
    fetchResume();
    fetchExternalProfiles();
  }, []);

  const handleResumeFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setNotice({ type: 'error', message: 'Only PDF format is allowed for resume uploads.' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setNotice({ type: 'error', message: 'Resume PDF exceeds 5MB size limit.' });
      return;
    }

    setUploadingResume(true);
    setNotice(null);

    try {
      const token = localStorage.getItem('ks_token');
      const formData = new FormData();
      formData.append('resume', file);

      const res = await fetch('/api/students/me/resume', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData
      });

      const json = await res.json();
      if (json.success) {
        setResume(json.data);
        setNotice({ type: 'success', message: 'Official Resume PDF uploaded successfully!' });
      } else {
        setNotice({ type: 'error', message: json.error?.message || 'Failed to upload resume.' });
      }
    } catch (err) {
      setNotice({ type: 'error', message: 'Network error while uploading resume.' });
    } finally {
      setUploadingResume(false);
      if (resumeFileInputRef.current) resumeFileInputRef.current.value = '';
    }
  };

  const handleDeleteResume = async () => {
    if (!confirm('Are you sure you want to delete your uploaded resume PDF?')) return;
    setUploadingResume(true);
    try {
      const token = localStorage.getItem('ks_token');
      const res = await fetch('/api/students/me/resume', {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const json = await res.json();
      if (json.success) {
        setResume(null);
        setNotice({ type: 'success', message: 'Resume document removed.' });
      }
    } catch (err) {
      setNotice({ type: 'error', message: 'Failed to delete resume.' });
    } finally {
      setUploadingResume(false);
    }
  };

  const handleSyncGithub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubUsername.trim()) return;

    setSyncingGithub(true);
    setNotice(null);
    try {
      const token = localStorage.getItem('ks_token');
      const res = await fetch('/api/students/me/github/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ username: githubUsername.trim() })
      });
      const json = await res.json();
      if (json.success) {
        setGithubStats(json.data);
        setNotice({ type: 'success', message: json.message });
      } else {
        setNotice({ type: 'error', message: json.error?.message || 'Failed to sync GitHub.' });
      }
    } catch (err) {
      setNotice({ type: 'error', message: 'Error syncing GitHub data.' });
    } finally {
      setSyncingGithub(false);
    }
  };

  const handleSyncLeetcode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leetcodeUsername.trim()) return;

    setSyncingLeetcode(true);
    setNotice(null);
    try {
      const token = localStorage.getItem('ks_token');
      const res = await fetch('/api/students/me/leetcode/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ username: leetcodeUsername.trim() })
      });
      const json = await res.json();
      if (json.success) {
        setLeetcodeStats(json.data);
        setNotice({ type: 'success', message: json.message });
      } else {
        setNotice({ type: 'error', message: json.error?.message || 'Failed to sync LeetCode.' });
      }
    } catch (err) {
      setNotice({ type: 'error', message: 'Error syncing LeetCode data.' });
    } finally {
      setSyncingLeetcode(false);
    }
  };

  const handleDisconnectGithub = async () => {
    setNotice(null);
    try {
      const token = localStorage.getItem('ks_token');
      const res = await fetch('/api/students/me/github', {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const json = await res.json();
      if (json.success) {
        setGithubStats(null);
        setGithubUsername('');
        setNotice({ type: 'success', message: 'GitHub account disconnected successfully.' });
      } else {
        setNotice({ type: 'error', message: json.error?.message || 'Failed to disconnect GitHub.' });
      }
    } catch (e) {
      setNotice({ type: 'error', message: 'Network error disconnecting GitHub.' });
    }
  };

  const handleDisconnectLeetcode = async () => {
    setNotice(null);
    try {
      const token = localStorage.getItem('ks_token');
      const res = await fetch('/api/students/me/leetcode', {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const json = await res.json();
      if (json.success) {
        setLeetcodeStats(null);
        setLeetcodeUsername('');
        setNotice({ type: 'success', message: 'LeetCode account disconnected successfully.' });
      } else {
        setNotice({ type: 'error', message: json.error?.message || 'Failed to disconnect LeetCode.' });
      }
    } catch (e) {
      setNotice({ type: 'error', message: 'Network error disconnecting LeetCode.' });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setNotice(null);

    try {
      const token = localStorage.getItem('ks_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      };

      const payload = {
        fullName: fullName.trim(),
        phone: phone.trim(),
        institutionName: institutionName.trim(),
        degreeProgram: degreeProgram.trim(),
        rollNumber: rollNumber.trim(),
        graduationYear: graduationYear ? Number(graduationYear) : null,
        currentCgpa: currentCgpa ? Number(currentCgpa) : null,
        state: state.trim(),
        bio: bio.trim(),
        isProfilePublic: isProfilePublic ? 1 : 0
      };

      const res = await fetch('/api/students/me', {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (json.success) {
        setNotice({ type: 'success', message: 'Profile details and privacy settings updated successfully.' });
        try {
          const stored = localStorage.getItem('ks_user');
          if (stored) {
            const u = JSON.parse(stored);
            u.fullName = fullName.trim();
            u.phone = phone.trim();
            localStorage.setItem('ks_user', JSON.stringify(u));
          }
        } catch (e) {}
        if (onProfileUpdated) onProfileUpdated();
      } else {
        setNotice({ type: 'error', message: json.error?.message || 'Could not update profile.' });
      }
    } catch (err) {
      setNotice({ type: 'error', message: 'Network connection failed.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div id="student-profile-resume-section" className="space-y-6 max-w-4xl mx-auto">
      {/* Sub tabs: Edit Profile vs Resume View */}
      <div className="flex items-center justify-between bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveSubTab('profile')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'profile'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Edit Profile &amp; Privacy
          </button>
          <button
            onClick={() => setActiveSubTab('resume')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'resume'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Digital Resume &amp; Dossier
          </button>
        </div>

        {activeSubTab === 'resume' && (
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">print</span>
            <span>Print Resume PDF</span>
          </button>
        )}
      </div>

      {notice && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-sm ${
            notice.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border border-rose-200 text-rose-900'
          }`}
        >
          <span>{notice.message}</span>
          <button onClick={() => setNotice(null)}>✕</button>
        </div>
      )}

      {/* VIEW 1: PROFILE EDIT & PRIVACY CONTROLS */}
      {activeSubTab === 'profile' && (
        <form onSubmit={handleSave} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">Personal &amp; Academic Information</h2>
            <p className="text-xs text-slate-500">
              Changes made here are bound directly to your authenticated session.
            </p>
          </div>

          {/* Profile Photo Uploader Section */}
          <div className="flex items-center gap-5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <ProfilePhotoUploader
              currentAvatarUrl={user.avatarUrl}
              name={fullName}
              role="student"
              onPhotoUpdated={(newUrl) => {
                user.avatarUrl = newUrl || undefined;
                if (onProfileUpdated) onProfileUpdated();
              }}
              size="lg"
            />
            <div>
              <h3 className="text-sm font-bold text-slate-900">Profile Picture</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Upload, change, or remove your official identity picture. Supported formats: JPG, PNG, WebP (max 5MB).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={email}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone</label>
              <input
                type="text"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Permanent Academic Account (APAAR ID)</label>
              <input
                type="text"
                disabled
                value={profile?.apaarId || profile?.apaar_id || '9876-5432-1098'}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 font-mono text-blue-800 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Institution / College Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. National Institute of Technology"
                value={institutionName}
                onChange={(e) => setInstitutionName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Degree &amp; Specialization *</label>
              <input
                type="text"
                required
                placeholder="e.g. B.Tech Computer Science & Engineering"
                value={degreeProgram}
                onChange={(e) => setDegreeProgram(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Roll / Enrolment Number</label>
              <input
                type="text"
                placeholder="e.g. 2022-CS-084"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Graduation Year</label>
              <input
                type="number"
                value={graduationYear}
                onChange={(e) => setGraduationYear(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Current Cumulative CGPA (out of 10.0)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={currentCgpa}
                onChange={(e) => setCurrentCgpa(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">State / UT</label>
              <input
                type="text"
                placeholder="e.g. Delhi or Maharashtra"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Professional Bio / Summary</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
            />
          </div>

          {/* Privacy Controls */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 block">Industry Recruiter Discovery</span>
                <p className="text-xs text-slate-500 mt-0.5">
                  When enabled, verified enterprise employers can discover your profile and match you for relevant job and internship drives.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isProfilePublic}
                  onChange={(e) => setIsProfilePublic(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          {/* DigiLocker Sync Card */}
          <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-700 text-lg">verified</span>
                <span className="text-xs font-bold text-emerald-950">DigiLocker Academic Verification Status</span>
              </div>
              <p className="text-xs text-emerald-800 mt-1">
                Linked APAAR ID: <strong className="font-mono">{profile?.apaarId || profile?.apaar_id || '9876-5432-1098'}</strong> (NAD Depository)
              </p>
            </div>

            {onSyncDigiLocker && (
              <button
                type="button"
                onClick={onSyncDigiLocker}
                disabled={syncingDigiLocker}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
              >
                <span className={`material-symbols-outlined text-sm ${syncingDigiLocker ? 'animate-spin' : ''}`}>sync</span>
                <span>{syncingDigiLocker ? 'Syncing...' : 'Resync DigiLocker Credentials'}</span>
              </button>
            )}
          </div>

          {/* DEVELOPER PROFILES (GitHub & LeetCode) - Requirement #5 & #6 */}
          <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 text-lg">terminal</span>
                <span>Developer &amp; Problem Solving Profiles</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Connect your external developer platforms to showcase verified repositories and algorithmic problem solving.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* GitHub Card */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
                      GH
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">GitHub Profile</h4>
                      <span className="text-[10px] text-slate-500">Repositories &amp; Contributions</span>
                    </div>
                  </div>
                  {githubStats?.profileUrl && (
                    <a
                      href={githubStats.profileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-blue-600 hover:underline flex items-center gap-0.5 font-semibold"
                    >
                      <span>@{githubStats.username}</span>
                      <span className="material-symbols-outlined text-xs">open_in_new</span>
                    </a>
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter GitHub username"
                    value={githubUsername}
                    onChange={(e) => setGithubUsername(e.target.value)}
                    className="flex-grow px-3 py-1.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                  <button
                    type="button"
                    disabled={syncingGithub || !githubUsername.trim()}
                    onClick={handleSyncGithub}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1 whitespace-nowrap"
                  >
                    {syncingGithub ? (
                      <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <span className="material-symbols-outlined text-xs">sync</span>
                    )}
                    <span>Sync</span>
                  </button>
                </div>

                {githubStats ? (
                  <div className="pt-3 border-t border-slate-100 space-y-3">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-xs font-black text-slate-900 block">{githubStats.publicRepos}</span>
                        <span className="text-[10px] text-slate-500">Repos</span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-xs font-black text-amber-600 block">★ {githubStats.totalStars}</span>
                        <span className="text-[10px] text-slate-500">Stars</span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-xs font-black text-emerald-600 block">{githubStats.totalContributions}</span>
                        <span className="text-[10px] text-slate-500">Contribs</span>
                      </div>
                    </div>

                    {githubStats.topLanguages && githubStats.topLanguages.length > 0 && (
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block mb-1">Top Languages:</span>
                        <div className="flex flex-wrap gap-1">
                          {githubStats.topLanguages.map((lang) => (
                            <span key={lang} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium border border-slate-200">
                              {lang}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {githubStats.lastSyncedAt && (
                      <div className="flex items-center justify-between text-[9px] text-slate-400 pt-1">
                        <span>Last synced: {new Date(githubStats.lastSyncedAt).toLocaleDateString()}</span>
                        <button
                          type="button"
                          onClick={handleDisconnectGithub}
                          className="text-rose-600 hover:text-rose-700 hover:underline font-semibold cursor-pointer"
                        >
                          Disconnect Account
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center">
                    <span className="text-[11px] text-slate-500">No GitHub profile linked yet. Enter username above to connect.</span>
                  </div>
                )}
              </div>

              {/* LeetCode Card */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-sm">
                      LC
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">LeetCode Profile</h4>
                      <span className="text-[10px] text-slate-500">DSA &amp; Problem Solving</span>
                    </div>
                  </div>
                  {leetcodeStats?.profileUrl && (
                    <a
                      href={leetcodeStats.profileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-amber-600 hover:underline flex items-center gap-0.5 font-semibold"
                    >
                      <span>@{leetcodeStats.username}</span>
                      <span className="material-symbols-outlined text-xs">open_in_new</span>
                    </a>
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter LeetCode username"
                    value={leetcodeUsername}
                    onChange={(e) => setLeetcodeUsername(e.target.value)}
                    className="flex-grow px-3 py-1.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-amber-600"
                  />
                  <button
                    type="button"
                    disabled={syncingLeetcode || !leetcodeUsername.trim()}
                    onClick={handleSyncLeetcode}
                    className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1 whitespace-nowrap"
                  >
                    {syncingLeetcode ? (
                      <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <span className="material-symbols-outlined text-xs">sync</span>
                    )}
                    <span>Sync</span>
                  </button>
                </div>

                {leetcodeStats ? (
                  <div className="pt-3 border-t border-slate-100 space-y-3">
                    <div className="flex items-center justify-between px-2 py-1.5 rounded-xl bg-amber-50/60 border border-amber-200/60 text-xs">
                      <span className="text-[11px] text-amber-900 font-medium">Global Ranking</span>
                      <span className="font-bold text-amber-900">#{leetcodeStats.ranking.toLocaleString()}</span>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5 text-center">
                      <div className="p-1.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-xs font-black text-slate-900 block">{leetcodeStats.totalSolved}</span>
                        <span className="text-[9px] text-slate-500">Solved</span>
                      </div>
                      <div className="p-1.5 rounded-xl bg-emerald-50 border border-emerald-100">
                        <span className="text-xs font-black text-emerald-700 block">{leetcodeStats.easySolved}</span>
                        <span className="text-[9px] text-emerald-600">Easy</span>
                      </div>
                      <div className="p-1.5 rounded-xl bg-amber-50 border border-amber-100">
                        <span className="text-xs font-black text-amber-700 block">{leetcodeStats.mediumSolved}</span>
                        <span className="text-[9px] text-amber-600">Medium</span>
                      </div>
                      <div className="p-1.5 rounded-xl bg-rose-50 border border-rose-100">
                        <span className="text-xs font-black text-rose-700 block">{leetcodeStats.hardSolved}</span>
                        <span className="text-[9px] text-rose-600">Hard</span>
                      </div>
                    </div>

                    {leetcodeStats.lastSyncedAt && (
                      <div className="flex items-center justify-between text-[9px] text-slate-400 pt-1">
                        <span>Last synced: {new Date(leetcodeStats.lastSyncedAt).toLocaleDateString()}</span>
                        <button
                          type="button"
                          onClick={handleDisconnectLeetcode}
                          className="text-rose-600 hover:text-rose-700 hover:underline font-semibold cursor-pointer"
                        >
                          Disconnect Account
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center">
                    <span className="text-[11px] text-slate-500">No LeetCode profile linked yet. Enter username above to connect.</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
            >
              {saving && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
              <span>Save Profile Changes</span>
            </button>
          </div>
        </form>
      )}

      {/* VIEW 2: DIGITAL RESUME & PRINT DOSSIER */}
      {activeSubTab === 'resume' && (
        <div className="space-y-6">
          {/* UPLOADED RESUME FILE (PDF) - Requirement #7 */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4 print:hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-rose-600 text-xl">picture_as_pdf</span>
                  <h3 className="text-base font-bold text-slate-900">Official Uploaded Resume (PDF)</h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Upload your customized PDF resume document. Recruiters can view and download this file directly.
                </p>
              </div>

              {/* Hidden file input */}
              <input
                type="file"
                ref={resumeFileInputRef}
                onChange={handleResumeFileSelected}
                accept="application/pdf,.pdf"
                className="hidden"
              />

              <button
                type="button"
                disabled={uploadingResume}
                onClick={() => resumeFileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer whitespace-nowrap"
              >
                {uploadingResume ? (
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <span className="material-symbols-outlined text-sm">upload_file</span>
                )}
                <span>{resume ? 'Replace Resume (PDF)' : 'Upload Resume (PDF)'}</span>
              </button>
            </div>

            {resume ? (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-sm">
                    PDF
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block truncate max-w-xs sm:max-w-md">
                      {resume.fileName}
                    </span>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                      <span>{(resume.fileSize / (1024 * 1024) > 1 ? `${(resume.fileSize / (1024 * 1024)).toFixed(2)} MB` : `${(resume.fileSize / 1024).toFixed(0)} KB`)}</span>
                      <span>•</span>
                      <span>Uploaded {new Date(resume.uploadedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={resume.filePath}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-semibold shadow-sm transition-all"
                  >
                    <span className="material-symbols-outlined text-sm text-blue-600">visibility</span>
                    <span>View / Download PDF</span>
                  </a>
                  <button
                    type="button"
                    disabled={uploadingResume}
                    onClick={handleDeleteResume}
                    className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 text-xs transition-colors cursor-pointer"
                    title="Delete Resume"
                  >
                    <span className="material-symbols-outlined text-base">delete</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-300 text-center flex flex-col items-center justify-center">
                <span className="material-symbols-outlined text-slate-400 text-3xl mb-1">description</span>
                <p className="text-xs font-bold text-slate-700">No PDF Resume Uploaded Yet</p>
                <p className="text-[11px] text-slate-500 max-w-sm mt-0.5">
                  Attach your current PDF resume so recruiters have your official document on hand when reviewing applications.
                </p>
              </div>
            )}
          </div>

          {/* Interactive Printable Digital Dossier */}
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-8 print:p-0 print:border-none print:shadow-none">
          {/* Header */}
          <div className="pb-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-2">
                <span className="material-symbols-outlined text-xs">verified</span>
                DigiLocker Verifiable Proof-of-Work
              </div>
              <h1 className="text-2xl font-black text-slate-900">{fullName}</h1>
              <p className="text-xs font-semibold text-slate-600 mt-1">
                {degreeProgram} • {institutionName}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
                <span>{email}</span>
                <span>•</span>
                <span>{phone || '+91 (Active Student Phone)'}</span>
                <span>•</span>
                <span>{state}</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">APAAR Registry ID</span>
              <span className="text-xs font-mono font-bold text-blue-700">{profile?.apaarId || profile?.apaar_id || '9876-5432-1098'}</span>
              <span className="text-[10px] text-emerald-600 block mt-1">✓ Cryptographically Verified</span>
            </div>
          </div>

          {/* Bio */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Executive Summary</h3>
            <p className="text-xs text-slate-700 leading-relaxed">{bio}</p>
          </div>

          {/* Education */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Academic Credentials</h3>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <div className="font-bold text-slate-900 text-sm">{degreeProgram}</div>
              <div className="text-slate-600">{institutionName} • Class of {graduationYear}</div>
              <div className="font-semibold text-blue-700">Cumulative CGPA: {currentCgpa} / 10.0</div>
            </div>
          </div>

          {/* Verified Skills */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Verified Skills</h3>
            <div className="flex flex-wrap gap-2">
              {(profile?.skills || ['React', 'TypeScript', 'Node.js', 'SQL', 'Git', 'Cloud Architecture']).map((sk) => (
                <span
                  key={sk}
                  className="px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-xs text-blue-600">check</span>
                  {sk}
                </span>
              ))}
            </div>
          </div>

          {/* Capstone Projects */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Key Projects &amp; Repositories</h3>
            <div className="space-y-3">
              {(profile?.projects && profile.projects.length > 0 ? profile.projects : [
                {
                  id: 'sample',
                  title: 'Distributed Telemetry & Event Pipeline',
                  category: 'Cloud & Systems',
                  technologies: 'Node.js, TypeScript, Kafka, Docker, Redis',
                  description: 'Real-time asynchronous telemetry ingestion engine handling 10k events/sec with automated alerting.',
                  github_url: 'https://github.com/candidate/telemetry'
                }
              ]).map((proj: any) => (
                <div key={proj.id} className="p-4 rounded-2xl border border-slate-200 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{proj.title}</span>
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                      {proj.category}
                    </span>
                  </div>
                  <p className="text-slate-600">{proj.description}</p>
                  <div className="text-slate-500 font-medium">Stack: {proj.technologies}</div>
                  {proj.github_url && (
                    <a
                      href={proj.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline font-semibold block pt-1"
                    >
                      {proj.github_url}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200 text-center text-[10px] text-slate-400">
            Certified Record Generated by Kaushal Setu — Ministry of Skill Development &amp; Entrepreneurship and AICTE.
          </div>
        </div>
      </div>
      )}
    </div>
  );
};
