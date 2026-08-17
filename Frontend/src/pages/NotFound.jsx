import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <main className="flex-grow flex items-center justify-center px-5 py-16">
      <div className="text-center max-w-lg">
        <div className="relative mb-8">
          <span className="font-display-lg text-display-lg text-primary-container/80" style={{ fontSize: '180px', lineHeight: 1 }}>
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary" style={{ fontSize: '80px' }}>search_off</span>
          </div>
        </div>
        <h1 className="font-headline-md-mobile md:font-headline-md text-headline-md-mobile md:text-headline-md text-primary mb-4">
          Page Not Found
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant mb-8">
          The page you're looking for has wandered off into the artisan's studio. Let's bring you back.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-primary-container text-on-background font-label-md text-label-md py-3 px-8 rounded-full hover:bg-primary hover:text-white transition-all duration-300"
        >
          <span className="material-symbols-outlined text-[18px]">home</span>
          Back to Home
        </Link>
      </div>
    </main>
  );
}
