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

const SOLUTIONS_SERVICES = [
  {
    label: 'Windows OS Suites',
    subtext: 'Windows 10 / 11 Pro & Home',
    icon: 'window',
    gradient: 'from-blue-600 via-sky-500 to-indigo-600',
    shadow: 'shadow-blue-500/25 hover:shadow-blue-500/40',
    border: 'border-blue-200 dark:border-blue-900',
    link: '/shop?cat=windows',
    badge: 'Retail Keys',
  },
  {
    label: 'Office Suites',
    subtext: 'Office 2021 / 2024 Pro Plus',
    icon: 'apps',
    gradient: 'from-orange-500 via-red-500 to-amber-600',
    shadow: 'shadow-orange-500/25 hover:shadow-orange-500/40',
    border: 'border-orange-200 dark:border-orange-900',
    link: '/shop?cat=office',
    badge: 'Pro Plus',
  },
  {
    label: 'GetCID Free Service',
    subtext: 'Automated Phone Activation',
    icon: 'confirmation_number',
    gradient: 'from-emerald-500 via-teal-600 to-cyan-600',
    shadow: 'shadow-emerald-500/25 hover:shadow-emerald-500/40',
    border: 'border-emerald-200 dark:border-emerald-900',
    link: '/get-cid',
    badge: 'Free Tool',
  },
  {
    label: 'Security & Utilities',
    subtext: 'Antivirus & Developer Tools',
    icon: 'shield',
    gradient: 'from-purple-600 via-indigo-600 to-blue-700',
    shadow: 'shadow-purple-500/25 hover:shadow-purple-500/40',
    border: 'border-purple-200 dark:border-purple-900',
    link: '/shop?cat=security',
    badge: '2026 Ready',
  },
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
    <div className="flex flex-col min-h-screen bg-background text-on-background">
      {/* ── Modern Compact Light Hero Section ── */}
      <section className="relative w-full overflow-hidden bg-gradient-to-b from-slate-50 via-sky-50/50 to-white text-slate-900 py-8 sm:py-12 md:py-16 border-b border-slate-200/80">
        {/* Soft Background Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-sky-400/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-5 left-10 w-[350px] h-[350px] bg-orange-400/10 rounded-full blur-[110px] pointer-events-none" />

        {/* Background Grid */}
        <div
          className="absolute inset-0 opacity-40 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">

            {/* Left Column: Hero Text Content */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-5 text-center lg:text-left">

              {/* Tagline Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-slate-200/90 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs sm:text-sm font-bold tracking-wide text-slate-700">
                  Trusted Digital Software & License Platform
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight text-slate-900">
                Next-Gen Software &{' '}
                <span className="bg-gradient-to-r from-primary via-sky-600 to-orange-500 bg-clip-text text-transparent">
                  Digital Solutions
                </span>
              </h1>

              {/* Sub-headline Description */}
              <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
                Discover genuine software suites, authentic license keys, and premium digital solutions — engineered for seamless performance and instant delivery.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-1">
                <Link
                  to="/shop"
                  className="bg-primary hover:bg-primary/90 text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-md shadow-primary/20 hover:shadow-primary/35 transition-all duration-300 transform hover:-translate-y-0.5 flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
                  Explore Shop
                </Link>

                <Link
                  to="/shop?cat=windows"
                  className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition-all duration-300 flex items-center gap-2 shadow-xs hover:shadow-md"
                >
                  <span className="material-symbols-outlined text-sky-600 text-[18px]">window</span>
                  Windows Keys
                </Link>
              </div>

              {/* Trust Indicators Bar */}
              <div className="pt-4 border-t border-slate-200/80 grid grid-cols-3 gap-3 max-w-xl mx-auto lg:mx-0 text-center lg:text-left">
                <div>
                  <div className="text-lg sm:text-xl font-black text-slate-900">100%</div>
                  <div className="text-[11px] text-slate-500 font-semibold">Authentic Products</div>
                </div>
                <div>
                  <div className="text-lg sm:text-xl font-black text-emerald-600">Instant</div>
                  <div className="text-[11px] text-slate-500 font-semibold">Digital Delivery</div>
                </div>
                <div>
                  <div className="text-lg sm:text-xl font-black text-primary">24/7</div>
                  <div className="text-[11px] text-slate-500 font-semibold">Live Support</div>
                </div>
              </div>

            </div>

            {/* Right Column: Floating Light Tech Showcase Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xl shadow-slate-200/80 space-y-4">

                {/* Card Header Badge */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-xl">verified</span>
                    </div>
                    <div>
                      <div className="text-xs font-extrabold text-slate-900">DSoftPack Suite</div>
                      <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                        Verified Digital Store
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-semibold border border-slate-200">
                    v2.5 Live
                  </span>
                </div>

                {/* Feature Highlights Grid */}
                <div className="space-y-2.5">

                  {/* Item 1 */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between gap-3 hover:border-slate-300 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center">
                        <span className="material-symbols-outlined text-lg">key</span>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">Software License Keys</div>
                        <div className="text-[10px] text-slate-500">Genuine retail & volume product keys</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full">
                      Instant
                    </span>
                  </div>

                  {/* Item 2 */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between gap-3 hover:border-slate-300 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                        <span className="material-symbols-outlined text-lg">window</span>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">OS & Office Suites</div>
                        <div className="text-[10px] text-slate-500">Windows 10/11 & MS Office 2021/2024</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                      Original
                    </span>
                  </div>

                  {/* Item 3 */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between gap-3 hover:border-slate-300 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                        <span className="material-symbols-outlined text-lg">support_agent</span>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">Dedicated Support</div>
                        <div className="text-[10px] text-slate-500">24/7 technical customer support</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  </div>

                </div>

                {/* Quick Link Banner inside Card */}
                <Link
                  to="/shop"
                  className="block p-2.5 bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200 rounded-xl text-center hover:bg-sky-100/60 transition-colors"
                >
                  <span className="text-xs font-extrabold text-sky-800 flex items-center justify-center gap-1.5">
                    <span className="material-symbols-outlined text-xs text-sky-600">shopping_bag</span>
                    Browse Software Catalog &rarr;
                  </span>
                </Link>


              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Featured Solutions & Services ── */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 md:px-16 bg-gradient-to-b from-white via-slate-50/50 to-white dark:from-surface-container-lowest dark:to-surface-container-lowest border-b border-outline-variant/30 relative overflow-hidden">
        {/* Soft Background Orbs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-[1200px] mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-primary tracking-tight mb-2">
            Explore Solutions & Services
          </h2>
          <p className="text-xs sm:text-sm text-on-surface-variant max-w-xl mx-auto mb-10 font-medium leading-relaxed">
            Discover genuine software licenses, operating systems, antivirus security, and automated Microsoft CID activation tools.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 justify-items-center">
            {SOLUTIONS_SERVICES.map((cat) => (
              <Link
                key={cat.label}
                to={cat.link}
                className="group flex flex-col items-center w-full max-w-[220px] transition-all duration-300"
              >
                {/* Circle Container with Gradient & Icon */}
                <div className="relative mb-4">
                  {/* Glowing Ring Underneath */}
                  <div
                    className={`absolute -inset-1.5 rounded-full bg-gradient-to-r ${cat.gradient} opacity-0 group-hover:opacity-75 blur-md transition-all duration-500`}
                  />

                  {/* Main Circular Bubble */}
                  <div
                    className={`relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full bg-gradient-to-br ${cat.gradient} ${cat.shadow} border-4 border-white dark:border-slate-800 flex flex-col items-center justify-center text-white transition-all duration-500 transform group-hover:scale-105 group-hover:-translate-y-1 shadow-lg`}
                  >
                    <span className="material-symbols-outlined text-3xl sm:text-4xl md:text-5xl text-white drop-shadow-md group-hover:scale-110 transition-transform duration-300">
                      {cat.icon}
                    </span>
                    <span className="mt-1 text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full text-white border border-white/30">
                      {cat.badge}
                    </span>
                  </div>
                </div>

                {/* Label & Subtext */}
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-primary transition-colors text-center">
                  {cat.label}
                </h3>
                <span className="text-[11px] sm:text-xs text-on-surface-variant font-medium text-center mt-1 leading-snug">
                  {cat.subtext}
                </span>

                <span className="mt-2 text-[11px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-0.5">
                  Explore Now &rarr;
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>


      {/* ── New Arrivals ── */}
      <section className="py-10 sm:py-12 px-4 sm:px-6 md:px-16 bg-background" id="new-arrivals">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="font-headline-md-mobile md:font-headline-md text-headline-md-mobile md:text-headline-md text-primary">
                New Arrivals
              </h2>
              <p className="text-xs text-on-surface-variant font-medium mt-0.5">
                Explore our latest software releases and digital license additions
              </p>
            </div>
            <Link
              to="/shop"
              className="font-label-md text-xs sm:text-sm text-primary underline underline-offset-4 hover:text-on-surface-variant transition-colors hidden md:block"
            >
              View All
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            {productsLoading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse flex flex-col rounded-lg overflow-hidden bg-surface-container-lowest border border-outline-variant/30">
                  <div className="aspect-[4/5] bg-surface-container" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-surface-container rounded w-2/3 mx-auto" />
                    <div className="h-4 bg-surface-container rounded w-1/2 mx-auto" />
                    <div className="h-10 bg-surface-container rounded-full mt-3" />
                  </div>
                </div>
              ))
            ) : newArrivals.length === 0 ? (
              <div className="col-span-full py-10 text-center text-on-surface-variant space-y-2">
                <span className="material-symbols-outlined text-3xl text-outline">inventory_2</span>
                <p className="font-title-sm text-on-surface text-xs sm:text-sm font-semibold">New software products arriving soon!</p>
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
          <div className="mt-6 text-center md:hidden">
            <Link
              to="/shop"
              className="font-label-md text-xs text-primary underline underline-offset-4"
            >
              View All Arrivals
            </Link>
          </div>
        </div>
      </section>

      {/* ── Brand Story Banner ── */}
      <section className="relative py-10 sm:py-12 px-4 sm:px-6 md:px-16 overflow-hidden bg-surface-container/50 border-t border-outline-variant/30">
        <div className="relative z-10 max-w-[1200px] mx-auto flex flex-col md:flex-row items-center gap-8">
          <div className="md:w-1/2 space-y-3">
            <h2 className="font-headline-md-mobile md:font-headline-md text-headline-md-mobile md:text-headline-md text-primary">
              Engineered for Excellence
            </h2>
            <p className="font-body-lg text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              Every digital product and software solution from DSoft Pack is built with high performance, robust security, and seamless user experience at its core.
            </p>
            <div>
              <Link
                to="/our-story"
                className="inline-flex items-center gap-2 font-label-md text-xs text-primary border border-primary px-5 py-2 rounded-full hover:bg-primary hover:text-white transition-all duration-300 shadow-xs"
              >
                Our Story
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>
          </div>
          <div className="md:w-1/2">
            <div className="relative rounded-xl overflow-hidden shadow-md border border-outline-variant/40 bg-surface-container">
              <div className="p-6 space-y-3 bg-gradient-to-br from-primary/10 via-slate-900/5 to-orange-500/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center font-black text-base shadow-sm">
                    DS
                  </div>
                  <div>
                    <div className="font-bold text-sm text-on-background">DSoft Pack Promise</div>
                    <div className="text-[11px] text-on-surface-variant">Quality Software & Self-Service CID</div>
                  </div>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  We empower IT professionals, businesses, and software users with instant license delivery, verified security, and a free self-service CID activation web tool.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Newsletter ── */}
      <section className="py-10 px-4 sm:px-6 md:px-16 bg-primary-container/30 border-y border-outline-variant/30">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-title-sm text-title-sm text-primary mb-1">Join Our Newsletter</h2>
          <p className="font-body-md text-xs text-on-surface-variant mb-4">
            Receive updates on new software releases and special deals in your inbox.
          </p>
          <form className="flex flex-col sm:flex-row gap-2.5 justify-center" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Your email address"
              className="bg-surface-container-lowest border-b-2 border-outline-variant focus:border-primary border-t-0 border-x-0 rounded-none px-4 py-1.5 font-body-md focus:ring-0 w-full sm:w-64 outline-none transition-colors text-xs"
            />
            <button
              type="submit"
              className="border border-primary text-primary font-label-md py-1.5 px-5 rounded-full hover:bg-primary hover:text-white transition-all duration-300 text-xs cursor-pointer"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
