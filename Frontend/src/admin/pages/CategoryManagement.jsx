import { useState } from 'react';

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
];

const INITIAL_CATEGORIES = [
  { id: 1, name: 'Ribbons', icon: 'auto_awesome', active: true },
  { id: 2, name: 'Satin Wraps', icon: 'layers', active: true },
  { id: 3, name: 'Bridal Collection', icon: 'favorite', active: true },
  { id: 4, name: 'Hair Bows', icon: 'style', active: true },
  { id: 5, name: 'Headbands', icon: 'checkroom', active: true },
  { id: 6, name: 'Gift Sets', icon: 'card_giftcard', active: false },
];

export default function CategoryManagement() {
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [search, setSearch] = useState('');
  const [adding, setAdding] = useState(false);
  const [newForm, setNewForm] = useState({ name: '', icon: 'auto_awesome' });

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = categories.filter((c) => c.active).length;
  const inactiveCount = categories.filter((c) => !c.active).length;

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
    setCategories((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: newForm.name,
        icon: newForm.icon || 'auto_awesome',
        active: true,
      },
    ]);
    setNewForm({ name: '', icon: 'auto_awesome' });
    setAdding(false);
  }

  const selectedIconObj = ICON_OPTIONS.find((o) => o.icon === newForm.icon) || ICON_OPTIONS[0];

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-[1400px] mx-auto w-full">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h1 className="font-headline-md text-headline-md text-primary mb-1">Category Management</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Organize and manage your boutique product collections.</p>
        </div>
        <button
          onClick={() => setAdding(!adding)}
          className="bg-primary-container text-on-background px-6 py-3 rounded-lg font-label-md text-label-md hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-ambient whitespace-nowrap cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">{adding ? 'close' : 'add'}</span>
          {adding ? 'Cancel' : 'Create New Category'}
        </button>
      </div>

      {/* Add Category Form */}
      {adding && (
        <form onSubmit={handleAdd} className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient border border-outline-variant/30 space-y-6">
          <h3 className="font-title-sm text-title-sm text-primary border-b border-outline-variant/30 pb-3">
            New Category Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="font-label-md text-label-md text-on-surface mb-2 block">Category Name *</label>
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
              <label className="font-label-md text-label-md text-on-surface mb-2 block">Select Material Icon *</label>
              <div className="relative flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary">{newForm.icon}</span>
                </div>
                <div className="relative flex-grow">
                  <select
                    value={newForm.icon}
                    onChange={(e) => setNewForm({ ...newForm, icon: e.target.value })}
                    className="w-full bg-transparent border-0 border-b-2 border-outline-variant focus:border-primary outline-none py-2 pr-8 font-body-md text-body-md text-on-surface appearance-none cursor-pointer transition-colors"
                  >
                    {ICON_OPTIONS.map((opt) => (
                      <option key={opt.icon} value={opt.icon} className="bg-surface-container-lowest text-on-surface py-2">
                        {opt.label} ({opt.icon})
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-0 top-1/2 -translate-y-1/2 text-primary pointer-events-none text-[20px]">
                    unfold_more
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-8 py-3 bg-primary-container text-on-background font-label-md text-label-md rounded-lg shadow-ambient hover:bg-primary hover:text-white transition-all duration-300 flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              Save Category
            </button>
          </div>
        </form>
      )}

      {/* Stats Summary Cards */}
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

      {/* Main Data Table Section */}
      <div className="bg-surface-container-lowest rounded-xl shadow-ambient border border-outline-variant/20 overflow-hidden flex flex-col">
        {/* Search Bar */}
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

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/30 bg-surface-container-low/50">
                <th className="p-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Category Name</th>
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
                      <span className="font-medium text-primary font-title-sm text-base">{cat.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => toggleActive(cat.id)}
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
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => toggleActive(cat.id)}
                        className="p-2 text-on-surface-variant hover:text-primary transition-colors rounded-full hover:bg-surface-container-low cursor-pointer"
                        title={cat.active ? 'Deactivate Category' : 'Activate Category'}
                      >
                        <span className="material-symbols-outlined text-[20px]">{cat.active ? 'visibility_off' : 'visibility'}</span>
                      </button>
                      <button
                        onClick={() => deleteCategory(cat.id)}
                        className="p-2 text-on-surface-variant hover:text-error transition-colors rounded-full hover:bg-error-container/50 cursor-pointer"
                        title="Delete Category"
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
          <span className="font-label-sm text-label-sm text-on-surface-variant">Showing {filtered.length} of {categories.length} categories</span>
        </div>
      </div>
    </div>
  );
}
