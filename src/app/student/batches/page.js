'use client';

import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../../lib/api';

export default function StudentBatchesPage() {
  const [batches, setBatches] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest('/student/batches')
      .then((res) => setBatches(res.batches || []))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="p-6 sm:p-8 space-y-5">
      <h1 className="text-xl font-bold text-[#2E3192]">My Batches & Timetable</h1>
      {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">{error}</div>}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-3.5">Batch</th>
              <th className="p-3.5">Course</th>
              <th className="p-3.5">Trainer</th>
              <th className="p-3.5">Days</th>
              <th className="p-3.5">Timing</th>
              <th className="p-3.5">Mode</th>
            </tr>
          </thead>
          <tbody>
            {batches.length === 0 ? (
              <tr><td colSpan={6} className="p-6 text-center text-slate-500">No enrolled batches found.</td></tr>
            ) : (
              batches.map((b) => (
                <tr key={b._id} className="border-b border-slate-100">
                  <td className="p-3.5 font-mono font-bold text-[#2E3192]">{b.code}</td>
                  <td className="p-3.5 font-semibold">{b.course?.title}</td>
                  <td className="p-3.5">{b.trainer?.name}</td>
                  <td className="p-3.5">{b.timing?.days?.join(', ') || '—'}</td>
                  <td className="p-3.5">{b.timing?.startTime} – {b.timing?.endTime}</td>
                  <td className="p-3.5">{b.mode}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
