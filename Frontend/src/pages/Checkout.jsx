import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import {
  SRI_LANKA_PROVINCES,
  SRI_LANKA_CITIES_BY_PROVINCE,
  ALL_SRI_LANKA_CITIES,
} from '../data/sriLankaLocationData';

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: 'Amara Perera',
    email: 'amara@malmalee.lk',
    phone: '+94 77 123 4567',
    address: '42 Flower Lane',
    city: 'Colombo 03',
    district: 'Western Province',
    postalCode: '00300',
    deliveryDate: '',
  });

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
    setTimeout(() => navigate('/orders'), 2000);
  }

  const shippingCost = totalPrice > 50 ? 0 : 5.00;
  const finalTotal = totalPrice + shippingCost;

  if (ordered) {
    return (
      <main className="flex-grow flex items-center justify-center py-24 px-5">
        <div className="text-center bg-surface-container-lowest p-10 rounded-2xl shadow-ambient max-w-md w-full border border-outline-variant/30">
          <span className="material-symbols-outlined text-6xl text-primary mb-4 block">check_circle</span>
          <h1 className="font-headline-md text-headline-md text-on-surface mb-2">Order Confirmed!</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mb-6">
            Thank you for your order, {form.name}. We're preparing your handcrafted items with magic!
          </p>
          <p className="font-label-sm text-label-sm text-outline">Redirecting to Order History...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-grow w-full max-w-[1200px] mx-auto px-5 md:px-16 py-16">
      <h1 className="font-headline-md-mobile md:font-headline-md text-headline-md-mobile md:text-headline-md text-on-background mb-8">
        Checkout
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-12">
        {/* Left — Form Sections */}
        <div className="flex-grow space-y-8">
          {/* Customer Info */}
          <section className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient">
            <h2 className="font-title-sm text-title-sm text-primary mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined">person</span> Contact Information
            </h2>
            <div className="space-y-4">
              {[
                { name: 'name', label: 'Full Name', type: 'text' },
                { name: 'email', label: 'Email Address', type: 'email' },
                { name: 'phone', label: 'Phone Number', type: 'tel' },
              ].map(({ name, label, type }) => (
                <div key={name}>
                  <label className="font-label-md text-label-md text-on-surface mb-1 block">{label}</label>
                  <input
                    type={type}
                    name={name}
                    value={form[name]}
                    onChange={handleChange}
                    required
                    className="custom-input w-full py-3 font-body-md text-body-md text-on-surface bg-transparent"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Delivery Address (Sri Lanka Province & City Dropdowns) */}
          <section className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient">
            <h2 className="font-title-sm text-title-sm text-primary mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined">local_shipping</span> Delivery Address
            </h2>
            <div className="space-y-4">
              <div>
                <label className="font-label-md text-label-md text-on-surface mb-1 block">Street Address</label>
                <input
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  required
                  className="custom-input w-full py-3 font-body-md text-body-md text-on-surface bg-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Province Dropdown */}
                <div>
                  <label className="font-label-md text-label-md text-on-surface mb-1 block">State / Province</label>
                  <div className="relative">
                    <select
                      name="district"
                      value={form.district}
                      onChange={handleDistrictChange}
                      required
                      className="custom-input w-full py-3 pr-8 font-body-md text-body-md text-on-surface bg-transparent appearance-none cursor-pointer"
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
                  <label className="font-label-md text-label-md text-on-surface mb-1 block">City</label>
                  <div className="relative">
                    <select
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      required
                      className="custom-input w-full py-3 pr-8 font-body-md text-body-md text-on-surface bg-transparent appearance-none cursor-pointer"
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

              <div>
                <label className="font-label-md text-label-md text-on-surface mb-1 block">Postal Code</label>
                <input
                  type="text"
                  name="postalCode"
                  value={form.postalCode}
                  onChange={handleChange}
                  required
                  className="custom-input w-full py-3 font-body-md text-body-md text-on-surface bg-transparent"
                />
              </div>

              <div>
                <label className="font-label-md text-label-md text-on-surface mb-1 block">Preferred Delivery Date</label>
                <input
                  type="date"
                  name="deliveryDate"
                  value={form.deliveryDate}
                  onChange={handleChange}
                  className="custom-input w-full py-3 font-body-md text-body-md text-on-surface bg-transparent"
                />
              </div>
            </div>
          </section>

          {/* Payment Method */}
          <section className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient">
            <h2 className="font-title-sm text-title-sm text-primary mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined">payment</span> Payment Method
            </h2>
            <div className="space-y-3">
              {[
                { value: 'card', label: 'Credit / Debit Card', icon: 'credit_card' },
                { value: 'cod', label: 'Cash on Delivery (COD)', icon: 'local_atm' },
              ].map(({ value, label, icon }) => (
                <label
                  key={value}
                  className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                    paymentMethod === value
                      ? 'border-primary bg-primary-container/20'
                      : 'border-outline-variant hover:border-primary/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={value}
                    checked={paymentMethod === value}
                    onChange={() => setPaymentMethod(value)}
                    className="accent-primary"
                  />
                  <span className="material-symbols-outlined text-primary">{icon}</span>
                  <span className="font-label-md text-label-md text-on-surface">{label}</span>
                </label>
              ))}
            </div>
          </section>
        </div>

        {/* Right — Order Summary */}
        <div className="w-full lg:w-96 flex-shrink-0">
          <div className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient sticky top-8">
            <h2 className="font-title-sm text-title-sm text-primary mb-6">Order Summary</h2>
            <div className="space-y-3 mb-4">
              {items.map((item, i) => (
                <div key={i} className="flex justify-between items-center text-sm font-body-md">
                  <span className="text-on-surface truncate max-w-[200px]">
                    {item.name} <span className="text-outline">x{item.quantity}</span>
                  </span>
                  <span className="font-bold text-on-surface">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-outline-variant pt-4 space-y-2 mb-6 font-body-md">
              <div className="flex justify-between text-on-surface-variant">
                <span>Subtotal</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-on-surface-variant">
                <span>Shipping</span>
                <span>{shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}</span>
              </div>
              <div className="border-t border-outline-variant pt-2 flex justify-between font-title-sm text-title-sm text-primary">
                <span>Total</span>
                <span>${finalTotal.toFixed(2)}</span>
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-4 bg-primary-container text-on-background hover:bg-primary hover:text-white rounded-full font-label-md text-label-md transition-all duration-300 shadow-ambient"
            >
              Place Order (${finalTotal.toFixed(2)})
            </button>
          </div>
        </div>
      </form>
    </main>
  );
}
