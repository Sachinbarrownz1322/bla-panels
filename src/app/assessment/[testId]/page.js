'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Clock,
  ShieldAlert,
  Maximize,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Send,
} from 'lucide-react';
import { apiRequest, WEBSITE_BASE_URL } from '../../../lib/api';

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export default function ExamRunnerPage() {
  const { testId } = useParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [assessment, setAssessment] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [proctorFlags, setProctorFlags] = useState({ tabSwitchCount: 0, fullScreenExits: 0 });
  const [warningMsg, setWarningMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const submittedRef = useRef(false);

  const submitExam = useCallback(
    async (auto = false) => {
      if (submittedRef.current) return;
      submittedRef.current = true;
      setSubmitting(true);
      try {
        const answerPayload = Object.entries(answers).map(([questionId, selectedOption]) => ({
          questionId,
          selectedOption,
        }));
        const res = await apiRequest(`/assessments/${testId}/submit`, {
          method: 'POST',
          body: JSON.stringify({ answers: answerPayload, autoSubmitted: auto }),
        });
        setResult(res.result);
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }
      } catch (err) {
        submittedRef.current = false;
        setError(err.message);
      } finally {
        setSubmitting(false);
      }
    },
    [answers, testId]
  );

  // Initialize / Resume exam session
  useEffect(() => {
    let active = true;
    async function init() {
      try {
        await apiRequest('/auth/me');
      } catch {
        window.location.href = `${WEBSITE_BASE_URL}/login`;
        return;
      }

      try {
        const res = await apiRequest(`/assessments/${testId}/start`, { method: 'POST' });
        if (!active) return;
        setAssessment(res.assessment);
        setQuestions(res.questions || []);
        setRemainingSeconds(res.remainingSeconds || 0);
        setProctorFlags(res.submission?.proctoringFlags || { tabSwitchCount: 0, fullScreenExits: 0 });

        const restored = {};
        for (const a of res.submission?.answers || []) {
          if (a.selectedOption) restored[a.question] = a.selectedOption;
        }
        setAnswers(restored);
      } catch (err) {
        if (!active) return;
        if (err.data?.submission) {
          setResult(err.data.submission);
        } else {
          setError(err.message);
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    init();
    return () => {
      active = false;
    };
  }, [testId]);

  // Countdown Timer
  useEffect(() => {
    if (loading || result || !assessment) return;
    if (remainingSeconds <= 0) {
      submitExam(true);
      return;
    }
    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          submitExam(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [loading, result, assessment, remainingSeconds, submitExam]);

  // Proctoring listeners (Tab switch & Fullscreen exit)
  useEffect(() => {
    if (loading || result || !assessment) return;

    const handleVisibility = () => {
      if (document.hidden && !submittedRef.current) {
        setWarningMsg('Tab switch detected and logged for proctoring review.');
        apiRequest(`/assessments/${testId}/proctor`, {
          method: 'POST',
          body: JSON.stringify({ type: 'TAB_SWITCH' }),
        })
          .then((res) => setProctorFlags(res.proctoringFlags))
          .catch(() => {});
      }
    };

    const handleFullscreen = () => {
      if (!document.fullscreenElement && !submittedRef.current) {
        setWarningMsg('Fullscreen exited. Please remain in fullscreen mode.');
        apiRequest(`/assessments/${testId}/proctor`, {
          method: 'POST',
          body: JSON.stringify({ type: 'FULLSCREEN_EXIT' }),
        })
          .then((res) => setProctorFlags(res.proctoringFlags))
          .catch(() => {});
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    document.addEventListener('fullscreenchange', handleFullscreen);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      document.removeEventListener('fullscreenchange', handleFullscreen);
    };
  }, [loading, result, assessment, testId]);

  const handleSelectOption = async (questionId, optionKey) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionKey }));
    try {
      await apiRequest(`/assessments/${testId}/answer`, {
        method: 'PATCH',
        body: JSON.stringify({ questionId, selectedOption: optionKey }),
      });
    } catch (err) {
      if (err.data?.autoSubmitted) {
        submitExam(true);
      }
    }
  };

  const enterFullscreen = () => {
    document.documentElement.requestFullscreen?.().catch(() => {});
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-4 border-[#2E3192] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-600">Initializing Proctored Exam Session...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="bg-white rounded-2xl border border-rose-200 max-w-md w-full p-6 text-center space-y-4">
          <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
          <h2 className="text-base font-bold text-slate-900">Unable to Start Assessment</h2>
          <p className="text-xs text-slate-600">{error}</p>
          <Link
            href="/student/assessments"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2E3192] text-white text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Assessments</span>
          </Link>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-8 text-center space-y-5 shadow-sm">
          {result.isPassed ? (
            <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto" />
          ) : (
            <AlertTriangle className="w-14 h-14 text-rose-500 mx-auto" />
          )}
          <div>
            <h1 className="text-xl font-bold text-[#2E3192]">
              {result.isPassed ? 'Assessment Passed!' : 'Assessment Completed'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">Status: {result.status}</p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-50 rounded-xl p-3">
              <span className="block text-slate-400 text-[10px]">Score</span>
              <span className="font-bold text-base text-slate-900">{result.scoreObtained}</span>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <span className="block text-slate-400 text-[10px]">Percentage</span>
              <span className="font-bold text-base text-[#0071BC]">{result.percentage}%</span>
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <span className="block text-slate-400 text-[10px]">Correct / Total</span>
              <span className="font-bold text-base text-slate-900">
                {result.correctCount ?? '-'} / {result.totalQuestions ?? '-'}
              </span>
            </div>
          </div>
          <Link
            href="/student/assessments"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#2E3192] hover:bg-[#0071BC] text-white text-xs font-semibold transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Student Portal</span>
          </Link>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Exam Top Bar */}
      <header className="bg-[#2E3192] text-white px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs text-sky-200 font-mono">{assessment?.code}</p>
          <h1 className="text-sm font-bold">{assessment?.title}</h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={enterFullscreen}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold"
          >
            <Maximize className="w-3.5 h-3.5" />
            <span>Fullscreen</span>
          </button>
          <div
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-mono text-sm font-bold ${
              remainingSeconds < 120 ? 'bg-rose-600 text-white animate-pulse' : 'bg-white/15 text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{formatTime(remainingSeconds)}</span>
          </div>
          <button
            disabled={submitting}
            onClick={() => {
              if (window.confirm('Submit your assessment now? You cannot change answers after submission.')) {
                submitExam(false);
              }
            }}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{submitting ? 'Submitting...' : 'Submit Exam'}</span>
          </button>
        </div>
      </header>

      {warningMsg && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-2 flex items-center justify-between text-xs text-amber-800">
          <span className="inline-flex items-center gap-2 font-semibold">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            {warningMsg} (Tab switches: {proctorFlags.tabSwitchCount} | Fullscreen exits: {proctorFlags.fullScreenExits})
          </span>
          <button onClick={() => setWarningMsg('')} className="underline font-semibold">
            Dismiss
          </button>
        </div>
      )}

      {/* Main Exam Layout */}
      <div className="flex-1 max-w-6xl w-full mx-auto p-6 grid gap-6 lg:grid-cols-4">
        {/* Question Card */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-6">
          {currentQuestion && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <span className="text-xs font-bold text-[#0071BC]">
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  {currentQuestion.marks} Mark(s) • {currentQuestion.difficulty}
                </span>
              </div>

              <p className="text-sm font-semibold text-slate-900 leading-relaxed">
                {currentQuestion.questionText}
              </p>

              {currentQuestion.codeSnippet && (
                <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl text-xs overflow-x-auto">
                  {currentQuestion.codeSnippet}
                </pre>
              )}

              <div className="space-y-2.5 pt-2">
                {currentQuestion.options.map((opt) => {
                  const selected = answers[currentQuestion._id] === opt.optionKey;
                  return (
                    <button
                      key={opt.optionKey}
                      type="button"
                      onClick={() => handleSelectOption(currentQuestion._id, opt.optionKey)}
                      className={`w-full text-left px-4 py-3 rounded-xl border text-xs transition flex items-center gap-3 ${
                        selected
                          ? 'bg-sky-50 border-[#0071BC] text-[#2E3192] font-bold shadow-sm'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                          selected ? 'bg-[#0071BC] text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {opt.optionKey}
                      </span>
                      <span>{opt.optionText}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold disabled:opacity-40"
            >
              Previous
            </button>
            <button
              disabled={currentIndex >= questions.length - 1}
              onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
              className="px-4 py-2 rounded-xl bg-[#2E3192] text-white text-xs font-semibold disabled:opacity-40"
            >
              Next Question
            </button>
          </div>
        </div>

        {/* Question Palette */}
        <aside className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 h-fit">
          <div>
            <h2 className="text-xs font-bold text-[#2E3192] uppercase tracking-wider">Question Palette</h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Answered: {answeredCount} / {questions.length}
            </p>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {questions.map((q, idx) => {
              const isAnswered = Boolean(answers[q._id]);
              const isCurrent = idx === currentIndex;
              return (
                <button
                  key={q._id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-9 rounded-lg text-xs font-bold transition ${
                    isCurrent
                      ? 'ring-2 ring-[#2E3192] bg-sky-100 text-[#2E3192]'
                      : isAnswered
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
}
