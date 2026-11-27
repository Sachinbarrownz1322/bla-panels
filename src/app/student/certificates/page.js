'use client';

import React, { useEffect, useState } from 'react';
import { BadgeCheck, ExternalLink, ShieldCheck } from 'lucide-react';
import { apiRequest, WEBSITE_BASE_URL } from '../../../lib/api';

export default function StudentCertificatesPage() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest('/certificates')
      .then((res) => setCertificates(res.certificates || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#2E3192]">My Official Certificates</h1>
        <p className="text-xs text-slate-500">
          Verified credentials issued by Barrownz Learning Academy. Share the verification link with employers.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          {error}
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center text-xs text-slate-500">Loading your certificates...</div>
      ) : certificates.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-2">
          <BadgeCheck className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-sm font-semibold text-slate-700">No certificates issued yet</p>
          <p className="text-xs text-slate-500">Completed courses and passed assessments will unlock certificates here.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {certificates.map((c) => (
            <div
              key={c._id}
              className="bg-white rounded-2xl border-2 border-[#2E3192]/20 p-6 shadow-sm space-y-4 relative overflow-hidden"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#0071BC] flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-mono text-xs font-bold text-[#0071BC]">{c.certificateId}</p>
                    <p className="text-[11px] text-slate-500">{c.certificateType}</p>
                  </div>
                </div>
                {c.isRevoked ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold">
                    REVOKED
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                    VERIFIED
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-base font-bold text-[#2E3192]">{c.course?.title}</h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Awarded to <strong>{c.studentName}</strong> • Grade: <strong>{c.gradeOrScore}</strong>
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Issued on {new Date(c.issueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <a
                  href={`${WEBSITE_BASE_URL}/Home/VerifyCertificate?id=${encodeURIComponent(c.certificateId)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#2E3192] hover:bg-[#0071BC] text-white text-xs font-semibold transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Public Verification</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
