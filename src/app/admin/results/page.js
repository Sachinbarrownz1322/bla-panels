'use client';

import React, { useEffect, useState } from 'react';
import { BarChart3, CheckCircle2, AlertTriangle, BadgeCheck } from 'lucide-react';
import { apiRequest } from '../../../lib/api';

export default function AdminResultsPage() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadResults = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/certificates/results');
      setResults(res.results || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResults();
  }, []);

  const handleQuickIssue = async (r) => {
    setError('');
    setMessage('');
    try {
      const grade =
        r.percentage >= 90 ? 'A+' : r.percentage >= 75 ? 'A' : r.percentage >= 60 ? 'B' : 'C';
      const res = await apiRequest('/certificates', {
        method: 'POST',
        body: JSON.stringify({
          studentId: r.student?._id,
          courseId: r.assessment?.course?._id,
          batchId: r.assessment?.batch?._id || null,
          assessmentId: r.assessment?._id,
          submissionId: r._id,
          certificateType: 'TRAINING_COMPLETION',
          gradeOrScore: `${grade} (${r.percentage}%)`,
        }),
      });
      setMessage(res.message);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#2E3192]">Assessment Results Ledger</h1>
        <p className="text-xs text-slate-500">
          Review all student exam submissions and issue official certificates for passed candidates.
        </p>
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
        <div className="p-8 text-center text-xs text-slate-500">Loading results...</div>
      ) : results.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-2">
          <BarChart3 className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-sm font-semibold text-slate-700">No submitted results yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 border-b">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">OTR No</th>
                <th className="py-3 px-4">Assessment / Course</th>
                <th className="py-3 px-4">Score</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {results.map((r) => (
                <tr key={r._id} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 font-semibold text-slate-900">{r.student?.name}</td>
                  <td className="py-3 px-4 font-mono text-[#0071BC]">{r.otrProfile?.otrNumber}</td>
                  <td className="py-3 px-4">
                    <p className="font-semibold text-slate-800">{r.assessment?.title}</p>
                    <p className="text-[11px] text-slate-500">{r.assessment?.course?.title}</p>
                  </td>
                  <td className="py-3 px-4 font-bold">
                    {r.scoreObtained} / {r.assessment?.totalMarks} ({r.percentage}%)
                  </td>
                  <td className="py-3 px-4">
                    {r.isPassed ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> PASS
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-rose-600 font-bold">
                        <AlertTriangle className="w-3.5 h-3.5" /> FAIL
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {r.isPassed && (
                      <button
                        onClick={() => handleQuickIssue(r)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#2E3192] hover:bg-[#0071BC] text-white font-semibold"
                      >
                        <BadgeCheck className="w-3.5 h-3.5" />
                        <span>Issue Cert</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
