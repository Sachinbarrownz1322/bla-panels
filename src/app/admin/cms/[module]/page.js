'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  RotateCcw,
  Globe,
  EyeOff,
  Image as ImageIcon,
  Search,
  X,
} from 'lucide-react';
import { apiRequest, WEBSITE_BASE_URL } from '../../../../lib/api';
import MediaPickerModal from '../../../../components/cms/MediaPickerModal';

function resolvePreviewUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
  return `${WEBSITE_BASE_URL}${url.startsWith('/') ? url : `/${url}`}`;
}

const MODULE_SCHEMAS = {
  hero: {
    title: 'Home Hero Slides',
    fields: [
      { name: 'title', label: 'Heading *', type: 'text', required: true },
      { name: 'subtitle', label: 'Subtitle', type: 'text' },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'desktopImage', urlField: 'desktopImageUrl', label: 'Hero Image *', type: 'media', required: true },
      { name: 'altText', label: 'Alt Text', type: 'text' },
      { name: 'ctaText', label: 'CTA Button Text', type: 'text' },
      { name: 'ctaUrl', label: 'CTA Destination URL', type: 'text' },
      { name: 'order', label: 'Display Order', type: 'number' },
    ],
    displayTitle: (item) => item.title,
    displaySub: (item) => item.subtitle,
    displayImage: (item) => item.desktopImageUrl,
  },
  cards: {
    title: 'Home Cards & Course Promotions',
    fields: [
      { name: 'title', label: 'Course / Card Title *', type: 'text', required: true },
      { name: 'category', label: 'Category', type: 'text' },
      { name: 'image', urlField: 'imageUrl', label: 'Card Image *', type: 'media', required: true },
      { name: 'description', label: 'Short Description', type: 'textarea' },
      { name: 'duration', label: 'Start Date / Duration', type: 'text' },
      { name: 'mode', label: 'Mode (e.g. Classroom / Hybrid)', type: 'text' },
      { name: 'seatsLabel', label: 'Seats Label', type: 'text' },
      { name: 'badge', label: 'Badge (e.g. Most Popular)', type: 'text' },
      { name: 'ctaText', label: 'Button Text', type: 'text' },
      { name: 'destinationUrl', label: 'Destination URL', type: 'text' },
      { name: 'order', label: 'Display Order', type: 'number' },
    ],
    displayTitle: (item) => item.title,
    displaySub: (item) => `${item.category || ''} • ${item.duration || ''}`,
    displayImage: (item) => item.imageUrl,
  },
  'gallery-categories': {
    title: 'Gallery Categories',
    fields: [
      { name: 'name', label: 'Category Name *', type: 'text', required: true },
      { name: 'slug', label: 'Slug *', type: 'text', required: true },
      { name: 'section', label: 'Section', type: 'select', options: ['CAMPUS_LABS', 'SEMINARS_EVENTS', 'PROJECTS_AWARDS'] },
      { name: 'order', label: 'Display Order', type: 'number' },
    ],
    displayTitle: (item) => item.name,
    displaySub: (item) => `${item.section} (${item.slug})`,
  },
  gallery: {
    title: 'Gallery Items',
    fields: [
      { name: 'title', label: 'Title *', type: 'text', required: true },
      { name: 'media', urlField: 'imageUrl', label: 'Gallery Image *', type: 'media', required: true },
      { name: 'section', label: 'Gallery Page Section', type: 'select', options: ['CAMPUS_LABS', 'SEMINARS_EVENTS', 'PROJECTS_AWARDS'] },
      { name: 'categoryName', label: 'Category Label', type: 'text' },
      { name: 'location', label: 'Location', type: 'text' },
      { name: 'caption', label: 'Caption', type: 'text' },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'altText', label: 'Alt Text', type: 'text' },
      { name: 'order', label: 'Display Order', type: 'number' },
    ],
    displayTitle: (item) => item.title,
    displaySub: (item) => `${item.section} • ${item.categoryName}`,
    displayImage: (item) => item.imageUrl,
  },
  mous: {
    title: 'MOUs & College Tie-ups',
    fields: [
      { name: 'collegeName', label: 'College / Partner Name *', type: 'text', required: true },
      { name: 'partnerType', label: 'Alliance Type', type: 'text' },
      { name: 'location', label: 'Location', type: 'text' },
      { name: 'signingDate', label: 'Signing Date', type: 'date' },
      { name: 'mouMedia', urlField: 'mouImageUrl', label: 'MOU Photo / Document', type: 'media' },
      { name: 'logo', urlField: 'logoUrl', label: 'College Logo', type: 'media' },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'order', label: 'Display Order', type: 'number' },
    ],
    displayTitle: (item) => item.collegeName,
    displaySub: (item) => `${item.partnerType || ''} • ${item.location || ''}`,
    displayImage: (item) => item.mouImageUrl || item.logoUrl,
  },
  placements: {
    title: 'Placements & Hiring Partners',
    fields: [
      { name: 'studentName', label: 'Student Name *', type: 'text', required: true },
      { name: 'studentPhoto', urlField: 'studentPhotoUrl', label: 'Student Photo', type: 'media' },
      { name: 'companyName', label: 'Company Name *', type: 'text', required: true },
      { name: 'companyLogo', urlField: 'companyLogoUrl', label: 'Company Logo', type: 'media' },
      { name: 'designation', label: 'Role / Designation *', type: 'text', required: true },
      { name: 'packageText', label: 'Package (Optional)', type: 'text' },
      { name: 'placementYear', label: 'Placement Year', type: 'number' },
      { name: 'category', label: 'Category (Software / Web / Support)', type: 'text' },
      { name: 'badge', label: 'Badge', type: 'text' },
      { name: 'order', label: 'Display Order', type: 'number' },
    ],
    displayTitle: (item) => `${item.studentName} — ${item.companyName}`,
    displaySub: (item) => `${item.designation} (${item.placementYear || ''})`,
    displayImage: (item) => item.studentPhotoUrl || item.companyLogoUrl,
  },
  team: {
    title: 'Team & Faculty',
    fields: [
      { name: 'name', label: 'Name *', type: 'text', required: true },
      { name: 'designation', label: 'Designation *', type: 'text', required: true },
      { name: 'profileImage', urlField: 'profileImageUrl', label: 'Profile Photo', type: 'media' },
      { name: 'qualification', label: 'Qualification', type: 'text' },
      { name: 'experience', label: 'Experience', type: 'text' },
      { name: 'badge', label: 'Badge', type: 'text' },
      { name: 'bio', label: 'Biography', type: 'textarea' },
      { name: 'isLeadership', label: 'Leadership Spotlight?', type: 'checkbox' },
      { name: 'order', label: 'Display Order', type: 'number' },
    ],
    displayTitle: (item) => item.name,
    displaySub: (item) => item.designation,
    displayImage: (item) => item.profileImageUrl,
  },
  testimonials: {
    title: 'Student Testimonials',
    fields: [
      { name: 'studentName', label: 'Student Name *', type: 'text', required: true },
      { name: 'photo', urlField: 'photoUrl', label: 'Student Photo', type: 'media' },
      { name: 'courseName', label: 'Course Name', type: 'text' },
      { name: 'rating', label: 'Rating (1-5)', type: 'number' },
      { name: 'review', label: 'Review Text *', type: 'textarea', required: true },
      { name: 'videoUrl', label: 'Video Link (Optional)', type: 'text' },
      { name: 'order', label: 'Display Order', type: 'number' },
    ],
    displayTitle: (item) => item.studentName,
    displaySub: (item) => `${item.courseName || ''} • ${item.rating || 5}★`,
    displayImage: (item) => item.photoUrl,
  },
  announcements: {
    title: 'Announcements & Banners',
    fields: [
      { name: 'type', label: 'Type', type: 'select', options: ['MARQUEE', 'BANNER'] },
      { name: 'title', label: 'Title / Marquee Text *', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'bannerImage', urlField: 'bannerImageUrl', label: 'Banner Image', type: 'media' },
      { name: 'ctaText', label: 'CTA Text', type: 'text' },
      { name: 'ctaUrl', label: 'CTA URL', type: 'text' },
      { name: 'startDate', label: 'Start Date', type: 'date' },
      { name: 'endDate', label: 'End Date', type: 'date' },
      { name: 'order', label: 'Display Order', type: 'number' },
    ],
    displayTitle: (item) => item.title,
    displaySub: (item) => item.type,
    displayImage: (item) => item.bannerImageUrl,
  },
  seo: {
    title: 'Page Content & SEO',
    fields: [
      { name: 'routePath', label: 'Route Path * (e.g. / or /about-us)', type: 'text', required: true },
      { name: 'pageTitle', label: 'Page Title *', type: 'text', required: true },
      { name: 'heroHeading', label: 'Hero Heading', type: 'text' },
      { name: 'heroSubheading', label: 'Hero Subheading', type: 'text' },
      { name: 'metaTitle', label: 'SEO Meta Title', type: 'text' },
      { name: 'metaDescription', label: 'SEO Meta Description', type: 'textarea' },
      { name: 'keywords', label: 'SEO Keywords', type: 'text' },
      { name: 'ogImage', urlField: 'ogImageUrl', label: 'Open Graph Image', type: 'media' },
      { name: 'canonicalUrl', label: 'Canonical URL', type: 'text' },
    ],
    displayTitle: (item) => `${item.routePath} — ${item.pageTitle}`,
    displaySub: (item) => item.metaTitle || item.metaDescription,
    displayImage: (item) => item.ogImageUrl,
  },
};

