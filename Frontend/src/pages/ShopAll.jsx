import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';

const ALL_PRODUCTS = [
  { id: 'blush-ribbon-bow', name: 'Blush Silk Ribbon Bow', price: 12.00, category: 'Bows', image: '/14_blush_silk_ribbon_bow.jpg', hoverImage: '/15_blush_silk_ribbon_close_up.jpg', isNew: true },
  { id: 'pearl-scrunchie', name: 'Pearl Satin Scrunchie', price: 15.00, category: 'Scrunchies', image: '/18_silk_scrunchie.jpg', hoverImage: '/08_flat_lay_fabrics_ribbon.jpg' },
  { id: 'woven-headband', name: 'Woven Floral Headband', price: 22.00, category: 'Headbands', image: '/17_woven_floral_headband.jpg', hoverImage: '/02_woman_floral_headband.jpg' },
  { id: 'hair-bows-set', name: 'Handmade Hair Bows Set', price: 28.00, category: 'Bows', image: '/16_flat_lay_hair_bows.jpg', hoverImage: '/20_flat_lay_ribbon_jasmine.jpg', isNew: true },
  { id: 'studio-ribbon', name: 'Artisan Silk Ribbon', price: 18.00, category: 'Ribbons', image: '/13_studio_table_ribbons.jpg', hoverImage: '/08_flat_lay_fabrics_ribbon.jpg' },
  { id: 'cream-linen-bow', name: 'Cream Linen Bow', price: 14.00, category: 'Bows', image: '/01_cream_linen_fabrics.jpg', hoverImage: '/04_cream_linen_fabrics_alt.jpg' },
  { id: 'flat-lay-set', name: 'Boutique Gift Set', price: 45.00, category: 'Accessories', image: '/12_flat_lay_tactile_textures.jpg', hoverImage: '/20_flat_lay_ribbon_jasmine.jpg', badge: 'Gift' },
  { id: 'studio-loom', name: 'Loom-Woven Headband', price: 35.00, category: 'Headbands', image: '/05_artisanal_weaving_loom.jpg', hoverImage: '/09_artisanal_weaving_loom_alt.jpg' },
];

const CATEGORIES = ['All Products', 'Bows', 'Scrunchies', 'Headbands', 'Ribbons', 'Accessories'];

