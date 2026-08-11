import { useState } from 'react';

const ORDER_STATUSES = [
  { label: 'Order Placed', icon: 'receipt_long', done: true },
  { label: 'Confirmed', icon: 'verified', done: true },
  { label: 'Processing', icon: 'inventory_2', done: true },
  { label: 'Out for Delivery', icon: 'local_shipping', done: false },
  { label: 'Delivered', icon: 'home', done: false },
];

export default function TrackOrder() {
  const [orderId, setOrderId] = useState('');
  const [tracking, setTracking] = useState(false);

  function handleSearch(e) {
    e.preventDefault();
    if (orderId.trim()) setTracking(true);
  }

  return (
    <main className="flex-grow w-full max-w-[1200px] mx-auto px-5 md:px-16 py-16">
      <h1 className="font-headline-md-mobile md:font-headline-md text-headline-md-mobile md:text-headline-md text-primary mb-8">
        Track Your Order
      </h1>

      {/* Search Form */}
      <div className="bg-surface-container-lowest rounded-2xl p-8 shadow-ambient mb-8 max-w-xl">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="flex-grow">
            <label className="font-label-md text-label-md text-on-surface mb-1 block">Order Number</label>
            <input
              type="text"
              value={orderId}
              onChange={(e) => { setOrderId(e.target.value); setTracking(false); }}
              placeholder="e.g. MC-2024-001"
              className="custom-input w-full py-3 font-body-md text-body-md text-on-surface placeholder:text-outline bg-transparent"
            />
          </div>
          <div className="self-end">
            <button
              type="submit"
              className="py-3 px-6 bg-primary-container text-on-background font-label-md text-label-md rounded-lg hover:bg-primary hover:text-white transition-all duration-300"
            >
              Track
            </button>
          </div>
        </form>
      </div>

      {/* Tracking Result */}
      {tracking && (
        <div className="bg-surface-container-lowest rounded-2xl p-8 shadow-ambient">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="font-title-sm text-title-sm text-on-surface">Order #{orderId}</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">Estimated delivery: 3–5 business days</p>
            </div>
            <span className="bg-secondary-container text-on-secondary-container font-label-md text-label-md px-3 py-1 rounded-full">
              Processing
            </span>
          </div>

          {/* Progress Steps */}
          <div className="relative">
            <div className="absolute top-5 left-5 right-5 h-0.5 bg-outline-variant" />
            <div className="relative flex justify-between">
              {ORDER_STATUSES.map((step, i) => (
                <div key={i} className="flex flex-col items-center gap-3 z-10">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    step.done ? 'bg-primary text-white' : 'bg-surface-container border-2 border-outline-variant text-on-surface-variant'
                  }`}>
                    <span className="material-symbols-outlined text-[20px]">{step.icon}</span>
                  </div>
                  <p className={`font-label-sm text-label-sm text-center max-w-[80px] ${step.done ? 'text-primary' : 'text-on-surface-variant'}`}>
                    {step.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Order Details */}
          <div className="mt-10 pt-8 border-t border-outline-variant">
            <h3 className="font-label-md text-label-md text-primary mb-4 font-bold">Items in This Order</h3>
            <div className="flex items-center gap-4">
              <img src="/14_blush_silk_ribbon_bow.jpg" alt="Blush Ribbon Bow" className="w-16 h-16 rounded-lg object-cover" />
              <div>
                <p className="font-title-sm text-title-sm text-on-surface">Blush Ribbon Bow</p>
                <p className="font-body-md text-body-md text-on-surface-variant">Qty: 1 · $12.00</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
