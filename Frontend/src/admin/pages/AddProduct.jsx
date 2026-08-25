import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ConfirmModal from '../../components/ConfirmModal';
import toast from 'react-hot-toast';

const API_BASE = 'http://localhost:5050/api';

const INITIAL_SPECS = [
  { id: '1', key: 'License Type', value: 'Lifetime Perpetual Key' },
  { id: '2', key: 'Activation Method', value: 'Instant Key / Telephone Activation' },
  { id: '3', key: 'Supported System', value: 'Windows 11 / 10 (32-bit & 64-bit)' },
  { id: '4', key: 'Delivery Method', value: 'Instant Email & Dashboard Delivery' },
  { id: '5', key: 'Warranty & Guarantee', value: '7 Days 1-to-1 Replacement Guarantee' },
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
  { name: '1 PC Retail License', hex: '#2563eb', placeholder: 'e.g. 1 PC Retail License' },
  { name: '5 PC Family Pack', hex: '#0f172a', placeholder: 'e.g. 5 PC License Pack' },
  { name: 'Pro Edition', hex: '#7c3aed', placeholder: 'e.g. Professional Edition' },
  { name: 'Enterprise License', hex: '#059669', placeholder: 'e.g. Enterprise Tier' },
  { name: 'Binding Account Key', hex: '#d97706', placeholder: 'e.g. Account Bind Key' },
];

const SPEC_PRESETS = [
  { key: 'License Type', keyPlaceholder: 'e.g. License Type', valPlaceholder: 'e.g. Lifetime Perpetual Key / 1-Year Sub' },
  { key: 'Activation Method', keyPlaceholder: 'e.g. Activation Method', valPlaceholder: 'e.g. Online Key / Telephone slui.exe 4' },
  { key: 'Supported OS / System', keyPlaceholder: 'e.g. Supported System', valPlaceholder: 'e.g. Windows 11 / 10 / macOS' },
  { key: 'Delivery Method', keyPlaceholder: 'e.g. Delivery Method', valPlaceholder: 'e.g. Instant Key via Email & Dashboard' },
  { key: 'Warranty & Guarantee', keyPlaceholder: 'e.g. Warranty', valPlaceholder: 'e.g. 7 Days Replacement / 100% Genuine' },
  { key: 'System Requirements', keyPlaceholder: 'e.g. Requirements', valPlaceholder: 'e.g. 4GB RAM, 10GB Space, TPM 2.0' },
  { key: 'Language Support', keyPlaceholder: 'e.g. Language', valPlaceholder: 'e.g. Multilingual / All Languages Supported' },
  { key: 'Installer Download', keyPlaceholder: 'e.g. Download Link', valPlaceholder: 'e.g. Official ISO Download Link Included' },
];

function getSpecPlaceholders(spec, index) {
  const keyLower = (spec.key || '').toLowerCase().trim();
  if (keyLower.includes('license') || keyLower.includes('type')) return { key: 'e.g. License Type', val: 'e.g. Lifetime Perpetual Key' };
  if (keyLower.includes('activat')) return { key: 'e.g. Activation Method', val: 'e.g. Online Instant Key / Telephone' };
  if (keyLower.includes('os') || keyLower.includes('system') || keyLower.includes('platform')) return { key: 'e.g. Supported System', val: 'e.g. Windows 11 / 10 (64-bit)' };
  if (keyLower.includes('deliver')) return { key: 'e.g. Delivery Method', val: 'e.g. Instant Key via Email & Dashboard' };
  if (keyLower.includes('warrant') || keyLower.includes('guarant')) return { key: 'e.g. Warranty', val: 'e.g. 7 Days Replacement Guarantee' };
  if (keyLower.includes('req') || keyLower.includes('spec')) return { key: 'e.g. Requirements', val: 'e.g. 4GB RAM, 10GB HDD Space' };
  if (keyLower.includes('lang')) return { key: 'e.g. Language', val: 'e.g. Multilingual / Global' };
  const preset = SPEC_PRESETS[index % SPEC_PRESETS.length];
  return { key: preset.keyPlaceholder, val: preset.valPlaceholder };
}

