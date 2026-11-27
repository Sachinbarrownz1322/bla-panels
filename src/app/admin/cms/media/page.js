'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Upload, RefreshCw, Trash2, Search } from 'lucide-react';
import { apiRequest } from '../../../../lib/api';

export default function CmsMediaLibraryPage() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const load = async (q = search) => {
    setLoading(true);
    try {
      const res = await apiRequest(`/cms/media?search=${encodeURIComponent(q)}`);
      setItems(res.items || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load('');
  }, []);

  const readFileAndSend = (file, endpoint, method = 'POST') => {
    setError('');
    setMsg('');
    setBusy(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const res = await apiRequest(endpoint, {
          method,
          body: JSON.stringify({
            originalName: file.name,
            mimeType: file.type,
            base64Data: reader.result,
            altText: file.name.replace(/\.[^.]+$/, ''),
          }),
        });
        setMsg(res.message);
        await load(search);
      } catch (err) {
        setError(err.message);
      } finally {
        setBusy(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = async (id) => {
    setError('');
    setMsg('');
    try {
      const res = await apiRequest(`/cms/media/${id}`, { method: 'DELETE' });
      setMsg(res.message);
      load(search);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/cms" className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50">
            <ArrowLeft className="w-4 h-4 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-[#2E3192]">Centralized Media Library</h1>
            <p className="text-xs text-slate-500">Upload, replace in-place without breaking links, and track asset usage.</p>
          </div>
        </div>

        <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2E3192] hover:bg-[#0071BC] text-white text-xs font-semibold">
          <Upload className="w-4 h-4" />
          <span>{busy ? 'Uploading...' : 'Upload Media'}</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
            className="hidden"
            disabled={busy}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) readFileAndSend(f, '/cms/media/upload', 'POST');
            }}
          />
        </label>
      </div>

      {error && <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">{error}</div>}
      {msg && <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs">{msg}</div>}

      <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs max-w-md">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && load(search)}
          placeholder="Search uploaded files..."
          className="flex-1 outline-none"
        />
        <button onClick={() => load(search)} className="text-[#0071BC] font-bold">
          Filter
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-slate-500">Loading media library...</div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-xs text-slate-500">
          No media assets uploaded yet.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <div key={item._id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
              <div className="aspect-video bg-slate-100 relative">
                {item.mimeType.startsWith('image/') ? (
                  <img src={item.url} alt={item.altText || item.originalName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-600">PDF Document</div>
                )}
              </div>
              <div className="p-4 space-y-2 text-xs flex-1 flex flex-col justify-between">
                <div>
                  <p className="font-bold text-slate-900 truncate">{item.originalName}</p>
                  <p className="text-[11px] text-slate-500">
                    {(item.sizeBytes / 1024).toFixed(1)} KB • Used in {item.usedIn?.length || 0} item(s)
                  </p>
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <label className="flex-1 cursor-pointer inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-sky-50 text-[#0071BC] font-semibold hover:bg-sky-100">
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Replace</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) readFileAndSend(f, `/cms/media/${item._id}/replace`, 'PUT');
                      }}
                    />
                  </label>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-700 font-semibold hover:bg-rose-100 inline-flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
