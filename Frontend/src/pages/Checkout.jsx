import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
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
  const { user } = useAuth();
  const navigate = useNavigate();

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
    firstName: user?.firstName || 'Amara',
    lastName: user?.lastName || 'Perera',
    email: user?.email || 'amara@malmalee.lk',
    phone: user?.phone || '+94 77 123 4567',
    address: user?.address || '42 Flower Lane, Suite 4',
    city: user?.city || 'Colombo 03',
    district: user?.state || 'Western Province',
    postalCode: user?.postalCode || '00300',
  });

  const [shippingMethod, setShippingMethod] = useState('standard');
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

  // Calculate shipping:
  // - If product has its own standardShipping/expressShipping set → use that
  // - If not set (null/undefined) → fall back to global setting default
  // - Take MAX across all cart items (most expensive product shipping wins)
  const maxProductStandardShipping = Math.max(
    ...items.map((i) =>
      i.standardShipping != null ? Number(i.standardShipping) : settings.standardShipping
    )
  );
  const maxProductExpressShipping = Math.max(
    ...items.map((i) =>
      i.expressShipping != null ? Number(i.expressShipping) : settings.expressShipping
    )
  );

  const standardFee = totalPrice > settings.freeShippingOver ? 0 : maxProductStandardShipping;
  const expressFee = maxProductExpressShipping;

  const shippingCost = shippingMethod === 'express' ? expressFee : standardFee;
  const finalTotal = totalPrice + shippingCost;

  const activeAddress = isCustomAddress
    ? `${form.address}, ${form.city}, ${form.district} ${form.postalCode}`
    : user?.address || '42 Flower Lane, Suite 4, Colombo 03';

  function handleButtonClick(e) {
    if (e) e.preventDefault();
    if (paymentMethod === 'card') {
      navigate('/checkout/payment', { state: { total: finalTotal } });
    } else if (paymentMethod === 'bank_transfer') {
      navigate('/checkout/bank-slip', { state: { total: finalTotal, items, shippingCost, savedAddress: activeAddress } });
    } else {
      clearCart();
      navigate('/checkout/success', { state: { paymentMethod: 'cod' } });
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
          <section className="bg-surface-container-lowest rounded-xl p-6 md:p-8 shadow-ambient border border-outline-variant/30 space-y-4">
            <h2 className="font-headline-md-mobile md:font-headline-md text-headline-md-mobile md:text-headline-md text-on-background border-b border-outline-variant/30 pb-3">
              Shipping Method
            </h2>
            <div className="space-y-3">
              <label
                className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  shippingMethod === 'standard'
                    ? 'border-primary bg-primary-container/20 shadow-sm'
                    : 'border-outline-variant/50 hover:border-primary/40'
                }`}
              >
                <input
                  type="radio"
                  name="shipping"
                  value="standard"
                  checked={shippingMethod === 'standard'}
                  onChange={() => setShippingMethod('standard')}
                  className="accent-primary h-4 w-4"
                />
                <span className="ml-4 flex-grow">
                  <span className="block font-label-md text-label-md text-on-background">Standard Delivery</span>
                  <span className="block font-body-md text-body-md text-on-surface-variant text-sm mt-0.5">3-5 Business Days</span>
                </span>
                <span className="font-label-md text-label-md text-primary font-bold">
                  {totalPrice > 15000 ? 'FREE' : `Rs. ${maxProductStandardShipping.toLocaleString()}`}
                </span>
              </label>

              <label
                className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  shippingMethod === 'express'
                    ? 'border-primary bg-primary-container/20 shadow-sm'
                    : 'border-outline-variant/50 hover:border-primary/40'
                }`}
              >
                <input
                  type="radio"
                  name="shipping"
                  value="express"
                  checked={shippingMethod === 'express'}
                  onChange={() => setShippingMethod('express')}
                  className="accent-primary h-4 w-4"
                />
                <span className="ml-4 flex-grow">
                  <span className="block font-label-md text-label-md text-on-background">Express Delivery</span>
                  <span className="block font-body-md text-body-md text-on-surface-variant text-sm mt-0.5">1-2 Business Days</span>
                </span>
                <span className="font-label-md text-label-md text-primary font-bold">
                  Rs. {maxProductExpressShipping.toLocaleString()}
                </span>
              </label>
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
              <div className="flex justify-between text-on-surface-variant">
                <span>Shipping</span>
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
