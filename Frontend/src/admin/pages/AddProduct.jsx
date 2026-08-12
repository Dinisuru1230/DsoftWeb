import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = ['Bows', 'Scrunchies', 'Headbands', 'Ribbons', 'Accessories', 'Apparel', 'Bridal'];

const INITIAL_SPECS = [
  { id: '1', key: 'Material', value: '100% Silk' },
  { id: '2', key: 'Width', value: '2 inches' },
  { id: '3', key: 'Length', value: 'approx. 6 inches' },
  { id: '4', key: 'Care Instructions', value: 'Spot clean only' },
  { id: '5', key: 'Origin / Craftsmanship', value: 'Handmade with love in Sri Lanka' },
];

const INITIAL_COLORS = [
  { id: 'c1', name: 'Blush Pink', hex: '#fadadd', image: '/14_blush_silk_ribbon_bow.jpg', price: 12.00, stock: 18 },
  { id: 'c2', name: 'Cream Linen', hex: '#f7f4ef', image: '/01_cream_linen_fabrics.jpg', price: 14.00, stock: 12 },
  { id: 'c3', name: 'Rose Gold', hex: '#e8c5c8', image: '/08_pink_satin_robe.jpg', price: 16.00, stock: 5 },
  { id: 'c4', name: 'Sage Olive', hex: '#c5cbba', image: '/03_olive_linen_ribbons.jpg', price: 12.00, stock: 0 },
];

