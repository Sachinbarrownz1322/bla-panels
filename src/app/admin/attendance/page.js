'use client';

import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../../lib/api';

export default function AdminAttendancePage() {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [sessions, setSessions] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest('/batches')
      .then((res) => {
        const list = res.batches || [];
        setBatches(list);
        if (list[0]?._id) setSelectedBatch(list[0]._id);
      })
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    if (!selectedBatch) return;
    apiRequest(`/attendance/batch/${selectedBatch}`)
      .then((res) => setSessions(res.sessions || []))
      .catch((err) => setError(err.message));
  }, [selectedBatch]);

  return (
    <div className="p-6 sm:p-8 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-[#2E3192]">Attendance Records</h1>
        <select value={selectedBatch} onChange={(e) => setSelectedBatch(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold">
          {batches.map((b) => <option key={b._id} value={b._id}>{b.code} — {b.name}</option>)}
        </select>
      </div>
      {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">{error}</div>}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-3.5">Date</th>
              <th className="p-3.5">Session</th>
              <th className="p-3.5">Present</th>
              <th className="p-3.5">Total Marked</th>
            </tr>
          </thead>
          <tbody>
            {sessions.length === 0 ? (
              <tr><td colSpan={4} className="p-6 text-center text-slate-500">No attendance sessions recorded for this batch.</td></tr>
            ) : (
              sessions.map((s) => (
                <tr key={s._id} className="border-b border-slate-100">
                  <td className="p-3.5">{new Date(s.date).toLocaleDateString()}</td>
                  <td className="p-3.5 font-mono font-bold text-[#2E3192]">{s.sessionKey}</td>
                  <td className="p-3.5">{s.records.filter((r) => r.status === 'PRESENT' || r.status === 'LATE').length}</td>
                  <td className="p-3.5">{s.records.length}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
