'use client';

import React, { useEffect, useState } from 'react';
import { Upload, Search, CheckCircle2, X } from 'lucide-react';
import { apiRequest } from '../../lib/api';

export default function MediaPickerModal({ isOpen, onClose, onSelect }) {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const loadMedia = async (q = search) => {
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
    if (isOpen) loadMedia('');
  }, [isOpen]);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setUploading(true);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const res = await apiRequest('/cms/media/upload', {
          method: 'POST',
          body: JSON.stringify({
            originalName: file.name,
            mimeType: file.type,
            base64Data: reader.result,
            altText: file.name.replace(/\.[^.]+$/, ''),
          }),
        });
        await loadMedia(search);
        if (res.asset) {
          onSelect(res.asset);
          onClose();
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full p-6 space-y-4 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b pb-3">
          <div>
            <h2 className="text-base font-bold text-[#2E3192]">Media Library</h2>
            <p className="text-xs text-slate-500">Select an existing image or upload a new asset (JPG, PNG, WEBP, GIF, PDF — max 5MB).</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && <div className="p-2.5 rounded-lg bg-rose-50 text-rose-700 text-xs">{error}</div>}

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2 text-xs">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadMedia(search)}
              placeholder="Search by filename or alt text..."
              className="flex-1 outline-none"
            />
            <button onClick={() => loadMedia(search)} className="text-[#0071BC] font-bold">
              Search
            </button>
          </div>

          <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2E3192] hover:bg-[#0071BC] text-white text-xs font-semibold">
            <Upload className="w-4 h-4" />
            <span>{uploading ? 'Uploading...' : 'Upload New'}</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
              className="hidden"
              disabled={uploading}
              onChange={handleFileUpload}
            />
          </label>
        </div>

        <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
          {loading ? (
            <p className="col-span-full text-center text-xs text-slate-500 py-8">Loading media...</p>
          ) : items.length === 0 ? (
            <p className="col-span-full text-center text-xs text-slate-500 py-8">No media assets found. Upload one above!</p>
          ) : (
            items.map((item) => (
              <button
                key={item._id}
                type="button"
                onClick={() => {
                  onSelect(item);
                  onClose();
                }}
                className="group text-left border border-slate-200 hover:border-[#0071BC] rounded-xl overflow-hidden bg-slate-50 transition flex flex-col"
              >
                <div className="aspect-video w-full bg-slate-200 relative overflow-hidden">
                  {item.mimeType.startsWith('image/') ? (
                    <img src={item.url} alt={item.altText || item.originalName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-600">PDF</div>
                  )}
                  <span className="opacity-0 group-hover:opacity-100 absolute top-2 right-2 bg-[#0071BC] text-white rounded-full p-1 transition">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </span>
                </div>
                <div className="p-2 text-[11px]">
                  <p className="font-semibold text-slate-800 truncate">{item.originalName}</p>
                  <p className="text-slate-400 text-[10px]">Used in {item.usedIn?.length || 0} place(s)</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
