import Link from 'next/link';

export default function PanelsHubPage() {
  const panels = [
    {
      title: 'Admin Control Hub',
      desc: 'Manage courses, batches, OTR profiles, question banks, certificates & system audits.',
      href: '/admin',
      role: 'SUPER_ADMIN & ADMIN',
      color: 'border-blue-600 bg-blue-50 text-blue-700',
    },
    {
      title: 'Student Portal',
      desc: 'Access OTR registration, enrolled courses, batch timetable, online assessments & certificates.',
      href: '/student',
      role: 'STUDENTS',
      color: 'border-emerald-600 bg-emerald-50 text-emerald-700',
    },
    {
      title: 'Trainer Dashboard',
      desc: 'Manage assigned batches, mark student attendance, review assignments & evaluate test records.',
      href: '/trainer',
      role: 'TRAINERS & FACULTY',
      color: 'border-purple-600 bg-purple-50 text-purple-700',
    },
    {
      title: 'Online Assessment Engine',
      desc: 'Fullscreen proctored online examinations with timer, auto-save & instant evaluation.',
      href: '/assessment',
      role: 'EXAMINATION CANDIDATES',
      color: 'border-amber-600 bg-amber-50 text-amber-700',
    },
  ];

  return (
    <main className="min-h-screen flex flex-col justify-center items-center p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white">
      <div className="max-w-4xl w-full text-center mb-10">
        <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
          Barrownz Learning Academy
        </span>
        <h1 className="text-3xl md:text-5xl font-bold mt-4 mb-2 tracking-tight">
          Unified Panels & Portals
        </h1>
        <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto">
          Role-isolated dashboard environment for Barrownz Learning Academy administration, faculty, and enrolled learners.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
        {panels.map((p) => (
          <Link
            key={p.href}
            href={p.href}
            className="group block p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-400 hover:bg-white/10 transition duration-200 shadow-xl"
          >
            <div className="flex items-center justify-between mb-3">
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${p.color}`}>
                {p.role}
              </span>
              <span className="text-slate-400 group-hover:translate-x-1 transition text-sm">→</span>
            </div>
            <h2 className="text-xl font-bold text-white group-hover:text-blue-300 transition">
              {p.title}
            </h2>
            <p className="text-slate-400 text-sm mt-2 leading-relaxed">
              {p.desc}
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}
