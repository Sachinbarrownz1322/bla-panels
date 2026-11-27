'use client';

import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../../lib/api';

export default function TrainerStudentsPage() {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [students, setStudents] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest('/trainer/batches')
      .then((res) => {
        const list = res.batches || [];
        setBatches(list);
        if (list[0]?._id) setSelectedBatch(list[0]._id);
      })
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    if (!selectedBatch) return;
    apiRequest(`/trainer/batches/${selectedBatch}/students`)
      .then((res) => setStudents(res.students || []))
      .catch((err) => setError(err.message));
  }, [selectedBatch]);

  return (
    <div className="p-6 sm:p-8 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-[#2E3192]">Assigned Batch Students</h1>
        <select
          value={selectedBatch}
          onChange={(e) => setSelectedBatch(e.target.value)}
          className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold"
        >
          {batches.map((b) => (
            <option key={b._id} value={b._id}>{b.code} — {b.name}</option>
          ))}
        </select>
      </div>

      {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">{error}</div>}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-3.5">OTR ID</th>
              <th className="p-3.5">Student Name</th>
              <th className="p-3.5">Email</th>
              <th className="p-3.5">Phone</th>
              <th className="p-3.5">Status</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr><td colSpan={5} className="p-6 text-center text-slate-500">No students enrolled in this batch.</td></tr>
            ) : (
              students.map((s, idx) => (
                <tr key={idx} className="border-b border-slate-100">
                  <td className="p-3.5 font-mono font-bold text-[#2E3192]">{s.otrProfile?.otrNumber || '—'}</td>
                  <td className="p-3.5 font-semibold">{s.student?.name || s.otrProfile?.fullName}</td>
                  <td className="p-3.5">{s.student?.email}</td>
                  <td className="p-3.5">{s.student?.phone}</td>
                  <td className="p-3.5 font-bold">{s.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
