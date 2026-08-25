import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const API_BASE = 'http://localhost:5050/api';

const STATUS_COLORS = {
  APPROVED: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300',
  PENDING: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300',
  REJECTED: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300',
};

export default function ReviewManagement() {
  const { token } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedProductFilter, setSelectedProductFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State for Adding Review
  const [showAddModal, setShowAddModal] = useState(false);
  const [newReviewForm, setNewReviewForm] = useState({
    productId: '',
    userName: '',
    userEmail: '',
    rating: 5,
    comment: '',
    status: 'APPROVED',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReviews();
    fetchProducts();
  }, [token]);

  function fetchReviews() {
    setLoading(true);
    fetch(`${API_BASE}/admin/reviews`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch reviews');
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) setReviews(data);
      })
      .catch((err) => {
        console.error(err);
        toast.error('Failed to load reviews');
      })
      .finally(() => setLoading(false));
  }

  function fetchProducts() {
    fetch(`${API_BASE}/products`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setProducts(data);
      })
      .catch(() => {});
  }

  function handleStatusChange(reviewId, newStatus) {
    fetch(`${API_BASE}/admin/reviews/${reviewId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: newStatus }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to update review status');
        return res.json();
      })
      .then((updated) => {
        setReviews((prev) => prev.map((r) => (r.id === reviewId ? updated : r)));
        toast.success(`Review ${newStatus.toLowerCase()} successfully`);
      })
      .catch((err) => {
        console.error(err);
        toast.error('Failed to update status');
      });
  }

  function handleDeleteReview(reviewId) {
    if (!window.confirm('Are you sure you want to delete this review?')) return;

    fetch(`${API_BASE}/admin/reviews/${reviewId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to delete review');
        setReviews((prev) => prev.filter((r) => r.id !== reviewId));
        toast.success('Review deleted');
      })
      .catch((err) => {
        console.error(err);
        toast.error('Failed to delete review');
      });
  }

  function handleCreateReview(e) {
    e.preventDefault();
    if (!newReviewForm.productId || !newReviewForm.userName || !newReviewForm.comment) {
      toast.error('Product, Author Name, and Comment are required');
      return;
    }

    // Immediately close modal
    setShowAddModal(false);
    setSubmitting(true);
    fetch(`${API_BASE}/admin/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newReviewForm),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to create review');
        return res.json();
      })
      .then((created) => {
        setReviews((prev) => [created, ...prev]);
        toast.success('Review added successfully');
        setNewReviewForm({
          productId: '',
          userName: '',
          userEmail: '',
          rating: 5,
          comment: '',
          status: 'APPROVED',
        });
      })
      .catch((err) => {
        console.error(err);
        toast.error('Failed to add review');
      })
      .finally(() => setSubmitting(false));
  }

  // Filtered List
  const filteredReviews = reviews.filter((r) => {
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    const matchesProduct = selectedProductFilter === 'ALL' || r.productId === selectedProductFilter;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      r.userName.toLowerCase().includes(searchLower) ||
      r.comment.toLowerCase().includes(searchLower) ||
      (r.product?.name && r.product.name.toLowerCase().includes(searchLower));

    return matchesStatus && matchesProduct && matchesSearch;
  });

  // Calculate statistics
  const totalCount = reviews.length;
  const pendingCount = reviews.filter((r) => r.status === 'PENDING').length;
  const approvedCount = reviews.filter((r) => r.status === 'APPROVED').length;
  const rejectedCount = reviews.filter((r) => r.status === 'REJECTED').length;
  const avgRating = totalCount > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalCount).toFixed(1)
    : '0.0';

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-full mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-3xl">rate_review</span>
            Product Reviews
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Manage, approve, reject, or create customer reviews across your product catalog.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-medium shadow-md hover:bg-blue-700 transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          Add Review
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/30 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-primary-container/30 text-primary rounded-xl">
            <span className="material-symbols-outlined text-2xl">rate_review</span>
          </div>
          <div>
            <p className="text-xs text-on-surface-variant font-medium">Total Reviews</p>
            <p className="text-2xl font-bold text-on-surface">{totalCount}</p>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-100 text-amber-600 rounded-xl dark:bg-amber-950/40">
            <span className="material-symbols-outlined text-2xl">pending_actions</span>
          </div>
          <div>
            <p className="text-xs text-on-surface-variant font-medium">Pending Approval</p>
            <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl dark:bg-emerald-950/40">
            <span className="material-symbols-outlined text-2xl">verified</span>
          </div>
          <div>
            <p className="text-xs text-on-surface-variant font-medium">Approved</p>
            <p className="text-2xl font-bold text-emerald-600">{approvedCount}</p>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
            <span className="material-symbols-outlined text-2xl">star</span>
          </div>
          <div>
            <p className="text-xs text-on-surface-variant font-medium">Avg Rating</p>
            <p className="text-2xl font-bold text-on-surface">{avgRating} / 5.0</p>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Status Tabs */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {['ALL', 'APPROVED', 'PENDING', 'REJECTED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              {st === 'ALL' ? 'All Reviews' : st}
            </button>
          ))}
        </div>

        {/* Search & Product Dropdown */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* Product Filter */}
          <select
            value={selectedProductFilter}
            onChange={(e) => setSelectedProductFilter(e.target.value)}
            className="w-full sm:w-52 bg-surface-container border border-outline-variant/40 rounded-xl px-3 py-2 text-xs font-medium text-on-surface outline-none focus:border-primary"
          >
            <option value="ALL">All Products</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-lg">
              search
            </span>
            <input
              type="text"
              placeholder="Search author, comment..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-container border border-outline-variant/40 rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-on-surface outline-none focus:border-primary"
            />
          </div>
        </div>
      </div>

      {/* Reviews Table / Cards */}
      {loading ? (
        <div className="p-12 text-center text-on-surface-variant">
          <span className="material-symbols-outlined animate-spin text-3xl">sync</span>
          <p className="text-sm mt-2 font-medium">Loading reviews...</p>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="bg-surface-container-lowest p-12 rounded-2xl border border-outline-variant/30 text-center">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant/50 mb-2">rate_review</span>
          <h3 className="text-base font-bold text-on-surface">No reviews found</h3>
          <p className="text-xs text-on-surface-variant mt-1">Try clearing your search query or filters.</p>
        </div>
      ) : (
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/30 bg-surface-container-low text-on-surface-variant text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-5 sm:px-6">Product</th>
                  <th className="py-3.5 px-5 sm:px-6">Author & Rating</th>
                  <th className="py-3.5 px-5 sm:px-6">Review Comment</th>
                  <th className="py-3.5 px-5 sm:px-6">Status</th>
                  <th className="py-3.5 px-5 sm:px-6">Date</th>
                  <th className="py-3.5 px-5 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 text-xs">
                {filteredReviews.map((rev) => (
                  <tr key={rev.id} className="hover:bg-surface-container-low/50 transition-colors">
                    {/* Product Cell */}
                    <td className="py-4 px-5 sm:px-6">
                      <div className="flex items-center gap-3">
                        {rev.product?.image ? (
                          <img
                            src={rev.product.image}
                            alt={rev.product.name}
                            className="w-10 h-10 object-contain rounded-lg border border-outline-variant/30 bg-white"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-surface-container rounded-lg flex items-center justify-center text-on-surface-variant">
                            <span className="material-symbols-outlined text-lg">inventory_2</span>
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-on-surface line-clamp-1">{rev.product?.name || 'Deleted Product'}</p>
                          <p className="text-[10px] text-on-surface-variant">{rev.product?.categoryName}</p>
                        </div>
                      </div>
                    </td>

                    {/* Author & Rating */}
                    <td className="py-4 px-5 sm:px-6">
                      <p className="font-bold text-on-surface">{rev.userName}</p>
                      {rev.userEmail && <p className="text-[11px] text-on-surface-variant">{rev.userEmail}</p>}
                      <div className="flex items-center gap-0.5 text-amber-500 mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className={`material-symbols-outlined text-sm ${
                              star <= rev.rating ? 'fill-1' : 'opacity-30'
                            }`}
                          >
                            star
                          </span>
                        ))}
                        <span className="text-[11px] font-bold text-on-surface ml-1">{rev.rating}.0</span>
                      </div>
                    </td>

                    {/* Comment */}
                    <td className="py-4 px-5 sm:px-6 max-w-xs sm:max-w-md">
                      <p className="text-on-surface leading-relaxed whitespace-pre-wrap">{rev.comment}</p>
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-5 sm:px-6 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                          STATUS_COLORS[rev.status] || STATUS_COLORS.PENDING
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {rev.status}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-4 px-5 sm:px-6 whitespace-nowrap text-on-surface-variant">
                      {new Date(rev.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-5 sm:px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        {rev.status !== 'APPROVED' && (
                          <button
                            onClick={() => handleStatusChange(rev.id, 'APPROVED')}
                            title="Approve Review"
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-lg">check_circle</span>
                          </button>
                        )}
                        {rev.status !== 'REJECTED' && (
                          <button
                            onClick={() => handleStatusChange(rev.id, 'REJECTED')}
                            title="Reject Review"
                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-lg">cancel</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteReview(rev.id)}
                          title="Delete Review"
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Review Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-6 shadow-xl border border-outline-variant/30 space-y-4">
            <div className="flex justify-between items-center border-b border-outline-variant/30 pb-3">
              <h3 className="font-bold text-lg text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">rate_review</span>
                Add Product Review
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-on-surface-variant hover:text-on-surface p-1 cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateReview} className="space-y-4">
              {/* Product Select */}
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Product <span className="text-error">*</span>
                </label>
                <select
                  value={newReviewForm.productId}
                  onChange={(e) => setNewReviewForm({ ...newReviewForm, productId: e.target.value })}
                  className="w-full bg-surface-container border border-outline-variant/40 rounded-xl px-3 py-2 text-xs font-medium text-on-surface outline-none focus:border-primary"
                  required
                >
                  <option value="">Select a product...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Author Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">
                    Author Name <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. John Doe"
                    value={newReviewForm.userName}
                    onChange={(e) => setNewReviewForm({ ...newReviewForm, userName: e.target.value })}
                    className="w-full bg-surface-container border border-outline-variant/40 rounded-xl px-3 py-2 text-xs font-medium text-on-surface outline-none focus:border-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">Author Email (Optional)</label>
                  <input
                    type="email"
                    placeholder="e.g. john@example.com"
                    value={newReviewForm.userEmail}
                    onChange={(e) => setNewReviewForm({ ...newReviewForm, userEmail: e.target.value })}
                    className="w-full bg-surface-container border border-outline-variant/40 rounded-xl px-3 py-2 text-xs font-medium text-on-surface outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Rating & Initial Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">Rating Stars</label>
                  <div className="flex items-center gap-1 py-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewReviewForm({ ...newReviewForm, rating: star })}
                        className="text-amber-500 cursor-pointer focus:outline-none"
                      >
                        <span className={`material-symbols-outlined text-2xl ${star <= newReviewForm.rating ? 'fill-1' : ''}`}>
                          star
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">Status</label>
                  <select
                    value={newReviewForm.status}
                    onChange={(e) => setNewReviewForm({ ...newReviewForm, status: e.target.value })}
                    className="w-full bg-surface-container border border-outline-variant/40 rounded-xl px-3 py-2 text-xs font-medium text-on-surface outline-none focus:border-primary"
                  >
                    <option value="APPROVED">APPROVED</option>
                    <option value="PENDING">PENDING</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>
                </div>
              </div>

              {/* Comment */}
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Review Comment <span className="text-error">*</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="Write the review text..."
                  value={newReviewForm.comment}
                  onChange={(e) => setNewReviewForm({ ...newReviewForm, comment: e.target.value })}
                  className="w-full bg-surface-container border border-outline-variant/40 rounded-xl p-3 text-xs font-medium text-on-surface outline-none focus:border-primary"
                  required
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-2 border-t border-outline-variant/30">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-bold text-on-surface-variant hover:bg-surface-container rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-bold bg-primary text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Add Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
