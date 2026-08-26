import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const API_BASE = 'http://localhost:5050/api';

export default function AboutUs() {
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/our-story`)
      .then((r) => r.json())
      .then((data) => {
        if (data && data.mainTitle) {
          setStory(data);
        }
      })
      .catch((err) => {
        console.error('Failed to load About Us content:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  const mainTitle = story?.mainTitle || 'About Us';
  const subtitle =
    story?.subtitle ||
    'Welcome to DSoft pack. Our mission is to provide top-notch digital products at competitive prices by maintaining a streamlined, inventory-free business model.';
  const sections = story?.sections && story.sections.length > 0 ? story.sections : [];

  if (loading && !story) {
    return (
      <main className="w-full min-h-[50vh] flex items-center justify-center bg-background py-16">
        <div className="flex flex-col items-center gap-2 text-on-surface-variant">
          <span className="material-symbols-outlined animate-spin text-3xl text-primary">sync</span>
          <p className="text-xs font-medium">Loading About Us...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="w-full flex flex-col items-center bg-background px-4 sm:px-6 md:px-12 lg:px-32 pb-16">
      {/* ── Hero Section ── */}
      <div className="max-w-[800px] w-full pt-8 sm:pt-12 text-center mb-8 sm:mb-10">
        <span className="text-[11px] text-primary uppercase tracking-widest mb-2 font-bold block">
          Company Overview
        </span>
        <h1 className="text-xl sm:text-2xl md:text-3xl text-on-surface mb-3 leading-snug font-bold tracking-tight">
          {mainTitle}
        </h1>
        <p className="text-xs sm:text-sm text-on-surface-variant max-w-2xl mx-auto leading-relaxed font-normal">
          {subtitle}
        </p>
      </div>

      {/* ── Dynamic Sections ── */}
      <div className="max-w-[800px] w-full flex flex-col gap-4 sm:gap-5">
        {sections.map((s, i) => {
          const paragraphs = (s.paragraph || '')
            .split('\n\n')
            .map((p) => p.trim())
            .filter(Boolean);

          return (
            <section
              key={s.id || i}
              className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-4 sm:p-6 shadow-xs"
            >
              <div className="flex items-center gap-2.5 mb-3 border-b border-outline-variant/30 pb-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary-container/60 flex items-center justify-center text-primary font-bold shrink-0">
                  <span className="material-symbols-outlined text-[18px]">
                    {i === 0 ? 'groups' : i === 1 ? 'inventory_2' : i === 2 ? 'verified' : i === 3 ? 'thumb_up' : 'visibility'}
                  </span>
                </div>
                <h2 className="text-base sm:text-lg text-primary font-bold tracking-tight">
                  {s.title}
                </h2>
              </div>

              <div className="space-y-2.5">
                {paragraphs.map((p, j) => (
                  <p
                    key={j}
                    className="text-xs sm:text-sm text-on-surface-variant leading-relaxed whitespace-pre-line font-normal"
                  >
                    {p}
                  </p>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {/* ── CTA Banner ── */}
      <div className="max-w-[800px] w-full mt-10 sm:mt-12 bg-primary-container/30 rounded-xl p-6 sm:p-8 text-center border border-primary/20">
        <h2 className="text-lg sm:text-xl text-primary mb-2 font-bold tracking-tight">
          Explore Our Digital Solutions
        </h2>
        <p className="text-xs sm:text-sm text-on-surface-variant mb-5 max-w-md mx-auto leading-relaxed">
          Get genuine software keys, operating systems, and office suites with instant digital delivery.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-1.5 bg-primary text-white text-xs sm:text-sm py-2.5 px-6 rounded-full shadow-xs hover:bg-primary/90 transition-all font-bold cursor-pointer"
        >
          Browse Digital Store
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </Link>
      </div>
    </main>
  );
}
