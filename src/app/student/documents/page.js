'use client';

import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../../lib/api';

export default function StudentDocumentsPage() {
  const [docs, setDocs] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest('/student/documents')
      .then((res) => setDocs(res.documents || []))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="p-6 sm:p-8 space-y-5">
      <h1 className="text-xl font-bold text-[#2E3192]">My Documents</h1>
      {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">{error}</div>}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 text-xs">
        {docs.length === 0 ? (
          <p className="text-slate-500">No documents uploaded yet.</p>
        ) : (
          <ul className="space-y-2">
            {docs.map((d) => (
              <li key={d._id} className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex justify-between">
                <span><strong>{d.docType}</strong> — {d.fileName}</span>
                <span className="font-bold">{d.isVerified ? 'Verified' : 'Pending'}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
