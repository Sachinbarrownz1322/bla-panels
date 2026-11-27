'use client';

import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../../lib/api';

export default function StudentAttendancePage() {
  const [summary, setSummary] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest('/attendance/me')
      .then((res) => {
        setSummary(res.summary);
        setHistory(res.history || []);
      })
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="p-6 sm:p-8 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#2E3192]">My Attendance</h1>
        {summary && (
          <span className="px-4 py-1.5 rounded-full bg-blue-50 text-[#2E3192] font-bold text-xs">
            Overall: {summary.percentage}% ({summary.presentCount}/{summary.totalSessions})
          </span>
        )}
      </div>
      {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">{error}</div>}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-3.5">Date</th>
              <th className="p-3.5">Batch</th>
              <th className="p-3.5">Session</th>
              <th className="p-3.5">Status</th>
            </tr>
          </thead>
          <tbody>
            {history.length === 0 ? (
              <tr><td colSpan={4} className="p-6 text-center text-slate-500">No attendance records yet.</td></tr>
            ) : (
              history.map((h) => (
                <tr key={h._id} className="border-b border-slate-100">
                  <td className="p-3.5">{new Date(h.date).toLocaleDateString()}</td>
                  <td className="p-3.5 font-mono">{h.batch?.code}</td>
                  <td className="p-3.5">{h.sessionKey}</td>
                  <td className="p-3.5 font-bold">{h.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
