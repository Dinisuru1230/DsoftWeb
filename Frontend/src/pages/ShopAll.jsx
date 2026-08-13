import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';

const CATEGORIES = ['All Products', 'Bows & Ribbons', 'Scrunchies', 'Headbands', 'Ribbons', 'Accessories'];

const categoryIcons = {
  'All Products': 'grid_view',
  'Bows & Ribbons': 'style',
  'Scrunchies': 'auto_awesome',
  'Headbands': 'checkroom',
  'Ribbons': 'layers',
  'Accessories': 'straighten',
};

const PRODUCTS = [
  { id: 'blush-ribbon-bow', name: 'Blush Silk Ribbon Bow', price: 12.00, category: 'Bows & Ribbons', image: '/14_blush_silk_ribbon_bow.jpg', badge: 'Bestseller' },
  { id: 'pearl-scrunchie', name: 'Pearl Satin Scrunchie', price: 15.00, category: 'Scrunchies', image: '/18_silk_scrunchie.jpg' },
  { id: 'woven-headband', name: 'Woven Floral Headband', price: 22.00, category: 'Headbands', image: '/17_woven_floral_headband.jpg', badge: 'New' },
  { id: 'studio-ribbon', name: 'Artisan Silk Ribbon', price: 18.00, category: 'Ribbons', image: '/13_studio_table_ribbons.jpg' },
  { id: 'hair-bows-set', name: 'Handmade Hair Bows Set', price: 28.00, category: 'Bows & Ribbons', image: '/16_flat_lay_hair_bows.jpg', badge: 'Popular' },
  { id: 'boutique-gift-set', name: 'Boutique Gift Set', price: 45.00, category: 'Accessories', image: '/01_cream_linen_fabrics.jpg' },
  { id: 'loom-woven-headband', name: 'Loom-Woven Headband', price: 35.00, category: 'Headbands', image: '/02_handloom_weaving.jpg' },
  { id: 'olive-ribbon-bundle', name: 'Olive Ribbon Bundle', price: 24.00, category: 'Ribbons', image: '/03_olive_linen_ribbons.jpg' },
];

export default function ShopAll() {
  const [searchParams] = useSearchParams();
  const catParam = searchParams.get('cat');

  const initialCat = catParam
    ? CATEGORIES.find((c) => c.toLowerCase().replace(/[^a-z0-9]/g, '') === catParam.toLowerCase().replace(/[^a-z0-9]/g, '')) || 'All Products'
    : 'All Products';

  const [selectedCategory, setSelectedCategory] = useState(initialCat);
  const [priceRange, setPriceRange] = useState(200);
  const [sortBy, setSortBy] = useState('newest');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  let filtered = PRODUCTS.filter((p) => {
    const matchCat = selectedCategory === 'All Products' || p.category === selectedCategory;
    const matchPrice = p.price <= priceRange;
    return matchCat && matchPrice;
  });

  if (sortBy === 'price-asc') filtered.sort((a, b) => a.price - b.price);
  if (sortBy === 'price-desc') filtered.sort((a, b) => b.price - a.price);

  return (
    <main className="flex-grow w-full max-w-[1200px] mx-auto px-5 md:px-16 py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="font-headline-md-mobile md:font-headline-md text-headline-md-mobile md:text-headline-md text-on-background mb-2">
            All Collections
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Discover our complete range of handcrafted ribbons, bows, and silk accessories.
          </p>
        </div>
        <button
          onClick={() => setMobileFilterOpen(true)}
          className="md:hidden flex items-center justify-center gap-2 py-2.5 px-4 bg-primary-container text-on-background rounded-full font-label-md text-label-md"
        >
          <span className="material-symbols-outlined text-[18px]">tune</span> Filter & Sort
        </button>
      </div>

      <div className="flex gap-10">
        {/* ── Desktop Sidebar Filters ── */}
        <aside className="hidden md:block w-64 flex-shrink-0 space-y-8">
          {/* Categories */}
          <div>
            <h3 className="font-label-md text-label-md text-primary mb-3 font-bold">Category</h3>
            <div className="flex flex-col gap-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex items-center gap-3 p-2.5 font-label-md text-label-md rounded-lg text-left transition-colors ${
                    selectedCategory === cat
                      ? 'text-primary font-bold bg-primary-container/40'
                      : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {categoryIcons[cat] || 'category'}
                  </span>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="pt-4 border-t border-outline-variant/40">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-label-md text-label-md text-primary font-bold">Price Range</h3>
              <span className="font-label-sm text-label-sm text-on-surface-variant font-bold">${priceRange}</span>
            </div>
            <div className="flex justify-between text-xs text-outline mb-1 font-body-md">
              <span>$0</span>
              <span>$200</span>
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

          {/* Sort By Dropdown (Editorial Styled) */}
          <div className="pt-4 border-t border-outline-variant/40">
            <h3 className="font-label-md text-label-md text-primary mb-3 font-bold">Sort By</h3>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-transparent border-0 border-b-2 border-outline-variant focus:border-primary outline-none py-2 pr-8 font-body-md text-body-md text-on-surface appearance-none cursor-pointer transition-colors"
              >
                <option value="newest" className="bg-surface-container-lowest text-on-surface py-2">Newest First</option>
                <option value="price-asc" className="bg-surface-container-lowest text-on-surface py-2">Price: Low to High</option>
                <option value="price-desc" className="bg-surface-container-lowest text-on-surface py-2">Price: High to Low</option>
              </select>
              <span className="material-symbols-outlined absolute right-0 top-1/2 -translate-y-1/2 text-primary pointer-events-none text-[20px]">
                unfold_more
              </span>
            </div>
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
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full bg-transparent border-0 border-b-2 border-outline-variant focus:border-primary outline-none py-2 pr-8 font-body-md text-body-md text-on-surface appearance-none cursor-pointer transition-colors"
                    >
                      <option value="newest" className="bg-surface-container-lowest text-on-surface py-2">Newest First</option>
                      <option value="price-asc" className="bg-surface-container-lowest text-on-surface py-2">Price: Low to High</option>
                      <option value="price-desc" className="bg-surface-container-lowest text-on-surface py-2">Price: High to Low</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-0 top-1/2 -translate-y-1/2 text-primary pointer-events-none text-[20px]">
                      unfold_more
                    </span>
                  </div>
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

        {/* ── Main Product Grid ── */}
        <div className="flex-grow">
          {filtered.length === 0 ? (
            <div className="text-center py-16 bg-surface-container-low rounded-2xl">
              <span className="material-symbols-outlined text-4xl text-outline mb-2">search_off</span>
              <p className="font-title-sm text-title-sm text-on-surface">No products found</p>
              <p className="font-body-md text-body-md text-on-surface-variant mb-4">Try adjusting your filters or price range.</p>
              <button
                onClick={() => { setSelectedCategory('All Products'); setPriceRange(200); }}
                className="px-6 py-2 bg-primary-container text-on-background rounded-full font-label-md text-label-md"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
