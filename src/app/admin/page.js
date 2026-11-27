'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  UserCheck,
  Layers,
  Award,
  Globe,
  ArrowRight,
  ShieldCheck,
  Activity,
} from 'lucide-react';
import { apiRequest } from '../../lib/api';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [audits, setAudits] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest('/admin/dashboard/stats')
      .then((res) => {
        setStats(res.stats);
        setAudits(res.recentAudits || []);
      })
      .catch((err) => setError(err.message));
  }, []);

  const cards = [
    {
      label: 'Active Students',
      value: stats?.totalStudents ?? '—',
      sub: `${stats?.totalOTR ?? 0} total OTR profiles`,
      icon: <Users className="w-5 h-5" />,
      tone: 'bg-sky-200/70 text-[#0071BC]',
      cardTint: 'bg-sky-100/80',
    },
    {
      label: 'Pending OTR Review',
      value: stats?.pendingOTR ?? '—',
      sub: 'Awaiting verification',
      icon: <UserCheck className="w-5 h-5" />,
      tone: 'bg-amber-200/70 text-amber-700',
      cardTint: 'bg-amber-100/80',
    },
    {
      label: 'Active Batches',
      value: stats?.activeBatches ?? '—',
      sub: `${stats?.activeCourses ?? 0} active courses`,
      icon: <Layers className="w-5 h-5" />,
      tone: 'bg-indigo-200/70 text-[#2E3192]',
      cardTint: 'bg-indigo-100/80',
    },
    {
      label: 'Trainers & Exams',
      value: stats?.totalTrainers ?? '—',
      sub: `${stats?.totalAssessments ?? 0} tests · ${stats?.issuedCertificates ?? 0} certs`,
      icon: <Award className="w-5 h-5" />,
      tone: 'bg-emerald-200/70 text-emerald-700',
      cardTint: 'bg-emerald-100/80',
    },
  ];

  const shortcuts = [
    { label: 'Website CMS', href: '/admin/cms', desc: 'Edit Hero, Gallery, MOUs & Settings', icon: <Globe className="w-4 h-4" /> },
    { label: 'OTR Verification', href: '/admin/otr', desc: 'Review & verify student registrations', icon: <UserCheck className="w-4 h-4" /> },
    { label: 'Batches & Enroll', href: '/admin/batches', desc: 'Assign trainers & enroll students', icon: <Layers className="w-4 h-4" /> },
    { label: 'Users & Trainers', href: '/admin/users', desc: 'Manage trainers & student accounts', icon: <Users className="w-4 h-4" /> },
  ];

  return (
    <div className="p-6 sm:p-8 space-y-6">
      {/* Executive Welcome Banner */}
      <div className="bg-gradient-to-r from-[#2E3192] to-[#0071BC] rounded-2xl p-6 text-white shadow-md flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-sky-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Barrownz Learning Academy</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Admin Control Center</h1>
          <p className="text-xs text-sky-100">
            Unified academic, assessment, certification &amp; website management hub.
          </p>
        </div>
        <Link
          href="/admin/cms"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-[#2E3192] hover:bg-sky-50 text-xs font-bold shadow-sm transition"
        >
          <Globe className="w-4 h-4 text-[#0071BC]" />
          <span>Open Website CMS</span>
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">{error}</div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((c, idx) => (
          <div
            key={idx}
            className={`${c.cardTint} backdrop-blur-sm p-5 rounded-2xl shadow-[0_2px_14px_rgba(46,49,146,0.06)] hover:shadow-[0_6px_20px_rgba(0,113,188,0.10)] transition flex items-start justify-between gap-3`}
          >
            <div>
              <p className="text-xs font-semibold text-slate-500">{c.label}</p>
              <p className="text-2xl font-extrabold text-[#2E3192] mt-2">{c.value}</p>
              <p className="text-[11px] text-[#0071BC] font-medium mt-1">{c.sub}</p>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${c.tone}`}>
              {c.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {shortcuts.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="bg-white rounded-2xl border border-slate-200 p-4 hover:border-[#0071BC] hover:shadow-sm transition flex items-center justify-between gap-3 group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-sky-50 text-[#2E3192] group-hover:text-[#0071BC] flex items-center justify-center transition">
                {s.icon}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">{s.label}</p>
                <p className="text-[11px] text-slate-500 line-clamp-1">{s.desc}</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#0071BC] transition shrink-0" />
          </Link>
        ))}
      </div>

      {/* Recent Audit Activity */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4 text-[#0071BC]" />
          <h2 className="text-sm font-bold text-[#2E3192]">Recent Platform Activity</h2>
        </div>
        {audits.length === 0 ? (
          <p className="text-xs text-slate-500">No recent audit logs recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-2.5 pr-4">Action</th>
                  <th className="py-2.5 pr-4">Actor</th>
                  <th className="py-2.5 pr-4">Role</th>
                  <th className="py-2.5">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {audits.map((a) => (
                  <tr key={a._id} className="border-b border-slate-100 hover:bg-slate-50/70">
                    <td className="py-2.5 pr-4 font-mono font-semibold text-[#2E3192]">{a.action}</td>
                    <td className="py-2.5 pr-4">{a.actorEmail}</td>
                    <td className="py-2.5 pr-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[10px]">
                        {a.role}
                      </span>
                    </td>
                    <td className="py-2.5 text-slate-500">{new Date(a.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
