import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function DeliveryInfo() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const checkOnline = () => {
      const now = new Date();
      const colomboHourStr = now.toLocaleTimeString('en-US', {
        timeZone: 'Asia/Colombo',
        hour: '2-digit',
        hour12: false,
      });
      const colomboHour = parseInt(colomboHourStr, 10);
      setIsOnline(colomboHour >= 5 && colomboHour < 23);
    };
    checkOnline();
    const interval = setInterval(checkOnline, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="flex-grow w-full max-w-[1200px] mx-auto px-4 sm:px-8 md:px-12 py-8 md:py-12 text-on-background">
      {/* ── Page Header (Checkout/Cart Design System Style) ── */}
      <header className="mb-8 text-center md:text-left border-b border-outline-variant/30 pb-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold mb-3">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Instant Digital License Delivery
        </div>
        <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-background tracking-tight">
          Delivery &amp; Fulfillment Information
        </h1>
        <p className="text-xs sm:text-sm text-on-surface-variant max-w-2xl font-medium mt-1 leading-relaxed">
          We understand the importance of swift delivery and aim to provide you with a seamless experience. Below are key details regarding how your digital product license is delivered.
        </p>
      </header>

      {/* ── 4 Main Information Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        
        {/* Card 1: Accessing Your Product */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 md:p-8 shadow-xs hover:shadow-ambient transition-all duration-300 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-primary flex items-center justify-center border border-sky-200 dark:border-sky-800">
              <span className="material-symbols-outlined text-2xl">vpn_key</span>
            </div>
            <h2 className="text-lg md:text-xl font-bold text-on-surface">
              Accessing Your Product
            </h2>
            <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              Your product license will be available for access through your Dsoft Pack account. Upon completion of your purchase and order processing, you will receive an email notification indicating that your order status is <span className="font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md">"Completed"</span>.
            </p>
            <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              You can then retrieve your license anytime by navigating to <span className="font-bold text-primary">"My Account"</span> and accessing the <span className="font-bold text-primary">"Order History"</span> section.
            </p>
          </div>

          <div className="pt-2">
            <Link
              to="/account"
              className="inline-flex items-center gap-1.5 text-xs font-extrabold text-primary hover:underline"
            >
              Go to Order History &rarr;
            </Link>
          </div>
        </div>

        {/* Card 2: Delivery Timeframe */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 md:p-8 shadow-xs hover:shadow-ambient transition-all duration-300 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
              <span className="material-symbols-outlined text-2xl">timer</span>
            </div>
            <h2 className="text-lg md:text-xl font-bold text-on-surface">
              Delivery Timeframe
            </h2>
            <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              We endeavor to ensure prompt delivery of your product license. Typically, licenses are accessible within just <strong className="text-slate-900 dark:text-white font-bold">15 minutes</strong> during our operational hours.
            </p>
            <div className="p-3 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 rounded-xl text-xs text-amber-900 dark:text-amber-300 font-medium flex items-start gap-2">
              <span className="material-symbols-outlined text-amber-600 text-[18px] shrink-0 mt-0.5">info</span>
              <span>In rare cases due to automated queue processing or bank slip verification, delivery may take slightly longer.</span>
            </div>
          </div>
        </div>

        {/* Card 3: Operating Hours */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 md:p-8 shadow-xs hover:shadow-ambient transition-all duration-300 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 flex items-center justify-center border border-orange-200 dark:border-orange-800">
              <span className="material-symbols-outlined text-2xl">schedule</span>
            </div>
            <div className="flex items-center justify-between">
              <h2 className="text-lg md:text-xl font-bold text-on-surface">
                Operating Hours
              </h2>
              <span className={`text-xs font-extrabold px-2.5 py-1 rounded-full ${isOnline ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                ● {isOnline ? 'Online Now' : 'Offline'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              Our fulfillment &amp; support team operates from <strong className="text-slate-900 dark:text-white font-bold">5:00 AM to 11:00 PM</strong> (Asia/Colombo time — GMT+5:30).
            </p>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Orders placed outside of these operational hours will be processed promptly during the very next operational period.
            </p>
          </div>
        </div>

        {/* Card 4: Customer Support */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 md:p-8 shadow-xs hover:shadow-ambient transition-all duration-300 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center border border-purple-200 dark:border-purple-800">
              <span className="material-symbols-outlined text-2xl">support_agent</span>
            </div>
            <h2 className="text-lg md:text-xl font-bold text-on-surface">
              Customer Support
            </h2>
            <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              Should you have any questions or encounter any issues regarding the delivery of your product license, our dedicated support team is here to assist you.
            </p>
            <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              You can reach us via live chat, email (<strong className="text-primary">dsoftpack@gmail.com</strong>), or phone (<strong className="text-emerald-600">+94 78 681 7659</strong>), and we will ensure a swift resolution.
            </p>
          </div>

          <div className="pt-2">
            <Link
              to="/contact"
              className="inline-flex items-center gap-1.5 text-xs font-extrabold text-primary hover:underline"
            >
              Contact Support Team &rarr;
            </Link>
          </div>
        </div>

      </div>

      {/* ── Commitment & Guarantee Footer Banner ── */}
      <section className="bg-gradient-to-r from-primary/10 via-sky-50 dark:via-slate-900 to-primary/10 border border-primary/20 rounded-2xl p-6 md:p-10 text-center space-y-3">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary text-white mb-1 shadow-md">
          <span className="material-symbols-outlined text-2xl">verified</span>
        </div>
        <h3 className="text-lg md:text-2xl font-extrabold text-slate-900 dark:text-white">
          Our Commitment to You
        </h3>
        <p className="text-xs sm:text-sm text-on-surface-variant max-w-3xl mx-auto leading-relaxed font-medium">
          At Dsoft pack, we are committed to providing fast, secure, and satisfactory service to our valued customers. Thank you for choosing us, and we look forward to serving you with excellence.
        </p>
        <div className="pt-2">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 bg-primary text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-full hover:bg-primary/90 transition-all shadow-md"
          >
            <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
            Browse Software Catalog
          </Link>
        </div>
      </section>
    </main>
  );
}
