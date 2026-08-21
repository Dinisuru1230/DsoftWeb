import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';

const API_BASE = 'http://localhost:5050/api';

function imgUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  if (path.startsWith('/uploads')) return `http://localhost:5050${path}`;
  return path;
}

const CATEGORIES = [
  { label: 'Bows', image: '/14_blush_silk_ribbon_bow.jpg', filter: 'bows' },
  { label: 'Scrunchies', image: '/18_silk_scrunchie.jpg', filter: 'scrunchies' },
  { label: 'Headbands', image: '/17_woven_floral_headband.jpg', filter: 'headbands' },
  { label: 'Accessories', image: '/08_flat_lay_fabrics_ribbon.jpg', filter: 'accessories' },
];

export default function Home() {
  const [newArrivals, setNewArrivals] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);

  useEffect(() => {
    // Fetch latest 4 real products from DB (1 row of 4 items)
    fetch(`${API_BASE}/products?limit=4`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setNewArrivals(data);
      })
      .catch((err) => console.error('Failed to load new arrivals:', err))
      .finally(() => setProductsLoading(false));
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* ── Hero Section ── */}
      <section className="relative w-full min-h-[819px] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('/03_mediterranean_balcony.jpg')` }}
        >
          <div className="absolute inset-0 bg-background/40 backdrop-blur-[2px]" />
        </div>
        <div className="relative z-10 text-center px-5 md:px-16 max-w-3xl mx-auto flex flex-col items-center">
          <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-primary mb-4 drop-shadow-sm">
            Handmade Elegance <br />
            <span className="text-on-surface-variant italic font-light">& Everyday Magic</span>
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-16 max-w-xl">
            Discover delicate artisanal accessories crafted to elevate your everyday moments into cherished treasures.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center justify-center bg-primary-container text-on-background font-label-md text-label-md py-3 px-8 rounded-full hover:bg-primary hover:text-white transition-all duration-300 shadow-ambient hover-ambient"
          >
            Shop Collection
          </Link>
        </div>
      </section>

      {/* ── Featured Categories ── */}
      <section className="py-20 px-5 md:px-16 bg-surface-container-lowest">
        <div className="max-w-[1200px] mx-auto text-center">
          <h2 className="font-headline-md-mobile md:font-headline-md text-headline-md-mobile md:text-headline-md text-primary mb-8">
            Explore Our Craft
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 justify-items-center">
            {CATEGORIES.map((cat) => (
              <Link key={cat.label} to={`/shop?cat=${cat.filter}`} className="group flex flex-col items-center">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-surface-container overflow-hidden shadow-ambient group-hover:shadow-ambient-lg transition-all duration-300 mb-2 p-1">
                  <div
                    className="w-full h-full rounded-full bg-cover bg-center"
                    style={{ backgroundImage: `url('${cat.image}')` }}
                  />
                </div>
                <span className="font-label-md text-label-md text-on-surface-variant group-hover:text-primary transition-colors">
                  {cat.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── New Arrivals ── */}
      <section className="py-20 px-5 md:px-16 bg-background" id="new-arrivals">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex justify-between items-end mb-8">
            <h2 className="font-headline-md-mobile md:font-headline-md text-headline-md-mobile md:text-headline-md text-primary">
              New Arrivals
            </h2>
            <Link
              to="/shop"
              className="font-label-md text-label-md text-primary underline underline-offset-4 hover:text-on-surface-variant transition-colors hidden md:block"
            >
              View All
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {productsLoading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse flex flex-col rounded-lg overflow-hidden bg-surface-container-lowest">
                  <div className="aspect-[4/5] bg-surface-container" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-surface-container rounded w-2/3 mx-auto" />
                    <div className="h-4 bg-surface-container rounded w-1/2 mx-auto" />
                    <div className="h-10 bg-surface-container rounded-full mt-3" />
                  </div>
                </div>
              ))
            ) : newArrivals.length === 0 ? (
              <div className="col-span-full py-12 text-center text-on-surface-variant space-y-3">
                <span className="material-symbols-outlined text-4xl text-outline">inventory_2</span>
                <p className="font-title-sm text-on-surface font-semibold">New handcrafted designs arriving soon!</p>
                <Link to="/shop" className="inline-block text-xs text-primary font-bold hover:underline">
                  Browse All Collections &rarr;
                </Link>
              </div>
            ) : (
              newArrivals.map((product) => (
                <ProductCard
                  key={product.id}
                  product={{
                    ...product,
                    image: imgUrl(product.image),
                    hoverImage: imgUrl(product.hoverImage),
                    category: product.categoryName,
                  }}
                />
              ))
            )}
          </div>
          <div className="mt-8 text-center md:hidden">
            <Link
              to="/shop"
              className="font-label-md text-label-md text-primary underline underline-offset-4"
            >
              View All Arrivals
            </Link>
          </div>
        </div>
      </section>

      {/* ── Brand Story Banner ── */}
      <section className="relative py-20 px-5 md:px-16 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('/10_airy_artisanal_studio.jpg')` }}
        >
          <div className="absolute inset-0 bg-background/70" />
        </div>
        <div className="relative z-10 max-w-[1200px] mx-auto flex flex-col md:flex-row items-center gap-10">
          <div className="md:w-1/2">
            <h2 className="font-headline-md-mobile md:font-headline-md text-headline-md-mobile md:text-headline-md text-primary mb-4">
              Crafted with Love
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant mb-6">
              Every piece from Malmalee Creations is born from a passion for artisanal craft and a deep appreciation for the beauty found in everyday moments.
            </p>
            <Link
              to="/our-story"
              className="inline-flex items-center gap-2 font-label-md text-label-md text-primary border border-primary px-6 py-3 rounded-full hover:bg-primary hover:text-white transition-all duration-300"
            >
              Our Story
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </div>
          <div className="md:w-1/2">
            <img
              src="/05_artisanal_weaving_loom.jpg"
              alt="Artisanal weaving"
              className="w-full h-80 object-cover rounded-xl shadow-ambient"
            />
          </div>
        </div>
      </section>

      {/* ── Newsletter ── */}
      <section className="py-20 px-5 md:px-16 bg-primary-container/30 border-y border-outline-variant/30">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-title-sm text-title-sm text-primary mb-2">Join Our Journal</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mb-6">
            Receive updates on new collections and a touch of everyday magic in your inbox.
          </p>
          <form className="flex flex-col sm:flex-row gap-3 justify-center" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Your email address"
              className="bg-surface-container-lowest border-b-2 border-outline-variant focus:border-primary border-t-0 border-x-0 rounded-none px-4 py-2 font-body-md focus:ring-0 w-full sm:w-64 outline-none transition-colors"
            />
            <button
              type="submit"
              className="border border-primary text-primary font-label-md py-2 px-6 rounded-full hover:bg-primary hover:text-white transition-all duration-300"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
