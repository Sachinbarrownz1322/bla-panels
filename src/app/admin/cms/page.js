'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Image as ImageIcon,
  Layers,
  Images,
  Handshake,
  Award,
  Users,
  MessageSquareQuote,
  Megaphone,
  Search,
  Settings,
  FolderOpen,
  History,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { apiRequest, WEBSITE_BASE_URL } from '../../../lib/api';

const MODULE_META = {
  hero: { icon: <ImageIcon className="w-5 h-5" />, desc: 'Manage Home Hero banner slides, titles, subtitles & CTAs', tint: 'bg-sky-100/80' },
  cards: { icon: <Layers className="w-5 h-5" />, desc: 'Manage Home batch & course promotion cards', tint: 'bg-indigo-100/80' },
  'gallery-categories': { icon: <FolderOpen className="w-5 h-5" />, desc: 'Manage gallery categories across sections', tint: 'bg-amber-100/80' },
  gallery: { icon: <Images className="w-5 h-5" />, desc: 'Upload & organize Campus, Seminar & Project photos', tint: 'bg-emerald-100/80' },
  mous: { icon: <Handshake className="w-5 h-5" />, desc: 'Manage college MOUs, logos & signing details', tint: 'bg-cyan-100/80' },
  placements: { icon: <Award className="w-5 h-5" />, desc: 'Manage student placement stories & company logos', tint: 'bg-violet-100/80' },
  team: { icon: <Users className="w-5 h-5" />, desc: 'Manage Leadership, Mentors & Faculty profiles', tint: 'bg-teal-100/80' },
  testimonials: { icon: <MessageSquareQuote className="w-5 h-5" />, desc: 'Manage student reviews, ratings & video testimonials', tint: 'bg-rose-100/75' },
  announcements: { icon: <Megaphone className="w-5 h-5" />, desc: 'Manage Marquee notices & scheduled promo banners', tint: 'bg-orange-100/75' },
  seo: { icon: <Search className="w-5 h-5" />, desc: 'Manage route-level page headings, meta tags & OG images', tint: 'bg-blue-100/80' },
};

export default function WebsiteCmsHubPage() {
  const [me, setMe] = useState(null);
  const [modules, setModules] = useState([]);
  const [mediaCount, setMediaCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([apiRequest('/auth/me'), apiRequest('/cms/overview')])
      .then(([meRes, cmsRes]) => {
        setMe(meRes.user);
        setModules(cmsRes.modules || []);
        setMediaCount(cmsRes.mediaCount || 0);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const isSuperAdmin = me?.roleName === 'SUPER_ADMIN';

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#2E3192]">Website CMS Control Hub</h1>
          <p className="text-xs text-slate-500">
            Update Home Hero, Cards, Gallery, MOUs, Placements, Team, Announcements, Settings & SEO without editing code.
          </p>
        </div>
        <a
          href={WEBSITE_BASE_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0071BC] hover:bg-[#005a96] text-white text-xs font-semibold transition"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Preview Live Website</span>
        </a>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">{error}</div>
      )}

      {/* Quick Global Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/admin/cms/media"
          className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-[#0071BC] transition flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#0071BC] flex items-center justify-center">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#2E3192]">Media Library</h2>
              <p className="text-xs text-slate-500">{mediaCount} uploaded asset(s)</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400" />
        </Link>

        <Link
          href="/admin/cms/settings"
          className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-[#0071BC] transition flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-[#2E3192] flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#2E3192]">Common Website Settings</h2>
              <p className="text-xs text-slate-500">Logo, Phone, Marquee, Socials & Footer</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400" />
        </Link>

        {isSuperAdmin && (
          <Link
            href="/admin/cms/audit-logs"
            className="bg-white rounded-2xl border border-[#2E3192]/25 p-5 shadow-sm hover:border-[#2E3192] transition flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#2E3192] text-white flex items-center justify-center">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#2E3192]">CMS Audit History</h2>
                <p className="text-xs text-slate-500">Super Admin change & restore log</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#2E3192]" />
          </Link>
        )}
      </div>

      {/* CMS Modules Grid */}
      {loading ? (
        <div className="p-8 text-center text-xs text-slate-500">Loading CMS modules...</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((m) => {
            const meta = MODULE_META[m.key] || { icon: <Layers className="w-5 h-5" />, desc: '' };
            return (
              <Link
                key={m.key}
                href={`/admin/cms/${m.key}`}
                className={`${meta.tint || 'bg-white/90'} backdrop-blur-sm rounded-2xl p-5 shadow-[0_4px_18px_rgba(46,49,146,0.08)] hover:shadow-[0_8px_24px_rgba(0,113,188,0.14)] transition flex flex-col justify-between space-y-4`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#0071BC] flex items-center justify-center shrink-0">
                    {meta.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#2E3192]">{m.label}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{meta.desc}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold">
                      {m.published} Published
                    </span>
                    <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-bold">
                      {m.draft} Draft
                    </span>
                  </div>
                  <span className="text-[#0071BC] font-bold inline-flex items-center gap-1">
                    Manage <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
