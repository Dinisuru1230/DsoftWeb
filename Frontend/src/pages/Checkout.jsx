import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import {
  SRI_LANKA_PROVINCES,
  SRI_LANKA_CITIES_BY_PROVINCE,
  ALL_SRI_LANKA_CITIES,
} from '../data/sriLankaLocationData';

const DEFAULT_CHECKOUT_ITEMS = [
  { id: 'blush-ribbon-bow', name: 'Blush Silk Ribbon Bow', price: 12.00, quantity: 1, image: '/14_blush_silk_ribbon_bow.jpg' },
  { id: 'pearl-scrunchie', name: 'Pearl Satin Scrunchie', price: 15.00, quantity: 2, image: '/18_silk_scrunchie.jpg' },
];

export default function Checkout() {
  const { cartItems, cartSubtotal, clearCart } = useCart();
  const navigate = useNavigate();

  const items = cartItems && cartItems.length > 0 ? cartItems : DEFAULT_CHECKOUT_ITEMS;
  const totalPrice = cartSubtotal && cartSubtotal > 0 ? cartSubtotal : 42.00;

  const [form, setForm] = useState({
    firstName: 'Amara',
    lastName: 'Perera',
    email: 'amara@malmalee.lk',
    phone: '+94 77 123 4567',
    address: '42 Flower Lane, Suite 4',
    city: 'Colombo 03',
    district: 'Western Province',
    postalCode: '00300',
    cardNumber: '4532 8901 2345 6789',
    cardExp: '08/28',
    cardCvc: '888',
  });

  const [shippingMethod, setShippingMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [ordered, setOrdered] = useState(false);

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

  function handleSubmit(e) {
    e.preventDefault();
    setOrdered(true);
    clearCart();
    setTimeout(() => navigate('/account'), 2500);
  }

  const shippingCost = shippingMethod === 'express' ? 15.00 : (totalPrice > 50 ? 0 : 5.00);
  const finalTotal = totalPrice + shippingCost;

  if (ordered) {
    return (
      <main className="flex-grow flex items-center justify-center py-24 px-5">
        <div className="text-center bg-surface-container-lowest p-10 rounded-2xl shadow-ambient max-w-md w-full border border-outline-variant/30">
          <span className="material-symbols-outlined text-6xl text-primary mb-4 block">check_circle</span>
          <h1 className="font-headline-md text-headline-md text-on-surface mb-2">Order Confirmed!</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mb-6">
            Thank you for your order, {form.firstName} {form.lastName}. We're preparing your handcrafted items with magic!
          </p>
          <p className="font-label-sm text-label-sm text-outline">Redirecting to My Account...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-grow w-full max-w-[1400px] mx-auto px-5 md:px-16 py-12">
      {/* Header matching Stitch Checkout design */}
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
          {/* Delivery Details */}
          <section className="bg-surface-container-lowest rounded-xl p-6 md:p-8 shadow-ambient border border-outline-variant/30 space-y-6">
            <h2 className="font-headline-md-mobile md:font-headline-md text-headline-md-mobile md:text-headline-md text-on-background border-b border-outline-variant/30 pb-3">
              Delivery Details
            </h2>

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
          </section>

          {/* Shipping Method */}
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
                  {totalPrice > 50 ? 'FREE' : '$5.00'}
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
                <span className="font-label-md text-label-md text-primary font-bold">$15.00</span>
              </label>
            </div>
          </section>

          {/* Payment Method Section */}
          <section className="bg-surface-container-lowest rounded-xl p-6 md:p-8 shadow-ambient border border-outline-variant/30 space-y-4">
            <h2 className="font-headline-md-mobile md:font-headline-md text-headline-md-mobile md:text-headline-md text-on-background border-b border-outline-variant/30 pb-3">
              Payment
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
                  <span className="block font-body-md text-body-md text-on-surface-variant text-sm mt-0.5">Secure online card payment</span>
                </span>
                <span className="material-symbols-outlined text-primary">credit_card</span>
              </label>

              {/* Credit Card Details Sub-form */}
              {paymentMethod === 'card' && (
                <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/30 space-y-4 ml-8">
                  <div>
                    <label className="font-label-md text-label-md text-on-surface-variant block mb-1">Card Number</label>
                    <input
                      type="text"
                      name="cardNumber"
                      value={form.cardNumber}
                      onChange={handleChange}
                      placeholder="0000 0000 0000 0000"
                      className="w-full bg-surface-bright border border-outline-variant rounded-md px-3 py-2 font-body-md text-body-md text-on-surface focus:border-primary outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="font-label-md text-label-md text-on-surface-variant block mb-1">Expiry Date</label>
                      <input
                        type="text"
                        name="cardExp"
                        value={form.cardExp}
                        onChange={handleChange}
                        placeholder="MM/YY"
                        className="w-full bg-surface-bright border border-outline-variant rounded-md px-3 py-2 font-body-md text-body-md text-on-surface focus:border-primary outline-none"
                      />
                    </div>
                    <div>
                      <label className="font-label-md text-label-md text-on-surface-variant block mb-1">CVC</label>
                      <input
                        type="text"
                        name="cardCvc"
                        value={form.cardCvc}
                        onChange={handleChange}
                        placeholder="123"
                        className="w-full bg-surface-bright border border-outline-variant rounded-md px-3 py-2 font-body-md text-body-md text-on-surface focus:border-primary outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

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
                  <span className="block font-body-md text-body-md text-on-surface-variant text-sm mt-0.5">Pay when you receive your order</span>
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
                    ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>

            {/* Totals Breakdown */}
            <div className="border-t border-outline-variant/40 pt-4 space-y-2 font-body-md text-body-md">
              <div className="flex justify-between text-on-surface-variant">
                <span>Subtotal</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-on-surface-variant">
                <span>Shipping</span>
                <span>{shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}</span>
              </div>
            </div>

            <div className="border-t border-outline-variant/40 pt-4 flex justify-between items-center">
              <span className="font-title-sm text-title-sm text-on-background">Total</span>
              <span className="font-title-sm text-title-sm text-primary font-bold">${finalTotal.toFixed(2)}</span>
            </div>

            <button
              type="submit"
              className="w-full bg-primary-container text-on-background font-label-md text-label-md py-4 px-8 rounded-full hover:bg-primary hover:text-white transition-all duration-300 shadow-ambient flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">lock</span>
              Place Order Securely (${finalTotal.toFixed(2)})
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
