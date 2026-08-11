import { useState } from 'react';

const INITIAL_CATS = [
  { id: 1, name: 'Bows', icon: 'auto_awesome', count: 12, active: true },
  { id: 2, name: 'Scrunchies', icon: 'layers', count: 8, active: true },
  { id: 3, name: 'Headbands', icon: 'favorite', count: 6, active: true },
  { id: 4, name: 'Ribbons', icon: 'style', count: 15, active: true },
  { id: 5, name: 'Accessories', icon: 'checkroom', count: 4, active: false },
  { id: 6, name: 'Bridal', icon: 'local_florist', count: 3, active: true },
];

export default function CategoryManagement() {
  const [cats, setCats] = useState(INITIAL_CATS);
  const [newCat, setNewCat] = useState('');
  const [adding, setAdding] = useState(false);

  function toggleActive(id) {
    setCats((prev) => prev.map((c) => c.id === id ? { ...c, active: !c.active } : c));
  }

  function deleteCat(id) {
    if (confirm('Delete this category?')) {
      setCats((prev) => prev.filter((c) => c.id !== id));
    }
  }

  function addCategory(e) {
    e.preventDefault();
    if (!newCat.trim()) return;
    setCats((prev) => [...prev, { id: Date.now(), name: newCat.trim(), icon: 'category', count: 0, active: true }]);
    setNewCat('');
    setAdding(false);
  }

  return (
    <div className="p-6 md:p-10 w-full max-w-4xl">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="font-headline-md text-headline-md text-on-background">Category Management</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Manage your product categories and organisation.</p>
        </div>
        <button
          onClick={() => setAdding(!adding)}
          className="bg-primary-container text-on-background font-label-md text-label-md py-3 px-6 rounded-lg hover:bg-primary hover:text-white transition-all duration-300 flex items-center gap-2 shadow-ambient"
        >
          <span className="material-symbols-outlined text-[18px]">{adding ? 'close' : 'add'}</span>
          {adding ? 'Cancel' : 'Add Category'}
        </button>
      </div>

      {/* Add Category Form */}
      {adding && (
        <form onSubmit={addCategory} className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient mb-6 flex gap-4 items-end">
          <div className="flex-grow">
            <label className="font-label-md text-label-md text-on-surface mb-1 block">Category Name</label>
            <input
              type="text" value={newCat} onChange={(e) => setNewCat(e.target.value)}
              placeholder="e.g. Hair Clips" autoFocus required
              className="w-full border-b-2 border-outline-variant focus:border-primary outline-none py-3 font-body-md text-body-md text-on-surface bg-transparent transition-colors"
            />
          </div>
          <button type="submit" className="py-3 px-6 bg-primary text-white font-label-md text-label-md rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add
          </button>
        </form>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-surface-container-lowest rounded-xl p-4 shadow-ambient text-center">
          <p className="font-headline-md text-primary" style={{ fontSize: '32px' }}>{cats.length}</p>
          <p className="font-label-md text-label-md text-on-surface-variant">Total Categories</p>
        </div>
        <div className="bg-surface-container-lowest rounded-xl p-4 shadow-ambient text-center">
          <p className="font-headline-md text-secondary" style={{ fontSize: '32px' }}>{cats.filter(c => c.active).length}</p>
          <p className="font-label-md text-label-md text-on-surface-variant">Active</p>
        </div>
        <div className="bg-surface-container-lowest rounded-xl p-4 shadow-ambient text-center">
          <p className="font-headline-md text-on-surface" style={{ fontSize: '32px' }}>{cats.reduce((s, c) => s + c.count, 0)}</p>
          <p className="font-label-md text-label-md text-on-surface-variant">Total Products</p>
        </div>
        <div className="bg-surface-container-lowest rounded-xl p-4 shadow-ambient text-center">
          <p className="font-headline-md text-tertiary" style={{ fontSize: '32px' }}>{cats.filter(c => !c.active).length}</p>
          <p className="font-label-md text-label-md text-on-surface-variant">Inactive</p>
        </div>
      </div>

      {/* Category Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cats.map((cat) => (
          <div key={cat.id} className="bg-surface-container-lowest rounded-xl p-5 shadow-ambient hover:shadow-ambient-lg transition-all duration-300 flex items-start gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${cat.active ? 'bg-primary-container' : 'bg-surface-container'}`}>
              <span className={`material-symbols-outlined ${cat.active ? 'text-primary' : 'text-outline'}`}>{cat.icon}</span>
            </div>
            <div className="flex-grow">
              <div className="flex justify-between items-start">
                <h3 className="font-title-sm text-title-sm text-on-surface">{cat.name}</h3>
                <span className={`font-label-sm text-label-sm px-2 py-0.5 rounded-full ${cat.active ? 'bg-secondary-container text-secondary' : 'bg-surface-container text-on-surface-variant'}`}>
                  {cat.active ? 'Active' : 'Hidden'}
                </span>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">{cat.count} products</p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => toggleActive(cat.id)}
                  className="flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant hover:text-primary hover:bg-surface-container px-2 py-1 rounded-lg transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">{cat.active ? 'visibility_off' : 'visibility'}</span>
                  {cat.active ? 'Hide' : 'Show'}
                </button>
                <button
                  onClick={() => deleteCat(cat.id)}
                  className="flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant hover:text-error hover:bg-error-container/30 px-2 py-1 rounded-lg transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
