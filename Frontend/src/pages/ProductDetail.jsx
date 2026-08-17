import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const PRODUCT = {
  id: 'blush-ribbon-bow',
  name: 'Blush Silk Ribbon Bow',
  price: 3600,
  stock: 48,
  category: 'Bows',
  badge: 'Bestseller',
  description: 'A handcrafted blush silk ribbon bow, perfect for adorning gifts, hair accessories, or home décor. Made with premium quality silk for a luxurious, soft feel.',
  details: [
    'Material: 100% Silk',
    'Width: 2 inches',
    'Length: approximately 6 inches',
    'Care: Spot clean only',
    'Handmade with love in Sri Lanka',
  ],
  colors: [
    { name: 'Blush Pink', hex: '#fadadd', image: '/14_blush_silk_ribbon_bow.jpg', price: 3600, stock: 18 },
    { name: 'Cream Linen', hex: '#f7f4ef', image: '/01_cream_linen_fabrics.jpg', price: 4200, stock: 12 },
    { name: 'Rose Gold', hex: '#e8c5c8', image: '/08_pink_satin_robe.jpg', price: 4800, stock: 5 },
    { name: 'Sage Olive', hex: '#c5cbba', image: '/03_olive_linen_ribbons.jpg', price: 3600, stock: 0 },
  ],
  images: [
    '/14_blush_silk_ribbon_bow.jpg',
    '/15_blush_silk_ribbon_close_up.jpg',
    '/20_flat_lay_ribbon_jasmine.jpg',
    '/19_woman_low_bun_ribbon.jpg',
  ],
  related: [
    { id: 'pearl-scrunchie', name: 'Pearl Satin Scrunchie', price: 4500, image: '/18_silk_scrunchie.jpg' },
    { id: 'woven-headband', name: 'Woven Floral Headband', price: 6600, image: '/17_woven_floral_headband.jpg' },
    { id: 'hair-bows-set', name: 'Handmade Hair Bows Set', price: 8400, image: '/16_flat_lay_hair_bows.jpg' },
    { id: 'studio-ribbon', name: 'Artisan Silk Ribbon', price: 5400, image: '/13_studio_table_ribbons.jpg' },
  ],
};

