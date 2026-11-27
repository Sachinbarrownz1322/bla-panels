'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Award, Clock, PlayCircle, CheckCircle2, AlertTriangle } from 'lucide-react';
import { apiRequest } from '../../../lib/api';

export default function StudentAssessmentsPage() {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest('/assessments')
      .then((res) => setAssessments(res.assessments || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#2E3192]">Online Assessments & Exams</h1>
        <p className="text-xs text-slate-500">
          View scheduled tests, launch live proctored exams, and check your instant graded scores.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          {error}
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center text-xs text-slate-500">Loading your assessments...</div>
      ) : assessments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-2">
          <Award className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-sm font-semibold text-slate-700">No assessments assigned yet</p>
          <p className="text-xs text-slate-500">Tests published for your enrolled batches will appear here.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {assessments.map((a) => {
            const sub = a.mySubmission;
            const isCompleted = sub && sub.status !== 'IN_PROGRESS';
            const isInProgress = sub && sub.status === 'IN_PROGRESS';

            return (
              <div
                key={a._id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold text-[#0071BC] bg-sky-50 px-2 py-0.5 rounded">
                      {a.code}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        a.status === 'LIVE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : a.status === 'SCHEDULED'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {a.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-900">{a.title}</h3>
                  <p className="text-xs text-slate-500">
                    {a.course?.title} {a.batch ? `• ${a.batch.name}` : ''}
                  </p>
                  <div className="flex flex-wrap gap-3 pt-1 text-[11px] text-slate-600">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#0071BC]" /> {a.durationMinutes} mins
                    </span>
                    <span>Questions: {a.questionCount || 0}</span>
                    <span>Total Marks: {a.totalMarks}</span>
                    <span>Pass: {a.passingPercentage}%</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  {isCompleted ? (
                    <div className="flex items-center justify-between w-full">
                      <div className="text-xs">
                        <span className="font-bold text-slate-900">
                          Score: {sub.scoreObtained} / {a.totalMarks} ({sub.percentage}%)
                        </span>
                      </div>
                      {sub.isPassed ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> PASSED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 text-xs font-bold">
                          <AlertTriangle className="w-3.5 h-3.5" /> NOT PASSED
                        </span>
                      )}
                    </div>
                  ) : a.status === 'LIVE' ? (
                    <Link
                      href={`/assessment/${a._id}`}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#2E3192] hover:bg-[#0071BC] text-white text-xs font-semibold transition"
                    >
                      <PlayCircle className="w-4 h-4" />
                      <span>{isInProgress ? 'Resume Assessment' : 'Start Proctored Assessment'}</span>
                    </Link>
                  ) : (
                    <span className="text-xs text-slate-400 font-medium">
                      {a.status === 'SCHEDULED' ? 'Scheduled — Not yet live' : 'Assessment closed'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
