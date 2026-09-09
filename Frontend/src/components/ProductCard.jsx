import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

function getBadgeStyle(badgeText) {
  if (!badgeText) return 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md border border-white/20';
  const b = String(badgeText).toUpperCase();
  if (b.includes('HOT') || b.includes('SALE') || b.includes('OFF') || b.includes('DEAL')) {
    return 'bg-gradient-to-r from-red-600 to-rose-500 text-white shadow-md border border-white/20';
  }
  if (b.includes('NEW')) {
    return 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-md border border-white/20';
  }
  if (b.includes('MOST') || b.includes('BEST') || b.includes('TOP') || b.includes('POPULAR')) {
    return 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black shadow-md border border-amber-300/40';
  }
  return 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md border border-white/20';
}

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { id, name, price, category, image, hoverImage, isNew, badge } = product;
  const [added, setAdded] = useState(false);

  const isOutOfStock = product.stock !== undefined ? product.stock <= 0 : false;

  function handleAddToCart(e) {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    if (!user) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  function handleBuyNow(e) {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    if (!user) {
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }
    addToCart(product);
    navigate('/checkout');
  }

  return (
    <div className="group relative flex flex-col h-full bg-surface-container-lowest rounded-2xl product-card-hover transition-all duration-300 border border-outline-variant/20 overflow-hidden shadow-xs hover:shadow-ambient">
      <Link to={`/product/${id}`} className="flex-grow flex flex-col">
        {/* Image Container */}
        <div className="relative w-full aspect-square overflow-hidden bg-surface-container">
          {/* Out of Stock Red Corner Ribbon */}
          {isOutOfStock && (
            <div className="absolute top-0 left-0 w-24 h-24 sm:w-28 sm:h-28 overflow-hidden z-20 pointer-events-none">
              <div className="bg-[#dc2626] text-white text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-center py-1 sm:py-1.5 w-32 sm:w-36 -rotate-45 -translate-x-9 sm:-translate-x-10 translate-y-3 sm:translate-y-3.5 shadow-md border-y border-white/20">
                OUT OF STOCK
              </div>
            </div>
          )}

          {/* Primary image */}
          <img
            src={image || ''}
            alt={name}
            className={`absolute inset-0 w-full h-full object-contain p-2 transition-transform duration-500 ${hoverImage ? 'group-hover:opacity-0' : 'group-hover:scale-105'
              } ${isOutOfStock ? 'opacity-80 grayscale-[20%]' : ''}`}
          />
          {/* Hover image (if provided) */}
          {hoverImage && (
            <img
              src={hoverImage}
              alt={`${name} - alternate view`}
              className={`absolute inset-0 w-full h-full object-contain p-2 opacity-0 transition-opacity duration-500 group-hover:opacity-100 ${isOutOfStock ? 'grayscale-[20%]' : ''
                }`}
            />
          )}
          {/* High-Impact Badges */}
          {(badge || isNew) && (
            <div className={`absolute top-2.5 ${isOutOfStock ? 'right-2.5' : 'left-2.5'} z-10 flex items-center gap-1`}>
              <span className={`px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider ${getBadgeStyle(badge || (isNew ? 'NEW' : ''))}`}>
                {badge || 'NEW'}
              </span>
            </div>
          )}
          {/* Quick View (Desktop Only) */}
          <div className="hidden md:flex absolute bottom-3 left-0 right-0 justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
            <span className="bg-surface-container-lowest/90 backdrop-blur-sm text-primary border border-primary/20 px-4 py-1.5 rounded-full font-label-md text-xs hover:bg-primary-container transition-colors shadow-sm font-bold">
              Quick View
            </span>
          </div>
        </div>

        {/* Product info */}
        <div className="p-3 sm:p-4 flex-grow flex flex-col justify-between items-center text-center">
          {category ? (
            <span className="bg-slate-100 text-slate-700 border border-slate-200/80 px-2.5 py-0.5 rounded-full font-bold text-[10px] sm:text-[11px] uppercase tracking-wider mb-1.5 line-clamp-1 max-w-[90%] shadow-2xs">
              {category}
            </span>
          ) : (
            <div className="h-4 sm:h-5" />
          )}

          {/* Title with uniform line-clamp */}
          <div className="min-h-[36px] sm:min-h-[44px] flex items-center justify-center mb-1">
            <h3 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-primary transition-colors text-center line-clamp-2 leading-tight">
              {name}
            </h3>
          </div>

          <p className="font-black text-xs sm:text-sm md:text-base text-slate-950">
            Rs. {Number(price || 0).toLocaleString()}
          </p>
        </div>
      </Link>

      {/* Action Buttons: Add to Cart & Buy Now */}
      <div className="px-2.5 sm:px-3 pb-3 sm:pb-4 mt-auto">
        {isOutOfStock ? (
          <button
            disabled
            className="w-full py-2 font-label-md text-xs rounded-full bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200 font-bold"
          >
            Out of Stock
          </button>
        ) : (
          <div className="flex items-center gap-1.5">
            {/* Add to Cart Button (Solid Primary Blue) */}
            <button
              onClick={handleAddToCart}
              className={`flex-1 py-1.5 sm:py-2 text-[11px] sm:text-xs rounded-full transition-all duration-300 font-extrabold shadow-xs flex items-center justify-center gap-1 ${
                added
                  ? 'bg-emerald-600 border-emerald-600 text-white cursor-pointer'
                  : 'bg-primary text-white hover:bg-blue-700 active:bg-blue-800 cursor-pointer'
              }`}
            >
              {added ? (
                <>
                  <span className="material-symbols-outlined text-[13px] sm:text-[14px]">check</span>
                  Added
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[13px] sm:text-[14px]">shopping_cart</span>
                  Add to Cart
                </>
              )}
            </button>

            {/* Buy Now Button (Outlined Primary Blue) */}
            <button
              onClick={handleBuyNow}
              className="py-1.5 sm:py-2 px-3 sm:px-3.5 text-[11px] sm:text-xs rounded-full border border-primary text-primary hover:bg-primary hover:text-white font-bold transition-all duration-300 flex items-center justify-center gap-1 shrink-0 whitespace-nowrap cursor-pointer"
              title="Buy Now - Direct Checkout"
            >
              <span className="material-symbols-outlined text-[13px] sm:text-[14px]">bolt</span>
              Buy Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
