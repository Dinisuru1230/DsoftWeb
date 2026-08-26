import { Link } from "react-router-dom";
import LogoComponent from "./LogoComponent";

export default function Footer() {
  return (
    <footer className="bg-surface-container-low border-t border-outline-variant w-full">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 px-4 sm:px-8 md:px-12 py-16 max-w-[1400px] mx-auto">
        {/* Brand */}
        <div className="md:col-span-1 flex flex-col">
          <LogoComponent height="h-12 sm:h-14" className="mb-3" />
          <p className="font-body-md text-body-md text-on-surface-variant max-w-xs">
            Next-gen digital products, SaaS suites, and custom software services built to empower modern businesses.
          </p>
        </div>

        {/* Shop Links */}
        <div className="flex flex-col gap-3">
          <h3 className="font-label-md text-label-md text-primary font-bold uppercase tracking-wider mb-1">
            Shop
          </h3>
          <Link
            to="/shop"
            className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors"
          >
            All Products
          </Link>
        </div>

        {/* Company Links */}
        <div className="flex flex-col gap-3">
          <h3 className="font-label-md text-label-md text-primary font-bold uppercase tracking-wider mb-1">
            Company
          </h3>
          <Link
            to="/about-us"
            className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors"
          >
            About Us
          </Link>
          <Link
            to="/contact"
            className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors"
          >
            Contact Us
          </Link>
          <a
            href="https://www.facebook.com/share/19BFB5mDyC/"
            className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            Facebook
          </a>
        </div>

        {/* Help Links */}
        <div className="flex flex-col gap-3">
          <h3 className="font-label-md text-label-md text-primary font-bold uppercase tracking-wider mb-1">
            Help
          </h3>
          <Link
            to="/get-cid"
            className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors"
          >
            Get CID Free
          </Link>
          <Link
            to="/terms"
            className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors"
          >
            Terms & Conditions
          </Link>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-outline-variant/30 px-4 sm:px-8 md:px-12 py-5 flex items-center justify-center gap-3.5 text-center max-w-[1400px] mx-auto flex-wrap">
        <p className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1 flex-wrap justify-center">
          <span>© 2026 DSoft Pack. All Rights Reserved.</span>
        </p>
  
      </div>
    </footer>
  );
}
