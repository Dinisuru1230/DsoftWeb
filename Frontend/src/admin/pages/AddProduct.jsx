import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ConfirmModal from '../../components/ConfirmModal';
import toast from 'react-hot-toast';

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

const DEFAULT_PALETTES = [
  { name: 'Blush Pink', hex: '#fadadd', placeholder: 'e.g. Blush Pink' },
  { name: 'Ivory White', hex: '#fdfbf7', placeholder: 'e.g. Ivory White' },
  { name: 'Sage Green', hex: '#9caf88', placeholder: 'e.g. Sage Green' },
  { name: 'Lavender', hex: '#e6e6fa', placeholder: 'e.g. Lavender' },
  { name: 'Dusty Rose', hex: '#dcae96', placeholder: 'e.g. Dusty Rose' },
  { name: 'Champagne Gold', hex: '#f7e7ce', placeholder: 'e.g. Champagne Gold' },
  { name: 'Sky Blue', hex: '#87ceeb', placeholder: 'e.g. Sky Blue' },
];

const SPEC_PRESETS = [
  { key: 'Material', keyPlaceholder: 'e.g. Material', valPlaceholder: 'e.g. 100% Mulberry Silk / Satin' },
  { key: 'Width', keyPlaceholder: 'e.g. Width', valPlaceholder: 'e.g. 2.5 inches / 6.5 cm' },
  { key: 'Length', keyPlaceholder: 'e.g. Length / Dimensions', valPlaceholder: 'e.g. 15 cm length' },
  { key: 'Care Instructions', keyPlaceholder: 'e.g. Care Instructions', valPlaceholder: 'e.g. Spot clean with cool water' },
  { key: 'Origin / Craftsmanship', keyPlaceholder: 'e.g. Craftsmanship', valPlaceholder: 'e.g. Handmade with love in Sri Lanka' },
  { key: 'Fastening / Attachment', keyPlaceholder: 'e.g. Fastening / Clip', valPlaceholder: 'e.g. French Alligator Clip (Steel)' },
  { key: 'Packaging', keyPlaceholder: 'e.g. Packaging', valPlaceholder: 'e.g. Signature Malmalee Gift Box' },
  { key: 'Suitable For', keyPlaceholder: 'e.g. Suitable For', valPlaceholder: 'e.g. Weddings, Parties, Everyday Chic' },
];

function getSpecPlaceholders(spec, index) {
  const keyLower = (spec.key || '').toLowerCase().trim();
  if (keyLower.includes('material')) return { key: 'e.g. Material', val: 'e.g. 100% Mulberry Silk / Satin' };
  if (keyLower.includes('width')) return { key: 'e.g. Width', val: 'e.g. 2.5 inches / 6.5 cm' };
  if (keyLower.includes('length') || keyLower.includes('dimension') || keyLower.includes('size')) {
    return { key: 'e.g. Dimensions', val: 'e.g. 15cm × 10cm' };
  }
  if (keyLower.includes('care')) return { key: 'e.g. Care Instructions', val: 'e.g. Spot clean with damp cloth' };
  if (keyLower.includes('origin') || keyLower.includes('craft')) return { key: 'e.g. Craftsmanship', val: 'e.g. Handmade with love in Sri Lanka' };
  if (keyLower.includes('clip') || keyLower.includes('fasten') || keyLower.includes('attach')) {
    return { key: 'e.g. Fastening', val: 'e.g. French Alligator Clip (Steel)' };
  }
  if (keyLower.includes('pack')) return { key: 'e.g. Packaging', val: 'e.g. Signature Malmalee Gift Box' };
  if (keyLower.includes('weight')) return { key: 'e.g. Weight', val: 'e.g. 45 grams' };
  if (keyLower.includes('suit') || keyLower.includes('occasion')) return { key: 'e.g. Suitable For', val: 'e.g. Weddings, Parties, Casual wear' };

  const preset = SPEC_PRESETS[index % SPEC_PRESETS.length];
  return { key: preset.keyPlaceholder, val: preset.valPlaceholder };
}

