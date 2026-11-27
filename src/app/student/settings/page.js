'use client';

import React, { useState } from 'react';
import { apiRequest } from '../../../lib/api';

export default function StudentSettingsPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    setError('');
    try {
      const res = await apiRequest('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      setMsg(res.message);
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-5 max-w-lg">
      <h1 className="text-xl font-bold text-[#2E3192]">Account Security Settings</h1>
      {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">{error}</div>}
      {msg && <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs">{msg}</div>}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 text-xs">
        <div>
          <label className="block font-bold mb-1">Current Password</label>
          <input type="password" required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-slate-200" />
        </div>
        <div>
          <label className="block font-bold mb-1">New Password (min 8 characters)</label>
          <input type="password" required minLength={8} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-slate-200" />
        </div>
        <button type="submit" className="w-full bg-[#0071BC] text-white font-bold py-2.5 rounded-lg hover:bg-[#005a96]">
          Update Password
        </button>
      </form>
    </div>
  );
}
