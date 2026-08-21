import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { id, name, price, category, image, hoverImage, isNew, badge } = product;
  const [added, setAdded] = useState(false);

  function handleAddToCart(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div className="group relative flex flex-col h-full bg-surface-container-lowest rounded-xl product-card-hover transition-all duration-300 border border-outline-variant/20 overflow-hidden shadow-xs hover:shadow-ambient">
      <Link to={`/product/${id}`} className="flex-grow flex flex-col">
        {/* Image Container */}
        <div className="relative w-full aspect-[4/5] overflow-hidden bg-surface-container">
          {/* Primary image */}
          <img
            src={image || '/14_blush_silk_ribbon_bow.jpg'}
            alt={name}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-0"
          />
          {/* Hover image */}
          {hoverImage && (
            <img
              src={hoverImage}
              alt={`${name} - alternate view`}
              className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            />
          )}
          {/* Badges */}
          {isNew && (
            <div className="absolute top-2 left-2 z-10 bg-primary-container text-on-background font-label-sm text-[10px] sm:text-xs py-0.5 px-2 sm:py-1 sm:px-2.5 rounded-full shadow-sm font-bold">
              New
            </div>
          )}
          {badge && !isNew && (
            <div className="absolute top-2 left-2 z-10 bg-tertiary-container text-on-background font-label-sm text-[10px] sm:text-xs py-0.5 px-2 sm:py-1 sm:px-2.5 rounded-full shadow-sm font-bold">
              {badge}
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
            <span className="bg-primary-container/50 text-on-surface-variant px-2.5 py-0.5 rounded-full font-label-sm text-[10px] sm:text-xs mb-1.5 line-clamp-1 max-w-[90%]">
              {category}
            </span>
          ) : (
            <div className="h-4 sm:h-5" />
          )}

          {/* Title with uniform line-clamp */}
          <div className="min-h-[36px] sm:min-h-[44px] flex items-center justify-center mb-1">
            <h3 className="font-title-sm text-xs sm:text-sm text-primary group-hover:text-on-primary-container transition-colors text-center line-clamp-2 leading-tight">
              {name}
            </h3>
          </div>

          <p className="font-body-md text-xs sm:text-sm md:text-base text-on-surface font-bold">
            Rs. {Number(price || 0).toLocaleString()}
          </p>
        </div>
      </Link>

      {/* Add to Cart */}
      <div className="px-2.5 sm:px-4 pb-3 sm:pb-4 mt-auto">
        <button
          onClick={handleAddToCart}
          className={`w-full py-2 sm:py-2.5 font-label-md text-xs sm:text-sm rounded-full transition-all duration-300 shadow-sm cursor-pointer font-bold ${
            added
              ? 'bg-primary text-white'
              : 'bg-primary-container text-on-background hover:bg-primary hover:text-white'
          }`}
        >
          {added ? (
            <span className="flex items-center justify-center gap-1">
              <span className="material-symbols-outlined text-[15px] sm:text-[18px]">check</span>
              Added!
            </span>
          ) : user ? (
            'Add to Bag'
          ) : (
            <span className="flex items-center justify-center gap-1">
              <span className="material-symbols-outlined text-[14px] sm:text-[16px]">lock</span>
              Login to Add
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
