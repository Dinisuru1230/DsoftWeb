import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useState, useRef, useEffect } from 'react';
import { ALL_PRODUCTS } from '../data/productsData';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const { user } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);

  const navLinks = [
    { label: 'Shop', to: '/shop' },
    { label: 'Our Story', to: '/our-story' },
    { label: 'Contact Us', to: '/contact' },
  ];

  const isActive = (path) => location.pathname === path;

  // Auto-focus input when search opens
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  // Live filter products as user types (even single letter)
  const searchResults = searchQuery.trim().length > 0
    ? ALL_PRODUCTS.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
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
    <header className="sticky top-0 z-50 bg-background shadow-ambient w-full">
      <nav className="flex justify-between items-center w-full px-4 sm:px-8 md:px-12 py-4 max-w-[1600px] mx-auto">
        {/* Brand Logo */}
        <Link
          to="/"
          className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-primary tracking-tight"
        >
          Malmalee Creations
        </Link>

        {/* Desktop Nav Links */}
        <ul className="hidden md:flex space-x-6 items-center font-label-md text-label-md">
          {navLinks.map((link) => (
            <li key={link.to}>
              <Link
                to={link.to}
                className={`pb-1 transition-colors duration-300 ${
                  isActive(link.to)
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Trailing Icons */}
        <div className="flex items-center space-x-4">
          {/* Search Toggle Button */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="text-primary hover:opacity-80 transition-all p-1"
            aria-label="Search"
          >
            <span className="material-symbols-outlined">{searchOpen ? 'close' : 'search'}</span>
          </button>

          {/* Cart Button */}
          <button
            onClick={() => navigate('/cart')}
            className="relative text-primary hover:opacity-80 transition-all p-1"
            aria-label="Cart"
          >
            <span className="material-symbols-outlined">shopping_bag</span>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </button>

          {/* User Profile */}
          {user ? (
            user.role === 'ADMIN' ? (
              // Admin user — go to admin dashboard, not customer profile
              <button
                onClick={() => navigate('/admin')}
                className="hidden md:flex text-primary hover:opacity-80 transition-all p-1 cursor-pointer"
                aria-label="Admin Dashboard"
              >
                <span className="material-symbols-outlined">admin_panel_settings</span>
              </button>
            ) : (
              // Customer user — go to customer profile
              <button
                onClick={() => navigate('/account/profile')}
                className="hidden md:flex text-primary hover:opacity-80 transition-all p-1 cursor-pointer"
                aria-label="Account"
              >
                <span className="material-symbols-outlined">person</span>
              </button>
            )
          ) : (
            <Link
              to="/login"
              className="hidden md:flex font-label-md text-label-md text-primary hover:opacity-80 transition-all"
            >
              Login
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-primary hover:opacity-80 transition-all p-1"
            aria-label="Menu"
          >
            <span className="material-symbols-outlined">{mobileOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </nav>

      {/* ── LIVE INSTANT SEARCH BAR OVERLAY ── */}
      {searchOpen && (
        <div className="border-t border-outline-variant/40 bg-surface-container-lowest px-4 sm:px-8 md:px-12 py-4 relative shadow-lg">
          <div className="max-w-[1200px] mx-auto relative">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-4 text-primary text-2xl">search</span>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, bows, ribbons, headbands... (type any letter)"
                className="w-full bg-surface-container-low border-2 border-primary/30 focus:border-primary rounded-full pl-12 pr-12 py-3 font-body-md text-on-surface outline-none transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 text-on-surface-variant hover:text-primary p-1"
                >
                  <span className="material-symbols-outlined text-[20px]">cancel</span>
                </button>
              )}
            </form>

            {/* LIVE SEARCH DROPDOWN RESULTS */}
            {searchQuery.trim().length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/40 overflow-hidden z-50 max-h-[420px] overflow-y-auto">
                <div className="p-3 bg-surface-container-low border-b border-outline-variant/30 flex justify-between items-center text-xs font-label-md text-on-surface-variant">
                  <span>Found <strong>{searchResults.length}</strong> result(s) for "{searchQuery}"</span>
                  {searchResults.length > 0 && (
                    <button
                      onClick={handleSearchSubmit}
                      className="text-primary hover:underline font-bold"
                    >
                      View All Products &rarr;
                    </button>
                  )}
                </div>

                {searchResults.length > 0 ? (
                  <ul className="divide-y divide-outline-variant/20">
                    {searchResults.map((product) => (
                      <li
                        key={product.id}
                        onClick={() => handleSelectProduct(product.id)}
                        className="p-3.5 flex items-center justify-between hover:bg-primary-container/20 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-3.5">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover border border-outline-variant/30 shrink-0"
                          />
                          <div>
                            <h4 className="font-title-sm text-sm text-on-surface group-hover:text-primary font-bold transition-colors">
                              {product.name}
                            </h4>
                            <span className="font-label-sm text-xs text-on-surface-variant">
                              {product.category}
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="font-title-sm text-sm font-bold text-primary">
                            Rs. {product.price.toLocaleString()}
                          </span>
                          {product.badge && (
                            <span className="block text-[10px] bg-primary-container text-on-background px-2 py-0.5 rounded-full font-bold mt-0.5">
                              {product.badge}
                            </span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-8 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-4xl text-outline mb-2">search_off</span>
                    <p className="font-label-md text-body-md text-on-surface">No products found matching "{searchQuery}"</p>
                    <p className="font-label-sm text-xs text-outline mt-1">Try searching for "bow", "ribbon", "scrunchie", or "headband"</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile Menu Dropdown */}
      {mobileOpen && (
        <div className="md:hidden bg-background border-t border-outline-variant px-5 py-4 flex flex-col space-y-4">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={`font-label-md text-label-md py-2 transition-colors ${
                isActive(link.to) ? 'text-primary font-bold' : 'text-on-surface-variant'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/login"
            onClick={() => setMobileOpen(false)}
            className="font-label-md text-label-md text-primary py-2"
          >
            Login / Register
          </Link>
        </div>
      )}
    </header>
  );
}
