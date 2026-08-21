import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const { cartItems, cartSubtotal, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();

  if (cartItems.length === 0) {
    return (
      <main className="flex-grow w-full max-w-[1200px] mx-auto px-5 md:px-16 py-16 flex flex-col items-center justify-center text-center">
        <span className="material-symbols-outlined text-8xl text-outline mb-6">shopping_bag</span>
        <h1 className="font-headline-md-mobile text-headline-md-mobile text-primary mb-4">Your Bag is Empty</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant mb-8">
          Discover handcrafted pieces to fill your bag with everyday magic.
        </p>
        <Link
          to="/shop"
          className="bg-primary-container text-on-background font-label-md text-label-md py-3 px-8 rounded-full hover:bg-primary hover:text-white transition-all duration-300"
        >
          Continue Shopping
        </Link>
      </main>
    );
  }

  return (
    <main className="flex-grow w-full max-w-[1200px] mx-auto px-5 md:px-16 py-16">
      <h1 className="font-headline-md-mobile md:font-headline-md text-headline-md-mobile md:text-headline-md text-primary mb-8">
        Your Cart
      </h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Cart Items */}
        <div className="flex-grow space-y-4">
          {cartItems.map((item) => (
            <div
              key={item.cartKey || item.id}
              className="bg-surface-container-lowest rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 border-b border-outline-variant pb-4 hover:shadow-ambient transition-all duration-300"
            >
              {/* Image */}
              <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>

              {/* Info */}
              <div className="flex-grow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-title-sm text-title-sm text-on-surface mb-1">{item.name}</h3>
                    <span className="inline-block bg-primary-container text-on-surface-variant px-2 py-1 rounded-full font-label-sm text-label-sm">
                      {item.categoryName || item.category}
                    </span>
                  </div>
                  <div className="font-title-sm text-title-sm text-primary">
                    Rs. {(item.price * item.quantity).toLocaleString()}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3">
                  {/* Quantity Controls */}
                  <div className="flex items-center border-b-2 border-outline-variant w-24 justify-between bg-surface-container-low rounded-t-sm px-2 py-1">
                    <button
                      onClick={() => updateQuantity(item.cartKey || item.id, item.quantity - 1)}
                      className="text-on-surface-variant hover:text-primary"
                    >
                      <span className="material-symbols-outlined text-[16px]">remove</span>
                    </button>
                    <span className="font-body-md text-body-md text-on-surface">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.cartKey || item.id, item.quantity + 1)}
                      className="text-on-surface-variant hover:text-primary"
                    >
                      <span className="material-symbols-outlined text-[16px]">add</span>
                    </button>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeFromCart(item.cartKey || item.id)}
                    className="text-on-surface-variant hover:text-error transition-colors duration-200"
                    aria-label="Remove item"
                  >
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-96 flex-shrink-0">
          <div className="bg-surface-container-lowest rounded-xl p-8 shadow-ambient sticky top-8">
            <h2 className="font-headline-md-mobile text-headline-md-mobile text-primary mb-6">Order Summary</h2>
            <div className="space-y-3 border-b border-outline-variant pb-6 mb-6">
              <div className="flex justify-between font-body-md text-body-md text-on-surface-variant">
                <span>Subtotal ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})</span>
                <span>Rs. {cartSubtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-body-md text-body-md text-on-surface-variant">
                <span>Delivery Fee</span>
                <span className="text-primary font-medium">Calculated at checkout</span>
              </div>
            </div>
            <div className="flex justify-between font-title-sm text-title-sm text-on-surface mb-6">
              <span>Subtotal</span>
              <span>Rs. {cartSubtotal.toLocaleString()}</span>
            </div>
            <button
              onClick={() => navigate('/checkout')}
              className="w-full bg-primary-container text-on-background font-label-md text-label-md py-3 px-8 rounded-full hover:bg-primary hover:text-white transition-all duration-300"
            >
              Proceed to Checkout
            </button>
            <p className="text-center font-label-sm text-label-sm text-on-surface-variant mt-4">
              Secure checkout powered by Stripe
            </p>
            <div className="mt-6 pt-6 border-t border-outline-variant">
              <Link
                to="/shop"
                className="flex items-center justify-center gap-2 font-label-md text-label-md text-primary hover:text-on-primary-container transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
