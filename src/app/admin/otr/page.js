'use client';

import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../../lib/api';

export default function AdminOTRPage() {
  const [profiles, setProfiles] = useState([]);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  const loadProfiles = () => {
    apiRequest('/admin/otr-profiles')
      .then((res) => setProfiles(res.profiles || []))
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    loadProfiles();
  }, []);

  const handleVerify = async (id, status) => {
    setError('');
    setMsg('');
    try {
      const res = await apiRequest(`/admin/otr-profiles/${id}/verify`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      setMsg(res.message);
      loadProfiles();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-5">
      <h1 className="text-xl font-bold text-[#2E3192]">OTR Registrations & Verification</h1>

      {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">{error}</div>}
      {msg && <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs">{msg}</div>}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
            <tr>
              <th className="p-3.5">OTR Number</th>
              <th className="p-3.5">Student Name</th>
              <th className="p-3.5">Track</th>
              <th className="p-3.5">Phone / Email</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5">Actions</th>
            </tr>
          </thead>
          <tbody>
            {profiles.length === 0 ? (
              <tr><td colSpan={6} className="p-6 text-center text-slate-500">No OTR profiles found.</td></tr>
            ) : (
              profiles.map((p) => (
                <tr key={p._id} className="border-b border-slate-100">
                  <td className="p-3.5 font-mono font-bold text-[#2E3192]">{p.otrNumber}</td>
                  <td className="p-3.5 font-semibold">{p.fullName}</td>
                  <td className="p-3.5">{p.trainingTrack}</td>
                  <td className="p-3.5 text-slate-600">
                    <div>
                      {p.phone}{' '}
                      {p.mobileVerified ? (
                        <span className="inline-block px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                          Mobile Verified
                        </span>
                      ) : (
                        <span className="inline-block px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 text-[10px] font-bold">
                          Mobile Pending
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5">
                      {p.email}{' '}
                      {p.emailVerified ? (
                        <span className="inline-block px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                          Email Verified
                        </span>
                      ) : (
                        <span className="inline-block px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 text-[10px] font-bold">
                          Email Pending
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-3.5 font-bold">{p.status}</td>
                  <td className="p-3.5 flex gap-2">
                    <button
                      onClick={() => handleVerify(p._id, 'VERIFIED')}
                      className="px-2.5 py-1 rounded bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
                    >
                      Verify
                    </button>
                    <button
                      onClick={() => handleVerify(p._id, 'REJECTED')}
                      className="px-2.5 py-1 rounded bg-red-600 text-white font-semibold hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
