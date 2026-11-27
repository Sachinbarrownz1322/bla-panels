'use client';

import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../../lib/api';

export default function StudentProfilePage() {
  const [profile, setProfile] = useState(null);
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest('/student/profile')
      .then((res) => {
        setProfile(res.profile);
        setCity(res.profile?.address?.city || '');
        setPincode(res.profile?.address?.pincode || '');
      })
      .catch((err) => setError(err.message));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setMsg('');
    setError('');
    try {
      const res = await apiRequest('/student/profile', {
        method: 'PATCH',
        body: JSON.stringify({ address: { city, pincode } }),
      });
      setMsg(res.message);
      setProfile(res.profile);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-3xl">
      <h1 className="text-xl font-bold text-[#2E3192]">My OTR Information & Profile</h1>
      {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">{error}</div>}
      {msg && <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs">{msg}</div>}

      {profile && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-4 border-b border-slate-100">
            <div><span className="text-slate-500">OTR Number:</span> <strong className="font-mono text-[#2E3192]">{profile.otrNumber}</strong></div>
            <div><span className="text-slate-500">OTR Status:</span> <strong>{profile.status}</strong></div>
            <div><span className="text-slate-500">Full Name:</span> <strong>{profile.fullName}</strong></div>
            <div>
              <span className="text-slate-500">Email:</span>{' '}
              <strong>{profile.email}</strong>{' '}
              <span
                className={`ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  profile.emailVerified
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-amber-50 text-amber-700'
                }`}
              >
                {profile.emailVerified ? 'Verified' : 'Pending'}
              </span>
            </div>
            <div>
              <span className="text-slate-500">Phone:</span>{' '}
              <strong>{profile.phone}</strong>{' '}
              <span
                className={`ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  profile.mobileVerified
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-amber-50 text-amber-700'
                }`}
              >
                {profile.mobileVerified ? 'Verified' : 'Pending'}
              </span>
            </div>
            <div><span className="text-slate-500">Training Track:</span> <strong>{profile.trainingTrack}</strong></div>
          </div>

          <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block font-bold mb-1">City</label>
              <input value={city} onChange={(e) => setCity(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200" />
            </div>
            <div>
              <label className="block font-bold mb-1">PIN Code</label>
              <input value={pincode} maxLength={6} onChange={(e) => setPincode(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200" />
            </div>
            <button type="submit" className="sm:col-span-2 bg-[#0071BC] text-white font-bold py-2.5 rounded-lg hover:bg-[#005a96]">
              Update Address Details
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
