import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const API_BASE = 'http://localhost:5050/api';

const INITIAL_SPECS = [
  { id: '1', key: 'Material', value: '' },
  { id: '2', key: 'Width', value: '' },
  { id: '3', key: 'Length', value: '' },
  { id: '4', key: 'Care Instructions', value: '' },
  { id: '5', key: 'Origin / Craftsmanship', value: 'Handmade with love in Sri Lanka' },
];

function sanitizeDecimal(val) {
  if (typeof val !== 'string') val = String(val ?? '');
  let clean = val.replace(/[^0-9.]/g, '');
  const parts = clean.split('.');
  if (parts.length > 2) {
    clean = parts[0] + '.' + parts.slice(1).join('');
  }
  return clean;
}

function sanitizeInteger(val) {
  if (typeof val !== 'string') val = String(val ?? '');
  return val.replace(/[^0-9]/g, '');
}

export default function AddProduct() {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [categories, setCategories] = useState([]);
  const [catLoading, setCatLoading] = useState(true);

  const [form, setForm] = useState({
    name: '',
    category: '',
    price: '',
    stock: '',
    description: '',
    badge: '',
    featured: false,
    standardShipping: '',
    expressShipping: '',
  });

  const [specs, setSpecs] = useState(INITIAL_SPECS);
  const [colors, setColors] = useState([]);

  // Image state: { file, preview, url } — url set after upload
  const [mainImageFile, setMainImageFile] = useState(null);
  const [mainImagePreview, setMainImagePreview] = useState(null);
  const [mainImageUrl, setMainImageUrl] = useState('');

  const [subImageFiles, setSubImageFiles] = useState([null, null, null]);
  const [subImagePreviews, setSubImagePreviews] = useState([null, null, null]);
  const [subImageUrls, setSubImageUrls] = useState(['', '', '']);

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [serverError, setServerError] = useState('');

  const authHeaders = { Authorization: `Bearer ${token}` };

  // Load DB categories
  useEffect(() => {
    fetch(`${API_BASE}/categories?all=true`, { headers: authHeaders })
      .then((r) => r.json())
      .then((data) => {
        if (data.categories?.length) {
          setCategories(data.categories);
          setForm((f) => ({ ...f, category: data.categories[0].name }));
        }
      })
      .catch(() => {})
      .finally(() => setCatLoading(false));
  }, []);

  // ── Handlers ──────────────────────────────────────────────────────────

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    let finalVal = type === 'checkbox' ? checked : value;

    if (name === 'price' || name === 'standardShipping' || name === 'expressShipping') {
      finalVal = sanitizeDecimal(value);
    } else if (name === 'stock') {
      finalVal = sanitizeInteger(value);
    }

    const newForm = { ...form, [name]: finalVal };
    setForm(newForm);

    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validateField(name, finalVal, newForm) }));
    } else {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  }

  function handleBlur(e) {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const err = validateField(name, value, form);
    setErrors((prev) => ({ ...prev, [name]: err }));
  }

  // Per-field validator
  function validateField(name, value, currentForm) {
    switch (name) {
      case 'name':
        return !value?.trim() ? 'Product name is required.' : '';
      case 'description':
        return !value?.trim() ? 'Short description is required.' : value.trim().length < 10 ? 'Description must be at least 10 characters.' : '';
      case 'category':
        return !value ? 'Please select a category.' : '';
      case 'price':
        if (colors.length > 0) return '';
        if (!value) return 'Price is required.';
        if (parseFloat(value) <= 0) return 'Price must be greater than 0.';
        return '';
      case 'stock':
        if (colors.length > 0) return '';
        if (value === '' || value === null || value === undefined) return 'Stock quantity is required.';
        if (parseInt(value) < 0) return 'Stock cannot be negative.';
        return '';
      case 'standardShipping':
        if (!value) return '';
        if (parseFloat(value) < 0) return 'Shipping fee cannot be negative.';
        return '';
      case 'expressShipping':
        if (!value) return '';
        if (parseFloat(value) < 0) return 'Shipping fee cannot be negative.';
        if (currentForm.standardShipping && parseFloat(value) <= parseFloat(currentForm.standardShipping))
          return 'Express fee should be higher than standard fee.';
        return '';
      default:
        return '';
    }
  }

  // Specs
  function handleSpecChange(index, field, value) {
    const updated = [...specs];
    updated[index][field] = value;
    setSpecs(updated);
  }
  function handleAddSpec() {
    setSpecs([...specs, { id: Date.now().toString(), key: '', value: '' }]);
  }
  function handleRemoveSpec(index) {
    setSpecs(specs.filter((_, i) => i !== index));
  }

  // Colors
  function handleColorChange(index, field, value) {
    const updated = [...colors];
    if (field === 'stock') {
      updated[index][field] = sanitizeInteger(value);
    } else if (field === 'price') {
      updated[index][field] = sanitizeDecimal(value);
    } else {
      updated[index][field] = value;
    }
    setColors(updated);
  }
  function handleAddColor() {
    setColors([...colors, { id: Date.now().toString(), name: '', hex: '#fadadd', imageFile: null, imagePreview: null, imageUrl: '', price: '', stock: '10' }]);
  }
  function handleRemoveColor(index) {
    setColors(colors.filter((_, i) => i !== index));
  }

  // Main image select
  function handleMainImage(e) {
    const file = e.target.files[0];
    if (!file) return;
    setMainImageFile(file);
    setMainImagePreview(URL.createObjectURL(file));
    setMainImageUrl('');
    setErrors((prev) => ({ ...prev, image: '' }));
  }

  // Sub-image select
  function handleSubImage(index, e) {
    const file = e.target.files[0];
    if (!file) return;
    const files = [...subImageFiles]; files[index] = file;
    const previews = [...subImagePreviews]; previews[index] = URL.createObjectURL(file);
    const urls = [...subImageUrls]; urls[index] = '';
    setSubImageFiles(files); setSubImagePreviews(previews); setSubImageUrls(urls);
  }

  // Color image select
  function handleColorImage(index, e) {
    const file = e.target.files[0];
    if (!file) return;
    const updated = [...colors];
    updated[index].imageFile = file;
    updated[index].imagePreview = URL.createObjectURL(file);
    updated[index].imageUrl = '';
    setColors(updated);
  }

  // Upload a single file to backend
  async function uploadFile(file) {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: authHeaders,
      body: fd,
    });
    if (!res.ok) throw new Error('Image upload failed');
    const data = await res.json();
    return `http://localhost:5050${data.url}`;
  }

  // ── Validation ────────────────────────────────────────────────────────

  function validate() {
    const errs = {};
    // Required fields
    if (!form.name.trim()) errs.name = 'Product name is required.';
    if (!form.description.trim()) errs.description = 'Short description is required.';
    else if (form.description.trim().length < 10) errs.description = 'Description must be at least 10 characters.';
    if (!form.category) errs.category = 'Please select a category.';
    if (!mainImageFile && !mainImageUrl) errs.image = 'Main cover photo is required.';

    // Pricing validation
    const hasColors = colors.length > 0;
    if (!hasColors) {
      if (!form.price) errs.price = 'Price is required.';
      else if (parseFloat(form.price) <= 0) errs.price = 'Price must be greater than 0.';
      if (form.stock === '' || form.stock === null || form.stock === undefined) errs.stock = 'Stock quantity is required.';
      else if (parseInt(form.stock) < 0) errs.stock = 'Stock cannot be negative.';
    } else {
      colors.forEach((c, i) => {
        if (!c.name.trim()) errs[`color_name_${i}`] = 'Color name is required.';
        if (!c.price) errs[`color_price_${i}`] = 'Price is required.';
        else if (parseFloat(c.price) <= 0) errs[`color_price_${i}`] = 'Price must be greater than 0.';
        if (c.stock < 0) errs[`color_stock_${i}`] = 'Stock cannot be negative.';
      });
    }

    // Shipping validation (optional but must be valid if filled)
    if (form.standardShipping && parseFloat(form.standardShipping) < 0) errs.standardShipping = 'Shipping fee cannot be negative.';
    if (form.expressShipping && parseFloat(form.expressShipping) < 0) errs.expressShipping = 'Shipping fee cannot be negative.';
    if (form.standardShipping && form.expressShipping && parseFloat(form.expressShipping) <= parseFloat(form.standardShipping))
      errs.expressShipping = 'Express fee should be higher than standard fee.';

    return errs;
  }

  // ── Submit ────────────────────────────────────────────────────────────

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSubmitting(true);
    setServerError('');

    try {
      // 1. Upload main image
      let imageUrl = mainImageUrl;
      if (mainImageFile) imageUrl = await uploadFile(mainImageFile);

      // 2. Upload sub images (gallery)
      const galleryUrls = [...subImageUrls];
      for (let i = 0; i < subImageFiles.length; i++) {
        if (subImageFiles[i]) galleryUrls[i] = await uploadFile(subImageFiles[i]);
      }

      // 3. Upload color images
      const colorPayload = await Promise.all(
        colors.map(async (c) => {
          let imgUrl = c.imageUrl;
          if (c.imageFile) imgUrl = await uploadFile(c.imageFile);
          return { name: c.name, hex: c.hex, image: imgUrl || null, price: parseFloat(c.price), stock: parseInt(c.stock) || 0 };
        })
      );

      // 4. Build specs details array (each spec = one bullet point)
      const filledSpecs = specs.filter((s) => s.key.trim() && s.value.trim());
      const detailsArray = filledSpecs.map((s) => `${s.key}: ${s.value}`);

      // 5. First sub-image = hover image; all non-empty sub-images = galleryImages
      const hoverImage = galleryUrls[0] || '';
      const galleryImages = galleryUrls.filter(Boolean); // [sub1, sub2, sub3] filtered

      // 6. Build payload
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        details: detailsArray.length > 0 ? detailsArray : null,
        categoryName: form.category,
        price: colors.length > 0 ? parseFloat(colors[0].price) : parseFloat(form.price),
        stock: colors.length > 0 ? colors.reduce((a, c) => a + (parseInt(c.stock) || 0), 0) : parseInt(form.stock) || 0,
        image: imageUrl,
        hoverImage,
        galleryImages,
        badge: form.badge.trim() || null,
        featured: form.featured,
        standardShipping: form.standardShipping !== '' ? parseFloat(form.standardShipping) : null,
        expressShipping: form.expressShipping !== '' ? parseFloat(form.expressShipping) : null,
        colors: colorPayload.length > 0 ? colorPayload : undefined,
      };

      const res = await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setServerError(data.error || 'Failed to create product. Please try again.');
        setSubmitting(false);
        return;
      }

      // Success → go to products list
      navigate('/admin/products', { state: { created: data.name } });
    } catch (err) {
      setServerError(err.message || 'Unexpected error. Please try again.');
      setSubmitting(false);
    }
  }

  const totalVariantStock = colors.reduce((acc, c) => acc + (parseInt(c.stock) || 0), 0);
  const hasColors = colors.length > 0;
  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div className="p-4 md:p-8 w-full max-w-[1200px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/30 pb-4">
        <div>
          <button
            onClick={() => navigate('/admin/products')}
            className="inline-flex items-center text-on-surface-variant hover:text-primary font-label-sm text-label-sm mb-1 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] mr-1">arrow_back</span>
            Back to Products
          </button>
          <h1 className="font-headline-md text-headline-md text-on-surface">Add New Product</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Fill in the details to add a new item to your boutique collection.</p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="px-6 py-3 rounded-full border border-outline-variant text-on-surface font-label-md text-label-md hover:bg-surface-container transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-8 py-3 rounded-full font-label-md text-label-md shadow-ambient transition-all duration-300 flex items-center gap-2 bg-primary text-white hover:bg-primary/80 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {submitting
              ? <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
              : <span className="material-symbols-outlined text-[18px]">publish</span>
            }
            {submitting ? 'Publishing...' : 'Publish Product'}
          </button>
        </div>
      </div>

      {/* Global Error Banner */}
      {(serverError || hasErrors) && (
        <div className="p-4 bg-error-container/30 border border-error/30 rounded-xl flex items-start gap-3">
          <span className="material-symbols-outlined text-error mt-0.5">error</span>
          <div>
            <p className="font-label-md font-bold text-error text-sm">Please fix the following errors:</p>
            {serverError && <p className="text-sm text-on-error-container mt-1">{serverError}</p>}
            {Object.values(errors).filter(Boolean).map((msg, i) => (
              <p key={i} className="text-sm text-on-error-container mt-0.5">• {msg}</p>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Left Column ── */}
        <div className="lg:col-span-2 space-y-8">

          {/* General Information */}
          <section className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient border border-outline-variant/30 space-y-5">
            <h2 className="font-title-sm text-title-sm text-primary flex items-center gap-2 border-b border-outline-variant/30 pb-3">
              <span className="material-symbols-outlined">edit_note</span>
              General Information
            </h2>
            <div className="space-y-5">
              {/* Product Name */}
              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-1" htmlFor="name">
                  Product Name <span className="text-error">*</span>
                </label>
                <input
                  id="name" name="name" type="text"
                  value={form.name} onChange={handleChange} onBlur={handleBlur}
                  placeholder="e.g. Blush Silk Ribbon Bow"
                  className={`w-full bg-transparent border-b-2 outline-none py-2 font-body-md text-on-surface placeholder:text-outline transition-colors ${errors.name ? 'border-error' : 'border-outline-variant focus:border-primary'}`}
                />
                {errors.name && <p className="text-xs text-error mt-1 flex items-center gap-1"><span className="material-symbols-outlined text-[13px]">error</span>{errors.name}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-1" htmlFor="description">
                  Short Description <span className="text-error">*</span>
                </label>
                <textarea
                  id="description" name="description"
                  value={form.description} onChange={handleChange} onBlur={handleBlur}
                  rows={4}
                  placeholder="Describe your handcrafted product details, charm, and styling..."
                  className={`w-full bg-transparent border-b-2 outline-none py-2 font-body-md text-on-surface placeholder:text-outline transition-colors resize-none ${errors.description ? 'border-error' : 'border-outline-variant focus:border-primary'}`}
                />
                {errors.description && <p className="text-xs text-error mt-1 flex items-center gap-1"><span className="material-symbols-outlined text-[13px]">error</span>{errors.description}</p>}
              </div>

              {/* Badge (optional) */}
              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-1" htmlFor="badge">
                  Badge Label <span className="text-on-surface-variant font-normal">(Optional — e.g. New, Best Seller, Limited)</span>
                </label>
                <input
                  id="badge" name="badge" type="text"
                  value={form.badge} onChange={handleChange}
                  placeholder="e.g. Best Seller"
                  className="w-full bg-transparent border-b-2 border-outline-variant focus:border-primary outline-none py-2 font-body-md text-on-surface placeholder:text-outline transition-colors"
                />
              </div>
            </div>
          </section>

          {/* Media / Photo Upload */}
          <section className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient border border-outline-variant/30 space-y-5">
            <div className="flex justify-between items-center border-b border-outline-variant/30 pb-3">
              <h2 className="font-title-sm text-title-sm text-primary flex items-center gap-2">
                <span className="material-symbols-outlined">imagesmode</span>
                Product Photos
              </h2>
              <span className="font-label-sm text-label-sm text-on-surface-variant">Main + 3 Gallery</span>
            </div>

            {errors.image && (
              <p className="text-xs text-error flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">error</span>
                {errors.image}
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {/* Main Cover */}
              <div className="sm:col-span-2">
                <label className="font-label-sm text-label-sm text-primary font-bold block mb-2">Main Cover Photo *</label>
                <div
                  className={`w-full aspect-square rounded-xl border-2 border-dashed transition-colors overflow-hidden cursor-pointer bg-surface-container flex items-center justify-center relative group ${errors.image ? 'border-error' : 'border-outline-variant hover:border-primary'}`}
                  onClick={() => document.getElementById('main-image-input').click()}
                >
                  {mainImagePreview ? (
                    <>
                      <img src={mainImagePreview} alt="Main Cover" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="material-symbols-outlined text-white text-3xl">edit</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-4">
                      <span className="material-symbols-outlined text-4xl text-primary block mb-2">cloud_upload</span>
                      <p className="font-label-md text-label-md text-on-surface font-bold">Upload Main Cover</p>
                      <p className="font-label-sm text-label-sm text-outline">Click to select</p>
                    </div>
                  )}
                </div>
                <input id="main-image-input" type="file" accept="image/*" onChange={handleMainImage} className="hidden" />
              </div>

              {/* Sub Gallery */}
              <div className="sm:col-span-2 flex flex-col justify-between gap-2">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider block">Gallery Sub Images (3)</label>
                <div className="grid grid-cols-3 gap-2">
                  {[0, 1, 2].map((idx) => (
                    <div key={idx} className="flex flex-col items-center">
                      <div
                        className="w-full aspect-square rounded-lg border border-dashed border-outline-variant hover:border-primary transition-colors overflow-hidden cursor-pointer bg-surface-container flex items-center justify-center relative group"
                        onClick={() => document.getElementById(`sub-image-input-${idx}`).click()}
                      >
                        {subImagePreviews[idx] ? (
                          <>
                            <img src={subImagePreviews[idx]} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="material-symbols-outlined text-white text-xl">edit</span>
                            </div>
                          </>
                        ) : (
                          <div className="text-center">
                            <span className="material-symbols-outlined text-xl text-outline block">add_a_photo</span>
                            <span className="font-label-sm text-[10px] text-outline">Sub {idx + 1}</span>
                          </div>
                        )}
                      </div>
                      <input id={`sub-image-input-${idx}`} type="file" accept="image/*" onChange={(e) => handleSubImage(idx, e)} className="hidden" />
                    </div>
                  ))}
                </div>
                <p className="font-label-sm text-label-sm text-on-surface-variant opacity-70">
                  Gallery images appear on the Product Details page. First sub-image used as hover image.
                </p>
              </div>
            </div>
          </section>

          {/* Color Variants */}
          <section className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient border border-outline-variant/30 space-y-5">
            <div className="flex justify-between items-center border-b border-outline-variant/30 pb-3">
              <h2 className="font-title-sm text-title-sm text-primary flex items-center gap-2">
                <span className="material-symbols-outlined">palette</span>
                Color Variants
              </h2>
              <span className="font-label-sm text-label-sm text-on-surface-variant font-bold">
                {hasColors ? `${colors.length} variants (${totalVariantStock} units)` : 'None added'}
              </span>
            </div>

            <p className="font-body-md text-sm text-on-surface-variant">
              Optional: Add color variants with individual price, stock &amp; photo.{' '}
              <span className="text-primary font-medium">
                {hasColors ? 'Price & Stock set per variant below.' : 'If no colors, default price & stock used.'}
              </span>
            </p>

            <div className="space-y-4">
              {colors.map((color, index) => (
                <div key={color.id || index} className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 bg-surface-container-low p-4 rounded-xl border border-outline-variant/30">
                  {/* Swatch + Name */}
                  <div className="flex items-center gap-3 flex-grow min-w-[180px]">
                    <input
                      type="color" value={color.hex}
                      onChange={(e) => handleColorChange(index, 'hex', e.target.value)}
                      className="w-9 h-9 rounded-full cursor-pointer border border-outline-variant p-0.5 bg-transparent flex-shrink-0"
                    />
                    <div className="flex-grow">
                      <label className="block font-label-sm text-label-sm text-on-surface-variant mb-0.5">Color Name *</label>
                      <input
                        type="text" value={color.name}
                        onChange={(e) => { handleColorChange(index, 'name', e.target.value); setErrors((p) => ({ ...p, [`color_name_${index}`]: '' })); }}
                        placeholder="e.g. Blush Pink"
                        className={`w-full bg-surface-bright border rounded-md px-3 py-1.5 font-body-md text-on-surface focus:border-primary outline-none ${errors[`color_name_${index}`] ? 'border-error' : 'border-outline-variant'}`}
                      />
                      {errors[`color_name_${index}`] && <p className="text-xs text-error">{errors[`color_name_${index}`]}</p>}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="w-full sm:w-32 border-t sm:border-t-0 sm:border-l border-outline-variant/30 pt-2 sm:pt-0 sm:pl-3">
                    <label className="block font-label-sm text-label-sm text-on-surface-variant mb-0.5">Price (Rs.)*</label>
                    <input
                      type="text" inputMode="decimal" value={color.price}
                      onChange={(e) => { handleColorChange(index, 'price', e.target.value); setErrors((p) => ({ ...p, [`color_price_${index}`]: '' })); }}
                      placeholder="1200"
                      className={`w-full bg-surface-bright border rounded-md px-3 py-1.5 font-body-md text-on-surface focus:border-primary outline-none font-bold ${errors[`color_price_${index}`] ? 'border-error' : 'border-outline-variant'}`}
                    />
                    {errors[`color_price_${index}`] && <p className="text-xs text-error">{errors[`color_price_${index}`]}</p>}
                  </div>

                  {/* Stock */}
                  <div className="w-full sm:w-28 border-t sm:border-t-0 sm:border-l border-outline-variant/30 pt-2 sm:pt-0 sm:pl-3">
                    <label className="block font-label-sm text-label-sm text-on-surface-variant mb-0.5">Stock Qty</label>
                    <input
                      type="text" inputMode="numeric" value={color.stock}
                      onChange={(e) => handleColorChange(index, 'stock', e.target.value)}
                      placeholder="0"
                      className="w-full bg-surface-bright border border-outline-variant rounded-md px-3 py-1.5 font-body-md text-on-surface focus:border-primary outline-none font-bold text-primary"
                    />
                  </div>

                  {/* Color Photo Upload */}
                  <div className="flex items-center gap-2 w-full sm:w-48 border-t sm:border-t-0 sm:border-l border-outline-variant/30 pt-2 sm:pt-0 sm:pl-3">
                    <div
                      className="w-11 h-11 rounded-lg border border-dashed border-outline-variant hover:border-primary transition-colors overflow-hidden cursor-pointer bg-surface-bright flex items-center justify-center flex-shrink-0 relative group"
                      onClick={() => document.getElementById(`color-img-${index}`).click()}
                    >
                      {color.imagePreview ? (
                        <>
                          <img src={color.imagePreview} alt={color.name} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center">
                            <span className="material-symbols-outlined text-white text-sm">edit</span>
                          </div>
                        </>
                      ) : (
                        <span className="material-symbols-outlined text-base text-primary">add_a_photo</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => document.getElementById(`color-img-${index}`).click()}
                      className="font-label-sm text-sm text-primary hover:underline cursor-pointer"
                    >
                      {color.imagePreview ? 'Change' : 'Add Photo'}
                    </button>
                    <input id={`color-img-${index}`} type="file" accept="image/*" onChange={(e) => handleColorImage(index, e)} className="hidden" />
                  </div>

                  {/* Remove */}
                  <button
                    type="button" onClick={() => handleRemoveColor(index)}
                    className="p-2 text-on-surface-variant hover:text-error transition-colors self-end lg:self-center cursor-pointer"
                    title="Delete color variant"
                  >
                    <span className="material-symbols-outlined text-[20px]">delete</span>
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-between items-center">
              <button
                type="button" onClick={handleAddColor}
                className="inline-flex items-center gap-2 px-4 py-2 border border-dashed border-primary text-primary font-label-md text-label-md rounded-lg hover:bg-primary-container/30 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Add Color Variant
              </button>
              {hasColors && (
                <button type="button" onClick={() => setColors([])} className="font-label-sm text-label-sm text-error hover:underline cursor-pointer">
                  Clear All
                </button>
              )}
            </div>
          </section>

          {/* Product Specs */}
          <section className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient border border-outline-variant/30 space-y-5">
            <div className="flex justify-between items-center border-b border-outline-variant/30 pb-3">
              <h2 className="font-title-sm text-title-sm text-primary flex items-center gap-2">
                <span className="material-symbols-outlined">checklist</span>
                Product Details &amp; Specifications
              </h2>
              <span className="font-label-sm text-label-sm text-on-surface-variant">Key-Value Specs</span>
            </div>
            <p className="font-body-md text-sm text-on-surface-variant">
              Fill in the specification rows. Leave empty rows blank and they'll be ignored.
            </p>
            <div className="space-y-3">
              {specs.map((spec, index) => (
                <div key={spec.id || index} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-surface-container-low p-3.5 rounded-lg border border-outline-variant/20">
                  <div className="sm:w-1/3">
                    <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Label</label>
                    <input
                      type="text" value={spec.key}
                      onChange={(e) => handleSpecChange(index, 'key', e.target.value)}
                      placeholder="e.g. Material"
                      className="w-full bg-surface-bright border border-outline-variant rounded-md px-3 py-2 font-body-md text-on-surface focus:border-primary outline-none"
                    />
                  </div>
                  <div className="flex-grow">
                    <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Value</label>
                    <input
                      type="text" value={spec.value}
                      onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                      placeholder="e.g. 100% Silk"
                      className="w-full bg-surface-bright border border-outline-variant rounded-md px-3 py-2 font-body-md text-on-surface focus:border-primary outline-none"
                    />
                  </div>
                  <button
                    type="button" onClick={() => handleRemoveSpec(index)}
                    className="self-end sm:self-center sm:mt-5 p-2 text-on-surface-variant hover:text-error transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[20px]">delete</span>
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button" onClick={handleAddSpec}
              className="inline-flex items-center gap-2 px-4 py-2 border border-dashed border-primary text-primary font-label-md text-label-md rounded-lg hover:bg-primary-container/30 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Add Specification
            </button>
          </section>

          {/* Pricing & Stock (when no colors) */}
          {!hasColors && (
            <section className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient border border-outline-variant/30 space-y-5">
              <h2 className="font-title-sm text-title-sm text-primary flex items-center gap-2 border-b border-outline-variant/30 pb-3">
                <span className="material-symbols-outlined">sell</span>
                Pricing &amp; Stock
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block font-label-md text-label-md text-on-surface mb-1" htmlFor="price">
                    Price (Rs. LKR) <span className="text-error">*</span>
                  </label>
                  <input
                    id="price" name="price" type="text" inputMode="decimal"
                    value={form.price} onChange={handleChange} onBlur={handleBlur}
                    placeholder="1200.00"
                    className={`w-full bg-transparent border-b-2 outline-none py-2 font-body-md text-on-surface font-bold text-primary transition-colors ${errors.price ? 'border-error' : 'border-outline-variant focus:border-primary'}`}
                  />
                  {errors.price && <p className="text-xs text-error mt-1 flex items-center gap-1"><span className="material-symbols-outlined text-[13px]">error</span>{errors.price}</p>}
                </div>
                <div>
                  <label className="block font-label-md text-label-md text-on-surface mb-1" htmlFor="stock">
                    Stock Quantity <span className="text-error">*</span>
                  </label>
                  <input
                    id="stock" name="stock" type="text" inputMode="numeric"
                    value={form.stock} onChange={handleChange} onBlur={handleBlur}
                    placeholder="48"
                    className={`w-full bg-transparent border-b-2 outline-none py-2 font-body-md text-on-surface font-bold text-primary transition-colors ${errors.stock ? 'border-error' : 'border-outline-variant focus:border-primary'}`}
                  />
                  {errors.stock && <p className="text-xs text-error mt-1 flex items-center gap-1"><span className="material-symbols-outlined text-[13px]">error</span>{errors.stock}</p>}
                </div>
              </div>
            </section>
          )}

          {hasColors && (
            <div className="p-4 bg-primary-container/30 rounded-xl border border-primary/20 flex items-start gap-3">
              <span className="material-symbols-outlined text-primary mt-0.5">info</span>
              <div className="text-sm">
                <p className="font-bold text-primary mb-0.5">Color Variants Active</p>
                <p className="text-on-surface-variant">Price &amp; Stock are set per color above. Total: <span className="font-bold text-primary">{totalVariantStock} units</span></p>
              </div>
            </div>
          )}

          {/* Delivery & Shipping Fees */}
          <section className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient border border-outline-variant/30 space-y-5">
            <h2 className="font-title-sm text-title-sm text-primary flex items-center gap-2 border-b border-outline-variant/30 pb-3">
              <span className="material-symbols-outlined">local_shipping</span>
              Delivery &amp; Shipping Fees
            </h2>
            <p className="font-body-md text-sm text-on-surface-variant">
              Set custom delivery rates for this product. These fees are applied at checkout.
              Leave blank to use the store's default rates.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Standard Shipping */}
              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-1" htmlFor="standardShipping">
                  Standard Delivery Fee
                  <span className="ml-1 font-normal text-on-surface-variant text-xs">(Optional)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-0 bottom-2 font-label-sm text-[11px] text-on-surface-variant pointer-events-none font-bold">Rs.</span>
                  <input
                    id="standardShipping"
                    name="standardShipping"
                    type="text"
                    inputMode="decimal"
                    value={form.standardShipping}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="e.g. 500"
                    className={`w-full bg-transparent border-b-2 outline-none pl-8 py-2 font-body-md text-on-surface font-bold text-primary transition-colors ${errors.standardShipping ? 'border-error' : 'border-outline-variant focus:border-primary'}`}
                  />
                </div>
                {errors.standardShipping ? (
                  <p className="text-xs text-error mt-1 flex items-center gap-1"><span className="material-symbols-outlined text-[13px]">error</span>{errors.standardShipping}</p>
                ) : (
                  <p className="text-xs text-on-surface-variant mt-1">LKR — Standard / regular delivery option</p>
                )}
              </div>

              {/* Express Shipping */}
              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-1" htmlFor="expressShipping">
                  Express Delivery Fee
                  <span className="ml-1 font-normal text-on-surface-variant text-xs">(Optional)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-0 bottom-2 font-label-sm text-[11px] text-on-surface-variant pointer-events-none font-bold">Rs.</span>
                  <input
                    id="expressShipping"
                    name="expressShipping"
                    type="text"
                    inputMode="decimal"
                    value={form.expressShipping}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="e.g. 1500"
                    className={`w-full bg-transparent border-b-2 outline-none pl-8 py-2 font-body-md text-on-surface font-bold text-primary transition-colors ${errors.expressShipping ? 'border-error' : 'border-outline-variant focus:border-primary'}`}
                  />
                </div>
                {errors.expressShipping ? (
                  <p className="text-xs text-error mt-1 flex items-center gap-1"><span className="material-symbols-outlined text-[13px]">error</span>{errors.expressShipping}</p>
                ) : (
                  <p className="text-xs text-on-surface-variant mt-1">LKR — Priority / express delivery option</p>
                )}
              </div>
            </div>

            {/* Live preview */}
            {(form.standardShipping || form.expressShipping) && (
              <div className="flex gap-4 pt-2">
                {form.standardShipping && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-surface-container rounded-lg border border-outline-variant/30">
                    <span className="material-symbols-outlined text-primary text-[18px]">local_shipping</span>
                    <div>
                      <p className="font-label-sm text-[10px] text-on-surface-variant uppercase">Standard</p>
                      <p className="font-bold text-primary text-sm">Rs. {parseInt(form.standardShipping || 0).toLocaleString()}</p>
                    </div>
                  </div>
                )}
                {form.expressShipping && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-secondary-container/30 rounded-lg border border-outline-variant/30">
                    <span className="material-symbols-outlined text-secondary text-[18px]">rocket_launch</span>
                    <div>
                      <p className="font-label-sm text-[10px] text-on-surface-variant uppercase">Express</p>
                      <p className="font-bold text-secondary text-sm">Rs. {parseInt(form.expressShipping || 0).toLocaleString()}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>

        {/* ── Right Column ── */}
        <div className="space-y-8">
          {/* Category */}
          <section className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient border border-outline-variant/30 space-y-5">
            <h2 className="font-title-sm text-title-sm text-primary flex items-center gap-2 border-b border-outline-variant/30 pb-3">
              <span className="material-symbols-outlined">category</span>
              Organization
            </h2>
            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-2" htmlFor="category">
                Category <span className="text-error">*</span>
              </label>
              {catLoading ? (
                <div className="flex items-center gap-2 text-on-surface-variant py-2">
                  <span className="material-symbols-outlined animate-spin text-[16px] text-primary">sync</span>
                  <span className="font-label-md text-sm">Loading categories...</span>
                </div>
              ) : categories.length === 0 ? (
                <div className="p-3 bg-error-container/20 rounded-lg text-sm text-error">
                  No categories found. Please{' '}
                  <button type="button" onClick={() => navigate('/admin/categories')} className="underline font-bold cursor-pointer">
                    create categories
                  </button>{' '}
                  first.
                </div>
              ) : (
                <div className="relative">
                  <select
                    id="category" name="category"
                    value={form.category} onChange={handleChange} onBlur={handleBlur}
                    className={`w-full bg-transparent border-0 border-b-2 outline-none py-2 pr-8 font-body-md text-on-surface appearance-none cursor-pointer transition-colors ${errors.category ? 'border-error' : 'border-outline-variant focus:border-primary'}`}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name} className="bg-surface-container-lowest text-on-surface py-2">
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-0 top-1/2 -translate-y-1/2 text-primary pointer-events-none text-[20px]">unfold_more</span>
                </div>
              )}
              {errors.category && <p className="text-xs text-error mt-1">{errors.category}</p>}
            </div>
          </section>

          {/* Visibility */}
          <section className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient border border-outline-variant/30 space-y-5">
            <h2 className="font-title-sm text-title-sm text-primary flex items-center gap-2 border-b border-outline-variant/30 pb-3">
              <span className="material-symbols-outlined">visibility</span>
              Product Visibility
            </h2>
            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="font-label-md text-label-md text-on-surface">Mark as Featured</span>
                <input
                  type="checkbox" name="featured"
                  checked={form.featured} onChange={handleChange}
                  className="w-5 h-5 accent-primary cursor-pointer"
                />
              </label>
            </div>
          </section>

          {/* Summary Card */}
          <section className="bg-primary-container/20 rounded-xl p-6 border border-primary/20 space-y-3">
            <h3 className="font-title-sm text-sm text-primary font-bold uppercase tracking-widest">Ready to Publish?</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Product Name</span>
                <span className="font-medium text-on-surface truncate max-w-[130px]">{form.name || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Category</span>
                <span className="font-medium text-on-surface">{form.category || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Colors</span>
                <span className="font-medium text-on-surface">{hasColors ? `${colors.length} variants` : 'Single'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Main Photo</span>
                <span className={`font-medium ${mainImagePreview ? 'text-secondary' : 'text-error'}`}>
                  {mainImagePreview ? '✓ Ready' : '✗ Missing'}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || !mainImagePreview || !form.name || !form.category}
              className="w-full mt-2 px-6 py-3 bg-primary text-white rounded-full font-label-md text-label-md hover:bg-primary/80 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-ambient"
            >
              {submitting
                ? <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                : <span className="material-symbols-outlined text-[18px]">publish</span>
              }
              {submitting ? 'Publishing...' : 'Publish Product'}
            </button>
          </section>
        </div>
      </form>
    </div>
  );
}
