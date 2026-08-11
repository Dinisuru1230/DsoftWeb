import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-surface-container-low border-t border-outline-variant w-full">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 px-4 sm:px-8 md:px-12 py-16 max-w-[1400px] mx-auto">
        {/* Brand */}
        <div className="md:col-span-1 flex flex-col">
          <span className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-primary mb-3">
            Malmalee Creations
          </span>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-xs">
            Handcrafted accessories bringing a touch of quiet luxury and nostalgia to your everyday life.
          </p>
        </div>

        {/* Shop Links */}
        <div className="flex flex-col gap-3">
          <h3 className="font-label-md text-label-md text-primary font-bold uppercase tracking-wider mb-1">Shop</h3>
          <Link to="/shop" className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors">All Products</Link>
          <Link to="/shop?cat=bows" className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors">Bows & Ribbons</Link>
          <Link to="/shop?cat=scrunchies" className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors">Scrunchies</Link>
          <Link to="/shop?cat=headbands" className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors">Headbands</Link>
        </div>

        {/* Company Links */}
        <div className="flex flex-col gap-3">
          <h3 className="font-label-md text-label-md text-primary font-bold uppercase tracking-wider mb-1">Company</h3>
          <Link to="/our-story" className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors">Our Story</Link>
          <Link to="/contact" className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors">Contact Us</Link>
          <a href="#" className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors">Instagram</a>
          <a href="#" className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors">Pinterest</a>
        </div>

        {/* Help Links */}
        <div className="flex flex-col gap-3">
          <h3 className="font-label-md text-label-md text-primary font-bold uppercase tracking-wider mb-1">Help</h3>
          <a href="#" className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors">Shipping Policy</a>
          <a href="#" className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors">Returns & Exchanges</a>
          <Link to="/account/track" className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors">Track My Order</Link>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-outline-variant/30 px-4 sm:px-8 md:px-12 py-4 text-center max-w-[1400px] mx-auto">
        <span className="font-label-sm text-label-sm text-secondary">
          © 2024 Malmalee Creations. Handcrafted with Magic.
        </span>
      </div>
    </footer>
  );
}
