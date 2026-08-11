import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = ['Bows', 'Scrunchies', 'Headbands', 'Ribbons', 'Accessories', 'Apparel', 'Bridal'];

export default function AddProduct() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', sku: '', category: 'Bows', price: '', stock: '', description: '', featured: false,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [saved, setSaved] = useState(false);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  }

  function handleImage(e) {
    const file = e.target.files[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => navigate('/admin/products'), 1500);
  }

  return (
    <div className="p-6 md:p-10 w-full max-w-4xl">
      <div className="mb-8">
        <h1 className="font-headline-md text-headline-md text-on-background">Add New Product</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">Fill in the details to add a new item to your collection.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left — Image Upload */}
          <div className="lg:col-span-1">
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient">
              <h2 className="font-title-sm text-title-sm text-primary mb-4">Product Image</h2>
              <div
                className="w-full aspect-square rounded-xl border-2 border-dashed border-outline-variant hover:border-primary transition-colors overflow-hidden cursor-pointer bg-surface-container flex items-center justify-center"
                onClick={() => document.getElementById('product-image').click()}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center">
                    <span className="material-symbols-outlined text-4xl text-outline block mb-2">add_photo_alternate</span>
                    <p className="font-label-md text-label-md text-on-surface-variant">Click to upload</p>
                    <p className="font-label-sm text-label-sm text-outline">JPG, PNG, WEBP</p>
                  </div>
                )}
              </div>
              <input id="product-image" type="file" accept="image/*" onChange={handleImage} className="hidden" />
              <div className="mt-4 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="featured"
                  name="featured"
                  checked={form.featured}
                  onChange={handleChange}
                  className="accent-primary"
                />
                <label htmlFor="featured" className="font-label-md text-label-md text-on-surface">
                  Mark as Featured
                </label>
              </div>
            </div>
          </div>

          {/* Right — Product Info */}
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient space-y-5">
              <h2 className="font-title-sm text-title-sm text-primary">Basic Information</h2>
              {[
                { name: 'name', label: 'Product Name', placeholder: 'e.g. Blush Silk Ribbon Bow' },
                { name: 'sku', label: 'SKU Code', placeholder: 'e.g. RB-007' },
              ].map(({ name, label, placeholder }) => (
                <div key={name}>
                  <label className="font-label-md text-label-md text-on-surface mb-1 block">{label}</label>
                  <input
                    name={name} value={form[name]} onChange={handleChange} placeholder={placeholder} required
                    className="w-full border-b-2 border-outline-variant focus:border-primary outline-none py-3 font-body-md text-body-md text-on-surface placeholder:text-outline bg-transparent transition-colors"
                  />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-label-md text-label-md text-on-surface mb-1 block">Category</label>
                  <select
                    name="category" value={form.category} onChange={handleChange}
                    className="w-full border border-outline-variant rounded-lg px-3 py-3 font-body-md text-body-md text-on-surface bg-surface-container-lowest"
                  >
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="font-label-md text-label-md text-on-surface mb-1 block">Price (USD)</label>
                  <input
                    type="number" name="price" value={form.price} onChange={handleChange} placeholder="0.00" min="0" step="0.01" required
                    className="w-full border-b-2 border-outline-variant focus:border-primary outline-none py-3 font-body-md text-body-md text-on-surface bg-transparent transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="font-label-md text-label-md text-on-surface mb-1 block">Stock Quantity</label>
                <input
                  type="number" name="stock" value={form.stock} onChange={handleChange} placeholder="0" min="0" required
                  className="w-full border-b-2 border-outline-variant focus:border-primary outline-none py-3 font-body-md text-body-md text-on-surface bg-transparent transition-colors"
                />
              </div>
              <div>
                <label className="font-label-md text-label-md text-on-surface mb-1 block">Description</label>
                <textarea
                  name="description" value={form.description} onChange={handleChange}
                  rows={4} placeholder="Describe your handcrafted product..."
                  className="w-full border-b-2 border-outline-variant focus:border-primary outline-none py-3 font-body-md text-body-md text-on-surface bg-transparent transition-colors resize-none"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-3">
              <button
                type="submit"
                className={`py-3 px-8 rounded-lg font-label-md text-label-md transition-all duration-300 flex items-center gap-2 ${
                  saved ? 'bg-primary text-white' : 'bg-primary-container text-on-background hover:bg-primary hover:text-white shadow-ambient'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{saved ? 'check' : 'save'}</span>
                {saved ? 'Product Added!' : 'Add Product'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/admin/products')}
                className="py-3 px-8 border border-outline-variant text-on-surface-variant font-label-md text-label-md rounded-lg hover:bg-surface-container transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
