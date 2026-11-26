export default function TrainerDashboardPage() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Trainer Academic Console</h1>
          <p className="text-slate-500 text-sm">Track assigned batches, syllabus progress, and test submissions.</p>
        </div>
        <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
          Faculty Active
        </span>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800 mb-1">Assigned Batches</h2>
        <p className="text-sm text-slate-500">View and update daily attendance and session logs.</p>
      </div>
    </div>
  );
}
