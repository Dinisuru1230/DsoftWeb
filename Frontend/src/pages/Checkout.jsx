import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function Checkout() {
  const { cartItems, cartSubtotal, clearCart } = useCart();
  const navigate = useNavigate();
  const DELIVERY_FEE = 5.00;
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    address: '', city: '', district: '', postalCode: '',
    deliveryDate: '',
  });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (paymentMethod === 'cod') {
      clearCart();
      navigate('/checkout/success');
    } else {
      navigate('/checkout/payment');
    }
  }

  return (
    <main className="flex-grow w-full max-w-[1200px] mx-auto px-5 md:px-16 py-16">
      <h1 className="font-headline-md-mobile md:font-headline-md text-headline-md-mobile md:text-headline-md text-primary mb-8">
        Checkout
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8">
        {/* Left — Form */}
        <div className="flex-grow space-y-8">
          {/* Contact Info */}
          <section className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient">
            <h2 className="font-title-sm text-title-sm text-primary mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined">person</span> Contact Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { name: 'firstName', label: 'First Name', type: 'text' },
                { name: 'lastName', label: 'Last Name', type: 'text' },
                { name: 'email', label: 'Email Address', type: 'email', full: true },
                { name: 'phone', label: 'Phone Number', type: 'tel' },
              ].map(({ name, label, type, full }) => (
                <div key={name} className={full ? 'sm:col-span-2' : ''}>
                  <label className="font-label-md text-label-md text-on-surface mb-1 block">{label}</label>
                  <input
                    type={type}
                    name={name}
                    value={form[name]}
                    onChange={handleChange}
                    required
                    className="custom-input w-full py-3 font-body-md text-body-md text-on-surface placeholder:text-outline bg-transparent"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Delivery Address */}
          <section className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient">
            <h2 className="font-title-sm text-title-sm text-primary mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined">local_shipping</span> Delivery Address
            </h2>
            <div className="space-y-4">
              {[
                { name: 'address', label: 'Street Address' },
                { name: 'city', label: 'City' },
                { name: 'district', label: 'District / Province' },
                { name: 'postalCode', label: 'Postal Code' },
              ].map(({ name, label }) => (
                <div key={name}>
                  <label className="font-label-md text-label-md text-on-surface mb-1 block">{label}</label>
                  <input
                    type="text"
                    name={name}
                    value={form[name]}
                    onChange={handleChange}
                    required
                    className="custom-input w-full py-3 font-body-md text-body-md text-on-surface bg-transparent"
                  />
                </div>
              ))}
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
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                  <div className="flex-grow">
                    <p className="font-label-md text-label-md text-on-surface">{item.name}</p>
                    <p className="font-label-sm text-label-sm text-on-surface-variant">x{item.quantity}</p>
                  </div>
                  <span className="font-body-md text-body-md text-on-surface">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-outline-variant pt-4 space-y-2 mb-6">
              <div className="flex justify-between font-body-md text-body-md text-on-surface-variant">
                <span>Subtotal</span><span>${cartSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-body-md text-body-md text-on-surface-variant">
                <span>Delivery Fee</span><span>${DELIVERY_FEE.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-title-sm text-title-sm text-on-surface pt-2 border-t border-outline-variant">
                <span>Total</span><span>${(cartSubtotal + DELIVERY_FEE).toFixed(2)}</span>
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-4 px-8 bg-primary-container text-on-background font-label-md text-label-md rounded-full hover:bg-primary hover:text-white transition-all duration-300 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">lock</span>
              {paymentMethod === 'cod' ? 'Place Order (COD)' : 'Proceed to Payment'}
            </button>
          </div>
        </div>
      </form>
    </main>
  );
}
