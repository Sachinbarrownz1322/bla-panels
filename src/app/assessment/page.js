export default function AssessmentHubPage() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Online Examination & Assessment Engine</h1>
          <p className="text-slate-500 text-sm">Fullscreen proctored examinations with instant automated grading.</p>
        </div>
        <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-semibold">
          Engine Standby
        </span>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800 mb-1">Active Test Series</h2>
        <p className="text-sm text-slate-500">Upcoming assessment schedules will appear here.</p>
      </div>
    </div>
  );
}
