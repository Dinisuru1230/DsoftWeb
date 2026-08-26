import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';

const API_BASE = 'http://localhost:5050/api';

// Helper: build image URL (handles /public/* and /uploads/*)
function imgUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  if (path.startsWith('/uploads')) return `http://localhost:5050${path}`;
  return path;
}

// ── Product Grid Skeleton ─────────────────────────────────────────
function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="animate-pulse flex flex-col rounded-lg overflow-hidden bg-surface-container-lowest">
          <div className="aspect-[4/5] bg-surface-container" />
          <div className="p-4 space-y-2">
            <div className="h-4 bg-surface-container rounded w-2/3 mx-auto" />
            <div className="h-4 bg-surface-container rounded w-1/2 mx-auto" />
            <div className="h-10 bg-surface-container rounded-full mt-3" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Standalone Sidebar Filters Component (Defined outside so input never loses focus) ──
function SidebarFilters({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  dbCategories,
  catLoading,
  priceRange,
  setPriceRange,
  sortBy,
  setSortBy,
}) {
  return (
    <div className="space-y-8">
      {/* Live Search Input Box */}
      <div>
        <h3 className="font-label-md text-label-md text-primary mb-2 font-bold">Search Catalog</h3>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Type to filter..."
            className="w-full bg-surface-container-low border border-outline-variant/50 focus:border-primary rounded-lg pl-9 pr-8 py-2 font-body-md text-sm outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-outline hover:text-primary cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">cancel</span>
            </button>
          )}
        </div>
      </div>

      {/* Categories from DB */}
      <div>
        <h3 className="font-label-md text-label-md text-primary mb-3 font-bold">Category</h3>
        <div className="flex flex-col gap-1">
          {/* All Products */}
          <button
            onClick={() => setSelectedCategory('All Products')}
            className={`flex items-center gap-3 p-2.5 font-label-md text-label-md rounded-lg text-left transition-colors cursor-pointer ${
              selectedCategory === 'All Products'
                ? 'text-primary font-bold bg-primary-container/40'
                : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">grid_view</span>
            All Products
          </button>
          {catLoading ? (
            <div className="flex items-center gap-2 p-2 text-on-surface-variant">
              <span className="material-symbols-outlined animate-spin text-[16px]">sync</span>
              <span className="text-xs font-label-md">Loading...</span>
            </div>
          ) : (
            dbCategories.map((cat) => {
              let displayIcon = cat.icon;
              if (!displayIcon || displayIcon === 'category' || displayIcon === 'auto_awesome' || displayIcon === 'style') {
                const lower = cat.name.toLowerCase();
                if (lower.includes('microsoft') || lower.includes('windows')) displayIcon = 'window';
                else if (lower.includes('office')) displayIcon = 'grid_view';
                else if (lower.includes('security') || lower.includes('antivirus')) displayIcon = 'shield';
                else if (lower.includes('key') || lower.includes('license')) displayIcon = 'vpn_key';
                else displayIcon = 'window';
              }
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`flex items-center gap-3 p-2.5 font-label-md text-label-md rounded-lg text-left transition-colors cursor-pointer ${
                    selectedCategory === cat.name
                      ? 'text-primary font-bold bg-primary-container/40'
                      : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">{displayIcon}</span>
                  {cat.name}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Price Range */}
      <div className="pt-4 border-t border-outline-variant/40">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-label-md text-label-md text-primary font-bold">Price Range</h3>
          <span className="font-label-sm text-label-sm text-on-surface-variant font-bold">
            Rs. {priceRange.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between text-xs text-outline mb-1 font-body-md">
          <span>Rs. 0</span>
          <span>Rs. 20,000</span>
        </div>
        <input
          type="range"
          min="0"
          max="20000"
          step="500"
          value={priceRange}
          onChange={(e) => setPriceRange(Number(e.target.value))}
          className="w-full accent-primary cursor-pointer"
        />
      </div>

      {/* Sort By */}
      <div className="pt-4 border-t border-outline-variant/40">
        <h3 className="font-label-md text-label-md text-primary font-bold mb-3">Sort By</h3>
        <div className="flex flex-col gap-1">
          {[
            { value: 'newest', label: 'Newest First' },
            { value: 'price-asc', label: 'Price: Low to High' },
            { value: 'price-desc', label: 'Price: High to Low' },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSortBy(opt.value)}
              className={`p-2.5 font-label-md text-label-md rounded-lg text-left transition-colors cursor-pointer ${
                sortBy === opt.value
                  ? 'text-primary font-bold bg-primary-container/40'
                  : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ShopAll() {
  const [searchParams] = useSearchParams();
  const catParam = searchParams.get('cat');
  const searchParam = searchParams.get('search') || '';

  // ── DB state ──
  const [dbCategories, setDbCategories] = useState([]);
  const [catLoading, setCatLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState(null);

  // ── Filter state ──
  const [selectedCategory, setSelectedCategory] = useState('All Products');
  const [searchQuery, setSearchQuery] = useState(searchParam);
  const [priceRange, setPriceRange] = useState(20000);
  const [sortBy, setSortBy] = useState('newest');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // ── Load categories from DB ──
  useEffect(() => {
    fetch(`${API_BASE}/categories`)
      .then((r) => r.json())
      .then((data) => {
        if (data.categories) setDbCategories(data.categories);
      })
      .catch(() => {})
      .finally(() => setCatLoading(false));
  }, []);

  // ── Sync URL cat param once categories are loaded ──
  useEffect(() => {
    if (catParam && dbCategories.length > 0) {
      const match = dbCategories.find(
        (c) =>
          c.name.toLowerCase().replace(/[^a-z0-9]/g, '') ===
          catParam.toLowerCase().replace(/[^a-z0-9]/g, '')
      );
      if (match) setSelectedCategory(match.name);
    }
  }, [catParam, dbCategories]);

  useEffect(() => {
    if (searchParam !== undefined) setSearchQuery(searchParam);
  }, [searchParam]);

  // ── Fetch products from API whenever filters change ──
  const fetchProducts = useCallback(() => {
    setProductsLoading(true);
    setProductsError(null);

    const params = new URLSearchParams();
    if (selectedCategory !== 'All Products') params.set('category', selectedCategory);
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    if (priceRange < 20000) params.set('maxPrice', priceRange);
    if (sortBy !== 'newest') params.set('sort', sortBy);

    fetch(`${API_BASE}/products?${params.toString()}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setProducts(data);
        } else {
          setProducts([]);
        }
        setProductsLoading(false);
      })
      .catch((err) => {
        setProductsError(err.message);
        setProductsLoading(false);
      });
  }, [selectedCategory, searchQuery, priceRange, sortBy]);

  // Debounce product fetch when filters change
  useEffect(() => {
    const timer = setTimeout(fetchProducts, 300);
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  const filterProps = {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    dbCategories,
    catLoading,
    priceRange,
    setPriceRange,
    sortBy,
    setSortBy,
  };

  return (
    <main className="flex-grow w-full max-w-[1600px] mx-auto px-4 sm:px-8 md:px-12 py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl text-on-background mb-2 font-bold tracking-tight">
            Software Products
          </h1>
          <p className="font-body-md text-xs sm:text-sm text-on-surface-variant">
            Browse genuine operating system licenses, office suites, and security software with instant digital delivery.
          </p>
        </div>
        <button
          onClick={() => setMobileFilterOpen(true)}
          className="md:hidden flex items-center justify-center gap-2 py-2.5 px-4 bg-primary-container text-on-background rounded-full font-label-md text-label-md cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">tune</span> Filter &amp; Sort
        </button>
      </div>

      <div className="flex gap-8 lg:gap-12">
        {/* ── Desktop Sidebar ── */}
        <aside className="hidden md:block w-64 flex-shrink-0 sticky top-[100px] self-start max-h-[calc(100vh-120px)] overflow-y-auto pr-2">
          <SidebarFilters {...filterProps} />
        </aside>

        {/* ── Product Grid ── */}
        <section className="flex-grow min-w-0">
          {productsLoading ? (
            <GridSkeleton />
          ) : productsError ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-on-surface-variant">
              <span className="material-symbols-outlined text-6xl text-error/50">error</span>
              <p className="font-title-sm text-title-sm text-error">Failed to load products</p>
              <p className="font-body-md text-body-md">{productsError}</p>
              <button
                onClick={fetchProducts}
                className="mt-2 bg-primary-container text-on-background font-label-md px-6 py-3 rounded-full hover:bg-primary hover:text-white transition-all cursor-pointer"
              >
                Retry
              </button>
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-on-surface-variant">
              <span className="material-symbols-outlined text-6xl text-outline/50">search_off</span>
              <p className="font-title-sm text-title-sm">No products found</p>
              <p className="font-body-md text-body-md">Try adjusting your filters or search query.</p>
            </div>
          ) : (
            <>
              <p className="font-label-md text-label-md text-on-surface-variant mb-6">
                Showing <span className="text-primary font-bold">{products.length}</span> product{products.length !== 1 ? 's' : ''}
                {selectedCategory !== 'All Products' && ` in ${selectedCategory}`}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={{
                      ...product,
                      image: imgUrl(product.image),
                      hoverImage: imgUrl(product.hoverImage),
                      category: product.categoryName,
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </section>
      </div>

      {/* ── Mobile Filter Drawer ── */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-grow bg-black/40" onClick={() => setMobileFilterOpen(false)} />
          <div className="w-80 bg-surface-container-lowest shadow-2xl h-full overflow-y-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-title-sm text-title-sm text-primary font-bold">Filters &amp; Sort</h2>
              <button onClick={() => setMobileFilterOpen(false)} className="text-on-surface-variant hover:text-primary cursor-pointer">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <SidebarFilters {...filterProps} />
          </div>
        </div>
      )}
    </main>
  );
}