export default function CmsModuleEditorPage() {
  const { module: moduleKey } = useParams();
  const cfg = MODULE_SCHEMAS[moduleKey];

  const [me, setMe] = useState(null);
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showTrash, setShowTrash] = useState(false);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({});
  const [pickerTarget, setPickerTarget] = useState(null);

  const load = async () => {
    if (!cfg) return;
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (search) qs.set('search', search);
      if (statusFilter !== 'ALL') qs.set('status', statusFilter);
      if (showTrash) qs.set('includeDeleted', 'true');
      const [meRes, listRes] = await Promise.all([
        apiRequest('/auth/me'),
        apiRequest(`/cms/${moduleKey}?${qs.toString()}`),
      ]);
      setMe(meRes.user);
      setItems(listRes.items || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [moduleKey, statusFilter, showTrash]);

  if (!cfg) {
    return (
      <div className="p-8 text-center space-y-3">
        <p className="text-sm font-bold text-rose-600">Unknown CMS module: {moduleKey}</p>
        <Link href="/admin/cms" className="text-xs text-[#0071BC] underline">← Back to CMS Hub</Link>
      </div>
    );
  }

  const openCreate = () => {
    const initial = { status: 'DRAFT', isActive: true, order: items.length + 1 };
    for (const f of cfg.fields) {
      if (f.type === 'select') initial[f.name] = f.options[0];
      else if (f.type === 'checkbox') initial[f.name] = false;
      else if (f.type === 'number') initial[f.name] = f.name === 'rating' ? 5 : items.length + 1;
      else initial[f.name] = '';
      if (f.urlField) initial[f.urlField] = '';
    }
    setEditingId(null);
    setForm(initial);
    setModalOpen(true);
  };

  const openEdit = (item) => {
    const copy = { ...item };
    for (const f of cfg.fields) {
      if (f.type === 'media' && copy[f.name]?._id) {
        copy[f.urlField] = copy[f.name].url || copy[f.urlField];
        copy[f.name] = copy[f.name]._id;
      }
      if (f.type === 'date' && copy[f.name]) {
        copy[f.name] = String(copy[f.name]).slice(0, 10);
      }
    }
    setEditingId(item._id);
    setForm(copy);
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setMsg('');
    try {
      const payload = { ...form };
      for (const f of cfg.fields) {
        if (f.type === 'media' && !payload[f.name]) payload[f.name] = null;
        if (f.type === 'date' && !payload[f.name]) payload[f.name] = null;
      }
      const res = editingId
        ? await apiRequest(`/cms/${moduleKey}/${editingId}`, { method: 'PATCH', body: JSON.stringify(payload) })
        : await apiRequest(`/cms/${moduleKey}`, { method: 'POST', body: JSON.stringify(payload) });
      setMsg(res.message);
      setModalOpen(false);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePublishToggle = async (item) => {
    setError('');
    setMsg('');
    try {
      const res = await apiRequest(`/cms/${moduleKey}/${item._id}/publish`, {
        method: 'PATCH',
        body: JSON.stringify({ status: item.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED' }),
      });
      setMsg(res.message);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Move this CMS item to trash?')) return;
    try {
      const res = await apiRequest(`/cms/${moduleKey}/${id}`, { method: 'DELETE' });
      setMsg(res.message);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRestore = async (id) => {
    try {
      const res = await apiRequest(`/cms/${moduleKey}/${id}/restore`, { method: 'POST' });
      setMsg(res.message);
      load();
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
            <h1 className="text-xl font-bold text-[#2E3192]">{cfg.title}</h1>
            <p className="text-xs text-slate-500">Create, edit, attach Media Library assets, and publish live.</p>
          </div>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2E3192] hover:bg-[#0071BC] text-white text-xs font-semibold"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Item</span>
        </button>
      </div>

      {error && (
        <div className="fixed top-5 right-5 z-[60] max-w-sm bg-rose-600 text-white px-4 py-3 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2.5 animate-bounce">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-white/80 hover:text-white"><X className="w-3.5 h-3.5" /></button>
        </div>
      )}
      {msg && (
        <div className="fixed top-5 right-5 z-[60] max-w-sm bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2.5">
          <span>{msg}</span>
          <button onClick={() => setMsg('')} className="text-white/80 hover:text-white"><X className="w-3.5 h-3.5" /></button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && load()}
            placeholder="Search items..."
            className="flex-1 outline-none"
          />
          <button onClick={load} className="text-[#0071BC] font-bold">Go</button>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white border border-slate-200 rounded-xl px-3 py-2 font-semibold"
        >
          <option value="ALL">All Statuses</option>
          <option value="PUBLISHED">Published</option>
          <option value="DRAFT">Draft</option>
        </select>
        {me?.roleName === 'SUPER_ADMIN' && (
          <button
            onClick={() => setShowTrash((v) => !v)}
            className={`px-3 py-2 rounded-xl border font-semibold ${showTrash ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-white border-slate-200 text-slate-600'}`}
          >
            {showTrash ? 'Viewing Trash' : 'View Trash'}
          </button>
        )}
      </div>

      {/* Items List */}
      {loading ? (
        <div className="p-8 text-center text-xs text-slate-500">Loading items...</div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-xs text-slate-500">
          No CMS items found in this module yet. Click "Add New Item" to create one.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => {
            const img = resolvePreviewUrl(cfg.displayImage?.(item));
            return (
              <div key={item._id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between">
                {img && (
                  <div className="aspect-video bg-slate-100">
                    <img src={img} alt={cfg.displayTitle(item)} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-4 space-y-2 text-xs flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.status === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                      {item.status}
                    </span>
                    <span className="text-[11px] text-slate-400">Order: {item.order ?? 0}</span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 line-clamp-1">{cfg.displayTitle(item)}</h3>
                  <p className="text-slate-500 line-clamp-2">{cfg.displaySub?.(item)}</p>
                </div>
                <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center gap-2 text-xs">
                  {showTrash ? (
                    <button
                      onClick={() => handleRestore(item._id)}
                      className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Restore
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => openEdit(item)}
                        className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 font-semibold text-slate-700 hover:bg-slate-100 inline-flex items-center gap-1"
                      >
                        <Pencil className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => handlePublishToggle(item)}
                        className={`flex-1 py-1.5 rounded-lg font-semibold inline-flex items-center justify-center gap-1 ${
                          item.status === 'PUBLISHED'
                            ? 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700'
                        }`}
                      >
                        {item.status === 'PUBLISHED' ? <EyeOff className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
                        <span>{item.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}</span>
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-[#2E3192] text-white px-6 py-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-sky-200 font-bold">Website CMS Editor</p>
                <h2 className="text-base font-bold">
                  {editingId ? `Edit ${cfg.title}` : `Create ${cfg.title}`}
                </h2>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs overflow-y-auto">
              <div className="grid sm:grid-cols-2 gap-4">
              {cfg.fields.map((f) => {
                if (f.type === 'media') {
                  const previewUrl = resolvePreviewUrl(form[f.urlField]);
                  return (
                    <div key={f.name} className="sm:col-span-2 space-y-2 border border-slate-200 rounded-2xl p-4 bg-slate-50/80">
                      <label className="block font-bold text-[#2E3192]">{f.label}</label>
                      <div className="flex flex-wrap items-center gap-4">
                        {previewUrl ? (
                          <img src={previewUrl} alt="Preview" className="h-20 w-36 object-cover rounded-xl border border-slate-200 bg-white shadow-sm" />
                        ) : (
                          <div className="h-20 w-36 rounded-xl border border-dashed border-slate-300 bg-white flex items-center justify-center text-[11px] text-slate-400">
                            No Image
                          </div>
                        )}
                        <div className="flex-1 space-y-2 min-w-[200px]">
                          <button
                            type="button"
                            onClick={() => setPickerTarget(f)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#2E3192] text-white font-semibold hover:bg-[#0071BC] transition shadow-sm"
                          >
                            <ImageIcon className="w-3.5 h-3.5" />
                            <span>Choose / Upload from Media Library</span>
                          </button>
                          <input
                            type="text"
                            required={f.required}
                            placeholder="Or paste image URL (auto-filled when picked)"
                            value={form[f.urlField] || ''}
                            onChange={(e) => setForm({ ...form, [f.urlField]: e.target.value })}
                            className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  );
                }
                if (f.type === 'textarea') {
                  return (
                    <div key={f.name} className="sm:col-span-2">
                      <label className="block font-semibold text-slate-700 mb-1">{f.label}</label>
                      <textarea
                        rows={3}
                        required={f.required}
                        value={form[f.name] || ''}
                        onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 focus:border-[#0071BC] outline-none"
                      />
                    </div>
                  );
                }
                if (f.type === 'select') {
                  return (
                    <div key={f.name}>
                      <label className="block font-semibold text-slate-700 mb-1">{f.label}</label>
                      <select
                        value={form[f.name] || f.options[0]}
                        onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 bg-white"
                      >
                        {f.options.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  );
                }
                if (f.type === 'checkbox') {
                  return (
                    <label key={f.name} className="inline-flex items-center gap-2 font-semibold pt-2">
                      <input
                        type="checkbox"
                        checked={Boolean(form[f.name])}
                        onChange={(e) => setForm({ ...form, [f.name]: e.target.checked })}
                      />
                      <span>{f.label}</span>
                    </label>
                  );
                }
                return (
                  <div key={f.name}>
                    <label className="block font-semibold text-slate-700 mb-1">{f.label}</label>
                    <input
                      type={f.type}
                      required={f.required}
                      value={form[f.name] ?? ''}
                      onChange={(e) => setForm({ ...form, [f.name]: f.type === 'number' ? Number(e.target.value) : e.target.value })}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 focus:border-[#0071BC] outline-none"
                    />
                  </div>
                );
              })}
              </div>

              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Publishing Status</label>
                  <select
                    value={form.status || 'DRAFT'}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 bg-white font-semibold"
                  >
                    <option value="DRAFT">DRAFT (Hidden from Website)</option>
                    <option value="PUBLISHED">PUBLISHED (Live on Website)</option>
                  </select>
                </div>
                <div className="flex items-end pb-2.5">
                  <label className="inline-flex items-center gap-2 font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={form.isActive !== false}
                      onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    />
                    <span>Active &amp; Visible</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2.5 rounded-xl bg-[#2E3192] text-white font-bold hover:bg-[#0071BC] shadow-sm transition">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <MediaPickerModal
        isOpen={Boolean(pickerTarget)}
        onClose={() => setPickerTarget(null)}
        onSelect={(asset) => {
          if (!pickerTarget) return;
          setForm((prev) => ({
            ...prev,
            [pickerTarget.name]: asset._id,
            [pickerTarget.urlField]: asset.url,
          }));
        }}
      />
    </div>
  );
}
