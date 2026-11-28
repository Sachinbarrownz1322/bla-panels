'use client';

import React, { useEffect, useState } from 'react';
import { Pencil, ShieldCheck, CheckCircle2, X } from 'lucide-react';
import { apiRequest } from '../../../lib/api';

export default function AdminUsersPage() {
  const [me, setMe] = useState(null);
  const [users, setUsers] = useState([]);
  const [adminCount, setAdminCount] = useState(0);
  const [maxAdmins, setMaxAdmins] = useState(2);
  const [roleFilter, setRoleFilter] = useState('ALL');

  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', roleName: 'TRAINER' });
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [otpBusy, setOtpBusy] = useState(false);

  const [accessEmail, setAccessEmail] = useState('');
  const [accessVerified, setAccessVerified] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', phone: '', roleName: 'STUDENT' });
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const [meRes, usersRes] = await Promise.all([
        apiRequest('/auth/me'),
        apiRequest('/admin/users'),
      ]);
      setMe(meRes.user);
      setAccessEmail(meRes.user?.accessEmail || '');
      setAccessVerified(Boolean(meRes.user?.accessEmailVerified));
      setUsers(usersRes.users || []);
      if (typeof usersRes.adminCount === 'number') {
        setAdminCount(usersRes.adminCount);
        setMaxAdmins(usersRes.maxAdmins || 2);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (otpCooldown <= 0) return;
    const t = setTimeout(() => setOtpCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [otpCooldown]);

  const isSuperAdmin = me?.roleName === 'SUPER_ADMIN';
  const canManageAdmin = isSuperAdmin || me?.roleName === 'ADMIN';
  const canCreateAdmin = canManageAdmin && adminCount < maxAdmins;

  useEffect(() => {
    if (!canCreateAdmin && form.roleName === 'ADMIN') {
      setForm((prev) => ({ ...prev, roleName: 'TRAINER' }));
    }
  }, [canCreateAdmin, form.roleName]);

  const handleSendOtp = async () => {
    setError('');
    setMsg('');
    if (!form.email) {
      setError('Please enter the email address first.');
      return;
    }
    setOtpBusy(true);
    try {
      const res = await apiRequest('/admin/users/staff/send-otp', {
        method: 'POST',
        body: JSON.stringify({ email: form.email, roleName: form.roleName }),
      });
      setOtpSent(true);
      setOtpCooldown(60);
      setMsg(res.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setOtpBusy(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError('');
    setMsg('');
    if (!/^\d{6}$/.test(otp.trim())) {
      setError('Please enter the 6-digit OTP.');
      return;
    }
    setOtpBusy(true);
    try {
      const res = await apiRequest('/admin/users/staff/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ email: form.email, otp: otp.trim() }),
      });
      setEmailVerified(true);
      setMsg(res.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setOtpBusy(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!emailVerified) {
      setError('Please verify the email via OTP before creating the account.');
      return;
    }
    setError('');
    setMsg('');
    try {
      const res = await apiRequest('/admin/users/staff', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setMsg(res.message);
      setForm({ name: '', email: '', phone: '', password: '', roleName: 'TRAINER' });
      setOtp('');
      setOtpSent(false);
      setEmailVerified(false);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggle = async (id) => {
    setError('');
    setMsg('');
    try {
      const res = await apiRequest(`/admin/users/${id}/toggle-active`, { method: 'PATCH' });
      setMsg(res.message);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    setError('');
    setMsg('');
    try {
      const res = await apiRequest(`/admin/users/${editingUser._id}`, {
        method: 'PATCH',
        body: JSON.stringify(editForm),
      });
      setMsg(res.message);
      setEditingUser(null);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSaveAccessEmail = async (e) => {
    e.preventDefault();
    setError('');
    setMsg('');
    try {
      const res = await apiRequest('/admin/super-admin/access-email', {
        method: 'PATCH',
        body: JSON.stringify({ accessEmail }),
      });
      setAccessEmail(res.accessEmail);
      setAccessVerified(res.accessEmailVerified);
      setMsg(res.message);
    } catch (err) {
      setError(err.message);
    }
  };

  // Users table displays Admins, Trainers & Students (never Super Admin)
  const visibleUsers = users.filter((u) => {
    if (u.roleName === 'SUPER_ADMIN') return false;
    if (roleFilter === 'ALL') return true;
    return u.roleName === roleFilter;
  });

  return (
    <div className="p-6 sm:p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-[#2E3192]">Users, Trainers & Staff</h1>
          <p className="text-xs text-slate-500">
            {isSuperAdmin
              ? `Super Admin Control: Create up to ${maxAdmins} Admins & unlimited Trainers with instant email OTP verification.`
              : 'Manage Trainers and Students (Create Trainer, Read, Update & Deactivate).'}
          </p>
        </div>
      </div>

      {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">{error}</div>}
      {msg && <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs">{msg}</div>}

      {/* Super Admin Only: Access / Recovery Email Configuration */}
      {isSuperAdmin && (
        <form onSubmit={handleSaveAccessEmail} className="bg-white p-5 rounded-xl border border-[#2E3192]/25 shadow-sm space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-[#2E3192]">
              <ShieldCheck className="w-4 h-4 text-[#0071BC]" />
              <span>Super Admin Access Email (OTP Verification Ready)</span>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${accessVerified ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
              {accessVerified ? 'OTP Verified' : 'Pending OTP Verification'}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              required
              value={accessEmail}
              onChange={(e) => setAccessEmail(e.target.value)}
              placeholder="Enter Super Admin access/recovery email (e.g. sachin@barrownz.in)"
              className="flex-1 px-3 py-2.5 rounded-lg border border-slate-200"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-lg bg-[#2E3192] hover:bg-[#0071BC] text-white font-bold shrink-0"
            >
              Save Access Email
            </button>
          </div>
          <p className="text-[11px] text-slate-500">
            Save your personal email here now; OTP verification for Super Admin access can be completed later.
          </p>
        </form>
      )}

      {/* Create Staff Form with Instant Email OTP Verification */}
      <form onSubmit={handleCreate} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          <input
            required
            placeholder="Full Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="px-3 py-2.5 rounded-lg border border-slate-200"
          />
          <div className="sm:col-span-2 flex gap-2">
            <input
              required
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => {
                setForm({ ...form, email: e.target.value });
                setEmailVerified(false);
                setOtpSent(false);
                setOtp('');
              }}
              className="flex-1 px-3 py-2.5 rounded-lg border border-slate-200"
            />
            {emailVerified ? (
              <span className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700 font-bold shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" /> Verified
              </span>
            ) : (
              <button
                type="button"
                disabled={otpBusy || otpCooldown > 0}
                onClick={handleSendOtp}
                className="px-3 py-2 rounded-lg bg-[#2E3192] hover:bg-[#0071BC] disabled:opacity-50 text-white font-bold shrink-0"
              >
                {otpCooldown > 0 ? `${otpCooldown}s` : otpSent ? 'Resend' : 'Send OTP'}
              </button>
            )}
          </div>
          <input
            required
            placeholder="10-digit Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="px-3 py-2.5 rounded-lg border border-slate-200"
          />
          <select
            value={form.roleName}
            onChange={(e) => setForm({ ...form, roleName: e.target.value })}
            className="px-3 py-2.5 rounded-lg border border-slate-200"
          >
            <option value="TRAINER">TRAINER</option>
            {canCreateAdmin && <option value="ADMIN">ADMIN</option>}
          </select>
        </div>

        {otpSent && !emailVerified && (
          <div className="flex flex-wrap items-center gap-2 bg-sky-50/70 p-3 rounded-lg border border-[#0071BC]/20">
            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 6-digit Email OTP"
              className="w-48 px-3 py-2 rounded-lg border border-slate-200 bg-white font-mono"
            />
            <button
              type="button"
              disabled={otpBusy}
              onClick={handleVerifyOtp}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            >
              Verify Email OTP
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            required
            type="password"
            minLength={8}
            placeholder="Portal Password (min 8 chars)"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="px-3 py-2.5 rounded-lg border border-slate-200"
          />
          <button
            type="submit"
            disabled={!emailVerified}
            className="sm:col-span-2 bg-[#0071BC] disabled:opacity-50 text-white font-bold py-2.5 rounded-lg hover:bg-[#005a96]"
          >
            {canCreateAdmin ? '+ Add Admin / Trainer Account' : '+ Add Trainer Account'}
          </button>
        </div>
      </form>

      {/* Filter Bar: Admins, Trainers & Students (No Super Admin shown) */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 text-xs">
          {[
            { key: 'ALL', label: 'All' },
            { key: 'ADMIN', label: 'Admins' },
            { key: 'TRAINER', label: 'Trainers' },
            { key: 'STUDENT', label: 'Students' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setRoleFilter(tab.key)}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition ${
                roleFilter === tab.key
                  ? 'bg-[#2E3192] text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <span className="text-xs text-slate-500 font-semibold">
          Showing {visibleUsers.length} user(s)
        </span>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-3.5">Name</th>
              <th className="p-3.5">Email</th>
              <th className="p-3.5">Phone</th>
              <th className="p-3.5">Role</th>
              <th className="p-3.5">OTR</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visibleUsers.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-slate-500">
                  No users found for this filter.
                </td>
              </tr>
            ) : (
              visibleUsers.map((u) => (
                <tr key={u._id} className="border-b border-slate-100">
                  <td className="p-3.5 font-semibold">{u.name}</td>
                  <td className="p-3.5">{u.email}</td>
                  <td className="p-3.5">{u.phone}</td>
                  <td className="p-3.5 font-bold text-[#2E3192]">{u.roleName}</td>
                  <td className="p-3.5 font-mono">{u.otrProfile?.otrNumber || '—'}</td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${u.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                      {u.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="p-3.5 flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingUser(u);
                        setEditForm({ name: u.name, phone: u.phone, roleName: u.roleName });
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-sky-50 text-[#0071BC] font-semibold hover:bg-sky-100"
                    >
                      <Pencil className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleToggle(u._id)}
                      className="px-2.5 py-1 rounded bg-slate-800 text-white font-semibold hover:bg-slate-900"
                    >
                      {u.isActive ? 'Disable' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#2E3192]">Edit User — {editingUser.roleName}</h2>
              <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Full Name</label>
                <input
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Phone</label>
                <input
                  required
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Role</label>
                <select
                  value={editForm.roleName}
                  onChange={(e) => setEditForm({ ...editForm, roleName: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-white"
                >
                  <option value="STUDENT">STUDENT</option>
                  <option value="TRAINER">TRAINER</option>
                  {canManageAdmin && (editingUser.roleName === 'ADMIN' || canCreateAdmin) && (
                    <option value="ADMIN">ADMIN</option>
                  )}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setEditingUser(null)} className="px-4 py-2 rounded-lg border border-slate-200 font-semibold">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-[#2E3192] text-white font-semibold hover:bg-[#0071BC]">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