export default function ProductDetail() {
  const hasColors = PRODUCT.colors && PRODUCT.colors.length > 0;
  const [selectedColor, setSelectedColor] = useState(hasColors ? PRODUCT.colors[0] : null);
  const [activeImage, setActiveImage] = useState(PRODUCT.images[0]);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  function handleColorSelect(colorObj) {
    setSelectedColor(colorObj);
    if (colorObj.image) {
      setActiveImage(colorObj.image);
    }
  }

  // Dynamic price & stock based on selected color variant
  const currentPrice = selectedColor ? selectedColor.price : PRODUCT.price;
  const currentStock = selectedColor ? selectedColor.stock : PRODUCT.stock;
  const isOutOfStock = currentStock === 0;

  function handleAddToCart() {
    if (isOutOfStock) return;
    addToCart({
      ...PRODUCT,
      name: selectedColor ? `${PRODUCT.name} (${selectedColor.name})` : PRODUCT.name,
      price: currentPrice,
      image: activeImage,
    }, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <main className="flex-grow w-full max-w-[1200px] mx-auto px-5 md:px-16 py-16">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-on-surface-variant font-label-md text-label-md mb-8">
        <Link to="/shop" className="hover:text-primary transition-colors">Shop</Link>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <Link to="/shop?cat=bows" className="hover:text-primary transition-colors">Bows</Link>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <span className="text-primary">{PRODUCT.name}</span>
      </nav>

      {/* Product Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-16 mb-16">
        {/* Image Gallery */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          {/* Main Image */}
          <div className="w-full aspect-[4/5] bg-surface-container-low rounded-lg overflow-hidden shadow-ambient relative group">
            <img
              src={activeImage}
              alt={PRODUCT.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute top-4 left-4 bg-primary-container text-on-background px-3 py-1 rounded-full font-label-sm text-label-sm">
              {PRODUCT.badge}
            </div>
            {selectedColor && (
              <div className="absolute bottom-4 right-4 bg-surface-container-lowest/90 backdrop-blur-sm text-on-surface px-3 py-1 rounded-full font-label-sm text-label-sm border border-outline-variant/30 flex items-center gap-1.5 shadow-sm">
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: selectedColor.hex }} />
                <span>Color: {selectedColor.name}</span>
              </div>
            )}
          </div>
          {/* Gallery Thumbnails */}
          <div className="grid grid-cols-4 gap-3">
            {PRODUCT.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(img)}
                className={`aspect-square rounded-md overflow-hidden border-2 transition-all ${
                  activeImage === img ? 'border-primary opacity-100 scale-98 shadow-sm' : 'border-transparent opacity-70 hover:opacity-100 hover:border-outline-variant'
                }`}
              >
                <img src={img} alt={`View ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="lg:col-span-5 flex flex-col justify-start">
          <div className="sticky top-[120px]">
            <h1 className="font-headline-md-mobile md:font-headline-md text-headline-md-mobile md:text-headline-md text-on-background mb-3">
              {PRODUCT.name}
            </h1>

            {/* Dynamic Price & Color Stock Indicator */}
            <div className="flex items-center space-x-4 mb-6">
              <span className="font-title-sm text-title-sm text-on-background font-bold">Rs. {currentPrice.toLocaleString()}</span>
              {isOutOfStock ? (
                <span className="flex items-center space-x-1 text-error font-label-sm text-label-sm bg-error-container/40 px-3 py-1 rounded-full">
                  <span className="material-symbols-outlined text-[16px]">block</span>
                  <span>Out of Stock ({selectedColor?.name})</span>
                </span>
              ) : (
                <span className="flex items-center space-x-1 text-primary font-label-sm text-label-sm bg-primary-container/30 px-3 py-1 rounded-full">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  <span>In Stock ({currentStock} available)</span>
                </span>
              )}
            </div>

            <p className="font-body-md text-body-md text-on-surface-variant mb-6 leading-relaxed">
              {PRODUCT.description}
            </p>

            {/* Conditional Color Swatch Selector with Dynamic Price & Stock */}
            {hasColors && (
              <div className="mb-6 bg-surface-container-low p-4 rounded-xl border border-outline-variant/30">
                <div className="flex justify-between items-center mb-3">
                  <label className="font-label-md text-label-md text-on-surface">
                    Selected Color: <span className="font-bold text-primary">{selectedColor?.name}</span>
                  </label>
                  <span className={`font-label-sm text-label-sm ${selectedColor?.stock === 0 ? 'text-error font-bold' : 'text-on-surface-variant'}`}>
                    Rs. {selectedColor?.price.toLocaleString()} · {selectedColor?.stock === 0 ? 'Out of Stock' : `${selectedColor?.stock} in stock`}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {PRODUCT.colors.map((c) => {
                    const isSelected = selectedColor?.name === c.name;
                    const cOutOfStock = c.stock === 0;
                    return (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => handleColorSelect(c)}
                        title={`${c.name} - Rs. ${c.price.toLocaleString()} ${cOutOfStock ? '(Out of Stock)' : `(${c.stock} in stock)`}`}
                        className={`w-9 h-9 rounded-full transition-all flex items-center justify-center relative cursor-pointer border border-outline-variant/40 ${
                          isSelected
                            ? 'ring-2 ring-primary ring-offset-2 scale-110 shadow-sm'
                            : 'hover:scale-105 opacity-80 hover:opacity-100'
                        } ${cOutOfStock ? 'opacity-40' : ''}`}
                        style={{ backgroundColor: c.hex }}
                      >
                        {isSelected && (
                          <span className="material-symbols-outlined text-[16px] text-on-surface drop-shadow-sm font-bold">
                            {cOutOfStock ? 'close' : 'check'}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <label className="font-label-md text-label-md text-on-surface mb-2 block">Quantity</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-outline-variant rounded-lg overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={isOutOfStock}
                    className="px-4 py-2 text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[18px]">remove</span>
                  </button>
                  <span className="px-4 py-2 font-body-md text-body-md text-on-surface border-x border-outline-variant">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(currentStock || 1, quantity + 1))}
                    disabled={isOutOfStock || quantity >= currentStock}
                    className="px-4 py-2 text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                  </button>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-3 mb-8">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`w-full py-4 px-8 rounded-full font-label-md text-label-md transition-all duration-300 flex items-center justify-center gap-2 ${
                  isOutOfStock
                    ? 'bg-surface-container-high text-on-surface-variant cursor-not-allowed border border-outline-variant'
                    : added
                    ? 'bg-primary text-white'
                    : 'bg-primary-container text-on-background hover:bg-primary hover:text-white shadow-ambient hover-ambient'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{isOutOfStock ? 'block' : added ? 'check' : 'shopping_bag'}</span>
                {isOutOfStock
                  ? `Out of Stock (${selectedColor?.name})`
                  : added
                  ? `Added (${selectedColor ? selectedColor.name : 'Item'})!`
                  : `Add ${selectedColor ? selectedColor.name : ''} to Bag (Rs. ${(currentPrice * quantity).toLocaleString()})`}
              </button>
              <button
                onClick={() => { handleAddToCart(); navigate('/checkout'); }}
                disabled={isOutOfStock}
                className="w-full py-4 px-8 border border-primary text-primary rounded-full font-label-md text-label-md hover:bg-primary hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Buy Now
              </button>
            </div>

            {/* Product Details */}
            <div className="border-t border-outline-variant pt-6">
              <h3 className="font-label-md text-label-md text-primary mb-3 font-bold">Product Details</h3>
              <ul className="space-y-2">
                {PRODUCT.details.map((d, i) => (
                  <li key={i} className="flex items-start gap-2 font-body-md text-body-md text-on-surface-variant">
                    <span className="material-symbols-outlined text-[16px] text-primary mt-0.5">fiber_manual_record</span>
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      <section>
        <h2 className="font-headline-md-mobile md:font-headline-md text-headline-md-mobile md:text-headline-md text-primary mb-8">
          You Might Also Love
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {PRODUCT.related.map((item) => (
            <Link key={item.id} to={`/product/${item.id}`} className="group flex flex-col">
              <div className="w-full aspect-[4/5] rounded-lg overflow-hidden shadow-ambient group-hover:shadow-ambient-lg transition-all duration-300 mb-3 bg-surface-container-low">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="text-center">
                <h4 className="font-title-sm text-title-sm text-on-surface group-hover:text-primary transition-colors">{item.name}</h4>
                <p className="font-body-md text-body-md text-on-surface-variant">Rs. {item.price.toLocaleString()}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
