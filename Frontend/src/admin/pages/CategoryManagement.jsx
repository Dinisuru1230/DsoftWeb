import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const API_BASE = 'http://localhost:5050/api';

const ICON_OPTIONS = [
  { icon: 'auto_awesome', label: 'Sparkles / Magic' },
  { icon: 'style', label: 'Bows & Ribbons' },
  { icon: 'favorite', label: 'Heart & Bridal' },
  { icon: 'layers', label: 'Satin Wraps & Fabrics' },
  { icon: 'checkroom', label: 'Apparel & Headbands' },
  { icon: 'card_giftcard', label: 'Gift Sets & Boxes' },
  { icon: 'shopping_bag', label: 'Shopping & Boutique' },
  { icon: 'diamond', label: 'Jewelry & Accessories' },
  { icon: 'spa', label: 'Floral & Botanical' },
  { icon: 'local_florist', label: 'Roses & Flowers' },
  { icon: 'palette', label: 'Artisan & Crafts' },
  { icon: 'content_cut', label: 'Scissors & Sewing' },
  { icon: 'storefront', label: 'Store Collection' },
  { icon: 'sell', label: 'Tags & Badges' },
  { icon: 'category', label: 'General Category' },
  { icon: 'dry', label: 'Hair Care & Styling' },
  { icon: 'redeem', label: 'Special Offer & Bundles' },
  { icon: 'star', label: 'Featured / Star' },
  { icon: 'bolt', label: 'Quick / Fast' },
  { icon: 'celebration', label: 'Celebration' },
  { icon: 'emoji_events', label: 'Awards & Events' },
  { icon: 'volunteer_activism', label: 'Handmade / Care' },
];

