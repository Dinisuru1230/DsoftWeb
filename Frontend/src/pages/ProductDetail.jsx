import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const API_BASE = 'http://localhost:5050/api';

// Helper: build image URL — handles both /public images and /uploads images
function imgUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  if (path.startsWith('/uploads')) return `http://localhost:5050${path}`;
  return path; // /public/* served by Vite
}

// Helper: parse details field — handles 3 formats:
// 1. Already an array (shouldn't happen from API but defensive)
// 2. JSON string → ["Material: Silk", "Width: 2 inches", ...] (new format)
// 3. Plain \n-joined string → "Material: Silk\nWidth: 2 inches" (old format)
function parseDetails(details) {
  if (!details) return [];
  if (Array.isArray(details)) return details.filter(Boolean);
  try {
    const parsed = JSON.parse(details);
    if (Array.isArray(parsed)) return parsed.filter(Boolean);
    // JSON was a plain string — treat as single item or split by \n
    return String(parsed).split('\n').map((s) => s.trim()).filter(Boolean);
  } catch {
    // Not JSON → old \n-joined string
    return String(details).split('\n').map((s) => s.trim()).filter(Boolean);
  }
}

// Helper: parse galleryImages JSON string → array of URLs
function parseGalleryImages(galleryImages) {
  if (!galleryImages) return [];
  if (Array.isArray(galleryImages)) return galleryImages.filter(Boolean).map(imgUrl);
  try {
    const parsed = JSON.parse(galleryImages);
    return Array.isArray(parsed) ? parsed.filter(Boolean).map(imgUrl) : [];
  } catch {
    return [];
  }
}

// Helper: build gallery from main image + sub-gallery images
// Gallery = [mainImage, ...galleryImages(sub1, sub2, sub3)]
// Color images are NOT part of the gallery — they only change the active/main displayed image
function buildGallery(product) {
  const urls = [];
  // 1. Main cover image always first
  if (product.image) urls.push(imgUrl(product.image));
  // 2. Sub-gallery images (sub1=hoverImage source, sub2, sub3)
  const subImages = parseGalleryImages(product.galleryImages);
  subImages.forEach((u) => {
    if (u && !urls.includes(u)) urls.push(u);
  });
  return urls.filter(Boolean);
}


// ── Loading Skeleton ──────────────────────────────────────────────
function ProductSkeleton() {
  return (
    <main className="flex-grow w-full max-w-[1200px] mx-auto px-5 md:px-16 py-16 animate-pulse">
      <div className="h-5 bg-surface-container rounded w-48 mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-16 mb-16">
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className="w-full aspect-[4/5] bg-surface-container rounded-lg" />
          <div className="grid grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-square bg-surface-container rounded-md" />
            ))}
          </div>
        </div>
        <div className="lg:col-span-5 space-y-4">
          <div className="h-10 bg-surface-container rounded w-3/4" />
          <div className="h-6 bg-surface-container rounded w-1/3" />
          <div className="h-24 bg-surface-container rounded" />
          <div className="h-12 bg-surface-container rounded-full" />
          <div className="h-12 bg-surface-container rounded-full" />
        </div>
      </div>
    </main>
  );
}

// ── Not Found ─────────────────────────────────────────────────────
function ProductNotFound() {
  return (
    <main className="flex-grow w-full max-w-[1200px] mx-auto px-5 md:px-16 py-16 flex flex-col items-center justify-center gap-6 text-center">
      <span className="material-symbols-outlined text-7xl text-outline/40">inventory_2</span>
      <h1 className="font-headline-md-mobile md:font-headline-md text-headline-md-mobile md:text-headline-md text-on-background">
        Product Not Found
      </h1>
      <p className="font-body-md text-body-md text-on-surface-variant max-w-sm">
        This product may have been removed or doesn't exist. Browse our full collection instead.
      </p>
      <Link
        to="/shop"
        className="inline-flex items-center gap-2 bg-primary-container text-on-background font-label-md text-label-md py-3 px-8 rounded-full hover:bg-primary hover:text-white transition-all duration-300"
      >
        <span className="material-symbols-outlined text-[18px]">storefront</span>
        Browse Shop
      </Link>
    </main>
  );
}

