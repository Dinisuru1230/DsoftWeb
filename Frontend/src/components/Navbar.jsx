import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useState, useRef, useEffect } from 'react';
import LogoComponent from './LogoComponent';

const API_BASE = 'http://localhost:5050/api';

function imgUrl(path) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  if (path.startsWith('/uploads')) return `http://localhost:5050${path}`;
  return path;
}

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const { user } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [realProducts, setRealProducts] = useState([]);
  
  const searchInputRef = useRef(null);
  const searchContainerRef = useRef(null);

  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'Shop', to: '/shop' },
    { label: 'Get CID', to: '/get-cid' },
    { label: 'About Us', to: '/about-us' },
    { label: 'Contact Us', to: '/contact' },
  ];

  const isActive = (path) => location.pathname === path;

  // Fetch product list for instant search
  useEffect(() => {
    fetch(`${API_BASE}/products`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setRealProducts(data);
      })
      .catch(() => {});
  }, []);

  // Auto focus input when search toggles open
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  // Handle ESC key and outside click to close search bar
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setSearchQuery('');
      }
    }
    function handleClickOutside(e) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    }

    if (searchOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [searchOpen]);

  // Live filter products as user types
  const searchResults = searchQuery.trim().length > 0
    ? realProducts.filter((p) => {
        const q = searchQuery.toLowerCase();
        const name = (p.name || '').toLowerCase();
        const category = (p.categoryName || p.category || '').toLowerCase();
        const desc = (p.description || '').toLowerCase();
        return name.includes(q) || category.includes(q) || desc.includes(q);
      })
    : [];

  function handleSelectProduct(productId) {
    setSearchOpen(false);
    setSearchQuery('');
    navigate(`/product/${productId}`);
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    if (searchQuery.trim()) {
      const query = searchQuery;
      setSearchOpen(false);
      setSearchQuery('');
      navigate(`/shop?search=${encodeURIComponent(query)}`);
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-background shadow-ambient w-full" ref={searchContainerRef}>
      <nav className="flex justify-between items-center w-full px-4 sm:px-8 md:px-12 py-3.5 max-w-[1600px] mx-auto">
        {/* Left: Brand Logo */}
        <div className="flex-1 flex justify-start">
          <LogoComponent height="h-10 sm:h-12" />
        </div>

        {/* Center: Desktop Nav Links */}
        <ul className="hidden md:flex justify-center items-center space-x-8 font-label-md text-label-md flex-shrink-0">
          {navLinks.map((link) => (
            <li key={link.to}>
              <Link
                to={link.to}
                className={`pb-1 transition-colors duration-300 ${
                  isActive(link.to)
                    ? 'text-primary border-b-2 border-primary font-bold'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right: Trailing Action Icons */}
        <div className="flex-1 flex justify-end items-center space-x-3 sm:space-x-4">
          {/* Search Toggle Button */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="text-primary hover:opacity-80 transition-all p-1.5 rounded-full hover:bg-primary-container/30 cursor-pointer flex items-center justify-center"
            aria-label="Search"
            title="Search software products"
          >
            <span className="material-symbols-outlined text-[22px]">{searchOpen ? 'close' : 'search'}</span>
          </button>

          {/* Cart Button */}
          <button
            onClick={() => navigate('/cart')}
            className="relative text-primary hover:opacity-80 transition-all p-1.5 rounded-full hover:bg-primary-container/30 cursor-pointer flex items-center justify-center"
            aria-label="Cart"
            title="Shopping Cart"
          >
            <span className="material-symbols-outlined text-[22px]">shopping_bag</span>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-[11px] w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-xs">
                {cartCount}
              </span>
            )}
          </button>

          {/* User Profile */}
          {user ? (
            user.role === 'ADMIN' ? (
              <button
                onClick={() => navigate('/admin')}
                className="hidden md:flex text-primary hover:opacity-80 transition-all p-1.5 rounded-full hover:bg-primary-container/30 cursor-pointer items-center justify-center"
                aria-label="Admin Dashboard"
                title="Admin Dashboard"
              >
                <span className="material-symbols-outlined text-[22px]">admin_panel_settings</span>
              </button>
            ) : (
              <button
                onClick={() => navigate('/account/profile')}
                className="hidden md:flex text-primary hover:opacity-80 transition-all p-1.5 rounded-full hover:bg-primary-container/30 cursor-pointer items-center justify-center"
                aria-label="Account"
                title="My Profile"
              >
                <span className="material-symbols-outlined text-[22px]">person</span>
              </button>
            )
          ) : (
            <Link
              to="/login"
              className="hidden md:flex font-label-md text-sm text-primary hover:opacity-80 transition-all font-bold px-3 py-1 rounded-lg hover:bg-primary-container/30"
            >
              Login
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-primary hover:opacity-80 transition-all p-1.5 rounded-full hover:bg-primary-container/30 cursor-pointer flex items-center justify-center"
            aria-label="Menu"
          >
            <span className="material-symbols-outlined text-[22px]">{mobileOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </nav>

      {/* ── LIVE INSTANT SEARCH BAR OVERLAY ── */}
      {searchOpen && (
        <div className="border-t border-outline-variant/40 bg-surface-container-lowest px-4 sm:px-8 md:px-12 py-3.5 relative shadow-lg animate-fade-in">
          <div className="max-w-[1000px] mx-auto relative">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-4 text-primary text-xl">search</span>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search software products, Windows, Office keys, Antivirus..."
                className="w-full bg-surface border border-outline-variant focus:border-primary rounded-xl pl-11 pr-12 py-2.5 font-body-md text-sm text-on-surface outline-none transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 text-on-surface-variant hover:text-primary p-1 rounded-full flex items-center justify-center cursor-pointer"
                  title="Clear search"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              )}
            </form>

            {/* LIVE SEARCH DROPDOWN RESULTS */}
            {searchQuery.trim().length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-surface-container-lowest rounded-xl shadow-2xl border border-outline-variant/40 overflow-hidden z-50 max-h-[400px] overflow-y-auto">
                <div className="px-4 py-2.5 bg-surface-container-low border-b border-outline-variant/30 flex justify-between items-center text-xs font-label-md text-on-surface-variant">
                  <span>Found <strong className="text-primary">{searchResults.length}</strong> product(s) for "{searchQuery}"</span>
                  {searchResults.length > 0 && (
                    <button
                      onClick={handleSearchSubmit}
                      className="text-primary hover:underline font-bold flex items-center gap-1"
                    >
                      View All Results &rarr;
                    </button>
                  )}
                </div>

                {searchResults.length > 0 ? (
                  <ul className="divide-y divide-outline-variant/20">
                    {searchResults.map((product) => (
                      <li
                        key={product.id}
                        onClick={() => handleSelectProduct(product.id)}
                        className="p-3 flex items-center justify-between hover:bg-primary-container/20 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          {imgUrl(product.image) ? (
                            <img
                              src={imgUrl(product.image)}
                              alt={product.name}
                              className="w-10 h-10 rounded-lg object-contain bg-surface-bright p-1 border border-outline-variant/30 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-primary-container/40 text-primary flex items-center justify-center shrink-0">
                              <span className="material-symbols-outlined text-xl">key</span>
                            </div>
                          )}
                          <div>
                            <h4 className="font-title-sm text-xs sm:text-sm text-on-surface group-hover:text-primary font-bold transition-colors">
                              {product.name}
                            </h4>
                            <span className="font-label-sm text-[11px] text-on-surface-variant">
                              {product.categoryName || product.category || 'Software License'}
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="font-title-sm text-xs sm:text-sm font-bold text-primary">
                            Rs. {Number(product.price || 0).toLocaleString()}
                          </span>
                          {product.stock <= 0 && (
                            <span className="block text-[10px] bg-error-container text-error px-2 py-0.5 rounded-full font-bold mt-0.5">
                              Out of Stock
                            </span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-6 text-center text-on-surface-variant space-y-1">
                    <span className="material-symbols-outlined text-3xl text-outline mb-1">search_off</span>
                    <p className="font-label-md text-xs sm:text-sm text-on-surface font-semibold">
                      No software products found matching "{searchQuery}"
                    </p>
                    <p className="font-label-sm text-[11px] text-on-surface-variant">
                      Try searching for "Windows 11", "Office 2021", "Kaspersky", or "Antivirus"
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── MOBILE SLIDE-OUT MENU ── */}
      {mobileOpen && (
        <div className="md:hidden border-t border-outline-variant/30 bg-surface-container-lowest px-4 py-4 space-y-3 animate-fade-in shadow-lg">
          <ul className="space-y-2">
            {navLinks.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-3 py-2 rounded-lg font-label-md text-sm font-medium ${
                    isActive(link.to)
                      ? 'bg-primary-container/40 text-primary font-bold'
                      : 'text-on-surface hover:bg-surface-container'
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="pt-2 border-t border-outline-variant/30 flex flex-col gap-2">
            {user ? (
              user.role === 'ADMIN' ? (
                <Link
                  to="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-primary font-bold text-sm bg-primary-container/30"
                >
                  <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
                  Admin Dashboard
                </Link>
              ) : (
                <Link
                  to="/account/profile"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-primary font-bold text-sm bg-primary-container/30"
                >
                  <span className="material-symbols-outlined text-[18px]">person</span>
                  My Profile
                </Link>
              )
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-primary font-bold text-sm bg-primary-container/30"
              >
                <span className="material-symbols-outlined text-[18px]">login</span>
                Sign In / Register
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
