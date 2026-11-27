'use client';

import React, { useEffect, useState } from 'react';
import { BarChart3, CheckCircle2, AlertTriangle } from 'lucide-react';
import { apiRequest } from '../../../lib/api';

export default function TrainerResultsPage() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest('/certificates/results')
      .then((res) => setResults(res.results || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#2E3192]">Student Assessment Results</h1>
        <p className="text-xs text-slate-500">
          Review graded test submissions for assessments in your assigned batches.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          {error}
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center text-xs text-slate-500">Loading results...</div>
      ) : results.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-2">
          <BarChart3 className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-sm font-semibold text-slate-700">No student submissions yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 border-b">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">OTR No</th>
                <th className="py-3 px-4">Assessment</th>
                <th className="py-3 px-4">Score</th>
                <th className="py-3 px-4">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {results.map((r) => (
                <tr key={r._id}>
                  <td className="py-3 px-4 font-semibold text-slate-900">{r.student?.name}</td>
                  <td className="py-3 px-4 font-mono text-[#0071BC]">{r.otrProfile?.otrNumber}</td>
                  <td className="py-3 px-4">{r.assessment?.title}</td>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
