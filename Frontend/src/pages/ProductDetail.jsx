import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const API_BASE = 'http://localhost:5050/api';

// Helper: build image URL
function imgUrl(path) {
  if (!path) return '/14_blush_silk_ribbon_bow.jpg';
  if (path.startsWith('http')) return path;
  if (path.startsWith('/uploads')) return `http://localhost:5050${path}`;
  return path;
}

function parseDetails(details) {
  if (!details) return [];
  if (Array.isArray(details)) {
    return details
      .map((d) => (typeof d === 'object' && d !== null ? `${d.key || ''}: ${d.value || ''}` : String(d)))
      .filter(Boolean);
  }
  try {
    const parsed = JSON.parse(details);
    if (Array.isArray(parsed)) {
      return parsed
        .map((d) => (typeof d === 'object' && d !== null ? `${d.key || ''}: ${d.value || ''}` : String(d)))
        .filter(Boolean);
    }
    return String(parsed).split('\n').map((s) => s.trim()).filter(Boolean);
  } catch {
    return String(details).split('\n').map((s) => s.trim()).filter(Boolean);
  }
}

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

function buildGallery(product) {
  const urls = [];
  if (product.image) urls.push(imgUrl(product.image));
  const subImages = parseGalleryImages(product.galleryImages);
  subImages.forEach((u) => {
    if (u && !urls.includes(u)) urls.push(u);
  });
  return urls.filter(Boolean);
}

function parseFormattedText(text) {
  if (!text) return null;

  const colonIdx = text.indexOf(':');

  if (!text.includes('**') && colonIdx > 0) {
    const title = text.slice(0, colonIdx + 1);
    const rest = text.slice(colonIdx + 1);
    return (
      <>
        <strong className="font-extrabold text-slate-900 dark:text-white" style={{ fontWeight: 800 }}>
          {title}
        </strong>
        {rest}
      </>
    );
  }

  const parts = text.split(/(\*\*.*?\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
          return (
            <strong key={i} className="font-extrabold text-slate-900 dark:text-white" style={{ fontWeight: 800 }}>
              {part.slice(2, -2)}
            </strong>
          );
        }

        if (i === 0 && part.includes(':')) {
          const cIdx = part.indexOf(':');
          const t = part.slice(0, cIdx + 1);
          const r = part.slice(cIdx + 1);
          return (
            <span key={i}>
              <strong className="font-extrabold text-slate-900 dark:text-white" style={{ fontWeight: 800 }}>
                {t}
              </strong>
              {r}
            </span>
          );
        }

        return part;
      })}
    </>
  );
}

function renderDescriptionItem(line, idx) {
  const trimmed = line.trim();
  if (!trimmed) return null;

  const numMatch = trimmed.match(/^(\d+[\.\)]\s*)/);
  const numberPrefix = numMatch ? numMatch[1] : '';

  const hasExplicitBullet = /^([•\-\*])\s*/.test(trimmed);

  const cleanText = trimmed.replace(/^([•\-\*]|(\d+[\.\)]))\s*/, '').trim();
  if (!cleanText) return null;

  const formattedContent = parseFormattedText(cleanText);

  if (numberPrefix) {
    return (
      <li key={idx} className="flex items-start gap-2.5 text-on-surface font-medium leading-relaxed">
        <span className="font-extrabold text-slate-900 dark:text-white shrink-0 min-w-[20px]" style={{ fontWeight: 800 }}>
          {numberPrefix}
        </span>
        <div className="flex-1">{formattedContent}</div>
      </li>
    );
  }

  if (hasExplicitBullet) {
    return (
      <li key={idx} className="flex items-start gap-2.5 text-on-surface font-medium leading-relaxed">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-900 dark:bg-slate-100 mt-2 shrink-0" />
        <div className="flex-1">{formattedContent}</div>
      </li>
    );
  }

  return (
    <li key={idx} className="text-on-surface font-medium leading-relaxed list-none">
      {formattedContent}
    </li>
  );
}