export default function AddProduct() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    sku: '',
    category: 'Bows',
    price: '12.00',
    comparePrice: '18.00',
    stock: '48',
    description: '',
    featured: false,
    active: true,
  });

  const [specs, setSpecs] = useState(INITIAL_SPECS);
  const [colors, setColors] = useState(INITIAL_COLORS);
  const [mainImage, setMainImage] = useState(null);
  const [subImages, setSubImages] = useState([null, null, null]);
  const [saved, setSaved] = useState(false);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  }

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

  function handleColorChange(index, field, value) {
    const updated = [...colors];
    if (field === 'stock') {
      updated[index][field] = Math.max(0, parseInt(value) || 0);
    } else if (field === 'price') {
      updated[index][field] = Math.max(0, parseFloat(value) || 0);
    } else {
      updated[index][field] = value;
    }
    setColors(updated);
  }

  function handleColorImageUpload(index, e) {
    const file = e.target.files[0];
    if (file) {
      const updated = [...colors];
      updated[index].image = URL.createObjectURL(file);
      setColors(updated);
    }
  }

  function handleAddColor() {
    setColors([...colors, { id: Date.now().toString(), name: '', hex: '#fadadd', image: null, price: 12.00, stock: 10 }]);
  }

  function handleRemoveColor(index) {
    setColors(colors.filter((_, i) => i !== index));
  }

  function handleMainImage(e) {
    const file = e.target.files[0];
    if (file) {
      setMainImage(URL.createObjectURL(file));
    }
  }

  function handleSubImage(index, e) {
    const file = e.target.files[0];
    if (file) {
      const updated = [...subImages];
      updated[index] = URL.createObjectURL(file);
      setSubImages(updated);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => navigate('/admin/products'), 1500);
  }

  const totalVariantStock = colors.reduce((acc, c) => acc + (parseInt(c.stock) || 0), 0);
  const hasColors = colors.length > 0;

  return (
    <div className="p-4 md:p-8 w-full max-w-[1200px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/30 pb-4">
        <div>
          <button
            onClick={() => navigate('/admin/products')}
            className="inline-flex items-center text-on-surface-variant hover:text-primary font-label-sm text-label-sm mb-1 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px] mr-1">arrow_back</span>
            Back to Products
          </button>
          <h1 className="font-headline-md-mobile md:font-headline-md text-headline-md text-on-surface">Add New Product</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Fill in the details to add a new item to your boutique collection.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="px-6 py-3 rounded-full border border-outline-variant text-on-surface font-label-md text-label-md hover:bg-surface-container transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className={`px-8 py-3 rounded-full font-label-md text-label-md shadow-ambient transition-all duration-300 flex items-center gap-2 ${
              saved ? 'bg-primary text-white' : 'bg-primary-container text-on-background hover:bg-primary hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">{saved ? 'check' : 'publish'}</span>
            {saved ? 'Product Published!' : 'Publish Product'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: General Info, Media Uploads, Color Variants (Per-color Price/Stock/Photo), Specs */}
        <div className="lg:col-span-2 space-y-8">
          {/* General Information */}
          <section className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient border border-outline-variant/30 space-y-5">
            <h2 className="font-title-sm text-title-sm text-primary flex items-center gap-2 border-b border-outline-variant/30 pb-3">
              <span className="material-symbols-outlined">edit_note</span>
              General Information
            </h2>
            <div className="space-y-4">
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
                  placeholder="e.g. Blush Silk Ribbon Bow"
                  required
                  className="w-full bg-transparent border-b-2 border-outline-variant focus:border-primary outline-none py-2 font-body-md text-body-md text-on-surface placeholder:text-outline transition-colors"
                />
              </div>

              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-1" htmlFor="description">
                  Short Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Describe your handcrafted product details, charm, and styling..."
                  className="w-full bg-transparent border-b-2 border-outline-variant focus:border-primary outline-none py-2 font-body-md text-body-md text-on-surface placeholder:text-outline transition-colors resize-none"
                />
              </div>
            </div>
          </section>

          {/* Media / Base Photos Upload Section */}
          <section className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient border border-outline-variant/30 space-y-5">
            <div className="flex justify-between items-center border-b border-outline-variant/30 pb-3">
              <h2 className="font-title-sm text-title-sm text-primary flex items-center gap-2">
                <span className="material-symbols-outlined">imagesmode</span>
                Product Base Photos (Main Cover + 3 Gallery Images)
              </h2>
              <span className="font-label-sm text-label-sm text-on-surface-variant">4 Photos max</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {/* Main Cover Image */}
              <div className="sm:col-span-2">
                <label className="font-label-sm text-label-sm text-primary font-bold block mb-2">Main Cover Photo *</label>
                <div
                  className="w-full aspect-square rounded-xl border-2 border-dashed border-outline-variant hover:border-primary transition-colors overflow-hidden cursor-pointer bg-surface-container flex items-center justify-center relative group"
                  onClick={() => document.getElementById('main-image-input').click()}
                >
                  {mainImage ? (
                    <img src={mainImage} alt="Main Cover" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-4">
                      <span className="material-symbols-outlined text-4xl text-primary block mb-2">cloud_upload</span>
                      <p className="font-label-md text-label-md text-on-surface font-bold">Upload Main Cover</p>
                      <p className="font-label-sm text-label-sm text-outline">High-Res 4K Image</p>
                    </div>
                  )}
                </div>
                <input id="main-image-input" type="file" accept="image/*" onChange={handleMainImage} className="hidden" />
              </div>

              {/* Sub Images 1, 2, 3 */}
              <div className="sm:col-span-2 flex flex-col justify-between gap-2">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider block">Gallery Sub Images (3 Photos)</label>
                <div className="grid grid-cols-3 gap-2">
                  {[0, 1, 2].map((idx) => (
                    <div key={idx} className="flex flex-col items-center">
                      <div
                        className="w-full aspect-square rounded-lg border border-dashed border-outline-variant hover:border-primary transition-colors overflow-hidden cursor-pointer bg-surface-container flex items-center justify-center relative"
                        onClick={() => document.getElementById(`sub-image-input-${idx}`).click()}
                      >
                        {subImages[idx] ? (
                          <img src={subImages[idx]} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-center">
                            <span className="material-symbols-outlined text-xl text-outline block">add_a_photo</span>
                            <span className="font-label-sm text-[10px] text-outline">Sub {idx + 1}</span>
                          </div>
                        )}
                      </div>
                      <input
                        id={`sub-image-input-${idx}`}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleSubImage(idx, e)}
                        className="hidden"
                      />
                    </div>
                  ))}
                </div>
                <p className="font-label-sm text-label-sm text-on-surface-variant opacity-70">
                  These gallery images appear on the Product Details page thumbnail gallery.
                </p>
              </div>
            </div>
          </section>

          {/* Color Variants with Individual Price, Stock & Photo */}
          <section className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient border border-outline-variant/30 space-y-5">
            <div className="flex justify-between items-center border-b border-outline-variant/30 pb-3">
              <h2 className="font-title-sm text-title-sm text-primary flex items-center gap-2">
                <span className="material-symbols-outlined">palette</span>
                Color Variants: Prices, Stocks & Photos
              </h2>
              <span className="font-label-sm text-label-sm text-on-surface-variant font-bold">
                {hasColors ? `${colors.length} Color Variants (${totalVariantStock} units total)` : 'No Colors Added'}
              </span>
            </div>

            <p className="font-body-md text-body-md text-on-surface-variant text-sm">
              Optional: Add color variants for this product. You can set an <span className="text-primary font-bold">individual Price ($), Stock Quantity, and Photo</span> for each color!
              <br />
              <span className="text-primary font-medium">
                {hasColors
                  ? '✨ Colors added! Pricing & Stock are configured per variant below.'
                  : 'ℹ️ If no colors are added, Default Price & Default Stock fields will be used below.'}
              </span>
            </p>

            <div className="space-y-4">
              {colors.map((color, index) => (
                <div key={color.id || index} className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 bg-surface-container-low p-4 rounded-xl border border-outline-variant/30">
                  {/* Swatch & Color Name */}
                  <div className="flex items-center gap-3 flex-grow min-w-[180px]">
                    <input
                      type="color"
                      value={color.hex}
                      onChange={(e) => handleColorChange(index, 'hex', e.target.value)}
                      className="w-9 h-9 rounded-full cursor-pointer border border-outline-variant p-0.5 bg-transparent flex-shrink-0"
                    />
                    <div className="flex-grow">
                      <label className="block font-label-sm text-label-sm text-on-surface-variant mb-0.5">Color Name</label>
                      <input
                        type="text"
                        value={color.name}
                        onChange={(e) => handleColorChange(index, 'name', e.target.value)}
                        placeholder="e.g. Blush Pink..."
                        className="w-full bg-surface-bright border border-outline-variant rounded-md px-3 py-1.5 font-body-md text-body-md text-on-surface focus:border-primary outline-none"
                      />
                    </div>
                  </div>

                  {/* Individual Price for this Color */}
                  <div className="w-full sm:w-28 border-t sm:border-t-0 sm:border-l border-outline-variant/30 pt-2 sm:pt-0 sm:pl-3">
                    <label className="block font-label-sm text-label-sm text-on-surface-variant mb-0.5">Price ($ USD)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={color.price}
                      onChange={(e) => handleColorChange(index, 'price', e.target.value)}
                      placeholder="12.00"
                      className="w-full bg-surface-bright border border-outline-variant rounded-md px-3 py-1.5 font-body-md text-body-md text-on-surface focus:border-primary outline-none font-bold"
                    />
                  </div>

                  {/* Individual Stock Input for this Color */}
                  <div className="w-full sm:w-28 border-t sm:border-t-0 sm:border-l border-outline-variant/30 pt-2 sm:pt-0 sm:pl-3">
                    <label className="block font-label-sm text-label-sm text-on-surface-variant mb-0.5">Stock Qty</label>
                    <input
                      type="number"
                      min="0"
                      value={color.stock}
                      onChange={(e) => handleColorChange(index, 'stock', e.target.value)}
                      placeholder="0"
                      className="w-full bg-surface-bright border border-outline-variant rounded-md px-3 py-1.5 font-body-md text-body-md text-on-surface focus:border-primary outline-none font-bold text-primary"
                    />
                  </div>

                  {/* Dedicated Photo Upload Slot for this Color */}
                  <div className="flex items-center gap-2 w-full sm:w-44 border-t sm:border-t-0 sm:border-l border-outline-variant/30 pt-2 sm:pt-0 sm:pl-3">
                    <div
                      className="w-10 h-10 rounded-lg border border-dashed border-outline-variant hover:border-primary transition-colors overflow-hidden cursor-pointer bg-surface-bright flex items-center justify-center flex-shrink-0"
                      onClick={() => document.getElementById(`color-img-input-${index}`).click()}
                    >
                      {color.image ? (
                        <img src={color.image} alt={color.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="material-symbols-outlined text-base text-primary">add_a_photo</span>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <button
                        type="button"
                        onClick={() => document.getElementById(`color-img-input-${index}`).click()}
                        className="font-label-sm text-label-sm text-primary font-bold hover:underline text-left"
                      >
                        {color.image ? 'Change Photo' : 'Upload Photo'}
                      </button>
                    </div>
                    <input
                      id={`color-img-input-${index}`}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleColorImageUpload(index, e)}
                      className="hidden"
                    />
                  </div>

                  {/* Delete Color Row */}
                  <button
                    type="button"
                    onClick={() => handleRemoveColor(index)}
                    className="p-2 text-on-surface-variant hover:text-error transition-colors self-end lg:self-center"
                    title="Delete Color Variant"
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
                className="inline-flex items-center gap-2 px-4 py-2 border border-dashed border-primary text-primary font-label-md text-label-md rounded-lg hover:bg-primary-container/30 transition-all duration-300"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Add Color Variant
              </button>

              {hasColors && (
                <button
                  type="button"
                  onClick={() => setColors([])}
                  className="font-label-sm text-label-sm text-error hover:underline"
                >
                  Clear All Colors
                </button>
              )}
            </div>
          </section>

          {/* Dynamic Product Specifications / Details List */}
          <section className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient border border-outline-variant/30 space-y-5">
            <div className="flex justify-between items-center border-b border-outline-variant/30 pb-3">
              <h2 className="font-title-sm text-title-sm text-primary flex items-center gap-2">
                <span className="material-symbols-outlined">checklist</span>
                Product Details & Specifications
              </h2>
              <span className="font-label-sm text-label-sm text-on-surface-variant">Custom Key-Value Specs</span>
            </div>

            <p className="font-body-md text-body-md text-on-surface-variant text-sm">
              Default specs (Material, Width, Length, Care, Origin) are suggested below. You can edit any label or value, delete unused ones, or add custom detail rows.
            </p>

            <div className="space-y-4">
              {specs.map((spec, index) => (
                <div key={spec.id || index} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-surface-container-low p-3.5 rounded-lg border border-outline-variant/20">
                  <div className="sm:w-1/3">
                    <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Label / Title</label>
                    <input
                      type="text"
                      value={spec.key}
                      onChange={(e) => handleSpecChange(index, 'key', e.target.value)}
                      placeholder="e.g. Material, Weight..."
                      className="w-full bg-surface-bright border border-outline-variant rounded-md px-3 py-2 font-body-md text-body-md text-on-surface focus:border-primary outline-none"
                    />
                  </div>
                  <div className="flex-grow">
                    <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Value / Details</label>
                    <input
                      type="text"
                      value={spec.value}
                      onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                      placeholder="e.g. 100% Silk, 200g..."
                      className="w-full bg-surface-bright border border-outline-variant rounded-md px-3 py-2 font-body-md text-body-md text-on-surface focus:border-primary outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveSpec(index)}
                    title="Delete Detail Row"
                    className="self-end sm:self-center p-2 text-on-surface-variant hover:text-error transition-colors mt-2 sm:mt-5"
                  >
                    <span className="material-symbols-outlined text-[20px]">delete</span>
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleAddSpec}
                className="inline-flex items-center gap-2 px-4 py-2 border border-dashed border-primary text-primary font-label-md text-label-md rounded-lg hover:bg-primary-container/30 transition-all duration-300"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Add Custom Detail / Specification
              </button>
            </div>
          </section>

          {/* Pricing & Inventory */}
          <section className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient border border-outline-variant/30 space-y-5">
            <h2 className="font-title-sm text-title-sm text-primary flex items-center gap-2 border-b border-outline-variant/30 pb-3">
              <span className="material-symbols-outlined">sell</span>
              Pricing & Inventory Management
            </h2>

            {hasColors ? (
              /* When Colors Exist: Informative banner showing per-color pricing & stock */
              <div className="p-4 bg-primary-container/30 rounded-lg border border-primary/20 flex items-start gap-3">
                <span className="material-symbols-outlined text-primary mt-0.5">info</span>
                <div className="text-sm">
                  <p className="font-bold text-primary mb-0.5">Color Variants Active</p>
                  <p className="text-on-surface-variant">
                    Price and Stock Quantity are configured for each color variant above (Total Color Variant Stock: <span className="font-bold text-primary">{totalVariantStock} units</span>).
                  </p>
                </div>
              </div>
            ) : (
              /* When NO Colors Exist: Render Default Price and Default Stock fields */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-label-md text-label-md text-on-surface mb-1" htmlFor="price">
                    Default Price ($ USD) <span className="text-error">*</span>
                  </label>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="12.00"
                    required
                    className="w-full bg-transparent border-b-2 border-outline-variant focus:border-primary outline-none py-2 font-body-md text-body-md text-on-surface font-bold text-primary"
                  />
                </div>

                <div>
                  <label className="block font-label-md text-label-md text-on-surface mb-1" htmlFor="stock">
                    Default Stock Quantity <span className="text-error">*</span>
                  </label>
                  <input
                    id="stock"
                    name="stock"
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={handleChange}
                    placeholder="48"
                    required
                    className="w-full bg-transparent border-b-2 border-outline-variant focus:border-primary outline-none py-2 font-body-md text-body-md text-on-surface font-bold text-primary"
                  />
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Organization & Settings */}
        <div className="space-y-8">
          {/* Organization */}
          <section className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient border border-outline-variant/30 space-y-5">
            <h2 className="font-title-sm text-title-sm text-primary flex items-center gap-2 border-b border-outline-variant/30 pb-3">
              <span className="material-symbols-outlined">category</span>
              Organization
            </h2>
            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-2" htmlFor="category">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-3 font-body-md text-body-md text-on-surface"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </section>

          {/* Product Status & Flags */}
          <section className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient border border-outline-variant/30 space-y-5">
            <h2 className="font-title-sm text-title-sm text-primary flex items-center gap-2 border-b border-outline-variant/30 pb-3">
              <span className="material-symbols-outlined">visibility</span>
              Product Visibility
            </h2>

            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="font-label-md text-label-md text-on-surface">Active on Store</span>
                <input
                  type="checkbox"
                  name="active"
                  checked={form.active}
                  onChange={handleChange}
                  className="w-5 h-5 accent-primary cursor-pointer"
                />
              </label>

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
        </div>
      </form>
    </div>
  );
}
