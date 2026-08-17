import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { id, name, price, category, image, hoverImage, isNew, badge } = product;

  return (
    <div className="group relative flex flex-col h-full bg-surface-container-lowest rounded-lg product-card-hover transition-all duration-300">
      <Link to={`/product/${id}`} className="flex-grow flex flex-col">
        {/* Image Container */}
        <div className="relative w-full aspect-[4/5] overflow-hidden rounded-t-lg bg-surface-container">
          {/* Primary image */}
          <img
            src={image}
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
            <div className="absolute top-2 left-2 z-10 bg-primary-container text-on-background font-label-sm text-label-sm py-1 px-3 rounded-full shadow-sm">
              New
            </div>
          )}
          {badge && (
            <div className="absolute top-2 left-2 z-10 bg-tertiary-container text-on-background font-label-sm text-label-sm py-1 px-3 rounded-full shadow-sm">
              {badge}
            </div>
          )}
          {/* Quick View */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
            <button className="bg-surface-container-lowest/90 backdrop-blur-sm text-primary border border-primary/20 px-6 py-2 rounded-full font-label-md text-label-md hover:bg-primary-container transition-colors">
              Quick View
            </button>
          </div>
        </div>

        {/* Product info (Equal height spacing) */}
        <div className="p-4 flex-grow flex flex-col justify-between items-center text-center">
          {category ? (
            <span className="bg-primary-container text-on-background px-3 py-1 rounded-full font-label-sm text-label-sm mb-2">
              {category}
            </span>
          ) : (
            <div className="h-6" />
          )}

          {/* Title with uniform 2-line height allocation */}
          <div className="min-h-[44px] flex items-center justify-center mb-1">
            <h3 className="font-title-sm text-title-sm text-primary group-hover:text-on-primary-container transition-colors text-center line-clamp-2">
              {name}
            </h3>
          </div>

          <p className="font-body-md text-body-md text-on-surface-variant font-medium">Rs. {price.toLocaleString()}</p>
        </div>
      </Link>

      {/* Add to Cart (Anchored perfectly at the bottom of every card) */}
      <div className="px-4 pb-4 mt-auto">
        <button
          onClick={() => addToCart(product)}
          className="w-full py-2.5 bg-primary-container text-on-background font-label-md text-label-md rounded-full hover:bg-primary hover:text-white transition-all duration-300 shadow-sm"
        >
          Add to Bag
        </button>
      </div>
    </div>
  );
}
