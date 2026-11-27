'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Layers, ClipboardCheck, Award, BadgeCheck, BarChart3, ArrowRight } from 'lucide-react';
import { apiRequest } from '../../lib/api';

export default function StudentDashboardPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest('/student/dashboard')
      .then((res) => setData(res))
      .catch((err) => setError(err.message));
  }, []);

  const otr = data?.otrProfile;
  const stats = data?.stats;
  const batches = data?.batches || [];

  return (
    <div className="p-6 sm:p-8 space-y-6">
      <div className="bg-gradient-to-r from-[#2E3192] to-[#0071BC] rounded-2xl p-6 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-sky-200">Learner Workspace</p>
          <h1 className="text-2xl font-extrabold tracking-tight mt-0.5">Student Learning Portal</h1>
          <p className="text-sky-100 text-xs mt-1">Your permanent OTR identity, batch schedule, attendance, exams &amp; certificates.</p>
        </div>
        {otr && (
          <div className="px-4 py-2.5 bg-white/15 backdrop-blur-sm border border-white/25 rounded-xl">
            <span className="text-[10px] font-bold text-sky-200 block uppercase">OTR Identifier</span>
            <span className="font-mono text-base font-extrabold text-white">{otr.otrNumber}</span>
          </div>
        )}
      </div>

      {error && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-indigo-100/80 backdrop-blur-sm p-5 rounded-2xl shadow-[0_4px_18px_rgba(46,49,146,0.08)] flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-700">Enrolled Batches</p>
            <p className="text-2xl font-extrabold text-[#2E3192] mt-2">{stats?.enrolledBatches ?? '—'}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-200/70 text-[#2E3192] flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-emerald-100/80 backdrop-blur-sm p-5 rounded-2xl shadow-[0_4px_18px_rgba(46,49,146,0.08)] flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-700">Attendance</p>
            <p className="text-2xl font-extrabold text-[#2E3192] mt-2">{stats ? `${stats.attendancePercentage}%` : '—'}</p>
            <p className="text-[11px] text-slate-600 mt-1">{stats?.totalSessions ?? 0} sessions recorded</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-200/70 text-emerald-700 flex items-center justify-center">
            <ClipboardCheck className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-amber-100/80 backdrop-blur-sm p-5 rounded-2xl shadow-[0_4px_18px_rgba(46,49,146,0.08)] flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-700">Active Assessments</p>
            <p className="text-2xl font-extrabold text-[#2E3192] mt-2">{stats?.liveAssessments ?? '—'}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-200/70 text-amber-700 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-sky-100/80 backdrop-blur-sm p-5 rounded-2xl shadow-[0_4px_18px_rgba(46,49,146,0.08)] flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-700">Certificates Issued</p>
            <p className="text-2xl font-extrabold text-[#2E3192] mt-2">{stats?.certificatesCount ?? '—'}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-200/70 text-[#0071BC] flex items-center justify-center">
            <BadgeCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Online Assessments', href: '/student/assessments', icon: <Award className="w-4 h-4" /> },
          { label: 'My Test Results', href: '/student/results', icon: <BarChart3 className="w-4 h-4" /> },
          { label: 'My Certificates', href: '/student/certificates', icon: <BadgeCheck className="w-4 h-4" /> },
        ].map((q) => (
          <Link
            key={q.href}
            href={q.href}
            className="bg-white rounded-2xl border border-slate-200 p-4 hover:border-[#0071BC] transition flex items-center justify-between text-xs font-bold text-[#2E3192]"
          >
            <span className="inline-flex items-center gap-2.5">{q.icon} {q.label}</span>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <h2 className="text-sm font-bold text-[#2E3192] mb-3">Enrolled Courses &amp; Batches</h2>
        {batches.length === 0 ? (
          <p className="text-xs text-slate-500">You are not enrolled in a batch yet.</p>
        ) : (
          <div className="space-y-2.5">
            {batches.map((b) => (
              <div key={b._id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <p className="font-mono font-bold text-[#2E3192]">{b.code} — {b.name}</p>
                  <p className="text-slate-600 mt-0.5">{b.course?.title} · Trainer: {b.trainer?.name} · {b.timing?.startTime} – {b.timing?.endTime}</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-sky-100 text-[#0071BC] font-bold text-[10px]">{b.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
