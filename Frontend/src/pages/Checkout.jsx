import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  SRI_LANKA_PROVINCES,
  SRI_LANKA_CITIES_BY_PROVINCE,
  ALL_SRI_LANKA_CITIES,
} from '../data/sriLankaLocationData';

const DEFAULT_CHECKOUT_ITEMS = [
  { id: 'blush-ribbon-bow', name: 'Blush Silk Ribbon Bow', price: 3600, quantity: 1, image: '/14_blush_silk_ribbon_bow.jpg' },
];

const API_BASE = 'http://localhost:5050/api';

export default function Checkout() {
  const { cartItems, cartSubtotal, clearCart } = useCart();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Fetch global delivery fee defaults from admin settings
  const [settings, setSettings] = useState({
    standardShipping: 450,
    expressShipping: 1200,
    freeShippingOver: 15000,
  });

  useEffect(() => {
    fetch(`${API_BASE}/settings`)
      .then((r) => r.json())
      .then((data) => {
        if (data.standardShipping !== undefined) setSettings(data);
      })
      .catch(() => {}); // silently keep defaults on error
  }, []);

  const items = cartItems && cartItems.length > 0 ? cartItems : DEFAULT_CHECKOUT_ITEMS;
  const totalPrice = cartSubtotal && cartSubtotal > 0 ? cartSubtotal : 3600;

  // Toggle between default profile address vs new custom delivery address
  const [isCustomAddress, setIsCustomAddress] = useState(false);

  const [form, setForm] = useState({
    firstName: user?.name ? user.name.split(' ')[0] : 'Amara',
    lastName: user?.name ? user.name.split(' ').slice(1).join(' ') : 'Perera',
    email: user?.email || 'amara@example.com',
    phone: user?.phone || '+94 77 123 4567',
    address: user?.address || '42 Flower Lane, Suite 4',
    city: user?.city || 'Colombo 03',
    district: user?.district || 'Western Province',
    postalCode: user?.postalCode || '00300',
  });

  const [defaultShippingMethod, setDefaultShippingMethod] = useState('standard');
  const [specificShippingMethods, setSpecificShippingMethods] = useState({});
  const [paymentMethod, setPaymentMethod] = useState('card');

  const availableCities = SRI_LANKA_CITIES_BY_PROVINCE[form.district] || ALL_SRI_LANKA_CITIES;

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleDistrictChange(e) {
    const newDistrict = e.target.value;
    const citiesForDistrict = SRI_LANKA_CITIES_BY_PROVINCE[newDistrict] || ALL_SRI_LANKA_CITIES;
    const newCity = citiesForDistrict.includes(form.city) ? form.city : citiesForDistrict[0];
    setForm({
      ...form,
      district: newDistrict,
      city: newCity,
    });
  }

  function handleSpecificShippingChange(key, method) {
    setSpecificShippingMethods((prev) => ({ ...prev, [key]: method }));
  }

  // Separate items into Default shipping items vs Specific/Custom shipping items
  const defaultItems = items.filter(
    (i) => i.standardShipping == null && i.expressShipping == null
  );
  const specificItems = items.filter(
    (i) => i.standardShipping != null || i.expressShipping != null
  );

  // 1. Fee calculation for default items package
  const hasDefaultItems = defaultItems.length > 0;
  const isFreeDefaultShipping =
    hasDefaultItems && totalPrice >= (settings.freeShippingOver || 15000);
  const defaultStandardFee = isFreeDefaultShipping ? 0 : (settings.standardShipping || 450);
  const defaultExpressFee = settings.expressShipping || 1200;

  const defaultShippingCost = !hasDefaultItems
    ? 0
    : defaultShippingMethod === 'express'
    ? defaultExpressFee
    : defaultStandardFee;

  // 2. Fee calculation for each specific item
  const specificShippingCalculations = specificItems.map((item, idx) => {
    const itemKey = item.id || `specific-${idx}`;
    const selectedMethod = specificShippingMethods[itemKey] || 'standard';
    const standardFee = item.standardShipping ?? (settings.standardShipping || 450);
    const expressFee = item.expressShipping ?? (settings.expressShipping || 1200);
    const cost = selectedMethod === 'express' ? expressFee : standardFee;
    return {
      item,
      key: itemKey,
      selectedMethod,
      standardFee,
      expressFee,
      cost,
    };
  });

  const specificShippingTotal = specificShippingCalculations.reduce(
    (sum, calc) => sum + calc.cost,
    0
  );

  const shippingCost = defaultShippingCost + specificShippingTotal;
  const finalTotal = totalPrice + shippingCost;

  const customerName = !isCustomAddress && user?.name
    ? user.name
    : `${form.firstName || ''} ${form.lastName || ''}`.trim() || 'Customer';

  const customerEmail = !isCustomAddress && user?.email
    ? user.email
    : form.email || 'customer@example.com';

  const customerPhone = !isCustomAddress && user?.phone
    ? user.phone
    : form.phone || '+94 77 123 4567';

  const customerAddress = isCustomAddress
    ? `${form.address}, ${form.city}, ${form.district} ${form.postalCode}`
    : user?.address || '42 Flower Lane, Colombo 03, Sri Lanka';

  async function handleButtonClick(e) {
    if (e) e.preventDefault();

    const customerDetails = {
      customerName,
      email: customerEmail,
      phone: customerPhone,
      address: customerAddress,
    };

    if (paymentMethod === 'card') {
      navigate('/checkout/payment', {
        state: {
          total: finalTotal,
          items,
          shippingCost,
          customerDetails,
        },
      });
    } else if (paymentMethod === 'bank_transfer') {
      navigate('/checkout/bank-slip', {
        state: {
          total: finalTotal,
          items,
          shippingCost,
          customerDetails,
        },
      });
    } else {
      // Cash on Delivery (COD) — create real order immediately
      setIsPlacingOrder(true);
      const toastId = toast.loading('Placing your order...');
      try {
        const orderPayload = {
          customerName: customerDetails.customerName,
          email: customerDetails.email,
          phone: customerDetails.phone,
          address: customerAddress,
          totalAmount: finalTotal,
          shippingCost: shippingCost,
          paymentMethod: 'COD',
          items: items.map((i) => ({
            productId: i.id || i.productId,
            colorName: i.color || i.colorName || null,
            quantity: i.quantity || 1,
            price: i.price,
          })),
        };

        const res = await fetch(`${API_BASE}/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(orderPayload),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to place order');

        toast.success('Order placed successfully! We are preparing your package.', { id: toastId });
        clearCart();
        navigate('/checkout/success', {
          state: {
            order: data.order,
            paymentMethod: 'cod',
            refNumber: data.order?.orderNumber,
            totalAmount: finalTotal,
          },
        });
      } catch (err) {
        const msg = err.message || 'Could not create order. Please try again.';
        toast.error(msg, { id: toastId });
      } finally {
        setIsPlacingOrder(false);
      }
    }
  }

  function handleSubmit(e) {
    if (e) e.preventDefault();
    handleButtonClick(e);
  }

  return (
    <main className="flex-grow w-full max-w-[1400px] mx-auto px-5 md:px-16 py-12">
      {/* Header */}
      <header className="mb-10 text-center md:text-left border-b border-outline-variant/30 pb-6">
        <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-primary tracking-tight mb-2">
          Malmalee Creations
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Checkout securely — Handcrafted with Magic.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column (7 Cols): Forms */}
        <div className="lg:col-span-7 space-y-10">
          {/* Delivery Details Section */}
          <section className="bg-surface-container-lowest rounded-xl p-6 md:p-8 shadow-ambient border border-outline-variant/30 space-y-6">
            <div className="flex justify-between items-center border-b border-outline-variant/30 pb-3">
              <h2 className="font-headline-md-mobile md:font-headline-md text-headline-md-mobile md:text-headline-md text-on-background">
                Delivery Details
              </h2>
              {isCustomAddress && (
                <button
                  type="button"
                  onClick={() => setIsCustomAddress(false)}
                  className="font-label-sm text-label-sm text-primary font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  Use Default Saved Address
                </button>
              )}
            </div>

            {!isCustomAddress ? (
              /* Saved Default Profile Address Card */
              <div className="space-y-4">
                <div className="bg-surface-container-low p-5 rounded-xl border-2 border-primary/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-title-sm text-title-sm text-primary font-bold">
                        {user?.name || `${form.firstName} ${form.lastName}`}
                      </span>
                      <span className="bg-primary-container text-on-background px-2.5 py-0.5 rounded-full font-label-sm text-[11px] font-bold">
                        Default Address
                      </span>
                    </div>
                    <p className="font-body-md text-body-md text-on-surface">{user?.address || form.address}</p>
                    <p className="font-body-md text-body-md text-on-surface-variant">
                      {user?.city || form.city}, {user?.state || form.district} {user?.postalCode || form.postalCode}
                    </p>
                    <p className="font-body-md text-body-md text-on-surface-variant font-medium pt-1">
                      📞 {user?.phone || form.phone}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsCustomAddress(true)}
                    className="px-4 py-2.5 border border-primary text-primary font-label-md text-label-md rounded-xl hover:bg-primary hover:text-white transition-all duration-300 whitespace-nowrap self-start sm:self-center shadow-sm cursor-pointer"
                  >
                    + Change to New Address
                  </button>
                </div>
              </div>
            ) : (
              /* Editable New Delivery Address Form */
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="font-label-md text-label-md text-on-surface-variant block mb-1">First Name *</label>
                    <input
                      type="text"
                      name="firstName"
                      value={form.firstName}
                      onChange={handleChange}
                      required
                      placeholder="Amara"
                      className="w-full bg-transparent border-0 border-b-2 border-outline-variant focus:border-primary outline-none py-2 font-body-md text-body-md text-on-surface transition-colors"
                    />
                  </div>
                  <div>
                    <label className="font-label-md text-label-md text-on-surface-variant block mb-1">Last Name *</label>
                    <input
                      type="text"
                      name="lastName"
                      value={form.lastName}
                      onChange={handleChange}
                      required
                      placeholder="Perera"
                      className="w-full bg-transparent border-0 border-b-2 border-outline-variant focus:border-primary outline-none py-2 font-body-md text-body-md text-on-surface transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-label-md text-label-md text-on-surface-variant block mb-1">Street Address *</label>
                  <input
                    type="text"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    required
                    placeholder="42 Flower Lane, Suite 4"
                    className="w-full bg-transparent border-0 border-b-2 border-outline-variant focus:border-primary outline-none py-2 font-body-md text-body-md text-on-surface transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* State / Province Dropdown */}
                  <div>
                    <label className="font-label-md text-label-md text-on-surface-variant block mb-1">State / Province *</label>
                    <div className="relative">
                      <select
                        name="district"
                        value={form.district}
                        onChange={handleDistrictChange}
                        required
                        className="w-full bg-transparent border-0 border-b-2 border-outline-variant focus:border-primary outline-none py-2 pr-8 font-body-md text-body-md text-on-surface appearance-none cursor-pointer transition-colors"
                      >
                        <option value="" disabled>Select Province...</option>
                        {SRI_LANKA_PROVINCES.map((p) => (
                          <option key={p} value={p} className="bg-surface-container-lowest text-on-surface py-1">
                            {p}
                          </option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined absolute right-0 top-1/2 -translate-y-1/2 text-primary pointer-events-none text-[20px]">
                        unfold_more
                      </span>
                    </div>
                  </div>

                  {/* City Dropdown */}
                  <div>
                    <label className="font-label-md text-label-md text-on-surface-variant block mb-1">City *</label>
                    <div className="relative">
                      <select
                        name="city"
                        value={form.city}
                        onChange={handleChange}
                        required
                        className="w-full bg-transparent border-0 border-b-2 border-outline-variant focus:border-primary outline-none py-2 pr-8 font-body-md text-body-md text-on-surface appearance-none cursor-pointer transition-colors"
                      >
                        <option value="" disabled>Select City...</option>
                        {availableCities.map((c) => (
                          <option key={c} value={c} className="bg-surface-container-lowest text-on-surface py-1">
                            {c}
                          </option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined absolute right-0 top-1/2 -translate-y-1/2 text-primary pointer-events-none text-[20px]">
                        unfold_more
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="font-label-md text-label-md text-on-surface-variant block mb-1">Postal Code *</label>
                    <input
                      type="text"
                      name="postalCode"
                      value={form.postalCode}
                      onChange={handleChange}
                      required
                      placeholder="00300"
                      className="w-full bg-transparent border-0 border-b-2 border-outline-variant focus:border-primary outline-none py-2 font-body-md text-body-md text-on-surface transition-colors"
                    />
                  </div>
                  <div>
                    <label className="font-label-md text-label-md text-on-surface-variant block mb-1">Contact Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      required
                      placeholder="+94 77 123 4567"
                      className="w-full bg-transparent border-0 border-b-2 border-outline-variant focus:border-primary outline-none py-2 font-body-md text-body-md text-on-surface transition-colors"
                    />
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Shipping Method Section */}
          <section className="bg-surface-container-lowest rounded-xl p-6 md:p-8 shadow-ambient border border-outline-variant/30 space-y-6">
            <div className="border-b border-outline-variant/30 pb-3 flex items-center justify-between">
              <div>
                <h2 className="font-headline-md-mobile md:font-headline-md text-headline-md-mobile md:text-headline-md text-on-background">
                  Delivery &amp; Shipping Options
                </h2>
                <p className="font-body-md text-body-md text-on-surface-variant text-sm mt-0.5">
                  Select standard or express delivery method for your items.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Group 1: Items with Default Delivery Fees */}
              {hasDefaultItems && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-outline-variant/30">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[22px]">storefront</span>
                      <div>
                        <h3 className="font-title-sm text-title-sm text-primary font-bold">
                          Standard Store Items ({defaultItems.length} {defaultItems.length === 1 ? 'item' : 'items'})
                        </h3>
                        <p className="font-body-md text-body-md text-on-surface-variant text-xs mt-0.5">
                          Standard store delivery package. One delivery method applies to all items in this group.
                        </p>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-primary-container text-[11px] font-label-sm text-on-background font-bold whitespace-nowrap">
                      Standard Package
                    </span>
                  </div>

                  <div className="space-y-4 bg-surface-container-low/50 p-4 md:p-5 rounded-xl border border-outline-variant/30">
                    {/* List down all items in the standard package */}
                    <div className="divide-y divide-outline-variant/20 space-y-2">
                      {defaultItems.map((item, idx) => (
                        <div key={item.id || idx} className="pt-2 first:pt-0 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-surface-container flex-shrink-0 border border-outline-variant/30">
                              <img src={item.image || '/14_blush_silk_ribbon_bow.jpg'} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <p className="font-label-md text-label-md text-on-surface font-medium line-clamp-1">{item.name}</p>
                              <p className="font-body-md text-body-md text-on-surface-variant text-xs">
                                Qty: {item.quantity || 1} &bull; Rs. {(item.price || 0).toLocaleString()} each
                              </p>
                            </div>
                          </div>
                          <span className="font-label-md text-label-md text-on-surface font-bold text-sm">
                            Rs. {((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Single Delivery Selector for All Standard Items */}
                    <div className="space-y-3 pt-3 border-t border-outline-variant/20">
                      <p className="font-label-sm text-label-sm text-on-surface-variant font-bold uppercase tracking-wider">
                        Select Delivery Method for Standard Items:
                      </p>

                      <label
                        className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          defaultShippingMethod === 'standard'
                            ? 'border-primary bg-primary-container/20 shadow-sm'
                            : 'border-outline-variant/50 hover:border-primary/40 bg-surface-container-lowest'
                        }`}
                      >
                        <input
                          type="radio"
                          name="defaultShipping"
                          value="standard"
                          checked={defaultShippingMethod === 'standard'}
                          onChange={() => setDefaultShippingMethod('standard')}
                          className="accent-primary h-4 w-4"
                        />
                        <span className="ml-4 flex-grow">
                          <span className="block font-label-md text-label-md text-on-background">Standard Delivery</span>
                          <span className="block font-body-md text-body-md text-on-surface-variant text-sm mt-0.5">3-5 Business Days</span>
                        </span>
                        <span className="font-label-md text-label-md text-primary font-bold">
                          {isFreeDefaultShipping ? 'FREE' : `Rs. ${defaultStandardFee.toLocaleString()}`}
                        </span>
                      </label>

                      <label
                        className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          defaultShippingMethod === 'express'
                            ? 'border-primary bg-primary-container/20 shadow-sm'
                            : 'border-outline-variant/50 hover:border-primary/40 bg-surface-container-lowest'
                        }`}
                      >
                        <input
                          type="radio"
                          name="defaultShipping"
                          value="express"
                          checked={defaultShippingMethod === 'express'}
                          onChange={() => setDefaultShippingMethod('express')}
                          className="accent-primary h-4 w-4"
                        />
                        <span className="ml-4 flex-grow">
                          <span className="block font-label-md text-label-md text-on-background">Express Delivery</span>
                          <span className="block font-body-md text-body-md text-on-surface-variant text-sm mt-0.5">1-2 Business Days</span>
                        </span>
                        <span className="font-label-md text-label-md text-primary font-bold">
                          Rs. {defaultExpressFee.toLocaleString()}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Group 2: Items with Specific Delivery Fees (Listed Separately) */}
              {specificShippingCalculations.length > 0 && (
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between pb-2 border-b border-outline-variant/30">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-secondary text-[22px]">local_shipping</span>
                      <div>
                        <h3 className="font-title-sm text-title-sm text-secondary font-bold">
                          Specific Delivery Items ({specificShippingCalculations.length} {specificShippingCalculations.length === 1 ? 'item' : 'items'})
                        </h3>
                        <p className="font-body-md text-body-md text-on-surface-variant text-xs mt-0.5">
                          These items have custom delivery rates. Select standard or express for each item below.
                        </p>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-secondary-container/50 text-[11px] font-label-sm text-secondary font-bold">
                      Custom Rates
                    </span>
                  </div>

                  <div className="space-y-4">
                    {specificShippingCalculations.map((calc) => (
                <div key={calc.key} className="space-y-4 bg-surface-container-low/50 p-4 md:p-5 rounded-xl border border-outline-variant/30">
                  <div className="flex items-center justify-between gap-3 pb-2 border-b border-outline-variant/20">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-surface-container flex-shrink-0 border border-outline-variant/30">
                        <img src={calc.item.image || '/14_blush_silk_ribbon_bow.jpg'} alt={calc.item.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h3 className="font-title-sm text-title-sm text-on-surface font-bold line-clamp-1">
                          {calc.item.name}
                        </h3>
                        <p className="font-body-md text-body-md text-on-surface-variant text-xs">
                          Qty: {calc.item.quantity || 1} &bull; Rs. {(calc.item.price || 0).toLocaleString()} each
                        </p>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-secondary-container/50 text-[11px] font-label-sm text-secondary font-bold whitespace-nowrap">
                      Specific Delivery
                    </span>
                  </div>

                  <div className="space-y-3 pt-1">
                    <p className="font-label-sm text-label-sm text-on-surface-variant font-bold uppercase tracking-wider">
                      Select Delivery Method for this Item:
                    </p>

                    <label
                      className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        calc.selectedMethod === 'standard'
                          ? 'border-primary bg-primary-container/20 shadow-sm'
                          : 'border-outline-variant/50 hover:border-primary/40 bg-surface-container-lowest'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`shipping-${calc.key}`}
                        value="standard"
                        checked={calc.selectedMethod === 'standard'}
                        onChange={() => handleSpecificShippingChange(calc.key, 'standard')}
                        className="accent-primary h-4 w-4"
                      />
                      <span className="ml-4 flex-grow">
                        <span className="block font-label-md text-label-md text-on-background">Standard Delivery</span>
                        <span className="block font-body-md text-body-md text-on-surface-variant text-sm mt-0.5">3-5 Business Days</span>
                      </span>
                      <span className="font-label-md text-label-md text-primary font-bold">
                        Rs. {calc.standardFee.toLocaleString()}
                      </span>
                    </label>

                    <label
                      className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        calc.selectedMethod === 'express'
                          ? 'border-primary bg-primary-container/20 shadow-sm'
                          : 'border-outline-variant/50 hover:border-primary/40 bg-surface-container-lowest'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`shipping-${calc.key}`}
                        value="express"
                        checked={calc.selectedMethod === 'express'}
                        onChange={() => handleSpecificShippingChange(calc.key, 'express')}
                        className="accent-primary h-4 w-4"
                      />
                      <span className="ml-4 flex-grow">
                        <span className="block font-label-md text-label-md text-on-background">Express Delivery</span>
                        <span className="block font-body-md text-body-md text-on-surface-variant text-sm mt-0.5">1-2 Business Days</span>
                      </span>
                      <span className="font-label-md text-label-md text-primary font-bold">
                        Rs. {calc.expressFee.toLocaleString()}
                      </span>
                    </label>
                  </div>
                </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Payment Method Selection (Clean Radio Options ONLY, no inline card fields) */}
          <section className="bg-surface-container-lowest rounded-xl p-6 md:p-8 shadow-ambient border border-outline-variant/30 space-y-4">
            <h2 className="font-headline-md-mobile md:font-headline-md text-headline-md-mobile md:text-headline-md text-on-background border-b border-outline-variant/30 pb-3">
              Payment Method
            </h2>

            <div className="space-y-4">
              {/* Credit / Debit Card Option */}
              <label
                className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'card'
                    ? 'border-primary bg-primary-container/20 shadow-sm'
                    : 'border-outline-variant/50 hover:border-primary/40'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={() => setPaymentMethod('card')}
                  className="accent-primary h-4 w-4"
                />
                <span className="ml-4 flex-grow">
                  <span className="block font-label-md text-label-md text-on-background">Credit / Debit Card</span>
                  <span className="block font-body-md text-body-md text-on-surface-variant text-sm mt-0.5">
                    Pay securely online via SSL Payment Gateway
                  </span>
                </span>
                <span className="material-symbols-outlined text-primary">credit_card</span>
              </label>

              {/* Direct Bank Transfer / Bank Slip Upload Option */}
              <label
                className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'bank_transfer'
                    ? 'border-primary bg-primary-container/20 shadow-sm'
                    : 'border-outline-variant/50 hover:border-primary/40'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="bank_transfer"
                  checked={paymentMethod === 'bank_transfer'}
                  onChange={() => setPaymentMethod('bank_transfer')}
                  className="accent-primary h-4 w-4"
                />
                <span className="ml-4 flex-grow">
                  <span className="block font-label-md text-label-md text-on-background">Direct Bank Transfer / Bank Slip Upload</span>
                  <span className="block font-body-md text-body-md text-on-surface-variant text-sm mt-0.5">
                    Transfer directly to our bank account and upload your deposit slip
                  </span>
                </span>
                <span className="material-symbols-outlined text-primary">upload_file</span>
              </label>

              {/* Cash on Delivery (COD) Option */}
              <label
                className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'cod'
                    ? 'border-primary bg-primary-container/20 shadow-sm'
                    : 'border-outline-variant/50 hover:border-primary/40'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="accent-primary h-4 w-4"
                />
                <span className="ml-4 flex-grow">
                  <span className="block font-label-md text-label-md text-on-background">Cash on Delivery (COD)</span>
                  <span className="block font-body-md text-body-md text-on-surface-variant text-sm mt-0.5">
                    Pay with cash when you receive your package
                  </span>
                </span>
                <span className="material-symbols-outlined text-primary">payments</span>
              </label>
            </div>
          </section>
        </div>

        {/* Right Column (5 Cols): Order Summary */}
        <div className="lg:col-span-5">
          <div className="bg-surface-container-lowest rounded-xl p-6 md:p-8 shadow-ambient border border-outline-variant/30 sticky top-8 space-y-6">
            <h2 className="font-title-sm text-title-sm text-on-background border-b border-outline-variant/30 pb-3">
              Order Summary
            </h2>

            {/* Cart Items List */}
            <ul className="divide-y divide-outline-variant/20 space-y-3">
              {items.map((item, i) => (
                <li key={i} className="pt-3 first:pt-0 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-lg bg-surface-container overflow-hidden flex-shrink-0 border border-outline-variant/30">
                      <img src={item.image || '/14_blush_silk_ribbon_bow.jpg'} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="font-label-md text-label-md text-on-background">{item.name}</h3>
                      <p className="font-body-md text-body-md text-on-surface-variant text-sm">Qty: {item.quantity || 1}</p>
                    </div>
                  </div>
                  <span className="font-label-md text-label-md text-on-background font-bold">
                    Rs. {((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>

            {/* Totals Breakdown */}
            <div className="border-t border-outline-variant/40 pt-4 space-y-2 font-body-md text-body-md">
              <div className="flex justify-between text-on-surface-variant">
                <span>Subtotal</span>
                <span>Rs. {totalPrice.toLocaleString()}</span>
              </div>

              {hasDefaultItems && specificShippingCalculations.length > 0 && (
                <div className="flex justify-between text-on-surface-variant text-xs">
                  <span>Standard Store Items ({defaultShippingMethod === 'express' ? 'Express' : 'Standard'})</span>
                  <span>{defaultShippingCost === 0 ? 'FREE' : `Rs. ${defaultShippingCost.toLocaleString()}`}</span>
                </div>
              )}

              {specificShippingCalculations.length > 0 && specificShippingCalculations.map((calc) => (
                <div key={calc.key} className="flex justify-between text-on-surface-variant text-xs">
                  <span className="truncate max-w-[200px]">{calc.item.name} ({calc.selectedMethod === 'express' ? 'Express' : 'Standard'})</span>
                  <span>Rs. {calc.cost.toLocaleString()}</span>
                </div>
              ))}

              <div className="flex justify-between text-on-surface-variant">
                <span>Shipping &amp; Delivery</span>
                <span>{shippingCost === 0 ? 'FREE' : `Rs. ${shippingCost.toLocaleString()}`}</span>
              </div>
            </div>

            <div className="border-t border-outline-variant/40 pt-4 flex justify-between items-center">
              <span className="font-title-sm text-title-sm text-on-background">Total</span>
              <span className="font-title-sm text-title-sm text-primary font-bold">Rs. {finalTotal.toLocaleString()}</span>
            </div>

            {/* Dynamic CTA button based on selected payment method */}
            <button
              type="button"
              onClick={handleButtonClick}
              className="w-full bg-primary-container text-on-background font-label-md text-label-md py-4 px-8 rounded-full hover:bg-primary hover:text-white transition-all duration-300 shadow-ambient flex items-center justify-center gap-2 cursor-pointer font-bold"
            >
              <span className="material-symbols-outlined text-sm">
                {paymentMethod === 'card' ? 'credit_card' : paymentMethod === 'bank_transfer' ? 'upload_file' : 'check_circle'}
              </span>
              {paymentMethod === 'card'
                ? `Proceed to Card Payment (Rs. ${finalTotal.toLocaleString()})`
                : paymentMethod === 'bank_transfer'
                ? `Proceed to Upload Bank Slip (Rs. ${finalTotal.toLocaleString()})`
                : `Confirm Order with COD (Rs. ${finalTotal.toLocaleString()})`}
            </button>

            <p className="text-center font-body-md text-body-md text-on-surface-variant text-xs pt-1">
              By placing your order, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </form>
    </main>
  );
}
