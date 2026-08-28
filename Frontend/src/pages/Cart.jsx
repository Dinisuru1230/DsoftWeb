import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const { cartItems, cartSubtotal, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();

  const [currentTime, setCurrentTime] = useState('');
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', {
        timeZone: 'Asia/Colombo',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
      setCurrentTime(timeStr);

      const colomboHourStr = now.toLocaleTimeString('en-US', {
        timeZone: 'Asia/Colombo',
        hour: '2-digit',
        hour12: false,
      });
      const colomboHour = parseInt(colomboHourStr, 10);
      setIsOnline(colomboHour >= 5 && colomboHour < 23);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  if (cartItems.length === 0) {
    return (
      <main className="flex-grow w-full max-w-[1400px] mx-auto px-5 md:px-16 py-16 flex flex-col items-center justify-center text-center">
        <span className="material-symbols-outlined text-8xl text-outline mb-6">shopping_bag</span>
        <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-background tracking-tight mb-4">
          Your Bag is Empty
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant mb-8">
          Discover genuine software licenses to fill your cart.
        </p>
        <Link
          to="/shop"
          className="bg-primary-container text-on-background font-label-md text-label-md py-3 px-8 rounded-full hover:bg-primary hover:text-white transition-all duration-300 font-bold shadow-ambient"
        >
          Continue Shopping
        </Link>
      </main>
    );
  }

  return (
    <main className="flex-grow w-full max-w-[1400px] mx-auto px-5 md:px-16 py-6 md:py-8">
      {/* ── 1. Page Header (Exact Checkout Style) ── */}
      <header className="mb-4 text-center md:text-left border-b border-outline-variant/30 pb-2">
        <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-background tracking-tight">
          Cart
        </h1>
      </header>

      {/* ── 2. Trust & Information Cards Section (Exact Checkout Style) ── */}
      <section className="mb-6 bg-[#f8f9fa] dark:bg-surface-container-low border border-outline-variant/30 rounded-2xl p-4 md:p-5 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          {/* 1. FAST DELIVERY */}
          <div className="flex flex-col items-center px-2">
            <div className="w-12 h-12 rounded-full border border-neutral-800 flex items-center justify-center mb-2 bg-white dark:bg-surface-container-lowest shadow-sm">
              <span className="material-symbols-outlined text-[24px] text-[#ff5500]">local_shipping</span>
            </div>
            <h3 className="font-bold text-[#d92626] uppercase text-xs md:text-sm tracking-wider mb-1">
              FAST DELIVERY
            </h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              We typically deliver within 15 minutes during our working hours; in rare cases, delivery may take longer.
            </p>
          </div>

          {/* 2. WORKING HOURS */}
          <div className="flex flex-col items-center px-2">
            <div className="w-12 h-12 rounded-full border border-neutral-800 flex items-center justify-center mb-2 bg-white dark:bg-surface-container-lowest shadow-sm">
              <span className="material-symbols-outlined text-[24px] text-[#ff5500]">schedule</span>
            </div>
            <h3 className="font-bold text-[#d92626] uppercase text-xs md:text-sm tracking-wider mb-1">
              WORKING HOURS
            </h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              5.00 AM to 11.00 PM (GMT+5:30 - Current time: {currentTime || '10:44 PM'})
            </p>
            <p className="text-xs font-medium mt-0.5">
              Status: <span className={isOnline ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>{isOnline ? 'Online' : 'Offline'}</span>
            </p>
          </div>

          {/* 3. EMAIL NOTIFICATIONS */}
          <div className="flex flex-col items-center px-2">
            <div className="w-12 h-12 rounded-full border border-neutral-800 flex items-center justify-center mb-2 bg-white dark:bg-surface-container-lowest shadow-sm">
              <span className="material-symbols-outlined text-[24px] text-[#ff5500]">mail</span>
            </div>
            <h3 className="font-bold text-[#d92626] uppercase text-xs md:text-sm tracking-wider mb-1">
              EMAIL NOTIFICATIONS
            </h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Order status notifications via Email. Check My Account &gt;&gt; Order History to see purchased products.
            </p>
          </div>

          {/* 4. WARRANTY */}
          <div className="flex flex-col items-center px-2">
            <div className="w-12 h-12 rounded-full border border-neutral-800 flex items-center justify-center mb-2 bg-white dark:bg-surface-container-lowest shadow-sm">
              <span className="material-symbols-outlined text-[24px] text-[#ff5500]">verified</span>
            </div>
            <h3 className="font-bold text-[#d92626] uppercase text-xs md:text-sm tracking-wider mb-1">
              WARRANTY
            </h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              If you face any problem during activation, contact us within the warranty period with error screenshots.
            </p>
          </div>
        </div>
      </section>

      {/* ── 3. Main Grid Layout (7 Cols Cart Items / 5 Cols Order Summary) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column (7 Cols): Cart Items Card */}
        <div className="lg:col-span-7 space-y-6">
          <section className="bg-surface-container-lowest rounded-xl p-6 md:p-8 shadow-ambient border border-outline-variant/30 space-y-5">
            <div className="border-b border-outline-variant/30 pb-2 mb-4">
              <h2 className="text-xl md:text-2xl font-bold text-on-background inline-block relative pb-1">
                Shopping Cart Items
                <span className="absolute bottom-0 left-0 w-full h-[2.5px] bg-primary rounded-full"></span>
              </h2>
            </div>

            <div className="space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.cartKey || item.id}
                  className="bg-surface-container-lowest rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 border border-outline-variant/30 hover:shadow-ambient transition-all duration-300"
                >
                  {/* Image */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-lg overflow-hidden border border-outline-variant/30 bg-surface-container">
                    <img src={item.image} alt={item.name} className="w-full h-full object-contain p-1.5" />
                  </div>

                  {/* Info */}
                  <div className="flex-grow w-full">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h3 className="font-title-sm text-title-sm text-on-surface mb-1 font-bold">{item.name}</h3>
                        <span className="inline-block bg-primary-container text-on-surface-variant px-2.5 py-0.5 rounded-full font-label-sm text-xs font-semibold">
                          {item.categoryName || item.category}
                        </span>
                      </div>
                      <div className="font-title-sm text-title-sm text-primary font-extrabold whitespace-nowrap">
                        Rs. {(item.price * item.quantity).toLocaleString()}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      {/* Quantity Controls */}
                      <div className="flex items-center border-b-2 border-outline-variant w-28 justify-between bg-surface-container-low rounded-t-sm px-2 py-1">
                        <button
                          onClick={() => updateQuantity(item.cartKey || item.id, item.quantity - 1)}
                          className="text-on-surface-variant hover:text-primary p-0.5 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">remove</span>
                        </button>
                        <input
                          type="number"
                          min="1"
                          max="999"
                          value={item.quantity}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            if (!isNaN(val) && val > 0) {
                              updateQuantity(item.cartKey || item.id, val);
                            } else if (e.target.value === '') {
                              updateQuantity(item.cartKey || item.id, 1);
                            }
                          }}
                          onFocus={(e) => e.target.select()}
                          className="w-12 text-center font-body-md text-body-md text-on-surface bg-transparent outline-none font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <button
                          onClick={() => updateQuantity(item.cartKey || item.id, item.quantity + 1)}
                          className="text-on-surface-variant hover:text-primary p-0.5 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">add</span>
                        </button>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => removeFromCart(item.cartKey || item.id)}
                        className="text-on-surface-variant hover:text-error transition-colors duration-200 cursor-pointer flex items-center gap-1 text-xs font-semibold"
                        aria-label="Remove item"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                        <span className="hidden sm:inline">Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column (5 Cols): Order Summary Card */}
        <div className="lg:col-span-5">
          <div className="bg-surface-container-lowest rounded-xl p-6 md:p-8 shadow-ambient border border-outline-variant/30 sticky top-8 space-y-4">
            <div className="border-b border-outline-variant/30 pb-2 mb-4">
              <h2 className="text-xl md:text-2xl font-bold text-on-background inline-block relative pb-1">
                Order Summary
                <span className="absolute bottom-0 left-0 w-full h-[2.5px] bg-primary rounded-full"></span>
              </h2>
            </div>

            <div className="space-y-3 border-b border-outline-variant/40 pb-4 text-on-surface-variant font-body-md">
              <div className="flex justify-between">
                <span>Subtotal ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})</span>
                <span className="font-semibold text-on-surface">Rs. {cartSubtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-on-surface-variant">
                <span>Digital Delivery</span>
                <span className="text-emerald-600 font-bold">FREE (Instant)</span>
              </div>
            </div>

            <div className="flex justify-between items-center text-lg font-bold text-on-background pt-1">
              <span>Total</span>
              <span className="text-xl font-extrabold text-primary">Rs. {cartSubtotal.toLocaleString()}</span>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full bg-primary-container text-on-background font-label-md text-label-md py-4 px-8 rounded-full hover:bg-primary hover:text-white transition-all duration-300 shadow-ambient flex items-center justify-center gap-2 cursor-pointer font-bold mt-4"
            >
              <span>Proceed to Checkout</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>

            <p className="text-center font-label-sm text-xs text-on-surface-variant mt-2">
              Instant digital key delivery upon payment
            </p>

            <div className="mt-6 pt-4 border-t border-outline-variant/30">
              <Link
                to="/shop"
                className="flex items-center justify-center gap-2 font-label-md text-sm text-primary hover:text-on-primary-container transition-colors font-bold"
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
