import { Link } from 'react-router-dom';

export default function OrderConfirmed() {
  const orderNumber = `MC-${Date.now().toString().slice(-6)}`;
  return (
    <main className="flex-grow flex items-center justify-center px-5 py-16">
      <div className="w-full max-w-lg text-center">
        <div className="w-24 h-24 rounded-full bg-primary-container flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-primary text-5xl">check_circle</span>
        </div>
        <h1 className="font-display-lg-mobile text-display-lg-mobile text-primary mb-3">Order Confirmed!</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant mb-2">
          Thank you for shopping with Malmalee Creations.
        </p>
        <p className="font-label-md text-label-md text-on-surface-variant mb-8">
          Order <span className="text-primary font-bold">#{orderNumber}</span> · Confirmation sent to your email.
        </p>
        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient mb-8 text-left">
          <div className="flex items-center gap-4">
            <img src="/14_blush_silk_ribbon_bow.jpg" alt="Order item" className="w-16 h-16 rounded-lg object-cover" />
            <div>
              <p className="font-title-sm text-title-sm text-on-surface">Blush Ribbon Bow</p>
              <p className="font-body-md text-body-md text-on-surface-variant">Qty: 1 · $12.00</p>
            </div>
          </div>
          <div className="border-t border-outline-variant mt-4 pt-4 flex justify-between font-title-sm text-title-sm text-on-surface">
            <span>Total Paid</span><span>$17.00</span>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/account/track" className="bg-primary-container text-on-background font-label-md text-label-md py-3 px-8 rounded-full hover:bg-primary hover:text-white transition-all duration-300 flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[18px]">local_shipping</span> Track Order
          </Link>
          <Link to="/shop" className="border border-primary text-primary font-label-md text-label-md py-3 px-8 rounded-full hover:bg-primary hover:text-white transition-all duration-300 flex items-center justify-center gap-2">
            Continue Shopping
          </Link>
        </div>
      </div>
    </main>
  );
}
