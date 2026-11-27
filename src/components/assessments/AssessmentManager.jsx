'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Eye, HelpCircle, CheckCircle2, Clock, AlertTriangle, X } from 'lucide-react';
import { apiRequest } from '../../lib/api';

const STATUS_BADGE = {
  DRAFT: 'bg-slate-100 text-slate-700',
  SCHEDULED: 'bg-amber-100 text-amber-800',
  LIVE: 'bg-emerald-100 text-emerald-800',
  COMPLETED: 'bg-blue-100 text-blue-800',
  ARCHIVED: 'bg-rose-100 text-rose-800',
};

export default function AssessmentManager({ role = 'ADMIN' }) {
  const [assessments, setAssessments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Create modal
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    title: '',
    code: '',
    courseId: '',
    batchId: '',
    durationMinutes: 30,
    totalMarks: 20,
    passingPercentage: 60,
    status: 'DRAFT',
    description: '',
    negativeAllowed: false,
    negativePenalty: 0.25,
  });

  // Question modal
  const [activeAssessment, setActiveAssessment] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [qForm, setQForm] = useState({
    questionText: '',
    codeSnippet: '',
    optA: '',
    optB: '',
    optC: '',
    optD: '',
    correctOption: 'A',
    marks: 2,
    difficulty: 'MEDIUM',
    explanation: '',
  });

  // Submissions modal
  const [submissionsModal, setSubmissionsModal] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [assRes, courseRes, batchRes] = await Promise.all([
        apiRequest('/assessments'),
        apiRequest('/courses'),
        role === 'TRAINER' ? apiRequest('/trainer/batches') : apiRequest('/batches'),
      ]);
      setAssessments(assRes.assessments || []);
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

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await apiRequest('/assessments', {
        method: 'POST',
        body: JSON.stringify({
          title: form.title,
          code: form.code,
          courseId: form.courseId,
          batchId: form.batchId || null,
          durationMinutes: Number(form.durationMinutes),
          totalMarks: Number(form.totalMarks),
          passingPercentage: Number(form.passingPercentage),
          status: form.status,
          description: form.description,
          negativeMarking: {
            isAllowed: form.negativeAllowed,
            penalty: form.negativeAllowed ? Number(form.negativePenalty) : 0,
          },
        }),
      });
      setShowCreate(false);
      setForm({
        title: '',
        code: '',
        courseId: '',
        batchId: '',
        durationMinutes: 30,
        totalMarks: 20,
        passingPercentage: 60,
        status: 'DRAFT',
        description: '',
        negativeAllowed: false,
        negativePenalty: 0.25,
      });
      setMessage('Assessment created successfully');
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleStatusChange = async (id, status) => {
    setError('');
    try {
      await apiRequest(`/assessments/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      setMessage(`Assessment status updated to ${status}`);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const openQuestions = async (assessment) => {
    setError('');
    try {
      const res = await apiRequest(`/assessments/${assessment._id}`);
      setActiveAssessment(res.assessment);
      setQuestions(res.questions || []);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    if (!activeAssessment) return;
    setError('');
    try {
      await apiRequest(`/assessments/${activeAssessment._id}/questions`, {
        method: 'POST',
        body: JSON.stringify({
          questions: [
            {
              questionText: qForm.questionText,
              codeSnippet: qForm.codeSnippet,
              options: [
                { optionKey: 'A', optionText: qForm.optA },
                { optionKey: 'B', optionText: qForm.optB },
                { optionKey: 'C', optionText: qForm.optC },
                { optionKey: 'D', optionText: qForm.optD },
              ],
              correctOption: qForm.correctOption,
              marks: Number(qForm.marks),
              difficulty: qForm.difficulty,
              explanation: qForm.explanation,
            },
          ],
        }),
      });
      setQForm({
        questionText: '',
        codeSnippet: '',
        optA: '',
        optB: '',
        optC: '',
        optD: '',
        correctOption: 'A',
        marks: 2,
        difficulty: 'MEDIUM',
        explanation: '',
      });
      await openQuestions(activeAssessment);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!activeAssessment) return;
    try {
      await apiRequest(`/assessments/${activeAssessment._id}/questions/${questionId}`, {
        method: 'DELETE',
      });
      await openQuestions(activeAssessment);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const openSubmissions = async (assessment) => {
    setError('');
    try {
      const res = await apiRequest(`/assessments/${assessment._id}/submissions`);
      setSubmissionsModal(res);
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredBatches = form.courseId
    ? batches.filter((b) => String(b.course?._id || b.course) === String(form.courseId))
    : batches;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#2E3192]">Assessment & Examination Engine</h1>
          <p className="text-xs text-slate-500">
            Create online tests, manage question banks, publish live exams, and review proctored submissions.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2E3192] hover:bg-[#0071BC] text-white text-xs font-semibold transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Assessment</span>
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
        <div className="p-8 text-center text-xs text-slate-500">Loading assessments...</div>
      ) : assessments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-2">
          <HelpCircle className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-sm font-semibold text-slate-700">No assessments created yet</p>
          <p className="text-xs text-slate-500">Click "New Assessment" to configure your first online test.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {assessments.map((a) => (
            <div key={a._id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[11px] font-mono font-bold text-[#0071BC] bg-sky-50 px-2 py-0.5 rounded">
                    {a.code}
                  </span>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${STATUS_BADGE[a.status] || 'bg-slate-100'}`}>
                    {a.status}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-slate-900">{a.title}</h3>
                <p className="text-xs text-slate-500">
                  {a.course?.title} {a.batch ? `• ${a.batch.code}` : '• All Course Batches'}
                </p>
                <div className="grid grid-cols-3 gap-2 pt-2 text-[11px] text-slate-600">
                  <div className="bg-slate-50 rounded-lg p-2">
                    <span className="block text-[10px] text-slate-400">Duration</span>
                    <span className="font-bold">{a.durationMinutes} min</span>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2">
                    <span className="block text-[10px] text-slate-400">Questions</span>
                    <span className="font-bold">{a.questionCount || 0}</span>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2">
                    <span className="block text-[10px] text-slate-400">Pass / Total</span>
                    <span className="font-bold">{a.passingPercentage}% / {a.totalMarks}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="flex items-center gap-2">
                  <select
                    value={a.status}
                    onChange={(e) => handleStatusChange(a._id, e.target.value)}
                    className="flex-1 text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-slate-50 font-semibold"
                  >
                    <option value="DRAFT">DRAFT</option>
                    <option value="SCHEDULED">SCHEDULED</option>
                    <option value="LIVE">LIVE</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </select>
                  <button
                    onClick={() => openQuestions(a)}
                    className="px-3 py-1.5 rounded-lg bg-[#2E3192] text-white text-xs font-semibold hover:bg-[#0071BC]"
                  >
                    Questions
                  </button>
                  <button
                    onClick={() => openSubmissions(a)}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 inline-flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Results</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Assessment Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#2E3192]">Create New Assessment</h2>
              <button onClick={() => setShowCreate(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Title *</label>
                  <input
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="MERN Stack Mid-Term"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Code *</label>
                  <input
                    required
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    placeholder="TEST-MERN-01"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Course *</label>
                  <select
                    required
                    value={form.courseId}
                    onChange={(e) => setForm({ ...form, courseId: e.target.value, batchId: '' })}
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
                    <option value="">All batches in course</option>
                    {filteredBatches.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.name} ({b.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Duration (min)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={form.durationMinutes}
                    onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Total Marks</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={form.totalMarks}
                    onChange={(e) => setForm({ ...form, totalMarks: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Pass %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={form.passingPercentage}
                    onChange={(e) => setForm({ ...form, passingPercentage: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="inline-flex items-center gap-2 font-semibold">
                  <input
                    type="checkbox"
                    checked={form.negativeAllowed}
                    onChange={(e) => setForm({ ...form, negativeAllowed: e.target.checked })}
                  />
                  <span>Enable Negative Marking</span>
                </label>
                {form.negativeAllowed && (
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    value={form.negativePenalty}
                    onChange={(e) => setForm({ ...form, negativePenalty: e.target.value })}
                    className="w-24 border border-slate-200 rounded-lg px-2 py-1"
                    placeholder="Penalty"
                  />
                )}
              </div>

              <div>
                <label className="block font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#2E3192] text-white font-semibold hover:bg-[#0071BC]"
                >
                  Create Assessment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Question Bank Modal */}
      {activeAssessment && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h2 className="text-base font-bold text-[#2E3192]">
                  Question Bank — {activeAssessment.title}
                </h2>
                <p className="text-xs text-slate-500">
                  {questions.length} question(s) configured • Total Marks: {activeAssessment.totalMarks}
                </p>
              </div>
              <button onClick={() => setActiveAssessment(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddQuestion} className="bg-slate-50 rounded-xl p-4 space-y-3 text-xs border border-slate-200">
              <p className="font-bold text-slate-800">Add New MCQ Question</p>
              <textarea
                required
                rows={2}
                placeholder="Question text *"
                value={qForm.questionText}
                onChange={(e) => setQForm({ ...qForm, questionText: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-white"
              />
              <textarea
                rows={2}
                placeholder="Optional code snippet"
                value={qForm.codeSnippet}
                onChange={(e) => setQForm({ ...qForm, codeSnippet: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 font-mono bg-white"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  required
                  placeholder="Option A *"
                  value={qForm.optA}
                  onChange={(e) => setQForm({ ...qForm, optA: e.target.value })}
                  className="border border-slate-200 rounded-lg px-3 py-2 bg-white"
                />
                <input
                  required
                  placeholder="Option B *"
                  value={qForm.optB}
                  onChange={(e) => setQForm({ ...qForm, optB: e.target.value })}
                  className="border border-slate-200 rounded-lg px-3 py-2 bg-white"
                />
                <input
                  required
                  placeholder="Option C *"
                  value={qForm.optC}
                  onChange={(e) => setQForm({ ...qForm, optC: e.target.value })}
                  className="border border-slate-200 rounded-lg px-3 py-2 bg-white"
                />
                <input
                  required
                  placeholder="Option D *"
                  value={qForm.optD}
                  onChange={(e) => setQForm({ ...qForm, optD: e.target.value })}
                  className="border border-slate-200 rounded-lg px-3 py-2 bg-white"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Correct Option</label>
                  <select
                    value={qForm.correctOption}
                    onChange={(e) => setQForm({ ...qForm, correctOption: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-2 py-2 bg-white"
                  >
                    <option value="A">Option A</option>
                    <option value="B">Option B</option>
                    <option value="C">Option C</option>
                    <option value="D">Option D</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Marks</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={qForm.marks}
                    onChange={(e) => setQForm({ ...qForm, marks: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-2 py-2 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Difficulty</label>
                  <select
                    value={qForm.difficulty}
                    onChange={(e) => setQForm({ ...qForm, difficulty: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-2 py-2 bg-white"
                  >
                    <option value="EASY">EASY</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HARD">HARD</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-[#2E3192] text-white font-semibold hover:bg-[#0071BC]"
              >
                + Add Question
              </button>
            </form>

            <div className="space-y-3">
              {questions.map((q, idx) => (
                <div key={q._id} className="border border-slate-200 rounded-xl p-4 text-xs space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-bold text-slate-900">
                      Q{idx + 1}. {q.questionText}
                    </p>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-2 py-0.5 rounded bg-sky-50 text-[#0071BC] font-bold">
                        {q.marks}m
                      </span>
                      <button
                        onClick={() => handleDeleteQuestion(q._id)}
                        className="text-rose-500 hover:text-rose-700"
                        title="Delete question"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {q.codeSnippet && (
                    <pre className="bg-slate-900 text-slate-100 p-2.5 rounded-lg overflow-x-auto text-[11px]">
                      {q.codeSnippet}
                    </pre>
                  )}
                  <div className="grid grid-cols-2 gap-1.5">
                    {q.options.map((opt) => (
                      <div
                        key={opt.optionKey}
                        className={`px-2.5 py-1.5 rounded border ${
                          opt.optionKey === q.correctOption
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold'
                            : 'bg-white border-slate-200 text-slate-600'
                        }`}
                      >
                        <span className="font-bold mr-1.5">{opt.optionKey}.</span>
                        {opt.optionText}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Submissions Modal */}
      {submissionsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h2 className="text-base font-bold text-[#2E3192]">
                  Submissions — {submissionsModal.assessment?.title}
                </h2>
                <p className="text-xs text-slate-500">
                  Total Submissions: {submissionsModal.submissions?.length || 0}
                </p>
              </div>
              <button onClick={() => setSubmissionsModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {submissionsModal.submissions?.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No student attempts recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 border-b">
                    <tr>
                      <th className="py-2.5 px-3">Student</th>
                      <th className="py-2.5 px-3">OTR No</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Score</th>
                      <th className="py-2.5 px-3">Result</th>
                      <th className="py-2.5 px-3">Proctor Flags</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {submissionsModal.submissions.map((s) => (
                      <tr key={s._id}>
                        <td className="py-2.5 px-3 font-semibold">{s.student?.name}</td>
                        <td className="py-2.5 px-3 font-mono text-[#0071BC]">{s.otrProfile?.otrNumber}</td>
                        <td className="py-2.5 px-3">{s.status}</td>
                        <td className="py-2.5 px-3 font-bold">
                          {s.scoreObtained} ({s.percentage}%)
                        </td>
                        <td className="py-2.5 px-3">
                          {s.status === 'IN_PROGRESS' ? (
                            <span className="text-amber-600 inline-flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" /> In Progress
                            </span>
                          ) : s.isPassed ? (
                            <span className="text-emerald-700 font-bold inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> PASS
                            </span>
                          ) : (
                            <span className="text-rose-600 font-bold inline-flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5" /> FAIL
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">
                          Tabs: {s.proctoringFlags?.tabSwitchCount || 0} | FS Exit: {s.proctoringFlags?.fullScreenExits || 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
