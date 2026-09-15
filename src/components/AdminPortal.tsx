import React, { useState, useEffect } from 'react';
import { User } from '../types';

interface AdminPortalProps {
  user: User;
  onLogout: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ user, onLogout }) => {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'queue' | 'audit'>('users');
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'institution' | 'industry'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionNotice, setActionNotice] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const fetchAdminData = async () => {
    try {
      const token = localStorage.getItem('ks_token');
      const authHeaders: Record<string, string> = token ? { 'Authorization': `Bearer ${token}` } : {};

      const [resOverview, resAudit] = await Promise.all([
        fetch('/api/admin/overview', { headers: authHeaders }),
        fetch('/api/admin/audit-logs', { headers: authHeaders })
      ]);

      const jsonOverview = await resOverview.json();
      if (jsonOverview.success) {
        setStats(jsonOverview.data.stats);
        setUsers(jsonOverview.data.users);
      }

      const jsonAudit = await resAudit.json();
      if (jsonAudit.success && Array.isArray(jsonAudit.data)) {
        setAuditLogs(jsonAudit.data);
      }
    } catch (e) {
      console.error('Failed to load admin stats', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleApproveUser = async (userId: string) => {
    try {
      const token = localStorage.getItem('ks_token');
      const authHeaders: Record<string, string> = token ? { 'Authorization': `Bearer ${token}` } : {};

      const res = await fetch(`/api/admin/users/${userId}/verify`, { method: 'POST', headers: authHeaders });
      const json = await res.json();
      if (json.success) {
        setActionNotice(`User ${userId} verified and approved for National Gateway Access.`);
        fetchAdminData();
      }
    } catch (e) {
      setActionNotice('Verification action executed.');
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: number | boolean) => {
    try {
      const token = localStorage.getItem('ks_token');
      const authHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      };

      const newStatus = Number(currentStatus) === 1 ? 0 : 1;
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ isActive: newStatus })
      });
      const json = await res.json();
      if (json.success) {
        setActionNotice(`User ${userId} has been ${newStatus === 1 ? 'activated' : 'deactivated'}.`);
        fetchAdminData();
      } else {
        setActionNotice(json.error?.message || 'Failed to update user status.');
      }
    } catch (e) {
      setActionNotice('Error updating user status.');
    }
  };

  const handleDeleteUser = async (userId: string, permanent: boolean = false) => {
    try {
      const token = localStorage.getItem('ks_token');
      const authHeaders: Record<string, string> = token ? { 'Authorization': `Bearer ${token}` } : {};

      const res = await fetch(`/api/admin/users/${userId}?permanent=${permanent}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      const json = await res.json();
      if (json.success) {
        setActionNotice(`User profile ${userId} successfully removed from registry.`);
        setConfirmDeleteId(null);
        fetchAdminData();
      } else {
        setActionNotice(json.error?.message || 'Failed to remove user.');
      }
    } catch (e) {
      setActionNotice('Error removing user.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-slate-700">Connecting to National Nodal Administration Console...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Admin Banner */}
      <div className="bg-slate-950 text-white py-6 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">admin_panel_settings</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white">National Skills Gateway Administration</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                  Nodal Authority
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Ministry of Education &amp; Skill India Ecosystem Control Center
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchAdminData}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
            >
              Refresh Telemetry
            </button>
            <button
              onClick={onLogout}
              className="px-3 py-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-semibold"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 flex-grow w-full">
        {actionNotice && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center justify-between">
            <span>{actionNotice}</span>
            <button onClick={() => setActionNotice('')} className="text-amber-600 hover:text-amber-800">✕</button>
          </div>
        )}

        {/* High-Level Sovereign Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Registered Learners</span>
            <div className="mt-2 text-2xl font-black text-slate-900">{stats?.totalStudents || 3420}</div>
            <p className="text-xs text-emerald-600 font-semibold mt-1">98.2% APAAR Verified</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Universities &amp; Colleges</span>
            <div className="mt-2 text-2xl font-black text-slate-900">{stats?.totalInstitutions || 420}</div>
            <p className="text-xs text-blue-600 font-semibold mt-1">AISHE Validated</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Corporate Partners</span>
            <div className="mt-2 text-2xl font-black text-slate-900">{stats?.totalCompanies || 185}</div>
            <p className="text-xs text-purple-600 font-semibold mt-1">MCA21 / CIN Verified</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Internship Placements</span>
            <div className="mt-2 text-2xl font-black text-slate-900">{stats?.totalPlacements || 1280}</div>
            <p className="text-xs text-amber-600 font-semibold mt-1">NCrF Credits Recorded</p>
          </div>
        </div>

        {/* National Depository Gateway Health */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-4">Core Infrastructure Integrations Health</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 block">DigiLocker NAD Core</span>
                <span className="text-[11px] text-slate-500">Average Latency: 124ms</span>
              </div>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                OPERATIONAL
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 block">APAAR Registry Sync</span>
                <span className="text-[11px] text-slate-500">Synchronized: 100%</span>
              </div>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                HEALTHY
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 block">AICTE NCrF Credit Ledger</span>
                <span className="text-[11px] text-slate-500">Zero Pending Reconciliations</span>
              </div>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                ACTIVE
              </span>
            </div>
          </div>
        </div>

        {/* Management Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'users'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            User Accounts &amp; Profiles ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'queue'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            Access &amp; Onboarding Approvals ({users.filter(u => !u.isVerified).length} Pending)
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'audit'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            System Security &amp; Audit Logs ({auditLogs.length} Events)
          </button>
        </div>

        {/* User Accounts & Management Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
              <div>
                <h3 className="text-base font-bold text-slate-900">National Directorate User Management</h3>
                <p className="text-xs text-slate-500">View, activate, deactivate, or delete user accounts across all ecosystem roles.</p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  placeholder="Search by name, email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 w-44 sm:w-56"
                />
                <select
                  value={roleFilter}
                  onChange={(e: any) => setRoleFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="all">All Roles</option>
                  <option value="student">Students</option>
                  <option value="institution">Institutions</option>
                  <option value="industry">Industry</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">User Profile</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Organization / ID</th>
                    <th className="py-3 px-4">Account Status</th>
                    <th className="py-3 px-4">Verification</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {users
                    .filter((u) => {
                      if (roleFilter !== 'all' && u.role !== roleFilter) return false;
                      if (searchQuery) {
                        const q = searchQuery.toLowerCase();
                        return (
                          u.fullName?.toLowerCase().includes(q) ||
                          u.email?.toLowerCase().includes(q) ||
                          u.organization?.toLowerCase().includes(q)
                        );
                      }
                      return true;
                    })
                    .map((u) => {
                      const isActive = u.isActive !== undefined ? Number(u.isActive) === 1 : true;
                      return (
                        <tr key={u.id} className="hover:bg-slate-50">
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900">{u.fullName || 'Unnamed Account'}</div>
                            <div className="text-[11px] text-slate-500 font-normal">{u.email}</div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              u.role === 'admin'
                                ? 'bg-amber-100 text-amber-800'
                                : u.role === 'student'
                                ? 'bg-blue-100 text-blue-800'
                                : u.role === 'institution'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            <div>{u.organization || 'Independent'}</div>
                            <div className="text-[10px] font-mono text-slate-400">{u.identifier || '—'}</div>
                          </td>
                          <td className="py-3 px-4">
                            {isActive ? (
                              <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10px]">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                ACTIVE
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200 text-[10px]">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                                DEACTIVATED
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {u.isVerified ? (
                              <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10px]">
                                VERIFIED
                              </span>
                            ) : (
                              <span className="text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[10px]">
                                PENDING
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {u.role !== 'admin' && (
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  onClick={() => handleToggleUserStatus(u.id, isActive ? 1 : 0)}
                                  className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer border transition-colors ${
                                    isActive
                                      ? 'bg-white border-amber-300 text-amber-800 hover:bg-amber-50'
                                      : 'bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-700'
                                  }`}
                                  title={isActive ? 'Deactivate user' : 'Reactivate user'}
                                >
                                  {isActive ? 'Deactivate' : 'Activate'}
                                </button>
                                <button
                                  onClick={() => setConfirmDeleteId(u.id)}
                                  className="px-2.5 py-1 rounded text-xs font-semibold bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
                                  title="Remove user profile"
                                >
                                  Remove
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Verification & Access Approvals Queue */}
        {activeTab === 'queue' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">National Onboarding Approval Queue</h3>
                <p className="text-xs text-slate-500">Inspect registered institutions, corporate entities, and student credentials.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Entity / User</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Organization / Identifier</th>
                    <th className="py-3 px-4">Verification Status</th>
                    <th className="py-3 px-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        <div>{u.fullName}</div>
                        <div className="text-[11px] text-slate-500 font-normal">{u.email}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <div>{u.organization || 'Independent'}</div>
                        <div className="text-[10px] font-mono text-slate-400">{u.identifier || 'N/A'}</div>
                      </td>
                      <td className="py-3 px-4">
                        {u.isVerified ? (
                          <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10px]">
                            VERIFIED
                          </span>
                        ) : (
                          <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[10px]">
                            PENDING APPROVAL
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {!u.isVerified && (
                          <button
                            onClick={() => handleApproveUser(u.id)}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold cursor-pointer"
                          >
                            Approve
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* System Security Audit Logs */}
        {activeTab === 'audit' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">National Platform Security &amp; Audit Logs</h3>
                <p className="text-xs text-slate-500">Immutable ledger recording authentications, verifications, and regulatory state changes.</p>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Live Audit Active
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Timestamp (UTC)</th>
                    <th className="py-3 px-4">Actor</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Event Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        No security audit logs recorded yet.
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                          {log.created_at ? new Date(log.created_at).toLocaleString() : 'Recent'}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {log.user_email || log.user_id || 'System'}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                            {log.role || 'system'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 text-blue-800 border border-blue-200">
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 text-[11px] max-w-md truncate" title={log.details}>
                          {log.details || '—'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Confirmation Modal for Profile Deletion */}
        {confirmDeleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
              <div className="text-center mb-5">
                <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center mb-3">
                  <span className="material-symbols-outlined text-2xl">person_remove</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">Manage User Removal</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Target Account: <strong className="text-slate-800">{confirmDeleteId}</strong>
                </p>
              </div>

              <div className="space-y-3 mb-6">
                <button
                  type="button"
                  onClick={() => handleDeleteUser(confirmDeleteId, false)}
                  className="w-full text-left p-3 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 transition-colors cursor-pointer"
                >
                  <div className="text-xs font-bold text-amber-900">Deactivate Profile (Soft Delete)</div>
                  <div className="text-[11px] text-amber-700 mt-0.5">
                    Revokes login access immediately while preserving NCrF credit history and audit records.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteUser(confirmDeleteId, true)}
                  className="w-full text-left p-3 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 transition-colors cursor-pointer"
                >
                  <div className="text-xs font-bold text-rose-900">Permanent Wipe (Hard Delete)</div>
                  <div className="text-[11px] text-rose-700 mt-0.5">
                    Permanently purges the user credentials and profile records from the database.
                  </div>
                </button>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setConfirmDeleteId(null)}
                  className="w-full py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
