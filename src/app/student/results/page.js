'use client';

import React, { useEffect, useState } from 'react';
import { BarChart3, CheckCircle2, AlertTriangle } from 'lucide-react';
import { apiRequest } from '../../../lib/api';

export default function StudentResultsPage() {
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
        <h1 className="text-xl font-bold text-[#2E3192]">My Test Results</h1>
        <p className="text-xs text-slate-500">Detailed scorecards for your completed online assessments.</p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          {error}
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center text-xs text-slate-500">Loading your results...</div>
      ) : results.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-2">
          <BarChart3 className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-sm font-semibold text-slate-700">No completed assessments yet</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {results.map((r) => (
            <div key={r._id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[11px] font-mono font-bold text-[#0071BC] bg-sky-50 px-2 py-0.5 rounded">
                    {r.assessment?.code}
                  </span>
                  <h3 className="font-bold text-sm text-slate-900 mt-1">{r.assessment?.title}</h3>
                  <p className="text-xs text-slate-500">{r.assessment?.course?.title}</p>
                </div>
                {r.isPassed ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> PASSED
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
                    <AlertTriangle className="w-3.5 h-3.5" /> NOT PASSED
                  </span>
                )}
              </div>

              <div className="grid grid-cols-4 gap-2 text-center text-xs pt-2 border-t border-slate-100">
                <div className="bg-slate-50 rounded-lg p-2">
                  <span className="block text-[10px] text-slate-400">Score</span>
                  <span className="font-bold text-slate-900">{r.scoreObtained}</span>
                </div>
                <div className="bg-slate-50 rounded-lg p-2">
                  <span className="block text-[10px] text-slate-400">Percent</span>
                  <span className="font-bold text-[#0071BC]">{r.percentage}%</span>
                </div>
                <div className="bg-slate-50 rounded-lg p-2">
                  <span className="block text-[10px] text-slate-400">Correct</span>
                  <span className="font-bold text-emerald-700">{r.correctCount}</span>
                </div>
                <div className="bg-slate-50 rounded-lg p-2">
                  <span className="block text-[10px] text-slate-400">Wrong</span>
                  <span className="font-bold text-rose-600">{r.wrongCount}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
