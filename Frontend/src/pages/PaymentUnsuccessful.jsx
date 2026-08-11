import { Link, useNavigate } from 'react-router-dom';

export default function PaymentUnsuccessful() {
  const navigate = useNavigate();
  return (
    <main className="flex-grow flex items-center justify-center px-5 py-16">
      <div className="w-full max-w-lg text-center">
        <div className="w-24 h-24 rounded-full bg-error-container flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-error text-5xl">error</span>
        </div>
        <h1 className="font-display-lg-mobile text-display-lg-mobile text-error mb-3">Payment Failed</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant mb-8">
          We couldn't process your payment. Your order has not been placed. Please try again or choose Cash on Delivery.
        </p>
        <div className="bg-error-container/30 rounded-xl p-4 mb-8">
          <p className="font-body-md text-body-md text-error">
            Common reasons: insufficient funds, incorrect card details, or bank declined the transaction.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="bg-primary-container text-on-background font-label-md text-label-md py-3 px-8 rounded-full hover:bg-primary hover:text-white transition-all duration-300"
          >
            Try Again
          </button>
          <Link to="/checkout" className="border border-primary text-primary font-label-md text-label-md py-3 px-8 rounded-full hover:bg-primary hover:text-white transition-all duration-300">
            Switch to COD
          </Link>
          <Link to="/cart" className="font-label-md text-label-md text-on-surface-variant py-3 px-8 rounded-full hover:text-primary transition-colors">
            Back to Cart
          </Link>
        </div>
      </div>
    </main>
  );
}
