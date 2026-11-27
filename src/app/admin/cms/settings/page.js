'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Image as ImageIcon } from 'lucide-react';
import { apiRequest } from '../../../../lib/api';
import MediaPickerModal from '../../../../components/cms/MediaPickerModal';

export default function CmsSiteSettingsPage() {
  const [form, setForm] = useState({
    siteLogo: null,
    siteLogoUrl: '/images/newlogo.png',
    faviconUrl: '/favicon.ico',
    phone: '',
    whatsapp: '',
    supportEmail: '',
    address: '',
    openingHours: '',
    marqueeNotice: '',
    socials: { facebook: '', youtube: '', instagram: '', linkedin: '' },
    footerAbout: '',
    copyrightText: '',
  });
  const [pickerOpen, setPickerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest('/cms/settings')
      .then((res) => {
        if (res.settings) {
          setForm({
            siteLogo: res.settings.siteLogo || null,
            siteLogoUrl: res.settings.siteLogoUrl || '/images/newlogo.png',
            faviconUrl: res.settings.faviconUrl || '/favicon.ico',
            phone: res.settings.phone || '',
            whatsapp: res.settings.whatsapp || '',
            supportEmail: res.settings.supportEmail || '',
            address: res.settings.address || '',
            openingHours: res.settings.openingHours || '',
            marqueeNotice: res.settings.marqueeNotice || '',
            socials: {
              facebook: res.settings.socials?.facebook || '',
              youtube: res.settings.socials?.youtube || '',
              instagram: res.settings.socials?.instagram || '',
              linkedin: res.settings.socials?.linkedin || '',
            },
            footerAbout: res.settings.footerAbout || '',
            copyrightText: res.settings.copyrightText || '',
          });
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    setError('');
    try {
      const res = await apiRequest('/cms/settings', {
        method: 'PATCH',
        body: JSON.stringify(form),
      });
      setMsg(res.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link href="/admin/cms" className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50">
          <ArrowLeft className="w-4 h-4 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-[#2E3192]">Common Website Settings</h1>
          <p className="text-xs text-slate-500">Update global logo, contact details, marquee notice, social links & footer text.</p>
        </div>
      </div>

      {error && <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">{error}</div>}
      {msg && <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs">{msg}</div>}

      {loading ? (
        <div className="p-8 text-center text-xs text-slate-500">Loading settings...</div>
      ) : (
        <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5 text-xs">
          <div className="flex flex-wrap items-center gap-4 pb-4 border-b border-slate-100">
            <img src={form.siteLogoUrl} alt="Site Logo" className="h-12 object-contain bg-slate-50 p-1.5 rounded border" />
            <div className="space-y-1">
              <p className="font-bold text-slate-800">Website Logo</p>
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 text-[#0071BC] font-semibold hover:bg-sky-100"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Choose / Upload Logo</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1">Top Marquee Notice</label>
            <input
              value={form.marqueeNotice}
              onChange={(e) => setForm({ ...form, marqueeNotice: e.target.value })}
              className="w-full border border-slate-200 rounded-lg px-3 py-2"
            />
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold mb-1">Phone Number</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block font-semibold mb-1">WhatsApp Number</label>
              <input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block font-semibold mb-1">Support Email</label>
              <input value={form.supportEmail} onChange={(e) => setForm({ ...form, supportEmail: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2" />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1">Campus Address</label>
              <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block font-semibold mb-1">Opening Hours</label>
              <input value={form.openingHours} onChange={(e) => setForm({ ...form, openingHours: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2" />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1">Facebook URL</label>
              <input value={form.socials.facebook} onChange={(e) => setForm({ ...form, socials: { ...form.socials, facebook: e.target.value } })} className="w-full border border-slate-200 rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block font-semibold mb-1">YouTube URL</label>
              <input value={form.socials.youtube} onChange={(e) => setForm({ ...form, socials: { ...form.socials, youtube: e.target.value } })} className="w-full border border-slate-200 rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block font-semibold mb-1">Instagram URL</label>
              <input value={form.socials.instagram} onChange={(e) => setForm({ ...form, socials: { ...form.socials, instagram: e.target.value } })} className="w-full border border-slate-200 rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block font-semibold mb-1">LinkedIn URL</label>
              <input value={form.socials.linkedin} onChange={(e) => setForm({ ...form, socials: { ...form.socials, linkedin: e.target.value } })} className="w-full border border-slate-200 rounded-lg px-3 py-2" />
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1">Footer About Text</label>
            <textarea rows={2} value={form.footerAbout} onChange={(e) => setForm({ ...form, footerAbout: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2" />
          </div>

          <div>
            <label className="block font-semibold mb-1">Copyright Text</label>
            <input value={form.copyrightText} onChange={(e) => setForm({ ...form, copyrightText: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2" />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2E3192] hover:bg-[#0071BC] text-white font-semibold disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Website Settings'}</span>
          </button>
        </form>
      )}

      <MediaPickerModal
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(asset) => setForm((prev) => ({ ...prev, siteLogo: asset._id, siteLogoUrl: asset.url }))}
      />
    </div>
  );
}
