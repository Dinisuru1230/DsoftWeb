import { useState } from 'react';

const INITIAL_CATEGORIES = [
  { id: 1, name: 'Ribbons', slug: '/ribbons', description: 'Handcrafted silk and satin ribbons for special occasions.', count: 45, icon: 'auto_awesome', active: true },
  { id: 2, name: 'Satin Wraps', slug: '/satin-wraps', description: 'Luxurious satin wraps for gifting and presentation.', count: 28, icon: 'layers', active: true },
  { id: 3, name: 'Bridal Collection', slug: '/bridal', description: 'Seasonal bridal accessories and veil trims.', count: 18, icon: 'favorite', active: true },
  { id: 4, name: 'Hair Bows', slug: '/hair-bows', description: 'Classic and modern bows crafted from pure silk.', count: 32, icon: 'style', active: true },
  { id: 5, name: 'Headbands', slug: '/headbands', description: 'Intricate woven floral and velvet headbands.', count: 14, icon: 'checkroom', active: true },
  { id: 6, name: 'Gift Sets', slug: '/gift-sets', description: 'Curated artisanal accessory bundles.', count: 0, icon: 'card_giftcard', active: false },
];

export default function CategoryManagement() {
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [search, setSearch] = useState('');
  const [adding, setAdding] = useState(false);
  const [newForm, setNewForm] = useState({ name: '', slug: '', description: '' });

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.slug.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = categories.filter((c) => c.active).length;
  const lowCount = categories.filter((c) => c.count === 0).length;

  function toggleActive(id) {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c))
    );
  }

  function deleteCategory(id) {
    if (confirm('Are you sure you want to delete this category?')) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
    }
  }

  function handleAdd(e) {
    e.preventDefault();
    if (!newForm.name.trim()) return;
    const slug = newForm.slug.trim() || `/${newForm.name.toLowerCase().replace(/\s+/g, '-')}`;
    setCategories((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: newForm.name,
        slug: slug.startsWith('/') ? slug : `/${slug}`,
        description: newForm.description || 'Handcrafted accessory collection.',
        count: 0,
        icon: 'category',
        active: true,
      },
    ]);
    setNewForm({ name: '', slug: '', description: '' });
    setAdding(false);
  }

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-[1400px] mx-auto w-full">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h1 className="font-headline-md text-headline-md text-primary mb-1">Category Management</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Organize and manage your product collections.</p>
        </div>
        <button
          onClick={() => setAdding(!adding)}
          className="bg-primary-container text-on-background px-6 py-3 rounded-lg font-label-md text-label-md hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-ambient whitespace-nowrap"
        >
          <span className="material-symbols-outlined text-[18px]">{adding ? 'close' : 'add'}</span>
          {adding ? 'Cancel' : 'Create New Category'}
        </button>
      </div>

      {/* Add Form */}
      {adding && (
        <form onSubmit={handleAdd} className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient border border-outline-variant/30 space-y-4">
          <h3 className="font-title-sm text-title-sm text-primary">New Category Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-label-md text-label-md text-on-surface mb-1 block">Category Name</label>
              <input
                type="text"
                value={newForm.name}
                onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                placeholder="e.g. Hair Clips"
                required
                className="w-full border-b-2 border-outline-variant focus:border-primary outline-none py-2 font-body-md text-body-md text-on-surface bg-transparent"
              />
            </div>
            <div>
              <label className="font-label-md text-label-md text-on-surface mb-1 block">URL Slug</label>
              <input
                type="text"
                value={newForm.slug}
                onChange={(e) => setNewForm({ ...newForm, slug: e.target.value })}
                placeholder="e.g. /hair-clips"
                className="w-full border-b-2 border-outline-variant focus:border-primary outline-none py-2 font-body-md text-body-md text-on-surface bg-transparent"
              />
            </div>
          </div>
          <div>
            <label className="font-label-md text-label-md text-on-surface mb-1 block">Description</label>
            <input
              type="text"
              value={newForm.description}
              onChange={(e) => setNewForm({ ...newForm, description: e.target.value })}
              placeholder="Short description of this collection..."
              className="w-full border-b-2 border-outline-variant focus:border-primary outline-none py-2 font-body-md text-body-md text-on-surface bg-transparent"
            />
          </div>
          <button type="submit" className="px-6 py-2 bg-primary text-white font-label-md text-label-md rounded-lg hover:opacity-90 transition-opacity">
            Save Category
          </button>
        </form>
      )}

      {/* Bento Stats Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stat 1 */}
        <div className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient border border-outline-variant/20 flex items-center justify-between">
          <div>
            <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Total Categories</p>
            <h2 className="font-title-sm text-headline-md text-primary">{categories.length}</h2>
          </div>
          <div className="w-12 h-12 rounded-full bg-primary-container/50 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary">category</span>
          </div>
        </div>

        {/* Stat 2 */}
        <div className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient border border-outline-variant/20 flex items-center justify-between">
          <div>
            <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Active Categories</p>
            <h2 className="font-title-sm text-headline-md text-primary">{activeCount}</h2>
          </div>
          <div className="w-12 h-12 rounded-full bg-secondary-container/50 flex items-center justify-center">
            <span className="material-symbols-outlined text-secondary">check_circle</span>
          </div>
        </div>

        {/* Stat 3 */}
        <div className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient border border-error-container/50 flex items-center justify-between relative overflow-hidden">
          <div className="relative z-10">
            <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Low / Zero Stock</p>
            <h2 className="font-title-sm text-headline-md text-error">{lowCount}</h2>
          </div>
          <div className="w-12 h-12 rounded-full bg-error-container/50 flex items-center justify-center relative z-10">
            <span className="material-symbols-outlined text-error">warning</span>
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-error-container/30 rounded-full blur-xl pointer-events-none" />
        </div>
      </div>

      {/* Main Data Table Section */}
      <div className="bg-surface-container-lowest rounded-xl shadow-ambient border border-outline-variant/20 overflow-hidden flex flex-col">
        {/* Search & Filter Bar */}
        <div className="p-4 md:p-6 border-b border-outline-variant/30 flex flex-col sm:flex-row gap-4 justify-between items-center bg-surface-bright">
          <div className="relative w-full sm:max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search categories by name or slug..."
              className="w-full pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-lg text-body-md focus:ring-1 focus:ring-primary focus:bg-surface-container-lowest transition-colors placeholder:text-outline outline-none"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/30 bg-surface-container-low/50">
                <th className="p-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Category</th>
                <th className="p-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold hidden md:table-cell">Slug</th>
                <th className="p-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold hidden lg:table-cell">Description</th>
                <th className="p-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold text-center">Products</th>
                <th className="p-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold text-center">Status</th>
                <th className="p-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 font-body-md text-on-surface">
              {filtered.map((cat) => (
                <tr key={cat.id} className="hover:bg-surface-container-low/50 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-primary">{cat.icon}</span>
                      </div>
                      <span className="font-medium text-primary">{cat.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-outline hidden md:table-cell">{cat.slug}</td>
                  <td className="p-4 text-on-surface-variant truncate max-w-[240px] hidden lg:table-cell">{cat.description}</td>
                  <td className="p-4 text-center font-bold">{cat.count}</td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => toggleActive(cat.id)}
                      className={`inline-flex items-center px-3 py-1 rounded-full font-label-sm text-[11px] uppercase tracking-wide cursor-pointer transition-colors ${
                        cat.active
                          ? 'bg-secondary-container text-on-secondary-container'
                          : 'bg-surface-container text-on-surface-variant'
                      }`}
                    >
                      {cat.active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => toggleActive(cat.id)}
                        className="p-2 text-on-surface-variant hover:text-primary transition-colors rounded-full hover:bg-surface-container-low"
                        title={cat.active ? 'Deactivate' : 'Activate'}
                      >
                        <span className="material-symbols-outlined text-[20px]">{cat.active ? 'visibility_off' : 'visibility'}</span>
                      </button>
                      <button
                        onClick={() => deleteCategory(cat.id)}
                        className="p-2 text-on-surface-variant hover:text-error transition-colors rounded-full hover:bg-error-container/50"
                        title="Delete"
                      >
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-outline-variant/30 flex justify-between items-center bg-surface-bright">
          <span className="font-label-sm text-label-sm text-on-surface-variant">Showing {filtered.length} of {categories.length} entries</span>
        </div>
      </div>
    </div>
  );
}
