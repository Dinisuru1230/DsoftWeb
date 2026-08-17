import { Link, useLocation } from 'react-router-dom';

export default function OrderConfirmed() {
  const location = useLocation();
  const state = location.state || {};
  const isBankTransfer = state.paymentMethod === 'bank_transfer';
  const orderNumber = state.orderNumber || `MC-${Date.now().toString().slice(-6)}`;
  const totalAmount = state.totalAmount || 55.00;

  return (
    <main className="flex-grow flex items-center justify-center px-5 py-16">
      <div className="w-full max-w-lg text-center">
        <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${
          isBankTransfer ? 'bg-secondary-container' : 'bg-primary-container'
        }`}>
          <span className={`material-symbols-outlined text-5xl ${
            isBankTransfer ? 'text-secondary' : 'text-primary'
          }`}>
            {isBankTransfer ? 'hourglass_top' : 'check_circle'}
          </span>
        </div>

        <h1 className="font-display-lg-mobile text-display-lg-mobile text-primary mb-3">
          {isBankTransfer ? 'Order Placed — Pending Verification' : 'Order Confirmed!'}
        </h1>

        <p className="font-body-lg text-body-lg text-on-surface-variant mb-2">
          {isBankTransfer
            ? 'Your bank slip has been received. Our team will verify your payment shortly.'
            : 'Thank you for shopping with Malmalee Creations.'}
        </p>

        <p className="font-label-md text-label-md text-on-surface-variant mb-6">
          Order <span className="text-primary font-bold">#{orderNumber}</span> · Confirmation email sent.
        </p>

        {isBankTransfer && (
          <div className="bg-secondary-container/30 border border-secondary-fixed-dim/60 rounded-xl p-4 mb-6 text-left flex items-start gap-3">
            <span className="material-symbols-outlined text-secondary mt-0.5">info</span>
            <div className="text-xs font-body-md text-on-surface">
              <p className="font-bold text-secondary mb-1">Bank Slip Verification Process</p>
              <p>An Admin will verify your transferred payment against the bank slip ({state.refNumber || 'Receipt uploaded'}). Once verified, your order status will be changed from <strong>Processing</strong> to <strong>Confirmed</strong>.</p>
            </div>
          </div>
        )}

        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-ambient mb-8 text-left border border-outline-variant/30">
          <div className="flex items-center gap-4">
            <img src="/14_blush_silk_ribbon_bow.jpg" alt="Order item" className="w-16 h-16 rounded-lg object-cover" />
            <div>
              <p className="font-title-sm text-title-sm text-on-surface">Handcrafted Bows & Scrunchies</p>
              <p className="font-body-md text-body-md text-on-surface-variant">Qty: 2 · Malmalee Collection</p>
            </div>
          </div>

          <div className="border-t border-outline-variant/30 mt-4 pt-4 flex justify-between font-title-sm text-title-sm text-on-surface">
            <span>Payment Method</span>
            <span className="font-bold text-primary">
              {isBankTransfer ? 'Bank Slip Transfer' : state.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Credit / Debit Card'}
            </span>
          </div>

          <div className="flex justify-between font-title-sm text-title-sm text-on-surface mt-2">
            <span>Total Amount</span>
            <span className="font-bold text-primary">Rs. {totalAmount.toLocaleString()}</span>
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
