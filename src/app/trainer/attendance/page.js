'use client';

import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../../lib/api';

export default function TrainerAttendancePage() {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [sessionKey, setSessionKey] = useState('MORNING');
  const [students, setStudents] = useState([]);
  const [statuses, setStatuses] = useState({});
  const [msg, setMsg] = useState('');
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
      .then((res) => {
        const list = res.students || [];
        setStudents(list);
        const init = {};
        for (const s of list) {
          if (s.student?._id) init[s.student._id] = 'PRESENT';
        }
        setStatuses(init);
      })
      .catch((err) => setError(err.message));
  }, [selectedBatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    setError('');
    try {
      const records = Object.entries(statuses).map(([studentId, status]) => ({
        studentId,
        status,
      }));
      const res = await apiRequest('/attendance', {
        method: 'POST',
        body: JSON.stringify({ batchId: selectedBatch, date, sessionKey, records }),
      });
      setMsg(res.message);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-5">
      <h1 className="text-xl font-bold text-[#2E3192]">Mark Batch Attendance</h1>
      {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">{error}</div>}
      {msg && <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs">{msg}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <select value={selectedBatch} onChange={(e) => setSelectedBatch(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-200">
            {batches.map((b) => <option key={b._id} value={b._id}>{b.code} — {b.name}</option>)}
          </select>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-200" />
          <select value={sessionKey} onChange={(e) => setSessionKey(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-200">
            <option value="MORNING">MORNING</option>
            <option value="AFTERNOON">AFTERNOON</option>
            <option value="EVENING">EVENING</option>
            <option value="DEFAULT">DEFAULT</option>
          </select>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-3.5">OTR ID</th>
                <th className="p-3.5">Student Name</th>
                <th className="p-3.5">Status</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr><td colSpan={3} className="p-6 text-center text-slate-500">No students enrolled in selected batch.</td></tr>
              ) : (
                students.map((s) => (
                  <tr key={s.student?._id} className="border-b border-slate-100">
                    <td className="p-3.5 font-mono font-bold text-[#2E3192]">{s.otrProfile?.otrNumber}</td>
                    <td className="p-3.5 font-semibold">{s.student?.name}</td>
                    <td className="p-3.5">
                      <select
                        value={statuses[s.student?._id] || 'PRESENT'}
                        onChange={(e) => setStatuses({ ...statuses, [s.student._id]: e.target.value })}
                        className="px-2.5 py-1 rounded border border-slate-200"
                      >
                        <option value="PRESENT">PRESENT</option>
                        <option value="ABSENT">ABSENT</option>
                        <option value="LATE">LATE</option>
                        <option value="EXCUSED">EXCUSED</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {students.length > 0 && (
          <button type="submit" className="px-6 py-2.5 rounded-lg bg-[#0071BC] text-white text-xs font-bold hover:bg-[#005a96]">
            Save Attendance
          </button>
        )}
      </form>
    </div>
  );
}