export default function CategoryManagement() {
  const { token } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  // Create mode
  const [adding, setAdding] = useState(false);
  const [newForm, setNewForm] = useState({ name: '', icon: 'auto_awesome' });
  const [createError, setCreateError] = useState('');
  const [creating, setCreating] = useState(false);

  // Edit mode
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', icon: 'auto_awesome' });
  const [editError, setEditError] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const authHeaders = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  // ── Fetch all categories (including inactive) ──
  async function fetchCategories() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/categories?all=true`, { headers: authHeaders });
      const data = await res.json();
      if (res.ok) setCategories(data.categories);
      else setError(data.error || 'Failed to load categories');
    } catch {
      setError('Network error — cannot reach backend');
    }
    setLoading(false);
  }

  useEffect(() => { fetchCategories(); }, []);

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );
  const activeCount = categories.filter((c) => c.active).length;
  const inactiveCount = categories.filter((c) => !c.active).length;

  // ── Create ──
  async function handleCreate(e) {
    e.preventDefault();
    if (!newForm.name.trim()) { setCreateError('Category name is required.'); return; }
    setCreating(true);
    setCreateError('');
    const res = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ name: newForm.name.trim(), icon: newForm.icon }),
    });
    const data = await res.json();
    setCreating(false);
    if (res.ok) {
      setCategories((prev) => [...prev, data.category]);
      setNewForm({ name: '', icon: 'auto_awesome' });
      setAdding(false);
    } else {
      setCreateError(data.error || 'Failed to create category');
    }
  }

  // ── Toggle Active ──
  async function toggleActive(cat) {
    const res = await fetch(`${API_BASE}/categories/${cat.id}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({ active: !cat.active }),
    });
    const data = await res.json();
    if (res.ok) {
      setCategories((prev) =>
        prev.map((c) => (c.id === cat.id ? { ...c, active: !c.active } : c))
      );
    } else {
      setError(data.error || 'Failed to update category');
    }
  }

  // ── Open Edit ──
  function openEdit(cat) {
    setEditingId(cat.id);
    setEditForm({ name: cat.name, icon: cat.icon });
    setEditError('');
  }

  // ── Save Edit ──
  async function handleEditSave(e) {
    e.preventDefault();
    if (!editForm.name.trim()) { setEditError('Category name is required.'); return; }
    setEditSaving(true);
    setEditError('');
    const res = await fetch(`${API_BASE}/categories/${editingId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({ name: editForm.name.trim(), icon: editForm.icon }),
    });
    const data = await res.json();
    setEditSaving(false);
    if (res.ok) {
      setCategories((prev) =>
        prev.map((c) => (c.id === editingId ? { ...c, name: data.category.name, icon: data.category.icon, slug: data.category.slug } : c))
      );
      setEditingId(null);
    } else {
      setEditError(data.error || 'Failed to update category');
    }
  }

  // ── Delete ──
  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await fetch(`${API_BASE}/categories/${deleteTarget.id}`, {
      method: 'DELETE',
      headers: authHeaders,
    });
    const data = await res.json();
    setDeleting(false);
    if (res.ok) {
      setCategories((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      setDeleteTarget(null);
    } else {
      setError(data.error || 'Failed to delete category');
      setDeleteTarget(null);
    }
  }

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-[1400px] mx-auto w-full">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h1 className="font-headline-md text-headline-md text-on-background mb-1">Category Management</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Organize and manage your boutique product collections.</p>
        </div>
        <button
          onClick={() => { setAdding(!adding); setCreateError(''); setNewForm({ name: '', icon: 'auto_awesome' }); }}
          className="bg-primary text-white px-6 py-3 rounded-full font-label-md text-label-md hover:bg-primary/80 transition-colors flex items-center justify-center gap-2 shadow-ambient whitespace-nowrap cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">{adding ? 'close' : 'add'}</span>
          {adding ? 'Cancel' : 'Create New Category'}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-error-container text-on-error-container rounded-lg font-label-md flex items-center justify-between">
          {error}
          <button onClick={() => setError('')} className="text-xs underline cursor-pointer">Dismiss</button>
        </div>
      )}

      {/* ── Create Form ── */}
      {adding && (
        <form onSubmit={handleCreate} className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient border border-outline-variant/30 space-y-5">
          <div className="flex items-center gap-2 pb-2 border-b border-outline-variant/60">
            <span className="material-symbols-outlined text-primary text-[20px]">add_circle</span>
            <h3 className="font-title-sm text-sm text-primary font-bold uppercase tracking-widest">New Category Details</h3>
          </div>

          {createError && (
            <div className="p-3 bg-error-container text-on-error-container rounded-lg text-sm font-label-md flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {createError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label-sm text-xs text-on-surface-variant uppercase tracking-widest">Category Name *</label>
              <input
                type="text"
                value={newForm.name}
                onChange={(e) => { setNewForm({ ...newForm, name: e.target.value }); setCreateError(''); }}
                placeholder="e.g. Hair Clips"
                className="w-full px-3 py-2.5 bg-surface-container-low border border-outline-variant rounded-lg font-body-md text-on-surface outline-none focus:border-primary transition-colors"
              />
            </div>
            {/* Icon */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label-sm text-xs text-on-surface-variant uppercase tracking-widest">Select Icon *</label>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-lg bg-primary-container flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary text-[22px]">{newForm.icon}</span>
                </div>
                <div className="relative flex-grow">
                  <select
                    value={newForm.icon}
                    onChange={(e) => setNewForm({ ...newForm, icon: e.target.value })}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2.5 pr-8 font-body-md text-on-surface outline-none focus:border-primary appearance-none cursor-pointer transition-colors"
                  >
                    {ICON_OPTIONS.map((opt) => (
                      <option key={opt.icon} value={opt.icon}>
                        {opt.label} ({opt.icon})
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-primary pointer-events-none text-[20px]">expand_more</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-outline-variant">
            <button
              type="submit"
              disabled={creating}
              className="px-6 py-2.5 bg-primary text-white rounded-full font-label-md hover:bg-primary/80 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2 shadow-ambient"
            >
              {creating
                ? <span className="material-symbols-outlined animate-spin text-[16px]">sync</span>
                : <span className="material-symbols-outlined text-[16px]">save</span>
              }
              {creating ? 'Saving...' : 'Save Category'}
            </button>
          </div>
        </form>
      )}

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient border border-outline-variant/20 flex items-center justify-between">
          <div>
            <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Total Categories</p>
            <h2 className="font-title-sm text-headline-md text-primary">{categories.length}</h2>
          </div>
          <div className="w-12 h-12 rounded-full bg-primary-container/50 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary">category</span>
          </div>
        </div>
        <div className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient border border-outline-variant/20 flex items-center justify-between">
          <div>
            <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Active Categories</p>
            <h2 className="font-title-sm text-headline-md text-primary">{activeCount}</h2>
          </div>
          <div className="w-12 h-12 rounded-full bg-secondary-container/50 flex items-center justify-center">
            <span className="material-symbols-outlined text-secondary">check_circle</span>
          </div>
        </div>
        <div className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient border border-outline-variant/20 flex items-center justify-between">
          <div>
            <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Inactive Categories</p>
            <h2 className="font-title-sm text-headline-md text-on-surface-variant">{inactiveCount}</h2>
          </div>
          <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center">
            <span className="material-symbols-outlined text-on-surface-variant">visibility_off</span>
          </div>
        </div>
      </div>

      {/* ── Category Table ── */}
      <div className="bg-surface-container-lowest rounded-xl shadow-ambient border border-outline-variant/20 overflow-hidden flex flex-col">
        {/* Search */}
        <div className="p-4 md:p-6 border-b border-outline-variant/30 flex flex-col sm:flex-row gap-4 justify-between items-center bg-surface-bright">
          <div className="relative w-full sm:max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search categories by name..."
              className="w-full pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-lg text-body-md focus:ring-1 focus:ring-primary focus:bg-surface-container-lowest transition-colors placeholder:text-outline outline-none"
            />
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-on-surface-variant">
            <span className="material-symbols-outlined animate-spin text-primary text-2xl">sync</span>
            <span className="font-label-md">Loading categories...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/30 bg-surface-container-low/50">
                  <th className="p-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Category Name</th>
                  <th className="p-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold text-center">Products</th>
                  <th className="p-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold text-center">Status</th>
                  <th className="p-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 font-body-md text-on-surface">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-on-surface-variant font-label-md">
                      {search ? 'No categories match your search.' : 'No categories yet. Create one!'}
                    </td>
                  </tr>
                ) : filtered.map((cat) => (
                  <tr key={cat.id} className="hover:bg-surface-container-low/50 transition-colors group">
                    <td className="p-4">
                      {editingId === cat.id ? (
                        <form onSubmit={handleEditSave} className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center shrink-0">
                              <span className="material-symbols-outlined text-primary text-[20px]">{editForm.icon}</span>
                            </div>
                            <input
                              type="text"
                              value={editForm.name}
                              onChange={(e) => { setEditForm({ ...editForm, name: e.target.value }); setEditError(''); }}
                              className="flex-1 px-2 py-1.5 bg-surface-container-low border border-primary rounded-lg font-body-md text-on-surface outline-none text-sm"
                              autoFocus
                            />
                          </div>
                          <div className="flex items-center gap-2 pl-12">
                            <div className="relative flex-grow">
                              <select
                                value={editForm.icon}
                                onChange={(e) => setEditForm({ ...editForm, icon: e.target.value })}
                                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-1.5 pr-8 font-body-md text-on-surface outline-none focus:border-primary appearance-none cursor-pointer text-sm"
                              >
                                {ICON_OPTIONS.map((opt) => (
                                  <option key={opt.icon} value={opt.icon}>{opt.label}</option>
                                ))}
                              </select>
                              <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-primary pointer-events-none text-[18px]">expand_more</span>
                            </div>
                          </div>
                          {editError && (
                            <p className="text-xs text-error pl-12 flex items-center gap-1">
                              <span className="material-symbols-outlined text-[13px]">error</span>
                              {editError}
                            </p>
                          )}
                          <div className="flex items-center gap-2 pl-12">
                            <button type="submit" disabled={editSaving} className="px-3 py-1 bg-primary text-white text-xs rounded-full cursor-pointer hover:bg-primary/80 transition-colors disabled:opacity-50 flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">{editSaving ? 'sync' : 'check'}</span>
                              Save
                            </button>
                            <button type="button" onClick={() => setEditingId(null)} className="px-3 py-1 border border-outline-variant text-xs rounded-full cursor-pointer hover:bg-surface-container transition-colors">
                              Cancel
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-primary">{cat.icon}</span>
                          </div>
                          <span className="font-medium text-primary font-title-sm text-base">{cat.name}</span>
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <span className="font-label-md text-on-surface-variant text-sm">{cat.productCount ?? 0}</span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => toggleActive(cat)}
                        className={`inline-flex items-center px-3 py-1 rounded-full font-label-sm text-[11px] uppercase tracking-wide cursor-pointer transition-colors ${
                          cat.active
                            ? 'bg-secondary-container text-on-secondary-container font-bold'
                            : 'bg-surface-container text-on-surface-variant'
                        }`}
                      >
                        {cat.active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      {editingId !== cat.id && (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEdit(cat)}
                            className="p-2 text-on-surface-variant hover:text-secondary transition-colors rounded-full hover:bg-secondary-container/30 cursor-pointer"
                            title="Edit Category"
                          >
                            <span className="material-symbols-outlined text-[20px]">edit</span>
                          </button>
                          <button
                            onClick={() => toggleActive(cat)}
                            className="p-2 text-on-surface-variant hover:text-primary transition-colors rounded-full hover:bg-surface-container-low cursor-pointer"
                            title={cat.active ? 'Deactivate' : 'Activate'}
                          >
                            <span className="material-symbols-outlined text-[20px]">{cat.active ? 'visibility_off' : 'visibility'}</span>
                          </button>
                          <button
                            onClick={() => setDeleteTarget(cat)}
                            className="p-2 text-on-surface-variant hover:text-error transition-colors rounded-full hover:bg-error-container/50 cursor-pointer"
                            title="Delete Category"
                          >
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-outline-variant/30 flex justify-between items-center bg-surface-bright">
          <span className="font-label-sm text-label-sm text-on-surface-variant">Showing {filtered.length} of {categories.length} categories</span>
        </div>
      </div>

      {/* ── Delete Confirm Modal ── */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-start gap-3 mb-5 p-3 bg-error-container/30 rounded-lg">
              <span className="material-symbols-outlined text-error mt-0.5">warning</span>
              <div>
                <p className="font-title-sm text-on-surface font-bold">Delete Category</p>
                <p className="font-body-md text-sm text-on-surface-variant mt-1">
                  Are you sure you want to delete <strong>{deleteTarget.name}</strong>?
                  This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-5 py-2 border border-outline-variant rounded-full font-label-md text-label-md hover:bg-surface-container transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-5 py-2 bg-error text-white rounded-full font-label-md text-label-md hover:bg-error/80 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {deleting
                  ? <span className="material-symbols-outlined animate-spin text-[16px]">sync</span>
                  : <span className="material-symbols-outlined text-[16px]">delete</span>
                }
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
