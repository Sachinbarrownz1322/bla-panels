'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Layers, Users, Award, ClipboardCheck, BarChart3, ArrowRight } from 'lucide-react';
import { apiRequest } from '../../lib/api';

export default function TrainerDashboardPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest('/trainer/dashboard')
      .then((res) => setData(res))
      .catch((err) => setError(err.message));
  }, []);

  const stats = data?.stats;
  const batches = data?.batches || [];

  return (
    <div className="p-6 sm:p-8 space-y-6">
      <div className="bg-gradient-to-r from-[#2E3192] to-[#0071BC] rounded-2xl p-6 text-white shadow-md flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-sky-200">Faculty Workspace</p>
          <h1 className="text-2xl font-extrabold tracking-tight mt-0.5">Trainer Academic Console</h1>
          <p className="text-sky-100 text-xs mt-1">Manage assigned batches, mark attendance, and publish assessments.</p>
        </div>
        <Link
          href="/trainer/attendance"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-[#2E3192] hover:bg-sky-50 text-xs font-bold shadow-sm transition"
        >
          <ClipboardCheck className="w-4 h-4 text-[#0071BC]" />
          <span>Mark Attendance</span>
        </Link>
      </div>

      {error && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-indigo-100/80 backdrop-blur-sm p-5 rounded-2xl shadow-[0_4px_18px_rgba(46,49,146,0.08)] flex items-start justify-between">
          <div>
            <p className="text-xs text-slate-700 font-semibold">Assigned Batches</p>
            <p className="text-2xl font-extrabold text-[#2E3192] mt-2">{stats?.assignedBatches ?? '—'}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-200/70 text-[#2E3192] flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-sky-100/80 backdrop-blur-sm p-5 rounded-2xl shadow-[0_4px_18px_rgba(46,49,146,0.08)] flex items-start justify-between">
          <div>
            <p className="text-xs text-slate-700 font-semibold">Active Students</p>
            <p className="text-2xl font-extrabold text-[#2E3192] mt-2">{stats?.activeStudents ?? '—'}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-200/70 text-[#0071BC] flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-emerald-100/80 backdrop-blur-sm p-5 rounded-2xl shadow-[0_4px_18px_rgba(46,49,146,0.08)] flex items-start justify-between">
          <div>
            <p className="text-xs text-slate-700 font-semibold">Linked Assessments</p>
            <p className="text-2xl font-extrabold text-[#2E3192] mt-2">{stats?.assessmentsCount ?? '—'}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-200/70 text-emerald-700 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Mark Attendance', href: '/trainer/attendance', icon: <ClipboardCheck className="w-4 h-4" /> },
          { label: 'Manage Assessments', href: '/trainer/assessments', icon: <Award className="w-4 h-4" /> },
          { label: 'Student Results', href: '/trainer/results', icon: <BarChart3 className="w-4 h-4" /> },
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
        <h2 className="text-sm font-bold text-[#2E3192] mb-3">My Assigned Batches</h2>
        {batches.length === 0 ? (
          <p className="text-xs text-slate-500">No batches assigned yet.</p>
        ) : (
          <div className="space-y-2.5">
            {batches.map((b) => (
              <div key={b._id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <p className="font-mono font-bold text-[#2E3192]">{b.code} — {b.name}</p>
                  <p className="text-slate-600 mt-0.5">{b.course?.title} · {b.mode} · {b.timing?.startTime} - {b.timing?.endTime}</p>
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
