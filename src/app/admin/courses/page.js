'use client';

import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../../lib/api';

const CATEGORIES = [
  'Web Development',
  'Programming Languages',
  'Digital Marketing & SEO',
  'Data Analytics & AI',
  'Design & Multimedia',
  'Database Engineering',
  'Industrial & Summer Training',
];

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({
    code: '',
    title: '',
    slug: '',
    category: CATEGORIES[0],
    durationWeeks: 6,
    amount: 10000,
  });
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const load = () => {
    apiRequest('/courses')
      .then((res) => setCourses(res.courses || []))
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setMsg('');
    try {
      const res = await apiRequest('/courses', {
        method: 'POST',
        body: JSON.stringify({
          code: form.code,
          title: form.title,
          slug: form.slug,
          category: form.category,
          durationWeeks: Number(form.durationWeeks),
          fee: { amount: Number(form.amount), currency: 'INR' },
        }),
      });
      setMsg(res.message);
      setForm({ code: '', title: '', slug: '', category: CATEGORIES[0], durationWeeks: 6, amount: 10000 });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-6">
      <h1 className="text-xl font-bold text-[#2E3192]">Course Management</h1>

      {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">{error}</div>}
      {msg && <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs">{msg}</div>}

      <form onSubmit={handleCreate} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <input required placeholder="Course Code (e.g. BLA-MERN)" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="px-3 py-2.5 rounded-lg border border-slate-200" />
        <input required placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="px-3 py-2.5 rounded-lg border border-slate-200" />
        <input required placeholder="slug-name" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="px-3 py-2.5 rounded-lg border border-slate-200" />
        <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="px-3 py-2.5 rounded-lg border border-slate-200">
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <input type="number" min={1} required placeholder="Weeks" value={form.durationWeeks} onChange={(e) => setForm({ ...form, durationWeeks: e.target.value })} className="px-3 py-2.5 rounded-lg border border-slate-200" />
        <input type="number" min={0} required placeholder="Fee (INR)" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="px-3 py-2.5 rounded-lg border border-slate-200" />
        <button type="submit" className="sm:col-span-3 bg-[#0071BC] text-white font-bold py-2.5 rounded-lg hover:bg-[#005a96]">
          + Create Course
        </button>
      </form>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-3.5">Code</th>
              <th className="p-3.5">Title</th>
              <th className="p-3.5">Category</th>
              <th className="p-3.5">Duration</th>
              <th className="p-3.5">Fee</th>
              <th className="p-3.5">Active</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((c) => (
              <tr key={c._id} className="border-b border-slate-100">
                <td className="p-3.5 font-mono font-bold text-[#2E3192]">{c.code}</td>
                <td className="p-3.5 font-semibold">{c.title}</td>
                <td className="p-3.5">{c.category}</td>
                <td className="p-3.5">{c.durationWeeks} weeks</td>
                <td className="p-3.5">₹{c.fee?.amount}</td>
                <td className="p-3.5">{c.isActive ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
