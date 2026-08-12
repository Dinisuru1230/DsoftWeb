import { Link } from 'react-router-dom';

export default function OurStory() {
  const sections = [
    {
      title: 'The Art of Stillness',
      text: [
        'We believe that true elegance is found in the quiet moments. Our textiles are not just woven fabrics; they are a tribute to the slow, intentional art of craftsmanship. Each piece begins with a singular thread and a vision of calm, designed to bring a sense of tranquility and groundedness to your daily life.',
        'By working directly with master artisans, we ensure that the soul of traditional weaving is preserved, allowing the natural character of the materials to speak for themselves in every subtle fold and delicate fringe.',
      ],
      image: '/01_cream_linen_fabrics.jpg',
      imageAlt: 'Cream linen fabrics — artisanal textures',
      reverse: false,
    },
    {
      title: 'Everyday Magic',
      text: [
        "Magic isn't found in the grandiose; it's tucked quietly into the objects we touch every day. At Malmalee Creations, we aim to infuse your rituals with a touch of this extraordinary comfort. Our throw blankets are designed not just for warmth, but for the feeling of being wrapped in something that was made with genuine care.",
        "This is our promise to you: every thread is a deliberate act of intention.",
      ],
      image: '/06_elegant_living_space.jpg',
      imageAlt: 'Elegant living space with handcrafted textiles',
      reverse: true,
    },
    {
      title: 'The Hands Behind the Magic',
      text: [
        'Our collections are born in the hands of skilled artisans who have dedicated their lives to the craft of weaving. We partner with small family-run workshops, ensuring fair wages and a sustainable practice that honors both the maker and the material.',
        'When you choose Malmalee Creations, you are not just buying a product. You are investing in a story of human connection, skill, and a shared love for beautiful things.',
      ],
      image: '/05_artisanal_weaving_loom.jpg',
      imageAlt: 'Artisanal weaving loom in a sun-drenched studio',
      reverse: false,
    },
    {
      title: 'A Vision of Calm',
      text: [
        "Our design philosophy is rooted in a respect for natural beauty and a rejection of excess. We choose natural fibers, muted tones, and textures that speak of the earth. Our pieces are designed to age gracefully, becoming more beautiful with each year.",
        "We believe a well-made object is the ultimate form of sustainability — something you keep not because you have to, but because you love it.",
      ],
      image: '/11_mediterranean_balcony_alt.jpg',
      imageAlt: 'Mediterranean balcony — serene and elegant',
      reverse: true,
    },
  ];

  return (
    <main className="w-full flex flex-col items-center bg-background px-5 md:px-16 lg:px-40 pb-20">
      {/* Hero */}
      <div className="max-w-[960px] w-full pt-16 text-center mb-16">
        <p className="font-label-md text-label-md text-primary uppercase tracking-widest mb-3">Our Story</p>
        <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface mb-6">
          Born from Stillness, <br />
          <span className="italic text-primary">Crafted with Intention</span>
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
          Malmalee Creations began as a quiet idea — that the most beautiful things in life are made slowly, with care, and with love. We are a small, passionate team of makers, dreamers, and storytellers.
        </p>
      </div>

      {/* Hero Image */}
      <div className="max-w-[960px] w-full mb-20">
        <img
          src="/13_studio_table_ribbons.jpg"
          alt="Malmalee Creations studio — handmade elegance"
          className="w-full h-[400px] md:h-[500px] object-cover rounded-2xl shadow-ambient"
        />
      </div>

      {/* Alternating Sections */}
      <div className="max-w-[960px] w-full flex flex-col gap-20">
        {sections.map((s, i) => (
          <section
            key={i}
            className={`flex flex-col ${s.reverse ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-6 lg:gap-16`}
          >
            <div className="w-full md:w-1/2">
              <img
                src={s.image}
                alt={s.imageAlt}
                className="w-full h-auto aspect-[4/5] object-cover rounded-lg shadow-sm"
              />
            </div>
            <div className="w-full md:w-1/2 flex flex-col gap-4">
              <h3 className="font-headline-md text-headline-md text-primary">{s.title}</h3>
              {s.text.map((p, j) => (
                <p key={j} className="font-body-md text-body-lg text-on-surface-variant leading-relaxed">
                  {p}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* CTA */}
      <div className="max-w-[960px] w-full mt-20 bg-primary-container/30 rounded-2xl p-10 text-center">
        <h2 className="font-headline-md text-headline-md text-primary mb-4">Join Our Journey</h2>
        <p className="font-body-lg text-body-lg text-on-surface-variant mb-6 max-w-lg mx-auto">
          Explore our collection and find your piece of everyday magic.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 bg-primary-container text-on-background font-label-md text-label-md py-3 px-8 rounded-full shadow-ambient hover:bg-primary hover:text-white hover:-translate-y-0.5 transition-all duration-300"
        >
          Shop the Collection
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </Link>
      </div>
    </main>
  );
}
