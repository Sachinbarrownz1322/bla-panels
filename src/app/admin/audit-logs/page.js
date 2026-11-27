'use client';

import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../../lib/api';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest('/admin/audit-logs?limit=100')
      .then((res) => setLogs(res.logs || []))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="p-6 sm:p-8 space-y-5">
      <h1 className="text-xl font-bold text-[#2E3192]">System Audit Logs</h1>
      {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">{error}</div>}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-3.5">Action</th>
              <th className="p-3.5">Actor</th>
              <th className="p-3.5">Role</th>
              <th className="p-3.5">Collection</th>
              <th className="p-3.5">IP</th>
              <th className="p-3.5">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l._id} className="border-b border-slate-100">
                <td className="p-3.5 font-mono font-bold text-[#2E3192]">{l.action}</td>
                <td className="p-3.5">{l.actorEmail}</td>
                <td className="p-3.5">{l.role}</td>
                <td className="p-3.5">{l.targetCollection}</td>
                <td className="p-3.5 font-mono">{l.ipAddress || '—'}</td>
                <td className="p-3.5 text-slate-500">{new Date(l.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
