import { Link, useParams } from 'react-router-dom';

const ORDER = {
  id: 'MC-2024-148',
  date: '2024-08-10',
  status: 'Pending',
  customer: { name: 'Amara Perera', email: 'amara@example.com', phone: '+94 77 123 4567' },
  address: '42 Flower Lane, Colombo 03, Sri Lanka',
  items: [
    { name: 'Blush Silk Ribbon Bow', sku: 'RB-001', qty: 2, price: 12.00, image: '/14_blush_silk_ribbon_bow.jpg' },
    { name: 'Pearl Satin Scrunchie', sku: 'SC-002', qty: 1, price: 15.00, image: '/18_silk_scrunchie.jpg' },
  ],
  subtotal: 39.00,
  delivery: 5.00,
  total: 44.00,
  payment: 'Card',
  notes: 'Please gift-wrap the ribbon bow.',
};

const STATUS_COLORS = {
  Pending: 'bg-tertiary-container text-tertiary',
  Processing: 'bg-secondary-container text-secondary',
  Confirmed: 'bg-primary-container text-primary',
  Delivered: 'bg-primary-container/50 text-on-surface-variant',
  Cancelled: 'bg-error-container text-error',
};

export default function OrderDetails() {
  return (
    <div className="p-6 md:p-10 w-full">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 font-label-md text-label-md text-on-surface-variant">
        <Link to="/admin/orders" className="hover:text-primary transition-colors">Orders</Link>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <span className="text-primary">{ORDER.id}</span>
      </div>

      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="font-headline-md text-headline-md text-on-background">Order {ORDER.id}</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">{ORDER.date}</p>
        </div>
        <span className={`px-4 py-2 rounded-full font-label-md text-label-md ${STATUS_COLORS[ORDER.status]}`}>
          {ORDER.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — Items + Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient">
            <h2 className="font-title-sm text-title-sm text-primary mb-4">Order Items</h2>
            <div className="space-y-4">
              {ORDER.items.map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                  <div className="flex-grow">
                    <p className="font-title-sm text-title-sm text-on-surface">{item.name}</p>
                    <p className="font-label-sm text-label-sm text-on-surface-variant">SKU: {item.sku} · Qty: {item.qty}</p>
                  </div>
                  <span className="font-title-sm text-title-sm text-on-surface">${(item.price * item.qty).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t border-outline-variant pt-4 space-y-2">
                <div className="flex justify-between font-body-md text-body-md text-on-surface-variant">
                  <span>Subtotal</span><span>${ORDER.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-body-md text-body-md text-on-surface-variant">
                  <span>Delivery</span><span>${ORDER.delivery.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-title-sm text-title-sm text-on-surface pt-2 border-t border-outline-variant">
                  <span>Total</span><span>${ORDER.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Notes */}
          {ORDER.notes && (
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient">
              <h2 className="font-title-sm text-title-sm text-primary mb-2">Customer Notes</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">{ORDER.notes}</p>
            </div>
          )}
        </div>

        {/* Right — Customer + Actions */}
        <div className="space-y-5">
          {/* Customer */}
          <div className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient">
            <h2 className="font-title-sm text-title-sm text-primary mb-4">Customer Details</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-[20px]">person</span>
                </div>
                <div>
                  <p className="font-label-md text-label-md text-on-surface">{ORDER.customer.name}</p>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">{ORDER.customer.email}</p>
                </div>
              </div>
              {[
                { icon: 'phone', text: ORDER.customer.phone },
                { icon: 'location_on', text: ORDER.address },
                { icon: 'payment', text: `Payment: ${ORDER.payment}` },
              ].map(({ icon, text }) => (
                <div key={icon} className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">{icon}</span>
                  <p className="font-body-md text-body-md text-on-surface-variant">{text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient space-y-3">
            <h2 className="font-title-sm text-title-sm text-primary mb-4">Update Status</h2>
            {['Confirmed', 'Processing', 'Delivered', 'Cancelled'].map((s) => (
              <button
                key={s}
                className={`w-full py-2 px-4 rounded-lg font-label-md text-label-md text-left transition-colors ${
                  ORDER.status === s
                    ? 'bg-primary-container text-primary font-bold'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