export default function AddProduct() {
  const navigate = useNavigate();
  const { id: editId } = useParams(); // present when route is /admin/edit-product/:id
  const isEditMode = Boolean(editId);
  const { token } = useAuth();

  const [categories, setCategories] = useState([]);
  const [catLoading, setCatLoading] = useState(true);
  const [editLoading, setEditLoading] = useState(isEditMode);

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
  const [showClearColorsConfirm, setShowClearColorsConfirm] = useState(false);

  // Delivery fee type: 'default' (store default) or 'specific' (custom rates)
  const [shippingType, setShippingType] = useState('default');
  const [defaultSettings, setDefaultSettings] = useState({
    standardShipping: 450,
    expressShipping: 1200,
  });

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

  // Load DB categories and store delivery settings
  useEffect(() => {
    fetch(`${API_BASE}/categories?all=true`, { headers: authHeaders })
      .then((r) => r.json())
      .then((data) => {
        if (data.categories?.length) {
          setCategories(data.categories);
          // Only set default category for NEW products
          if (!isEditMode) {
            setForm((f) => ({ ...f, category: data.categories[0].name }));
          }
        }
      })
      .catch(() => {})
      .finally(() => setCatLoading(false));

    fetch(`${API_BASE}/settings`)
      .then((r) => r.json())
      .then((data) => {
        if (data.standardShipping !== undefined && data.expressShipping !== undefined) {
          setDefaultSettings({
            standardShipping: data.standardShipping,
            expressShipping: data.expressShipping,
          });
        }
      })
      .catch(() => {});
  }, []);

  // If edit mode: fetch existing product and pre-fill all fields
  useEffect(() => {
    if (!isEditMode) return;
    setEditLoading(true);
    fetch(`${API_BASE}/products/${editId}`, { headers: authHeaders })
      .then((r) => r.json())
      .then((p) => {
        // Pre-fill form
        setForm({
          name: p.name || '',
          category: p.categoryName || '',
          price: p.colors?.length > 0 ? '' : String(p.price ?? ''),
          stock: p.colors?.length > 0 ? '' : String(p.stock ?? ''),
          description: p.description || '',
          badge: p.badge || '',
          featured: Boolean(p.featured),
          standardShipping: p.standardShipping != null ? String(p.standardShipping) : '',
          expressShipping: p.expressShipping != null ? String(p.expressShipping) : '',
        });

        if (p.standardShipping != null || p.expressShipping != null) {
          setShippingType('specific');
        } else {
          setShippingType('default');
        }

        // Pre-fill main image
        setMainImageUrl(p.image || '');
        setMainImagePreview(p.image ? (p.image.startsWith('http') ? p.image : `http://localhost:5050${p.image}`) : null);

        // Pre-fill sub gallery images
        if (p.galleryImages) {
          try {
            const imgs = typeof p.galleryImages === 'string' ? JSON.parse(p.galleryImages) : p.galleryImages;
            if (Array.isArray(imgs)) {
              const urls = ['', '', ''];
              const previews = [null, null, null];
              imgs.forEach((url, i) => {
                if (i < 3 && url) {
                  urls[i] = url;
                  previews[i] = url.startsWith('http') ? url : `http://localhost:5050${url}`;
                }
              });
              setSubImageUrls(urls);
              setSubImagePreviews(previews);
            }
          } catch {}
        }

        // Pre-fill specs from details
        if (p.details) {
          try {
            const detailLines = typeof p.details === 'string'
              ? (p.details.startsWith('[') ? JSON.parse(p.details) : p.details.split('\n').filter(Boolean))
              : p.details;
            if (Array.isArray(detailLines) && detailLines.length > 0) {
              const specsList = detailLines.map((line, i) => {
                const colonIdx = line.indexOf(':');
                return {
                  id: String(Date.now() + i),
                  key: colonIdx > -1 ? line.slice(0, colonIdx).trim() : line,
                  value: colonIdx > -1 ? line.slice(colonIdx + 1).trim() : '',
                };
              });
              setSpecs(specsList);
            }
          } catch {}
        }

        // Pre-fill color variants
        if (p.colors?.length > 0) {
          setColors(p.colors.map((c) => ({
            id: c.id || String(Date.now()),
            name: c.name || '',
            hex: c.hex || '#fadadd',
            imageFile: null,
            imagePreview: c.image ? (c.image.startsWith('http') ? c.image : `http://localhost:5050${c.image}`) : null,
            imageUrl: c.image || '',
            price: String(c.price ?? ''),
            stock: String(c.stock ?? '10'),
          })));
        }
      })
      .catch(() => { navigate('/admin/products'); })
      .finally(() => setEditLoading(false));
  }, [editId]);

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
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name, finalVal, newForm),
      }));
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
        return !value?.trim()
          ? 'Short description is required.'
          : value.trim().length < 10
          ? 'Description must be at least 10 characters.'
          : '';
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
        if (shippingType === 'default') return '';
        if (!value) return 'Standard delivery fee is required.';
        if (parseFloat(value) < 0) return 'Shipping fee cannot be negative.';
        return '';
      case 'expressShipping':
        if (shippingType === 'default') return '';
        if (!value) return 'Express delivery fee is required.';
        if (parseFloat(value) < 0) return 'Shipping fee cannot be negative.';
        if (currentForm.standardShipping && parseFloat(value) < parseFloat(currentForm.standardShipping))
          return 'Express fee should be higher than or equal to standard fee.';
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
    setColors([
      ...colors,
      {
        id: Date.now().toString() + Math.random().toString(36).substring(2, 7),
        name: '',
        hex: '#fadadd',
        imageFile: null,
        imagePreview: null,
        imageUrl: '',
        price: form.price || '',
        stock: '10',
      },
    ]);
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
    const files = [...subImageFiles];
    files[index] = file;
    const previews = [...subImagePreviews];
    previews[index] = URL.createObjectURL(file);
    const urls = [...subImageUrls];
    urls[index] = '';
    setSubImageFiles(files);
    setSubImagePreviews(previews);
    setSubImageUrls(urls);
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
    if (!form.name.trim()) errs.name = 'Product name is required.';
    if (!form.description.trim()) errs.description = 'Short description is required.';
    else if (form.description.trim().length < 10) errs.description = 'Description must be at least 10 characters.';
    if (!form.category) errs.category = 'Please select a category.';
    if (!mainImageFile && !mainImageUrl) errs.image = 'Main cover photo is required.';

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

    if (shippingType === 'specific') {
      if (!form.standardShipping) {
        errs.standardShipping = 'Standard delivery fee is required when specific rate is selected.';
      } else if (parseFloat(form.standardShipping) < 0) {
        errs.standardShipping = 'Shipping fee cannot be negative.';
      }

      if (!form.expressShipping) {
        errs.expressShipping = 'Express delivery fee is required when specific rate is selected.';
      } else if (parseFloat(form.expressShipping) < 0) {
        errs.expressShipping = 'Shipping fee cannot be negative.';
      } else if (form.standardShipping && parseFloat(form.expressShipping) < parseFloat(form.standardShipping)) {
        errs.expressShipping = 'Express fee should be higher than or equal to standard fee.';
      }
    }

    return errs;
  }

  // ── Submit ────────────────────────────────────────────────────────────

  async function handleSubmit(e) {
    if (e) e.preventDefault();
    if (submitting) return;
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      toast.error('Please fix the highlighted errors before saving.', { id: 'validate-err' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSubmitting(true);
    setServerError('');
    const toastId = toast.loading(isEditMode ? 'Updating product...' : 'Saving and publishing product...');

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
          const colorPrice = c.price !== '' && !isNaN(parseFloat(c.price)) ? parseFloat(c.price) : (form.price !== '' ? parseFloat(form.price) : 0);
          return { name: c.name.trim(), hex: c.hex, image: imgUrl || null, price: colorPrice, stock: parseInt(c.stock) || 0 };
        })
      );

      // 4. Build specs details array
      const filledSpecs = specs.filter((s) => s.key.trim() && s.value.trim());
      const detailsArray = filledSpecs.map((s) => `${s.key}: ${s.value}`);

      // 5. First sub-image = hover image; all non-empty sub-images = galleryImages
      const hoverImage = galleryUrls[0] || '';
      const galleryImages = galleryUrls.filter(Boolean);

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
        standardShipping: shippingType === 'specific' && form.standardShipping !== '' ? parseFloat(form.standardShipping) : null,
        expressShipping: shippingType === 'specific' && form.expressShipping !== '' ? parseFloat(form.expressShipping) : null,
        colors: colorPayload,
      };

      // Use PUT for edit, POST for create
      const url = isEditMode ? `${API_BASE}/products/${editId}` : `${API_BASE}/products`;
      const method = isEditMode ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        const errorMsg = data.error || `Failed to ${isEditMode ? 'update' : 'create'} product. Please try again.`;
        setServerError(errorMsg);
        toast.error(errorMsg, { id: toastId });
        setSubmitting(false);
        return;
      }

      // Success
      toast.success(`"${data.name || form.name}" has been ${isEditMode ? 'updated' : 'published'} successfully!`, { id: toastId });
      navigate('/admin/products');
    } catch (err) {
      const errorMsg = err.message || 'Unexpected network error. Please check your connection and try again.';
      setServerError(errorMsg);
      toast.error(errorMsg, { id: toastId });
      setSubmitting(false);
    }
  }

  const totalVariantStock = colors.reduce((acc, c) => acc + (parseInt(c.stock) || 0), 0);
  const hasColors = colors.length > 0;
  const errorList = Object.values(errors).filter(Boolean);
  const hasErrors = errorList.length > 0;

  return (
    <div className="p-4 md:p-8 w-full max-w-[1200px] mx-auto space-y-8">
      {/* Loading overlay for edit mode */}
      {editLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3 text-primary">
            <span className="material-symbols-outlined text-5xl animate-spin">sync</span>
            <p className="font-label-md text-label-md">Loading product details...</p>
          </div>
        </div>
      )}

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
          <h1 className="font-headline-md text-headline-md text-on-background">
            {isEditMode ? 'Edit Product' : 'Add New Product'}
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            {isEditMode
              ? 'Update the details, imagery, and pricing for this artisanal piece.'
              : 'Add a new handcrafted piece to your boutique catalog.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="px-5 py-2.5 rounded-full border border-outline-variant text-on-surface-variant font-label-md text-label-md hover:bg-surface-container transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="px-6 py-2.5 rounded-full bg-primary text-white font-label-md text-label-md hover:bg-primary/90 transition-all duration-300 shadow-ambient disabled:opacity-50 flex items-center gap-2 cursor-pointer font-bold"
          >
            {submitting ? (
              <>
                <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                {isEditMode ? 'Updating...' : 'Publishing...'}
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">
                  {isEditMode ? 'save' : 'publish'}
                </span>
                {isEditMode ? 'Update Product' : 'Publish Product'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Server Error Banner */}
      {serverError && (
        <div className="p-4 bg-error-container text-on-error-container rounded-xl flex items-center gap-3">
          <span className="material-symbols-outlined">error</span>
          <p className="font-body-md text-sm">{serverError}</p>
        </div>
      )}

      {/* Form Validation Banner */}
      {hasErrors && (
        <div className="p-4 bg-error-container/30 border border-error-container rounded-xl">
          <p className="font-label-md text-sm font-bold text-error mb-1">
            Please resolve the following errors before submitting:
          </p>
          <ul className="list-disc list-inside space-y-0.5">
            {errorList.map((err, i) => (
              <li key={i} className="text-xs text-error">{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Form Layout: 2 Columns */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Left Column (Main Info, Media, Specs, Colors, Shipping) ── */}
        <div className="lg:col-span-2 space-y-8">
          {/* Basic Info */}
          <section className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient border border-outline-variant/30 space-y-5">
            <h2 className="font-title-sm text-title-sm text-primary flex items-center gap-2 border-b border-outline-variant/30 pb-3">
              <span className="material-symbols-outlined">edit_note</span>
              Basic Information
            </h2>

            {/* Product Name */}
            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-1" htmlFor="name">
                Product Name <span className="text-error">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g. Blush Silk Ribbon Bow"
                className={`w-full bg-transparent border-b-2 outline-none py-2 font-body-md text-on-surface transition-colors ${
                  errors.name ? 'border-error' : 'border-outline-variant focus:border-primary'
                }`}
              />
              {errors.name && (
                <p className="text-xs text-error mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">error</span>
                  {errors.name}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-1" htmlFor="description">
                Description <span className="text-error">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={form.description}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Describe the piece, materials, occasion, craftsmanship, etc."
                className={`w-full bg-surface-container-low border rounded-lg p-3 font-body-md text-on-surface focus:outline-none transition-colors ${
                  errors.description ? 'border-error' : 'border-outline-variant focus:border-primary'
                }`}
              />
              <div className="flex justify-between items-center mt-1">
                {errors.description ? (
                  <p className="text-xs text-error flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">error</span>
                    {errors.description}
                  </p>
                ) : <span />}
                <span className="font-label-sm text-xs text-on-surface-variant">
                  {form.description.length} chars
                </span>
              </div>
            </div>

            {/* Badge */}
            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-1" htmlFor="badge">
                Product Badge <span className="text-on-surface-variant font-normal text-xs">(optional)</span>
              </label>
              <input
                id="badge"
                name="badge"
                type="text"
                value={form.badge}
                onChange={handleChange}
                placeholder="e.g. Bestseller, New Arrival, Limited Edition"
                className="w-full bg-transparent border-b-2 border-outline-variant focus:border-primary outline-none py-2 font-body-md text-on-surface transition-colors"
              />
            </div>
          </section>

          {/* Media & Photography */}
          <section className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient border border-outline-variant/30 space-y-5">
            <div className="flex justify-between items-center border-b border-outline-variant/30 pb-3">
              <h2 className="font-title-sm text-title-sm text-primary flex items-center gap-2">
                <span className="material-symbols-outlined">photo_library</span>
                Product Photography
              </h2>
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                1 Main + up to 3 Sub-images
              </span>
            </div>

            {/* Main Cover Photo */}
            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-2">
                Main Cover Photo <span className="text-error">*</span>
              </label>
              <div
                onClick={() => document.getElementById('main-image-input').click()}
                className={`relative w-full h-56 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden ${
                  mainImagePreview
                    ? 'border-primary/50 bg-surface-container-low'
                    : errors.image
                    ? 'border-error bg-error-container/10'
                    : 'border-outline-variant hover:border-primary/60 bg-surface-container-low/50'
                }`}
              >
                {mainImagePreview ? (
                  <>
                    <img
                      src={mainImagePreview}
                      alt="Main Preview"
                      className="w-full h-full object-contain p-2"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <span className="px-3 py-1.5 bg-white text-on-surface font-label-sm text-xs rounded-full shadow">
                        Change Image
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-6 space-y-2">
                    <span className="material-symbols-outlined text-4xl text-primary">cloud_upload</span>
                    <p className="font-label-md text-sm text-on-surface">Click to upload cover photo</p>
                    <p className="font-body-md text-xs text-on-surface-variant">PNG, JPG, WEBP up to 5MB</p>
                  </div>
                )}
              </div>
              <input
                id="main-image-input"
                type="file"
                accept="image/*"
                onChange={handleMainImage}
                className="hidden"
              />
              {errors.image && (
                <p className="text-xs text-error mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">error</span>
                  {errors.image}
                </p>
              )}
            </div>

            {/* Sub-Images (Hover + Gallery) */}
            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-2">
                Additional Gallery / Hover Images <span className="font-normal text-xs text-on-surface-variant">(1st is used as hover effect)</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[0, 1, 2].map((idx) => (
                  <div
                    key={idx}
                    onClick={() => document.getElementById(`sub-img-${idx}`).click()}
                    className={`relative h-28 rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden ${
                      subImagePreviews[idx]
                        ? 'border-primary/40 bg-surface-container-low'
                        : 'border-outline-variant hover:border-primary/40 bg-surface-container-low/40'
                    }`}
                  >
                    {subImagePreviews[idx] ? (
                      <>
                        <img
                          src={subImagePreviews[idx]}
                          alt={`Gallery ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 flex items-center justify-center">
                          <span className="material-symbols-outlined text-white text-sm">edit</span>
                        </div>
                      </>
                    ) : (
                      <div className="text-center p-2 text-on-surface-variant">
                        <span className="material-symbols-outlined text-xl text-outline">add_photo_alternate</span>
                        <p className="font-label-sm text-[10px] mt-1">
                          {idx === 0 ? 'Hover Image' : `Gallery ${idx + 1}`}
                        </p>
                      </div>
                    )}
                    <input
                      id={`sub-img-${idx}`}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleSubImage(idx, e)}
                      className="hidden"
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Color Variants */}
          <section className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient border border-outline-variant/30 space-y-5">
            <div className="flex justify-between items-center border-b border-outline-variant/30 pb-3">
              <div>
                <h2 className="font-title-sm text-title-sm text-primary flex items-center gap-2">
                  <span className="material-symbols-outlined">palette</span>
                  Color Variants
                </h2>
                <p className="font-body-md text-xs text-on-surface-variant mt-0.5">
                  Optional. If added, customers can choose colors and each color can have its own price & stock.
                </p>
              </div>
              <span className="font-label-sm text-label-sm text-primary font-bold">
                {colors.length} {colors.length === 1 ? 'Variant' : 'Variants'}
              </span>
            </div>

            {/* Colors list */}
            <div className="space-y-4">
              {colors.map((color, index) => (
                <div
                  key={color.id || index}
                  className="flex flex-col lg:flex-row items-start lg:items-center gap-4 bg-surface-container-low p-4 rounded-xl border border-outline-variant/30 relative"
                >
                  {/* Color Picker & Name */}
                  <div className="flex items-center gap-3 w-full lg:w-48">
                    <input
                      type="color"
                      value={color.hex}
                      onChange={(e) => handleColorChange(index, 'hex', e.target.value)}
                      className="w-9 h-9 rounded-full border border-outline-variant cursor-pointer p-0.5 bg-transparent"
                      title="Select variant color swatch"
                    />
                    <div className="flex-grow">
                      <input
                        type="text"
                        value={color.name}
                        onChange={(e) => handleColorChange(index, 'name', e.target.value)}
                        placeholder="e.g. Blush Pink"
                        className="w-full bg-surface-bright border border-outline-variant rounded-md px-2.5 py-1.5 font-body-md text-sm text-on-surface focus:border-primary outline-none"
                      />
                    </div>
                  </div>

                  {/* Price */}
                  <div className="w-full lg:w-32">
                    <label className="block font-label-sm text-[11px] text-on-surface-variant mb-0.5">Price (Rs.)</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={color.price}
                      onChange={(e) => handleColorChange(index, 'price', e.target.value)}
                      placeholder="1200"
                      className="w-full bg-surface-bright border border-outline-variant rounded-md px-2.5 py-1.5 font-body-md text-sm text-on-surface focus:border-primary outline-none"
                    />
                  </div>

                  {/* Stock */}
                  <div className="w-full lg:w-24">
                    <label className="block font-label-sm text-[11px] text-on-surface-variant mb-0.5">Stock</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={color.stock}
                      onChange={(e) => handleColorChange(index, 'stock', e.target.value)}
                      placeholder="10"
                      className="w-full bg-surface-bright border border-outline-variant rounded-md px-2.5 py-1.5 font-body-md text-sm text-on-surface focus:border-primary outline-none"
                    />
                  </div>

                  {/* Photo */}
                  <div className="flex items-center gap-2">
                    <div
                      className="w-10 h-10 rounded-lg border border-outline-variant bg-surface-container overflow-hidden flex items-center justify-center cursor-pointer relative group"
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
                    <input
                      id={`color-img-${index}`}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleColorImage(index, e)}
                      className="hidden"
                    />
                  </div>

                  {/* Remove */}
                  <button
                    type="button"
                    onClick={() => handleRemoveColor(index)}
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
                type="button"
                onClick={handleAddColor}
                className="inline-flex items-center gap-2 px-4 py-2 border border-dashed border-primary text-primary font-label-md text-label-md rounded-lg hover:bg-primary-container/30 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Add Color Variant
              </button>
              {hasColors && (
                <button
                  type="button"
                  onClick={() => setShowClearColorsConfirm(true)}
                  className="font-label-sm text-label-sm text-error hover:underline cursor-pointer"
                >
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
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                Key-Value Specs
              </span>
            </div>
            <p className="font-body-md text-sm text-on-surface-variant">
              Fill in the specification rows. Leave empty rows blank and they'll be ignored.
            </p>
            <div className="space-y-3">
              {specs.map((spec, index) => {
                const placeholders = getSpecPlaceholders(spec, index);
                return (
                  <div
                    key={spec.id || index}
                    className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-surface-container-low p-3.5 rounded-lg border border-outline-variant/20"
                  >
                    <div className="sm:w-1/3">
                      <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1 font-semibold">
                        Specification Label
                      </label>
                      <input
                        type="text"
                        value={spec.key}
                        onChange={(e) => handleSpecChange(index, 'key', e.target.value)}
                        placeholder={placeholders.key}
                        className="w-full bg-surface-bright border border-outline-variant rounded-md px-3 py-2 font-body-md text-sm text-on-surface focus:border-primary outline-none"
                      />
                    </div>
                    <div className="flex-grow">
                      <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1 font-semibold">
                        Specification Detail / Value
                      </label>
                      <input
                        type="text"
                        value={spec.value}
                        onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                        placeholder={placeholders.val}
                        className="w-full bg-surface-bright border border-outline-variant rounded-md px-3 py-2 font-body-md text-sm text-on-surface focus:border-primary outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveSpec(index)}
                      className="self-end sm:self-center sm:mt-5 p-2 text-on-surface-variant hover:text-error transition-colors cursor-pointer"
                      title="Delete specification"
                    >
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                  </div>
                );
              })}
            </div>
            <button
              type="button"
              onClick={handleAddSpec}
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
                    id="price"
                    name="price"
                    type="text"
                    inputMode="decimal"
                    value={form.price}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="1200.00"
                    className={`w-full bg-transparent border-b-2 outline-none py-2 font-body-md text-on-surface font-bold text-primary transition-colors ${
                      errors.price ? 'border-error' : 'border-outline-variant focus:border-primary'
                    }`}
                  />
                  {errors.price && (
                    <p className="text-xs text-error mt-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">error</span>
                      {errors.price}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block font-label-md text-label-md text-on-surface mb-1" htmlFor="stock">
                    Stock Quantity <span className="text-error">*</span>
                  </label>
                  <input
                    id="stock"
                    name="stock"
                    type="text"
                    inputMode="numeric"
                    value={form.stock}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="48"
                    className={`w-full bg-transparent border-b-2 outline-none py-2 font-body-md text-on-surface font-bold text-primary transition-colors ${
                      errors.stock ? 'border-error' : 'border-outline-variant focus:border-primary'
                    }`}
                  />
                  {errors.stock && (
                    <p className="text-xs text-error mt-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">error</span>
                      {errors.stock}
                    </p>
                  )}
                </div>
              </div>
            </section>
          )}

          {hasColors && (
            <div className="p-4 bg-primary-container/30 rounded-xl border border-primary/20 flex items-start gap-3">
              <span className="material-symbols-outlined text-primary mt-0.5">info</span>
              <div className="text-sm">
                <p className="font-bold text-primary mb-0.5">Color Variants Active</p>
                <p className="text-on-surface-variant">
                  Price &amp; Stock are set per color above. Total: <span className="font-bold text-primary">{totalVariantStock} units</span>
                </p>
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
              Select whether to use the store's default shipping rates or configure specific delivery rates for this item.
            </p>

            {/* Radio Selection: Default vs Specific */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option 1: Store Default Fee */}
              <label
                className={`flex items-start p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  shippingType === 'default'
                    ? 'border-primary bg-primary-container/20 shadow-sm'
                    : 'border-outline-variant/50 hover:border-primary/40'
                }`}
              >
                <input
                  type="radio"
                  name="shippingType"
                  value="default"
                  checked={shippingType === 'default'}
                  onChange={() => {
                    setShippingType('default');
                    setForm((prev) => ({ ...prev, standardShipping: '', expressShipping: '' }));
                    setErrors((prev) => ({ ...prev, standardShipping: '', expressShipping: '' }));
                  }}
                  className="accent-primary h-4 w-4 mt-1"
                />
                <div className="ml-3">
                  <span className="block font-label-md text-on-background font-bold">Use Default Delivery Fee</span>
                  <span className="block font-body-md text-on-surface-variant text-xs mt-1">
                    Standard: <strong className="text-primary">Rs. {Number(defaultSettings.standardShipping).toLocaleString()}</strong> &bull; Express: <strong className="text-primary">Rs. {Number(defaultSettings.expressShipping).toLocaleString()}</strong>
                  </span>
                  <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-surface-container text-[11px] font-label-sm text-on-surface-variant">
                    Store Default
                  </span>
                </div>
              </label>

              {/* Option 2: Specific Delivery Fee */}
              <label
                className={`flex items-start p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  shippingType === 'specific'
                    ? 'border-primary bg-primary-container/20 shadow-sm'
                    : 'border-outline-variant/50 hover:border-primary/40'
                }`}
              >
                <input
                  type="radio"
                  name="shippingType"
                  value="specific"
                  checked={shippingType === 'specific'}
                  onChange={() => setShippingType('specific')}
                  className="accent-primary h-4 w-4 mt-1"
                />
                <div className="ml-3">
                  <span className="block font-label-md text-on-background font-bold">Specific Delivery Fee</span>
                  <span className="block font-body-md text-on-surface-variant text-xs mt-1">
                    Enter custom Standard &amp; Express rates for this product
                  </span>
                  <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-secondary-container/50 text-[11px] font-label-sm text-secondary font-bold">
                    Custom Rates
                  </span>
                </div>
              </label>
            </div>

            {/* Custom inputs shown only if 'specific' selected */}
            {shippingType === 'specific' && (
              <div className="space-y-4 pt-2 border-t border-outline-variant/20">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Standard Shipping */}
                  <div>
                    <label className="block font-label-md text-label-md text-on-surface mb-1" htmlFor="standardShipping">
                      Custom Standard Delivery Fee (Rs.) <span className="text-error">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-0 bottom-2 font-label-sm text-[11px] text-on-surface-variant pointer-events-none font-bold">
                        Rs.
                      </span>
                      <input
                        id="standardShipping"
                        name="standardShipping"
                        type="text"
                        inputMode="decimal"
                        value={form.standardShipping}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="e.g. 550"
                        className={`w-full bg-transparent border-b-2 outline-none pl-8 py-2 font-body-md text-on-surface font-bold text-primary transition-colors ${
                          errors.standardShipping ? 'border-error' : 'border-outline-variant focus:border-primary'
                        }`}
                      />
                    </div>
                    {errors.standardShipping ? (
                      <p className="text-xs text-error mt-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">error</span>
                        {errors.standardShipping}
                      </p>
                    ) : (
                      <p className="text-xs text-on-surface-variant mt-1">
                        Standard / regular shipping cost for this product
                      </p>
                    )}
                  </div>

                  {/* Express Shipping */}
                  <div>
                    <label className="block font-label-md text-label-md text-on-surface mb-1" htmlFor="expressShipping">
                      Custom Express Delivery Fee (Rs.) <span className="text-error">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-0 bottom-2 font-label-sm text-[11px] text-on-surface-variant pointer-events-none font-bold">
                        Rs.
                      </span>
                      <input
                        id="expressShipping"
                        name="expressShipping"
                        type="text"
                        inputMode="decimal"
                        value={form.expressShipping}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="e.g. 1400"
                        className={`w-full bg-transparent border-b-2 outline-none pl-8 py-2 font-body-md text-on-surface font-bold text-primary transition-colors ${
                          errors.expressShipping ? 'border-error' : 'border-outline-variant focus:border-primary'
                        }`}
                      />
                    </div>
                    {errors.expressShipping ? (
                      <p className="text-xs text-error mt-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">error</span>
                        {errors.expressShipping}
                      </p>
                    ) : (
                      <p className="text-xs text-on-surface-variant mt-1">
                        Priority / express delivery cost for this product
                      </p>
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
                          <p className="font-label-sm text-[10px] text-on-surface-variant uppercase">Standard Fee</p>
                          <p className="font-bold text-primary text-sm">Rs. {parseInt(form.standardShipping || 0).toLocaleString()}</p>
                        </div>
                      </div>
                    )}
                    {form.expressShipping && (
                      <div className="flex items-center gap-2 px-3 py-2 bg-secondary-container/30 rounded-lg border border-outline-variant/30">
                        <span className="material-symbols-outlined text-secondary text-[18px]">rocket_launch</span>
                        <div>
                          <p className="font-label-sm text-[10px] text-on-surface-variant uppercase">Express Fee</p>
                          <p className="font-bold text-secondary text-sm">Rs. {parseInt(form.expressShipping || 0).toLocaleString()}</p>
                        </div>
                      </div>
                    )}
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
                  No categories found. Please <button type="button" onClick={() => navigate('/admin/categories')} className="underline font-bold cursor-pointer">create categories</button> first.
                </div>
              ) : (
                <div className="relative">
                  <select
                    id="category"
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full bg-transparent border-0 border-b-2 outline-none py-2 pr-8 font-body-md text-on-surface appearance-none cursor-pointer transition-colors ${
                      errors.category ? 'border-error' : 'border-outline-variant focus:border-primary'
                    }`}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name} className="bg-surface-container-lowest text-on-surface py-2">
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-0 top-1/2 -translate-y-1/2 text-primary pointer-events-none text-[20px]">
                    unfold_more
                  </span>
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
                  type="checkbox"
                  name="featured"
                  checked={form.featured}
                  onChange={handleChange}
                  className="w-5 h-5 accent-primary cursor-pointer"
                />
              </label>
            </div>
          </section>

          {/* Summary Card */}
          <section className="bg-primary-container/20 rounded-xl p-6 border border-primary/20 space-y-3">
            <h3 className="font-title-sm text-sm text-primary font-bold uppercase tracking-widest">
              {isEditMode ? 'Ready to Update?' : 'Ready to Publish?'}
            </h3>
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
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Delivery Fee</span>
                <span className="font-medium text-on-surface">
                  {shippingType === 'specific' ? 'Custom Rates' : 'Store Default'}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || !mainImagePreview || !form.name || !form.category}
              className="w-full mt-2 px-6 py-3 bg-primary text-white rounded-full font-label-md text-label-md hover:bg-primary/80 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-ambient font-bold"
            >
              {submitting ? (
                <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
              ) : (
                <span className="material-symbols-outlined text-[18px]">
                  {isEditMode ? 'save' : 'publish'}
                </span>
              )}
              {submitting ? (isEditMode ? 'Updating...' : 'Publishing...') : (isEditMode ? 'Update Product' : 'Publish Product')}
            </button>
          </section>
        </div>
      </form>

      {/* Shared Confirmation Modal for Clearing Colors */}
      <ConfirmModal
        isOpen={showClearColorsConfirm}
        title="Clear All Color Variants"
        message="Are you sure you want to remove all configured color variants? The product will revert to a single product with global price and stock."
        confirmText="Clear All Colors"
        cancelText="Keep Variants"
        variant="warning"
        icon="delete_sweep"
        onConfirm={() => {
          setColors([]);
          setShowClearColorsConfirm(false);
          toast.success('All color variants cleared.');
        }}
        onClose={() => setShowClearColorsConfirm(false)}
      />
    </div>
  );
}
