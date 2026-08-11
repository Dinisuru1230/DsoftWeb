import { useState } from 'react';
import AccountSidebar from '../components/AccountSidebar';

const ORDER_STATUSES = [
  { label: 'Order Placed', icon: 'receipt_long', done: true },
  { label: 'Confirmed', icon: 'verified', done: true },
  { label: 'Processing', icon: 'inventory_2', done: true },
  { label: 'Out for Delivery', icon: 'local_shipping', done: false },
  { label: 'Delivered', icon: 'home', done: false },
];

export default function TrackOrder() {
  const [orderId, setOrderId] = useState('MC-8492');
  const [tracking, setTracking] = useState(true);

  function handleSearch(e) {
    e.preventDefault();
    if (orderId.trim()) setTracking(true);
  }

  return (
    <main className="flex-grow flex flex-col md:flex-row w-full max-w-[1400px] mx-auto px-4 sm:px-8 md:px-12 py-12 gap-8">
      {/* Unified Account Sidebar */}
      <AccountSidebar />

      {/* Main Content Area */}
      <section className="flex-grow">
        <h1 className="font-headline-md-mobile md:font-headline-md text-headline-md-mobile md:text-headline-md text-primary mb-6">
          Track Your Order
        </h1>

        {/* Search Form */}
        <div className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient mb-8 max-w-xl border border-outline-variant/30">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-grow">
              <label className="font-label-md text-label-md text-on-surface mb-1 block">Order Number</label>
              <input
                type="text"
                value={orderId}
                onChange={(e) => { setOrderId(e.target.value); setTracking(false); }}
                placeholder="e.g. MC-8492"
                className="custom-input w-full py-2 font-body-md text-body-md text-on-surface placeholder:text-outline bg-transparent"
              />
            </div>
            <div className="self-end">
              <button
                type="submit"
                className="py-2.5 px-6 bg-primary-container text-on-primary-fixed font-label-md text-label-md rounded-lg hover:bg-primary hover:text-white transition-all duration-300 shadow-ambient"
              >
                Track
              </button>
            </div>
          </form>
        </div>

        {/* Tracking Result */}
        {tracking && (
          <div className="bg-surface-container-lowest rounded-xl p-6 md:p-8 shadow-ambient border border-outline-variant/30 space-y-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
              <div>
                <h2 className="font-title-sm text-title-sm text-on-surface">Order #{orderId}</h2>
                <p className="font-body-md text-body-md text-on-surface-variant mt-1">Estimated delivery: Oct 15 – Oct 18</p>
              </div>
              <span className="bg-secondary-container text-on-secondary-container font-label-sm text-label-sm px-4 py-1.5 rounded-full self-start">
                In Transit
              </span>
            </div>

            {/* Progress Steps */}
            <div className="relative py-4">
              <div className="absolute top-9 left-8 right-8 h-1 bg-outline-variant/40 pointer-events-none" />
              <div className="relative flex justify-between">
                {ORDER_STATUSES.map((step, i) => (
                  <div key={i} className="flex flex-col items-center gap-3 z-10">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      step.done ? 'bg-primary text-white shadow-sm' : 'bg-surface-container border-2 border-outline-variant text-on-surface-variant'
                    }`}>
                      <span className="material-symbols-outlined text-[20px]">{step.icon}</span>
                    </div>
                    <p className={`font-label-sm text-label-sm text-center max-w-[90px] ${step.done ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>
                      {step.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Items */}
            <div className="pt-6 border-t border-outline-variant/30">
              <h3 className="font-label-md text-label-md text-primary mb-4 font-bold">Items in This Order</h3>
              <div className="flex items-center gap-4 p-4 bg-surface-container-low rounded-lg">
                <img src="/14_blush_silk_ribbon_bow.jpg" alt="Blush Ribbon Bow" className="w-16 h-16 rounded-lg object-cover" />
                <div>
                  <p className="font-title-sm text-title-sm text-on-surface">Blush Silk Ribbon Bow</p>
                  <p className="font-body-md text-body-md text-on-surface-variant">Qty: 2 · $24.00</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
