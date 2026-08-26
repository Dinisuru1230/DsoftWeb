const prisma = require('../config/prisma');

const DEFAULT_STORY_SECTIONS = [
  {
    id: 'sec-1',
    title: 'Who We Are',
    paragraph: 'At Dsoftpack, we are committed to excellence and customer satisfaction. Our team comprises experienced professionals dedicated to delivering the best IT solutions to meet your needs.',
    image: '/01_cream_linen_fabrics.jpg',
    reverse: false,
  },
  {
    id: 'sec-2',
    title: 'What We Offer',
    paragraph: 'We exclusively sell digital products, including software license keys for operating systems, office suites, and antivirus programs. By eliminating physical inventory, we minimize costs and pass the savings on to our customers. Our digital delivery ensures you receive your products quickly and securely.',
    image: '/06_elegant_living_space.jpg',
    reverse: true,
  },
  {
    id: 'sec-3',
    title: 'Our Commitment',
    paragraph: 'Dsoft pack is dedicated to offering fast, safe, and satisfactory deals to our customers. We prioritize efficiency, reliability, and affordability in all our services. Whether you\'re an individual looking for a single license or a business in need of multiple solutions, we have you covered.',
    image: '/05_artisanal_weaving_loom.jpg',
    reverse: false,
  },
  {
    id: 'sec-4',
    title: 'Why Choose Us',
    paragraph: 'Competitive Prices: Our digital-only inventory allows us to offer highly competitive prices on all our products.\n\nQuick Delivery: Orders are processed swiftly, and product keys are accessible in your account within hours.\n\nCustomer Support: Our support team is available to assist you with any questions or issues.',
    image: '/11_mediterranean_balcony_alt.jpg',
    reverse: true,
  },
  {
    id: 'sec-5',
    title: 'Our Vision',
    paragraph: 'We aim to be a leading provider of digital IT solutions, continually adapting to the evolving technological landscape to meet the diverse needs of our customers.\n\nThank you for choosing DSoft pack. We look forward to serving you and ensuring you have a seamless, positive experience with our products and services.',
    image: '/13_studio_table_ribbons.jpg',
    reverse: false,
  },
];

async function getOrCreateOurStory() {
  let story = await prisma.ourStory.findUnique({ where: { id: 'global' } });
  if (!story || story.mainTitle.includes('Born from Stillness')) {
    story = await prisma.ourStory.upsert({
      where: { id: 'global' },
      update: {
        mainTitle: 'About Us',
        subtitle: 'Welcome to DSoft pack. Our mission is to provide top-notch digital products at competitive prices by maintaining a streamlined, inventory-free business model.',
        mainImage: '/13_studio_table_ribbons.jpg',
        sections: JSON.stringify(DEFAULT_STORY_SECTIONS),
      },
      create: {
        id: 'global',
        mainTitle: 'About Us',
        subtitle: 'Welcome to DSoft pack. Our mission is to provide top-notch digital products at competitive prices by maintaining a streamlined, inventory-free business model.',
        mainImage: '/13_studio_table_ribbons.jpg',
        sections: JSON.stringify(DEFAULT_STORY_SECTIONS),
      },
    });
  }

  let parsedSections = [];
  try {
    parsedSections = JSON.parse(story.sections || '[]');
    if (!Array.isArray(parsedSections) || parsedSections.length === 0) {
      parsedSections = DEFAULT_STORY_SECTIONS;
    }
  } catch {
    parsedSections = DEFAULT_STORY_SECTIONS;
  }

  return {
    ...story,
    sections: parsedSections,
  };
}

// GET /api/our-story — Public
async function getOurStory(req, res) {
  try {
    const story = await getOrCreateOurStory();
    res.json(story);
  } catch (error) {
    console.error('getOurStory error:', error);
    res.status(500).json({ error: 'Failed to load Our Story content.' });
  }
}

// PUT /api/our-story — Admin Only
async function updateOurStory(req, res) {
  try {
    const { mainTitle, subtitle, mainImage, sections } = req.body;

    if (!mainTitle || !mainTitle.trim()) {
      return res.status(400).json({ error: 'Main story title is required.' });
    }

    if (!subtitle || !subtitle.trim()) {
      return res.status(400).json({ error: 'Subtitle / description is required.' });
    }

    let sanitizedSections = [];
    if (Array.isArray(sections)) {
      sanitizedSections = sections.map((sec, idx) => ({
        id: sec.id || `sec-${idx + 1}-${Date.now()}`,
        title: (sec.title || '').trim() || `Section ${idx + 1}`,
        paragraph: (sec.paragraph || '').trim(),
        image: sec.image || '/01_cream_linen_fabrics.jpg',
        reverse: sec.reverse !== undefined ? Boolean(sec.reverse) : idx % 2 === 1,
      }));
    }

    const updated = await prisma.ourStory.upsert({
      where: { id: 'global' },
      update: {
        mainTitle: mainTitle.trim(),
        subtitle: subtitle.trim(),
        mainImage: mainImage || '/13_studio_table_ribbons.jpg',
        sections: JSON.stringify(sanitizedSections),
      },
      create: {
        id: 'global',
        mainTitle: mainTitle.trim(),
        subtitle: subtitle.trim(),
        mainImage: mainImage || '/13_studio_table_ribbons.jpg',
        sections: JSON.stringify(sanitizedSections),
      },
    });

    let returnSections = sanitizedSections;
    try {
      returnSections = JSON.parse(updated.sections);
    } catch {}

    res.json({
      message: 'Our Story updated successfully!',
      story: {
        ...updated,
        sections: returnSections,
      },
    });
  } catch (error) {
    console.error('updateOurStory error:', error);
    res.status(500).json({ error: 'Failed to save Our Story content.' });
  }
}

module.exports = { getOurStory, updateOurStory };
