import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const API_BASE = 'http://localhost:5050/api';

export default function SecurePayment() {
  const [form, setForm] = useState({ name: 'Jane Doe', cardNumber: '4532 8492 1039 4829', expiry: '12/28', cvc: '849' });
  const { cartSubtotal, cartItems, clearCart } = useCart();
  const { token } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  // Dynamic Total Amount calculation
  const numericTotal = location.state?.total
    ? Number(location.state.total)
    : cartSubtotal > 0
    ? (cartSubtotal + 450)
    : 4050;

  const totalAmount = Math.round(numericTotal).toLocaleString();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setProcessing(true);
    setError('');
    const toastId = toast.loading('Processing secure SSL card payment...');

    try {
      const orderPayload = {
        customerName: location.state?.customerDetails?.customerName || form.name || 'Customer',
        email: location.state?.customerDetails?.email || 'customer@example.com',
        phone: location.state?.customerDetails?.phone || '',
        address: location.state?.customerDetails?.address || '42 Flower Lane, Colombo 03, Sri Lanka',
        totalAmount: numericTotal,
        shippingCost: location.state?.shippingCost || 0,
        paymentMethod: 'CARD',
        items: (location.state?.items || cartItems || []).map((i) => ({
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
      if (!res.ok) throw new Error(data.error || 'Payment processing failed.');

      toast.success('Payment successful! Order confirmed.', { id: toastId });
      clearCart();
      navigate('/checkout/success', {
        state: {
          order: data.order,
          paymentMethod: 'card',
          refNumber: data.order?.orderNumber,
          totalAmount: numericTotal,
        },
      });
    } catch (err) {
      const msg = err.message || 'Payment processing error. Please try again.';
      setError(msg);
      toast.error(msg, { id: toastId });
      setProcessing(false);
    }
  }

  return (
    <main className="flex-grow flex items-center justify-center px-4 sm:px-8 py-12 md:py-16 bg-background">
      <div className="bg-surface-container-lowest max-w-md w-full rounded-2xl shadow-ambient p-6 sm:p-10 flex flex-col gap-6 border border-outline-variant/30 relative overflow-hidden">
        {/* Subtle Top Glow */}
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-primary-container/30 to-transparent pointer-events-none rounded-t-2xl" />

        {/* Header / Trust Indicators */}
        <header className="flex flex-col items-center text-center gap-2 relative z-10">
          <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile text-primary tracking-tight">
            DSoft Pack
          </h1>
          <div className="flex items-center gap-2 text-secondary bg-secondary-container/40 px-4 py-1 rounded-full font-label-sm text-label-sm">
            <span className="material-symbols-outlined text-[16px]">lock</span>
            Secure SSL Payment
          </div>
        </header>

        {/* Order Summary Bar with Dynamic Amount */}
        <section className="border border-outline-variant/30 rounded-xl p-4 bg-surface-container-low flex justify-between items-center relative z-10">
          <div className="flex flex-col gap-0.5">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Order Total</span>
            <span className="font-headline-md-mobile text-headline-md-mobile text-on-background font-bold">Rs. {totalAmount}</span>
          </div>
          <div className="w-12 h-12 bg-primary-container rounded-full flex items-center justify-center text-on-primary-container shadow-sm">
            <span className="material-symbols-outlined text-[24px]">shopping_bag</span>
          </div>
        </section>

        {/* Payment Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 relative z-10">
          {error && (
            <div className="p-3 bg-error-container text-on-error-container rounded-lg text-xs font-label-md flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">error</span>
              {error}
            </div>
          )}
          {/* Cardholder Name */}
          <div className="flex flex-col gap-1.5">
            <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="name">
              Name on Card
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder="Jane Doe"
              required
              className="w-full bg-surface-bright border-b-2 border-outline-variant rounded-t-md px-4 py-3 focus:outline-none focus:border-primary transition-colors text-on-background font-body-md placeholder:text-outline/50"
            />
          </div>

          {/* Card Number */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="cardNumber">
                Card Number
              </label>
              <div className="flex gap-1 text-primary">
                <span className="material-symbols-outlined text-[18px]">credit_card</span>
              </div>
            </div>
            <div className="relative">
              <input
                id="cardNumber"
                name="cardNumber"
                type="text"
                value={form.cardNumber}
                onChange={handleChange}
                placeholder="0000 0000 0000 0000"
                required
                className="w-full bg-surface-bright border-b-2 border-outline-variant rounded-t-md pl-11 pr-4 py-3 focus:outline-none focus:border-primary transition-colors text-on-background font-body-md placeholder:text-outline/50 tracking-widest"
              />
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary/70">
                credit_card
              </span>
            </div>
          </div>

          {/* Expiry & CVC */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <div className="h-6 flex items-center">
                <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="expiry">
                  Expiry Date
                </label>
              </div>
              <input
                id="expiry"
                name="expiry"
                type="text"
                maxLength={5}
                value={form.expiry}
                onChange={handleChange}
                placeholder="MM/YY"
                required
                className="w-full bg-surface-bright border-b-2 border-outline-variant rounded-t-md px-4 py-3 focus:outline-none focus:border-primary transition-colors text-on-background font-body-md placeholder:text-outline/50 text-center tracking-widest"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="h-6 flex items-center gap-1">
                <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="cvc">
                  CVC
                </label>
                <span className="material-symbols-outlined text-[14px] text-outline cursor-help" title="3 digits on back of card">
                  info
                </span>
              </div>
              <input
                id="cvc"
                name="cvc"
                type="text"
                maxLength={4}
                value={form.cvc}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setForm({ ...form, cvc: val });
                }}
                placeholder="849"
                required
                className="w-full bg-surface-bright border-b-2 border-outline-variant rounded-t-md px-4 py-3 focus:outline-none focus:border-primary transition-colors text-on-background font-body-md placeholder:text-outline/50 text-center tracking-widest"
              />
            </div>
          </div>

          {/* Action Area with Dynamic Soft Blush Pink Button */}
          <div className="mt-2 flex flex-col gap-3">
            <button
              type="submit"
              disabled={processing}
              className="w-full bg-primary-container text-on-background font-label-md text-label-md py-4 px-8 rounded-full shadow-ambient hover:shadow-ambient-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
            >
              {processing ? (
                <>Processing Payment...</>
              ) : (
                <>
                  Pay Rs. {totalAmount}
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </>
              )}
            </button>
            <p className="text-center font-label-sm text-label-sm text-outline flex items-center justify-center gap-1">
              <span className="material-symbols-outlined text-[14px]">shield</span>
              Payments are 256-bit SSL encrypted.
            </p>
          </div>
        </form>
      </div>
    </main>
  );
}
