import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { label: 'Shop', to: '/shop' },
    { label: 'Collections', to: '/collections' },
    { label: 'Our Story', to: '/our-story' },
    { label: 'Contact Us', to: '/contact' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-background shadow-ambient w-full">
      <nav className="flex justify-between items-center w-full px-4 sm:px-8 md:px-12 py-4 max-w-[1400px] mx-auto">
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
          <button
            className="hidden md:flex text-primary hover:opacity-80 transition-all"
            aria-label="Search"
          >
            <span className="material-symbols-outlined">search</span>
          </button>

          <button
            onClick={() => navigate('/cart')}
            className="relative text-primary hover:opacity-80 transition-all"
            aria-label="Cart"
          >
            <span className="material-symbols-outlined">shopping_bag</span>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </button>

          {user ? (
            <button
              onClick={() => navigate('/account')}
              className="hidden md:flex text-primary hover:opacity-80 transition-all"
              aria-label="Account"
            >
              <span className="material-symbols-outlined">person</span>
            </button>
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
            className="md:hidden text-primary hover:opacity-80 transition-all"
            aria-label="Menu"
          >
            <span className="material-symbols-outlined">{mobileOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </nav>

      {/* Mobile Dropdown */}
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
