'use client';

import React, { useEffect, useState } from 'react';
import { BadgeCheck, Plus, ShieldOff, RotateCcw, ExternalLink, X } from 'lucide-react';
import { apiRequest, WEBSITE_BASE_URL } from '../../../lib/api';

export default function AdminCertificatesPage() {
  const [certificates, setCertificates] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [showIssue, setShowIssue] = useState(false);
  const [form, setForm] = useState({
    studentId: '',
    courseId: '',
    batchId: '',
    certificateType: 'TRAINING_COMPLETION',
    gradeOrScore: 'A',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [certRes, userRes, courseRes, batchRes] = await Promise.all([
        apiRequest('/certificates'),
        apiRequest('/admin/users?role=STUDENT'),
        apiRequest('/courses'),
        apiRequest('/batches'),
      ]);
      setCertificates(certRes.certificates || []);
      setStudents(userRes.users || []);
      setCourses(courseRes.courses || []);
      setBatches(batchRes.batches || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleIssue = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const res = await apiRequest('/certificates', {
        method: 'POST',
        body: JSON.stringify({
          studentId: form.studentId,
          courseId: form.courseId,
          batchId: form.batchId || null,
          certificateType: form.certificateType,
          gradeOrScore: form.gradeOrScore,
        }),
      });
      setShowIssue(false);
      setForm({
        studentId: '',
        courseId: '',
        batchId: '',
        certificateType: 'TRAINING_COMPLETION',
        gradeOrScore: 'A',
      });
      setMessage(res.message);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggleRevoke = async (cert) => {
    setError('');
    setMessage('');
    const willRevoke = !cert.isRevoked;
    const reason = willRevoke
      ? window.prompt('Enter revocation reason:', 'Administrative revocation')
      : '';
    if (willRevoke && reason === null) return;

    try {
      const res = await apiRequest(`/certificates/${cert._id}/revoke`, {
        method: 'PATCH',
        body: JSON.stringify({ isRevoked: willRevoke, revocationReason: reason || '' }),
      });
      setMessage(res.message);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#2E3192]">Certificate Management</h1>
          <p className="text-xs text-slate-500">
            Issue verifiable BLA certificates with sequential serial IDs, or revoke compromised credentials.
          </p>
        </div>
        <button
          onClick={() => setShowIssue(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2E3192] hover:bg-[#0071BC] text-white text-xs font-semibold transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Issue Certificate</span>
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          {error}
        </div>
      )}
      {message && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
          {message}
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center text-xs text-slate-500">Loading certificates...</div>
      ) : certificates.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-2">
          <BadgeCheck className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-sm font-semibold text-slate-700">No certificates issued yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 border-b">
              <tr>
                <th className="py-3 px-4">Certificate ID</th>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Course & Type</th>
                <th className="py-3 px-4">Grade</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {certificates.map((c) => (
                <tr key={c._id} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 font-mono font-bold text-[#0071BC]">{c.certificateId}</td>
                  <td className="py-3 px-4">
                    <p className="font-semibold text-slate-900">{c.studentName}</p>
                    <p className="text-[11px] font-mono text-slate-500">{c.otrProfile?.otrNumber || c.user?.email}</p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-semibold text-slate-800">{c.course?.title}</p>
                    <p className="text-[11px] text-slate-500">{c.certificateType}</p>
                  </td>
                  <td className="py-3 px-4 font-bold">{c.gradeOrScore}</td>
                  <td className="py-3 px-4">
                    {c.isRevoked ? (
                      <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold text-[10px]">
                        REVOKED
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px]">
                        VALID
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <a
                      href={`${WEBSITE_BASE_URL}/Home/VerifyCertificate?id=${encodeURIComponent(c.certificateId)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Verify</span>
                    </a>
                    <button
                      onClick={() => handleToggleRevoke(c)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-semibold ${
                        c.isRevoked
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                      }`}
                    >
                      {c.isRevoked ? <RotateCcw className="w-3.5 h-3.5" /> : <ShieldOff className="w-3.5 h-3.5" />}
                      <span>{c.isRevoked ? 'Reinstate' : 'Revoke'}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showIssue && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#2E3192]">Issue New Certificate</h2>
              <button onClick={() => setShowIssue(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleIssue} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Student *</label>
                <select
                  required
                  value={form.studentId}
                  onChange={(e) => setForm({ ...form, studentId: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2"
                >
                  <option value="">Select student</option>
                  {students.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.email})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1">Course *</label>
                <select
                  required
                  value={form.courseId}
                  onChange={(e) => setForm({ ...form, courseId: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2"
                >
                  <option value="">Select course</option>
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.title} ({c.code})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1">Batch (Optional)</label>
                <select
                  value={form.batchId}
                  onChange={(e) => setForm({ ...form, batchId: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2"
                >
                  <option value="">None</option>
                  {batches.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.name} ({b.code})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Type</label>
                  <select
                    value={form.certificateType}
                    onChange={(e) => setForm({ ...form, certificateType: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2"
                  >
                    <option value="TRAINING_COMPLETION">TRAINING_COMPLETION</option>
                    <option value="INTERNSHIP">INTERNSHIP</option>
                    <option value="WORKSHOP">WORKSHOP</option>
                    <option value="INDUSTRIAL_VISIT">INDUSTRIAL_VISIT</option>
                    <option value="MERIT">MERIT</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Grade / Score</label>
                  <input
                    required
                    value={form.gradeOrScore}
                    onChange={(e) => setForm({ ...form, gradeOrScore: e.target.value })}
                    placeholder="A+ / 92%"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowIssue(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#2E3192] text-white font-semibold hover:bg-[#0071BC]"
                >
                  Issue Certificate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
