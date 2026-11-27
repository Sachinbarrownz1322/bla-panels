'use client';

import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../../lib/api';

export default function AdminBatchesPage() {
  const [batches, setBatches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [enrollOtr, setEnrollOtr] = useState({});
  const [form, setForm] = useState({ code: '', name: '', course: '', trainer: '', startDate: '' });
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const loadAll = async () => {
    try {
      const [b, c, u] = await Promise.all([
        apiRequest('/batches'),
        apiRequest('/courses'),
        apiRequest('/admin/users?roleName=TRAINER'),
      ]);
      setBatches(b.batches || []);
      setCourses(c.courses || []);
      setTrainers(u.users || []);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleCreateBatch = async (e) => {
    e.preventDefault();
    setError('');
    setMsg('');
    try {
      const res = await apiRequest('/batches', { method: 'POST', body: JSON.stringify(form) });
      setMsg(res.message);
      setForm({ code: '', name: '', course: '', trainer: '', startDate: '' });
      loadAll();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEnroll = async (batchId) => {
    const otrNumber = enrollOtr[batchId];
    if (!otrNumber) return;
    setError('');
    setMsg('');
    try {
      const res = await apiRequest(`/batches/${batchId}/enroll`, {
        method: 'POST',
        body: JSON.stringify({ otrNumber }),
      });
      setMsg(res.message);
      setEnrollOtr({ ...enrollOtr, [batchId]: '' });
      loadAll();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-6">
      <h1 className="text-xl font-bold text-[#2E3192]">Batch & Enrollment Management</h1>

      {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">{error}</div>}
      {msg && <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs">{msg}</div>}

      <form onSubmit={handleCreateBatch} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
        <input required placeholder="Batch Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="px-3 py-2.5 rounded-lg border border-slate-200" />
        <input required placeholder="Batch Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="px-3 py-2.5 rounded-lg border border-slate-200" />
        <select required value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })} className="px-3 py-2.5 rounded-lg border border-slate-200">
          <option value="">-- Select Course --</option>
          {courses.map((c) => <option key={c._id} value={c._id}>{c.title}</option>)}
        </select>
        <select required value={form.trainer} onChange={(e) => setForm({ ...form, trainer: e.target.value })} className="px-3 py-2.5 rounded-lg border border-slate-200">
          <option value="">-- Select Trainer --</option>
          {trainers.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
        </select>
        <input type="date" required value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="px-3 py-2.5 rounded-lg border border-slate-200" />
        <button type="submit" className="sm:col-span-5 bg-[#0071BC] text-white font-bold py-2.5 rounded-lg hover:bg-[#005a96]">
          + Create Batch
        </button>
      </form>

      <div className="space-y-3">
        {batches.map((b) => (
          <div key={b._id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div>
              <p className="font-mono font-bold text-[#2E3192]">{b.code} — {b.name}</p>
              <p className="text-slate-600 mt-0.5">Course: {b.course?.title} · Trainer: {b.trainer?.name} · Enrolled: {b.students?.length || 0}/{b.maxCapacity}</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                placeholder="BLA-2026-00001"
                value={enrollOtr[b._id] || ''}
                onChange={(e) => setEnrollOtr({ ...enrollOtr, [b._id]: e.target.value })}
                className="px-3 py-1.5 rounded-lg border border-slate-200 font-mono uppercase"
              />
              <button
                type="button"
                onClick={() => handleEnroll(b._id)}
                className="px-3 py-1.5 rounded-lg bg-[#2E3192] text-white font-semibold hover:bg-[#20243A]"
              >
                Enroll OTR
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
