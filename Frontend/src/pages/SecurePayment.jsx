import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function SecurePayment() {
  const [form, setForm] = useState({ cardNumber: '', expiry: '', cvv: '', name: '' });
  const { clearCart } = useCart();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    setProcessing(true);
    setTimeout(() => {
      clearCart();
      navigate('/checkout/success');
    }, 2000);
  }

  return (
    <main className="flex-grow flex items-center justify-center px-5 py-16">
      <div className="w-full max-w-md">
        <div className="bg-surface-container-lowest rounded-2xl p-8 shadow-ambient">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-primary">lock</span>
            <h1 className="font-title-sm text-title-sm text-primary">Secure Payment</h1>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant mb-6">
            Your payment information is encrypted and secure.
          </p>
          <form onSubmit={handleSubmit} className="space-y-5">
            {[
              { name: 'name', label: 'Cardholder Name', placeholder: 'Name on card' },
              { name: 'cardNumber', label: 'Card Number', placeholder: '1234 5678 9012 3456' },
              { name: 'expiry', label: 'Expiry Date', placeholder: 'MM / YY' },
              { name: 'cvv', label: 'CVV', placeholder: '•••' },
            ].map(({ name, label, placeholder }) => (
              <div key={name}>
                <label className="font-label-md text-label-md text-on-surface mb-1 block">{label}</label>
                <input
                  name={name} value={form[name]} onChange={handleChange}
                  placeholder={placeholder} required
                  className="custom-input w-full py-3 font-body-md text-body-md text-on-surface placeholder:text-outline bg-transparent"
                />
              </div>
            ))}
            <button
              type="submit"
              disabled={processing}
              className="w-full py-4 px-8 bg-primary text-white font-label-md text-label-md rounded-full hover:opacity-90 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {processing ? 'Processing...' : (
                <>
                  <span className="material-symbols-outlined text-[18px]">payment</span>
                  Pay Now
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
