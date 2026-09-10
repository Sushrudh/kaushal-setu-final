import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export const AdminPortal: React.FC = () => {
  const { user, token, showToast, quickLoginAs } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const stats = [
    { title: 'Affiliated Universities', value: '1,420', trend: '+12 this month', icon: 'account_balance', color: 'text-purple-600' },
    { title: 'Corporate Partners', value: '864', trend: '+45 active hiring', icon: 'domain', color: 'text-emerald-600' },
    { title: 'Verified Student Portfolios', value: '348,200', trend: '99.4% DigiLocker NAD verified', icon: 'school', color: 'text-blue-600' },
    { title: 'Internship Placements', value: '48,150', trend: '₹28,500 avg stipend', icon: 'verified', color: 'text-amber-600' }
  ];

  const fetchTickets = async () => {
    try {
      const res = await fetch('/api/support/tickets', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (data.success) {
        setTickets(data.data);
      }
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [token]);

  const handleResolveTicket = async (ticketId: number) => {
    try {
      const res = await fetch(`/api/support/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ status: 'resolved' })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Ticket #${ticketId} resolved and logged to audit trail.`, 'success');
        fetchTickets();
      }
    } catch {
      showToast('Error updating ticket status.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Banner */}
      <section className="bg-slate-900 text-white border-b border-slate-800 pt-8 pb-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {!token && (
            <div className="mb-5 p-3 bg-amber-900/60 border border-amber-700/80 rounded-xl flex items-center justify-between text-xs">
              <span>Previewing National Administration &amp; Governance Center:</span>
              <button
                onClick={() => quickLoginAs('admin')}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 font-bold rounded-lg cursor-pointer"
              >
                Log In as National Administrator
              </button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-2xl">
                🛡️
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-white">National Administration &amp; Oversight</h1>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30">
                    Tier-1 Gov Control
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Ministry of Education &amp; Skill India Nodal Interface • ISO 27001 Certified System
                </p>
              </div>
            </div>

            <button
              onClick={() => showToast('National Ecosystem Audit exported to PDF.', 'success')}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-bold rounded-xl shadow cursor-pointer"
            >
              Export System Audit Logs
            </button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-grow space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((st, i) => (
            <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-semibold uppercase">{st.title}</span>
                <span className={`material-symbols-outlined text-lg ${st.color}`}>{st.icon}</span>
              </div>
              <div className="text-2xl font-black text-slate-900 mt-2">{st.value}</div>
              <div className="text-[11px] text-slate-400 mt-1">{st.trend}</div>
            </div>
          ))}
        </div>

        {/* Support Tickets Queue */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">National Helpdesk &amp; Support Escalations</h3>
              <p className="text-xs text-slate-500">
                Incoming queries regarding DigiLocker 50 KB limits, APAAR ID synchronization, and university accreditation:
              </p>
            </div>
            <button
              onClick={fetchTickets}
              className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
            >
              Refresh Tickets
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Ticket ID</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Subject &amp; Issue</th>
                  <th className="p-3">Priority</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tickets.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-slate-900">#KS-{t.id}</td>
                    <td className="p-3 uppercase text-[10px] font-bold text-blue-700">{t.category}</td>
                    <td className="p-3">
                      <div className="font-semibold text-slate-800">{t.subject}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-sm">{t.description}</div>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800">
                        Normal
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          t.status === 'resolved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {t.status !== 'resolved' && (
                        <button
                          onClick={() => handleResolveTicket(t.id)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-[11px] cursor-pointer"
                        >
                          Mark Resolved
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};
