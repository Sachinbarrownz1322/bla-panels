'use client';

import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../../lib/api';

export default function TrainerBatchesPage() {
  const [batches, setBatches] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest('/trainer/batches')
      .then((res) => setBatches(res.batches || []))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="p-6 sm:p-8 space-y-5">
      <h1 className="text-xl font-bold text-[#2E3192]">Assigned Batches & Courses</h1>
      {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">{error}</div>}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-3.5">Batch Code</th>
              <th className="p-3.5">Name</th>
              <th className="p-3.5">Course</th>
              <th className="p-3.5">Schedule</th>
              <th className="p-3.5">Students</th>
              <th className="p-3.5">Status</th>
            </tr>
          </thead>
          <tbody>
            {batches.length === 0 ? (
              <tr><td colSpan={6} className="p-6 text-center text-slate-500">No batches assigned.</td></tr>
            ) : (
              batches.map((b) => (
                <tr key={b._id} className="border-b border-slate-100">
                  <td className="p-3.5 font-mono font-bold text-[#2E3192]">{b.code}</td>
                  <td className="p-3.5 font-semibold">{b.name}</td>
                  <td className="p-3.5">{b.course?.title}</td>
                  <td className="p-3.5">{b.timing?.startTime} – {b.timing?.endTime}</td>
                  <td className="p-3.5">{b.students?.length || 0} / {b.maxCapacity}</td>
                  <td className="p-3.5 font-bold">{b.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
