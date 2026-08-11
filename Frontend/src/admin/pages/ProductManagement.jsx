import { useState } from 'react';
import { Link } from 'react-router-dom';

const PRODUCTS = [
  { id: 1, name: 'Blush Silk Ribbon Bow', sku: 'RB-001', category: 'Bows', price: 12.00, stock: 48, image: '/14_blush_silk_ribbon_bow.jpg', featured: true },
  { id: 2, name: 'Pearl Satin Scrunchie', sku: 'SC-002', category: 'Scrunchies', price: 15.00, stock: 32, image: '/18_silk_scrunchie.jpg', featured: false },
  { id: 3, name: 'Woven Floral Headband', sku: 'HB-003', category: 'Headbands', price: 22.00, stock: 4, image: '/17_woven_floral_headband.jpg', featured: true },
  { id: 4, name: 'Handmade Hair Bows Set', sku: 'HB-004', category: 'Bows', price: 28.00, stock: 20, image: '/16_flat_lay_hair_bows.jpg', featured: false },
  { id: 5, name: 'Artisan Silk Ribbon', sku: 'RB-005', category: 'Ribbons', price: 18.00, stock: 0, image: '/13_studio_table_ribbons.jpg', featured: false },
  { id: 6, name: 'Cream Linen Bow', sku: 'RB-006', category: 'Bows', price: 14.00, stock: 15, image: '/01_cream_linen_fabrics.jpg', featured: false },
];

const CATS = ['All Products', 'Bows', 'Scrunchies', 'Headbands', 'Ribbons'];

export default function ProductManagement() {
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All Products');
  const [products, setProducts] = useState(PRODUCTS);

  const filtered = products.filter((p) =>
    (catFilter === 'All Products' || p.category === catFilter) &&
    (p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()))
  );

  function toggleFeatured(id) {
    setProducts((prev) => prev.map((p) => p.id === id ? { ...p, featured: !p.featured } : p));
  }

  function deleteProduct(id) {
    if (confirm('Delete this product?')) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
  }

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
          className="bg-primary-container text-on-background font-label-md text-label-md py-3 px-6 rounded-lg hover:bg-primary hover:text-white transition-all duration-300 flex items-center gap-2 shadow-ambient"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add New Product
        </Link>
      </div>

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
          {CATS.map((cat) => (
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
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container-low">
                {['Product', 'Category', 'Price', 'Stock', 'Featured', 'Actions'].map((h) => (
                  <th key={h} className={`p-4 font-label-md text-label-md text-on-surface-variant ${h === 'Actions' ? 'text-right' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-surface-container-low transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-surface-container flex-shrink-0">
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-title-sm text-title-sm text-on-surface group-hover:text-primary transition-colors">{p.name}</p>
                        <p className="font-label-sm text-label-sm text-on-surface-variant">SKU: {p.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-3 py-1 rounded-full bg-primary-container text-on-background font-label-sm text-label-sm">{p.category}</span>
                  </td>
                  <td className="p-4 font-body-md text-body-md text-on-surface">${p.price.toFixed(2)}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${p.stock === 0 ? 'bg-error' : p.stock < 5 ? 'bg-tertiary' : 'bg-secondary'}`} />
                      <span className="font-body-md text-body-md text-on-surface">{p.stock === 0 ? 'Out of Stock' : `${p.stock} units`}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => toggleFeatured(p.id)}
                      className={`font-label-sm text-label-sm px-3 py-1 rounded-full transition-colors ${
                        p.featured ? 'bg-secondary-container text-secondary' : 'bg-surface-container text-on-surface-variant hover:bg-secondary-container/50'
                      }`}
                    >
                      {p.featured ? '★ Featured' : 'Feature'}
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-lg transition-colors">
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button
                        onClick={() => deleteProduct(p.id)}
                        className="p-2 text-on-surface-variant hover:text-error hover:bg-error-container/30 rounded-lg transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
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
              <img src={p.image} alt={p.name} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
              <div className="flex-grow">
                <p className="font-title-sm text-title-sm text-on-surface">{p.name}</p>
                <p className="font-body-md text-body-md text-on-surface-variant">${p.price.toFixed(2)} · {p.stock} units</p>
              </div>
              <div className="flex gap-1">
                <button className="p-2 text-primary hover:bg-surface-container rounded-lg">
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                </button>
                <button onClick={() => deleteProduct(p.id)} className="p-2 text-error hover:bg-error-container/30 rounded-lg">
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
