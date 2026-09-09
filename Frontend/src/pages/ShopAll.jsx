import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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

function getCategoryIcon(catName, dbCategories) {
  const found = dbCategories.find(
    (c) => c.name.toLowerCase() === (catName || '').toLowerCase()
  );
  let displayIcon = found?.icon;
  if (!displayIcon || displayIcon === 'category' || displayIcon === 'auto_awesome' || displayIcon === 'style') {
    const lower = (catName || '').toLowerCase();
    if (lower.includes('microsoft') || lower.includes('windows')) displayIcon = 'window';
    else if (lower.includes('office')) displayIcon = 'grid_view';
    else if (lower.includes('security') || lower.includes('antivirus')) displayIcon = 'shield';
    else if (lower.includes('key') || lower.includes('license')) displayIcon = 'vpn_key';
    else displayIcon = 'folder_open';
  }
  return displayIcon;
}

// ── Category Row Slider Component for "All Products" view ──
function CategoryRowSlider({ catName, catProducts, getCategoryIcon, dbCategories, setSelectedCategory, imgUrl }) {
  const rowRef = useRef(null);

  const handleScroll = (direction) => {
    if (rowRef.current) {
      const scrollAmount = direction === 'left' ? -360 : 360;
      rowRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="space-y-4">
      {/* Category Header Row with Slider Navigation Buttons */}
      <div className="flex items-center justify-between pb-3 border-b-2 border-primary/20 gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
            <span className="material-symbols-outlined text-[20px]">
              {getCategoryIcon(catName, dbCategories)}
            </span>
          </div>
          <h2 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 tracking-tight truncate">
            {catName}
          </h2>
          <span className="bg-primary/10 text-primary border border-primary/20 text-xs font-extrabold px-2.5 py-0.5 rounded-full shrink-0">
            {catProducts.length} product{catProducts.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={() => setSelectedCategory(catName)}
            className="text-xs font-bold text-primary hover:text-blue-700 hover:underline flex items-center gap-1 cursor-pointer transition-colors"
          >
            View All <span className="hidden sm:inline">{catName}</span> <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </button>

          {/* Left & Right Slider Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleScroll('left')}
              className="w-8 h-8 rounded-full border border-slate-300 hover:bg-primary hover:border-primary hover:text-white text-slate-700 transition-colors flex items-center justify-center shadow-2xs cursor-pointer active:scale-95"
              title="Scroll left"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <button
              onClick={() => handleScroll('right')}
              className="w-8 h-8 rounded-full border border-slate-300 hover:bg-primary hover:border-primary hover:text-white text-slate-700 transition-colors flex items-center justify-center shadow-2xs cursor-pointer active:scale-95"
              title="Scroll right"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Slider Track (One Row) */}
      <div
        ref={rowRef}
        className="flex gap-4 md:gap-6 overflow-x-auto scroll-smooth pb-4 pt-1 [&::-webkit-scrollbar]:hidden select-none"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {catProducts.map((product) => (
          <div key={product.id} className="w-[230px] sm:w-[260px] md:w-[280px] shrink-0">
            <ProductCard
              product={{
                ...product,
                image: imgUrl(product.image),
                hoverImage: imgUrl(product.hoverImage),
                category: product.categoryName,
              }}
            />
          </div>
        ))}
      </div>
    </section>
  );
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

// ── Standalone Sidebar Filters Component ──
function SidebarFilters({
  selectedCategory,
  setSelectedCategory,
  dbCategories,
  catLoading,
  priceRange,
  setPriceRange,
}) {
  return (
    <div className="space-y-5 pb-4">



      {/* Categories from DB */}
      <div className="pt-2 border-t border-outline-variant/40">
        <h3 className="font-label-md text-label-md text-primary mb-3 font-bold flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[18px]">category</span>
          Categories
        </h3>
        <div className="flex flex-col gap-1">
          {/* All Products */}
          <button
            onClick={() => setSelectedCategory('All Products')}
            className={`flex items-center gap-3 p-2.5 font-label-md text-label-md rounded-lg text-left transition-colors cursor-pointer ${selectedCategory === 'All Products'
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
                  className={`flex items-center gap-3 p-2.5 font-label-md text-label-md rounded-lg text-left transition-colors cursor-pointer ${selectedCategory === cat.name
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
      <div className="pt-2 border-t border-outline-variant/40">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-label-md text-label-md text-primary font-bold flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px]">payments</span>
            Price Range
          </h3>
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
      .catch(() => { })
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
    if (selectedCategory !== 'All Products' && !searchQuery.trim()) {
      params.set('category', selectedCategory);
    }
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

  // ── Group products by Category for Line-by-Line Section Layout ──
  const groupedProducts = useMemo(() => {
    const map = {};
    products.forEach((prod) => {
      const cat = prod.categoryName || prod.category || 'General';
      if (!map[cat]) map[cat] = [];
      map[cat].push(prod);
    });
    return map;
  }, [products]);

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
        <aside
          className="hidden md:block w-64 flex-shrink-0 sticky top-[100px] self-start max-h-[calc(100vh-120px)] overflow-y-auto pr-2 [&::-webkit-scrollbar]:hidden select-none"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <SidebarFilters {...filterProps} />
        </aside>

        {/* ── Product Grid ── */}
        <section className="flex-grow min-w-0">
          {/* Top Bar Header Controls (Always mounted so Search Input NEVER loses focus while typing) */}
          <div className="flex flex-row items-center justify-between gap-4 mb-8 pb-3 border-b border-outline-variant/30">
            <p className="text-xs sm:text-sm font-semibold text-on-surface-variant">
              Showing <span className="text-primary font-extrabold">{products.length}</span> product{products.length !== 1 ? 's' : ''} across <span className="text-on-surface font-bold">{Object.keys(groupedProducts).length}</span> categor{Object.keys(groupedProducts).length !== 1 ? 'ies' : 'y'}
              {selectedCategory !== 'All Products' && (
                <span className="hidden sm:inline"> in <span className="text-on-surface font-bold">{selectedCategory}</span></span>
              )}
            </p>

            {/* Top Right Corner Controls: Search Box + Sort Dropdown */}
            <div className="flex flex-wrap items-center gap-3 shrink-0 ml-auto">
              {/* Top Right Search Input Box */}
              <div className="relative w-44 sm:w-64">
                <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-primary text-[18px]">
                  search
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full bg-surface-container-lowest border border-neutral-300 dark:border-outline-variant/60 rounded-lg pl-8 pr-7 py-1.5 text-xs font-semibold text-on-surface outline-none focus:border-primary transition-colors shadow-2xs"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-outline hover:text-primary cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[14px]">cancel</span>
                  </button>
                )}
              </div>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-on-surface-variant flex items-center gap-1">
                  <span className="material-symbols-outlined text-[18px] text-primary">swap_vert</span>
                  <span className="hidden sm:inline">Sort:</span>
                </span>
                <select
                  id="top-sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-surface-container-lowest border border-neutral-300 dark:border-outline-variant/60 rounded-lg px-3 py-1.5 text-xs font-bold text-on-surface outline-none focus:border-primary cursor-pointer shadow-xs transition-colors"
                >
                  <option value="newest">Newest First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>

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
              {selectedCategory === 'All Products' && !searchQuery.trim() ? (
                /* ── All Products View (Default): Category-by-Category Line Slider ── */
                <div className="space-y-12">
                  {Object.entries(groupedProducts).map(([catName, catProducts]) => (
                    <CategoryRowSlider
                      key={catName}
                      catName={catName}
                      catProducts={catProducts}
                      getCategoryIcon={getCategoryIcon}
                      dbCategories={dbCategories}
                      setSelectedCategory={setSelectedCategory}
                      imgUrl={imgUrl}
                    />
                  ))}
                </div>
              ) : (
                /* ── Specific Category Selected: Display without slider in multi-row grid ── */
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
              )}
            </>
          )}
        </section>
      </div>

      {/* ── Mobile Filter Drawer ── */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-grow bg-black/40" onClick={() => setMobileFilterOpen(false)} />
          <div
            className="w-80 bg-surface-container-lowest shadow-2xl h-full overflow-y-auto p-6 space-y-6 [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
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
