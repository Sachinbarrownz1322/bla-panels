export default function StudentDashboardPage() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Student Learning Portal</h1>
          <p className="text-slate-500 text-sm">Welcome to your Barrownz Learning Academy student terminal.</p>
        </div>
        <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-semibold">
          OTR Verified
        </span>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-2">My OTR Profile</h2>
        <p className="text-sm text-slate-500 mb-4">Permanent Student OTR Identifier:</p>
        <div className="inline-block px-4 py-2 bg-slate-100 border border-slate-300 rounded-lg font-mono font-bold text-blue-700">
          BLA-2026-00001
        </div>
      </div>
    </div>
  );
}