// ── Loading Skeleton ──────────────────────────────────────────────
function ProductSkeleton() {
  return (
    <main className="flex-grow w-full max-w-[1400px] mx-auto px-4 sm:px-8 py-10 animate-pulse">
      <div className="h-8 bg-surface-container rounded w-2/3 mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-6 aspect-square bg-surface-container rounded-lg" />
        <div className="lg:col-span-6 space-y-4">
          <div className="h-10 bg-surface-container rounded w-1/2" />
          <div className="h-32 bg-surface-container rounded" />
          <div className="h-12 bg-surface-container rounded" />
        </div>
      </div>
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

  // Layout states matching user's format reference
  const [activeTab, setActiveTab] = useState('description');
  const [warrantyPrice, setWarrantyPrice] = useState(0);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewerName, setReviewerName] = useState('');
  const [userReview, setUserReview] = useState('');
  const [userRating, setUserRating] = useState(5);
  const [reviewsList, setReviewsList] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [showAllReviews, setShowAllReviews] = useState(false);

  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setLoading(true);
    setError(null);
    setProduct(null);

    fetch(`${API_BASE}/products/${id}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        const data = await res.json();
        setProduct(data);

        const imgs = buildGallery(data);
        setGallery(imgs);
        setActiveImage(imgs[0] || null);

        if (data.colors && data.colors.length > 0) {
          setSelectedColor(data.colors[0]);
        }

        setLoading(false);

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

    // Fetch Product Reviews
    fetch(`${API_BASE}/products/${id}/reviews`)
      .then((r) => r.json())
      .then((resData) => {
        if (resData && Array.isArray(resData.reviews)) {
          setReviewsList(resData.reviews);
          setAverageRating(resData.averageRating || 0);
        }
      })
      .catch(() => {});
  }, [id]);

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
        price: currentPrice + warrantyPrice,
        image: activeImage,
        categoryName: product.categoryName,
        warranty: warrantyPrice > 0 ? `Extended Warranty (+Rs. ${warrantyPrice})` : null,
      },
      quantity
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  function handleAddReview(e) {
    e.preventDefault();
    if (!userReview.trim()) return;

    // Immediately close the modal form upon submitting
    setShowReviewModal(false);

    const authorName = reviewerName.trim() || user?.fullName || user?.name || 'Verified Customer';

    fetch(`${API_BASE}/products/${id}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userName: authorName,
        userEmail: user?.email || '',
        rating: userRating,
        comment: userReview,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to submit review');
        return res.json();
      })
      .then(() => {
        toast.success('Thank you for your review!');
        setUserReview('');
        setReviewerName('');
        fetch(`${API_BASE}/products/${id}/reviews`)
          .then((r) => r.json())
          .then((resData) => {
            if (resData && Array.isArray(resData.reviews)) {
              setReviewsList(resData.reviews);
              setAverageRating(resData.averageRating || 0);
            }
          });
      })
      .catch((err) => {
        console.error(err);
        toast.error('Failed to submit review');
      });
  }

  if (loading) return <ProductSkeleton />;
  if (error || !product) return null;

  const currentPrice = selectedColor ? selectedColor.price : product.price;
  const isOutOfStock = product.stock === 0;
  const detailsList = parseDetails(product.details);

  return (
    <main className="flex-grow w-full max-w-[1400px] mx-auto px-4 sm:px-8 md:px-12 py-8 font-sans">
      {/* Top Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-on-surface-variant text-sm mb-4">
        <Link to="/shop" className="hover:text-primary transition-colors">Shop</Link>
        <span>/</span>
        <Link to={`/shop?cat=${encodeURIComponent(product.categoryName)}`} className="hover:text-primary transition-colors">
          {product.categoryName}
        </Link>
        <span>/</span>
        <span className="text-on-surface font-semibold">{product.name}</span>
      </nav>

      {/* Main Product Header Title with Blue Accent Underline */}
      <div className="border-b-2 border-primary pb-2 mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
          {product.name} <span className="text-on-surface-variant font-normal">[Digital License]</span>
        </h1>
      </div>

      {/* Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-16">
        {/* Left Column: Product Image Showcase */}
        <div className="lg:col-span-6 flex flex-col space-y-4">
          <div className="w-full aspect-square bg-surface-container-low rounded-xl border border-outline-variant/50 overflow-hidden relative shadow-md group">
            <img
              src={activeImage || imgUrl(product.image)}
              alt={product.name}
              className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
            />
            {/* NEW Badge */}
            <div className="absolute top-3 right-3 bg-black text-white text-xs font-bold uppercase px-2.5 py-1 rounded shadow">
              NEW
            </div>
          </div>

          {/* Thumbnails */}
          {gallery.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {gallery.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(img)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                    activeImage === img ? 'border-primary shadow-md' : 'border-outline-variant/40 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Description Tabs, Details, Stats & Purchase Buttons */}
        <div className="lg:col-span-6 flex flex-col space-y-6">
          {/* Tabs: DESCRIPTION | REVIEWS */}
          <div className="flex border-b border-outline-variant">
            <button
              onClick={() => setActiveTab('description')}
              className={`py-2 px-4 font-bold text-sm uppercase tracking-wider transition-colors border-b-2 ${
                activeTab === 'description'
                  ? 'border-primary text-primary font-extrabold'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Description
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`py-2 px-4 font-bold text-sm uppercase tracking-wider transition-colors border-b-2 ${
                activeTab === 'reviews'
                  ? 'border-primary text-primary font-extrabold'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Reviews ({reviewsList.length})
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'description' ? (
            <div className="space-y-5 text-sm text-on-surface-variant leading-relaxed">
              {/* Product Feature Bullet Points (Dynamic from Product Description) */}
              <div className="bg-surface-container-low/60 p-4 rounded-xl border border-outline-variant/30 space-y-2">
                <ul className="space-y-2 text-on-surface font-medium">
                  {product.description ? (
                    product.description
                      .split('\n')
                      .map((line, idx) => {
                        const trimmed = line.trim();
                        if (!trimmed) {
                          return <li key={idx} className="h-2 list-none" />;
                        }
                        return renderDescriptionItem(trimmed, idx);
                      })
                  ) : (
                    <>
                      <li className="flex items-start gap-2.5">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-800 dark:bg-slate-200 mt-2 shrink-0" />
                        <div>You will receive 1x authentic digital activation key delivered instantly to your dashboard/email.</div>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-800 dark:bg-slate-200 mt-2 shrink-0" />
                        <div>Only one-time activation - Permanent lifetime key for your device.</div>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-800 dark:bg-slate-200 mt-2 shrink-0" />
                        <div>Friendly and professional 24/7 technical customer support.</div>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-800 dark:bg-slate-200 mt-2 shrink-0" />
                        <div>Experience fast and convenient instant digital product delivery.</div>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-800 dark:bg-slate-200 mt-2 shrink-0" />
                        <div>7 Days one-to-one replacement warranty. Guaranteed 100% Authentic Licenses.</div>
                      </li>
                    </>
                  )}
                </ul>
              </div>

              {/* Download Links (Only shown if a download URL is provided) */}
              {product.downloadUrl && product.downloadUrl.trim() && (
                <div className="pt-2 flex items-center gap-2 font-bold text-xs sm:text-sm">
                  <span className="text-on-surface uppercase">Download Links:</span>
                  <a
                    href={product.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline hover:text-blue-700 uppercase font-extrabold flex items-center gap-1"
                  >
                    Click Here to Download
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-surface-container-low p-4 rounded-lg">
                <div>
                  <h4 className="font-bold text-on-surface">Customer Reviews</h4>
                  <p className="text-xs text-on-surface-variant">
                    {reviewsList.length === 0
                      ? 'Based on 0 reviews.'
                      : `Average rating: ${averageRating} / 5.0 (${reviewsList.length} reviews)`}
                  </p>
                </div>
                <button
                  onClick={() => setShowReviewModal(true)}
                  className="bg-primary text-white text-xs font-bold py-2 px-4 rounded-md hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  Write a review
                </button>
              </div>

              {reviewsList.length === 0 ? (
                <p className="text-sm text-on-surface-variant italic py-4">No reviews yet. Be the first to review this product!</p>
              ) : (
                <div className="space-y-4">
                  <div className={`space-y-3 ${showAllReviews && reviewsList.length > 10 ? 'max-h-[550px] overflow-y-auto pr-2 custom-scrollbar' : ''}`}>
                    {(showAllReviews ? reviewsList : reviewsList.slice(0, 10)).map((rev) => (
                      <div key={rev.id} className="p-3.5 bg-surface-container rounded-lg border border-outline-variant/40 space-y-1">
                        <div className="flex justify-between items-center text-xs font-bold text-on-surface">
                          <span>{rev.userName || rev.author || 'Verified Customer'}</span>
                          <div className="flex items-center text-amber-500">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span key={star} className="text-sm">
                                {star <= rev.rating ? '★' : '☆'}
                              </span>
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-on-surface-variant leading-relaxed">{rev.comment || rev.text}</p>
                        <p className="text-[10px] text-on-surface-variant/60">
                          {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'Recently'}
                        </p>
                      </div>
                    ))}
                  </div>

                  {reviewsList.length > 10 && (
                    <div className="text-center pt-2">
                      <button
                        onClick={() => setShowAllReviews(!showAllReviews)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-surface-container-high hover:bg-surface-container-highest text-primary font-bold text-xs rounded-xl transition-all border border-outline-variant/50 cursor-pointer shadow-xs"
                      >
                        <span className="material-symbols-outlined text-lg">
                          {showAllReviews ? 'unfold_less' : 'unfold_more'}
                        </span>
                        {showAllReviews
                          ? 'Collapse to Top 10 Reviews'
                          : `View All ${reviewsList.length} Reviews (${reviewsList.length - 10} more)`}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Rating Summary Bar */}
          <div className="flex items-center gap-3 text-xs text-on-surface-variant pt-2 border-t border-outline-variant/40">
            <span className="text-amber-500 tracking-widest text-base">
              {'★'.repeat(Math.round(averageRating || 5))}
              {'☆'.repeat(5 - Math.round(averageRating || 5))}
            </span>
            <span>Based on {reviewsList.length} reviews ({averageRating || 5.0} avg).</span>
            <span>-</span>
            <button onClick={() => { setActiveTab('reviews'); setShowReviewModal(true); }} className="text-primary underline hover:text-blue-700 font-medium cursor-pointer">
              Write a review
            </button>
          </div>

          {/* Price & Stats Bar */}
          <div className="py-4 border-y border-outline-variant/60 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-on-surface">
                Rs. {(currentPrice + warrantyPrice).toLocaleString()}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs">
              {isOutOfStock ? (
                <span className="bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 font-bold px-2.5 py-1 rounded flex items-center gap-1">
                  ✕ OUT OF STOCK
                </span>
              ) : (
                <span className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold px-2.5 py-1 rounded flex items-center gap-1">
                  ✓ IN STOCK
                </span>
              )}
              {(product.hasCidPoints !== false && product.isCidAvailable !== false) && (
                <span className="text-on-surface-variant font-bold">• CID Points: 1</span>
              )}
              <span className="text-amber-700 font-bold">🔥 845 Sold</span>
              <span className="text-on-surface-variant">👁️ 9595 Views</span>
            </div>
          </div>

          {/* Extended Warranty Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-on-surface uppercase tracking-wide">
              Extended Warranty
            </label>
            <select
              value={warrantyPrice}
              onChange={(e) => setWarrantyPrice(Number(e.target.value))}
              className="w-full bg-surface border border-outline-variant rounded-md px-3 py-2 text-sm text-on-surface font-medium focus:ring-2 focus:ring-primary focus:outline-none"
            >
              <option value={0}>No Warranty (Included)</option>
              <option value={100}>30 Days (+Rs. 100)</option>
              <option value={200}>60 Days (+Rs. 200)</option>
              <option value={500}>1 Year (+Rs. 500)</option>
            </select>
          </div>

          {/* Quantity Selector + Add to Cart + Buy Now + Help Button */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {/* Quantity Selector with Spinner Arrows */}
            <div className="flex items-center border border-outline-variant rounded-md bg-surface h-12 w-20 relative overflow-hidden">
              <input
                type="number"
                value={quantity}
                readOnly
                className="w-12 h-full text-center font-bold text-on-surface text-base bg-transparent focus:outline-none"
              />
              <div className="flex flex-col border-l border-outline-variant h-full w-8">
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="h-1/2 flex items-center justify-center hover:bg-surface-container text-on-surface text-xs font-bold border-b border-outline-variant"
                >
                  ▲
                </button>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="h-1/2 flex items-center justify-center hover:bg-surface-container text-on-surface text-xs font-bold"
                >
                  ▼
                </button>
              </div>
            </div>

            {/* ADD TO CART Button (Red) */}
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`flex-1 min-w-[140px] h-12 rounded-md font-bold text-xs sm:text-sm uppercase tracking-wider text-white transition-all flex items-center justify-center gap-2 shadow-md ${
                added ? 'bg-emerald-600' : 'bg-red-600 hover:bg-red-700'
              } disabled:opacity-50`}
            >
              <span className="material-symbols-outlined text-[18px]">shopping_cart</span>
              {added ? 'ADDED!' : 'ADD TO CART'}
            </button>

            {/* BUY NOW Button (Blue) */}
            <button
              onClick={() => { handleAddToCart(); navigate('/checkout'); }}
              disabled={isOutOfStock}
              className="flex-1 min-w-[140px] h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-bold text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">bolt</span>
              BUY NOW
            </button>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="pt-8 border-t border-outline-variant/50">
          <h2 className="text-xl font-bold text-on-surface mb-6">You Might Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((item) => (
              <Link key={item.id} to={`/product/${item.id}`} className="group flex flex-col">
                <div className="w-full aspect-square rounded-lg overflow-hidden border border-outline-variant/40 bg-surface-container-low mb-3 p-2">
                  <img
                    src={imgUrl(item.image)}
                    alt={item.name}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors">
                    {item.name}
                  </h4>
                  <p className="text-xs text-on-surface-variant">
                    Rs. {item.price.toLocaleString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface p-6 rounded-xl max-w-md w-full border border-outline-variant shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-on-surface">Write a Product Review</h3>
            
            <form onSubmit={handleAddReview} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-on-surface block mb-1">Your Name</label>
                <input
                  type="text"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  placeholder={user?.fullName || user?.name || "e.g. Alex Morgan"}
                  className="w-full p-2 border border-outline-variant rounded-md text-sm bg-surface-container-lowest"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-on-surface block mb-1">Rating</label>
                <select
                  value={userRating}
                  onChange={(e) => setUserRating(Number(e.target.value))}
                  className="w-full p-2 border border-outline-variant rounded-md text-sm"
                >
                  <option value={5}>5 Stars - Excellent</option>
                  <option value={4}>4 Stars - Very Good</option>
                  <option value={3}>3 Stars - Average</option>
                  <option value={2}>2 Stars - Poor</option>
                  <option value={1}>1 Star - Terrible</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-on-surface block mb-1">Review Message</label>
                <textarea
                  rows={4}
                  value={userReview}
                  onChange={(e) => setUserReview(e.target.value)}
                  placeholder="Share your experience with this digital product..."
                  className="w-full p-2 border border-outline-variant rounded-md text-sm"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-2 text-xs font-bold text-on-surface-variant hover:text-on-surface cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-md hover:bg-blue-700 cursor-pointer"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
