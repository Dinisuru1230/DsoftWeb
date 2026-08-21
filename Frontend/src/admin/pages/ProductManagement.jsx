import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const API_BASE = 'http://localhost:5050/api';

function imgUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  if (path.startsWith('/uploads')) return `http://localhost:5050${path}`;
  return path;
}

export default function ProductManagement() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useAuth();
  const authHeaders = { Authorization: `Bearer ${token}` };

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [catFilter, setCatFilter] = useState('All Products');
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState(location.state?.created ? `"${location.state.created}" created successfully!` : '');

  // Clear success message after 4s
  useEffect(() => {
    if (successMsg) {
      const t = setTimeout(() => setSuccessMsg(''), 4000);
      return () => clearTimeout(t);
    }
  }, [successMsg]);

  const fetchProducts = useCallback(() => {
    setLoading(true);
    fetch(`${API_BASE}/products`, { headers: authHeaders })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setProducts(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  // Fetch products
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Fetch categories for filter buttons
  useEffect(() => {
    fetch(`${API_BASE}/categories?all=true`, { headers: authHeaders })
      .then((r) => r.json())
      .then((data) => {
        if (data.categories?.length) setCategories(data.categories);
      })
      .catch(() => {});
  }, [token]);

  // Client-side filter
  const filtered = products.filter((p) => {
    const matchCat = catFilter === 'All Products' || p.categoryName === catFilter;
    const q = search.toLowerCase();
    const matchSearch = !q || p.name.toLowerCase().includes(q) || (p.categoryName || '').toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  async function toggleFeatured(product) {
    setTogglingId(product.id);
    try {
      const res = await fetch(`${API_BASE}/products/${product.id}`, {
        method: 'PUT',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: !product.featured }),
      });
      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, featured: !p.featured } : p))
        );
      }
    } catch {}
    setTogglingId(null);
  }

  async function deleteProduct(product) {
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    setDeletingId(product.id);
    try {
      const res = await fetch(`${API_BASE}/products/${product.id}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== product.id));
      } else {
        alert('Failed to delete product. Please try again.');
      }
    } catch {
      alert('Network error. Please try again.');
    }
    setDeletingId(null);
  }

  const catList = ['All Products', ...categories.map((c) => c.name)];

  return (
    <div className="p-6 md:p-10 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="font-headline-md text-headline-md text-on-background">Product Management</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            View, edit, and manage your artisanal inventory.
            {!loading && <span className="ml-2 text-primary font-medium">({products.length} products)</span>}
          </p>
        </div>
        <Link
          to="/admin/add-product"
          className="bg-primary-container text-on-background font-label-md text-label-md py-3 px-6 rounded-lg hover:bg-primary hover:text-white transition-all duration-300 flex items-center gap-2 shadow-ambient"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add New Product
        </Link>
      </div>

      {/* Success toast */}
      {successMsg && (
        <div className="mb-4 flex items-center gap-2 text-primary font-body-md text-body-md bg-primary-container/40 px-4 py-3 rounded-lg border border-primary/20 animate-pulse">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          {successMsg}
        </div>
      )}

      {/* Search + Filter */}
      <div className="bg-surface-container-lowest rounded-lg p-4 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between shadow-ambient">
        <div className="relative w-full md:w-96">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full bg-surface border-b-2 border-outline-variant focus:border-primary pl-10 pr-4 py-2 font-body-md text-body-md text-on-surface focus:ring-0 outline-none transition-colors"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {catList.map((cat) => (
            <button
              key={cat}
              onClick={() => setCatFilter(cat)}
              className={`px-4 py-1.5 rounded-full font-label-sm text-label-sm transition-colors ${
                catFilter === cat
                  ? 'bg-primary-container text-on-background'
                  : 'border border-outline-variant text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-ambient overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4 animate-pulse">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-12 h-12 bg-surface-container rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-surface-container rounded w-1/3" />
                  <div className="h-3 bg-surface-container rounded w-1/4" />
                </div>
                <div className="h-4 bg-surface-container rounded w-20" />
                <div className="h-4 bg-surface-container rounded w-16" />
                <div className="h-4 bg-surface-container rounded w-20" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-on-surface-variant font-body-md text-body-md">
            <span className="material-symbols-outlined text-6xl text-outline/30 block mb-4">inventory_2</span>
            {search || catFilter !== 'All Products'
              ? 'No products match your search.'
              : 'No products yet. Add your first product!'}
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-outline-variant bg-surface-container-low">
                    {['Product', 'Category', 'Price', 'Stock', 'Featured', 'Actions'].map((h) => (
                      <th key={h} className={`p-4 font-label-md text-label-md text-on-surface-variant ${h === 'Actions' ? 'text-right' : ''}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {filtered.map((p) => (
                    <tr key={p.id} className="hover:bg-surface-container-low transition-colors group">
                      <td className="p-4">
                        <div
                          onClick={() => navigate(`/admin/edit-product/${p.id}`)}
                          className="flex items-center gap-3 cursor-pointer group/item"
                          title="Click to view & edit product details"
                        >
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-surface-container flex-shrink-0 border border-outline-variant/30 group-hover/item:border-primary/50 transition-all">
                            {p.image ? (
                              <img src={imgUrl(p.image)} alt={p.name} className="w-full h-full object-cover group-hover/item:scale-105 transition-transform" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="material-symbols-outlined text-outline/40 text-[20px]">image</span>
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-title-sm text-title-sm text-on-surface group-hover/item:text-primary font-medium transition-colors">
                              {p.name}
                            </p>
                            <p className="font-label-sm text-label-sm text-on-surface-variant">{p.categoryName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-3 py-1 rounded-full bg-primary-container text-on-background font-label-sm text-label-sm">
                          {p.categoryName}
                        </span>
                      </td>
                      <td className="p-4 font-body-md text-body-md text-on-surface">
                        Rs. {Number(p.price).toLocaleString()}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${p.stock === 0 ? 'bg-error' : p.stock < 5 ? 'bg-tertiary' : 'bg-secondary'}`} />
                          <span className="font-body-md text-body-md text-on-surface">
                            {p.stock === 0 ? 'Out of Stock' : `${p.stock} units`}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => toggleFeatured(p)}
                          disabled={togglingId === p.id}
                          className={`font-label-sm text-label-sm px-3 py-1 rounded-full transition-colors disabled:opacity-50 ${
                            p.featured
                              ? 'bg-secondary-container text-secondary'
                              : 'bg-surface-container text-on-surface-variant hover:bg-secondary-container/50'
                          }`}
                        >
                          {togglingId === p.id ? '…' : p.featured ? '★ Featured' : 'Feature'}
                        </button>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => navigate(`/admin/edit-product/${p.id}`)}
                            className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-lg transition-colors flex items-center gap-1 font-label-sm text-xs cursor-pointer"
                            title="View & Edit product"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <a
                            href={`/product/${p.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-lg transition-colors cursor-pointer"
                            title="Preview on shop page"
                          >
                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                          </a>
                          <button
                            onClick={() => deleteProduct(p)}
                            disabled={deletingId === p.id}
                            className="p-2 text-on-surface-variant hover:text-error hover:bg-error-container/30 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                            title="Delete product"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              {deletingId === p.id ? 'hourglass_empty' : 'delete'}
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-outline-variant">
              {filtered.map((p) => (
                <div key={p.id} className="p-4 flex items-center gap-4">
                  <div
                    onClick={() => navigate(`/admin/edit-product/${p.id}`)}
                    className="w-16 h-16 rounded-lg overflow-hidden bg-surface-container flex-shrink-0 cursor-pointer"
                  >
                    {p.image ? (
                      <img src={imgUrl(p.image)} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-outline/40">image</span>
                      </div>
                    )}
                  </div>
                  <div
                    onClick={() => navigate(`/admin/edit-product/${p.id}`)}
                    className="flex-grow min-w-0 cursor-pointer"
                  >
                    <p className="font-title-sm text-title-sm text-on-surface truncate hover:text-primary transition-colors">{p.name}</p>
                    <p className="font-body-md text-body-md text-on-surface-variant">
                      Rs. {Number(p.price).toLocaleString()} · {p.stock === 0 ? 'Out of Stock' : `${p.stock} units`}
                    </p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-primary-container text-on-background font-label-sm text-[11px]">
                      {p.categoryName}
                    </span>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => navigate(`/admin/edit-product/${p.id}`)}
                      className="p-2 text-primary hover:bg-surface-container rounded-lg"
                      title="Edit product"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    <button
                      onClick={() => deleteProduct(p)}
                      disabled={deletingId === p.id}
                      className="p-2 text-error hover:bg-error-container/30 rounded-lg disabled:opacity-50"
                      title="Delete product"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {deletingId === p.id ? 'hourglass_empty' : 'delete'}
                      </span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
