import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const API_BASE = 'http://localhost:5050/api';

export default function ProductManagement() {
  const { token } = useAuth();
  const location = useLocation();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All Products');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchProducts();
    if (location.state?.created) {
      toast.success(`Product "${location.state.created}" was added to catalog!`);
    }
  }, [location.state]);

  async function fetchProducts() {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/products`);
      const data = await res.json();
      if (res.ok) {
        setProducts(data);
      }
    } catch (err) {
      toast.error('Could not load products. Please check connection.');
    } finally {
      setLoading(false);
    }
  }

  async function toggleFeatured(id, currentStatus) {
    if (!token) return;
    const newStatus = !currentStatus;
    const target = products.find((p) => p.id === id);
    const toastId = toast.loading('Updating product...');

    try {
      const res = await fetch(`${API_BASE}/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ featured: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update product');
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, featured: newStatus } : p))
      );
      toast.success(`"${target?.name}" is now ${newStatus ? 'Featured' : 'Standard'}!`, { id: toastId });
    } catch (err) {
      toast.error('Failed to update featured status.', { id: toastId });
    }
  }

  async function handleDelete(id, name) {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    if (!token) return;

    setDeletingId(id);
    const toastId = toast.loading(`Deleting "${name}"...`);

    try {
      const res = await fetch(`${API_BASE}/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete product');
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success(`"${name}" has been deleted from the catalog.`, { id: toastId });
    } catch (err) {
      toast.error(err.message || 'Could not delete product.', { id: toastId });
    } finally {
      setDeletingId(null);
    }
  }

  const categories = ['All Products', ...new Set(products.map((p) => p.categoryName || p.category).filter(Boolean))];

  const filtered = products.filter((p) => {
    const category = p.categoryName || p.category || '';
    const matchesCat = catFilter === 'All Products' || category === catFilter;
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(search.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="p-6 md:p-10 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="font-headline-md text-headline-md text-on-background">Product Management</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">View, edit, and manage your artisanal inventory.</p>
        </div>
        <Link
          to="/admin/add-product"
          className="bg-primary-container text-on-background font-label-md text-label-md py-3 px-6 rounded-lg hover:bg-primary hover:text-white transition-all duration-300 flex items-center gap-2 shadow-ambient font-bold"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add New Product
        </Link>
      </div>

      {/* Search + Filter */}
      <div className="bg-surface-container-lowest rounded-lg p-4 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between shadow-ambient border border-outline-variant/30">
        <div className="relative w-full md:w-96">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full bg-transparent border-b-2 border-outline-variant focus:border-primary pl-10 pr-4 py-2 font-body-md text-body-md text-on-surface outline-none transition-colors"
          />
        </div>
        <div className="flex gap-2 flex-wrap overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCatFilter(cat)}
              className={`px-4 py-1.5 rounded-full font-label-sm text-label-sm transition-colors cursor-pointer whitespace-nowrap ${
                catFilter === cat
                  ? 'bg-primary text-white font-bold'
                  : 'border border-outline-variant text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-ambient border border-outline-variant/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/30 bg-surface-container-low">
                {['Product', 'Category', 'Price', 'Stock', 'Featured', 'Actions'].map((h) => (
                  <th key={h} className={`p-4 font-label-md text-label-md text-on-surface-variant ${h === 'Actions' ? 'text-right' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 font-body-md text-on-surface">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined animate-spin text-2xl text-primary mb-2">sync</span>
                    <p>Loading products catalog...</p>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-4xl text-outline mb-2">inventory_2</span>
                    <p>No products found matching your filter.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-surface-container-low/50 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-surface-container flex-shrink-0 border border-outline-variant/30">
                          <img src={p.image || '/14_blush_silk_ribbon_bow.jpg'} alt={p.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-title-sm text-title-sm text-on-surface group-hover:text-primary transition-colors font-bold">{p.name}</p>
                          <p className="font-label-sm text-label-sm text-on-surface-variant text-xs">{p.colors?.length ? `${p.colors.length} color variants` : 'Single Item'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-3 py-1 rounded-full bg-primary-container text-on-background font-label-sm text-label-sm font-bold">
                        {p.categoryName || p.category || 'General'}
                      </span>
                    </td>
                    <td className="p-4 font-body-md text-body-md text-on-surface font-bold">Rs. {Number(p.price || 0).toLocaleString()}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${p.stock === 0 ? 'bg-error' : p.stock < 5 ? 'bg-tertiary' : 'bg-secondary'}`} />
                        <span className="font-body-md text-body-md text-on-surface font-medium">{p.stock === 0 ? 'Out of Stock' : `${p.stock} units`}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => toggleFeatured(p.id, p.featured)}
                        className={`font-label-sm text-label-sm px-3 py-1 rounded-full transition-colors cursor-pointer ${
                          p.featured ? 'bg-secondary-container text-secondary font-bold' : 'bg-surface-container text-on-surface-variant hover:bg-secondary-container/50'
                        }`}
                      >
                        {p.featured ? '★ Featured' : '☆ Standard'}
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        type="button"
                        disabled={deletingId === p.id}
                        onClick={() => handleDelete(p.id, p.name)}
                        className="text-error hover:text-error/80 p-1.5 rounded-lg hover:bg-error-container/30 transition-colors cursor-pointer disabled:opacity-50"
                        title="Delete product"
                      >
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