function parseFormattedTextPreview(text) {
  if (!text) return null;

  const colonIdx = text.indexOf(':');

  if (!text.includes('**') && colonIdx > 0) {
    const title = text.slice(0, colonIdx + 1);
    const rest = text.slice(colonIdx + 1);
    return (
      <>
        <strong className="font-extrabold text-on-surface" style={{ fontWeight: 800 }}>
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
            <strong key={i} className="font-extrabold text-on-surface" style={{ fontWeight: 800 }}>
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
              <strong className="font-extrabold text-on-surface" style={{ fontWeight: 800 }}>
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

function renderDescriptionPreviewItem(line, idx) {
  const trimmed = line.trim();
  if (!trimmed) return null;

  const numMatch = trimmed.match(/^(\d+[\.\)]\s*)/);
  const numberPrefix = numMatch ? numMatch[1] : '';

  const hasExplicitBullet = /^([•\-\*])\s*/.test(trimmed);

  const cleanText = trimmed.replace(/^([•\-\*]|(\d+[\.\)]))\s*/, '').trim();
  if (!cleanText) return null;

  const formattedContent = parseFormattedTextPreview(cleanText);

  if (numberPrefix) {
    return (
      <li key={idx} className="flex items-start gap-2.5 text-on-surface text-sm font-medium leading-relaxed">
        <span className="font-extrabold text-on-surface shrink-0 min-w-[20px]" style={{ fontWeight: 800 }}>
          {numberPrefix}
        </span>
        <div className="flex-1">{formattedContent}</div>
      </li>
    );
  }

  if (hasExplicitBullet) {
    return (
      <li key={idx} className="flex items-start gap-2.5 text-on-surface text-sm font-medium leading-relaxed">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
        <div className="flex-1">{formattedContent}</div>
      </li>
    );
  }

  return (
    <li key={idx} className="text-on-surface text-sm font-medium leading-relaxed list-none">
      {formattedContent}
    </li>
  );
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
    downloadUrl: '',
    licenseKey: '',
    multipleKeys: '',
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
          stock: String(p.stock ?? '10'),
          description: p.description || '',
          downloadUrl: p.downloadUrl || '',
          licenseKey: p.licenseKey || '',
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
      if (form.stock !== '' && form.stock !== null && form.stock !== undefined && parseInt(form.stock) < 0) {
        errs.stock = 'Invalid availability status.';
      }
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
        downloadUrl: form.downloadUrl.trim() || null,
        licenseKey: form.licenseKey.trim() || null,
        categoryName: form.category,
        price: colors.length > 0 ? parseFloat(colors[0].price) : parseFloat(form.price),
        stock: form.stock === '0' ? 0 : 10,
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

      // If multiple keys were pasted, save them to the product key pool
      if (form.multipleKeys && form.multipleKeys.trim()) {
        const prodId = data.id || editId;
        if (prodId) {
          await fetch(`${API_BASE}/products/${prodId}/keys`, {
            method: 'POST',
            headers: { ...authHeaders, 'Content-Type': 'application/json' },
            body: JSON.stringify({ rawText: form.multipleKeys }),
          }).catch(() => {});
        }
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

  const insertFormatting = (type) => {
    const textarea = document.getElementById('description');
    const current = form.description || '';

    if (!textarea) {
      if (type === 'bold') setForm((prev) => ({ ...prev, description: (prev.description || '') + '**bold text**' }));
      if (type === 'bullet') setForm((prev) => ({ ...prev, description: (prev.description || '') + '\n• ' }));
      if (type === 'number') setForm((prev) => ({ ...prev, description: (prev.description || '') + '\n1. ' }));
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const hasSelection = start !== end;
    const selected = current.substring(start, end);

    let updated = current;
    let selStart = start;
    let selEnd = start;

    if (type === 'bold') {
      if (hasSelection) {
        if (selected.startsWith('**') && selected.endsWith('**') && selected.length >= 4) {
          // Unwrap bold
          const unwrapped = selected.slice(2, -2);
          updated = current.substring(0, start) + unwrapped + current.substring(end);
          selStart = start;
          selEnd = start + unwrapped.length;
        } else {
          // Wrap bold
          const wrapped = `**${selected}**`;
          updated = current.substring(0, start) + wrapped + current.substring(end);
          selStart = start;
          selEnd = start + wrapped.length;
        }
      } else {
        const defaultText = 'bold text';
        const wrapped = `**${defaultText}**`;
        updated = current.substring(0, start) + wrapped + current.substring(end);
        selStart = start + 2;
        selEnd = start + 2 + defaultText.length;
      }
    } else if (type === 'bullet') {
      const isStartOfLine = start === 0 || current[start - 1] === '\n';
      const prefix = isStartOfLine ? '• ' : '\n• ';
      if (hasSelection) {
        const bulleted = selected.split('\n').map((l) => (l.startsWith('• ') ? l : `• ${l}`)).join('\n');
        updated = current.substring(0, start) + bulleted + current.substring(end);
        selStart = start + bulleted.length;
        selEnd = selStart;
      } else {
        updated = current.substring(0, start) + prefix + current.substring(end);
        selStart = start + prefix.length;
        selEnd = selStart;
      }
    } else if (type === 'number') {
      const lines = current.substring(0, start).split('\n');
      let nextNum = 1;
      lines.forEach((l) => {
        const m = l.match(/^(\d+)[\.\)]/);
        if (m) nextNum = parseInt(m[1], 10) + 1;
      });
      const isStartOfLine = start === 0 || current[start - 1] === '\n';
      const prefix = isStartOfLine ? `${nextNum}. ` : `\n${nextNum}. `;
      if (hasSelection) {
        let count = nextNum;
        const numbered = selected.split('\n').map((l) => `${count++}. ${l.replace(/^(\d+[\.\)]|•|\-)\s*/, '')}`).join('\n');
        updated = current.substring(0, start) + numbered + current.substring(end);
        selStart = start + numbered.length;
        selEnd = selStart;
      } else {
        updated = current.substring(0, start) + prefix + current.substring(end);
        selStart = start + prefix.length;
        selEnd = selStart;
      }
    }

    setForm((prev) => ({ ...prev, description: updated }));
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(selStart, selEnd);
    }, 30);
  };

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
            {isEditMode ? 'Edit Software License' : 'Add New Digital Software / License'}
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            {isEditMode
              ? 'Update the details, license keys, pricing, and system requirements for this software.'
              : 'Add a new digital software product, operating system key, or SaaS license.'}
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
              Software Details &amp; Identity
            </h2>

            {/* Product Name */}
            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-1" htmlFor="name">
                Software Name <span className="text-error">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g. Windows 11 Professional 64-Bit Digital Key"
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
              <div className="flex flex-wrap justify-between items-center gap-2 mb-2">
                <label className="block font-label-md text-label-md text-on-surface" htmlFor="description">
                  Software Description &amp; Key Features <span className="text-error">*</span>
                </label>
                <div className="flex items-center gap-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => insertFormatting('bold')}
                    className="px-2.5 py-1 bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-bold rounded border border-outline-variant/60 transition-colors flex items-center gap-1 cursor-pointer"
                    title="Make text bold (**bold**)"
                  >
                    <span className="font-extrabold font-serif text-sm">B</span> Bold
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('bullet')}
                    className="px-2.5 py-1 bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-bold rounded border border-outline-variant/60 transition-colors flex items-center gap-1 cursor-pointer"
                    title="Insert bullet point (•)"
                  >
                    <span className="font-bold text-sm">•</span> Bullet
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('number')}
                    className="px-2.5 py-1 bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-bold rounded border border-outline-variant/60 transition-colors flex items-center gap-1 cursor-pointer"
                    title="Insert numbered bullet (1.)"
                  >
                    <span className="font-bold text-xs">1.</span> Numbered
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({
                      ...prev,
                      description: "• **Instant Delivery:** 1x Authentic activation code delivered instantly to dashboard & email.\n• **License Validity:** Permanent lifetime key for 1 PC device.\n• **Technical Support:** Friendly 24/7 technical customer support included.\n• **Guarantee:** 7 Days 1-to-1 replacement warranty. 100% Genuine software license."
                    }))}
                    className="px-2.5 py-1 bg-primary/10 hover:bg-primary/20 text-primary font-bold rounded border border-primary/30 transition-colors flex items-center gap-1 cursor-pointer"
                    title="Insert sample digital license template"
                  >
                    <span className="material-symbols-outlined text-[14px]">auto_fix_high</span> Preset Template
                  </button>
                </div>
              </div>
              <textarea
                id="description"
                name="description"
                rows={6}
                value={form.description}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder={"• **Instant Delivery:** Authentic activation key delivered immediately\n• **Lifetime License:** Permanent key for your device\n• **24/7 Support:** Technical customer support included"}
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
                ) : (
                  <p className="text-xs text-on-surface-variant">
                    Tip: Use the toolbar buttons above to insert <strong>Bold</strong> titles and <strong>• Bullet</strong> points.
                  </p>
                )}
                <span className="font-label-sm text-xs text-on-surface-variant">
                  {form.description.length} chars
                </span>
              </div>

              {/* Live Formatting Preview */}
              {form.description.trim().length > 0 && (
                <div className="mt-3 p-4 bg-surface-container-low/80 border border-primary/20 rounded-xl space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider mb-2">
                    <span className="material-symbols-outlined text-[16px]">visibility</span>
                    Live Customer View Preview:
                  </div>
                  <ul className="space-y-2">
                    {form.description
                      .split('\n')
                      .map((line, idx) => {
                        const trimmed = line.trim();
                        if (!trimmed) {
                          return <li key={idx} className="h-2 list-none" />;
                        }
                        return renderDescriptionPreviewItem(trimmed, idx);
                      })}
                  </ul>
                </div>
              )}
            </div>

            {/* Software Download Link */}
            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-1 flex items-center gap-2" htmlFor="downloadUrl">
                <span className="material-symbols-outlined text-primary text-[18px]">download_for_offline</span>
                Software Download Link <span className="text-on-surface-variant font-normal text-xs">(optional - direct link for customer download)</span>
              </label>
              <input
                id="downloadUrl"
                name="downloadUrl"
                type="url"
                value={form.downloadUrl}
                onChange={handleChange}
                placeholder="e.g. https://officecdn.microsoft.com/pr/492350f6-3a01-4f97-b9c0-c7c6ddf67d60/media/en-us/ProPlus2021Retail.img"
                className="w-full bg-surface-container-low border border-outline-variant/60 focus:border-primary rounded-lg p-3 font-body-md text-on-surface focus:outline-none transition-colors text-sm"
              />
              <p className="text-xs text-on-surface-variant mt-1">
                Direct ISO/Software download URL. If provided, customers can click &quot;Click Here to Download&quot; on the product page.
              </p>
            </div>

            {/* Product License Key Pool */}
            <div className="space-y-3 p-4 rounded-xl bg-surface-container-low border border-outline-variant/30">
              <label className="block font-label-md text-label-md text-on-surface flex items-center gap-2" htmlFor="multipleKeys">
                <span className="material-symbols-outlined text-primary text-[18px]">vpn_key</span>
                Product License Keys Pool <span className="text-on-surface-variant font-normal text-xs">(paste multiple keys line-by-line)</span>
              </label>
              <textarea
                id="multipleKeys"
                name="multipleKeys"
                rows={4}
                value={form.multipleKeys}
                onChange={handleChange}
                placeholder={`XXXXX-XXXXX-XXXXX-11111\nXXXXX-XXXXX-XXXXX-22222\nXXXXX-XXXXX-XXXXX-33333`}
                className="w-full bg-surface border border-outline-variant/60 focus:border-primary rounded-lg p-3 font-mono text-xs text-on-surface focus:outline-none transition-colors leading-relaxed"
              />
              <p className="text-xs text-on-surface-variant">
                Paste activation keys above (one key per line). Each customer order will automatically consume one separate unique key from this pool!
              </p>

              <div className="pt-2 border-t border-outline-variant/30">
                <label className="block text-xs font-bold text-on-surface-variant mb-1" htmlFor="licenseKey">
                  Fallback Default Key (Optional)
                </label>
                <input
                  id="licenseKey"
                  name="licenseKey"
                  type="text"
                  value={form.licenseKey}
                  onChange={handleChange}
                  placeholder="Fallback key if key pool becomes empty"
                  className="w-full bg-surface border border-outline-variant/60 focus:border-primary rounded-lg p-2.5 font-mono text-xs text-on-surface focus:outline-none"
                />
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
                placeholder="e.g. Instant Delivery, Top Seller, Best Value, 100% Genuine"
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

          {/* License Editions & Variants */}
          <section className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient border border-outline-variant/30 space-y-5">
            <div className="flex justify-between items-center border-b border-outline-variant/30 pb-3">
              <div>
                <h2 className="font-title-sm text-title-sm text-primary flex items-center gap-2">
                  <span className="material-symbols-outlined">badge</span>
                  License Editions &amp; Variants
                </h2>
                <p className="font-body-md text-xs text-on-surface-variant mt-0.5">
                  Optional. Add software tiers (e.g. 1 PC License, Pro Edition, 5 PC Pack) each with custom pricing & key stock.
                </p>
              </div>
              <span className="font-label-sm text-label-sm text-primary font-bold">
                {colors.length} {colors.length === 1 ? 'Edition' : 'Editions'}
              </span>
            </div>

            {/* License Editions list */}
            <div className="space-y-4">
              {colors.map((color, index) => (
                <div
                  key={color.id || index}
                  className="flex flex-col lg:flex-row items-start lg:items-center gap-4 bg-surface-container-low p-4 rounded-xl border border-outline-variant/30 relative"
                >
                  {/* Badge Swatch & Edition Name */}
                  <div className="flex items-center gap-3 w-full lg:w-48">
                    <input
                      type="color"
                      value={color.hex}
                      onChange={(e) => handleColorChange(index, 'hex', e.target.value)}
                      className="w-9 h-9 rounded-full border border-outline-variant cursor-pointer p-0.5 bg-transparent"
                      title="Select tier color badge"
                    />
                    <div className="flex-grow">
                      <input
                        type="text"
                        value={color.name}
                        onChange={(e) => handleColorChange(index, 'name', e.target.value)}
                        placeholder={DEFAULT_PALETTES[index % DEFAULT_PALETTES.length]?.placeholder || 'e.g. 1 PC Retail License'}
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

                  {/* Stock Keys */}
                  <div className="w-full lg:w-24">
                    <label className="block font-label-sm text-[11px] text-on-surface-variant mb-0.5">Key Stock</label>
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
                      {color.imagePreview ? 'Change' : 'Add Image'}
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
                    title="Delete edition variant"
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
                className="inline-flex items-center gap-2 px-4 py-2 border border-dashed border-primary text-primary font-label-md text-label-md rounded-lg hover:bg-primary-container/30 transition-all cursor-pointer font-semibold"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Add Edition / License Variant
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

          {/* Pricing (when no colors) */}
          {!hasColors && (
            <section className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient border border-outline-variant/30 space-y-5">
              <h2 className="font-title-sm text-title-sm text-primary flex items-center gap-2 border-b border-outline-variant/30 pb-3">
                <span className="material-symbols-outlined">sell</span>
                Base Pricing
              </h2>
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
            </section>
          )}

          {/* Availability Status Section (ALWAYS VISIBLE FOR ALL PRODUCTS) */}
          <section className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient border border-outline-variant/30 space-y-4">
            <h2 className="font-title-sm text-title-sm text-primary flex items-center gap-2 border-b border-outline-variant/30 pb-3">
              <span className="material-symbols-outlined">inventory_2</span>
              Product Availability Status
            </h2>
            <p className="text-xs text-on-surface-variant">
              Choose whether customers can purchase this product on the store.
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, stock: '10' }))}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-2 cursor-pointer ${
                  parseInt(form.stock || 0) > 0 || form.stock === ''
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-400 shadow-xs'
                    : 'bg-surface-container text-on-surface-variant border-outline-variant/60 hover:border-emerald-300'
                }`}
              >
                <span className={`w-2.5 h-2.5 rounded-full ${parseInt(form.stock || 0) > 0 || form.stock === '' ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-400'}`} />
                Available (In Stock)
              </button>
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, stock: '0' }))}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-2 cursor-pointer ${
                  parseInt(form.stock || 0) === 0 && form.stock !== ''
                    ? 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border-red-400 shadow-xs'
                    : 'bg-surface-container text-on-surface-variant border-outline-variant/60 hover:border-red-300'
                }`}
              >
                <span className={`w-2.5 h-2.5 rounded-full ${parseInt(form.stock || 0) === 0 && form.stock !== '' ? 'bg-red-500' : 'bg-neutral-400'}`} />
                Out of Stock
              </button>
            </div>
          </section>

          {hasColors && (
            <div className="p-4 bg-primary-container/30 rounded-xl border border-primary/20 flex items-start gap-3">
              <span className="material-symbols-outlined text-primary mt-0.5">info</span>
              <div className="text-sm">
                <p className="font-bold text-primary mb-0.5">License Editions Active</p>
                <p className="text-on-surface-variant">
                  Price &amp; Key Stock are set per edition above. Total Keys: <span className="font-bold text-primary">{totalVariantStock} keys</span>
                </p>
              </div>
            </div>
          )}


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
                <span className="text-on-surface-variant">Software Name</span>
                <span className="font-medium text-on-surface truncate max-w-[130px]">{form.name || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Category</span>
                <span className="font-medium text-on-surface">{form.category || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Editions</span>
                <span className="font-medium text-on-surface">{hasColors ? `${colors.length} editions` : 'Single'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Main Banner / Cover</span>
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

      {/* Shared Confirmation Modal for Clearing Editions */}
      <ConfirmModal
        isOpen={showClearColorsConfirm}
        title="Clear All License Editions"
        message="Are you sure you want to remove all configured license editions? The product will revert to a single product edition with global price and key stock."
        confirmText="Clear All Editions"
        cancelText="Keep Editions"
        variant="warning"
        icon="delete_sweep"
        onConfirm={() => {
          setColors([]);
          setShowClearColorsConfirm(false);
          toast.success('All license editions cleared.');
        }}
        onClose={() => setShowClearColorsConfirm(false)}
      />
    </div>
  );
}
