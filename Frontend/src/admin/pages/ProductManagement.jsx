import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ConfirmModal from '../../components/ConfirmModal';
import toast from 'react-hot-toast';

const API_BASE = 'http://localhost:5050/api';

function imgUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  if (path.startsWith('/uploads')) return `http://localhost:5050${path}`;
  return path;
}

export default function ProductManagement() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const authHeaders = { Authorization: `Bearer ${token}` };

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [catFilter, setCatFilter] = useState('All Products');
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [selectedKeyProduct, setSelectedKeyProduct] = useState(null);
  const [productKeys, setProductKeys] = useState([]);
  const [loadingKeys, setLoadingKeys] = useState(false);
  const [newKeysText, setNewKeysText] = useState('');
  const [addingKeys, setAddingKeys] = useState(false);
  const [activeTab, setActiveTab] = useState('add'); // 'add' | 'list'
  const [fallbackKey, setFallbackKey] = useState('');
  const [savingFallback, setSavingFallback] = useState(false);

  const fetchProducts = useCallback(() => {
    setLoading(true);
    fetch(`${API_BASE}/products`, { headers: authHeaders })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setProducts(data);
      })
      .catch(() => {
        toast.error('Failed to load products list.');
      })
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
    const matchSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      (p.categoryName || '').toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  const fetchKeys = useCallback((productId) => {
    setLoadingKeys(true);
    fetch(`${API_BASE}/products/${productId}/keys`, { headers: authHeaders })
      .then((r) => r.json())
      .then((data) => {
        if (data.keys) setProductKeys(data.keys);
      })
      .catch(() => {
        toast.error('Failed to load key pool.');
      })
      .finally(() => setLoadingKeys(false));
  }, [token]);

  function openLicenseModal(product) {
    setSelectedKeyProduct(product);
    setNewKeysText('');
    setFallbackKey(product.licenseKey || '');
    setActiveTab('add');
    fetchKeys(product.id);
  }

  async function handleAddBatchKeys() {
    if (!selectedKeyProduct || !newKeysText.trim()) return;
    setAddingKeys(true);
    const toastId = toast.loading('Adding license keys to pool...');
    try {
      const res = await fetch(`${API_BASE}/products/${selectedKeyProduct.id}/keys`, {
        method: 'POST',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: newKeysText }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || 'Keys added to pool successfully!', { id: toastId });
        setProductKeys(data.keys || []);
        setNewKeysText('');
        setActiveTab('list');
        // Update product keys list in local state without touching product availability stock status
        setProducts((prev) =>
          prev.map((p) => (p.id === selectedKeyProduct.id ? { ...p, keys: data.keys } : p))
        );
      } else {
        toast.error(data.error || 'Failed to add keys.', { id: toastId });
      }
    } catch {
      toast.error('Network error adding keys.', { id: toastId });
    } finally {
      setAddingKeys(false);
    }
  }

  async function handleDeleteKey(keyId) {
    if (!selectedKeyProduct) return;
    const toastId = toast.loading('Deleting key...');
    try {
      const res = await fetch(`${API_BASE}/products/${selectedKeyProduct.id}/keys/${keyId}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Key deleted from pool.', { id: toastId });
        setProductKeys((prev) => prev.filter((k) => k.id !== keyId));
        // Update product keys list in local state without touching product availability stock status
        setProducts((prev) =>
          prev.map((p) =>
            p.id === selectedKeyProduct.id
              ? { ...p, keys: (p.keys || []).filter((k) => k.id !== keyId) }
              : p
          )
        );
      } else {
        toast.error(data.error || 'Failed to delete key.', { id: toastId });
      }
    } catch {
      toast.error('Network error deleting key.', { id: toastId });
    }
  }

  async function saveFallbackKey() {
    if (!selectedKeyProduct) return;
    setSavingFallback(true);
    const toastId = toast.loading('Saving default fallback key...');
    try {
      const res = await fetch(`${API_BASE}/products/${selectedKeyProduct.id}`, {
        method: 'PUT',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ licenseKey: fallbackKey.trim() || null }),
      });
      if (res.ok) {
        const updated = fallbackKey.trim() || null;
        setProducts((prev) =>
          prev.map((p) => (p.id === selectedKeyProduct.id ? { ...p, licenseKey: updated } : p))
        );
        toast.success('Fallback key updated!', { id: toastId });
      } else {
        toast.error('Failed to update fallback key.', { id: toastId });
      }
    } catch {
      toast.error('Network error saving fallback key.', { id: toastId });
    } finally {
      setSavingFallback(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const toastId = toast.loading(`Deleting "${deleteTarget.name}"...`);
    try {
      const res = await fetch(`${API_BASE}/products/${deleteTarget.id}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
        toast.success(`"${deleteTarget.name}" has been deleted.`, { id: toastId });
        setDeleteTarget(null);
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || 'Failed to delete product. Please try again.', { id: toastId });
      }
    } catch {
      toast.error('Network error deleting product.', { id: toastId });
    } finally {
      setDeleting(false);
    }
  }

  const toggleProductAvailability = async (product) => {
    const isCurrentlyAvailable = product.stock > 0;
    const newStock = isCurrentlyAvailable ? 0 : 10;
    try {
      const res = await fetch(`${API_BASE}/products/${product.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ stock: newStock }),
      });
      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, stock: newStock } : p))
        );
        toast.success(
          newStock > 0
            ? `"${product.name}" marked as Available (In Stock)`
            : `"${product.name}" marked as Out of Stock`
        );
      } else {
        toast.error('Failed to update product status');
      }
    } catch {
      toast.error('Error updating product availability');
    }
  };

  const catList = ['All Products', ...categories.map((c) => c.name)];

  return (
    <div className="p-6 md:p-10 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="font-headline-md text-headline-md text-on-background">
            Product Management
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            View, edit, and manage your digital product catalog.
            {!loading && (
              <span className="ml-2 text-primary font-medium">
                ({products.length} products)
              </span>
            )}
          </p>
        </div>
        <Link
          to="/admin/add-product"
          className="bg-primary text-white font-label-md text-label-md py-3 px-6 rounded-lg hover:bg-primary hover:text-white transition-all duration-300 flex items-center gap-2 shadow-ambient font-bold"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add New Product
        </Link>
      </div>

      {/* Search + Filter */}
      <div className="bg-surface-container-lowest rounded-lg p-4 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between shadow-ambient border border-outline-variant/30">
        <div className="relative w-full md:w-96">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full bg-surface border-b-2 border-outline-variant focus:border-primary pl-10 pr-4 py-2 font-body-md text-body-md text-on-surface focus:ring-0 outline-none transition-colors"
          />
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          {catList.map((cat) => (
            <button
              key={cat}
              onClick={() => setCatFilter(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                catFilter === cat
                  ? 'bg-primary text-white font-bold shadow-xs'
                  : 'border border-outline-variant/60 text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-ambient overflow-hidden border border-outline-variant/30">
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
            <span className="material-symbols-outlined text-6xl text-outline/30 block mb-4">
              inventory_2
            </span>
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
                  <tr className="border-b border-outline-variant/30 bg-surface-container-low">
                    {[
                      'Product',
                      'Category',
                      'Price',
                      'Stock',
                      'License Key',
                      'Actions',
                    ].map((h) => (
                      <th
                        key={h}
                        className={`p-3.5 px-4 font-label-md text-xs font-bold text-on-surface-variant uppercase tracking-wider whitespace-nowrap ${h === 'Actions' ? 'text-right' : ''}`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20 font-body-md text-on-surface">
                  {filtered.map((p) => (
                    <tr
                      key={p.id}
                      className="hover:bg-surface-container-low transition-colors group"
                    >
                      <td className="p-3.5 px-4">
                        <div
                          onClick={() => navigate(`/admin/edit-product/${p.id}`)}
                          className="flex items-center gap-3 cursor-pointer group/item"
                          title="Click to view & edit product details"
                        >
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-surface-container flex-shrink-0 border border-outline-variant/30 group-hover/item:border-primary/50 transition-all">
                            {p.image ? (
                              <img
                                src={imgUrl(p.image)}
                                alt={p.name}
                                className="w-full h-full object-cover group-hover/item:scale-105 transition-transform"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="material-symbols-outlined text-outline/40 text-[20px]">
                                  image
                                </span>
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-on-surface group-hover/item:text-primary transition-colors leading-snug">
                              {p.name}
                            </p>
                            <p className="text-xs text-on-surface-variant/80 mt-0.5 whitespace-nowrap">
                              {p.categoryName || p.category}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 px-4 whitespace-nowrap">
                        <span className="px-3 py-1 rounded-full bg-primary-container/80 text-on-background text-xs font-bold whitespace-nowrap inline-block">
                          {p.categoryName || p.category}
                        </span>
                      </td>
                      <td className="p-3.5 px-4 whitespace-nowrap text-sm font-bold text-on-surface">
                        Rs. {Number(p.price).toLocaleString()}
                      </td>
                      <td className="p-3.5 px-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleProductAvailability(p)}
                          className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border shadow-2xs ${
                            p.stock > 0
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 hover:bg-emerald-200'
                              : 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border-red-300 dark:border-red-700 hover:bg-red-200'
                          }`}
                          title="Click to toggle Available / Out of Stock"
                        >
                          <span className={`w-2 h-2 rounded-full ${p.stock > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                          {p.stock > 0 ? 'In Stock' : 'Out of Stock'}
                        </button>
                      </td>
                      <td className="p-3.5 px-4 whitespace-nowrap">
                        <button
                          onClick={() => openLicenseModal(p)}
                          className={`text-xs px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap font-medium ${
                            p.keys && p.keys.filter((k) => !k.isUsed).length > 0
                              ? 'bg-secondary-container/50 text-secondary border border-secondary/40 font-mono font-bold hover:bg-secondary-container shadow-2xs'
                              : p.licenseKey
                              ? 'bg-primary-container/40 text-primary border border-primary/30 font-mono font-bold hover:bg-primary-container/70 shadow-2xs'
                              : 'bg-surface-container text-on-surface-variant border border-outline-variant/60 hover:border-primary hover:text-primary'
                          }`}
                          title="Manage License Keys Pool"
                        >
                          <span className="material-symbols-outlined text-[16px]">vpn_key</span>
                          <span>
                            {p.keys && p.keys.filter((k) => !k.isUsed).length > 0
                              ? `${p.keys.filter((k) => !k.isUsed).length} Keys Avail.`
                              : p.licenseKey
                              ? 'Default Key'
                              : '+ Add Keys'}
                          </span>
                        </button>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            to={`/admin/edit-product/${p.id}`}
                            className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                            title="Edit product details"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              edit
                            </span>
                          </Link>
                          <a
                            href={`/product/${p.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-lg transition-colors cursor-pointer"
                            title="Preview on shop page"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              visibility
                            </span>
                          </a>
                          <button
                            onClick={() => setDeleteTarget(p)}
                            className="p-2 text-on-surface-variant hover:text-error hover:bg-error-container/30 rounded-lg transition-colors cursor-pointer"
                            title="Delete product"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              delete
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
            <div className="md:hidden divide-y divide-outline-variant/30">
              {filtered.map((p) => (
                <div key={p.id} className="p-4 flex items-center gap-4">
                  <div
                    onClick={() => navigate(`/admin/edit-product/${p.id}`)}
                    className="w-16 h-16 rounded-lg overflow-hidden bg-surface-container flex-shrink-0 cursor-pointer border border-outline-variant/30"
                  >
                    {p.image ? (
                      <img
                        src={imgUrl(p.image)}
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-outline/40">
                          image
                        </span>
                      </div>
                    )}
                  </div>
                  <div
                    onClick={() => navigate(`/admin/edit-product/${p.id}`)}
                    className="flex-grow min-w-0 cursor-pointer"
                  >
                    <p className="font-title-sm text-title-sm text-on-surface truncate hover:text-primary transition-colors font-bold">
                      {p.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-body-md text-xs font-bold text-on-surface">
                        Rs. {Number(p.price).toLocaleString()}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleProductAvailability(p);
                        }}
                        className={`px-2 py-0.5 rounded-full text-[11px] font-bold border inline-flex items-center gap-1 cursor-pointer ${
                          p.stock > 0
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300'
                            : 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border-red-300'
                        }`}
                        title="Click to toggle Available / Out of Stock"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${p.stock > 0 ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        {p.stock > 0 ? 'In Stock' : 'Out of Stock'}
                      </button>
                    </div>
                    <div className="mt-1 flex items-center gap-2 flex-wrap">
                      <span className="inline-block px-2 py-0.5 rounded-full bg-primary-container text-on-background font-label-sm text-[11px] font-bold">
                        {p.categoryName || p.category}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openLicenseModal(p);
                        }}
                        className="text-[11px] font-mono font-bold text-primary underline flex items-center gap-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[13px]">vpn_key</span>
                        {p.keys && p.keys.filter((k) => !k.isUsed).length > 0
                          ? `${p.keys.filter((k) => !k.isUsed).length} Keys Avail.`
                          : '+ Add Keys'}
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Link
                      to={`/admin/edit-product/${p.id}`}
                      className="p-2 text-primary hover:bg-surface-container rounded-lg"
                      title="Edit product"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        edit
                      </span>
                    </Link>
                    <button
                      onClick={() => setDeleteTarget(p)}
                      className="p-2 text-error hover:bg-error-container/30 rounded-lg cursor-pointer"
                      title="Delete product"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        delete
                      </span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Shared Confirmation Modal for Product Deletion */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Product"
        itemName={deleteTarget?.name}
        message={`Are you sure you want to permanently delete "${deleteTarget?.name}"? This action cannot be undone and will remove the item from your store catalog.`}
        confirmText="Delete Product"
        cancelText="Cancel"
        variant="danger"
        icon="delete_forever"
        loading={deleting}
        onConfirm={confirmDelete}
        onClose={() => { if (!deleting) setDeleteTarget(null); }}
      />

      {/* Modal for Managing Product License Key Pool */}
      {selectedKeyProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-container/50 text-primary flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[22px]">vpn_key</span>
                </div>
                <div>
                  <h3 className="font-title-sm text-title-sm text-on-surface font-bold">License Key Pool</h3>
                  <p className="text-xs text-on-surface-variant font-medium truncate max-w-[280px]">{selectedKeyProduct.name}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedKeyProduct(null)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Quick Stats Badges */}
            <div className="flex items-center gap-3 text-xs flex-shrink-0">
              <div className="flex-1 bg-secondary-container/40 border border-secondary/30 rounded-xl p-2.5 flex items-center justify-between">
                <span className="text-on-surface-variant font-medium">Available Keys</span>
                <span className="font-bold font-mono text-secondary text-sm">
                  {productKeys.filter((k) => !k.isUsed).length}
                </span>
              </div>
              <div className="flex-1 bg-surface-container border border-outline-variant/30 rounded-xl p-2.5 flex items-center justify-between">
                <span className="text-on-surface-variant font-medium">Assigned / Used</span>
                <span className="font-bold font-mono text-on-surface-variant text-sm">
                  {productKeys.filter((k) => k.isUsed).length}
                </span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-outline-variant/30 text-xs font-bold flex-shrink-0">
              <button
                onClick={() => setActiveTab('add')}
                className={`pb-2 px-4 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'add'
                    ? 'border-primary text-primary font-bold'
                    : 'border-transparent text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">add_box</span>
                Add Keys
              </button>
              <button
                onClick={() => setActiveTab('list')}
                className={`pb-2 px-4 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'list'
                    ? 'border-primary text-primary font-bold'
                    : 'border-transparent text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">list_alt</span>
                View All Keys ({productKeys.length})
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {activeTab === 'add' ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1">
                      Paste Multiple License Keys (One per line)
                    </label>
                    <textarea
                      rows={5}
                      value={newKeysText}
                      onChange={(e) => setNewKeysText(e.target.value)}
                      placeholder={`XXXXX-XXXXX-XXXXX-11111\nXXXXX-XXXXX-XXXXX-22222\nXXXXX-XXXXX-XXXXX-33333`}
                      className="w-full bg-surface-container-low border border-primary/40 rounded-xl p-3 font-mono text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all leading-relaxed"
                    />
                    <p className="text-[11px] text-on-surface-variant mt-1">
                      Paste multiple activation keys above. Each key will be automatically saved as a separate unique key and sent to individual customer orders!
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddBatchKeys}
                    disabled={addingKeys || !newKeysText.trim()}
                    className="w-full py-2.5 rounded-xl text-xs font-bold bg-primary text-white hover:bg-primary/90 shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[18px]">add_circle</span>
                    {addingKeys ? 'Saving Keys...' : 'Add Keys to Pool'}
                  </button>

                  <div className="pt-3 border-t border-outline-variant/30 space-y-2">
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                      Default Fallback Key (Optional)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={fallbackKey}
                        onChange={(e) => setFallbackKey(e.target.value)}
                        placeholder="Fallback key if key pool is empty"
                        className="flex-1 bg-surface-container-low border border-outline-variant/40 rounded-xl px-3 py-2 font-mono text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <button
                        type="button"
                        onClick={saveFallbackKey}
                        disabled={savingFallback}
                        className="px-3 py-2 rounded-xl text-xs font-bold bg-surface-container hover:bg-surface-container-high border border-outline-variant/40 text-on-surface cursor-pointer whitespace-nowrap"
                      >
                        {savingFallback ? 'Saving...' : 'Save Fallback'}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {loadingKeys ? (
                    <div className="p-6 text-center text-xs text-on-surface-variant">Loading keys pool...</div>
                  ) : productKeys.length === 0 ? (
                    <div className="p-6 text-center text-xs text-on-surface-variant">
                      No keys in pool yet. Switch to "Add Keys" tab to add keys!
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {productKeys.map((k, idx) => (
                        <div
                          key={k.id || idx}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/20 text-xs hover:border-outline-variant/50 transition-colors"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-mono font-bold text-on-surface text-xs select-all">
                              {k.key}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            {k.isUsed ? (
                              <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-mono text-[10px] font-bold">
                                USED / ASSIGNED
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-secondary-container/60 text-secondary font-mono text-[10px] font-bold flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                                AVAILABLE
                              </span>
                            )}
                            {!k.isUsed && (
                              <button
                                onClick={() => handleDeleteKey(k.id)}
                                className="text-on-surface-variant hover:text-error p-1 rounded transition-colors cursor-pointer"
                                title="Delete key"
                              >
                                <span className="material-symbols-outlined text-[16px]">delete</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end pt-2 border-t border-outline-variant/30 flex-shrink-0">
              <button
                type="button"
                onClick={() => setSelectedKeyProduct(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
