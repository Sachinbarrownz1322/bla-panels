'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, History } from 'lucide-react';
import { apiRequest } from '../../../../lib/api';

export default function CmsAuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest('/cms/audit-logs')
      .then((res) => setLogs(res.logs || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/cms" className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50">
          <ArrowLeft className="w-4 h-4 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-[#2E3192]">CMS Audit History</h1>
          <p className="text-xs text-slate-500">Super Admin log of all Website CMS creations, edits, publishes & deletions.</p>
        </div>
      </div>

      {error && <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">{error}</div>}

      {loading ? (
        <div className="p-8 text-center text-xs text-slate-500">Loading CMS audit logs...</div>
      ) : logs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-2">
          <History className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-sm font-semibold text-slate-700">No CMS changes recorded yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b text-slate-600">
              <tr>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Collection</th>
                <th className="py-3 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {logs.map((l) => (
                <tr key={l._id}>
                  <td className="py-3 px-4 font-mono font-bold text-[#2E3192]">{l.action}</td>
                  <td className="py-3 px-4">{l.actorEmail}</td>
                  <td className="py-3 px-4">{l.role}</td>
                  <td className="py-3 px-4 text-slate-500">{l.targetCollection}</td>
                  <td className="py-3 px-4 text-slate-500">{new Date(l.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
