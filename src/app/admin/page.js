export default function AdminDashboardPage() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Control Center</h1>
          <p className="text-slate-500 text-sm">Master oversight of BLA courses, batches, OTR registrations, and assessments.</p>
        </div>
        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
          Admin Role Active
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total OTR Students', value: '1,248', change: '+12% this month' },
          { label: 'Active Batches', value: '18', change: '4 running today' },
          { label: 'Courses Offered', value: '26', change: 'Standardized syllabus' },
          { label: 'Assessments Conducted', value: '94', change: '87% passing rate' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-medium text-slate-500">{stat.label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-2">{stat.value}</p>
            <p className="text-xs text-emerald-600 font-medium mt-1">{stat.change}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
