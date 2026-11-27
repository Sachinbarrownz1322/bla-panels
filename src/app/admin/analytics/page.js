'use client';

import React, { useEffect, useState } from 'react';
import { LineChart, Send, CheckCircle2, Users, Award, BadgeCheck } from 'lucide-react';
import { apiRequest } from '../../../lib/api';

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [broadcast, setBroadcast] = useState({
    targetRole: 'ALL',
    type: 'INFO',
    title: '',
    message: '',
  });
  const [sending, setSending] = useState(false);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/admin/analytics');
      setAnalytics(res.analytics);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const handleBroadcast = async (e) => {
    e.preventDefault();
    setSending(true);
    setError('');
    setMessage('');
    try {
      const res = await apiRequest('/notifications/broadcast', {
        method: 'POST',
        body: JSON.stringify(broadcast),
      });
      setMessage(res.message);
      setBroadcast({ targetRole: 'ALL', type: 'INFO', title: '', message: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#2E3192]">Platform Analytics & Announcements</h1>
        <p className="text-xs text-slate-500">
          Real-time academic KPIs from MongoDB and centralized notification broadcast to students & trainers.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          {error}
        </div>
      )}
      {message && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
          {message}
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center text-xs text-slate-500">Computing platform analytics...</div>
      ) : (
        analytics && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>OTR Verification</span>
                <Users className="w-4 h-4 text-[#0071BC]" />
              </div>
              <p className="text-2xl font-extrabold text-[#2E3192] mt-2">
                {analytics.otrBreakdown.VERIFIED} Verified
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                {analytics.otrBreakdown.SUBMITTED} pending · {analytics.otrBreakdown.REJECTED} rejected
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Attendance Rate</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-extrabold text-[#2E3192] mt-2">
                {analytics.attendance.attendanceRate}%
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                {analytics.attendance.totalSessions} session(s) · {analytics.attendance.totalRecords} marks
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Assessment Pass Rate</span>
                <Award className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-2xl font-extrabold text-[#2E3192] mt-2">
                {analytics.assessments.passRate}%
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Avg Score: {analytics.assessments.avgScore}% ({analytics.assessments.totalSubmissions} attempts)
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Issued Certificates</span>
                <BadgeCheck className="w-4 h-4 text-[#0071BC]" />
              </div>
              <p className="text-2xl font-extrabold text-[#2E3192] mt-2">
                {analytics.certificates.validCerts} Valid
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                {analytics.certificates.revokedCerts} revoked
              </p>
            </div>
          </div>
        )
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Batch Utilization */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <LineChart className="w-4 h-4 text-[#0071BC]" />
            <h2 className="text-sm font-bold text-[#2E3192]">Active Batch Capacity Utilization</h2>
          </div>
          {!analytics?.batchUtilization?.length ? (
            <p className="text-xs text-slate-500">No active batches found.</p>
          ) : (
            <div className="space-y-3">
              {analytics.batchUtilization.map((b) => (
                <div key={b._id} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">
                      {b.name} <span className="font-mono text-slate-400">({b.code})</span>
                    </span>
                    <span className="font-bold text-[#0071BC]">
                      {b.enrolled} / {b.maxCapacity} ({b.utilizationPct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-[#0071BC] rounded-full transition-all"
                      style={{ width: `${b.utilizationPct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Broadcast Notification */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Send className="w-4 h-4 text-[#0071BC]" />
            <h2 className="text-sm font-bold text-[#2E3192]">Broadcast Platform Notification</h2>
          </div>
          <form onSubmit={handleBroadcast} className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1">Target Audience</label>
                <select
                  value={broadcast.targetRole}
                  onChange={(e) => setBroadcast({ ...broadcast, targetRole: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2"
                >
                  <option value="ALL">All Active Users</option>
                  <option value="STUDENT">All Students</option>
                  <option value="TRAINER">All Trainers</option>
                  <option value="ADMIN">All Admins</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1">Category</label>
                <select
                  value={broadcast.type}
                  onChange={(e) => setBroadcast({ ...broadcast, type: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2"
                >
                  <option value="INFO">INFO</option>
                  <option value="ASSESSMENT">ASSESSMENT</option>
                  <option value="ATTENDANCE">ATTENDANCE</option>
                  <option value="RESULT">RESULT</option>
                  <option value="CERTIFICATE">CERTIFICATE</option>
                  <option value="SYSTEM">SYSTEM</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block font-semibold mb-1">Title *</label>
              <input
                required
                value={broadcast.title}
                onChange={(e) => setBroadcast({ ...broadcast, title: e.target.value })}
                placeholder="Upcoming Mid-Term Assessment Schedule"
                className="w-full border border-slate-200 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Message *</label>
              <textarea
                required
                rows={3}
                value={broadcast.message}
                onChange={(e) => setBroadcast({ ...broadcast, message: e.target.value })}
                placeholder="Write announcement details..."
                className="w-full border border-slate-200 rounded-lg px-3 py-2"
              />
            </div>
            <button
              type="submit"
              disabled={sending}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2E3192] hover:bg-[#0071BC] text-white font-semibold disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{sending ? 'Sending...' : 'Send Notification'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