// ── Main Component ────────────────────────────────────────────────
export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [gallery, setGallery] = useState([]);
  const [selectedColor, setSelectedColor] = useState(null);
  const [activeImage, setActiveImage] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // ── Fetch product by ID ──
  useEffect(() => {
    setLoading(true);
    setError(null);
    setProduct(null);
    setRelatedProducts([]);
    setSelectedColor(null);
    setQuantity(1);
    setAdded(false);

    fetch(`${API_BASE}/products/${id}`)
      .then(async (res) => {
        if (res.status === 404) {
          setProduct(null);
          setLoading(false);
          return;
        }
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        const data = await res.json();
        setProduct(data);

        // Build gallery from main product images ONLY (not color images)
        const imgs = buildGallery(data);
        setGallery(imgs);

        // Always show main cover image first — color images only show on explicit user selection
        setActiveImage(imgs[0] || null);

        // Pre-select first color for price/stock display purposes only (image stays as cover)
        if (data.colors && data.colors.length > 0) {
          setSelectedColor(data.colors[0]);
        }


        setLoading(false);

        // Fetch related products (same category, exclude self, limit 4)
        fetch(`${API_BASE}/products?category=${encodeURIComponent(data.categoryName)}&exclude=${data.id}&limit=4`)
          .then((r) => r.json())
          .then((rel) => {
            if (Array.isArray(rel)) setRelatedProducts(rel);
          })
          .catch(() => {});
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  // ── Handlers ──
  function handleColorSelect(colorObj) {
    setSelectedColor(colorObj);
    if (colorObj.image) {
      setActiveImage(imgUrl(colorObj.image));
    }
  }

  function handleAddToCart() {
    if (!user) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    if (isOutOfStock) return;
    addToCart(
      {
        id: product.id,
        name: selectedColor ? `${product.name} (${selectedColor.name})` : product.name,
        price: currentPrice,
        image: activeImage,
        categoryName: product.categoryName,
      },
      quantity
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  // ── Derived state ──
  if (loading) return <ProductSkeleton />;
  if (error)
    return (
      <main className="flex-grow w-full max-w-[1200px] mx-auto px-5 md:px-16 py-16 flex flex-col items-center justify-center gap-4 text-center">
        <span className="material-symbols-outlined text-6xl text-error/60">error</span>
        <h2 className="font-title-sm text-title-sm text-error">Failed to load product</h2>
        <p className="font-body-md text-body-md text-on-surface-variant">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 bg-primary-container text-on-background font-label-md px-6 py-3 rounded-full hover:bg-primary hover:text-white transition-all"
        >
          Retry
        </button>
      </main>
    );
  if (!product) return <ProductNotFound />;

  const hasColors = product.colors && product.colors.length > 0;
  const currentPrice = selectedColor ? selectedColor.price : product.price;
  const currentStock = selectedColor ? selectedColor.stock : product.stock;
  const isOutOfStock = currentStock === 0;
  const productDetails = parseDetails(product.details);

  return (
    <main className="flex-grow w-full max-w-[1200px] mx-auto px-5 md:px-16 py-16">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-on-surface-variant font-label-md text-label-md mb-8">
        <Link to="/shop" className="hover:text-primary transition-colors">Shop</Link>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <Link to={`/shop?cat=${encodeURIComponent(product.categoryName)}`} className="hover:text-primary transition-colors">
          {product.categoryName}
        </Link>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <span className="text-primary">{product.name}</span>
      </nav>

      {/* Product Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-16 mb-16">
        {/* Image Gallery */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          {/* Main Image */}
          <div className="w-full aspect-[4/5] bg-surface-container-low rounded-lg overflow-hidden shadow-ambient relative group">
            {activeImage ? (
              <img
                src={activeImage}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-outline/40">
                <span className="material-symbols-outlined text-6xl">image</span>
              </div>
            )}
            {product.badge && (
              <div className="absolute top-4 left-4 bg-primary-container text-on-background px-3 py-1 rounded-full font-label-sm text-label-sm">
                {product.badge}
              </div>
            )}
            {selectedColor && (
              <div className="absolute bottom-4 right-4 bg-surface-container-lowest/90 backdrop-blur-sm text-on-surface px-3 py-1 rounded-full font-label-sm text-label-sm border border-outline-variant/30 flex items-center gap-1.5 shadow-sm">
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: selectedColor.hex }} />
                <span>Color: {selectedColor.name}</span>
              </div>
            )}
          </div>

          {/* Gallery Thumbnails — always show when there are main photos */}
          {gallery.length > 0 && (
            <div className="grid grid-cols-4 gap-3">
              {gallery.map((img, i) => {
                // Thumbnail is "active" when: activeImage matches it exactly
                const isActive = activeImage === img;
                return (
                  <button
                    key={i}
                    onClick={() => setActiveImage(img)}
                    title={i === 0 ? 'Main photo' : `Photo ${i + 1}`}
                    className={`aspect-square rounded-md overflow-hidden border-2 transition-all ${
                      isActive
                        ? 'border-primary opacity-100 shadow-sm scale-[0.98]'
                        : 'border-transparent opacity-60 hover:opacity-100 hover:border-outline-variant'
                    }`}
                  >
                    <img src={img} alt={`View ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="lg:col-span-5 flex flex-col justify-start">
          <div className="sticky top-[120px]">
            <h1 className="font-headline-md-mobile md:font-headline-md text-headline-md-mobile md:text-headline-md text-on-background mb-3">
              {product.name}
            </h1>

            {/* Dynamic Price & Stock */}
            <div className="flex items-center space-x-4 mb-6">
              <span className="font-title-sm text-title-sm text-on-background font-bold">
                Rs. {currentPrice.toLocaleString()}
              </span>
              {isOutOfStock ? (
                <span className="flex items-center space-x-1 text-error font-label-sm text-label-sm bg-error-container/40 px-3 py-1 rounded-full">
                  <span className="material-symbols-outlined text-[16px]">block</span>
                  <span>Out of Stock{selectedColor ? ` (${selectedColor.name})` : ''}</span>
                </span>
              ) : (
                <span className="flex items-center space-x-1 text-primary font-label-sm text-label-sm bg-primary-container/30 px-3 py-1 rounded-full">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  <span>In Stock ({currentStock} available)</span>
                </span>
              )}
            </div>

            <p className="font-body-md text-body-md text-on-surface-variant mb-6 leading-relaxed">
              {product.description}
            </p>

            {/* Color Swatch Selector */}
            {hasColors && (
              <div className="mb-6 bg-surface-container-low p-4 rounded-xl border border-outline-variant/30">
                <div className="flex justify-between items-center mb-3">
                  <label className="font-label-md text-label-md text-on-surface">
                    Selected Color:{' '}
                    <span className="font-bold text-primary">{selectedColor?.name}</span>
                  </label>
                  <span className={`font-label-sm text-label-sm ${selectedColor?.stock === 0 ? 'text-error font-bold' : 'text-on-surface-variant'}`}>
                    Rs. {selectedColor?.price.toLocaleString()} ·{' '}
                    {selectedColor?.stock === 0 ? 'Out of Stock' : `${selectedColor?.stock} in stock`}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {product.colors.map((c) => {
                    const isSelected = selectedColor?.name === c.name;
                    const cOutOfStock = c.stock === 0;
                    return (
                      <button
                        key={c.id || c.name}
                        type="button"
                        onClick={() => handleColorSelect(c)}
                        title={`${c.name} — Rs. ${c.price.toLocaleString()} ${cOutOfStock ? '(Out of Stock)' : `(${c.stock} in stock)`}`}
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
                <span className="material-symbols-outlined text-[18px]">
                  {isOutOfStock ? 'block' : added ? 'check' : 'shopping_bag'}
                </span>
                {isOutOfStock
                  ? `Out of Stock${selectedColor ? ` (${selectedColor.name})` : ''}`
                  : added
                  ? `Added${selectedColor ? ` (${selectedColor.name})` : ''}!`
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
            {productDetails.length > 0 && (
              <div className="border-t border-outline-variant pt-6">
                <h3 className="font-label-md text-label-md text-primary mb-3 font-bold">Product Details</h3>
                <ul className="space-y-2">
                  {productDetails.map((d, i) => (
                    <li key={i} className="flex items-start gap-2 font-body-md text-body-md text-on-surface-variant">
                      <span className="material-symbols-outlined text-[16px] text-primary mt-0.5">fiber_manual_record</span>
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section>
          <h2 className="font-headline-md-mobile md:font-headline-md text-headline-md-mobile md:text-headline-md text-primary mb-8">
            You Might Also Love
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((item) => (
              <Link key={item.id} to={`/product/${item.id}`} className="group flex flex-col">
                <div className="w-full aspect-[4/5] rounded-lg overflow-hidden shadow-ambient group-hover:shadow-ambient-lg transition-all duration-300 mb-3 bg-surface-container-low">
                  <img
                    src={imgUrl(item.image)}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="text-center">
                  <h4 className="font-title-sm text-title-sm text-on-surface group-hover:text-primary transition-colors">
                    {item.name}
                  </h4>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    Rs. {item.price.toLocaleString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
