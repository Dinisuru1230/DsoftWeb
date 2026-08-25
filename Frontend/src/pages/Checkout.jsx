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

  const [currentTime, setCurrentTime] = useState('');
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', {
        timeZone: 'Asia/Colombo',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
      setCurrentTime(timeStr);

      const colomboHourStr = now.toLocaleTimeString('en-US', {
        timeZone: 'Asia/Colombo',
        hour: '2-digit',
        hour12: false,
      });
      const colomboHour = parseInt(colomboHourStr, 10);
      setIsOnline(colomboHour >= 5 && colomboHour < 23);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

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
  const [sameAsDelivery, setSameAsDelivery] = useState(true);
  const [selectedExistingAddress, setSelectedExistingAddress] = useState('default');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [termsError, setTermsError] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const [form, setForm] = useState({
    firstName: user?.name ? user.name.split(' ')[0] : 'Amara',
    lastName: user?.name ? user.name.split(' ').slice(1).join(' ') : 'Perera',
    email: user?.email || 'amara@example.com',
    phone: user?.phone || '+94 77 123 4567',
    address: user?.address || 'Sri Lanka',
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

  const shippingCost = 0;
  const finalTotal = totalPrice;

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

    if (!agreeTerms) {
      setTermsError(true);
      return;
    } else {
      setTermsError(false);
    }

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
    <main className="flex-grow w-full max-w-[1400px] mx-auto px-5 md:px-16 py-6 md:py-8">
      {/* Header */}
      <header className="mb-4 text-center md:text-left border-b border-outline-variant/30 pb-2">
        <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-background tracking-tight">
          Checkout
        </h1>
      </header>

      {/* Trust & Information Cards Section */}
      <section className="mb-6 bg-[#f8f9fa] dark:bg-surface-container-low border border-outline-variant/30 rounded-2xl p-4 md:p-5 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          {/* 1. FAST DELIVERY */}
          <div className="flex flex-col items-center px-2">
            <div className="w-12 h-12 rounded-full border border-neutral-800 flex items-center justify-center mb-2 bg-white dark:bg-surface-container-lowest shadow-sm">
              <span className="material-symbols-outlined text-[24px] text-[#ff5500]">local_shipping</span>
            </div>
            <h3 className="font-bold text-[#d92626] uppercase text-xs md:text-sm tracking-wider mb-1">
              FAST DELIVERY
            </h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              We typically deliver within 15 minutes during our working hours; in rare cases, delivery may take longer.
            </p>
          </div>

          {/* 2. WORKING HOURS */}
          <div className="flex flex-col items-center px-2">
            <div className="w-12 h-12 rounded-full border border-neutral-800 flex items-center justify-center mb-2 bg-white dark:bg-surface-container-lowest shadow-sm">
              <span className="material-symbols-outlined text-[24px] text-[#ff5500]">schedule</span>
            </div>
            <h3 className="font-bold text-[#d92626] uppercase text-xs md:text-sm tracking-wider mb-1">
              WORKING HOURS
            </h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              5.00 AM to 11.00 PM (GMT+5:30 - Current time: {currentTime || '10:44 PM'})
            </p>
            <p className="text-xs font-medium mt-0.5">
              Status: <span className={isOnline ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>{isOnline ? 'Online' : 'Offline'}</span>
            </p>
          </div>

          {/* 3. EMAIL NOTIFICATIONS */}
          <div className="flex flex-col items-center px-2">
            <div className="w-12 h-12 rounded-full border border-neutral-800 flex items-center justify-center mb-2 bg-white dark:bg-surface-container-lowest shadow-sm">
              <span className="material-symbols-outlined text-[24px] text-[#ff5500]">mail</span>
            </div>
            <h3 className="font-bold text-[#d92626] uppercase text-xs md:text-sm tracking-wider mb-1">
              EMAIL NOTIFICATIONS
            </h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Order status notifications via Email. Check My Account &gt;&gt; Order History to see purchased products.
            </p>
          </div>

          {/* 4. WARRANTY */}
          <div className="flex flex-col items-center px-2">
            <div className="w-12 h-12 rounded-full border border-neutral-800 flex items-center justify-center mb-2 bg-white dark:bg-surface-container-lowest shadow-sm">
              <span className="material-symbols-outlined text-[24px] text-[#ff5500]">verified</span>
            </div>
            <h3 className="font-bold text-[#d92626] uppercase text-xs md:text-sm tracking-wider mb-1">
              WARRANTY
            </h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              If you face any problem during activation, contact us within the warranty period with error screenshots.
            </p>
          </div>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column (7 Cols): Forms */}
        <div className="lg:col-span-7 space-y-10">
          {/* Billing Address Section */}
          <section className="bg-surface-container-lowest rounded-xl p-6 md:p-8 shadow-ambient border border-outline-variant/30 space-y-5">
            <div className="border-b border-outline-variant/30 pb-2 mb-4">
              <h2 className="text-xl md:text-2xl font-bold text-on-background inline-block relative pb-1">
                Billing Address
                <span className="absolute bottom-0 left-0 w-full h-[2.5px] bg-primary rounded-full"></span>
              </h2>
            </div>

            <div className="space-y-4">
              {/* Option 1: Existing Address */}
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer text-base md:text-lg font-medium text-on-background select-none">
                  <input
                    type="radio"
                    name="addressOption"
                    checked={!isCustomAddress}
                    onChange={() => setIsCustomAddress(false)}
                    className="w-4 h-4 text-primary focus:ring-primary border-neutral-400 accent-primary cursor-pointer"
                  />
                  <span>I want to use an existing address</span>
                </label>

                {!isCustomAddress && (
                  <div className="pl-7 pt-1">
                    <select
                      value={selectedExistingAddress}
                      onChange={(e) => setSelectedExistingAddress(e.target.value)}
                      className="w-full max-w-xl bg-white dark:bg-surface-container-low border border-neutral-300 dark:border-outline-variant rounded-lg px-4 py-2.5 text-on-surface text-sm font-medium focus:outline-none focus:border-primary shadow-sm"
                    >
                      <option value="default">
                        {user?.name || `${form.firstName} ${form.lastName}`}, Sri Lanka
                      </option>
                    </select>
                  </div>
                )}
              </div>

              {/* Option 2: New Address */}
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer text-base md:text-lg font-medium text-on-background select-none">
                  <input
                    type="radio"
                    name="addressOption"
                    checked={isCustomAddress}
                    onChange={() => setIsCustomAddress(true)}
                    className="w-4 h-4 text-primary focus:ring-primary border-neutral-400 accent-primary cursor-pointer"
                  />
                  <span>I want to use a new address</span>
                </label>

                {isCustomAddress && (
                  <div className="pl-7 pt-2 space-y-5">
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="font-label-md text-label-md text-on-surface-variant block mb-1">Country *</label>
                        <input
                          type="text"
                          name="address"
                          value={form.address || 'Sri Lanka'}
                          onChange={handleChange}
                          required
                          placeholder="Sri Lanka"
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
              </div>

              {/* Checkbox: My delivery and billing addresses are the same. */}
              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer text-base md:text-lg font-medium text-on-background select-none">
                  <input
                    type="checkbox"
                    checked={sameAsDelivery}
                    onChange={(e) => setSameAsDelivery(e.target.checked)}
                    className="w-4 h-4 rounded text-primary focus:ring-primary border-neutral-400 accent-primary cursor-pointer"
                  />
                  <span>My delivery and billing addresses are the same.</span>
                </label>
              </div>
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
                <span>Digital Delivery</span>
                <span className="text-emerald-600 font-bold">FREE (Instant)</span>
              </div>
            </div>

            <div className="border-t border-outline-variant/40 pt-4 flex justify-between items-center">
              <span className="font-title-sm text-title-sm text-on-background">Total</span>
              <span className="font-title-sm text-title-sm text-primary font-bold">Rs. {finalTotal.toLocaleString()}</span>
            </div>

            {/* Terms & Conditions Checkbox */}
            <div className="pt-2">
              <label className="flex items-center gap-3 cursor-pointer text-sm font-medium text-on-background select-none">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => {
                    setAgreeTerms(e.target.checked);
                    if (e.target.checked) setTermsError(false);
                  }}
                  className="w-4 h-4 rounded text-primary focus:ring-primary border-neutral-400 accent-primary cursor-pointer"
                />
                <span>
                  I have read and agree to the{' '}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowTermsModal(true);
                    }}
                    className="underline text-on-background font-bold hover:text-primary transition-colors cursor-pointer"
                  >
                    Terms & Conditions
                  </button>
                </span>
              </label>

              {termsError && (
                <p className="text-red-600 font-bold text-sm mt-1.5 animate-pulse">
                  Warning: You must agree to the Terms & Conditions!
                </p>
              )}
            </div>

            {/* Dynamic CTA button based on selected payment method */}
            <button
              type="button"
              onClick={handleButtonClick}
              disabled={isPlacingOrder}
              className="w-full bg-primary-container text-on-background font-label-md text-label-md py-4 px-8 rounded-full hover:bg-primary hover:text-white transition-all duration-300 shadow-ambient flex items-center justify-center gap-2 cursor-pointer font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-sm">
                {paymentMethod === 'card' ? 'credit_card' : 'upload_file'}
              </span>
              {paymentMethod === 'card'
                ? `Proceed to Card Payment (Rs. ${finalTotal.toLocaleString()})`
                : `Proceed to Upload Bank Slip (Rs. ${finalTotal.toLocaleString()})`}
            </button>

            <p className="text-center font-body-md text-body-md text-on-surface-variant text-xs pt-1">
              By placing your order, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </form>

      {/* Terms & Conditions Popup Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div
            className="fixed inset-0"
            onClick={() => setShowTermsModal(false)}
          />
          <div className="relative bg-surface-container-lowest w-full max-w-3xl max-h-[85vh] rounded-2xl shadow-2xl border border-outline-variant/30 flex flex-col overflow-hidden z-10 animate-slide-in">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-low/50">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">gavel</span>
                <h3 className="text-lg font-bold text-on-background">Terms & Conditions</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowTermsModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-background hover:bg-surface-container transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Body - Scrollable Terms content */}
            <div className="p-6 overflow-y-auto space-y-5 text-sm leading-relaxed text-on-surface">
              <section className="space-y-1.5">
                <h4 className="font-bold text-on-background text-base">Changes to Terms</h4>
                <p className="text-on-surface-variant">
                  DSoft Pack reserves the right to modify these Terms at any time without notice. Any changes will be posted on the Site, and your continued use of the Site constitutes acceptance of the revised Terms. We recommend periodically reviewing these Terms for updates.
                </p>
              </section>

              <section className="space-y-1.5">
                <h4 className="font-bold text-on-background text-base">Product Activation</h4>
                <p className="text-on-surface-variant">
                  All product keys are recommended to be activated within the warranty period, as much as possible. Failure to do so will result in expiration, with no replacement or refund provided.
                </p>
              </section>

              <section className="space-y-1.5">
                <h4 className="font-bold text-on-background text-base">General Use Terms</h4>
                <p className="text-on-surface-variant">
                  DSoft Pack provides content and services through the Site, including materials, trademarks, and services ("Materials"). You are granted a limited, non-transferable license to use the Materials for personal or internal business use only. Modification, reproduction, or exploitation of the Materials is prohibited.
                </p>
                <p className="text-on-surface-variant pt-1">
                  You agree not to circumvent security measures, misuse the Site, or engage in prohibited conduct, including unauthorized access, harassment, or disruption of the Site's operations.
                </p>
              </section>

              <section className="space-y-1.5">
                <h4 className="font-bold text-on-background text-base">Password Restricted Areas</h4>
                <p className="text-on-surface-variant">
                  Certain areas of the Site are password-restricted. If you are an authorized user, you are responsible for maintaining the confidentiality of your account and notifying DSoft Pack of any security breaches.
                </p>
              </section>

              <section className="space-y-1.5">
                <h4 className="font-bold text-on-background text-base">Pricing and Payments</h4>
                <p className="text-on-surface-variant">
                  Fees and charges for services are based on DSoft Pack's billing terms. Fraudulent payments may result in suspension or termination of access.
                </p>
              </section>

              <section className="space-y-1.5">
                <h4 className="font-bold text-on-background text-base">Privacy Policy</h4>
                <p className="text-on-surface-variant">
                  Your use of the Site is governed by our Privacy Policy, available on the Privacy Policy Page.
                </p>
              </section>

              <section className="space-y-1.5">
                <h4 className="font-bold text-on-background text-base">Third-Party Content</h4>
                <p className="text-on-surface-variant">
                  Third-party content provided on the Site is for personal or internal business use only. You agree not to modify or reproduce third-party content without authorization.
                </p>
              </section>

              <section className="space-y-1.5">
                <h4 className="font-bold text-on-background text-base">Submissions</h4>
                <p className="text-on-surface-variant">
                  By submitting data or communications on the Site, you grant DSoft Pack a perpetual, royalty-free license to use, reproduce, and modify such submissions.
                </p>
              </section>

              <section className="space-y-1.5">
                <h4 className="font-bold text-on-background text-base">Links to Third-Party Sites</h4>
                <p className="text-on-surface-variant">
                  The Site may contain links to third-party sites. DSoft Pack is not responsible for the content of these sites.
                </p>
              </section>

              <section className="space-y-1.5">
                <h4 className="font-bold text-on-background text-base">Unauthorized Activities</h4>
                <p className="text-on-surface-variant">
                  Unauthorized use of Materials may violate laws and regulations. You agree to indemnify DSoft Pack for any claims arising from your use of the Site.
                </p>
              </section>

              <section className="space-y-1.5">
                <h4 className="font-bold text-on-background text-base">Trademarks and Copyright</h4>
                <p className="text-on-surface-variant">
                  All trademarks and content on the Site are the property of their respective owners. Reproduction or distribution of copyrighted material is prohibited without consent.
                </p>
              </section>

              <section className="space-y-1.5">
                <h4 className="font-bold text-on-background text-base">Disclaimer of Warranties</h4>
                <p className="text-on-surface-variant">
                  Your use of the Site is at your own risk. DSoft Pack does not warrant the accuracy or timeliness of materials or third-party content.
                </p>
              </section>

              <section className="space-y-1.5">
                <h4 className="font-bold text-on-background text-base">Limitation of Liability</h4>
                <p className="text-on-surface-variant">
                  DSoft Pack's liability for damages is limited to fifty dollars ($50). DSoft Pack is not liable for indirect, incidental, or consequential damages.
                </p>
              </section>

              <section className="space-y-1.5">
                <h4 className="font-bold text-on-background text-base">Refunds and Cancellations</h4>
                <p className="text-on-surface-variant">
                  For information on refunds and cancellations, refer to our Refund Policy.
                </p>
              </section>

              <section className="space-y-1.5">
                <h4 className="font-bold text-on-background text-base">General</h4>
                <p className="text-on-surface-variant">
                  DSoft Pack may terminate access to the Site for violations of these Terms. Disputes will be governed by Maryland law. These Terms constitute the entire agreement between you and DSoft Pack.
                </p>
              </section>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-outline-variant/30 flex justify-end gap-3 bg-surface-container-low/30">
              <button
                type="button"
                onClick={() => {
                  setAgreeTerms(true);
                  setTermsError(false);
                  setShowTermsModal(false);
                }}
                className="px-6 py-2.5 bg-primary text-white text-xs font-bold rounded-full hover:bg-primary/90 transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                I Agree & Accept
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