export default function ShopAll() {
  const [searchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get('cat') ? 
      CATEGORIES.find(c => c.toLowerCase().includes(searchParams.get('cat'))) || 'All Products' 
      : 'All Products'
  );
  const [priceRange, setPriceRange] = useState(200);
  const [sortBy, setSortBy] = useState('newest');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const filtered = ALL_PRODUCTS
    .filter((p) => selectedCategory === 'All Products' || p.category === selectedCategory)
    .filter((p) => p.price <= priceRange)
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      return 0;
    });

  const categoryIcons = {
    'All Products': 'grid_view',
    'Bows': 'auto_awesome',
    'Scrunchies': 'layers',
    'Headbands': 'favorite',
    'Ribbons': 'style',
    'Accessories': 'checkroom',
  };

  return (
    <main className="flex-grow flex flex-col md:flex-row w-full max-w-[1400px] mx-auto px-4 sm:px-8 md:px-12 py-8 md:py-12 gap-8">
      {/* ── Sidebar Filters (Desktop) ── */}
      <aside className="hidden md:flex flex-col bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-ambient p-6 space-y-6 flex-shrink-0 w-64 self-start sticky top-24">
        <div>
          <h2 className="font-title-sm text-title-sm text-primary mb-1">Categories</h2>
          <p className="font-label-sm text-label-sm text-on-surface-variant">Filter by style</p>
        </div>
        <nav className="flex flex-col gap-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex items-center gap-3 p-3 font-label-md text-label-md rounded-lg hover:translate-x-1 transition-all duration-200 text-left ${
                selectedCategory === cat
                  ? 'text-primary font-bold bg-primary-container'
                  : 'text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              <span className="material-symbols-outlined">{categoryIcons[cat] || 'category'}</span>
              {cat}
            </button>
          ))}
        </nav>

        {/* Price Range */}
        <div className="pt-6 border-t border-outline-variant/40">
          <h3 className="font-label-md text-label-md text-primary mb-4 font-bold">Price Range</h3>
          <div className="flex justify-between text-sm text-on-surface-variant mb-2">
            <span>$0</span>
            <span>${priceRange}</span>
          </div>
          <input
            type="range"
            min="0"
            max="200"
            value={priceRange}
            onChange={(e) => setPriceRange(Number(e.target.value))}
            className="w-full accent-primary cursor-pointer"
          />
        </div>

        {/* Sort */}
        <div className="pt-4 border-t border-outline-variant/40">
          <h3 className="font-label-md text-label-md text-primary mb-3 font-bold">Sort By</h3>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full border border-outline-variant rounded-lg px-3 py-2 font-body-md text-body-md text-on-surface bg-surface-container-lowest cursor-pointer outline-none focus:border-primary"
          >
            <option value="newest">Newest First</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </aside>

      {/* ── Mobile Filter Modal/Drawer ── */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-end md:hidden">
          <div className="bg-background w-80 h-full p-6 overflow-y-auto space-y-6 flex flex-col justify-between shadow-2xl">
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-outline-variant/40 pb-4">
                <h2 className="font-title-sm text-title-sm text-primary">Filters</h2>
                <button onClick={() => setMobileFilterOpen(false)} className="text-on-surface-variant p-1">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {/* Categories */}
              <div>
                <h3 className="font-label-md text-label-md text-primary mb-2 font-bold">Category</h3>
                <div className="flex flex-col gap-1">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => { setSelectedCategory(cat); setMobileFilterOpen(false); }}
                      className={`flex items-center gap-3 p-2.5 font-label-md text-label-md rounded-lg text-left ${
                        selectedCategory === cat ? 'text-primary font-bold bg-primary-container' : 'text-on-surface-variant'
                      }`}
                    >
                      <span className="material-symbols-outlined">{categoryIcons[cat] || 'category'}</span>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className="pt-4 border-t border-outline-variant/40">
                <h3 className="font-label-md text-label-md text-primary mb-2 font-bold">Max Price: ${priceRange}</h3>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              {/* Sort */}
              <div className="pt-4 border-t border-outline-variant/40">
                <h3 className="font-label-md text-label-md text-primary mb-2 font-bold">Sort By</h3>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full border border-outline-variant rounded-lg p-2 font-body-md text-body-md"
                >
                  <option value="newest">Newest First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => setMobileFilterOpen(false)}
              className="w-full bg-primary-container text-on-background py-3 rounded-full font-label-md text-label-md"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* ── Product Grid Content ── */}
      <section className="flex-grow">
        {/* Mobile Header + Filter Toggle */}
        <div className="md:hidden flex justify-between items-center mb-6 pb-4 border-b border-outline-variant/40">
          <div>
            <h1 className="font-headline-md-mobile text-headline-md-mobile text-primary">Shop All</h1>
            <p className="font-label-sm text-label-sm text-on-surface-variant">{filtered.length} items</p>
          </div>
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="flex items-center gap-2 text-primary border border-primary px-4 py-2 rounded-full font-label-md text-label-md hover:bg-primary-container/30 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">tune</span>
            Filters
          </button>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:flex justify-between items-end mb-8 border-b border-outline-variant/30 pb-4">
          <div>
            <h1 className="font-headline-md text-headline-md text-primary">Curated Collection</h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">Handcrafted accessories tailored to your style.</p>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant font-medium">Showing {filtered.length} products</p>
        </div>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-surface-container-lowest rounded-xl shadow-ambient">
            <span className="material-symbols-outlined text-6xl text-outline mb-4 block">search_off</span>
            <p className="font-body-lg text-body-lg text-on-surface-variant">No products found matching your filters.</p>
            <button
              onClick={() => { setSelectedCategory('All Products'); setPriceRange(200); }}
              className="mt-4 font-label-md text-label-md text-primary underline underline-offset-4"
            >
              Reset Filters
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
