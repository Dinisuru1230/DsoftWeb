import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const API_BASE = 'http://localhost:5050/api';

function imgUrl(path) {
  if (!path) return '/13_studio_table_ribbons.jpg';
  if (path.startsWith('http')) return path;
  if (path.startsWith('/uploads')) return `http://localhost:5050${path}`;
  return path;
}

export default function OurStory() {
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
        console.error('Failed to load story from API:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  const mainTitle = story?.mainTitle || 'Born from Stillness,\nCrafted with Intention';
  const subtitle =
    story?.subtitle ||
    'Malmalee Creations began as a quiet idea — that the most beautiful things in life are made slowly, with care, and with love. We are a small, passionate team of makers, dreamers, and storytellers.';
  const mainImage = story?.mainImage || '/13_studio_table_ribbons.jpg';
  const sections = story?.sections && story.sections.length > 0 ? story.sections : [];

  // Parse title into first line and highlighted second line if newline/comma present
  const titleParts = mainTitle.includes('\n')
    ? mainTitle.split('\n')
    : mainTitle.includes(',')
    ? [mainTitle.split(',')[0] + ',', mainTitle.split(',').slice(1).join(',')]
    : [mainTitle];

  return (
    <main className="w-full flex flex-col items-center bg-background px-4 sm:px-8 md:px-16 lg:px-40 pb-20">
      {/* ── Hero Section ── */}
      <div className="max-w-[960px] w-full pt-12 sm:pt-16 text-center mb-12 sm:mb-16">
        <p className="font-label-md text-label-md text-primary uppercase tracking-widest mb-3 font-bold">
          Our Story
        </p>
        <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface mb-6 leading-tight">
          {titleParts[0]}
          {titleParts[1] && (
            <>
              <br />
              <span className="italic text-primary font-normal">{titleParts[1]}</span>
            </>
          )}
        </h1>
        <p className="font-body-lg text-sm sm:text-base md:text-body-lg text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
          {subtitle}
        </p>
      </div>

      {/* ── Hero Main Cover Image ── */}
      <div className="max-w-[960px] w-full mb-16 sm:mb-20">
        <img
          src={imgUrl(mainImage)}
          alt="Malmalee Creations studio — handmade elegance"
          className="w-full h-[280px] sm:h-[400px] md:h-[500px] object-cover rounded-2xl shadow-ambient border border-outline-variant/30"
        />
      </div>

      {/* ── Dynamic Chapters & Sections ── */}
      <div className="max-w-[960px] w-full flex flex-col gap-14 sm:gap-20">
        {sections.map((s, i) => {
          const paragraphs = (s.paragraph || '')
            .split('\n')
            .map((p) => p.trim())
            .filter(Boolean);

          return (
            <section
              key={s.id || i}
              className={`flex flex-col ${
                s.reverse ? 'md:flex-row-reverse' : 'md:flex-row'
              } items-center gap-6 lg:gap-16`}
            >
              {/* Photo Column */}
              <div className="w-full md:w-1/2">
                <img
                  src={imgUrl(s.image)}
                  alt={s.title || `Our Story Chapter ${i + 1}`}
                  className="w-full h-auto aspect-[4/5] object-cover rounded-2xl shadow-ambient border border-outline-variant/20"
                />
              </div>

              {/* Text Column */}
              <div className="w-full md:w-1/2 flex flex-col gap-4">
                <h3 className="font-headline-md text-xl sm:text-2xl md:text-headline-md text-primary font-bold">
                  {s.title}
                </h3>
                {paragraphs.length > 0 ? (
                  paragraphs.map((p, j) => (
                    <p
                      key={j}
                      className="font-body-md text-sm sm:text-base md:text-body-lg text-on-surface-variant leading-relaxed"
                    >
                      {p}
                    </p>
                  ))
                ) : (
                  <p className="font-body-md text-body-lg text-on-surface-variant leading-relaxed">
                    {s.paragraph}
                  </p>
                )}
              </div>
            </section>
          );
        })}
      </div>

      {/* ── Join Our Journey CTA ── */}
      <div className="max-w-[960px] w-full mt-16 sm:mt-20 bg-primary-container/30 rounded-2xl p-8 sm:p-12 text-center border border-primary/20">
        <h2 className="font-headline-md text-xl sm:text-2xl md:text-headline-md text-primary mb-3 font-bold">
          Join Our Journey
        </h2>
        <p className="font-body-lg text-sm sm:text-base md:text-body-lg text-on-surface-variant mb-6 max-w-lg mx-auto leading-relaxed">
          Explore our collection and find your piece of everyday magic.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 bg-primary text-white font-label-md text-sm sm:text-base py-3 px-8 rounded-full shadow-ambient hover:bg-primary/90 hover:-translate-y-0.5 transition-all duration-300 font-bold cursor-pointer"
        >
          Shop the Collection
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </Link>
      </div>
    </main>
  );
}
